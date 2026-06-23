const { sequelize, League, Team } = require('../backend/database');

async function test() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connection has been established successfully.');
    
    const leagueCount = await League.count();
    const teamCount = await Team.count();
    console.log(`Leagues in DB: ${leagueCount}`);
    console.log(`Teams in DB: ${teamCount}`);
    
    if (teamCount > 0) {
      const sampleTeams = await Team.findAll({ limit: 5 });
      console.log('Sample Teams:', sampleTeams.map(t => ({ name: t.name, country: t.country, leagueName: t.leagueName })));
    }
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  } finally {
    await sequelize.close();
  }
}

test();
