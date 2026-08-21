const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'));

const eredivisieTerms = ['eredivisie', 'netherlands', 'dutch eredivisie', 'holland'];
const eredivisieClubs = [
  'Ajax', 'AFC Ajax', 'PSV Eindhoven', 'PSV', 'Feyenoord', 'AZ Alkmaar', 'AZ',
  'FC Twente', 'Twente', 'FC Utrecht', 'Utrecht', 'SC Heerenveen', 'Heerenveen',
  'Vitesse', 'NEC Nijmegen', 'NEC', 'Go Ahead Eagles', 'Sparta Rotterdam', 'Fortuna Sittard',
  'PEC Zwolle', 'Heracles Almelo', 'Heracles', 'RKC Waalwijk', 'Almere City FC', 'Almere City',
  'Willem II', 'NAC Breda', 'FC Groningen', 'Groningen'
];

db.all("SELECT id, name, currentTeam, league, country, stats, history FROM Players WHERE userId IS NULL", [], (err, rows) => {
  if (err) { console.error(err); process.exit(1); }
  
  const ePlayers = rows.filter(r => {
    const l = (r.league || '').toLowerCase();
    const c = (r.country || '').toLowerCase();
    const t = (r.currentTeam || '');
    return eredivisieTerms.some(term => l.includes(term)) || c === 'netherlands' || eredivisieClubs.some(club => t.toLowerCase() === club.toLowerCase());
  });

  console.log(`Total Eredivisie Players found in DB: ${ePlayers.length}`);
  
  const leagues = {};
  const teams = {};
  ePlayers.forEach(p => {
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
