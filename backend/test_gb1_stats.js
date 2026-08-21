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

async function testGB1Stats(name, tmId, profileSlug) {
  console.log(`\n=================================================`);
  console.log(`Testing GB1 Premier League stats for: ${name}`);

  // Fetch 2025/26 season GB1 stats
  const html2025 = await fetchTM(`/${profileSlug}/leistungsdatendetails/spieler/${tmId}/saison/2025/wettbewerb/GB1`);
  console.log(`2025 GB1 page length: ${html2025.length}`);

  // Extract season stats from table or info blocks
  const rows = [...html2025.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
  console.log(`Found ${rows.length} rows in GB1 page`);

  const footerRow = rows.find(r => r[1].includes('Total') || r[1].includes('tfoot') || r[1].includes('Overall') || r[1].includes('Sum'));

  for (const r of rows.slice(0, 15)) {
    const text = r[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (text.includes('Manchester City') || text.includes('Arsenal') || text.includes('Chelsea') || text.includes('25/26') || text.includes('24/25')) {
      console.log(`Row: ${text}`);
    }
  }
}

async function main() {
  await testGB1Stats('Erling Haaland', '418560', 'erling-haaland');
  await testGB1Stats('Bukayo Saka', '433177', 'bukayo-saka');
}

main();
