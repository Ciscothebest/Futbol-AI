const https = require('https');

function fetchTM(pathUrl) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'www.transfermarkt.com',
      path: pathUrl,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    };
    https.get(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    }).on('error', (err) => resolve({ status: 500, error: err.message, body: '' }));
  });
}

async function run() {
  const queries = ['Alejandro Balde', 'Álex Balde', 'Balde'];
  for (const q of queries) {
    const searchPath = `/schnellsuche/ergebnis/schnellsuche?query=${encodeURIComponent(q)}`;
    const res = await fetchTM(searchPath);
    const matches = [...res.body.matchAll(/href="([^"]*spieler\/[0-9]+)"/gi)];
    console.log(`Query "${q}": ${matches.length} matches. First: ${matches[0] ? matches[0][1] : 'None'}`);
  }
}

run();
