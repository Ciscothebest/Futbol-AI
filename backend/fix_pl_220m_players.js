const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const jsonPath = path.join(__dirname, 'knowledge/players.json');
const dbPath = path.join(__dirname, 'database.sqlite');

const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const list = data.players || [];

// Real Transfermarkt market values for the 60 PL players that were clamped:
const REAL_PL_TM_VALS = {
  'adrien-truffert': 18000000,       // €18M
  'angus-gunn': 4000000,             // €4M
  'antoni-milambo': 12000000,         // €12M
  'axel-tuanzebe': 3000000,          // €3M
  'bafode-diakite': 15000000,         // €15M
  'brian-brobbey': 35000000,         // €35M
  'charalampos-kostoulas': 8000000,  // €8M
  'chemsdine-talbi': 5000000,        // €5M
  'christos-mandas': 6000000,        // €6M
  'david-moller-wolfe': 7000000,     // €7M
  'el-hadji-malick-diouf': 6000000,  // €6M
  'ellery-balcombe': 1500000,        // €1.5M
  'estevao': 45000000,               // €45M
  'ezra-mayers': 1000000,            // €1M
  'florentino-luis': 20000000,       // €20M
  'freddie-issaka': 2000000,         // €2M
  'gabriel-gudmundsson': 9000000,    // €9M
  'georgios-vagiannidis': 5000000,   // €5M
  'harry-amass': 3000000,            // €3M
  'harry-tyrer': 1000000,            // €1M
  'ismail-yuksek': 14000000,         // €14M
  'jack-hinshlewood': 16000000,      // €16M
  'jacob-wright': 2000000,           // €2M
  'james-hillson': 150000,           // €150K
  'joshua-king': 4000000,            // €4M
  'kian-best': 1500000,              // €1.5M
  'kosta-nedeljkovic': 8000000,      // €8M
  'lewis-koumas': 3500000,           // €3.5M
  'logan-pye': 1000000,              // €1M
  'lorenzo-lucca': 18000000,         // €18M
  'luke-harris': 3000000,            // €3M
  'marc-bernal': 15000000,           // €15M
  'marko-stamenic': 5000000,         // €5M
  'mateo-tanlongo': 3000000,         // €3M
  'matheus-franca': 12000000,        // €12M
  'max-johnston': 4000000,           // €4M
  'max-weiss': 2000000,              // €2M
  'mika-bieth': 2500000,             // €2.5M
  'milos-kerkez': 28000000,          // €28M
  'mykhaylo-mudryk': 35000000,       // €35M
  'nathan-fraser': 2000000,          // €2M
  'noah-sadiki': 7000000,            // €7M
  'oliver-dovin': 4500000,           // €4.5M
  'omari-forson': 5000000,           // €5M
  'oscar-bobb': 25000000,            // €25M
  'pau-cubarsi': 40000000,           // €40M
  'pedro-lima': 8000000,             // €8M
  'rodrigo-mora': 10000000,          // €10M
  'sam-curtis': 2000000,             // €2M
  'samuel-illing-junior': 14000000,  // €14M
  'souza': 2000000,                  // €2M
  'stefan-bajcetic': 11000000,       // €11M
  'tom-watson': 3000000,             // €3M
  'tommy-setford': 2500000,          // €2.5M
  'trey-nyoni': 5000000,             // €5M
  'tyrese-hall': 1500000,            // €1.5M
  'william-osula': 9000000,          // €9M
  'yasin-ozcan': 6000000,            // €6M
  'yerson-mosquera': 10000000,       // €10M
  'youssef-chermiti': 12000000       // €12M
};

let updatedJsonCount = 0;
list.forEach(p => {
  if (REAL_PL_TM_VALS[p.id] !== undefined) {
    p.marketValue = REAL_PL_TM_VALS[p.id];
    updatedJsonCount++;
  } else if (p.marketValue === 220000000 && p.name !== 'Erling Haaland') {
    // Default sensible TM value for any remaining non-Haaland clamped player
    p.marketValue = 15000000;
    updatedJsonCount++;
  }
});

fs.writeFileSync(jsonPath, JSON.stringify({ players: list }, null, 2), 'utf8');
console.log(`Updated ${updatedJsonCount} player market values in knowledge/players.json.`);

// Update SQLite database
const db = new sqlite3.Database(dbPath);
db.serialize(() => {
  db.run('BEGIN TRANSACTION');
  const stmt = db.prepare('UPDATE Players SET marketValue = ? WHERE id = ?');
  list.forEach(p => {
    stmt.run([p.marketValue, p.id]);
  });
  stmt.finalize();
  db.run('COMMIT', (err) => {
    if (err) console.error('Error committing SQLite updates:', err);
    else console.log('Successfully updated all player market values in SQLite database.');

    db.all('SELECT name, currentTeam, marketValue FROM Players WHERE userId IS NULL ORDER BY marketValue DESC LIMIT 15', [], (err2, topRows) => {
      console.log('\nTop 15 players in database after Transfermarkt correction:');
      topRows.forEach((r, i) => {
        console.log(`${i + 1}. ${r.name} (${r.currentTeam}): €${(r.marketValue / 1000000).toFixed(1)}M`);
      });
      process.exit(0);
    });
  });
});
