const path = require('path');
const { Player, sequelize } = require('./database');

async function inspectAbdeRating() {
  await sequelize.authenticate();
  const player = await Player.findOne({ where: { name: 'Abde Ezzalzouli' } });

  if (player) {
    console.log('--- Abde Ezzalzouli ---');
    console.log('Current DB overallRating:', player.overallRating);
    let historyArr = player.history;
    if (typeof historyArr === 'string') {
      try { historyArr = JSON.parse(historyArr); } catch(e){}
    }
    console.log('History:', JSON.stringify(historyArr, null, 2));

    if (Array.isArray(historyArr) && historyArr.length > 0) {
      const validRatings = historyArr.map(h => parseFloat(h.rating)).filter(r => !isNaN(r) && r > 0);
      const sum = validRatings.reduce((a, b) => a + b, 0);
      const avg = validRatings.length > 0 ? (sum / validRatings.length) : player.overallRating;
      console.log(`Calculated Average Rating across ${validRatings.length} seasons: ${avg.toFixed(1)} (Sum: ${sum}, Count: ${validRatings.length})`);
    }
  } else {
    console.log('Player Abde Ezzalzouli not found by exact name, searching like %Abde%...');
    const match = await Player.findAll({ where: { name: { [sequelize.Sequelize.Op.like]: '%Abde%' } } });
    match.forEach(p => console.log(`Found: ${p.name} (id: ${p.id})`));
  }
  process.exit(0);
}

inspectAbdeRating().catch(err => { console.error(err); process.exit(1); });
