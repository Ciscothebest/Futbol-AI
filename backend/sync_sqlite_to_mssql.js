const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { Player, sequelize } = require('./database');

async function syncSQLiteToMSSQL() {
  console.log("=========================================================================");
  console.log("FUTBOL AI PLATFORM - SINCRONIZACIÓN DE SQLITE A SQL SERVER (MSSQL)");
  console.log("=========================================================================\n");

  await sequelize.authenticate();
  console.log("✅ Conectado a la base de datos configurada en el servidor (Sequelize/MSSQL/SQLite)");

  const sqlitePath = path.join(__dirname, 'database.sqlite');
  const sqliteDb = new sqlite3.Database(sqlitePath);

  const sqlitePlayers = await new Promise((resolve, reject) => {
    sqliteDb.all("SELECT * FROM Players", [], (err, rows) => err ? reject(err) : resolve(rows));
  });

  console.log(`📌 Se encontraron ${sqlitePlayers.length} jugadores en SQLite.`);

  let insertedCount = 0;
  let updatedCount = 0;

  for (let i = 0; i < sqlitePlayers.length; i++) {
    const p = sqlitePlayers[i];
    
    // Parse JSON fields if necessary
    let statsObj = p.stats;
    if (typeof statsObj === 'string') { try { statsObj = JSON.parse(statsObj); } catch(e) {} }
    
    let historyObj = p.history;
    if (typeof historyObj === 'string') { try { historyObj = JSON.parse(historyObj); } catch(e) {} }

    let careerTotalsObj = p.careerTotals;
    if (typeof careerTotalsObj === 'string') { try { careerTotalsObj = JSON.parse(careerTotalsObj); } catch(e) {} }

    let trophiesObj = p.trophies;
    if (typeof trophiesObj === 'string') { try { trophiesObj = JSON.parse(trophiesObj); } catch(e) {} }

    let transfersObj = p.transfers;
    if (typeof transfersObj === 'string') { try { transfersObj = JSON.parse(transfersObj); } catch(e) {} }

    let strengthsObj = p.strengths;
    if (typeof strengthsObj === 'string') { try { strengthsObj = JSON.parse(strengthsObj); } catch(e) {} }

    let tagsObj = p.tags;
    if (typeof tagsObj === 'string') { try { tagsObj = JSON.parse(tagsObj); } catch(e) {} }

    const playerPayload = {
      id: p.id,
      name: p.name,
      photoId: p.photoId,
      nickname: p.nickname,
      age: p.age ? parseInt(p.age, 10) : null,
      nationality: p.nationality,
      nationalityEs: p.nationalityEs,
      flag: p.flag,
      position: p.position,
      positionEs: p.positionEs,
      currentTeam: p.currentTeam,
      league: p.league,
      country: p.country,
      jerseyNumber: p.jerseyNumber ? parseInt(p.jerseyNumber, 10) : null,
      height: p.height,
      weight: p.weight,
      preferredFoot: p.preferredFoot,
      marketValue: p.marketValue ? parseFloat(p.marketValue) : null,
      stats: typeof statsObj === 'object' ? JSON.stringify(statsObj) : statsObj,
      careerTotals: typeof careerTotalsObj === 'object' ? JSON.stringify(careerTotalsObj) : careerTotalsObj,
      trophies: typeof trophiesObj === 'object' ? JSON.stringify(trophiesObj) : trophiesObj,
      transfers: typeof transfersObj === 'object' ? JSON.stringify(transfersObj) : transfersObj,
      bio: p.bio,
      bioEs: p.bioEs,
      strengths: typeof strengthsObj === 'object' ? JSON.stringify(strengthsObj) : strengthsObj,
      tags: typeof tagsObj === 'object' ? JSON.stringify(tagsObj) : tagsObj,
      history: typeof historyObj === 'object' ? JSON.stringify(historyObj) : historyObj,
      userId: p.userId || null
    };

    const existing = await Player.findByPk(p.id);
    if (existing) {
      await existing.update(playerPayload);
      updatedCount++;
    } else {
      await Player.create(playerPayload);
      insertedCount++;
    }

    if ((i + 1) % 250 === 0 || i === sqlitePlayers.length - 1) {
      console.log(` Sincronizados [${i + 1}/${sqlitePlayers.length}] jugadores...`);
    }
  }

  console.log(`\n🎉 SINCRONIZACIÓN EXITOSA DE BASE DE DATOS:`);
  console.log(`- Jugadores insertados nuevos: ${insertedCount}`);
  console.log(`- Jugadores actualizados: ${updatedCount}`);
  console.log(`- Total de jugadores en base de datos de producción: ${await Player.count()}`);

  process.exit(0);
}

syncSQLiteToMSSQL().catch(err => {
  console.error("Error sincronizando bases de datos:", err);
  process.exit(1);
});
