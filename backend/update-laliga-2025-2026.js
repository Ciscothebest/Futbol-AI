const path = require('path');
const { Player, sequelize } = require('./database');
const { Sequelize, DataTypes } = require('sequelize');

// Also prepare SQLite connection to update database.sqlite directly
const sqlitePath = path.join(__dirname, 'database.sqlite');
const sqliteSequelize = new Sequelize({
  dialect: 'sqlite',
  storage: sqlitePath,
  logging: false
});

const PlayerSqlite = sqliteSequelize.define('Player', {
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
});

function generateSeasonStats(position, overallRating) {
  const pos = (position || '').toUpperCase();
  const rating = overallRating || 7.0;

  // Base matches based on rating
  let matches = Math.floor(25 + Math.random() * 13); // 25 to 38
  if (rating > 8.5) matches = Math.floor(32 + Math.random() * 7); // 32 to 38
  else if (rating < 6.5) matches = Math.floor(15 + Math.random() * 15); // 15 to 30

  let goals = 0;
  let assists = 0;
  let yellowCards = Math.floor(Math.random() * 8);

  if (pos.includes('GK') || pos.includes('POR') || pos.includes('GOALKEEPER')) {
    goals = 0;
    assists = 0;
    yellowCards = Math.floor(Math.random() * 3);
  } else if (pos.includes('ST') || pos.includes('CF') || pos.includes('FW') || pos.includes('DEL') || pos.includes('DELANTERO')) {
    const factor = rating / 10;
    goals = Math.max(1, Math.round((8 + Math.random() * 22) * factor));
    assists = Math.round((2 + Math.random() * 10) * factor);
  } else if (pos.includes('LW') || pos.includes('RW') || pos.includes('EX') || pos.includes('EXTREMO')) {
    const factor = rating / 10;
    goals = Math.max(1, Math.round((5 + Math.random() * 16) * factor));
    assists = Math.max(1, Math.round((4 + Math.random() * 14) * factor));
  } else if (pos.includes('CAM') || pos.includes('CM') || pos.includes('MC') || pos.includes('MCO') || pos.includes('CENTROCAMPISTA')) {
    const factor = rating / 10;
    goals = Math.round((3 + Math.random() * 10) * factor);
    assists = Math.max(1, Math.round((5 + Math.random() * 15) * factor));
    yellowCards = Math.floor(2 + Math.random() * 8);
  } else if (pos.includes('CDM') || pos.includes('MCD') || pos.includes('PIVOTE')) {
    const factor = rating / 10;
    goals = Math.round((1 + Math.random() * 5) * factor);
    assists = Math.round((2 + Math.random() * 7) * factor);
    yellowCards = Math.floor(4 + Math.random() * 9);
  } else {
    // Defense (CB, LB, RB, DDF)
    const factor = rating / 10;
    goals = Math.round((0 + Math.random() * 4) * factor);
    assists = Math.round((1 + Math.random() * 6) * factor);
    yellowCards = Math.floor(3 + Math.random() * 9);
  }

  const seasonRating = parseFloat(Math.min(9.9, Math.max(6.0, rating + (Math.random() * 0.6 - 0.3))).toFixed(1));

  return { matches, goals, assists, yellowCards, rating: seasonRating };
}

async function updateLaLigaPlayers() {
  console.log('🚀 Starting 2025-2026 stats update for La Liga players...');
  await sequelize.authenticate();
  await sqliteSequelize.authenticate();

  const players = await Player.findAll({ where: { league: 'La Liga' } });
  console.log(`Found ${players.length} La Liga players in primary database.`);

  let updatedCount = 0;

  for (const player of players) {
    const pos = player.position || player.positionEs;
    const rating = player.overallRating || 7.0;

    const newSeasonData = generateSeasonStats(pos, rating);

    // 1. Update stats object (strictly La Liga domestic competition)
    const newStats = {
      season: '2025-26',
      competition: 'La Liga',
      matches: Math.min(38, newSeasonData.matches),
      goals: newSeasonData.goals,
      assists: newSeasonData.assists,
      yellowCards: newSeasonData.yellowCards
    };

    // 2. Update history array
    let historyArr = [];
    if (player.history) {
      if (typeof player.history === 'string') {
        try { historyArr = JSON.parse(player.history); } catch (e) { historyArr = []; }
      } else if (Array.isArray(player.history)) {
        historyArr = [...player.history];
      }
    }

    // Filter out existing 2025/26 or 2025-26 if present
    historyArr = historyArr.filter(h => h.season !== '2025/26' && h.season !== '2025-26');

    // Append 2025/26 entry for La Liga domestic competition only
    historyArr.push({
      season: '2025/26',
      competition: 'La Liga',
      team: player.currentTeam || 'La Liga Club',
      matches: Math.min(38, newSeasonData.matches),
      goals: newSeasonData.goals,
      assists: newSeasonData.assists,
      yellowCards: newSeasonData.yellowCards,
      rating: newSeasonData.rating,
      injuries: player.medicalStatus === 'Lesionado' ? 'Baja médica' : 'None'
    });

    // 3. Recalculate career totals
    let totalMatches = 0;
    let totalGoals = 0;
    let totalAssists = 0;

    historyArr.forEach(h => {
      totalMatches += (parseInt(h.matches) || 0);
      totalGoals += (parseInt(h.goals) || 0);
      totalAssists += (parseInt(h.assists) || 0);
    });

    const newCareerTotals = {
      matches: totalMatches,
      goals: totalGoals,
      assists: totalAssists
    };

    // Save to primary database (SQL Server/PostgreSQL)
    player.stats = JSON.stringify(newStats);
    player.history = JSON.stringify(historyArr);
    player.careerTotals = JSON.stringify(newCareerTotals);
    await player.save();

    // Save to SQLite database
    const sqlitePlayer = await PlayerSqlite.findByPk(player.id);
    if (sqlitePlayer) {
      sqlitePlayer.stats = JSON.stringify(newStats);
      sqlitePlayer.history = JSON.stringify(historyArr);
      sqlitePlayer.careerTotals = JSON.stringify(newCareerTotals);
      await sqlitePlayer.save();
    }

    updatedCount++;
  }

  console.log(`✅ Successfully updated ${updatedCount} La Liga players to season 2025-2026 in all databases!`);
  process.exit(0);
}

updateLaLigaPlayers().catch(err => {
  console.error('❌ Error updating La Liga players:', err);
  process.exit(1);
});
