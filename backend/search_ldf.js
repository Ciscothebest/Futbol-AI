const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'));

const ldfTerms = ['ldf', 'dominican', 'republica dominicana', 'cibao', 'pantoja', 'moca', 'jarabacoa', 'vega real', 'atlantico', 'delfines', 'san cristobal', 'o&m', 'universidad o&m'];

db.all("SELECT id, name, currentTeam, league, country, stats, history FROM Players WHERE userId IS NULL", [], (err, rows) => {
  if (err) { console.error(err); process.exit(1); }
  
  const ldfPlayers = rows.filter(r => {
    const l = (r.league || '').toLowerCase();
    const c = (r.country || '').toLowerCase();
    const t = (r.currentTeam || '').toLowerCase();
    return ldfTerms.some(term => l.includes(term) || c.includes(term) || t.includes(term));
  });

  console.log(`Total LDF / Dominican League Players found in DB: ${ldfPlayers.length}`);
  
  const leagues = {};
  const teams = {};
  ldfPlayers.forEach(p => {
    leagues[p.league] = (leagues[p.league] || 0) + 1;
    teams[p.currentTeam] = (teams[p.currentTeam] || 0) + 1;
  });

  console.log('Leagues found:', leagues);
  console.log('Teams found:', teams);
  if (ldfPlayers.length > 0) {
    console.log('\nSample players (first 10):');
    ldfPlayers.slice(0, 10).forEach(p => {
      console.log(`- ${p.name} (${p.currentTeam} - ${p.league})`);
    });
  }

  process.exit(0);
});
