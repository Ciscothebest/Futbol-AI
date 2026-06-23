const { Sequelize, DataTypes } = require('../backend/node_modules/sequelize');
const path = require('path');

async function testSqlite() {
  console.log('🔍 Running Database Schema Inspection for SQLite Fallback Database File...');
  
  const dbPath = path.join(__dirname, '../backend/database.sqlite');
  console.log('SQLite File Path:', dbPath);

  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: false
  });

  try {
    await sequelize.authenticate();
    console.log('✅ Connection to SQLite database file authenticated successfully.');

    const queryInterface = sequelize.getQueryInterface();
    const tables = await queryInterface.showAllTables();
    console.log('Tables in SQLite database:', tables);

    for (const t of tables) {
      console.log(`\n--- Columns in Table: ${t} ---`);
      const info = await queryInterface.describeTable(t).catch(() => null);
      if (!info) {
        console.log(`Table ${t} describe failed.`);
        continue;
      }
      for (const [col, details] of Object.entries(info)) {
        console.log(`  - ${col}: Type: ${details.type}`);
      }
    }

    console.log('\n🏆 SQLITE DATABASE FILE INSPECTED SUCCESSFULLY!');

  } catch (err) {
    console.error('❌ SQLite diagnostic error:', err);
  } finally {
    await sequelize.close();
  }
}

testSqlite();
