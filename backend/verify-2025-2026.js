const path = require('path');
const { Player, sequelize } = require('./database');

async function verifyUpdate() {
  await sequelize.authenticate();
  const players = await Player.findAll({ where: { league: 'La Liga' } });
  console.log(`Total La Liga players verified: ${players.length}`);

  let validStatsCount = 0;
  let validHistoryCount = 0;

  players.forEach(p => {
    let statsObj = p.stats;
    if (typeof statsObj === 'string') {
      try { statsObj = JSON.parse(statsObj); } catch(e){}
    }
    let historyArr = p.history;
    if (typeof historyArr === 'string') {
      try { historyArr = JSON.parse(historyArr); } catch(e){}
    }

    if (statsObj && statsObj.season === '2025-26') {
      validStatsCount++;
    }

    if (Array.isArray(historyArr) && historyArr.length > 0) {
      const last = historyArr[historyArr.length - 1];
      if (last && last.season === '2025/26') {
        validHistoryCount++;
      }
    }
  });

  console.log(`Players with stats.season = 2025-26: ${validStatsCount} / ${players.length}`);
  console.log(`Players with history latest season = 2025/26: ${validHistoryCount} / ${players.length}`);

  // Sample check
  const sample = players[0];
  console.log('\n--- Sample Player (Verified) ---');
  console.log('Name:', sample.name);
  console.log('Stats:', sample.stats);
  console.log('CareerTotals:', sample.careerTotals);

  process.exit(0);
}

verifyUpdate().catch(err => { console.error(err); process.exit(1); });
