const { sequelize, League, Team } = require('./database');
const inventoryData = require('./leagues_teams_data');

async function seedLeaguesAndTeams(force = false) {
  console.log("🌱 Database Seeding: Syncing leagues and teams tables...");
  
  // Guarantee tables exist with updated schema
  await League.sync({ force: force });
  await Team.sync({ force: force });

  const existingLeaguesCount = await League.count();
  const existingTeamsCount = await Team.count();
  if (!force && existingLeaguesCount === 79 && existingTeamsCount === 1205) {
    console.log(`✅ Leagues and teams already seeded (${existingLeaguesCount} leagues, ${existingTeamsCount} teams). Skipping.`);
    return;
  }

  const leagueEntries = Object.entries(inventoryData);
  console.log(`🚀 Seeding ${leagueEntries.length} leagues and their teams with full season stats...`);

  // Clear existing leagues & teams to ensure fresh state
  await Team.destroy({ where: {} });
  await League.destroy({ where: {} });

  for (const [countryKey, item] of leagueEntries) {
    try {
      // Create League record
      await League.create({
        name: item.league,
        country: countryKey,
        flagIso: item.flagIso
      });

      if (!item.teams || item.teams.length === 0) {
        console.log(`  - Seeded ${countryKey} (${item.league}) with 0 teams (e.g. non-existent league).`);
        continue;
      }

      // Add teams in bulk
      const teamRecords = item.teams.map(t => ({
        name: t.name,
        leagueName: item.league,
        country: countryKey,
        position: t.position || 0,
        pj: t.pj || 0,
        g: t.g || 0,
        e: t.e || 0,
        p: t.p || 0,
        gf: t.gf || 0,
        gc: t.gc || 0,
        pts: t.pts !== null && t.pts !== undefined ? t.pts : 0
      }));

      await Team.bulkCreate(teamRecords);
      console.log(`  - Seeded ${countryKey} (${item.league}) with ${teamRecords.length} teams.`);
    } catch (err) {
      console.error(`  ❌ Error seeding ${countryKey}:`, err);

    }
  }

  console.log("🏁 League and Team database seeding completed successfully!");
}

module.exports = seedLeaguesAndTeams;

if (require.main === module) {
  seedLeaguesAndTeams(true)
    .then(() => {
      console.log("Seeding script finished.");
      process.exit(0);
    })
    .catch(err => {
      console.error("Seeding script error:", err);
      process.exit(1);
    });
}


