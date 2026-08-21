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
    const req = https.get(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', (err) => resolve({ status: 500, error: err.message, body: '' }));
    req.setTimeout(8000, () => {
      req.destroy();
      resolve({ status: 408, error: 'Timeout', body: '' });
    });
  });
}

async function inspectYellowCardsHeader() {
  // Lamine Yamal ID: 937958, Vinicius Jr ID: 371998, Jude Bellingham ID: 581678
  const statsRes = await fetchTM('/vinicius-junior/leistungsdaten/spieler/371998/plus/1?saison=2025');
  const html = statsRes.body;

  // Print table header row
  const theadMatch = html.match(/<thead>([\s\S]*?)<\/thead>/i);
  if (theadMatch) {
    console.log('--- Table Header HTML ---');
    console.log(theadMatch[1]);
  }

  // Print LaLiga row cells with indices
  const rows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
  for (const r of rows) {
    if (r[1].includes('LaLiga')) {
      console.log('\n--- LaLiga Row Raw Cells ---');
      const cells = [...r[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((c, i) => `[Index ${i}]: ${c[1].replace(/<[^>]+>/g, '').trim()}`);
      console.log(cells.join('\n'));
    }
  }
}

inspectYellowCardsHeader();
