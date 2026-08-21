const path = require('path');
const { Player, sequelize } = require('./database');

async function checkLaLigaMatchBounds() {
  await sequelize.authenticate();
  const players = await Player.findAll({ where: { league: 'La Liga' } });

  let invalidMatchesCount = 0;
  let maxMatchesFound = 0;

  players.forEach(p => {
    let s = p.stats;
    if (typeof s === 'string') {
      try { s = JSON.parse(s); } catch(e){}
    }
    const m = s ? parseInt(s.matches, 10) : 0;
    if (m > maxMatchesFound) maxMatchesFound = m;
    if (m > 38) invalidMatchesCount++;
  });

  console.log(`La Liga Players Audit:`);
  console.log(`- Total La Liga Players: ${players.length}`);
  console.log(`- Max La Liga Matches Found: ${maxMatchesFound} (Limit: 38)`);
  console.log(`- Players exceeding 38 matches limit: ${invalidMatchesCount}`);
  process.exit(0);
}

checkLaLigaMatchBounds().catch(err => { console.error(err); process.exit(1); });
