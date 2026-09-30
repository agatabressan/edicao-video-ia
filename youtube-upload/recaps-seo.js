// SEO dos videos de melhores momentos (recap) de cada edicao da LMC.
// - descricao com contexto do evento, links pra playlist de recaps e de lutas completas, assinatura padrao
// - tags por edicao (sem "Ringue"/"Octógono"); titulo nao muda
// Uso: node recaps-seo.js [--apply]   (sem --apply so mostra o que faria)
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const APPLY = process.argv.includes('--apply');
const CRED = path.join(__dirname, 'credentials');
const CHANNEL_ID = 'UClGFqfpNtUpUD1v51mw3VbQ';
const pl = (id) => `https://www.youtube.com/playlist?list=${id}`;
const PL_RECAPS = pl('PLZfXe41-P3S8');
const PL = { 1: pl('PLQPM2GYvQ3jo'), 2: pl('PLRuM893YgaF0'), 3: pl('PLPCx8CFRZsYM') };
const SITE = {
  1: 'https://www.ligamonstrocombate.com.br/eventos/lmc-1-curitiba/',
  2: 'https://www.ligamonstrocombate.com.br/eventos/lmc-2/',
  3: 'https://www.ligamonstrocombate.com.br/eventos/lmc-3/',
};

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

const BASE_TAGS = ['Liga Monstro Combate', 'LMC', 'Liga Monstro', 'Melhores Momentos', 'Highlights', 'Aftermovie',
  'MMA', 'Boxe', 'MMA Brasil', 'Cage', 'Crown Fight', 'Nocaute', 'RedeTV', 'Esportes de Combate', 'Artes Marciais'];

const links = (ed) => [
  `🎬 Melhores momentos de todas as edições: ${PL_RECAPS}`,
  `📺 Lutas completas da LMC ${ed}: ${PL[ed]}`,
  `🗓️ Card e resultados: ${SITE[ed]}`,
].join('\n');

const RECAPS = {
  '8Mgn-eaHLkk': {
    ed: 1,
    tags: ['LMC 1', 'LMC Curitiba', 'Curitiba', 'Live Curitiba', 'Elizeu Capoeira', 'John Lineker', 'Jesse Taylor', 'He-Man Maromba', 'Pobre Loco'],
    description: `Melhores momentos da LMC 1, a edição de estreia da Liga Monstro Combate, em 06/06/2026, no Live Curitiba, em Curitiba (PR). Uma noite histórica de MMA profissional com ex-UFCs, boxe com influenciadores e a estreia da Crown Fight, com transmissão ao vivo na RedeTV que ficou em 3º lugar no Ibope.

🏆 DESTAQUES DA NOITE
• Main event: Elizeu Capoeira x Jesse Taylor
• Boxe, disputa de cinturão: John Lineker x Rogério "Garotão"
• 👑 A primeira Crown Fight da história: Maycon Alcino x Raul Soares
• Boxe com influenciadores: He-Man Maromba x Pobre Loco, Sthanley "O Maskara" x Sancho Loko

${links(1)}

🙏 Obrigado aos atletas, ao público que lotou o @livecuritibashows, à @redetv e @esportesredetv, e às equipes de produção @producoespamplona, @uniquefilmsof e @timeconnectmkt.

🤝 APOIADORES OFICIAIS: @reidasjaquetascwb @vipmealsoficial @cwb_destinos @nittour__oficial @hrccuritiba @uplayxl @agua.nobre @katsuofight @tribodasfrutasgastronomia

${SIGNATURE}

#LigaMonstroCombate #LMC1 #MMA #Boxe #CrownFight`,
  },
  gNDIQzBVvso: {
    ed: 2,
    tags: ['LMC 2', 'Marlon Moraes', 'Maximiliano Demonio', 'Glaico França', 'Willian Rottwailer', 'Ryan Tupã', 'Rayan Polacco', 'Sthanley O Maskara'],
    description: `Melhores momentos da LMC 2 – Liga Monstro Combate, realizada em 28/08/2026 nos estúdios da RedeTV!, em São Paulo (SP), ao vivo na TV aberta. Foram 12 confrontos de MMA profissional, boxe com criadores digitais e Crown Fight.

🏆 DESTAQUES DA NOITE
• Main event: "Magic" Marlon Moraes (ex-UFC) x Maximiliano "Demonio" Pérez
• Co-main event: Glaico França x Willian Lima "Rottwailer"
• 👑 Crown Fight: Ryan "Tupã" x Rayan "Polacco"
• Boxe: Sthanley "O Maskara" x Felipe Freitas

${links(2)}

${SIGNATURE}

#LigaMonstroCombate #LMC2 #MMA #Boxe #CrownFight`,
  },
  '8VrFEEiM-Pw': {
    ed: 3,
    tags: ['LMC 3', 'Alex Cowboy', 'Juan Pablo El León', 'Rodrigo Cavalheiro', 'Wallace Lopes', 'Thay Avatar', 'Beatriz Pereira', 'Crown Fight Feminina'],
    description: `Luta de verdade é na LMC! Melhores momentos da LMC 3 – Liga Monstro Combate, ao vivo na RedeTV em 25/09/2026: 14 confrontos de MMA, boxe e Crown Fight, com duas disputas de cinturão e a primeira Crown Fight feminina da história.

🏆 DESTAQUES DA NOITE
• Main event: Alex "Cowboy" x Juan Pablo "El León"
• Co-main event (boxe): Rodrigo Cavalheiro x Wallace Lopes
• Cinturão do peso mosca: Thay "Avatar" x Maria Clara "Mulher Maravilha"
• Cinturão do boxe (peso casado 57 kg): Beatriz Pereira x Keila "Fortaleza"
• 👑 3 Crown Fights, incluindo a primeira feminina

${links(3)}

${SIGNATURE}

#LigaMonstroCombate #LMC3 #MMA #Boxe #CrownFight`,
  },
};

function client() {
  const c = JSON.parse(fs.readFileSync(path.join(CRED, 'client_secret.json')));
  const { client_id, client_secret } = c.installed || c.web;
  const o = new google.auth.OAuth2(client_id, client_secret);
  o.setCredentials(JSON.parse(fs.readFileSync(path.join(CRED, 'token-youtube.json'))));
  return o;
}

async function main() {
  const youtube = google.youtube({ version: 'v3', auth: client() });
  const ch = (await youtube.channels.list({ part: ['snippet'], mine: true })).data.items[0];
  if (ch.id !== CHANNEL_ID) throw new Error(`CANAL ERRADO: ${ch.snippet.title}`);
  console.log(`Canal OK: ${ch.snippet.title} | ${APPLY ? 'APLICANDO' : 'SIMULACAO (use --apply)'}`);

  const videos = (await youtube.videos.list({ part: ['snippet', 'localizations'], id: Object.keys(RECAPS) })).data.items;
  for (const v of videos) {
    const r = RECAPS[v.id];
    const s = v.snippet;
    const tags = [...new Set([...BASE_TAGS, ...r.tags])];
    const tagChars = tags.reduce((n, t) => n + t.length + (t.includes(' ') ? 2 : 0) + 1, 0);
    if (tagChars > 500) throw new Error(`tags > 500 chars em ${v.id}`);
    if (r.description.length > 5000) throw new Error(`descricao > 5000 chars em ${v.id}`);
    console.log(`\n===== [${v.id}] ${s.title} | tags ${tags.length} (${tagChars} chars) | desc ${r.description.length} chars\n${r.description}`);
    const same = s.description === r.description
      && JSON.stringify([...(s.tags || [])].sort()) === JSON.stringify([...tags].sort());
    if (same) { console.log('  (sem mudança)'); continue; }
    if (!APPLY) continue;
    const locs = { ...(v.localizations || {}) };
    locs['pt-BR'] = { title: s.title, description: r.description };
    await youtube.videos.update({
      part: ['snippet', 'localizations'],
      requestBody: {
        id: v.id,
        snippet: { title: s.title, description: r.description, tags, categoryId: s.categoryId,
          defaultLanguage: 'pt-BR', defaultAudioLanguage: 'pt-BR' },
        localizations: locs,
      },
    });
    console.log('  atualizado');
  }
}

main().catch((e) => { console.error(e.message); process.exit(1); });
