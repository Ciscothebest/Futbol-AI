const { sequelize } = require('../backend/database');

async function printColumns() {
  console.log('🔍 Querying columns of payments table directly in SQL Server...');
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to SQL Server.');

    // Query column information directly from SQL Server system catalog
    const [columns] = await sequelize.query(`
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'payments'
    `);

    console.log('\n--- Columns found in database catalog for payments table ---');
    columns.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME} (${col.DATA_TYPE}${col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : ''})`);
    });

  } catch (err) {
    console.error('❌ SQL Server query failed:', err);
  } finally {
    await sequelize.close();
  }
}

printColumns();
