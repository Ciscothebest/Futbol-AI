const { Sequelize } = require('sequelize');

async function main() {
  const mssql = new Sequelize('FutbolAI', 'football_user', 'FootballPassword123!', {
    dialect: 'mssql',
    host: 'localhost',
    port: 1433,
    dialectOptions: { options: { encrypt: false, trustServerCertificate: true } },
    logging: false
  });

  try {
    await mssql.authenticate();
    const [rows] = await mssql.query("SELECT * FROM Players WHERE name LIKE '%Gravenberch%' OR id LIKE '%gravenberch%'");
    console.log(`Found ${rows.length} players matching Gravenberch:`);
    rows.forEach(p => {
      console.log(`Player: ${p.name} (${p.id})`);
      console.log(`  Team: ${p.currentTeam}, League: ${p.league}, Rating: ${p.overallRating}`);
      console.log(`  photoId: ${p.photoId}`);
      console.log(`  stats: ${p.stats}`);
      console.log(`  history: ${p.history}`);
      console.log(`  bio: ${p.bio}`);
      console.log(`  bioEs: ${p.bioEs}`);
      console.log('-'.repeat(40));
    });
  } catch (e) {
    console.error(e);
  } finally {
    await mssql.close();
  }
}

main();
