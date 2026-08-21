const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { Player, sequelize } = require('./database');

async function inspectBundesligaPhotos() {
  console.log("=========================================================================");
  console.log("INSPECCIONANDO PHOTO_ID DE JUGADORES DE BUNDESLIGA EN DB");
  console.log("=========================================================================\n");

  const sqlitePath = path.join(__dirname, 'database.sqlite');
  const db = new sqlite3.Database(sqlitePath);

  const targetNames = ['Aarón Anselmino', 'Aaron Zehnter', 'Abdoulaye Faye', 'Abdoulie Ceesay', 'Adam Daghim', 'Adam Dźwigała'];

  db.all(`SELECT id, name, currentTeam, league, photoId, marketValue FROM Players WHERE name IN (${targetNames.map(n => `'${n.replace(/'/g, "''")}'`).join(',')})`, [], async (err, rows) => {
    if (err) console.error("SQLite Error:", err);
    else {
      console.log("📋 Resultados en SQLite:");
      console.table(rows);
    }

    try {
      await sequelize.authenticate();
      const [mssqlRows] = await sequelize.query(`SELECT id, name, currentTeam, league, photoId, marketValue FROM Players WHERE name IN (${targetNames.map(n => `'${n.replace(/'/g, "''")}'`).join(',')})`);
      console.log("\n📋 Resultados en SQL Server (MSSQL):");
      console.table(mssqlRows);
    } catch(e) {
      console.error("MSSQL Error:", e.message);
    }

    process.exit(0);
  });
}

inspectBundesligaPhotos().catch(err => {
  console.error("Error inspecting photos:", err);
  process.exit(1);
});
