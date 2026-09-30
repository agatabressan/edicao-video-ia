// Atualiza o TikTok da LMC na descricao de TODOS os videos do canal:
// - troca qualquer link de TikTok antigo (ex.: @ligamonstrocombate, @ligamonstro) pelo atual
// - onde nao tem TikTok, insere "TikTok: <url>" logo abaixo da linha do YouTube (ou do Instagram)
// Aplica tambem nas traducoes (localizations). So grava o que mudou; retomavel se a cota acabar.
// Uso: node tiktok-signature.js [--apply] [--test]
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const APPLY = process.argv.includes('--apply');
const CRED = path.join(__dirname, 'credentials');
const CHANNEL_ID = 'UClGFqfpNtUpUD1v51mw3VbQ';
const TIKTOK = 'https://www.tiktok.com/@ligamonstrocombateofc';

function addTiktok(desc) {
  if (!desc) return desc;
  if (/tiktok\.com\/@/i.test(desc)) {
    return desc.replace(/https?:\/\/(www\.)?tiktok\.com\/@[\w.]+/gi, TIKTOK);
  }
  const lines = desc.split('\n');
  // linha "YouTube: https://www.youtube.com/@ligamonstrocombate" (com ou sem emoji); senao, "Instagram: ..."
  let i = lines.findIndex((l) => /^\W*YouTube:\s*\S*youtube\.com\/@ligamonstrocombate/i.test(l.trim()));
  if (i === -1) i = lines.findIndex((l) => /^\W*Instagram:/i.test(l.trim()));
  if (i === -1) return null; // sem bloco de redes sociais -- nao mexe
  const prefix = lines[i].match(/^[^A-Za-z]*/)[0]; // mantem emoji/recuo da linha de referencia
  lines.splice(i + 1, 0, `${prefix}TikTok: ${TIKTOK}`);
  return lines.join('\n');
}

function test() {
  const cases = [
    'x\n🔗 SIGA O LMC NAS REDES SOCIAIS:\nInstagram: https://www.instagram.com/ligamonstrocombate\nYouTube: https://www.youtube.com/@ligamonstrocombate\n\n✅ ENTRE',
    'SIGA O LMC NAS REDES SOCIAIS:\nInstagram: https://www.instagram.com/ligamonstrocombate\nYouTube: https://www.youtube.com/@ligamonstrocombate\n',
    'Instagram: https://www.instagram.com/ligamonstrocombate\nTikTok: https://www.tiktok.com/@ligamonstrocombate\nYouTube: https://www.youtube.com/@ligamonstrocombate',
    'Acompanhe a LMC:\n📲 Instagram: @ligamonstrocombate\n#LigaMonstroCombate',
    'FOLLOW LMC ON SOCIAL MEDIA:\nInstagram: https://www.instagram.com/ligamonstrocombate\nYouTube: https://www.youtube.com/@ligamonstrocombate',
    'so texto, sem redes',
  ];
  for (const c of cases) console.log(`--- antes:\n${c}\n--- depois:\n${addTiktok(c)}\n`);
  const twice = addTiktok(addTiktok(cases[0]));
  console.log('idempotente:', twice === addTiktok(cases[0]));
}

function client() {
  const c = JSON.parse(fs.readFileSync(path.join(CRED, 'client_secret.json')));
  const { client_id, client_secret } = c.installed || c.web;
  const o = new google.auth.OAuth2(client_id, client_secret);
  o.setCredentials(JSON.parse(fs.readFileSync(path.join(CRED, 'token-youtube.json'))));
  return o;
}

async function main() {
  if (process.argv.includes('--test')) return test();
  const youtube = google.youtube({ version: 'v3', auth: client() });
  const ch = (await youtube.channels.list({ part: ['snippet', 'contentDetails'], mine: true })).data.items[0];
  if (ch.id !== CHANNEL_ID) throw new Error(`CANAL ERRADO: ${ch.snippet.title}`);
  console.log(`Canal OK: ${ch.snippet.title} | ${APPLY ? 'APLICANDO' : 'SIMULACAO (use --apply)'}`);

  const uploads = ch.contentDetails.relatedPlaylists.uploads;
  const ids = []; let pageToken;
  do {
    const r = await youtube.playlistItems.list({ part: ['contentDetails'], playlistId: uploads, maxResults: 50, pageToken });
    ids.push(...r.data.items.map((i) => i.contentDetails.videoId)); pageToken = r.data.nextPageToken;
  } while (pageToken);
  console.log(`${ids.length} vídeos no canal`);

  let updated = 0; let same = 0; const skipped = []; const failed = [];
  for (let i = 0; i < ids.length; i += 50) {
    const vs = (await youtube.videos.list({ part: ['snippet', 'localizations'], id: ids.slice(i, i + 50) })).data.items;
    for (const v of vs) {
      const s = v.snippet;
      const desc = addTiktok(s.description);
      if (desc === null) { skipped.push(`${v.id} ${s.title}`); continue; }
      const locs = {};
      let locChanged = false;
      for (const [lang, loc] of Object.entries(v.localizations || {})) {
        let d = addTiktok(loc.description);
        // YouTube recusa descricao > 5000 chars; nesse caso a traducao fica como esta
        if (d !== null && d.length > 5000) { console.log(`  ${v.id} ${lang}: passaria de 5000 chars, mantida`); d = null; }
        locs[lang] = { title: loc.title, description: d ?? loc.description };
        if (d !== null && d !== loc.description) locChanged = true;
      }
      if (desc === s.description && !locChanged) { same++; continue; }
      console.log(`[${v.id}] ${s.title}`);
      updated++;
      if (!APPLY) continue;
      const snippet = { title: s.title, description: desc, categoryId: s.categoryId };
      if (s.tags) snippet.tags = s.tags;
      if (s.defaultLanguage) snippet.defaultLanguage = s.defaultLanguage;
      if (s.defaultAudioLanguage) snippet.defaultAudioLanguage = s.defaultAudioLanguage;
      const parts = ['snippet'];
      const body = { id: v.id, snippet };
      if (Object.keys(locs).length) { parts.push('localizations'); body.localizations = locs; }
      try {
        await youtube.videos.update({ part: parts, requestBody: body });
      } catch (err) {
        if (err.errors?.[0]?.reason === 'quotaExceeded') throw err;
        failed.push(`${v.id} ${s.title}: ${err.message}`);
        updated--;
      }
    }
  }
  console.log(`\n${APPLY ? 'Atualizados' : 'A atualizar'}: ${updated} | já corretos: ${same} | sem bloco de redes (não mexi): ${skipped.length}`);
  skipped.forEach((l) => console.log(`  - ${l}`));
  if (failed.length) console.log(`\nFalharam (${failed.length}):`);
  failed.forEach((l) => console.log(`  ! ${l}`));
  console.log('Fim.');
}

main().catch((err) => { console.error('Erro:', err.errors?.[0]?.reason || '', err.message); process.exit(1); });
