const { sequelize } = require('../backend/database');

async function checkPlayersSchema() {
  console.log('🔍 Running Database Schema Inspection for players Table...');
  try {
    await sequelize.authenticate();
    const queryInterface = sequelize.getQueryInterface();

    console.log('\n--- Inspecting Table: players ---');
    const info = await queryInterface.describeTable('players').catch(() => null);
    if (!info) {
      console.log('⚠️ Table players does not exist!');
      return;
    }
    
    // Print column names and types
    for (const [col, details] of Object.entries(info)) {
      console.log(`  - ${col}: Type: ${details.type}, AllowNull: ${details.allowNull}, PrimaryKey: ${details.primaryKey}`);
    }

  } catch (err) {
    console.error('❌ Diagnostic error:', err);
  } finally {
    await sequelize.close();
  }
}

checkPlayersSchema();
