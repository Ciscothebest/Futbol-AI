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

function parseExactTMPlayerStats(html, isGoalkeeper) {
  const theadMatch = html.match(/<thead>([\s\S]*?)<\/thead>/i);
  let yellowCardColIndex = -1;
  let matchesColIndex = 2;
  let goalsColIndex = -1;
  let assistsColIndex = -1;

  if (theadMatch) {
    const ths = [...theadMatch[1].matchAll(/<th[^>]*>([\s\S]*?)<\/th>/gi)].map(t => t[1]);
    ths.forEach((thHtml, idx) => {
      if (thHtml.includes('icon-gelbekarte-table-header') || thHtml.includes('Yellow cards')) {
        yellowCardColIndex = idx;
      }
      if (thHtml.includes('icon-einsaetze-table-header') || thHtml.includes('Appearances')) {
        matchesColIndex = idx;
      }
      if (!isGoalkeeper && (thHtml.includes('icon-tor-table-header') || thHtml.includes('title="Goals"'))) {
        goalsColIndex = idx;
      }
      if (!isGoalkeeper && (thHtml.includes('icon-vorlage-table-header') || thHtml.includes('Assists'))) {
        assistsColIndex = idx;
      }
    });
  }

  const rows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
  for (const r of rows) {
    const rowHtml = r[1];
    if (rowHtml.includes('Premier League') || rowHtml.includes('Premier league') || rowHtml.includes('GB1')) {
      const cells = [...rowHtml.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(c => c[1].replace(/<[^>]+>/g, '').trim());
      if (cells.length >= 6) {
        const parseNum = (val) => {
          if (!val || val === '-') return 0;
          const clean = val.replace(/[^0-9]/g, '');
          return parseInt(clean, 10) || 0;
        };

        const matches = parseNum(cells[matchesColIndex]);
        const goals = (goalsColIndex !== -1 && goalsColIndex < cells.length) ? parseNum(cells[goalsColIndex]) : parseNum(cells[3]);
        const assists = (assistsColIndex !== -1 && assistsColIndex < cells.length) ? parseNum(cells[assistsColIndex]) : parseNum(cells[4]);
        const yellowCards = (yellowCardColIndex !== -1 && yellowCardColIndex < cells.length) ? parseNum(cells[yellowCardColIndex]) : 0;

        return { matches, goals, assists, yellowCards };
      }
    }
  }

  return null;
}

async function testPlayer(name, tmId, slug) {
  const statsRes = await fetchTM(`/${slug}/leistungsdaten/spieler/${tmId}/plus/1?saison=2025`);
  const parsed = parseExactTMPlayerStats(statsRes.body, false);
  console.log(`\n📊 ${name} (2025/2026 Premier League Stats):`);
  console.log(parsed || 'No row matched directly');
}

async function main() {
  await testPlayer('Erling Haaland', '418560', 'erling-haaland');
  await testPlayer('Bukayo Saka', '433177', 'bukayo-saka');
  await testPlayer('Cole Palmer', '568177', 'cole-palmer');
}

main();
