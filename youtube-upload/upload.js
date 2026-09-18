// Sobe um video pro YouTube usando o token salvo por auth.js.
// Uso: node upload.js <arquivo.mp4> <metadata.json>
// metadata.json: { "title": "...", "description": "...", "tags": ["..."],
//                   "categoryId": "17", "privacyStatus": "private|unlisted|public" }
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const CREDENTIALS_PATH = path.join(__dirname, 'credentials', 'client_secret.json');
const TOKEN_PATH = path.join(__dirname, 'credentials', 'token-youtube.json');

const [, , filePath, metadataPath] = process.argv;

if (!filePath || !metadataPath) {
  console.error('Uso: node upload.js <arquivo.mp4> <metadata.json>');
  process.exit(1);
}
if (!fs.existsSync(TOKEN_PATH)) {
  console.error('Nenhum token encontrado. Rode "node auth.js" primeiro.');
  process.exit(1);
}
if (!fs.existsSync(filePath)) {
  console.error(`Arquivo nao encontrado: ${filePath}`);
  process.exit(1);
}
if (!fs.existsSync(metadataPath)) {
  console.error(`Metadata nao encontrado: ${metadataPath}`);
  process.exit(1);
}

const meta = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
const {
  title,
  description = '',
  tags = [],
  categoryId = '17',
  privacyStatus = 'unlisted',
} = meta;

if (!title) {
  console.error('metadata.json precisa de "title".');
  process.exit(1);
}

const { client_id, client_secret } = JSON.parse(fs.readFileSync(CREDENTIALS_PATH)).installed
  || JSON.parse(fs.readFileSync(CREDENTIALS_PATH)).web;
const oauth2Client = new google.auth.OAuth2(client_id, client_secret);
oauth2Client.setCredentials(JSON.parse(fs.readFileSync(TOKEN_PATH)));

const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

async function main() {
  console.log(`Enviando "${title}" (${privacyStatus})...`);
  const res = await youtube.videos.insert({
    part: ['snippet', 'status'],
    requestBody: {
      snippet: { title, description, tags, categoryId },
      status: { privacyStatus },
    },
    media: { body: fs.createReadStream(filePath) },
  });
  console.log('Publicado:', `https://youtu.be/${res.data.id}`);
}

main().catch((err) => {
  console.error('Falhou:', err.message || err);
  process.exit(1);
});
