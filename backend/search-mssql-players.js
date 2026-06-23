const { Sequelize } = require('sequelize');

async function main() {
  const mssql = new Sequelize('FutbolAI', 'football_user', 'FootballPassword123!', {
    dialect: 'mssql', host: 'localhost', port: 1433,
    dialectOptions: { options: { encrypt: false, trustServerCertificate: true } },
    logging: false
  });

  const searches = ['Palmer', 'Odegaard', 'Saliba', 'Porro', 'Estupinan', 'Lunin', 'Ceballos', 'Rudiger'];
  
  for (const name of searches) {
    const [rows] = await mssql.query(
      `SELECT id, name, photoId, currentTeam FROM Players WHERE name LIKE '%${name}%'`
    );
    if (rows.length) {
      rows.forEach(r => console.log(`  ${r.id} | ${r.name} | photoId=${r.photoId} | ${r.currentTeam}`));
    } else {
      console.log(`  [NOT IN MSSQL] ${name}`);
    }
  }
  
  await mssql.close();
}

main().catch(e => console.error(e.message));
