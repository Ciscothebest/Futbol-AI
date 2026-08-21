const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'));

const ligue1Terms = ['ligue 1', 'ligue-1', 'ligue1', 'france', 'french ligue 1'];
const ligue1Clubs = [
  'Paris Saint-Germain', 'PSG', 'AS Monaco', 'Monaco', 'Olympique de Marseille', 'Marseille',
  'Olympique Lyonnais', 'Lyon', 'LOSC Lille', 'Lille', 'RC Lens', 'Lens',
  'Stade Rennais FC', 'Rennes', 'OGC Nice', 'Nice', 'Stade de Reims', 'Reims',
  'Stade Brestois 29', 'Brest', 'Toulouse FC', 'Toulouse', 'RC Strasbourg Alsace', 'Strasbourg',
  'FC Nantes', 'Nantes', 'Montpellier HSC', 'Montpellier', 'Le Havre AC', 'Le Havre',
  'AJ Auxerre', 'Auxerre', 'Angers SCO', 'Angers', 'AS Saint-Étienne', 'Saint-Étienne',
  'FC Lorient', 'Lorient', 'FC Metz', 'Metz', 'Clermont Foot'
];

db.all("SELECT id, name, currentTeam, league, country, stats, history FROM Players WHERE userId IS NULL", [], (err, rows) => {
  if (err) { console.error(err); process.exit(1); }
  
  const l1Players = rows.filter(r => {
    const l = (r.league || '').toLowerCase();
    const c = (r.country || '').toLowerCase();
    const t = (r.currentTeam || '');
    return ligue1Terms.some(term => l.includes(term)) || c === 'france' || ligue1Clubs.some(club => t.toLowerCase() === club.toLowerCase());
  });

  console.log(`Total Ligue 1 Players found in DB: ${l1Players.length}`);
  
  const leagues = {};
  const teams = {};
  l1Players.forEach(p => {
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
