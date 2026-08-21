const https = require('https');

function fetchTM(pathUrl) {
  return new Promise((resolve) => {
    const cleanPath = encodeURI(pathUrl);
    const options = {
      hostname: 'www.transfermarkt.com',
      path: cleanPath,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    };
    https.get(options, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    }).on('error', (err) => resolve({ status: 500, error: err.message, body: '' }));
  });
}

async function run() {
  const r = await fetchTM('/schnellsuche/ergebnis/schnellsuche?query=Alejandro Balde');
  const matches = [...r.body.matchAll(/href="([^"]*spieler\/[0-9]+)"/gi)];
  console.log('BALDE MATCHES:', matches.map(m => m[1]));

  if (matches[0]) {
    const profilePath = matches[0][1];
    console.log('PROFILE PATH:', profilePath);

    const tmIdMatch = profilePath.match(/spieler\/([0-9]+)/);
    const tmId = tmIdMatch ? tmIdMatch[1] : null;

    let injPath = profilePath.replace('/profil/', '/verletzungen/');
    if (!injPath.includes('/verletzungen/')) {
      injPath = `/spieler/verletzungen/spieler/${tmId}`;
    }

    console.log('FINAL INJ PATH:', injPath);
    const injRes = await fetchTM(injPath);
    console.log('INJ STATUS:', injRes.status);
    const rows = [...injRes.body.matchAll(/<tr[^>]*class="[^"]*(?:odd|even)[^"]*"[^>]*>([\s\S]*?)<\/tr>/gi)];
    console.log('INJ ROWS COUNT:', rows.length);
    rows.slice(0, 5).forEach((row, i) => {
      const tds = [...row[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
      console.log(`ROW ${i}:`, JSON.stringify(tds));
    });
  }
}

run();
