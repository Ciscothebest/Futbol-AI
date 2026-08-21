const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'));

db.all("SELECT id, name, currentTeam, league, stats, history, transfers, marketValue, position, photoId FROM Players WHERE userId IS NULL AND league LIKE '%LDF%'", [], (err, rows) => {
  if (err) { console.error(err); process.exit(1); }
  
  console.log(`Total LDF Players found: ${rows.length}`);

  let missing2025Stats = 0;
  let missing2025History = 0;
  let historyShort = 0;

  rows.forEach(p => {
    let s = {};
    try { s = typeof p.stats === 'string' ? JSON.parse(p.stats) : (p.stats || {}); } catch(e) {}
    let h = [];
    try { h = typeof p.history === 'string' ? JSON.parse(p.history) : (p.history || []); } catch(e) {}

    const has2025Stats = (s.season === '2025-26' || s.season === '2025/26');
    const has2025History = Array.isArray(h) && h.length > 0 && (h[0].season === '2025/26' || h[0].season === '2025-26');

    if (!has2025Stats) missing2025Stats++;
    if (!has2025History) missing2025History++;
    if (h.length < 10) historyShort++;
  });

  console.log(`Players missing 2025-26 in stats: ${missing2025Stats}`);
  console.log(`Players missing 2025-26 in top of history: ${missing2025History}`);
  console.log(`Players with history length < 10: ${historyShort}`);

  process.exit(0);
});
