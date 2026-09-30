// Otimizacao de SEO da LMC 3 no YouTube: teasers + lutas completas + playlists.
// - idioma pt-BR (video e audio) em tudo, removendo a localizacao pt-PT
// - descricoes com contexto do confronto e links cruzados teaser <-> luta <-> playlist
// - tags especificas por luta (sem "Ringue"/"Octógono"), destaque pra Crown Fight
// - titulos com grafia uniforme entre teaser e luta
// - adiciona as lutas Crown Fight da LMC 3 na playlist dedicada
// Uso: node lmc3-seo.js [--apply]   (sem --apply so mostra o que faria)
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const APPLY = process.argv.includes('--apply');
const CRED = path.join(__dirname, 'credentials');
const CHANNEL_ID = 'UClGFqfpNtUpUD1v51mw3VbQ';
const PL_LMC3 = 'PLPCx8CFRZsYM';
const PL_CROWN = 'PLaCZL8btXg_U';
const PL_LMC3_URL = `https://www.youtube.com/playlist?list=${PL_LMC3}`;
const PL_CROWN_URL = `https://www.youtube.com/playlist?list=${PL_CROWN}`;
const DATA_EVENTO = '25/09/2026';
const SITE_LMC3 = 'https://www.ligamonstrocombate.com.br/eventos/lmc-3/';

const SIGNATURE = `-------
🔗 SIGA O LMC NAS REDES SOCIAIS:
Instagram: https://www.instagram.com/ligamonstrocombate
YouTube: https://www.youtube.com/@ligamonstrocombate
TikTok: https://www.tiktok.com/@ligamonstrocombateofc

✅ ENTRE PARA A COMUNIDADE OFICIAL (WHATSAPP):
Acompanhe os bastidores, receba promoções exclusivas e notícias em primeira mão!
👉 https://chat.whatsapp.com/Imp2AbdHdAb0rZNt3G8QbK

📧 CONTATO COMERCIAL:
contato@ligamonstrocombate.com.br

👽 LIGA MONSTRO COMBATE: A NOVA ERA DO MMA NO BRASIL!`;

const CROWN_TEXT = '👑 CROWN FIGHT: a modalidade exclusiva da Liga Monstro Combate. MMA profissional com Red Zones, em que só vale troca de golpes em pé, e o Blue Card, que dá aos corners o poder de estender a luta.';

const BASE_TAGS = ['Liga Monstro Combate', 'LMC', 'LMC 3', 'Liga Monstro', 'MMA', 'MMA Brasil',
  'RedeTV', 'Cage', 'Artes Marciais', 'Esportes de Combate'];
const CROWN_TAGS = ['Crown Fight', 'Crown Fight LMC', 'Crown Fight MMA', 'Red Zone', 'Modalidade Exclusiva'];

// Contexto sem spoiler (vai no teaser e na luta); resultado so na luta.
// Modalidade, categoria e destaques conforme https://www.ligamonstrocombate.com.br/eventos/lmc-3/
const CONTEXTO = {
  1: 'Boxe · peso casado 79 kg. A luta que abriu a noite da LMC 3.',
  2: 'Boxe · peso casado 85 kg, pelo card preliminar da LMC 3.',
  3: 'Boxe · peso casado 57 kg. Disputa do cinturão de boxe, fechando o card preliminar da LMC 3.',
  4: 'MMA · peso mosca. A luta que abriu o card principal da LMC 3.',
  5: 'MMA · peso casado 80 kg, pelo card principal da LMC 3.',
  6: 'MMA · peso médio, pelo card principal da LMC 3.',
  7: 'MMA · peso leve, pelo card principal da LMC 3.',
  8: 'MMA · peso meio-médio, pelo card principal da LMC 3.',
  9: 'Crown Fight · peso casado 68 kg. A estreia da Crown Fight na LMC 3.',
  10: 'Crown Fight · peso meio-médio. A segunda Crown Fight da LMC 3.',
  11: 'Crown Fight · peso leve. A primeira Crown Fight feminina da história!',
  12: 'MMA · peso mosca. Disputa do cinturão feminino do peso mosca na LMC 3.',
  13: 'Boxe · peso casado 88 kg. O co-main event da LMC 3.',
  14: 'MMA · peso leve, em 5 rounds. O main event da LMC 3, em duelo internacional.',
};
const CROWN = new Set([9, 10, 11]);
const BOXE = new Set([1, 2, 3, 13]);
const MOD = (n) => (CROWN.has(n) ? 'CROWN FIGHT' : BOXE.has(n) ? 'BOXE' : 'MMA');
// pre: antes de LUTA COMPLETA; post: depois (main/co-main)
const LABEL = { 3: { pre: 'DISPUTA DE CINTURÃO' }, 12: { pre: 'DISPUTA DE CINTURÃO' }, 13: { post: 'CO-MAIN EVENT' }, 14: { post: 'MAIN EVENT' } };

const TEASER = {
  1: 'AwaddmCjo5k', 2: 'zumWHQc5Y9E', 3: 'ZvVLjEqP9-E', 4: 'uhPZ5G_txY0', 5: 'g5TxqnnJatk',
  6: 'k1eBeg9rGnI', 7: 'YXPS4uy3-nk', 8: 'NoWzoLqqH20', 9: 'zYA2Z_1nloA', 10: 'o-xCMUn4LRk',
  11: 'TGOx39oC58U', 12: 'y9e9qlP33UA', 13: 'UoqS6f1iIo0', 14: 'sI7I5iMEiSc',
};

function client() {
  const c = JSON.parse(fs.readFileSync(path.join(CRED, 'client_secret.json')));
  const { client_id, client_secret } = c.installed || c.web;
  const o = new google.auth.OAuth2(client_id, client_secret);
  o.setCredentials(JSON.parse(fs.readFileSync(path.join(CRED, 'token-youtube.json'))));
  return o;
}

const up = (s) => s.toUpperCase();
const hashtags = (n) => ['#LigaMonstroCombate', '#LMC3', BOXE.has(n) ? '#Boxe' : '#MMA', ...(CROWN.has(n) ? ['#CrownFight'] : [])].join(' ');
const linkLines = (n, extra) => [extra, `📺 Todas as lutas da LMC 3: ${PL_LMC3_URL}`,
  ...(CROWN.has(n) ? [`👑 Todas as Crown Fights: ${PL_CROWN_URL}`] : []),
  `🗓️ Card completo e resultados: ${SITE_LMC3}`].join('\n');

function teaserMeta(l, fightId) {
  const vs = `${l.a} x ${l.b}`;
  const lb = LABEL[l.n] || {};
  const title = [`${up(l.a)} VS ${up(l.b)}`, CROWN.has(l.n) ? 'CROWN FIGHT' : null, lb.pre, lb.post, 'TEASER LMC 3'].filter(Boolean).join(' | ');
  const description = `${hashtags(l.n)}

Teaser oficial de ${vs}, luta ${l.n} da LMC 3 – Liga Monstro Combate, ao vivo na RedeTV em ${DATA_EVENTO}. ${CONTEXTO[l.n]}
${CROWN.has(l.n) ? `\n${CROWN_TEXT}\n` : ''}
${linkLines(l.n, `▶️ Assista à luta completa: https://youtu.be/${fightId}`)}

${SIGNATURE}`;
  const tags = [...new Set([...BASE_TAGS, ...(CROWN.has(l.n) ? CROWN_TAGS : []), ...(BOXE.has(l.n) ? ['Boxe'] : []), ...(LABEL[l.n]?.pre ? ['Cinturão', 'Disputa de Cinturão'] : []), ...(LABEL[l.n]?.post === 'CO-MAIN EVENT' ? ['Co-Main Event'] : []), 'Teaser', 'Teaser LMC 3', ...l.tags.filter((t) => !/Decisão|Nocaute|KO|TKO|Finalização|Mata-Leão/.test(t))])];
  return { title, description, tags };
}

function fightMeta(l, teaserId) {
  const vs = `${l.a} x ${l.b}`;
  const lb = LABEL[l.n] || {};
  const title = [`${up(l.a)} x ${up(l.b)}`, MOD(l.n), lb.pre, 'LUTA COMPLETA', lb.post, 'LMC 3'].filter(Boolean).join(' | ');
  const description = `${hashtags(l.n)}

${vs}, luta ${l.n} da LMC 3 – Liga Monstro Combate, na íntegra. Ao vivo na RedeTV em ${DATA_EVENTO}. ${CONTEXTO[l.n]}
${CROWN.has(l.n) ? `\n${CROWN_TEXT}\n` : ''}
🏆 RESULTADO: ${l.resultado}

${linkLines(l.n, `🎬 Veja o teaser: https://youtu.be/${teaserId}`)}

${SIGNATURE}`;
  const tags = [...new Set([...BASE_TAGS, ...(CROWN.has(l.n) ? CROWN_TAGS : []), ...(BOXE.has(l.n) ? ['Boxe'] : []), ...(LABEL[l.n]?.pre ? ['Cinturão', 'Disputa de Cinturão'] : []), ...(LABEL[l.n]?.post === 'CO-MAIN EVENT' ? ['Co-Main Event'] : []), 'Luta Completa', ...l.tags])];
  return { title, description, tags };
}

function playlistLmc3(lutas) {
  const label = (n) => [LABEL[n]?.pre, LABEL[n]?.post].filter(Boolean).map((s) => s.toLowerCase()).join(', ');
  const modName = (n) => (CROWN.has(n) ? '👑 Crown Fight' : BOXE.has(n) ? 'Boxe' : 'MMA');
  const card = lutas.map((l) => `${String(l.n).padStart(2, '0')}. ${l.a} x ${l.b} · ${modName(l.n)}${label(l.n) ? ` (${label(l.n)})` : ''}`).join('\n');
  return {
    title: 'LUTAS COMPLETAS LMC 3 | LIGA MONSTRO COMBATE',
    description: `Todas as lutas completas da LMC 3 – Liga Monstro Combate, ao vivo na RedeTV em ${DATA_EVENTO}: 14 confrontos de MMA, boxe e Crown Fight, cada um com o teaser oficial antes da luta.

🏆 DESTAQUES
• Main event: Alex "Cowboy" x Juan Pablo "El León"
• Co-main event (boxe): Rodrigo Cavalheiro x Wallace Lopes
• Cinturão do peso mosca: Thay "Avatar" x Maria Clara "Mulher Maravilha"
• Cinturão do boxe (peso casado 57 kg): Beatriz Pereira x Keila "Fortaleza"
• 👑 Crown Fight, a modalidade exclusiva da LMC: 3 lutas, incluindo a primeira Crown Fight feminina da história

📋 CARD COMPLETO
${card}

🗓️ Resultados: ${SITE_LMC3}
📺 LMC 1: https://www.youtube.com/playlist?list=PLQPM2GYvQ3jo
📺 LMC 2: https://www.youtube.com/playlist?list=PLRuM893YgaF0

#LigaMonstroCombate #LMC3 #MMA #CrownFight`,
  };
}

async function listItems(youtube, playlistId) {
  const items = []; let pageToken;
  do {
    const r = await youtube.playlistItems.list({ part: ['snippet'], playlistId, maxResults: 50, pageToken });
    items.push(...r.data.items); pageToken = r.data.nextPageToken;
  } while (pageToken);
  return items;
}

// Aplica snippet novo em pt-BR e remove pt-PT; pt-BR da localizacao espelha o snippet.
async function updateVideo(youtube, v, meta) {
  const s = v.snippet;
  const locs = { ...(v.localizations || {}) };
  delete locs['pt-PT'];
  locs['pt-BR'] = { title: meta.title, description: meta.description };
  const tagChars = meta.tags.reduce((n, t) => n + t.length + (t.includes(' ') ? 2 : 0) + 1, 0);
  if (tagChars > 500) throw new Error(`tags > 500 chars em ${v.id}`);
  if (meta.title.length > 100) throw new Error(`titulo > 100 chars: ${meta.title}`);
  console.log(`\n[${v.id}] ${s.title}\n  -> ${meta.title}\n  idioma ${s.defaultLanguage}/${s.defaultAudioLanguage} -> pt-BR/pt-BR | loc: ${Object.keys(locs).join(',')} | tags ${meta.tags.length} (${tagChars} chars)`);
  const same = s.title === meta.title && s.description === meta.description
    && JSON.stringify([...(s.tags || [])].sort()) === JSON.stringify([...meta.tags].sort()) && s.defaultLanguage === 'pt-BR' && s.defaultAudioLanguage === 'pt-BR';
  if (same) { console.log("  (sem mudança)"); return; }
  if (!APPLY) return;
  await youtube.videos.update({
    part: ['snippet', 'localizations'],
    requestBody: {
      id: v.id,
      snippet: { title: meta.title, description: meta.description, tags: meta.tags, categoryId: s.categoryId,
        defaultLanguage: 'pt-BR', defaultAudioLanguage: 'pt-BR' },
      localizations: locs,
    },
  });
}

async function updatePlaylist(youtube, id, meta) {
  const p = (await youtube.playlists.list({ part: ['snippet', 'localizations'], id: [id] })).data.items[0];
  const locs = { ...(p.localizations || {}) };
  delete locs['pt-PT'];
  locs['pt-BR'] = { title: meta.title, description: meta.description };
  console.log(`\n[PLAYLIST ${id}] ${p.snippet.title} -> ${meta.title}\n${meta.description}`);
  if (!APPLY) return;
  await youtube.playlists.update({
    part: ['snippet', 'localizations'],
    requestBody: { id, snippet: { title: meta.title, description: meta.description, defaultLanguage: 'pt-BR' }, localizations: locs },
  });
}

async function main() {
  const youtube = google.youtube({ version: 'v3', auth: client() });
  const ch = (await youtube.channels.list({ part: ['snippet'], mine: true })).data.items[0];
  if (ch.id !== CHANNEL_ID) throw new Error(`CANAL ERRADO: ${ch.snippet.title}`);
  console.log(`Canal OK: ${ch.snippet.title} | ${APPLY ? 'APLICANDO' : 'SIMULACAO (use --apply)'}`);

  const lutas = JSON.parse(fs.readFileSync(path.join(__dirname, 'lmc3_lutas.json'), 'utf8')).sort((a, b) => a.n - b.n);
  const results = JSON.parse(fs.readFileSync(path.join(__dirname, 'lmc3_lutas_results.json'), 'utf8'));
  const ids = lutas.flatMap((l) => [TEASER[l.n], results[l.n].id]);
  const videos = Object.fromEntries((await youtube.videos.list({ part: ['snippet', 'localizations'], id: ids })).data.items.map((v) => [v.id, v]));

  for (const l of lutas) {
    const fightId = results[l.n].id;
    await updateVideo(youtube, videos[TEASER[l.n]], teaserMeta(l, fightId));
    await updateVideo(youtube, videos[fightId], fightMeta(l, TEASER[l.n]));
  }

  await updatePlaylist(youtube, PL_LMC3, playlistLmc3(lutas));
  // descricao da playlist Crown Fight fica a cargo de lmc12-seo.js

  const inCrown = new Set((await listItems(youtube, PL_CROWN)).map((i) => i.snippet.resourceId.videoId));
  for (const l of lutas.filter((x) => CROWN.has(x.n))) {
    const videoId = results[l.n].id;
    if (inCrown.has(videoId)) { console.log(`\n[CROWN] ja na playlist: luta ${l.n}`); continue; }
    console.log(`\n[CROWN] adicionando luta ${l.n} (${videoId}) na playlist Crown Fight`);
    if (APPLY) {
      await youtube.playlistItems.insert({ part: ['snippet'], requestBody: { snippet: { playlistId: PL_CROWN, resourceId: { kind: 'youtube#video', videoId } } } });
    }
  }
  console.log('\nFim.');
}

main().catch((err) => { console.error('Erro:', err.errors?.[0]?.reason || '', err.message); process.exit(1); });
