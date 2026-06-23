const https = require('https');
https.get('https://sofifa.com/player/254848', {headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const match = data.match(/<img[^>]+src="([^"]+)"/g);
    if (match) {
      match.forEach(m => console.log(m));
    }
  });
});
