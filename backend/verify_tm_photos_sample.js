const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

const sqlitePath = path.join(__dirname, 'database.sqlite');
const sqliteSequelize = new Sequelize({
  dialect: 'sqlite',
  storage: sqlitePath,
  logging: false
});

const Player = sqliteSequelize.define('Player', {
  id: { type: DataTypes.STRING, primaryKey: true },
  name: DataTypes.STRING,
  photoId: DataTypes.STRING,
  currentTeam: DataTypes.STRING,
  league: DataTypes.STRING
}, { tableName: 'Players', timestamps: true });

async function verifySample() {
  const sampleIds = [
    'erling-haaland', 'bukayo-saka', 'cole-palmer', 'mohamed-salah', 'declan-rice',
    'vinicius-junior', 'lamine-yamal', 'jude-bellingham', 'kylian-mbappe', 'robert-lewandowski'
  ];

  console.log("=========================================================");
  console.log("VERIFICACIÓN DE FOTOS OFICIALES EXTRAÍDAS DE TRANSFERMARKT");
  console.log("=========================================================\n");

  for (const id of sampleIds) {
    const p = await Player.findByPk(id);
    if (!p) continue;
    console.log(`📸 JUGADOR: ${p.name} (${p.currentTeam} - ${p.league})`);
    console.log(`   - ID: ${p.id}`);
    console.log(`   - photoId (Transfermarkt HD): ${p.photoId}\n`);
  }
}

verifySample();
