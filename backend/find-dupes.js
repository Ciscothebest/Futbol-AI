require('dotenv').config();
const { Sequelize } = require('sequelize');

const seq = new Sequelize(
  process.env.DB_NAME     || 'FutbolAI',
  process.env.DB_USER     || 'football_user',
  process.env.DB_PASSWORD || 'FootballPassword123!',
  {
    dialect: 'mssql',
    host:    process.env.DB_HOST || 'localhost',
    port:    parseInt(process.env.DB_PORT || '1433'),
    dialectOptions: { options: { encrypt: false, trustServerCertificate: true } },
    logging: false
  }
);

async function main() {
  await seq.authenticate();

  // 1. Duplicados por ID exacto (misma PK repetida)
  const [byId] = await seq.query(`
    SELECT id, name, COUNT(*) AS cnt
    FROM players
    GROUP BY id, name
    HAVING COUNT(*) > 1
    ORDER BY cnt DESC
  `);
  console.log('=== DUPLICADOS POR ID ===');
  if (byId.length === 0) console.log('  Ninguno');
  else byId.forEach(r => console.log(`  ID: ${r.id} | Nombre: ${r.name} | Copias: ${r.cnt}`));

  // 2. Duplicados por NOMBRE (distintos IDs)
  const [byName] = await seq.query(`
    SELECT name, COUNT(*) AS cnt
    FROM players
    GROUP BY name
    HAVING COUNT(*) > 1
    ORDER BY cnt DESC
  `);
  console.log('\n=== DUPLICADOS POR NOMBRE (distintos IDs) ===');
  if (byName.length === 0) console.log('  Ninguno');
  else {
    for (const r of byName) {
      const [rows] = await seq.query(
        `SELECT id, name, overallRating, currentTeam, createdAt FROM players WHERE name = '${r.name.replace(/'/g,"''")}' ORDER BY createdAt`
      );
      console.log(`  Nombre: "${r.name}" | ${r.cnt} registros:`);
      rows.forEach(p => console.log(`    - ID: ${p.id} | Equipo: ${p.currentTeam} | Rating: ${p.overallRating} | Creado: ${p.createdAt}`));
    }
  }

  const [[{ total }]] = await seq.query('SELECT COUNT(*) AS total FROM players');
  console.log(`\nTotal en SQL Server: ${total}`);
  await seq.close();
}

main().catch(console.error);
