const { sequelize } = require('../backend/database');

async function checkLogSchemas() {
  console.log('🔍 Running Database Schema Inspection for Log Tables...');
  try {
    await sequelize.authenticate();
    const queryInterface = sequelize.getQueryInterface();

    const tables = ['query_logs', 'comparison_logs', 'favorite_logs'];
    
    for (const t of tables) {
      console.log(`\n--- Inspecting Table: ${t} ---`);
      const info = await queryInterface.describeTable(t).catch(() => null);
      if (!info) {
        console.log(`⚠️ Table ${t} does not exist in the database!`);
        continue;
      }
      
      // Print column names and types
      for (const [col, details] of Object.entries(info)) {
        console.log(`  - ${col}: Type: ${details.type}, AllowNull: ${details.allowNull}, PrimaryKey: ${details.primaryKey}`);
      }
    }
    
    console.log('\n--- Checking User ID type in users table ---');
    const userInfo = await queryInterface.describeTable('users');
    console.log(`  - id: Type: ${userInfo.id.type}, AllowNull: ${userInfo.id.allowNull}`);

  } catch (err) {
    console.error('❌ Diagnostic error:', err);
  } finally {
    await sequelize.close();
  }
}

checkLogSchemas();
