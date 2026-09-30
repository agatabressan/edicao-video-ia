// Otimizacao de SEO das lutas completas da LMC 1 e LMC 2 no YouTube (dados do card: site oficial).
// - lutas: PRESERVA o texto ja escrito; so ajusta hashtags, grafia de nomes e insere bloco de links
//   (teaser, playlist da edicao, Crown Fight, pagina do evento) antes da assinatura
// - teasers da LMC 2: descricao nova (a atual e generica)
// - tags especificas por luta (sem "Ringue"/"Octógono"), titulos padronizados
// - titulo/descricao das playlists LMC 1, LMC 2 e Crown Fight
// Uso: node lmc12-seo.js [--apply] [--videos-only] [--show <videoId>]
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const APPLY = process.argv.includes('--apply');
const VIDEOS_ONLY = process.argv.includes('--videos-only');
const SHOW = process.argv.includes('--show') ? process.argv[process.argv.indexOf('--show') + 1] : null;
const CRED = path.join(__dirname, 'credentials');
const CHANNEL_ID = 'UClGFqfpNtUpUD1v51mw3VbQ';
const PL = { 1: 'PLQPM2GYvQ3jo', 2: 'PLRuM893YgaF0', 3: 'PLPCx8CFRZsYM', crown: 'PLaCZL8btXg_U' };
const plUrl = (id) => `https://www.youtube.com/playlist?list=${id}`;
const SITE = {
  1: 'https://www.ligamonstrocombate.com.br/eventos/lmc-1-curitiba/',
  2: 'https://www.ligamonstrocombate.com.br/eventos/lmc-2/',
  crown: 'https://www.ligamonstrocombate.com.br/crown-fight/',
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

// Regras conforme https://www.ligamonstrocombate.com.br/crown-fight/
const CROWN_TEXT = '👑 CROWN FIGHT: a modalidade exclusiva da Liga Monstro Combate. MMA profissional com Red Zones, em que só vale troca de golpes em pé, e o Blue Card, que dá aos corners o poder de estender a luta.';

// ed, a, b, mod (MMA|Boxe|Crown Fight), cat, extra (titulo), destaque, teaser, fight, tags extras
const LUTAS = [
  // ---- LMC 2 (28/08/2026, estúdios da RedeTV!, São Paulo) — ordem da playlist
  { ed: 2, a: 'Luciano de Paula', b: 'Pretin Gateau', mod: 'Boxe', cat: 'peso casado 75 kg', destaque: 'Card preliminar.', teaser: 'y6DPMzKj17s', fight: 'f9Nj0xYlqnU', tags: ['Boxe de Influenciadores'] },
  { ed: 2, a: 'Rony Jason', b: 'Evenilson Pinto', mod: 'Boxe', cat: 'peso casado 79 kg', destaque: 'Card preliminar.', teaser: '7p4H1w5pBw8', fight: 'bVqPPm2xMl0', tags: ['Boxe de Influenciadores'] },
  { ed: 2, a: 'Luis Gustavo', b: 'Felipe "Barata"', mod: 'MMA', cat: 'peso casado 78 kg', teaser: 'dL6OF0wNvpU', fight: 'qq8lBkAsFP8', tags: ['Luiz Gustavo'] },
  { ed: 2, a: 'Fernanda Alada', b: 'Nataly Ferreira', mod: 'MMA', cat: 'peso palha', teaser: 'TulcQVBXUfw', fight: '-XF86om5S0U', tags: ['MMA Feminino'] },
  { ed: 2, a: 'Erick "Sorriso"', b: 'Anderson "Louco" Soares', mod: 'MMA', cat: 'peso pena', teaser: 'YuZ6fpxLYpI', fight: 'xE7BGGHH22s', tags: [] },
  { ed: 2, a: 'Maycon Alcino', b: 'Caique "Dark" Araújo', mod: 'MMA', cat: 'peso pena', teaser: '5OYSIbfP0pk', fight: 'PIgbs4S229M', tags: ['Caíque Dark'] },
  { ed: 2, a: 'Nilza "Chun-Li"', b: 'Nathy Silva', mod: 'MMA', cat: 'peso galo', teaser: '3zWRLPo1m2w', fight: 'a-MU12vLXvE', tags: ['MMA Feminino', 'Nilza Chun Li'] },
  { ed: 2, a: 'Kauã Mattoso', b: 'Junior "Barata"', mod: 'MMA', cat: 'peso pena', teaser: 'R_oOcwtSqqw', fight: 'Nb-hxfp9E7Y', tags: ['Júnior Barata'] },
  { ed: 2, a: 'Sthanley "O Maskara"', b: 'Felipe Freitas', mod: 'Boxe', cat: 'peso casado 100 kg', teaser: 'DJeatIZk_4s', fight: '6bz-eAyPQjE', tags: ['Sthanley', 'O Maskara', 'Boxe de Influenciadores'] },
  { ed: 2, a: 'Ryan "Tupã"', b: 'Rayan "Polacco"', mod: 'Crown Fight', cat: 'peso leve', teaser: 'VFP9hlXqNQQ', fight: 'n8_Ng-9hG0E', tags: ['Ryan Tupa', 'Rayan Abreu'] },
  { ed: 2, a: 'Glaico França', b: 'Willian Lima "Rottwailer"', mod: 'MMA', cat: 'peso meio-médio', extra: 'CO-MAIN EVENT', destaque: 'Co-main event da LMC 2.', teaser: 'dAaxBmoOL6Y', fight: 'refhgW22iRU', tags: ['Co-Main Event', 'Glaico Franca', 'Rottwailer'] },
  { ed: 2, a: '"Magic" Marlon Moraes', b: 'Maximiliano "Demonio" Pérez', mod: 'MMA', cat: 'peso casado 63 kg', extra: 'MAIN EVENT', destaque: 'Main event da LMC 2, com o ex-UFC Marlon Moraes em duelo internacional contra o argentino Maximiliano "Demonio".', teaser: 'HymkheCh3Qw', fight: 'oTMfpSeJ6as', tags: ['Main Event', 'Marlon Moraes', 'Magic Marlon', 'Maximiliano Demonio', 'Ex-UFC', 'UFC'] },
  // ---- LMC 1 (06/06/2026, Live Curitiba) — sem teaser
  { ed: 1, a: 'Soldado Gerson', b: 'Cláudio Andrade', mod: 'Boxe', fight: 'DeHwe3Q7Ux8', tags: ['Claudio Andrade', 'Boxe de Influenciadores'] },
  { ed: 1, a: 'Nath Macedo', b: 'Beatriz Pereira', mod: 'Boxe', fight: 'CbR5OXX0xtU', tags: ['Boxe de Influenciadores', 'Boxe Feminino'] },
  { ed: 1, a: 'Sancho Loko', b: 'Sthanley "O Maskara"', mod: 'Boxe', fight: 'vS4v2IbHfv8', tags: ['Sthanley', 'O Maskara', 'Boxe de Influenciadores'] },
  { ed: 1, a: 'Leão Henckes', b: 'Anunaki', mod: 'Boxe', fight: 'M8tgrR6uKlM', tags: ['Leao Henckes', 'Boxe de Influenciadores'] },
  { ed: 1, a: 'He-Man Maromba', b: 'Pobre Loco', mod: 'Boxe', extra: 'VALENDO CINTURÃO', fight: 'PydjnqOxmqM', tags: ['HeMan Maromba', 'Boxe de Influenciadores', 'Cinturão'] },
  { ed: 1, a: 'Hollywood', b: 'Salim Chiboub', mod: 'Boxe', fight: '9uu73g4ecX4', tags: ['Boxe de Influenciadores'] },
  { ed: 1, a: 'Ryan Tupã', b: 'Ayslan Malerba', mod: 'MMA', fight: 'S6z-EFX-488', tags: ['Ryan Tupa'] },
  { ed: 1, a: 'Pabllo Sapateiro', b: 'Vitor Jon Jones', mod: 'MMA', fight: 'pvtWd5y-Io4', tags: [] },
  { ed: 1, a: 'Thay Avatar', b: 'Erika Alcântara', mod: 'MMA', fight: 'ha1Gevf_LjE', tags: ['Erika Alcantara', 'MMA Feminino'] },
  { ed: 1, a: 'Junior Albini', b: 'Lucas Camacho', mod: 'MMA', fight: 'nghmqEiWVcs', tags: ['Ex-UFC', 'UFC'] },
  { ed: 1, a: 'João Zeferino', b: 'Raffael Cerqueira', mod: 'MMA', fight: 'AHFQuoostIs', tags: ['Joao Zeferino', 'Ex-UFC', 'UFC'] },
  { ed: 1, a: 'Maycon Alcino', b: 'Raul Soares', mod: 'Crown Fight', extra: 'A PRIMEIRA DA HISTÓRIA', fight: 'dbfKQjH_sBg', tags: ['Estreia Crown Fight'] },
  { ed: 1, a: 'John Lineker', b: 'Rogério "Garotão"', mod: 'Boxe', pre: 'DISPUTA DE CINTURÃO', fight: 'DqwjCtunDBU', tags: ['Rogerio Garotao', 'Co-Main Event', 'Cinturão', 'Ex-UFC', 'UFC'] },
  { ed: 1, a: 'Elizeu Capoeira', b: 'Jesse Taylor', mod: 'MMA', extra: 'MAIN EVENT', fight: 'od4K0UwYBoo', tags: ['Elizeu Zaleski', 'Main Event', 'Cinturão', 'Ex-UFC', 'UFC'] },
];

const ED = {
  1: { data: '06/06/2026', local: 'no Live Curitiba, em Curitiba (PR)', hashtag: '#LMC1' },
  2: { data: '28/08/2026', local: 'nos estúdios da RedeTV!, em São Paulo (SP)', hashtag: '#LMC2' },
};

const up = (s) => s.toUpperCase();
const crown = (l) => l.mod === 'Crown Fight';
const modTitle = (l) => up(l.mod);
const plain = (s) => s.replace(/"/g, '');

function tagsFor(l, kind) {
  const base = ['Liga Monstro Combate', 'LMC', `LMC ${l.ed}`, 'Liga Monstro', kind, 'Cage', 'Esportes de Combate', 'MMA Brasil', 'RedeTV'];
  const mod = crown(l) ? ['Crown Fight', 'Crown Fight LMC', 'MMA', 'Red Zone'] : [l.mod];
  const cat = l.cat ? [l.cat.replace(/^\w/, (c) => c.toUpperCase())] : [];
  const tags = [...new Set([...base, ...mod, ...cat, plain(l.a), plain(l.b), ...l.tags])];
  const chars = tags.reduce((n, t) => n + t.length + (t.includes(' ') ? 2 : 0) + 1, 0);
  if (chars > 500) throw new Error(`tags > 500 chars: ${l.a}`);
  return tags;
}

function linkBlock(l, own) {
  return [
    own,
    `📺 Todas as lutas da LMC ${l.ed}: ${plUrl(PL[l.ed])}`,
    crown(l) ? `👑 Todas as Crown Fights: ${plUrl(PL.crown)}` : null,
    `🗓️ Card completo e resultados: ${SITE[l.ed]}`,
  ].filter(Boolean).join('\n');
}

function fightTitle(l) {
  const parts = [`${up(l.a)} x ${up(l.b)}`, modTitle(l)];
  if (l.pre) parts.push(l.pre);
  if (l.extra && !/MAIN EVENT/.test(l.extra)) parts.push(l.extra);
  parts.push('LUTA COMPLETA');
  if (l.extra && /MAIN EVENT/.test(l.extra)) parts.push(l.extra);
  parts.push(`LMC ${l.ed}`);
  const t = parts.join(' | ');
  if (t.length > 100) throw new Error(`titulo > 100: ${t}`);
  return t;
}

function teaserTitle(l) {
  const parts = [`${up(l.a)} VS ${up(l.b)}`];
  if (crown(l)) parts.push('CROWN FIGHT');
  if (l.extra) parts.push(l.extra);
  parts.push(`TEASER LMC ${l.ed}`);
  return parts.join(' | ');
}

function teaserDescription(l) {
  const ed = ED[l.ed];
  const tags = ['#LigaMonstroCombate', ed.hashtag, l.mod === 'Boxe' ? '#Boxe' : '#MMA', crown(l) ? '#CrownFight' : null].filter(Boolean).join(' ');
  return `${tags}

Teaser oficial de ${l.a} x ${l.b}, pela LMC ${l.ed} – Liga Monstro Combate, ao vivo na RedeTV! em ${ed.data}. ${l.mod} · ${l.cat}.${l.destaque ? ` ${l.destaque}` : ''}
${crown(l) ? `\n${CROWN_TEXT}\n` : ''}
${linkBlock(l, `▶️ Assista à luta completa: https://youtu.be/${l.fight}`)}

${SIGNATURE}`;
}

// Mantem o texto escrito pela equipe; so corrige grafia, completa hashtags e insere os links.
function fightDescription(l, current) {
  let d = current
    .replace(/O MÁSCARA/g, 'O MASKARA').replace(/O Máscara/g, 'O Maskara').replace(/o Máscara/g, 'o Maskara')
    .replace(/Salim Shibob/g, 'Salim Chiboub')
    .replace(/\bringue\b/g, 'cage').replace(/\bRingue\b/g, 'Cage').replace(/\bRINGUE\b/g, 'CAGE');
  const lines = d.split('\n');
  const need = ['#LigaMonstroCombate', ED[l.ed].hashtag, crown(l) ? '#CrownFight' : null].filter(Boolean);
  if (lines[0].trim().startsWith('#')) {
    const have = lines[0].toLowerCase();
    const add = need.filter((h) => !have.includes(h.toLowerCase()));
    if (add.length) lines[0] = `${lines[0].trim()} ${add.join(' ')}`;
  } else {
    lines.unshift(need.join(' '), '');
  }
  d = lines.join('\n');
  if (d.includes(plUrl(PL[l.ed]))) return d; // ja otimizada
  const block = linkBlock(l, l.teaser ? `🎬 Veja o teaser: https://youtu.be/${l.teaser}` : null);
  const crownPara = crown(l) && !/Red Zones, em que/.test(d) ? `${CROWN_TEXT}\n\n` : '';
  // rodape = o que vier primeiro: "Acompanhe a LMC", separador "---" ou "SIGA O LMC"
  const found = [/^Acompanhe a LMC/m, /^-{3,}\s*$/m, /^.*SIGA O LMC/m].map((re) => d.search(re)).filter((i) => i > 0);
  const sig = found.length ? Math.min(...found) : -1;
  if (sig === -1) return `${d.trimEnd()}\n\n${crownPara}${block}\n\n${SIGNATURE}`;
  return `${d.slice(0, sig).trimEnd()}\n\n${crownPara}${block}\n\n${d.slice(sig)}`;
}

function playlistLmc2() {
  const card = LUTAS.filter((l) => l.ed === 2).map((l, i) => `${String(i + 1).padStart(2, '0')}. ${l.a} x ${l.b} · ${l.mod}${l.extra ? ` (${l.extra.toLowerCase()})` : ''}`).join('\n');
  return {
    title: 'LUTAS COMPLETAS LMC 2 | LIGA MONSTRO COMBATE',
    description: `Todas as lutas completas da LMC 2 – Liga Monstro Combate, realizada em ${ED[2].data} ${ED[2].local}, ao vivo na TV aberta: 12 confrontos de MMA profissional, boxe com criadores digitais e Crown Fight, cada um com o teaser oficial antes da luta.

🏆 DESTAQUES
• Main event: "Magic" Marlon Moraes (ex-UFC) x Maximiliano "Demonio" Pérez
• Co-main event: Glaico França x Willian Lima "Rottwailer"
• 👑 Crown Fight: Ryan "Tupã" x Rayan "Polacco"
• Boxe: Sthanley "O Maskara" x Felipe Freitas

📋 CARD (ordem da noite)
${card}

🗓️ Resultados e fichas dos atletas: ${SITE[2]}
📺 LMC 1: ${plUrl(PL[1])}
📺 LMC 3: ${plUrl(PL[3])}

#LigaMonstroCombate #LMC2 #MMA #CrownFight`,
  };
}

function playlistLmc1() {
  const card = LUTAS.filter((l) => l.ed === 1).map((l, i) => `${String(i + 1).padStart(2, '0')}. ${l.a} x ${l.b} · ${l.mod}${l.extra ? ` (${l.extra.toLowerCase()})` : ''}`).join('\n');
  return {
    title: 'LUTAS COMPLETAS LMC 1 | LIGA MONSTRO COMBATE',
    description: `Todas as lutas completas da LMC 1, a edição de estreia da Liga Monstro Combate, realizada em ${ED[1].data} ${ED[1].local}: MMA profissional com ex-UFCs, boxe com influenciadores e a estreia da Crown Fight.

🏆 DESTAQUES
• Main event: Elizeu Capoeira x Jesse Taylor
• Co-main event (boxe, disputa de cinturão): John Lineker x Rogério "Garotão"
• 👑 A primeira Crown Fight da história: Maycon Alcino x Raul Soares
• Ex-UFCs no cage: Elizeu Capoeira, John Lineker, Jesse Taylor, Junior Albini e João Zeferino
• Boxe com influenciadores: Pobre Loco, He-Man Maromba, Sthanley "O Maskara", Sancho Loko e Leão Henckes

📋 CARD (ordem da noite)
${card}

🗓️ Resultados: ${SITE[1]}
📺 LMC 2: ${plUrl(PL[2])}
📺 LMC 3: ${plUrl(PL[3])}

#LigaMonstroCombate #LMC1 #MMA #Boxe #CrownFight`,
  };
}

const PLAYLIST_CROWN = {
  title: 'CROWN FIGHT LUTAS COMPLETAS | LMC',
  description: `${CROWN_TEXT}

Criada pela LMC pra acabar com o combate parado, a Crown Fight mantém 3 rounds de 5 minutos do MMA, mas com uma Red Zone obrigatória a partir do minuto 3 de cada round (20s, 40s e 1 min): nesse tempo é proibido lutar no chão, no clinch ou na grade. E cada corner tem um Blue Card de uso único pra estender a luta em 30 segundos.

A primeira Crown Fight da história foi na LMC 1, em 06/06/2026, em Curitiba: Maycon Alcino x Raul Soares. Aqui estão todas elas na íntegra, incluindo a primeira Crown Fight feminina.

Saiba mais: ${SITE.crown}

#CrownFight #LigaMonstroCombate #LMC #MMA`,
};

function client() {
  const c = JSON.parse(fs.readFileSync(path.join(CRED, 'client_secret.json')));
  const { client_id, client_secret } = c.installed || c.web;
  const o = new google.auth.OAuth2(client_id, client_secret);
  o.setCredentials(JSON.parse(fs.readFileSync(path.join(CRED, 'token-youtube.json'))));
  return o;
}

async function updateVideo(youtube, v, meta) {
  const s = v.snippet;
  const locs = { ...(v.localizations || {}) };
  delete locs['pt-PT'];
  locs['pt-BR'] = { title: meta.title, description: meta.description };
  const changed = s.title !== meta.title || s.description !== meta.description || JSON.stringify([...(s.tags || [])].sort()) !== JSON.stringify([...meta.tags].sort());
  console.log(`\n[${v.id}] ${s.title}\n  -> ${meta.title}${changed ? '' : '  (sem mudança)'} | tags ${(s.tags || []).length} -> ${meta.tags.length}`);
  if (SHOW === v.id) console.log(`----- DESCRIÇÃO NOVA -----\n${meta.description}\n----- TAGS -----\n${meta.tags.join(', ')}\n--------------------------`);
  if (!APPLY || !changed) return;
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
  console.log(`\n[PLAYLIST ${id}] ${p.snippet.title} -> ${meta.title}`);
  if (p.snippet.title === meta.title && p.snippet.description === meta.description) { console.log('  (sem mudança)'); return; }
  if (SHOW === id) console.log(meta.description);
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

  const ids = LUTAS.flatMap((l) => [l.teaser, l.fight]).filter(Boolean);
  const videos = {};
  for (let i = 0; i < ids.length; i += 50) {
    const r = await youtube.videos.list({ part: ['snippet', 'localizations'], id: ids.slice(i, i + 50) });
    for (const v of r.data.items) videos[v.id] = v;
  }
  const missing = ids.filter((id) => !videos[id]);
  if (missing.length) throw new Error(`videos nao encontrados: ${missing.join(', ')}`);

  for (const l of LUTAS) {
    if (l.teaser) await updateVideo(youtube, videos[l.teaser], { title: teaserTitle(l), description: teaserDescription(l), tags: tagsFor(l, 'Teaser') });
    const f = videos[l.fight];
    await updateVideo(youtube, f, { title: fightTitle(l), description: fightDescription(l, f.snippet.description), tags: tagsFor(l, 'Luta Completa') });
  }
  if (!VIDEOS_ONLY) {
    await updatePlaylist(youtube, PL[2], playlistLmc2());
    await updatePlaylist(youtube, PL[1], playlistLmc1());
    await updatePlaylist(youtube, PL.crown, PLAYLIST_CROWN);
  }
  console.log('\nFim.');
}

main().catch((err) => { console.error('Erro:', err.errors?.[0]?.reason || '', err.message); process.exit(1); });
