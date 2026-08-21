const { Sequelize, DataTypes } = require('sequelize');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function validateAndSyncDatabases() {
  console.log("=========================================================================");
  console.log("FUTBOL AI PLATFORM - VALIDACIÓN DE BASES DE DATOS (SQL SERVER Y POSTGRESQL)");
  console.log("=========================================================================\n");

  // 1. VALIDACIÓN EN SQL SERVER (MSSQL)
  let mssqlCount = 0;
  let mssqlLeagues = [];
  try {
    const mssqlSequelize = new Sequelize(
      process.env.DB_NAME || 'FutbolAI',
      process.env.DB_USER || 'football_user',
      process.env.DB_PASSWORD || 'FootballPassword123!',
      {
        dialect: 'mssql',
        host: process.env.DB_HOST || '127.0.0.1',
        port: parseInt(process.env.DB_PORT || '1433'),
        logging: false,
        dialectOptions: { options: { encrypt: false, trustServerCertificate: true } }
      }
    );

    await mssqlSequelize.authenticate();
    console.log("✅ SQL SERVER (MSSQL): Conexión establecida correctamente.");

    const [countRes] = await mssqlSequelize.query("SELECT COUNT(*) as count FROM Players");
    mssqlCount = countRes[0].count;

    const [leagueRes] = await mssqlSequelize.query("SELECT league, COUNT(*) as count FROM Players WHERE userId IS NULL GROUP BY league");
    mssqlLeagues = leagueRes;

    console.log(`📊 SQL SERVER - Total de Jugadores en DB: ${mssqlCount}`);
    console.log("📊 SQL SERVER - Ligas encontradas:");
    mssqlLeagues.forEach(l => console.log(`   - ${l.league}: ${l.count} jugadores`));

  } catch (err) {
    console.error("❌ SQL SERVER (MSSQL) Error:", err.message);
  }

  // 2. VALIDACIÓN / SINCRONIZACIÓN EN POSTGRESQL
  console.log("\n-------------------------------------------------------------------------");
  console.log("🐘 VERIFICANDO CONEXIÓN A POSTGRESQL...");
  
  const pgUrl = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/FutbolAI';
  let pgSequelize = null;
  let pgConnected = false;

  try {
    pgSequelize = new Sequelize(pgUrl, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: process.env.DATABASE_URL ? { ssl: { require: true, rejectUnauthorized: false } } : {}
    });

    await pgSequelize.authenticate();
    pgConnected = true;
    console.log(`✅ POSTGRESQL: Conexión establecida correctamente (${pgUrl}).`);
  } catch (err) {
    console.warn(`⚠️ PostgreSQL no respondió en ${pgUrl}: ${err.message}`);
    // Intentar conectar a postgres por defecto para crear la base de datos FutbolAI si no existe
    try {
      const pgDefault = new Sequelize('postgres://postgres:postgres@localhost:5432/postgres', { dialect: 'postgres', logging: false });
      await pgDefault.authenticate();
      await pgDefault.query('CREATE DATABASE "FutbolAI";').catch(() => {});
      console.log('✅ Base de datos "FutbolAI" creada/verificada en PostgreSQL local.');
      
      pgSequelize = new Sequelize('postgres://postgres:postgres@localhost:5432/FutbolAI', { dialect: 'postgres', logging: false });
      await pgSequelize.authenticate();
      pgConnected = true;
      console.log('✅ POSTGRESQL: Conexión establecida en postgres://postgres:postgres@localhost:5432/FutbolAI.');
    } catch (e2) {
      console.warn('ℹ️ Servidor PostgreSQL local no está activo en puerto 5432:', e2.message);
    }
  }

  if (pgConnected && pgSequelize) {
    // Define Player Model in PostgreSQL & Sync
    const PgPlayer = pgSequelize.define('Player', {
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
      height: { type: DataTypes.STRING, allowNull: true },
      weight: { type: DataTypes.STRING, allowNull: true },
      preferredFoot: { type: DataTypes.STRING, allowNull: true },
      marketValue: { type: DataTypes.FLOAT, allowNull: true },
      stats: { type: DataTypes.TEXT, allowNull: true },
      careerTotals: { type: DataTypes.TEXT, allowNull: true },
      trophies: { type: DataTypes.TEXT, allowNull: true },
      transfers: { type: DataTypes.TEXT, allowNull: true },
      bio: { type: DataTypes.TEXT, allowNull: true },
      bioEs: { type: DataTypes.TEXT, allowNull: true },
      strengths: { type: DataTypes.TEXT, allowNull: true },
      tags: { type: DataTypes.TEXT, allowNull: true },
      history: { type: DataTypes.TEXT, allowNull: true },
      userId: { type: DataTypes.STRING, allowNull: true }
    }, { tableName: 'Players', timestamps: true });

    await pgSequelize.sync();

    // Sincronizar desde SQLite / MSSQL a PostgreSQL
    const sqlitePath = path.join(__dirname, 'database.sqlite');
    const sqliteDb = new sqlite3.Database(sqlitePath);
    const sqlitePlayers = await new Promise((resolve, reject) => {
      sqliteDb.all("SELECT * FROM Players", [], (err, rows) => err ? reject(err) : resolve(rows));
    });

    console.log(`🔄 Sincronizando ${sqlitePlayers.length} jugadores hacia PostgreSQL...`);
    let pgInserted = 0;
    let pgUpdated = 0;

    for (let i = 0; i < sqlitePlayers.length; i++) {
      const p = sqlitePlayers[i];
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
        stats: typeof p.stats === 'object' ? JSON.stringify(p.stats) : p.stats,
        careerTotals: typeof p.careerTotals === 'object' ? JSON.stringify(p.careerTotals) : p.careerTotals,
        trophies: typeof p.trophies === 'object' ? JSON.stringify(p.trophies) : p.trophies,
        transfers: typeof p.transfers === 'object' ? JSON.stringify(p.transfers) : p.transfers,
        bio: p.bio,
        bioEs: p.bioEs,
        strengths: typeof p.strengths === 'object' ? JSON.stringify(p.strengths) : p.strengths,
        tags: typeof p.tags === 'object' ? JSON.stringify(p.tags) : p.tags,
        history: typeof p.history === 'object' ? JSON.stringify(p.history) : p.history,
        userId: p.userId || null
      };

      const [instance, created] = await PgPlayer.upsert(playerPayload);
      if (created) pgInserted++; else pgUpdated++;
    }

    const pgCount = await PgPlayer.count();
    console.log(`\n🎉 POSTGRESQL SINCRONIZADO CON ÉXITO:`);
    console.log(`- Total de jugadores en PostgreSQL: ${pgCount}`);
    
    const pgLeagues = await PgPlayer.findAll({
      attributes: ['league', [pgSequelize.fn('COUNT', pgSequelize.col('id')), 'count']],
      where: { userId: null },
      group: ['league'],
      raw: true
    });
    console.log("📊 POSTGRESQL - Ligas encontradas:");
    pgLeagues.forEach(l => console.log(`   - ${l.league}: ${l.count} jugadores`));
  }

  process.exit(0);
}

validateAndSyncDatabases().catch(err => {
  console.error("Error validando bases de datos:", err);
  process.exit(1);
});
