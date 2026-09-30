// Sobe as lutas completas da LMC 3 (brutos no Drive) pro YouTube, uma por vez:
// baixa do Drive pra pasta temporaria -> envia pro YouTube -> apaga a copia local.
// Registra cada video publicado em lmc3_lutas_results.json e pula os ja enviados,
// entao pode ser rodado de novo depois que a cota diaria da API renovar.
// Uso: node lmc3-lutas-batch.js <pasta-temporaria> [--dry-run]
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const CRED = path.join(__dirname, 'credentials');
const LUTAS_PATH = path.join(__dirname, 'lmc3_lutas.json');
const RESULTS_PATH = path.join(__dirname, 'lmc3_lutas_results.json');
const CHANNEL_ID = 'UClGFqfpNtUpUD1v51mw3VbQ';

const [, , tmpDir, flag] = process.argv;
const dryRun = flag === '--dry-run';
if (!tmpDir) {
  console.error('Uso: node lmc3-lutas-batch.js <pasta-temporaria> [--dry-run]');
  process.exit(1);
}

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

const BASE_TAGS = ['Liga Monstro Combate', 'LMC', 'LMC 3', 'Liga Monstro', 'Luta Completa',
  'MMA', 'MMA Brasil', 'RedeTV', 'Cage', 'Artes Marciais', 'Esportes de Combate'];

function client(tokenFile) {
  const c = JSON.parse(fs.readFileSync(path.join(CRED, 'client_secret.json')));
  const { client_id, client_secret } = c.installed || c.web;
  const o = new google.auth.OAuth2(client_id, client_secret);
  o.setCredentials(JSON.parse(fs.readFileSync(path.join(CRED, tokenFile))));
  return o;
}

function buildMeta(l) {
  const vs = `${l.a} x ${l.b}`;
  const title = `${l.a.toUpperCase()} x ${l.b.toUpperCase()} | LUTA COMPLETA${l.mainEvent ? ' | MAIN EVENT' : ''} | LMC 3`;
  const description = `#LigaMonstroCombate #LMC #LMC3 #MMA

${vs} — luta ${l.n} da LMC 3${l.mainEvent ? ' (main event)' : ''}, na íntegra.

🏆 RESULTADO: ${l.resultado}

${SIGNATURE}`;
  const tags = [...new Set([...BASE_TAGS, ...l.tags])];
  if (title.length > 100) throw new Error(`Titulo > 100 chars: ${title}`);
  return { title, description, tags, categoryId: '17', privacyStatus: 'unlisted' };
}

async function download(drive, fileId, dest) {
  const res = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });
  await new Promise((resolve, reject) => {
    const out = fs.createWriteStream(dest);
    res.data.on('error', reject).pipe(out);
    out.on('finish', resolve).on('error', reject);
  });
}

async function main() {
  const lutas = JSON.parse(fs.readFileSync(LUTAS_PATH, 'utf8'));
  const results = fs.existsSync(RESULTS_PATH) ? JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8')) : {};

  if (dryRun) {
    for (const l of lutas) {
      const m = buildMeta(l);
      console.log(`\n[${l.n}] ${m.title} (${m.title.length})\n${m.description.split('\n-------')[0]}\nTAGS: ${m.tags.join(', ')}`);
    }
    return;
  }

  const yauth = client('token-youtube.json');
  const youtube = google.youtube({ version: 'v3', auth: yauth });
  const ch = (await youtube.channels.list({ part: ['snippet'], mine: true })).data.items[0];
  if (ch.id !== CHANNEL_ID) throw new Error(`CANAL ERRADO: ${ch.snippet.title}`);
  console.log('Canal OK:', ch.snippet.title);

  const drive = google.drive({ version: 'v3', auth: client('token-drive.json') });
  fs.mkdirSync(tmpDir, { recursive: true });

  for (const l of lutas) {
    if (results[l.n]) { console.log(`[${l.n}] ja enviado: ${results[l.n].url}`); continue; }
    const meta = buildMeta(l);
    const tmp = path.join(tmpDir, `luta${l.n}.mp4`);
    try {
      console.log(`\n[${l.n}] Baixando do Drive...`);
      await download(drive, l.driveId, tmp);
      const size = fs.statSync(tmp).size;
      console.log(`[${l.n}] ${(size / 1e9).toFixed(2)} GB. Enviando "${meta.title}"...`);
      let last = -1;
      const res = await youtube.videos.insert({
        part: ['snippet', 'status'],
        requestBody: {
          snippet: { title: meta.title, description: meta.description, tags: meta.tags, categoryId: meta.categoryId },
          status: { privacyStatus: meta.privacyStatus },
        },
        media: { body: fs.createReadStream(tmp) },
      }, {
        onUploadProgress: (e) => {
          const pct = Math.floor((e.bytesRead / size) * 100);
          if (pct !== last && pct % 10 === 0) { last = pct; console.log(`  ${pct}%`); }
        },
      });
      results[l.n] = { title: meta.title, id: res.data.id, url: `https://youtu.be/${res.data.id}` };
      fs.writeFileSync(RESULTS_PATH, JSON.stringify(results, null, 2));
      console.log(`[${l.n}] Publicado: ${results[l.n].url}`);
    } catch (err) {
      const reason = err.errors?.[0]?.reason || '';
      console.error(`[${l.n}] Falhou: ${reason} ${err.message}`);
      if (/quota|uploadLimit|rateLimit/i.test(reason + err.message)) {
        console.error('Limite do YouTube atingido -- rodar de novo depois que a cota renovar.');
        break;
      }
    } finally {
      if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
    }
  }
  console.log('\nResumo:', Object.keys(results).length, 'de', lutas.length, 'enviados.');
}

main().catch((err) => { console.error('Erro:', err.message || err); process.exit(1); });
