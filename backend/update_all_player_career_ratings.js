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

function calculateCareerAverageRating(historyData, fallbackRating) {
  let historyArr = historyData;
  if (typeof historyArr === 'string') {
    try { historyArr = JSON.parse(historyArr); } catch (e) { historyArr = []; }
  }

  if (Array.isArray(historyArr) && historyArr.length > 0) {
    const validRatings = historyArr
      .map(h => parseFloat(h.rating))
      .filter(r => !isNaN(r) && r > 0);

    if (validRatings.length > 0) {
      const sum = validRatings.reduce((a, b) => a + b, 0);
      const avg = sum / validRatings.length;
      return parseFloat(avg.toFixed(1));
    }
  }

  const rawFallback = parseFloat(fallbackRating);
  if (!isNaN(rawFallback) && rawFallback > 0) {
    return parseFloat(rawFallback.toFixed(1));
  }

  return 7.0;
}

async function updateAllCareerRatings() {
  console.log('🚀 Recalculating career average ratings for ALL players in database...\n');
  await sequelize.authenticate();
  await sqliteSequelize.authenticate();

  const players = await Player.findAll();
  console.log(`📋 Total players to process: ${players.length}\n`);

  let updatedCount = 0;

  for (const player of players) {
    const newCareerAvgRating = calculateCareerAverageRating(player.history, player.overallRating);

    // Save to primary database (SQL Server/PostgreSQL)
    player.overallRating = newCareerAvgRating;
    await player.save();

    // Save to SQLite database
    const sqlitePlayer = await PlayerSqlite.findByPk(player.id);
    if (sqlitePlayer) {
      sqlitePlayer.overallRating = newCareerAvgRating;
      await sqlitePlayer.save();
    }

    updatedCount++;
  }

  console.log(`✅ Successfully updated overallRating to exact career average for ${updatedCount} players in all databases!`);

  // Verify Abde Ezzalzouli
  const abde = await Player.findOne({ where: { name: 'Abde Ezzalzouli' } });
  if (abde) {
    console.log('\n--- Verification: Abde Ezzalzouli ---');
    console.log(`Abde Ezzalzouli updated overallRating: ${abde.overallRating} ⭐ (Exact career average)`);
  }

  process.exit(0);
}

updateAllCareerRatings().catch(err => {
  console.error('❌ Error updating player career ratings:', err);
  process.exit(1);
});
