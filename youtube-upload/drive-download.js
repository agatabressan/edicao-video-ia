// Baixa um arquivo do Google Drive usando o token salvo por auth.js (precisa do escopo drive).
// Uso: node drive-download.js <fileId> <destino>
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const CREDENTIALS_PATH = path.join(__dirname, 'credentials', 'client_secret.json');
const TOKEN_PATH = path.join(__dirname, 'credentials', 'token-drive.json');

const [, , fileId, destPath] = process.argv;

if (!fileId || !destPath) {
  console.error('Uso: node drive-download.js <fileId> <destino>');
  process.exit(1);
}

const { client_id, client_secret } = JSON.parse(fs.readFileSync(CREDENTIALS_PATH)).installed
  || JSON.parse(fs.readFileSync(CREDENTIALS_PATH)).web;
const oauth2Client = new google.auth.OAuth2(client_id, client_secret);
oauth2Client.setCredentials(JSON.parse(fs.readFileSync(TOKEN_PATH)));

const drive = google.drive({ version: 'v3', auth: oauth2Client });

async function main() {
  const meta = await drive.files.get({ fileId, fields: 'name, size' });
  const totalBytes = Number(meta.data.size || 0);
  console.log(`Baixando "${meta.data.name}" (${(totalBytes / 1e9).toFixed(2)} GB) para ${destPath}...`);

  const res = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'stream' }
  );

  let downloaded = 0;
  let lastPct = -1;
  const dest = fs.createWriteStream(destPath);

  await new Promise((resolve, reject) => {
    res.data
      .on('data', (chunk) => {
        downloaded += chunk.length;
        if (totalBytes) {
          const pct = Math.floor((downloaded / totalBytes) * 100);
          if (pct !== lastPct && pct % 5 === 0) {
            lastPct = pct;
            console.log(`  ${pct}% (${(downloaded / 1e9).toFixed(2)} GB)`);
          }
        }
      })
      .on('end', resolve)
      .on('error', reject)
      .pipe(dest);
    dest.on('error', reject);
  });

  console.log('Download concluido:', destPath);
}

main().catch((err) => {
  console.error('Falhou:', err.message || err);
  process.exit(1);
});
