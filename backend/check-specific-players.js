const { Sequelize } = require('sequelize');

process.env.DB_DIALECT = 'sqlite';
process.env.DB_HOST = '';

async function main() {
  const { Player, sequelize } = require('./database');
  
  // Search for these players by name fragments
  const searches = ['Palmer', 'Odegaard', 'Ødegaard', 'Saliba', 'Porro'];
  
  for (const name of searches) {
    const [rows] = await sequelize.query(
      `SELECT id, name, photoId, currentTeam FROM Players WHERE name LIKE '%${name}%'`
    );
    if (rows.length) {
      rows.forEach(r => console.log(`  ${r.id} | ${r.name} | photoId=${r.photoId} | ${r.currentTeam}`));
    } else {
      console.log(`  [NOT FOUND] ${name}`);
    }
  }
  
  // Also check total count
  const total = await Player.count();
  console.log(`\nTotal: ${total} players`);
  
  await sequelize.close();
}

main().catch(e => console.error(e.message));
