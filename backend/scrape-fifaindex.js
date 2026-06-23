const https = require('https');
const fs = require('fs');

const names = [
  "Nico Schlotterbeck", "Xavi Simons", "Abdelkabir Abqar", "Andoni Gorosabel",
  "Antonio Blanco", "Antonio Sivera", "Luis Rioja", "Rubén Duarte", "Ronald Araújo",
  "Randal Kolo Muani", "Warren Zaïre-Emery", "Ben White", "Gabriel Magalhães",
  "Gabriel Martinelli", "Boubacar Kamara", "Diego Carlos", "Douglas Luiz",
  "Emiliano Martínez", "Ezri Konsa", "Lucas Digne", "Ollie Watkins", "Dušan Vlahović",
  "Federico Dimarco", "Gleison Bremer", "Piotr Zieliński"
];

async function searchFifaIndex(name) {
  const q = encodeURIComponent(name);
  const url = `https://www.fifaindex.com/es/players/?name=${q}`;
  
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        // Find player row
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
  const updates = {};
  for (const name of names) {
    const id = await searchFifaIndex(name);
    if (id) {
      console.log(`Found ${name} -> ${id}`);
      updates[name] = id;
    } else {
      console.log(`NOT FOUND: ${name}`);
    }
    await new Promise(r => setTimeout(r, 100)); // be nice
  }
  fs.writeFileSync('updates.json', JSON.stringify(updates, null, 2));
}

run();
