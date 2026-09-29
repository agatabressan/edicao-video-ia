// Cria (ou completa) a playlist de melhores momentos/aftermovies das edicoes da LMC.
// Idempotente: reaproveita a playlist se ja existir e so insere o que falta.
// Uso: node aftermovies-playlist.js
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const CRED = path.join(__dirname, 'credentials');
const CHANNEL_ID = 'UClGFqfpNtUpUD1v51mw3VbQ';
const TITLE = 'MELHORES MOMENTOS | LMC 1, 2 E 3 | LIGA MONSTRO COMBATE';
const PLAYLIST_ID = 'PLZfXe41-P3S8';
const VIDEOS = [
  '8Mgn-eaHLkk', // LMC 1 (06/06/2026)
  'gNDIQzBVvso', // LMC 2
  '8VrFEEiM-Pw', // LMC 3
];
const DESCRIPTION = `Os melhores momentos de cada edição da Liga Monstro Combate (LMC), em ordem: LMC 1, LMC 2 e LMC 3. Nocautes, trocação no cage, Crown Fight e o clima das noites que estão construindo a nova era do MMA no Brasil.

📺 Lutas completas LMC 1: https://www.youtube.com/playlist?list=PLQPM2GYvQ3jo
📺 Lutas completas LMC 2: https://www.youtube.com/playlist?list=PLRuM893YgaF0
📺 Lutas completas LMC 3: https://www.youtube.com/playlist?list=PLPCx8CFRZsYM

#LigaMonstroCombate #LMC #MMA #Boxe #CrownFight`;

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
  console.log(`Canal OK: ${ch.snippet.title}`);

  const mine = (await youtube.playlists.list({ part: ['snippet'], mine: true, maxResults: 50 })).data.items;
  // ID fixo: playlist recem-criada demora a aparecer no playlists.list e geraria duplicata
  let pl = mine.find((p) => p.id === PLAYLIST_ID || p.snippet.title === TITLE) || { id: PLAYLIST_ID };
  if (!pl) {
    pl = (await youtube.playlists.insert({
      part: ['snippet', 'status'],
      requestBody: { snippet: { title: TITLE, description: DESCRIPTION, defaultLanguage: 'pt-BR' }, status: { privacyStatus: 'public' } },
    })).data;
    console.log(`Playlist criada: ${pl.id}`);
  } else console.log(`Playlist ja existe: ${pl.id}`);

  const have = new Set((await youtube.playlistItems.list({ part: ['snippet'], playlistId: pl.id, maxResults: 50 })).data.items
    .map((i) => i.snippet.resourceId.videoId));
  for (const [position, videoId] of VIDEOS.entries()) {
    if (have.has(videoId)) { console.log(`  ja na playlist: ${videoId}`); continue; }
    await youtube.playlistItems.insert({ part: ['snippet'], requestBody: { snippet: { playlistId: pl.id, position, resourceId: { kind: 'youtube#video', videoId } } } });
    console.log(`  adicionado: ${videoId}`);
  }
  console.log(`https://www.youtube.com/playlist?list=${pl.id}`);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
