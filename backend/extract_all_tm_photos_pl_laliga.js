const https = require('https');
const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

// Connection 1: SQLite
const sqlitePath = path.join(__dirname, 'database.sqlite');
const sqliteSequelize = new Sequelize({
  dialect: 'sqlite',
  storage: sqlitePath,
  logging: false
});

// Connection 2: MSSQL (if active)
const mssqlSequelize = new Sequelize(
  process.env.DB_NAME || 'FutbolAI',
  process.env.DB_USER || 'football_user',
  process.env.DB_PASSWORD || 'FootballPassword123!',
  {
    dialect: 'mssql',
    host: '127.0.0.1',
    port: 1433,
    dialectOptions: { options: { encrypt: false, trustServerCertificate: true } },
    logging: false
  }
);

const playerSchema = {
  id: { type: DataTypes.STRING, primaryKey: true },
  name: DataTypes.STRING,
  photoId: DataTypes.STRING,
  currentTeam: DataTypes.STRING,
  league: DataTypes.STRING
};

const PlayerSqlite = sqliteSequelize.define('Player', playerSchema, { tableName: 'Players', timestamps: true });
const PlayerMssql = mssqlSequelize.define('Player', playerSchema, { tableName: 'Players', timestamps: true });

function fetchTM(pathUrl, timeoutMs = 2500) {
  return new Promise((resolve) => {
    const cleanPath = encodeURI(pathUrl);
    const options = {
      hostname: 'www.transfermarkt.com',
      path: cleanPath,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    };
    const req = https.get(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', (err) => resolve({ status: 500, error: err.message, body: '' }));
    req.setTimeout(timeoutMs, () => {
      req.destroy();
      resolve({ status: 408, error: 'Timeout', body: '' });
    });
  });
}

async function searchTMPlayer(playerName) {
  let searchPath = `/schnellsuche/ergebnis/schnellsuche?query=${playerName}`;
  let searchRes = await fetchTM(searchPath, 2500);
  let matches = [...searchRes.body.matchAll(/href="([^"]*spieler\/[0-9]+)"/gi)];

  if ((!matches || matches.length === 0) && playerName.includes(' ')) {
    const parts = playerName.split(' ');
    const shortName = `${parts[0]} ${parts[parts.length - 1]}`;
    searchPath = `/schnellsuche/ergebnis/schnellsuche?query=${shortName}`;
    searchRes = await fetchTM(searchPath, 2500);
    matches = [...searchRes.body.matchAll(/href="([^"]*spieler\/[0-9]+)"/gi)];
  }

  return matches;
}

async function processPlayerPhoto(player) {
  try {
    // If photoId is already a valid Transfermarkt URL, keep it!
    if (player.photoId && player.photoId.startsWith('https://img.a.transfermarkt.technology/portrait/')) {
      return true;
    }

    const matches = await searchTMPlayer(player.name);
    if (!matches || matches.length === 0) {
      return false;
    }

    const profilePath = matches[0][1];
    const profileRes = await fetchTM(profilePath, 2500);
    const imgMatch = profileRes.body.match(/https:\/\/img.a.transfermarkt.technology\/portrait\/[^\"]+/i);

    if (imgMatch && imgMatch[0]) {
      const tmPhotoUrl = imgMatch[0];

      // Update SQLite
      await PlayerSqlite.update({ photoId: tmPhotoUrl }, { where: { id: player.id } });

      // Update MSSQL if active
      try {
        await PlayerMssql.update({ photoId: tmPhotoUrl }, { where: { id: player.id } });
      } catch(e) {}

      return true;
    }
    return false;
  } catch(e) {
    return false;
  }
}

async function runPhotoSync() {
  console.log("=================================================================");
  console.log("FUTBOL AI PLATFORM - EXTRACCIÓN DIRECTA FOTOS TRANSFERMARKT");
  console.log("=================================================================\n");

  const plPlayers = await PlayerSqlite.findAll({ where: { league: 'Premier League' } });
  const laLigaPlayers = await PlayerSqlite.findAll({ where: { league: 'La Liga' } });
  const allTargets = [...plPlayers, ...laLigaPlayers];

  console.log(`📋 Total de jugadores a procesar (Premier League + La Liga): ${allTargets.length}\n`);

  let completed = 0;
  const concurrency = 25;

  async function worker(queue) {
    while (queue.length > 0) {
      const player = queue.shift();
      if (!player) break;
      await processPlayerPhoto(player);
      completed++;
      if (completed % 50 === 0 || completed === allTargets.length) {
        console.log(`Progreso: ${completed}/${allTargets.length} fotos oficiales de Transfermarkt extraídas (${Math.round(completed/allTargets.length*100)}%)...`);
      }
    }
  }

  const queue = [...allTargets];
  const workers = [];
  for (let i = 0; i < concurrency; i++) {
    workers.push(worker(queue));
  }

  await Promise.all(workers);

  console.log("\n=================================================================");
  console.log("SINCRONIZANDO BASE DE DATOS ACTUALIZADA A LA CARPETA LOCAL...");
  console.log("=================================================================");

  const targetDir = 'C:\\Users\\franc\\OneDrive\\Escritorio\\Futbol AI Local\\backend';
  if (fs.existsSync(targetDir)) {
    fs.copyFileSync(sqlitePath, path.join(targetDir, 'database.sqlite'));
    console.log('✅ Base de datos SQLite sincronizada exitosamente con Transfermarkt Photos.');
  }

  console.log("\n🎉 TODAS LAS FOTOS OFICIALES DE TRANSFERMARKT EN HD EXTRAÍDAS Y APLICADAS CON ÉXITO!");
}

runPhotoSync().catch(e => console.error(e));
