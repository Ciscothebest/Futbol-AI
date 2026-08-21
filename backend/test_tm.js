const https = require('https');

function fetchTM(path) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'www.transfermarkt.com',
      path: path,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
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
  console.log('Testing Injury history fetching for Gavi...');
  const res = await fetchTM('/gavi/verletzungen/spieler/646740');
  console.log('HTTP Status:', res.status);
  
  const rows = [...res.body.matchAll(/<tr[^>]*class="[^"]*(?:odd|even)[^"]*"[^>]*>([\s\S]*?)<\/tr>/gi)];
  console.log('Total Injury Rows Found:', rows.length);
  
  const injuries = [];
  for (const r of rows) {
    const cells = [...r[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(c => c[1].replace(/<[^>]+>/g, '').trim());
    if (cells.length >= 5) {
      injuries.push({
        season: cells[0],
        injury: cells[1],
        fromDate: cells[2],
        untilDate: cells[3],
        days: cells[4],
        gamesMissed: cells[5] || '0'
      });
    }
  }
  
  console.log('\nParsed Injuries Sample:', JSON.stringify(injuries.slice(0, 5), null, 2));
}

run();
