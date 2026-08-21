const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'));

const serieaTerms = ['serie a', 'serie-a', 'seriea', 'italy', 'italian serie a'];
const serieaClubs = [
  'Inter Milan', 'Inter', 'FC Internazionale', 'AC Milan', 'Milan', 'Juventus', 'Juve',
  'SSC Napoli', 'Napoli', 'Atalanta BC', 'Atalanta', 'AS Roma', 'Roma', 'SS Lazio', 'Lazio',
  'ACF Fiorentina', 'Fiorentina', 'Bologna FC 1909', 'Bologna', 'Torino FC', 'Torino',
  'Genoa CFC', 'Genoa', 'Udinese Calcio', 'Udinese', 'AC Monza', 'Monza',
  'Hellas Verona', 'Verona', 'Cagliari Calcio', 'Cagliari', 'Empoli FC', 'Empoli',
  'US Lecce', 'Lecce', 'Parma Calcio 1913', 'Parma', 'Como 1907', 'Como', 'Venezia FC', 'Venezia',
  'US Salernitana 1919', 'Salernitana', 'US Sassuolo Calcio', 'Sassuolo', 'Frosinone Calcio'
];

db.all("SELECT id, name, currentTeam, league, country, stats, history FROM Players WHERE userId IS NULL", [], (err, rows) => {
  if (err) { console.error(err); process.exit(1); }
  
  const sPlayers = rows.filter(r => {
    const l = (r.league || '').toLowerCase();
    const c = (r.country || '').toLowerCase();
    const t = (r.currentTeam || '');
    return serieaTerms.some(term => l.includes(term)) || c === 'italy' || serieaClubs.some(club => t.toLowerCase() === club.toLowerCase());
  });

  console.log(`Total Serie A Players found in DB: ${sPlayers.length}`);
  
  const leagues = {};
  const teams = {};
  sPlayers.forEach(p => {
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
