const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { Player, sequelize } = require('./database');

async function unifyLDF() {
  console.log("=========================================================================");
  console.log("UNIFICANDO NOMBRE DE LIGA DE LDF EN SQLITE Y SQL SERVER");
  console.log("=========================================================================\n");

  const canonicalName = 'LDF (Liga Dominicana de Fútbol)';

  // 1. Unify SQLite
  const sqlitePath = path.join(__dirname, 'database.sqlite');
  const db = new sqlite3.Database(sqlitePath);

  await new Promise((resolve, reject) => {
    db.run("UPDATE Players SET league = ? WHERE league = 'LDF' OR league = 'ldf'", [canonicalName], (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
  console.log("✅ SQLite actualizado: todos los registros de LDF consolidados como 'LDF (Liga Dominicana de Fútbol)'.");

  // 2. Unify SQL Server (MSSQL)
  await sequelize.authenticate();
  const [res] = await sequelize.query(`UPDATE Players SET league = '${canonicalName}' WHERE league = 'LDF' OR league = 'ldf'`);
  console.log("✅ SQL Server actualizado: todos los registros de LDF consolidados.");

  // Check counts
  const [ldfCountSqlite] = await new Promise((resolve, reject) => {
    db.get("SELECT COUNT(*) as count FROM Players WHERE league = ?", [canonicalName], (err, row) => err ? reject(err) : resolve([row.count]));
  });

  const [ldfCountMSSQL] = await sequelize.query(`SELECT COUNT(*) as count FROM Players WHERE league = '${canonicalName}'`);

  console.log(`\n📊 Conteo total de jugadores LDF unificados:`);
  console.log(`- En SQLite: ${ldfCountSqlite}`);
  console.log(`- En SQL Server: ${ldfCountMSSQL[0].count}`);

  // Copy updated sqlite to Desktop folder
  const fs = require('fs');
  const desktopDbPath = 'C:\\Users\\franc\\OneDrive\\Escritorio\\Futbol AI Local\\backend\\database.sqlite';
  if (fs.existsSync(path.dirname(desktopDbPath))) {
    fs.copyFileSync(sqlitePath, desktopDbPath);
    console.log(`✅ database.sqlite copiado a carpeta del escritorio.`);
  }

  process.exit(0);
}

unifyLDF().catch(err => {
  console.error("Error unificando LDF:", err);
  process.exit(1);
});
