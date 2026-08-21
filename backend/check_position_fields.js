const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { Player, sequelize } = require('./database');

async function checkPositionFields() {
  console.log("=========================================================================");
  console.log("AUDITORÍA DE POSICIÓN Y TRADUCCIÓN TRANSFERMARKT (POSITION / POSITIONES)");
  console.log("=========================================================================\n");

  const sqlitePath = path.join(__dirname, 'database.sqlite');
  const db = new sqlite3.Database(sqlitePath);

  db.all("SELECT id, name, currentTeam, league, position, positionEs FROM Players WHERE userId IS NULL LIMIT 15", [], (err, rows) => {
    if (err) {
      console.error("Error querying SQLite:", err);
    } else {
      console.log("📋 Muestra de Posiciones extraídas de Transfermarkt:");
      console.table(rows);
    }
    process.exit(0);
  });
}

checkPositionFields().catch(err => {
  console.error("Error in checkPositionFields:", err);
  process.exit(1);
});
