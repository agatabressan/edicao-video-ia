// Login com a conta do YouTube OU do Drive (sao contas diferentes -- Contas de
// marca do YouTube nao tem acesso a servicos como o Drive).
// Uso: node auth.js youtube   -> salva credentials/token-youtube.json
//      node auth.js drive     -> salva credentials/token-drive.json
const fs = require('fs');
const path = require('path');
const http = require('http');
const { google } = require('googleapis');

const CREDENTIALS_PATH = path.join(__dirname, 'credentials', 'client_secret.json');
const PORT = 53682;
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;

const TARGETS = {
  youtube: {
    tokenFile: 'token-youtube.json',
    scopes: [
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/youtube.force-ssl',
    ],
    hint: 'Na tela de escolha de conta, selecione a CONTA DE MARCA do canal (ex: "Liga Monstros"), nao a conta normal.',
  },
  drive: {
    tokenFile: 'token-drive.json',
    scopes: ['https://www.googleapis.com/auth/drive'],
    hint: 'Na tela de escolha de conta, selecione a CONTA NORMAL (com e-mail, ex: "LMC"), nao a conta de marca -- contas de marca nao tem Drive.',
  },
};

const target = process.argv[2];
if (!TARGETS[target]) {
  console.error('Uso: node auth.js youtube | drive');
  process.exit(1);
}
const { tokenFile, scopes, hint } = TARGETS[target];
const TOKEN_PATH = path.join(__dirname, 'credentials', tokenFile);

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
  // select_account força a tela de escolha de conta/conta de marca; sem ele o
  // Google pode pular direto pra conta com e-mail (canal errado no YouTube).
  prompt: 'select_account consent',
  scope: scopes,
});

console.log(`--- Login para: ${target} ---`);
console.log(hint);
console.log('\nAbra este link, faca login e autorize:\n');
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
});

server.listen(PORT);
