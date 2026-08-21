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

function parseExactTMPlayerStats(html) {
  // 1. Locate yellow cards th column index
  const theadMatch = html.match(/<thead>([\s\S]*?)<\/thead>/i);
  let yellowCardColIndex = -1;
  let matchesColIndex = 2;
  let goalsColIndex = 3;
  let assistsColIndex = 4;

  if (theadMatch) {
    const ths = [...theadMatch[1].matchAll(/<th[^>]*>([\s\S]*?)<\/th>/gi)].map(t => t[1]);
    ths.forEach((thHtml, idx) => {
      if (thHtml.includes('icon-gelbekarte-table-header') || thHtml.includes('Yellow cards')) {
        yellowCardColIndex = idx;
      }
      if (thHtml.includes('icon-einsaetze-table-header') || thHtml.includes('Appearances')) {
        matchesColIndex = idx;
      }
      if (thHtml.includes('icon-tor-table-header') || thHtml.includes('Goals')) {
        goalsColIndex = idx;
      }
      if (thHtml.includes('icon-vorlage-table-header') || thHtml.includes('Assists')) {
        assistsColIndex = idx;
      }
    });
  }

  // 2. Locate LaLiga row
  const rows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
  for (const r of rows) {
    const rowHtml = r[1];
    if (rowHtml.includes('LaLiga') || rowHtml.includes('Laliga') || rowHtml.includes('La Liga')) {
      const cells = [...rowHtml.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(c => c[1].replace(/<[^>]+>/g, '').trim());
      if (cells.length >= 8) {
        const parseNum = (val) => {
          if (!val || val === '-') return 0;
          const clean = val.replace(/[^0-9]/g, '');
          return parseInt(clean, 10) || 0;
        };

        const matches = parseNum(cells[matchesColIndex]);
        const goals = parseNum(cells[goalsColIndex]);
        const assists = assistsColIndex !== -1 ? parseNum(cells[assistsColIndex]) : 0;
        const yellowCards = yellowCardColIndex !== -1 ? parseNum(cells[yellowCardColIndex]) : 0;

        return { matches, goals, assists, yellowCards, yellowCardColIndex };
      }
    }
  }

  return null;
}

async function testDynamicParser() {
  const players = [
    { name: 'Vinicius Jr.', path: '/vinicius-junior/leistungsdaten/spieler/371998/plus/1?saison=2025' },
    { name: 'Lamine Yamal', path: '/lamine-yamal/leistungsdaten/spieler/937958/plus/1?saison=2025' },
    { name: 'Thibaut Courtois', path: '/thibaut-courtois/leistungsdaten/spieler/108390/plus/1?saison=2025' },
    { name: 'Jude Bellingham', path: '/jude-bellingham/leistungsdaten/spieler/581678/plus/1?saison=2025' },
    { name: 'Robert Lewandowski', path: '/robert-lewandowski/leistungsdaten/spieler/38253/plus/1?saison=2025' },
    { name: 'Damian Suárez', path: '/damian-suarez/leistungsdaten/spieler/76746/plus/1?saison=2025' },
    { name: 'Unai Simón', path: '/unai-simon/leistungsdaten/spieler/262396/plus/1?saison=2025' }
  ];

  console.log('Testing Exact Dynamic Yellow Card Parsing...\n');
  for (const p of players) {
    const res = await fetchTM(p.path);
    const parsed = parseExactTMPlayerStats(res.body);
    console.log(`Player: ${p.name}`);
    console.log('  Result:', parsed);
  }
}

testDynamicParser();
