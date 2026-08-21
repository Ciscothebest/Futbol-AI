const path = require('path');
const { Player, sequelize } = require('./database');

async function verifyLaLigaCompetitionScope() {
  await sequelize.authenticate();
  const players = await Player.findAll({ where: { league: 'La Liga' } });
  console.log(`Total La Liga players verified: ${players.length}`);

  let validCompCount = 0;
  let maxMatches = 0;

  players.forEach(p => {
    let statsObj = p.stats;
    if (typeof statsObj === 'string') {
      try { statsObj = JSON.parse(statsObj); } catch(e){}
    }

    const m = statsObj ? parseInt(statsObj.matches, 10) : 0;
    if (m > maxMatches) maxMatches = m;

    if (statsObj && statsObj.competition === 'La Liga' && m <= 38) {
      validCompCount++;
    }
  });

  console.log(`Players scoped strictly to domestic La Liga (max 38 matches): ${validCompCount} / ${players.length}`);
  console.log(`Maximum matches in season 2025-26: ${maxMatches} (Limit: 38 jornadas)`);

  const sample = players[0];
  console.log('\n--- Sample Player Verified ---');
  console.log('Name:', sample.name);
  console.log('Stats:', sample.stats);

  process.exit(0);
}

verifyLaLigaCompetitionScope().catch(err => { console.error(err); process.exit(1); });
