const https = require('https');

function fetchTM(pathUrl) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'www.transfermarkt.com',
      path: encodeURI(pathUrl),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    };
    https.get(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(body));
    });
  });
}

async function inspectStatsTable() {
  const html = await fetchTM('/erling-haaland/leistungsdaten/spieler/418560');

  console.log("Length of HTML:", html.length);
  // Match table headers and table rows
  const tables = [...html.matchAll(/<table[^>]*>([\s\S]*?)<\/table>/gi)];
  console.log(`Found ${tables.length} tables in performance page`);

  for (let i = 0; i < tables.length; i++) {
    console.log(`\n--- TABLE ${i + 1} ---`);
    const rows = [...tables[i][1].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
    rows.slice(0, 10).forEach((r, idx) => {
      const text = r[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      console.log(`Row ${idx+1}: ${text}`);
    });
  }
}

inspectStatsTable();
