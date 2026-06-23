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
    console.log('Connected to MSSQL');

    // Fetch players created recently
    const [players] = await mssql.query(`
      SELECT TOP 10 id, name, trophies, transfers 
      FROM Players 
      WHERE createdAt >= '2026-06-14 00:00:00'
    `);

    console.log('Sample of new players trophies/transfers:');
    players.forEach(p => {
      console.log(`Player: ${p.name} (${p.id})`);
      console.log(`  Trophies: type=${typeof p.trophies}, val=${JSON.stringify(p.trophies)}`);
      console.log(`  Transfers: type=${typeof p.transfers}, val=${JSON.stringify(p.transfers)}`);
      console.log('-'.repeat(30));
    });

  } catch (e) {
    console.error(e);
  } finally {
    await mssql.close();
  }
}

main();
