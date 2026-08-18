const { sequelize, Team } = require('./database');
const fs = require('fs');

const statsDict = JSON.parse(fs.readFileSync('C:/Users/franc/.gemini/antigravity/brain/ce3c8ebf-1c83-446a-918f-0e5c2bc2e0cb/scratch/stats_dictionary.json', 'utf8'));

async function seedTeams() {
  try {
    await sequelize.sync();
    console.log("Database connected and synced.");

    let inserted = 0;
    let updated = 0;

    for (const [teamName, stats] of Object.entries(statsDict)) {
      const [team, created] = await Team.findOrCreate({
        where: { name: teamName },
        defaults: {
          name: teamName,
          leagueName: 'Primera División',
          country: 'Internacional',
          position: typeof stats.pos === 'number' ? stats.pos : parseInt(stats.pos) || 1,
          pj: stats.matches,
          g: stats.g || 0,
          e: stats.e || 0,
          p: stats.p || 0,
          gf: stats.goals,
          gc: stats.gc || 0,
          pts: (stats.g || 0) * 3 + (stats.e || 0),
          xg: String(stats.xG || '0.0')
        }
      });

      if (!created) {
        await team.update({
          position: typeof stats.pos === 'number' ? stats.pos : parseInt(stats.pos) || 1,
          pj: stats.matches,
          g: stats.g || 0,
          e: stats.e || 0,
          p: stats.p || 0,
          gf: stats.goals,
          gc: stats.gc || 0,
          pts: (stats.g || 0) * 3 + (stats.e || 0),
          xg: String(stats.xG || '0.0')
        });
        updated++;
      } else {
        inserted++;
      }
    }

    console.log(`Teams seed complete: ${inserted} inserted, ${updated} updated.`);
    process.exit(0);
  } catch (err) {
    console.error("Error seeding teams:", err);
    process.exit(1);
  }
}

seedTeams();
