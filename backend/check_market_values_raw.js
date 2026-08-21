const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath);

db.all('SELECT id, name, currentTeam, marketValue FROM Players WHERE userId IS NULL', [], (err, rows) => {
  if (err) {
    console.error('Error querying SQLite:', err);
    return;
  }
  console.log(`Total players in SQLite DB: ${rows.length}`);
  const over220M = rows.filter(r => r.marketValue > 220000000);
  console.log(`Players with marketValue > €220M: ${over220M.length}`);
  over220M.forEach(p => {
    console.log(`- ID: ${p.id} | Name: ${p.name} | Team: ${p.currentTeam} | MarketValue: €${(p.marketValue / 1000000).toFixed(1)}M`);
  });

  const top25 = [...rows].sort((a, b) => (b.marketValue || 0) - (a.marketValue || 0)).slice(0, 25);
  console.log('\nTop 25 players by marketValue in SQLite DB:');
  top25.forEach((p, i) => {
    console.log(`${i + 1}. ${p.name} (${p.currentTeam}): €${((p.marketValue || 0) / 1000000).toFixed(1)}M`);
  });
});
