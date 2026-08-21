const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

async function dumpAllPlayersToJson() {
  console.log("=========================================================================");
  console.log("ACTUALIZANDO BACKEND/KNOWLEDGE/PLAYERS.JSON CON LOS 3,236 JUGADORES");
  console.log("=========================================================================\n");

  const sqlitePath = path.join(__dirname, 'database.sqlite');
  const db = new sqlite3.Database(sqlitePath);

  const players = await new Promise((resolve, reject) => {
    db.all("SELECT * FROM Players WHERE userId IS NULL", [], (err, rows) => err ? reject(err) : resolve(rows));
  });

  console.log(`📌 Extraídos ${players.length} jugadores profesionales de la base de datos.`);

  const formattedPlayers = players.map(p => {
    let stats = p.stats;
    if (typeof stats === 'string') { try { stats = JSON.parse(stats); } catch(e) {} }

    let careerTotals = p.careerTotals;
    if (typeof careerTotals === 'string') { try { careerTotals = JSON.parse(careerTotals); } catch(e) {} }

    let trophies = p.trophies;
    if (typeof trophies === 'string') { try { trophies = JSON.parse(trophies); } catch(e) {} }

    let transfers = p.transfers;
    if (typeof transfers === 'string') { try { transfers = JSON.parse(transfers); } catch(e) {} }

    let strengths = p.strengths;
    if (typeof strengths === 'string') { try { strengths = JSON.parse(strengths); } catch(e) {} }

    let tags = p.tags;
    if (typeof tags === 'string') { try { tags = JSON.parse(tags); } catch(e) {} }

    let history = p.history;
    if (typeof history === 'string') { try { history = JSON.parse(history); } catch(e) {} }

    return {
      ...p,
      stats,
      careerTotals,
      trophies,
      transfers,
      strengths,
      tags,
      history
    };
  });

  const jsonPath = path.join(__dirname, 'knowledge', 'players.json');
  fs.writeFileSync(jsonPath, JSON.stringify(formattedPlayers, null, 2), 'utf8');
  console.log(`✅ Archivo backend/knowledge/players.json actualizado con ${formattedPlayers.length} jugadores.`);

  // Sync to Desktop folder
  const desktopJsonPath = 'C:\\Users\\franc\\OneDrive\\Escritorio\\Futbol AI Local\\backend\\knowledge\\players.json';
  if (fs.existsSync(path.dirname(desktopJsonPath))) {
    fs.copyFileSync(jsonPath, desktopJsonPath);
    console.log(`✅ players.json copiado a carpeta del escritorio.`);
  }

  process.exit(0);
}

dumpAllPlayersToJson().catch(err => {
  console.error("Error dumping players to json:", err);
  process.exit(1);
});
