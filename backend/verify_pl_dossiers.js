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

async function verifyDossiers() {
  const targets = ['erling-haaland', 'bukayo-saka', 'cole-palmer', 'alexis-mac-allister'];
  console.log("=========================================================");
  console.log("VERIFICACIÓN DE EXPEDIENTES EXTRAÍDOS DE TRANSFERMARKT");
  console.log("=========================================================\n");

  for (const id of targets) {
    const p = await Player.findByPk(id);
    if (!p) continue;
    console.log(`📌 JUGADOR: ${p.name} (${p.currentTeam})`);
    console.log(`   - 1. id: ${p.id}`);
    console.log(`   - 2. name: ${p.name}`);
    console.log(`   - 3. photoId: ${p.photoId}`);
    console.log(`   - 4. nickname: ${p.nickname}`);
    console.log(`   - 5. age: ${p.age}`);
    console.log(`   - 6. nationality: ${p.nationality}`);
    console.log(`   - 7. nationalityEs: ${p.nationalityEs}`);
    console.log(`   - 8. flag: ${p.flag}`);
    console.log(`   - 9. position: ${p.position}`);
    console.log(`   - 10. positionEs: ${p.positionEs}`);
    console.log(`   - 11. currentTeam: ${p.currentTeam}`);
    console.log(`   - 12. league: ${p.league}`);
    console.log(`   - 13. country: ${p.country}`);
    console.log(`   - 14. jerseyNumber: #${p.jerseyNumber}`);
    console.log(`   - 15. height: ${p.height} cm`);
    console.log(`   - 16. weight: ${p.weight} kg`);
    console.log(`   - 17. preferredFoot: ${p.preferredFoot}`);
    console.log(`   - 18. marketValue: €${Number(p.marketValue).toLocaleString()}`);
    console.log(`   - 19. overallRating: ${p.overallRating}`);
    console.log(`   - 20. stats: ${p.stats}`);
    console.log(`   - 21. careerTotals: ${p.careerTotals}`);
    console.log(`   - 22. trophies: ${p.trophies}`);
    console.log(`   - 23. transfers: ${p.transfers}`);
    console.log(`   - 24. bio: ${p.bio}`);
    console.log(`   - 25. bioEs: ${p.bioEs}`);
    console.log(`   - 26. strengths: ${p.strengths}`);
    console.log(`   - 27. tags: ${p.tags}`);
    console.log(`   - 28. history: ${p.history}`);
    console.log(`   - 29. userId: ${p.userId || 'system'}\n`);
  }
}

verifyDossiers();
