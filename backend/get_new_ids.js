const https = require('https');
const fs = require('fs');
const playersToAdd = require('./players_list');

async function searchFifaIndex(name) {
  const q = encodeURIComponent(name);
  const url = `https://www.fifaindex.com/es/players/?name=${q}`;
  
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        const match = data.match(/href="\/es\/player\/(\d+)\//);
        if (match) {
          resolve(match[1]);
        } else {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

async function run() {
  const ids = {};
  const allNames = [];
  
  for (const team in playersToAdd) {
    for (const cat in playersToAdd[team]) {
      allNames.push(...playersToAdd[team][cat]);
    }
  }

  console.log(`Searching for ${allNames.length} players...`);

  for (const name of allNames) {
    const id = await searchFifaIndex(name);
    if (id) {
      console.log(`✅ ${name} -> ${id}`);
      ids[name] = id;
    } else {
      console.log(`❌ ${name} NOT FOUND`);
      ids[name] = null;
    }
    await new Promise(r => setTimeout(r, 200)); // be nice
  }

  fs.writeFileSync('new_player_ids.json', JSON.stringify(ids, null, 2));
  console.log('Done! Saved to new_player_ids.json');
}

run();
