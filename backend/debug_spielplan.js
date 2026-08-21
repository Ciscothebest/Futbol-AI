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

function parseMatchTrs(html, teamName) {
  const trs = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/g) || [];
  const matches = [];
  
  for (const tr of trs) {
    if (matches.length >= 3) break;
    
    // Check if it's a match row by looking for date DD/MM/YYYY
    const dateMatch = tr.match(/(\d{2}\/\d{2}\/\d{4})/);
    if (!dateMatch) continue;
    
    // Extract opponent name: look for title="..." or link text inside td.hauptlink or img title
    let oppName = null;
    const oppMatch = tr.match(/<td[^>]*class="[^"]*hauptlink[^"]*"[^>]*>[\s\S]*?title="([^"]+)"/i) ||
                     tr.match(/<td[^>]*class="[^"]*hauptlink[^"]*"[^>]*>[\s\S]*?<a[^>]*>([^<]+)<\/a>/i) ||
                     tr.match(/title="([^"]+)"/i);
                     
    if (oppMatch) {
      oppName = oppMatch[1].trim();
      // clean title e.g. "RC Deportivo A Coruña" or "Real Sociedad de Fútbol"
      oppName = oppName.replace(/\s*\(\d+\.\)\s*/g, '').trim();
    }
    
    // Check home vs away: ' H ' or '>H<' or ' A ' or '>A<'
    // In TM Spanish: H = Heim (Home / Local), A = Auswärts (Away / Visitante)
    const isHome = tr.includes(' H') || tr.includes('>H<') || tr.includes(' (H)') || tr.includes('zentriert">H');
    const isAway = tr.includes(' A') || tr.includes('>A<') || tr.includes(' (A)') || tr.includes('zentriert">A');
    
    if (oppName && !oppName.toLowerCase().includes(teamName.toLowerCase()) && !teamName.toLowerCase().includes(oppName.toLowerCase())) {
      matches.push({
        dateRaw: dateMatch[1],
        opponent: oppName,
        home: isHome || (!isAway && !tr.includes(' A '))
      });
    }
  }
  return matches;
}

async function runTest() {
  const html = await httpGet('https://www.transfermarkt.es/real-madrid/spielplan/verein/418/saison_id/2026');
  const matches = parseMatchTrs(html, "Real Madrid");
  console.log("Parsed matches for Real Madrid:", JSON.stringify(matches, null, 2));
}

runTest();
