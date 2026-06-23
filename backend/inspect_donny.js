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
    const [rows] = await mssql.query("SELECT * FROM Players WHERE id = 'donny-gravenberch'");
    if (rows.length > 0) {
      console.log('Donny Gravenberch columns:');
      const p = rows[0];
      Object.entries(p).forEach(([col, val]) => {
        console.log(`  ${col}: type=${typeof val}, value=${JSON.stringify(val)}`);
      });
    } else {
      console.log('Donny Gravenberch not found!');
    }
  } catch (e) {
    console.error(e);
  } finally {
    await mssql.close();
  }
}

main();
