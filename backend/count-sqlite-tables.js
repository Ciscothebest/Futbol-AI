const { Sequelize } = require('sequelize');

const seq = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false
});

async function main() {
  try {
    const [tables] = await seq.query("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('Tables:', tables.map(t => t.name).join(', '));
    
    for (const t of tables) {
      try {
        const [cnt] = await seq.query(`SELECT COUNT(*) as cnt FROM "${t.name}"`);
        console.log(`  ${t.name}: ${cnt[0].cnt} rows`);
      } catch(e) {
        console.log(`  ${t.name}: error - ${e.message}`);
      }
    }
  } catch(e) {
    console.error(e.message);
  } finally {
    await seq.close();
  }
}

main();
