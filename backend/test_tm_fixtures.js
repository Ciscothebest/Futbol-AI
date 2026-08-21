const https = require('https');

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
      }
    };
    https.get(url, options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http')) {
          redirectUrl = 'https://www.transfermarkt.es' + redirectUrl;
        }
        return httpGet(redirectUrl).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function run() {
  console.log("Searching Real Madrid on Transfermarkt...");
  const searchHtml = await httpGet('https://www.transfermarkt.es/schnellsuche/ergebnis/schnellsuche?query=Real+Madrid');
  const match = searchHtml.match(/href="\/([^\/]+)\/startseite\/verein\/(\d+)"/);
  if (match) {
    const slug = match[1];
    const clubId = match[2];
    console.log(`Found Real Madrid: slug=${slug}, clubId=${clubId}`);
    
    // Fetch 2026/2027 spielplan (saison_id=2026)
    const spielplanUrl = `https://www.transfermarkt.es/${slug}/spielplan/verein/${clubId}/saison_id/2026`;
    console.log("Fetching spielplan:", spielplanUrl);
    const planHtml = await httpGet(spielplanUrl);
    console.log("Plan HTML length:", planHtml.length);
    
    // Check if fixtures are present
    const trMatches = planHtml.match(/<tr[^>]*>[\s\S]*?<\/tr>/g) || [];
    console.log("Total tr elements found:", trMatches.length);
    
    // Let's print out the first few match rows if any
    let count = 0;
    for (const tr of trMatches) {
      if (tr.includes('verein') || tr.includes('spielbericht') || tr.includes('zeit') || tr.includes('datum')) {
        // extract text
        const clean = tr.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        if (clean.length > 20) {
          console.log(`Row ${++count}:`, clean);
          if (count >= 10) break;
        }
      }
    }
  } else {
    console.log("Could not find club link.");
  }
}

run().catch(console.error);
