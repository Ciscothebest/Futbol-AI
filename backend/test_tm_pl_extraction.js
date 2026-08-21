const https = require('https');
const fs = require('fs');

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
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({ status: 408, error: 'Timeout', body: '' });
    });
  });
}

function parseMarketValue(raw) {
  if (!raw) return 0;
  const clean = raw.replace(/<[^>]+>/g, '').trim().toLowerCase();
  const match = clean.match(/€\s*([0-9]+(?:\.[0-9]+)?)\s*(m|k)?/i);
  if (!match) return 0;
  const val = parseFloat(match[1]);
  const unit = match[2];
  if (unit === 'm') return Math.round(val * 1000000);
  if (unit === 'k') return Math.round(val * 1000);
  return Math.round(val);
}

async function testExtraction(playerName) {
  console.log(`\n========================================`);
  console.log(`Searching Transfermarkt for: ${playerName}`);
  
  let searchPath = `/schnellsuche/ergebnis/schnellsuche?query=${playerName}`;
  let searchRes = await fetchTM(searchPath);
  let matches = [...searchRes.body.matchAll(/href="([^"]*spieler\/[0-9]+)"/gi)];

  if (!matches || matches.length === 0) {
    console.log(`❌ No match found for ${playerName}`);
    return;
  }

  const profilePath = matches[0][1];
  console.log(`✅ Match profile path: ${profilePath}`);

  const profileRes = await fetchTM(profilePath);
  const html = profileRes.body;

  // Extract Market Value
  const mvMatch = html.match(/market-value-wrapper[^>]*>([\s\S]*?)<\/a>/i) ||
                  html.match(/tm-player-market-value-development__current-value[^>]*>([\s\S]*?)<\/a>/i);
  const rawMV = mvMatch ? mvMatch[1] : '';
  const parsedMV = parseMarketValue(rawMV);
  console.log(`💰 Market Value: €${parsedMV.toLocaleString()} (${rawMV.trim().replace(/\s+/g, ' ')})`);

  // Extract Photo
  const imgMatch = html.match(/https:\/\/img.a.transfermarkt.technology\/portrait\/[^\"]+/i);
  console.log(`📷 Photo URL: ${imgMatch ? imgMatch[0] : 'Not found'}`);

  // Extract Dorsal / Jersey Number
  const jerseyMatch = html.match(/data-header__shirt-number[^>]*>\s*#?([0-9]+)\s*</i);
  console.log(`👕 Jersey Number: ${jerseyMatch ? jerseyMatch[1] : 'N/A'}`);

  // Extract Height, Foot, Position, Age
  const heightMatch = html.match(/Height:[\s\S]*?<span[^>]*class="info-table__content[^"]*"[^>]*>([0-9,.]+)\s*m/i);
  const heightCm = heightMatch ? Math.round(parseFloat(heightMatch[1].replace(',', '.')) * 100) : null;
  console.log(`📏 Height: ${heightCm} cm`);

  const footMatch = html.match(/Foot:[\s\S]*?<span[^>]*class="info-table__content[^"]*"[^>]*>([a-zA-Z]+)/i);
  console.log(`🦶 Foot: ${footMatch ? footMatch[1] : 'N/A'}`);

  const ageMatch = html.match(/Age:[\s\S]*?<span[^>]*class="info-table__content[^"]*"[^>]*>([0-9]+)/i);
  console.log(`🎂 Age: ${ageMatch ? ageMatch[1] : 'N/A'}`);

  const posMatch = html.match(/Position:[\s\S]*?<span[^>]*class="info-table__content[^"]*"[^>]*>([a-zA-Z\s-]+)/i);
  console.log(`⚽ Position: ${posMatch ? posMatch[1].trim() : 'N/A'}`);
}

async function run() {
  await testExtraction('Erling Haaland');
  await testExtraction('Bukayo Saka');
  await testExtraction('Cole Palmer');
}

run();
