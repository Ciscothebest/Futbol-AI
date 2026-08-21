const { Sequelize, DataTypes } = require('sequelize');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const playersJsonPath = path.join(__dirname, 'knowledge/players.json');
const playersJson = JSON.parse(fs.readFileSync(playersJsonPath, 'utf8'));

console.log(`📋 Total de jugadores a sincronizar en todas las bases de datos: ${playersJson.length}`);

// 1. Sync SQLite Database
async function syncSQLite() {
  console.log('📦 Sincronizando base de datos SQLite (database.sqlite)...');
  const sqlite = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'database.sqlite'),
    logging: false
  });

  const PlayerSqlite = sqlite.define('Player', {
    id: { type: DataTypes.STRING, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    photoId: { type: DataTypes.STRING, allowNull: true },
    nickname: { type: DataTypes.STRING, allowNull: true },
    age: { type: DataTypes.INTEGER, allowNull: true },
    nationality: { type: DataTypes.STRING, allowNull: true },
    nationalityEs: { type: DataTypes.STRING, allowNull: true },
    flag: { type: DataTypes.STRING, allowNull: true },
    position: { type: DataTypes.STRING, allowNull: true },
    positionEs: { type: DataTypes.STRING, allowNull: true },
    currentTeam: { type: DataTypes.STRING, allowNull: true },
    league: { type: DataTypes.STRING, allowNull: true },
    country: { type: DataTypes.STRING, allowNull: true },
    jerseyNumber: { type: DataTypes.INTEGER, allowNull: true },
    height: { type: DataTypes.INTEGER, allowNull: true },
    weight: { type: DataTypes.INTEGER, allowNull: true },
    preferredFoot: { type: DataTypes.STRING, allowNull: true },
    marketValue: { type: DataTypes.FLOAT, allowNull: true },
    overallRating: { type: DataTypes.FLOAT, allowNull: true },
    stats: { type: DataTypes.TEXT, allowNull: true },
    careerTotals: { type: DataTypes.TEXT, allowNull: true },
    trophies: { type: DataTypes.TEXT, allowNull: true },
    transfers: { type: DataTypes.TEXT, allowNull: true },
    bio: { type: DataTypes.TEXT, allowNull: true },
    bioEs: { type: DataTypes.TEXT, allowNull: true },
    strengths: { type: DataTypes.TEXT, allowNull: true },
    tags: { type: DataTypes.TEXT, allowNull: true },
    history: { type: DataTypes.TEXT, allowNull: true },
    medicalStatus: { type: DataTypes.STRING, allowNull: true },
    injuries: { type: DataTypes.TEXT, allowNull: true },
    userId: { type: DataTypes.STRING, allowNull: true }
  }, { tableName: 'Players' });

  await sqlite.sync({ force: true });

  for (const p of playersJson) {
    await PlayerSqlite.create({
      id: p.id,
      name: p.name,
      photoId: p.photoId || null,
      nickname: p.nickname || null,
      age: p.age || null,
      nationality: p.nationality || null,
      nationalityEs: p.nationalityEs || null,
      flag: p.flag || null,
      position: p.position || null,
      positionEs: p.positionEs || null,
      currentTeam: p.currentTeam || null,
      league: p.league || null,
      country: p.country || null,
      jerseyNumber: p.jerseyNumber || null,
      height: p.height || null,
      weight: p.weight || null,
      preferredFoot: p.preferredFoot || null,
      marketValue: p.marketValue || 0,
      overallRating: p.overallRating || 7.2,
      stats: typeof p.stats === 'object' ? JSON.stringify(p.stats) : p.stats,
      careerTotals: typeof p.careerTotals === 'object' ? JSON.stringify(p.careerTotals) : p.careerTotals,
      trophies: typeof p.trophies === 'object' ? JSON.stringify(p.trophies) : p.trophies,
      transfers: typeof p.transfers === 'object' ? JSON.stringify(p.transfers) : p.transfers,
      bio: p.bio || null,
      bioEs: p.bioEs || null,
      strengths: typeof p.strengths === 'object' ? JSON.stringify(p.strengths) : p.strengths,
      tags: typeof p.tags === 'object' ? JSON.stringify(p.tags) : p.tags,
      history: typeof p.history === 'object' ? JSON.stringify(p.history) : p.history,
      medicalStatus: p.medicalStatus || 'Disponible',
      injuries: typeof p.injuries === 'object' ? JSON.stringify(p.injuries) : p.injuries,
      userId: p.userId || null
    });
  }

  const count = await PlayerSqlite.count();
  console.log(`✅ Base de datos SQLite (database.sqlite) sincronizada al 100% con ${count} jugadores.`);
}

// 2. Sync PostgreSQL Database if DATABASE_URL is available
async function syncPostgreSQL() {
  const pgUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!pgUrl) {
    console.log('ℹ️ No se detectó DATABASE_URL en .env para PostgreSQL remoto. Se omitió la conexión remota.');
    return;
  }

  console.log('🐘 Conectando y sincronizando base de datos PostgreSQL de producción...');
  const postgres = new Sequelize(pgUrl, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false
  });

  const PlayerPG = postgres.define('Player', {
    id: { type: DataTypes.STRING, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    photoId: { type: DataTypes.STRING, allowNull: true },
    nickname: { type: DataTypes.STRING, allowNull: true },
    age: { type: DataTypes.INTEGER, allowNull: true },
    nationality: { type: DataTypes.STRING, allowNull: true },
    nationalityEs: { type: DataTypes.STRING, allowNull: true },
    flag: { type: DataTypes.STRING, allowNull: true },
    position: { type: DataTypes.STRING, allowNull: true },
    positionEs: { type: DataTypes.STRING, allowNull: true },
    currentTeam: { type: DataTypes.STRING, allowNull: true },
    league: { type: DataTypes.STRING, allowNull: true },
    country: { type: DataTypes.STRING, allowNull: true },
    jerseyNumber: { type: DataTypes.INTEGER, allowNull: true },
    height: { type: DataTypes.INTEGER, allowNull: true },
    weight: { type: DataTypes.INTEGER, allowNull: true },
    preferredFoot: { type: DataTypes.STRING, allowNull: true },
    marketValue: { type: DataTypes.FLOAT, allowNull: true },
    overallRating: { type: DataTypes.FLOAT, allowNull: true },
    stats: { type: DataTypes.TEXT, allowNull: true },
    careerTotals: { type: DataTypes.TEXT, allowNull: true },
    trophies: { type: DataTypes.TEXT, allowNull: true },
    transfers: { type: DataTypes.TEXT, allowNull: true },
    bio: { type: DataTypes.TEXT, allowNull: true },
    bioEs: { type: DataTypes.TEXT, allowNull: true },
    strengths: { type: DataTypes.TEXT, allowNull: true },
    tags: { type: DataTypes.TEXT, allowNull: true },
    history: { type: DataTypes.TEXT, allowNull: true },
    medicalStatus: { type: DataTypes.STRING, allowNull: true },
    injuries: { type: DataTypes.TEXT, allowNull: true },
    userId: { type: DataTypes.STRING, allowNull: true }
  }, { tableName: 'Players' });

  await postgres.sync({ force: true });

  for (const p of playersJson) {
    await PlayerPG.create({
      id: p.id,
      name: p.name,
      photoId: p.photoId || null,
      nickname: p.nickname || null,
      age: p.age || null,
      nationality: p.nationality || null,
      nationalityEs: p.nationalityEs || null,
      flag: p.flag || null,
      position: p.position || null,
      positionEs: p.positionEs || null,
      currentTeam: p.currentTeam || null,
      league: p.league || null,
      country: p.country || null,
      jerseyNumber: p.jerseyNumber || null,
      height: p.height || null,
      weight: p.weight || null,
      preferredFoot: p.preferredFoot || null,
      marketValue: p.marketValue || 0,
      overallRating: p.overallRating || 7.2,
      stats: typeof p.stats === 'object' ? JSON.stringify(p.stats) : p.stats,
      careerTotals: typeof p.careerTotals === 'object' ? JSON.stringify(p.careerTotals) : p.careerTotals,
      trophies: typeof p.trophies === 'object' ? JSON.stringify(p.trophies) : p.trophies,
      transfers: typeof p.transfers === 'object' ? JSON.stringify(p.transfers) : p.transfers,
      bio: p.bio || null,
      bioEs: p.bioEs || null,
      strengths: typeof p.strengths === 'object' ? JSON.stringify(p.strengths) : p.strengths,
      tags: typeof p.tags === 'object' ? JSON.stringify(p.tags) : p.tags,
      history: typeof p.history === 'object' ? JSON.stringify(p.history) : p.history,
      medicalStatus: p.medicalStatus || 'Disponible',
      injuries: typeof p.injuries === 'object' ? JSON.stringify(p.injuries) : p.injuries,
      userId: p.userId || null
    });
  }

  const count = await PlayerPG.count();
  console.log(`✅ Base de datos PostgreSQL de producción sincronizada al 100% con ${count} jugadores.`);
}

async function run() {
  await syncSQLite();
  await syncPostgreSQL();
  process.exit(0);
}

run();
