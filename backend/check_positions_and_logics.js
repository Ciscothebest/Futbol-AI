const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

const sqlitePath = path.join(__dirname, 'database.sqlite');
const sqliteSequelize = new Sequelize({
  dialect: 'sqlite',
  storage: sqlitePath,
  logging: false
});

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

const Player = sqliteSequelize.define('Player', playerSchema, { tableName: 'Players', timestamps: true });

async function checkSample() {
  const players = await Player.findAll({ where: { league: 'Premier League' } });
  console.log(`Total PL players in DB: ${players.length}`);

  const sample = players.filter(p => [
    'erling-haaland', 'bukayo-saka', 'mohamed-salah', 'cole-palmer',
    'phil-foden', 'declan-rice', 'martin-odegaard', 'virgil-van-dijk',
    'william-saliba', 'alisson', 'david-raya', 'ollie-watkins',
    'bruno-guimaraes', 'alexis-mac-allister', 'son-heung-min'
  ].includes(p.id));

  console.log("\nSample positions and values:");
  sample.forEach(p => {
    console.log(`- ${p.name} (${p.currentTeam}): Pos=${p.position} (${p.positionEs}), Nat=${p.nationality} (${p.nationalityEs}), Flag=${p.flag}, MV=€${Number(p.marketValue).toLocaleString()}, Age=${p.age}, Foot=${p.preferredFoot}, Dorsal=#${p.jerseyNumber}`);
  });
}

checkSample();
