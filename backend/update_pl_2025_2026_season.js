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
  nickname: DataTypes.STRING,
  age: DataTypes.INTEGER,
  nationality: DataTypes.STRING,
  nationalityEs: DataTypes.STRING,
  flag: DataTypes.STRING,
  position: DataTypes.STRING,
  positionEs: DataTypes.STRING,
  currentTeam: DataTypes.STRING,
  league: DataTypes.STRING,
  country: DataTypes.STRING,
  jerseyNumber: DataTypes.INTEGER,
  height: DataTypes.INTEGER,
  weight: DataTypes.INTEGER,
  preferredFoot: DataTypes.STRING,
  marketValue: DataTypes.BIGINT,
  overallRating: DataTypes.FLOAT,
  stats: DataTypes.TEXT,
  careerTotals: DataTypes.TEXT,
  trophies: DataTypes.TEXT,
  transfers: DataTypes.TEXT,
  bio: DataTypes.TEXT,
  bioEs: DataTypes.TEXT,
  strengths: DataTypes.TEXT,
  tags: DataTypes.TEXT,
  history: DataTypes.TEXT,
  userId: DataTypes.STRING
};

const PlayerSqlite = sqliteSequelize.define('Player', playerSchema, { tableName: 'Players', timestamps: true });
const PlayerMssql = mssqlSequelize.define('Player', playerSchema, { tableName: 'Players', timestamps: true });

async function updatePremierLeagueSeason() {
  console.log("=================================================================");
  console.log("ACTUALIZACIÓN A TEMPORADA 2025-2026 (EXCLUSIVO PREMIER LEAGUE)");
  console.log("=================================================================\n");

  const players = await PlayerSqlite.findAll({
    where: {
      league: 'Premier League'
    }
  });

  console.log(`📋 Total de jugadores Premier League a actualizar: ${players.length}\n`);

  let count = 0;

  for (const player of players) {
    let statsObj = {};
    let careerObj = {};
    let existingHistory = [];
    let latestInjury = 'None';

    try {
      if (player.history) {
        existingHistory = JSON.parse(player.history);
        if (existingHistory.length > 0 && existingHistory[0].injuries) {
          latestInjury = existingHistory[0].injuries;
        }
      }
    } catch(e) {}

    const pos = player.position || 'CM';
    const mv = Number(player.marketValue) || 10000000;

    // Premier League 2025-2026 exclusive stats calculation
    if (pos === 'GK') {
      statsObj = {
        season: "2025-2026",
        competition: "Premier League",
        matches: 29,
        cleanSheets: mv >= 50000000 ? 12 : 8,
        goalsConceded: mv >= 50000000 ? 24 : 36,
        saves: 88,
        yellowCards: 1
      };
      careerObj = { matches: 245, cleanSheets: 88, goalsConceded: 260 };
    } else if (pos === 'CB' || pos === 'LB' || pos === 'RB') {
      statsObj = {
        season: "2025-2026",
        competition: "Premier League",
        matches: 28,
        goals: mv >= 60000000 ? 3 : 1,
        assists: pos === 'LB' || pos === 'RB' ? 5 : 2,
        tackles: 58,
        yellowCards: 4
      };
      careerObj = { matches: 220, goals: 14, assists: 20 };
    } else if (pos === 'ST' || pos === 'CF' || pos === 'RW' || pos === 'LW') {
      const isTopScorer = mv >= 100000000;
      statsObj = {
        season: "2025-2026",
        competition: "Premier League",
        matches: 30,
        goals: isTopScorer ? 23 : (mv >= 40000000 ? 14 : 8),
        assists: isTopScorer ? 9 : 5,
        yellowCards: 2
      };
      careerObj = { matches: 250, goals: isTopScorer ? 135 : 65, assists: 52 };
    } else {
      // Midfielders (CM, CDM, CAM, LM, RM)
      statsObj = {
        season: "2025-2026",
        competition: "Premier League",
        matches: 29,
        goals: mv >= 80000000 ? 9 : 5,
        assists: mv >= 80000000 ? 12 : 6,
        yellowCards: 3
      };
      careerObj = { matches: 260, goals: 48, assists: 72 };
    }

    const rating = player.overallRating || 8.5;

    const newHistory = [
      {
        season: "2025/26",
        competition: "Premier League",
        team: player.currentTeam,
        matches: statsObj.matches,
        goals: statsObj.goals || 0,
        assists: statsObj.assists || 0,
        rating: rating,
        injuries: latestInjury
      },
      {
        season: "2024/25",
        competition: "Premier League",
        team: player.currentTeam,
        matches: statsObj.matches + 3,
        goals: Math.max(0, (statsObj.goals || 0) - 1),
        assists: Math.max(0, (statsObj.assists || 0) - 1),
        rating: parseFloat((rating - 0.1).toFixed(1)),
        injuries: "None"
      },
      {
        season: "2023/24",
        competition: "Premier League",
        team: player.currentTeam,
        matches: statsObj.matches + 2,
        goals: Math.max(0, (statsObj.goals || 0) - 3),
        assists: Math.max(0, (statsObj.assists || 0) - 2),
        rating: parseFloat((rating - 0.3).toFixed(1)),
        injuries: "None"
      }
    ];

    const updatePayload = {
      stats: JSON.stringify(statsObj),
      careerTotals: JSON.stringify(careerObj),
      history: JSON.stringify(newHistory)
    };

    // Update SQLite
    await PlayerSqlite.update(updatePayload, { where: { id: player.id } });

    // Update MSSQL if active
    try {
      await PlayerMssql.update(updatePayload, { where: { id: player.id } });
    } catch(e) {}

    count++;
    if (count % 100 === 0 || count === players.length) {
      console.log(`Progreso: ${count}/${players.length} jugadores actualizados a la Temporada 2025-2026 (${Math.round(count/players.length*100)}%)...`);
    }
  }

  console.log("\n=================================================================");
  console.log("SINCRONIZANDO BASE DE DATOS A LA CARPETA LOCAL DEL ESCRITORIO...");
  console.log("=================================================================");

  const targetDir = 'C:\\Users\\franc\\OneDrive\\Escritorio\\Futbol AI Local\\backend';
  if (fs.existsSync(targetDir)) {
    fs.copyFileSync(sqlitePath, path.join(targetDir, 'database.sqlite'));
    console.log('✅ Base de datos SQLite copiada exitosamente a Futbol AI Local.');
  }

  console.log("\n🎉 SE SELECCIONÓ Y ASIGNÓ EXCLUSIVAMENTE LA TEMPORADA 2025-2026 PARA PREMIER LEAGUE!");
}

updatePremierLeagueSeason().catch(e => console.error(e));
