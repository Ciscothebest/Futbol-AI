const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

// Setup connections
const sqlitePath = path.join(__dirname, 'database.sqlite');
const sqliteSequelize = new Sequelize({
  dialect: 'sqlite',
  storage: sqlitePath,
  logging: false
});

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

async function main() {
  console.log("--- Checking SQLite Players ---");
  let plSqlite = [];
  try {
    const allSqlite = await PlayerSqlite.findAll();
    plSqlite = allSqlite.filter(p => 
      (p.league && (p.league.includes('Premier') || p.league.includes('Eng'))) ||
      ['Arsenal', 'Aston Villa', 'Bournemouth', 'Brentford', 'Brighton', 'Brighton & Hove Albion',
       'Chelsea', 'Crystal Palace', 'Everton', 'Fulham', 'Ipswich', 'Ipswich Town', 'Leicester',
       'Leicester City', 'Liverpool', 'Manchester City', 'Manchester United', 'Newcastle',
       'Newcastle United', 'Nottingham Forest', 'Southampton', 'Tottenham', 'Tottenham Hotspur',
       'West Ham', 'West Ham United', 'Wolverhampton', 'Wolverhampton Wanderers'].includes(p.currentTeam)
    );
    console.log(`SQLite total players: ${allSqlite.length}, Premier League players found: ${plSqlite.length}`);
  } catch (e) {
    console.error("SQLite error:", e.message);
  }

  console.log("\n--- Checking MSSQL Players ---");
  let plMssql = [];
  try {
    await mssqlSequelize.authenticate();
    const allMssql = await PlayerMssql.findAll();
    plMssql = allMssql.filter(p => 
      (p.league && (p.league.includes('Premier') || p.league.includes('Eng'))) ||
      ['Arsenal', 'Aston Villa', 'Bournemouth', 'Brentford', 'Brighton', 'Brighton & Hove Albion',
       'Chelsea', 'Crystal Palace', 'Everton', 'Fulham', 'Ipswich', 'Ipswich Town', 'Leicester',
       'Leicester City', 'Liverpool', 'Manchester City', 'Manchester United', 'Newcastle',
       'Newcastle United', 'Nottingham Forest', 'Southampton', 'Tottenham', 'Tottenham Hotspur',
       'West Ham', 'West Ham United', 'Wolverhampton', 'Wolverhampton Wanderers'].includes(p.currentTeam)
    );
    console.log(`MSSQL total players: ${allMssql.length}, Premier League players found: ${plMssql.length}`);
  } catch (e) {
    console.warn("MSSQL connection not active or error:", e.message);
  }

  const selectedList = plSqlite.length > 0 ? plSqlite : plMssql;
  console.log(`\nFound ${selectedList.length} Premier League players to inspect:`);
  selectedList.forEach((p, idx) => {
    console.log(`${idx+1}. ID: ${p.id} | Name: ${p.name} | Team: ${p.currentTeam} | League: ${p.league} | Pos: ${p.position}`);
  });
}

main();
