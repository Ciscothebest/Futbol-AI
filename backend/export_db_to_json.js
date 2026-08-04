const { League, Team, sequelize } = require('./database');
const fs = require('fs');

async function exportData() {
  await sequelize.authenticate();
  console.log("Connected to database. Fetching leagues and teams...");
  
  const leagues = await League.findAll({
    order: [['country', 'ASC']],
    raw: true
  });
  
  const teams = await Team.findAll({
    order: [['leagueName', 'ASC'], ['position', 'ASC'], ['name', 'ASC']],
    raw: true
  });
  
  console.log(`Fetched ${leagues.length} leagues and ${teams.length} teams.`);
  
  // Group teams by league/country
  const leagueMap = [];
  for (const l of leagues) {
    const lTeams = teams.filter(t => t.country === l.country || t.leagueName === l.name);
    leagueMap.append ? null : null;
    leagueMap.push({
      id: l.id,
      name: l.name,
      country: l.country,
      flagIso: l.flagIso,
      teamsCount: lTeams.length,
      teams: lTeams.map(t => ({
        id: t.id,
        name: t.name,
        position: t.position,
        pj: t.pj,
        g: t.g,
        e: t.e,
        p: t.p,
        gf: t.gf,
        gc: t.gc,
        pts: t.pts
      }))
    });
  }
  
  fs.writeFileSync('db_full_inventory.json', JSON.stringify(leagueMap, null, 2), 'utf-8');
  console.log("Exported db_full_inventory.json successfully!");
  process.exit(0);
}

exportData().catch(err => {
  console.error("Error exporting data:", err);
  process.exit(1);
});
