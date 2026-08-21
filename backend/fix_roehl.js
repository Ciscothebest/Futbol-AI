const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const jsonPath = path.join(__dirname, 'knowledge/players.json');

const db = new sqlite3.Database(dbPath);
db.run("UPDATE Players SET marketValue = 18000000 WHERE id LIKE '%merlin%' OR name LIKE '%Merlin%'", function(err) {
  if (err) console.error(err);
  else console.log(`Fixed Merlin Röhl (${this.changes} rows) to €18M.`);
});

const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
let list = data.players || [];
list.forEach(p => {
  if (p.id.includes('merlin') || p.name.includes('Merlin')) {
    p.marketValue = 18000000;
  }
});
fs.writeFileSync(jsonPath, JSON.stringify({ players: list }, null, 2), 'utf8');

setTimeout(() => {
  db.all('SELECT name, currentTeam, marketValue FROM Players WHERE userId IS NULL ORDER BY marketValue DESC LIMIT 15', [], (err2, topRows) => {
    console.log('\nTop 15 players in DB:');
    topRows.forEach((r, i) => {
      console.log(`${i + 1}. ${r.name} (${r.currentTeam}): €${(r.marketValue / 1000000).toFixed(1)}M`);
    });
    process.exit(0);
  });
}, 500);
