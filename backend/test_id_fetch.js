const https = require('https');
const fs = require('fs');

async function searchFifaIndex(name) {
  const q = encodeURIComponent(name);
  // Using English site version, maybe it's more stable
  const url = `https://www.fifaindex.com/players/?name=${q}`;
  
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        // Looking for something like href="/player/220814/david-raya/"
        const match = data.match(/href="\/player\/(\d+)\//);
        if (match) {
          resolve(match[1]);
        } else {
          // Try another pattern if the first fails
          const match2 = data.match(/data-playerid="(\d+)"/);
          if (match2) resolve(match2[1]);
          else resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

// Test with David Raya
searchFifaIndex('David Raya').then(id => {
  console.log('ID for David Raya:', id);
});
