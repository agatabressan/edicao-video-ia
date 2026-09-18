// Verificacao obrigatoria antes de qualquer upload/update no YouTube.
// Uso: node check-channel.js youtube   -> deve mostrar "LMC | Liga Monstro Combate"
//      node check-channel.js drive     -> deve mostrar a conta contato@ligamonstrocombate.com.br
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const CREDENTIALS_PATH = path.join(__dirname, 'credentials', 'client_secret.json');

const target = process.argv[2];
if (!['youtube', 'drive'].includes(target)) {
  console.error('Uso: node check-channel.js youtube | drive');
  process.exit(1);
}
const TOKEN_PATH = path.join(__dirname, 'credentials', `token-${target}.json`);

if (!fs.existsSync(TOKEN_PATH)) {
  console.error(`Token nao encontrado: ${TOKEN_PATH}`);
  console.error(`Rode: node auth.js ${target}`);
  process.exit(1);
}

const { client_id, client_secret } = JSON.parse(fs.readFileSync(CREDENTIALS_PATH)).installed
  || JSON.parse(fs.readFileSync(CREDENTIALS_PATH)).web;
const oauth2Client = new google.auth.OAuth2(client_id, client_secret);
oauth2Client.setCredentials(JSON.parse(fs.readFileSync(TOKEN_PATH)));

async function main() {
  if (target === 'youtube') {
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    const res = await youtube.channels.list({ part: ['snippet'], mine: true });
    const ch = res.data.items[0];
    console.log('Canal:', ch.snippet.title, '| ID:', ch.id);
    if (ch.id !== 'UClGFqfpNtUpUD1v51mw3VbQ') {
      console.error('\n!!! CANAL ERRADO !!! Esperado "LMC | Liga Monstro Combate".');
      console.error('Rode "node auth.js youtube" e selecione a Conta de marca "Liga Monstros".');
      process.exit(1);
    }
    console.log('OK -- canal correto.');
  } else {
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const res = await drive.about.get({ fields: 'user' });
    console.log('Conta Drive:', res.data.user.emailAddress, '|', res.data.user.displayName);
  }
}

main().catch((err) => {
  console.error('Erro:', err.message || err);
  process.exit(1);
});
