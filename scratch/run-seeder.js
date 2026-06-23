const seedLeaguesAndTeams = require('../backend/seed-db-onboarding');
const { sequelize, League, Team } = require('../backend/database');

async function run() {
  try {
    await sequelize.authenticate();
    console.log("Connected to database successfully. Force syncing tables...");
    
    // Force sync to recreate tables with the correct non-unique league name constraints
    await League.sync({ force: true });
    await Team.sync({ force: true });
    
    await seedLeaguesAndTeams();
    console.log("Seeding complete. Exiting...");
    process.exit(0);
  } catch (err) {
    console.error("Error running seeder:", err);
    process.exit(1);
  }
}

run();
