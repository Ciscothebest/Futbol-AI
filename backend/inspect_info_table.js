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
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(body));
    });
  });
}

async function inspectInfoTable() {
  const html = await fetchTM('/erling-haaland/profil/spieler/418560');
  const tableMatch = html.match(/<div[^>]*class="[^\"]*info-table[^\"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i) ||
                     html.match(/<span[^>]*class="info-table__content[^"]*"[^>]*>[\s\S]*?<\/span>/gi);

  // Match all info-table rows/labels
  const items = [...html.matchAll(/<span[^>]*class="[^\"]*info-table__content[^\"]*info-table__content--bold[^\"]*"[^>]*>([\s\S]*?)<\/span>\s*<span[^>]*class="[^\"]*info-table__content[^\"]*"[^>]*>([\s\S]*?)<\/span>/gi)];

  console.log(`Found ${items.length} info table pairs:`);
  items.forEach(it => {
    const label = it[1].replace(/<[^>]+>/g, '').trim();
    const val = it[2].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');
    console.log(`  - "${label}" => "${val}"`);
  });
}

inspectInfoTable();
