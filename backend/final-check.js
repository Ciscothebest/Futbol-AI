const https = require('https');
const fs = require('fs');

const fileContent = fs.readFileSync('player-faces.js', 'utf8');
const lines = fileContent.split('\n');
const faces = {};
lines.forEach(line => {
  const match = line.match(/'([^']+)'\s*:\s*'(\d+)'/);
  if (match) {
    faces[match[1]] = match[2];
  }
});

const playersToCheck = [
  'schlotterbeck-nico', 'simons-xavi', 'abqar', 'gorosabel', 'antonio-blanco',
  'sivera', 'rioja', 'duarte', 'araujo-ronald', 'kolo-muani-randal',
  'zaire-emery-warren', 'ben-white', 'gabriel-magalhaes', 'gabriel-martinelli',
  'boubacar-kamara', 'diego-carlos', 'douglas-luiz', 'emiliano-martinez',
  'ezri-konsa', 'lucas-digne', 'watkins-ollie', 'vlahovic-dusan',
  'dimarco-federico', 'bremer-gleison', 'zielinski-piotr', 'martin-gabriel', 'ollie-watkins'
];

const years = ['25', '24', '23', '22'];

async function check(idStr, name) {
  const p1 = idStr.substring(0,3);
  const p2 = idStr.substring(3,6);
  for (const y of years) {
    const url = `https://cdn.sofifa.net/players/${p1}/${p2}/${y}_120.png`;
    const ok = await new Promise(r => https.get(url, {headers:{'User-Agent':'Mozilla/5.0'}}, res => {
      r(res.statusCode === 200);
    }).on('error', () => r(false)));
    if (ok) {
      console.log(`OK: ${name} (${idStr}) -> ${url}`);
      return;
    }
  }
  console.log(`FAIL: ${name} (ID: ${idStr})`);
}

async function run() {
  for (const name of playersToCheck) {
    const id = faces[name];
    if (id) {
      await check(id, name);
    } else {
      console.log(`MISSING IN JS: ${name}`);
    }
  }
}
run();
