const fs = require('fs');
const path = require('path');
const { Player, sequelize } = require('./database');

async function exportPLPlayers() {
  const players = await Player.findAll({
    where: {
      league: 'Premier League'
    }
  });

  console.log(`Found ${players.length} players with league = Premier League`);
  const list = players.map(p => ({
    id: p.id,
    name: p.name,
    currentTeam: p.currentTeam,
    position: p.position,
    photoId: p.photoId,
    age: p.age,
    nationality: p.nationality
  }));

  fs.writeFileSync(path.join(__dirname, 'pl_players_list.json'), JSON.stringify(list, null, 2));
  console.log('Saved to pl_players_list.json');
}

exportPLPlayers().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
