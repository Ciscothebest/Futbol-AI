const { sequelize } = require('./database');
const fs = require('fs');
const path = require('path');

async function dumpFullSchema() {
  try {
    await sequelize.authenticate();
    console.log('Connected to Database');

    const [tables] = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_CATALOG = 'FutbolAI'
      ORDER BY TABLE_NAME;
    `);

    const result = {};

    for (const t of tables) {
      const tableName = t.TABLE_NAME;

      const [columns] = await sequelize.query(`
        SELECT 
          c.COLUMN_NAME,
          c.DATA_TYPE,
          c.CHARACTER_MAXIMUM_LENGTH,
          c.IS_NULLABLE,
          c.COLUMN_DEFAULT,
          pk.CONSTRAINT_NAME as IS_PRIMARY_KEY
        FROM INFORMATION_SCHEMA.COLUMNS c
        LEFT JOIN (
          SELECT ku.TABLE_NAME, ku.COLUMN_NAME, tc.CONSTRAINT_NAME
          FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
          JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE ku ON tc.CONSTRAINT_NAME = ku.CONSTRAINT_NAME
          WHERE tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
        ) pk ON c.TABLE_NAME = pk.TABLE_NAME AND c.COLUMN_NAME = pk.COLUMN_NAME
        WHERE c.TABLE_NAME = '${tableName}'
        ORDER BY c.ORDINAL_POSITION;
      `);

      const [fks] = await sequelize.query(`
        SELECT 
          fk.name AS constraint_name,
          tp.name AS parent_table,
          cp.name AS parent_column,
          tr.name AS referenced_table,
          cr.name AS referenced_column
        FROM sys.foreign_keys fk
        INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
        INNER JOIN sys.tables tp ON fkc.parent_object_id = tp.object_id
        INNER JOIN sys.columns cp ON fkc.parent_object_id = cp.object_id AND fkc.parent_column_id = cp.column_id
        INNER JOIN sys.tables tr ON fkc.referenced_object_id = tr.object_id
        INNER JOIN sys.columns cr ON fkc.referenced_object_id = cr.object_id AND fkc.referenced_column_id = cr.column_id
        WHERE tp.name = '${tableName}';
      `);

      result[tableName] = {
        columns,
        foreignKeys: fks
      };
    }

    fs.writeFileSync(path.join(__dirname, 'schema_full.json'), JSON.stringify(result, null, 2), 'utf8');
    console.log('Full schema dumped with total tables:', Object.keys(result).length);
  } catch (e) {
    console.error('Error dumping schema:', e);
  } finally {
    await sequelize.close();
  }
}

dumpFullSchema();
