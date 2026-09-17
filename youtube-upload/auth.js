// Login unico com a conta do YouTube. Rode: node auth.js
// Abre o navegador para voce autorizar e salva o token em credentials/token.json
const fs = require('fs');
const path = require('path');
const http = require('http');
const { google } = require('googleapis');

const CREDENTIALS_PATH = path.join(__dirname, 'credentials', 'client_secret.json');
const TOKEN_PATH = path.join(__dirname, 'credentials', 'token.json');
const PORT = 53682;
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;

if (!fs.existsSync(CREDENTIALS_PATH)) {
  console.error(`Nao encontrei ${CREDENTIALS_PATH}`);
  console.error('Baixe o client_secret.json do Google Cloud Console e coloque nesse caminho.');
  process.exit(1);
}

const { client_id, client_secret } = JSON.parse(fs.readFileSync(CREDENTIALS_PATH)).installed
  || JSON.parse(fs.readFileSync(CREDENTIALS_PATH)).web;

const oauth2Client = new google.auth.OAuth2(client_id, client_secret, REDIRECT_URI);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/youtube.force-ssl',
  ],
});

console.log('Abra este link, faca login e autorize:\n');
console.log(authUrl);
console.log('\nAguardando autorizacao...');

const server = http.createServer(async (req, res) => {
  if (!req.url.startsWith('/oauth2callback')) return;
  const code = new URL(req.url, REDIRECT_URI).searchParams.get('code');
  res.end('Autorizado! Pode fechar esta aba e voltar pro terminal.');
  server.close();

  const { tokens } = await oauth2Client.getToken(code);
  fs.mkdirSync(path.dirname(TOKEN_PATH), { recursive: true });
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
  console.log(`Token salvo em ${TOKEN_PATH}`);
  console.log('Pronto -- ja da pra usar upload.js.');
});

server.listen(PORT);
