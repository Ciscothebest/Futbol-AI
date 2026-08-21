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

function parseTMStatsTable(html) {
  // Transfermarkt performance tables have rows in <tbody>
  // Look for rows containing LaLiga
  const rows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
  const results = [];

  for (const r of rows) {
    const rowHtml = r[1];
    if (rowHtml.includes('LaLiga') || rowHtml.includes('Laliga') || rowHtml.includes('La Liga')) {
      // Extract text content of cells
      const cells = [...rowHtml.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(c => c[1].replace(/<[^>]+>/g, '').trim());
      if (cells.length >= 5) {
        results.push(cells);
      }
    }
  }
  return results;
}

async function testParse() {
  const playersToTest = ['Lamine Yamal', 'Jude Bellingham', 'Kylian Mbappé', 'Robert Lewandowski'];

  for (const pName of playersToTest) {
    const searchRes = await fetchTM(`/schnellsuche/ergebnis/schnellsuche?query=${pName}`);
    const matches = [...searchRes.body.matchAll(/href="([^"]*spieler\/[0-9]+)"/gi)];
    if (matches.length > 0) {
      const profilePath = matches[0][1];
      const tmPlayerIdMatch = profilePath.match(/spieler\/([0-9]+)/);
      const tmPlayerId = tmPlayerIdMatch ? tmPlayerIdMatch[1] : null;

      // Stats page for saison=2025 (or saison=2024 if 2025 has current data)
      const statsPath = profilePath.replace('/profil/', '/leistungsdaten/') + `/plus/1?saison=2025`;
      const statsRes = await fetchTM(statsPath);

      console.log(`\n=== Player: ${pName} (TM ID: ${tmPlayerId}) ===`);
      const parsedRows = parseTMStatsTable(statsRes.body);
      console.log('Parsed LaLiga rows from TM:', JSON.stringify(parsedRows, null, 2));

      // Also check general profile table
      const profileRes = await fetchTM(profilePath);
      const mainTableRows = [...profileRes.body.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
      console.log(`Profile main table rows count: ${mainTableRows.length}`);
    }
  }
}

testParse();
