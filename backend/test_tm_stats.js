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

async function testTMScrape() {
  console.log('Testing Transfermarkt search & stats fetch...');
  const searchRes = await fetchTM('/schnellsuche/ergebnis/schnellsuche?query=Lamine+Yamal');
  const matches = [...searchRes.body.matchAll(/href="([^"]*spieler\/[0-9]+)"/gi)];
  if (matches.length > 0) {
    const profilePath = matches[0][1];
    console.log('Profile Path:', profilePath);
    const tmPlayerIdMatch = profilePath.match(/spieler\/([0-9]+)/);
    const tmPlayerId = tmPlayerIdMatch ? tmPlayerIdMatch[1] : null;

    // Leistungsdaten (Performance data by competition)
    const statsPath = `/lamine-yamal/leistungsdaten/spieler/${tmPlayerId}/plus/1?saison=2025`;
    console.log('Fetching stats path:', statsPath);
    const statsRes = await fetchTM(statsPath);
    console.log('Stats Response Status:', statsRes.status);
    console.log('Sample HTML snippet:', statsRes.body.slice(0, 1500));

    // Match competition tables
    const compMatches = [...statsRes.body.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
    console.log(`Found ${compMatches.length} table rows in stats page.`);
  }
}

testTMScrape();
