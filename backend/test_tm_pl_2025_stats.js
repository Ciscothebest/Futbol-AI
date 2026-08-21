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

async function testPLSeasonStats(name, tmId, profileSlug) {
  console.log(`\n=================================================`);
  console.log(`Fetching 2025/2026 Premier League stats for: ${name}`);

  // Fetch season 2025 performance data
  const html = await fetchTM(`/${profileSlug}/leistungsdaten/spieler/${tmId}/plus/1?saison=2025`);

  // Find Premier League table row in performance table
  const rows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
  let plFound = false;

  for (const r of rows) {
    if (r[1].includes('Premier League')) {
      plFound = true;
      const cells = [...r[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(c => c[1].replace(/<[^>]+>/g, '').trim());
      console.log(`✅ Premier League 2025/26 Row Found:`);
      console.log(`   Raw cells:`, cells);
      break;
    }
  }

  if (!plFound) {
    console.log(`⚠️ Premier League 2025/26 row not found directly in 2025 table, inspecting overall rows...`);
  }
}

async function main() {
  await testPLSeasonStats('Erling Haaland', '418560', 'erling-haaland');
  await testPLSeasonStats('Bukayo Saka', '433177', 'bukayo-saka');
  await testPLSeasonStats('Cole Palmer', '568177', 'cole-palmer');
}

main();
