// Sobe um arquivo pro Google Drive usando o token salvo por auth.js (precisa do escopo drive).
// Uso: node drive-upload.js <arquivo> <folderId>
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const CREDENTIALS_PATH = path.join(__dirname, 'credentials', 'client_secret.json');
const TOKEN_PATH = path.join(__dirname, 'credentials', 'token-drive.json');

const [, , filePath, folderId] = process.argv;

if (!filePath || !folderId) {
  console.error('Uso: node drive-upload.js <arquivo> <folderId>');
  process.exit(1);
}
if (!fs.existsSync(filePath)) {
  console.error(`Arquivo nao encontrado: ${filePath}`);
  process.exit(1);
}

const { client_id, client_secret } = JSON.parse(fs.readFileSync(CREDENTIALS_PATH)).installed
  || JSON.parse(fs.readFileSync(CREDENTIALS_PATH)).web;
const oauth2Client = new google.auth.OAuth2(client_id, client_secret);
oauth2Client.setCredentials(JSON.parse(fs.readFileSync(TOKEN_PATH)));

const drive = google.drive({ version: 'v3', auth: oauth2Client });

async function main() {
  const name = path.basename(filePath);
  console.log(`Enviando "${name}" para a pasta ${folderId}...`);
  const res = await drive.files.create({
    requestBody: { name, parents: [folderId] },
    media: { mimeType: 'video/mp4', body: fs.createReadStream(filePath) },
    fields: 'id, name, webViewLink',
  });
  console.log('Enviado:', res.data.name, '| id:', res.data.id);
  console.log('Link:', res.data.webViewLink);
}

main().catch((err) => {
  console.error('Falhou:', err.message || err);
  process.exit(1);
});
