const { sequelize, Team } = require('../backend/database');

async function test() {
  try {
    await sequelize.authenticate();
    const counts = await Team.findAll({
      attributes: ['country', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['country'],
      order: [['country', 'ASC']]
    });
    
    console.log('Country team counts:');
    const lowCountCountries = [];
    counts.forEach(c => {
      const country = c.country;
      const count = c.getDataValue('count');
      console.log(`${country}: ${count}`);
      if (count < 3) {
        lowCountCountries.push({ country, count });
      }
    });
    
    console.log('\nCountries with less than 3 teams:', lowCountCountries);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

test();
