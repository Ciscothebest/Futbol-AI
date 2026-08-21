const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.all('SELECT id, name, currentTeam, league, marketValue FROM Players WHERE userId IS NULL', [], (err, rows) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(`Total players: ${rows.length}`);

  let zeroCount = 0;
  let nonZeroCount = 0;
  const leagueCounts = {};

  rows.forEach(p => {
    if (!p.marketValue || p.marketValue === 0) {
      zeroCount++;
    } else {
      nonZeroCount++;
    }
    const l = p.league || 'Sin Liga';
    if (!leagueCounts[l]) leagueCounts[l] = { count: 0, totalVal: 0 };
    leagueCounts[l].count++;
    leagueCounts[l].totalVal += (p.marketValue || 0);
  });

  console.log(`Players with positive marketValue: ${nonZeroCount}`);
  console.log(`Players with zero marketValue: ${zeroCount}`);

  console.log('\nBreakdown by League:');
  Object.entries(leagueCounts).forEach(([l, d]) => {
    const avg = d.count > 0 ? (d.totalVal / d.count / 1000000).toFixed(1) : '0';
    console.log(`- ${l}: ${d.count} players | Avg marketValue: €${avg}M`);
  });

  process.exit(0);
});
