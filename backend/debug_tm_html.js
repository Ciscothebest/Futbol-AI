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
  });
}

async function debugHTML() {
  const res = await fetchTM('/erling-haaland/leistungsdaten/spieler/418560/plus/1?saison=2025');
  console.log(`Status: ${res.status}, Length: ${res.body.length}`);

  // Search for table elements
  const tableMatch = res.body.match(/<table[^>]*class="[^\"]*items[^\"]*"[^>]*>([\s\S]*?)<\/table>/i);
  if (tableMatch) {
    console.log("Found table.items!");
    const rows = [...tableMatch[1].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
    rows.forEach((r, i) => {
      const txt = r[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      console.log(`Row ${i+1}: ${txt}`);
    });
  } else {
    console.log("table.items not found! Searching all <tbody> elements...");
    const tbodies = [...res.body.matchAll(/<tbody[^>]*>([\s\S]*?)<\/tbody>/gi)];
    tbodies.forEach((tb, i) => {
      console.log(`Tbody ${i+1}:`);
      const rows = [...tb[1].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
      rows.forEach((r, j) => {
        const txt = r[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        console.log(`  Row ${j+1}: ${txt}`);
      });
    });
  }
}

debugHTML();
