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

// IDs to DELETE (the newer duplicates added during migration — keep the originals)
const toDelete = [
  'guimaraes-bruno',    // duplicate of bruno-guimaraes
  'saka-bukayo',        // duplicate of bukayo-saka
  'palmer-cole',        // duplicate of cole-palmer
  'rice-declan',        // duplicate of declan-rice
  'martin-gabriel',     // duplicate of gabriel-martinelli
  'odegaard-martin',    // duplicate of martin-odegaard
  'watkins-ollie',      // duplicate of ollie-watkins
  'foden-phil',         // duplicate of phil-foden
  'saliba-william',     // duplicate of william-saliba
];

async function removeDuplicates() {
  await seq.authenticate();

  const [[{ before }]] = await seq.query('SELECT COUNT(*) AS before FROM players');
  console.log('Jugadores antes:', before);

  for (const id of toDelete) {
    const [[row]] = await seq.query(`SELECT name FROM players WHERE id = '${id}'`);
    if (row) {
      await seq.query(`DELETE FROM players WHERE id = '${id}'`);
      console.log(`  ✅ Eliminado: ${id} (${row.name})`);
    } else {
      console.log(`  ⚠️  No encontrado: ${id}`);
    }
  }

  const [[{ after }]] = await seq.query('SELECT COUNT(*) AS after FROM players');
  console.log('\nJugadores después:', after);
  console.log('Duplicados eliminados:', before - after);

  // Verify no more duplicates
  const [dupes] = await seq.query(`
    SELECT name, COUNT(*) AS cnt FROM players
    GROUP BY name HAVING COUNT(*) > 1
  `);
  if (dupes.length === 0) console.log('✅ Sin duplicados restantes.');
  else console.log('⚠️  Aún hay duplicados:', dupes.map(d => d.name).join(', '));

  await seq.close();
}

removeDuplicates().catch(console.error);
