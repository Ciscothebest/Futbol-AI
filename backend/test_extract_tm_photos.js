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
    req.setTimeout(6000, () => {
      req.destroy();
      resolve({ status: 408, error: 'Timeout', body: '' });
    });
  });
}

async function extractTMPhoto(playerName) {
  let searchPath = `/schnellsuche/ergebnis/schnellsuche?query=${playerName}`;
  let searchRes = await fetchTM(searchPath);
  let matches = [...searchRes.body.matchAll(/href="([^"]*spieler\/[0-9]+)"/gi)];

  if (!matches || matches.length === 0) {
    console.log(`❌ No match found for: ${playerName}`);
    return null;
  }

  const profilePath = matches[0][1];
  const profileRes = await fetchTM(profilePath);
  const imgMatch = profileRes.body.match(/https:\/\/img.a.transfermarkt.technology\/portrait\/[^\"]+/i);

  if (imgMatch) {
    console.log(`✅ ${playerName}: ${imgMatch[0]}`);
    return imgMatch[0];
  } else {
    console.log(`⚠️ No portrait found on profile for: ${playerName}`);
    return null;
  }
}

async function main() {
  const plNames = [
    'Erling Haaland', 'Bukayo Saka', 'Cole Palmer', 'Mohamed Salah',
    'Declan Rice', 'Phil Foden', 'Alexis Mac Allister', 'Ollie Watkins',
    'William Saliba', 'David Raya'
  ];

  console.log("=================================================");
  console.log("TESTING TRANSFERMARKT PORTRAIT PHOTO EXTRACTION");
  console.log("=================================================\n");

  for (const name of plNames) {
    await extractTMPhoto(name);
  }
}

main();
