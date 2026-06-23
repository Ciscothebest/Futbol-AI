const { Player, sequelize } = require('../backend/database');

async function run() {
  try {
    await sequelize.authenticate();
    const leagues = await Player.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('league')), 'league']],
      raw: true
    });
    console.log("LEAGUES IN DATABASE:", leagues);
    
    // Also get distinct countries or nationalities
    const nats = await Player.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('nationality')), 'nationality']],
      raw: true
    });
    console.log("NATIONALITIES IN DATABASE:", nats.map(n => n.nationality));
    
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

run();
