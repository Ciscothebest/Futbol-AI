const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'));

const bundesligaTerms = ['bundesliga', 'germany', 'german bundesliga'];
const bundesligaClubs = [
  'FC Bayern München', 'Bayern Munich', 'Bayern München', 'Borussia Dortmund', 'Dortmund',
  'Bayer 04 Leverkusen', 'Bayer Leverkusen', 'Leverkusen', 'RB Leipzig', 'Leipzig',
  'Eintracht Frankfurt', 'Frankfurt', 'VfB Stuttgart', 'Stuttgart', 'VfL Wolfsburg', 'Wolfsburg',
  'Borussia Mönchengladbach', 'Mönchengladbach', 'TSG 1899 Hoffenheim', 'Hoffenheim',
  'SC Freiburg', 'Freiburg', 'FC Augsburg', 'Augsburg', 'SV Werder Bremen', 'Werder Bremen', 'Bremen',
  '1.FC Union Berlin', 'Union Berlin', '1.FSV Mainz 05', 'Mainz 05', 'Mainz',
  'VfL Bochum', 'Bochum', 'FC St. Pauli', 'St. Pauli', 'Holstein Kiel', '1.FC Heidenheim', 'Heidenheim',
  '1.FC Köln', 'Köln', 'SV Darmstadt 98', 'Darmstadt'
];

db.all("SELECT id, name, currentTeam, league, country, stats, history FROM Players WHERE userId IS NULL", [], (err, rows) => {
  if (err) { console.error(err); process.exit(1); }
  
  const bPlayers = rows.filter(r => {
    const l = (r.league || '').toLowerCase();
    const c = (r.country || '').toLowerCase();
    const t = (r.currentTeam || '');
    return bundesligaTerms.some(term => l.includes(term)) || c === 'germany' || bundesligaClubs.some(club => t.toLowerCase() === club.toLowerCase());
  });

  console.log(`Total Bundesliga Players found in DB: ${bPlayers.length}`);
  
  const leagues = {};
  const teams = {};
  bPlayers.forEach(p => {
    leagues[p.league] = (leagues[p.league] || 0) + 1;
    teams[p.currentTeam] = (teams[p.currentTeam] || 0) + 1;
  });

  console.log('Leagues found:', leagues);
  console.log('Teams breakdown:');
  Object.entries(teams).sort((a,b) => b[1] - a[1]).forEach(([team, cnt]) => {
    console.log(`  - ${team}: ${cnt} players`);
  });

  process.exit(0);
});
