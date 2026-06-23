const https = require('https');
const fs = require('fs');
const faces = require('./player-faces.js');

const names = [
  "Nico Schlotterbeck",
  "Xavi Simons",
  "Abdelkabir Abqar",
  "Andoni Gorosabel",
  "Antonio Blanco",
  "Antonio Sivera",
  "Luis Rioja",
  "Rubén Duarte",
  "Ronald Araújo",
  "Randal Kolo Muani",
  "Warren Zaïre-Emery",
  "Ben White",
  "Gabriel Magalhães",
  "Gabriel Martinelli",
  "Boubacar Kamara",
  "Diego Carlos",
  "Douglas Luiz",
  "Emiliano Martínez",
  "Ezri Konsa",
  "Lucas Digne",
  "Ollie Watkins",
  "Dušan Vlahović",
  "Federico Dimarco",
  "Gleison Bremer",
  "Piotr Zieliński"
];

async function searchSofifa(name) {
  const q = encodeURIComponent(name);
  const url = `https://sofifa.com/players?keyword=${q}`;
  
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        // Find first player row
        const match = data.match(/<a href="\/player\/(\d+)\//);
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
    console.log(`Searching for ${name}...`);
    const id = await searchSofifa(name);
    if (id) {
      console.log(`Found ${name} -> ${id}`);
      updates[name] = id;
    } else {
      console.log(`NOT FOUND: ${name}`);
    }
    // delay to prevent rate limiting
    await new Promise(r => setTimeout(r, 500));
  }
  fs.writeFileSync('updates.json', JSON.stringify(updates, null, 2));
}

run();
