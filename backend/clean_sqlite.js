const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

const invalidIds = ['cole-palmer','bukayo-saka','martin-odegaard','declan-rice','phil-foden','william-saliba','gabriel-martinelli','bruno-guimaraes','ollie-watkins'];

const sqlitePaths = [
  'c:\\Users\\franc\\.gemini\\antigravity\\scratch\\football-ai-platform\\backend\\database.sqlite',
  'C:\\Users\\franc\\OneDrive\\Escritorio\\Futbol AI Local\\backend\\database.sqlite',
  'C:\\Users\\franc\\OneDrive\\Escritorio\\Futbol AI producción\\backend\\database.sqlite',
];

async function run() {
  for (const sqlitePath of sqlitePaths) {
    if (!fs.existsSync(sqlitePath)) {
      console.log(`⚠️  Not found: ${sqlitePath}`);
      continue;
    }
    const db = new Sequelize({ dialect: 'sqlite', storage: sqlitePath, logging: false });
    try {
      const [[{ cnt }]] = await db.query('SELECT COUNT(*) as cnt FROM Players');
      const [existing] = await db.query(
        `SELECT id FROM Players WHERE id IN (${invalidIds.map(id => `'${id}'`).join(',')})`
      );
      const label = sqlitePath.includes('scratch') ? 'workspace' : sqlitePath.includes('producción') || sqlitePath.includes('producci') ? 'producción' : 'local';
      console.log(`SQLite [${label}]: ${cnt} players, invalid found: ${existing.length}`);
      if (existing.length > 0) {
        await db.query(`DELETE FROM Players WHERE id IN (${invalidIds.map(id => `'${id}'`).join(',')})`);
        const [[{after}]] = await db.query('SELECT COUNT(*) as after FROM Players');
        console.log(`  ✅ Deleted ${existing.length}. New total: ${after}`);
      }
    } catch(e) {
      console.log(`  ERROR: ${e.message.split('\n')[0]}`);
    }
    await db.close();
  }
}
run().catch(e => { console.error(e.message); process.exit(1); });
