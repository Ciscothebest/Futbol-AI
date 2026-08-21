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
    https.get(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(body));
    });
  });
}

async function inspectRawHtml() {
  const res = await fetchTM('/erling-haaland/leistungsdaten/spieler/418560');
  const html = res;

  console.log("Searching for 'Premier League' in full text...");
  const pos = html.indexOf('Premier League');
  if (pos !== -1) {
    console.log("HTML snippet around 'Premier League':");
    console.log(html.substring(pos - 200, pos + 500));
  }
}

inspectRawHtml();
