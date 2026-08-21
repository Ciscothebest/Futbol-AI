const { sequelize, Player } = require('./database');
const fs = require('fs');
const path = require('path');

async function checkValues() {
  await sequelize.sync();
  const dbPlayers = await Player.findAll({ where: { userId: null } });
  console.log(`Total players in SQLite DB: ${dbPlayers.length}`);

  const over220M = dbPlayers.filter(p => p.marketValue > 220000000);
  console.log(`Players with marketValue > €220M: ${over220M.length}`);
  over220M.forEach(p => {
    console.log(`- ID: ${p.id} | Name: ${p.name} | Team: ${p.currentTeam} | MarketValue: €${(p.marketValue / 1000000).toFixed(1)}M`);
  });

  const top15 = [...dbPlayers].sort((a, b) => (b.marketValue || 0) - (a.marketValue || 0)).slice(0, 25);
  console.log('\nTop 25 players by marketValue in DB:');
  top15.forEach((p, i) => {
    console.log(`${i + 1}. ${p.name} (${p.currentTeam}): €${((p.marketValue || 0) / 1000000).toFixed(1)}M`);
  });

  process.exit(0);
}

checkValues();
