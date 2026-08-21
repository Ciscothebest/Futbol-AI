const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'));

const plTeams = [
  'Arsenal', 'Aston Villa', 'Bournemouth', 'Brentford', 'Brighton & Hove Albion',
  'Chelsea', 'Crystal Palace', 'Everton', 'Fulham', 'Ipswich Town',
  'Leicester City', 'Liverpool', 'Manchester City', 'Manchester United',
  'Newcastle United', 'Nottingham Forest', 'Southampton', 'Tottenham Hotspur',
  'West Ham United', 'Wolverhampton Wanderers'
];

db.all("SELECT id, name, currentTeam, league, stats, history, transfers, marketValue, position, photoId FROM Players WHERE userId IS NULL", [], (err, rows) => {
  if (err) { console.error(err); process.exit(1); }
  
  const plPlayers = rows.filter(r => r.league === 'Premier League' || r.league === 'premier-league' || plTeams.includes(r.currentTeam));
  console.log(`Total PL Players found: ${plPlayers.length}`);

  let missing2025Stats = 0;
  let missing2025History = 0;
  let teamCounts = {};
  let playersNeedingUpdate = [];

  plPlayers.forEach(p => {
    teamCounts[p.currentTeam] = (teamCounts[p.currentTeam] || 0) + 1;
    let s = {};
    try { s = typeof p.stats === 'string' ? JSON.parse(p.stats) : (p.stats || {}); } catch(e) {}
    let h = [];
    try { h = typeof p.history === 'string' ? JSON.parse(p.history) : (p.history || []); } catch(e) {}
    let t = [];
    try { t = typeof p.transfers === 'string' ? JSON.parse(p.transfers) : (p.transfers || []); } catch(e) {}

    const has2025Stats = (s.season === '2025-26' || s.season === '2025/26');
    const has2025History = Array.isArray(h) && h.length > 0 && (h[0].season === '2025/26' || h[0].season === '2025-26');

    if (!has2025Stats) missing2025Stats++;
    if (!has2025History) missing2025History++;

    if (!has2025Stats || !has2025History || h.length < 10) {
      playersNeedingUpdate.push({ id: p.id, name: p.name, team: p.currentTeam, league: p.league, has2025Stats, has2025History, historyLength: h.length });
    }
  });

  console.log(`Players missing 2025-26 in stats: ${missing2025Stats}`);
  console.log(`Players missing 2025-26 in top of history: ${missing2025History}`);
  console.log(`Players with history length < 10 or missing 2025-26: ${playersNeedingUpdate.length}`);
  console.log('\nBreakdown by team:');
  Object.entries(teamCounts).sort((a,b) => b[1] - a[1]).forEach(([team, cnt]) => {
    console.log(`  - ${team}: ${cnt} players`);
  });

  if (playersNeedingUpdate.length > 0) {
    console.log('\nSample players needing update (first 10):');
    playersNeedingUpdate.slice(0, 10).forEach(p => {
      console.log(`  * ${p.name} (${p.team} - ${p.league}) -> 2025Stats: ${p.has2025Stats}, 2025History: ${p.has2025History}, HistoryLength: ${p.historyLength}`);
    });
  }

  process.exit(0);
});
