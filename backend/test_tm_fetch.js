const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
  });
}

async function testTMPhoto(name) {
  try {
    const searchUrl = `https://www.transfermarkt.es/schnellsuche/ergebnis/schnellsuche?query=${encodeURIComponent(name)}`;
    const html = await fetchUrl(searchUrl);
    
    const playerMatch = html.match(/<a[^>]*href="([^"]*profil\/spieler\/[^"]*)"/i);
    if (playerMatch) {
      const profilePath = playerMatch[1];
      const profileUrl = `https://www.transfermarkt.es${profilePath}`;
      console.log(`Profile URL for ${name}: ${profileUrl}`);
      const pHtml = await fetchUrl(profileUrl);
      
      const tmTechImgs = [...pHtml.matchAll(/src="([^"]*transfermarkt.technology[^"]*)"/gi)];
      console.log(`All transfermarkt.technology image sources for ${name}:`);
      tmTechImgs.forEach(m => console.log(' - ' + m[1]));

      const headerImgMatch = pHtml.match(/class="data-header__profile-image"[^>]*src="([^"]+)"/i) ||
                             pHtml.match(/<img[^>]*class="modal-trigger"[^>]*src="([^"]+)"/i) ||
                             pHtml.match(/<div class="data-header__profile-container"[^>]*>[\s\S]*?<img[^>]*src="([^"]+)"/i);
      console.log(`MATCHED PROFILE HEADSHOT:`, headerImgMatch ? headerImgMatch[1] : 'NONE');
    }
  } catch(e) {
    console.error(`ERROR FOR ${name}:`, e.message);
  }
}

testTMPhoto('Adam Hložek');
testTMPhoto('Adam Marušić');
