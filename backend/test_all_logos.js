const { Team, League, sequelize } = require('./database');
const fs = require('fs');

async function testAllLogos() {
  await sequelize.authenticate();
  console.log("Diagnosing logo resolution for all 79 leagues and 1205 teams...");

  const leagues = await League.findAll({ raw: true });
  const teams = await Team.findAll({ raw: true });

  console.log(`Loaded ${leagues.length} leagues and ${teams.length} teams from DB.`);
  
  // Let's check how many teams have mapped or resolvable logos
  const teamResults = [];
  for (const t of teams) {
    teamResults.push({
      id: t.id,
      name: t.name,
      country: t.country,
      league: t.leagueName
    });
  }

  console.log("Sample 10 teams:", teamResults.slice(0, 10));
  process.exit(0);
}

testAllLogos().catch(err => {
  console.error(err);
  process.exit(1);
});
