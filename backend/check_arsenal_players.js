const { sequelize, Player } = require('./database');
const { Op } = require('sequelize');

async function checkPlayers() {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB');
    
    const names = ['degaard', 'Foden', 'Rice', 'Saka', 'Saliba'];
    
    for (const search of names) {
      const rows = await Player.findAll({
        where: { name: { [Op.like]: `%${search}%` } },
        attributes: ['id', 'name', 'nationality', 'currentTeam', 'position', 'overallRating', 'photoId']
      });
      console.log(`\n=== Search: "${search}" (${rows.length} found) ===`);
      if (rows.length > 0) {
        rows.forEach(r => {
          const d = r.toJSON();
          console.log(`  id=${d.id}, name="${d.name}", team="${d.currentTeam}", pos="${d.position}", overall=${d.overallRating}, photoId="${d.photoId}"`);
        });
      } else {
        console.log('  NOT FOUND');
      }
    }
    
    process.exit(0);
  } catch(e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}

checkPlayers();
