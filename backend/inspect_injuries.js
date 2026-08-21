const https = require('https');

function fetchTM(pathUrl) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'www.transfermarkt.com',
      path: pathUrl,
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

async function inspectPlayerInjuries(name, path) {
  console.log(`\n=== INSPECTING: ${name} (${path}) ===`);
  const res = await fetchTM(path);
  const tableMatch = res.body.match(/<table[^>]*class="items"[^>]*>([\s\S]*?)<\/table>/i);
  if (!tableMatch) {
    console.log('No table found');
    return;
  }
  
  const headers = [...tableMatch[1].matchAll(/<th[^>]*>([\s\S]*?)<\/th>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
  console.log('HEADERS:', headers);

  const rows = [...tableMatch[1].matchAll(/<tr[^>]*class="[^"]*(?:odd|even)[^"]*"[^>]*>([\s\S]*?)<\/tr>/gi)];
  rows.slice(0, 5).forEach((r, idx) => {
    const tds = [...r[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
    console.log(`ROW ${idx}:`, JSON.stringify(tds));
  });
}

async function run() {
  await inspectPlayerInjuries('Gavi', '/gavi/verletzungen/spieler/646740');
  await inspectPlayerInjuries('Thibaut Courtois', '/thibaut-courtois/verletzungen/spieler/108390');
  await inspectPlayerInjuries('Alejandro Balde', '/alejandro-balde/verletzungen/spieler/636688');
}

run();
