const { sequelize, Team } = require('../backend/database');

async function test() {
  try {
    await sequelize.authenticate();
    const countries = await Team.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('country')), 'country']],
      order: [['country', 'ASC']]
    });
    console.log('Distinct countries in DB:');
    console.log(countries.map(c => c.country).join(', '));
    
    // Check Argentina teams
    const argTeams = await Team.findAll({
      where: { country: 'Argentina' },
      limit: 10
    });
    console.log('\nSample Argentina Teams:');
    console.log(argTeams.map(t => t.name).join(', '));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

test();
