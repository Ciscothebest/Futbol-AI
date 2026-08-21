const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { Player, sequelize } = require('./database');

async function checkPlayerPhotos() {
  console.log("=========================================================================");
  console.log("AUDITORÍA DE PHOTO_ID Y CAMPOS EN JUGADORES (SQLITE Y SQL SERVER)");
  console.log("=========================================================================\n");

  const sqlitePath = path.join(__dirname, 'database.sqlite');
  const db = new sqlite3.Database(sqlitePath);

  // 1. SQLite Audit
  db.all(`
    SELECT league, 
           COUNT(*) as total, 
           COUNT(photoId) as withPhotoId,
           COUNT(CASE WHEN photoId IS NOT NULL AND photoId != '' THEN 1 END) as validPhotoId,
           COUNT(CASE WHEN stats IS NOT NULL AND stats != '' THEN 1 END) as withStats,
           COUNT(CASE WHEN history IS NOT NULL AND history != '' THEN 1 END) as withHistory
    FROM Players 
    WHERE userId IS NULL 
    GROUP BY league
  `, [], async (err, rows) => {
    if (err) { console.error("SQLite Audit Error:", err); }
    else {
      console.log("📊 SQLite Player Fields Breakdown by League:");
      console.table(rows);

      // Sample players with missing photoId
      db.all("SELECT id, name, currentTeam, league, photoId, marketValue FROM Players WHERE userId IS NULL AND (photoId IS NULL OR photoId = '') LIMIT 10", [], (err, sampleMissing) => {
        console.log("\n🔍 Muestra de jugadores sin photoId en SQLite:", sampleMissing);
      });

      db.all("SELECT id, name, currentTeam, league, photoId, marketValue FROM Players WHERE userId IS NULL AND photoId IS NOT NULL AND photoId != '' LIMIT 10", [], (err, sampleWithPhoto) => {
        console.log("\n🔍 Muestra de jugadores CON photoId en SQLite:", sampleWithPhoto);
      });
    }

    // 2. MSSQL Audit
    try {
      await sequelize.authenticate();
      const [mssqlRows] = await sequelize.query(`
        SELECT league, 
               COUNT(*) as total, 
               COUNT(photoId) as withPhotoId,
               SUM(CASE WHEN photoId IS NOT NULL AND photoId != '' THEN 1 ELSE 0 END) as validPhotoId,
               SUM(CASE WHEN stats IS NOT NULL AND stats != '' THEN 1 ELSE 0 END) as withStats,
               SUM(CASE WHEN history IS NOT NULL AND history != '' THEN 1 ELSE 0 END) as withHistory
        FROM Players 
        WHERE userId IS NULL 
        GROUP BY league
      `);
      console.log("\n📊 SQL Server (MSSQL) Player Fields Breakdown by League:");
      console.table(mssqlRows);
    } catch(e) {
      console.error("MSSQL Audit Error:", e.message);
    }

    process.exit(0);
  });
}

checkPlayerPhotos().catch(err => {
  console.error("Error in checkPlayerPhotos:", err);
  process.exit(1);
});
