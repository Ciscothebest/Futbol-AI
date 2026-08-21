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

async function inspectPlOccurrences() {
  const html = await fetchTM('/erling-haaland/leistungsdaten/spieler/418560');

  const matches = [...html.matchAll(/Premier League/gi)];
  console.log(`Found ${matches.length} occurrences of "Premier League"`);

  let idx = 0;
  while ((idx = html.indexOf('Premier League', idx)) !== -1) {
    const snippet = html.substring(Math.max(0, idx - 100), Math.min(html.length, idx + 300));
    console.log(`\n--- Snippet around index ${idx} ---`);
    console.log(snippet.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));
    idx += 'Premier League'.length;
  }
}

inspectPlOccurrences();
