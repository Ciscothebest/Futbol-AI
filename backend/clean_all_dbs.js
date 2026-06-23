const { Sequelize } = require('sequelize');

const mssql = new Sequelize('master', 'football_user', 'FootballPassword123!', {
  dialect: 'mssql', host: 'localhost', port: 1433,
  dialectOptions: { options: { encrypt: false, trustServerCertificate: true } },
  logging: false
});

const invalidIds = ['cole-palmer','bukayo-saka','martin-odegaard','declan-rice','phil-foden','william-saliba','gabriel-martinelli','bruno-guimaraes','ollie-watkins'];

async function run() {
  const [dbs] = await mssql.query(
    "SELECT name FROM sys.databases WHERE name NOT IN ('master','tempdb','model','msdb')"
  );
  console.log('All custom databases:');

  for (const db of dbs) {
    const dbConn = new Sequelize(db.name, 'football_user', 'FootballPassword123!', {
      dialect: 'mssql', host: 'localhost', port: 1433,
      dialectOptions: { options: { encrypt: false, trustServerCertificate: true } },
      logging: false
    });
    try {
      const [[{ cnt }]] = await dbConn.query('SELECT COUNT(*) as cnt FROM Players');
      const [existing] = await dbConn.query(
        `SELECT id FROM Players WHERE id IN (${invalidIds.map(id => `'${id}'`).join(',')})`
      );
      console.log(` - ${db.name}: ${cnt} players, invalid found: ${existing.length}`);
      if (existing.length > 0) {
        const deleted = await dbConn.query(
          `DELETE FROM Players WHERE id IN (${invalidIds.map(id => `'${id}'`).join(',')})`
        );
        const [[{after}]] = await dbConn.query('SELECT COUNT(*) as after FROM Players');
        console.log(`   ✅ Deleted ${existing.length} invalid. New total: ${after}`);
      }
    } catch(e) {
      console.log(` - ${db.name}: ERROR - ${e.message.split('\n')[0]}`);
    }
    await dbConn.close();
  }
  await mssql.close();
}

run().catch(e => { console.error(e.message); process.exit(1); });
