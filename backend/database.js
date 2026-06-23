const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// ─── DYNAMIC DATABASE CONNECTION (PostgreSQL, SQL Server or SQLite fallback) ───────────────────
const useSQLite = process.env.DB_DIALECT === 'sqlite' || 
                  (process.env.NODE_ENV === 'production' && !process.env.DB_HOST && !process.env.DATABASE_URL);

let sequelize;

if (process.env.DATABASE_URL) {
  console.log('🐘 Connecting to persistent PostgreSQL database...');
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false
  });
} else if (useSQLite) {
  console.log('📦 Using SQLite database for production/fallback...');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'database.sqlite'),
    logging: false
  });
} else {
  console.log('🐘 Using SQL Server (MSSQL) database...');
  const dbHost = process.env.DB_HOST || 'localhost';
  const isLocalHost = dbHost === 'localhost' || dbHost === '127.0.0.1';

  // In cloud databases (like AWS RDS / Azure SQL), encryption is usually required.
  // We auto-enable encryption for remote hosts, but allow overriding via environment variables.
  const shouldEncrypt = process.env.DB_ENCRYPT 
    ? process.env.DB_ENCRYPT === 'true' 
    : !isLocalHost;

  sequelize = new Sequelize(
    process.env.DB_NAME     || 'FutbolAI',
    process.env.DB_USER     || 'football_user',
    process.env.DB_PASSWORD || 'FootballPassword123!',
    {
      dialect: 'mssql',
      host:    dbHost,
      port:    parseInt(process.env.DB_PORT || '1433'),
      dialectOptions: {
        options: {
          encrypt:                shouldEncrypt,
          trustServerCertificate: process.env.DB_TRUST_CERT ? process.env.DB_TRUST_CERT === 'true' : true
        }
      },
      logging: false
    }
  );
}

const Player = sequelize.define('Player', {
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
  stats: {
    type: DataTypes.TEXT,
    get() {
      const val = this.getDataValue('stats');
      if (typeof val === 'object') return val;
      try { return val ? JSON.parse(val) : null; } catch(e) { return null; }
    }
  },
  careerTotals: {
    type: DataTypes.TEXT,
    get() {
      const val = this.getDataValue('careerTotals');
      if (typeof val === 'object') return val;
      try { return val ? JSON.parse(val) : null; } catch(e) { return null; }
    }
  },
  trophies: {
    type: DataTypes.TEXT,
    get() {
      const val = this.getDataValue('trophies');
      if (typeof val === 'object') return val;
      try { return val ? JSON.parse(val) : []; } catch(e) { return []; }
    }
  },
  transfers: {
    type: DataTypes.TEXT,
    get() {
      const val = this.getDataValue('transfers');
      if (typeof val === 'object') return val;
      try { return val ? JSON.parse(val) : []; } catch(e) { return []; }
    }
  },
  bio: DataTypes.TEXT,
  bioEs: DataTypes.TEXT,
  strengths: {
    type: DataTypes.TEXT,
    get() {
      const val = this.getDataValue('strengths');
      if (typeof val === 'object') return val;
      try { return val ? JSON.parse(val) : []; } catch(e) { return []; }
    }
  },
  tags: {
    type: DataTypes.TEXT,
    get() {
      const val = this.getDataValue('tags');
      if (typeof val === 'object') return val;
      try { return val ? JSON.parse(val) : []; } catch(e) { return []; }
    }
  },
  history: {
    type: DataTypes.TEXT,
    get() {
      const val = this.getDataValue('history');
      if (typeof val === 'object') return val;
      try { return val ? JSON.parse(val) : []; } catch(e) { return []; }
    }
  }
});

const League = sequelize.define('League', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  country: { type: DataTypes.STRING, allowNull: false, unique: true },
  flagIso: { type: DataTypes.STRING, allowNull: false }
}, {
  tableName: 'leagues',
  timestamps: false
});

const Team = sequelize.define('Team', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  leagueName: { type: DataTypes.STRING, allowNull: false },
  country: { type: DataTypes.STRING, allowNull: false }
}, {
  tableName: 'teams',
  timestamps: false
});

// ─── USER MODEL ──────────────────────────────────────────────────────────────
const UserModel = require('./models/User');
const User = UserModel(sequelize);

// ─── LOG MODELS ──────────────────────────────────────────────────────────────
const QueryLog = sequelize.define('QueryLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  message: { type: DataTypes.TEXT, allowNull: true } // can be null if audio or quick query
}, { tableName: 'query_logs', timestamps: true });

const ComparisonLog = sequelize.define('ComparisonLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  player1Id: { type: DataTypes.STRING, allowNull: false },
  player2Id: { type: DataTypes.STRING, allowNull: false }
}, { tableName: 'comparison_logs', timestamps: true });

const FavoriteLog = sequelize.define('FavoriteLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  playerId: { type: DataTypes.STRING, allowNull: false },
  action: { type: DataTypes.STRING, allowNull: false } // 'add' or 'remove'
}, { tableName: 'favorite_logs', timestamps: true });

// Relationships
User.hasMany(QueryLog, { foreignKey: 'userId' });
QueryLog.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(ComparisonLog, { foreignKey: 'userId' });
ComparisonLog.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(FavoriteLog, { foreignKey: 'userId' });
FavoriteLog.belongsTo(User, { foreignKey: 'userId' });

// ─── PAYMENT MODEL ───────────────────────────────────────────────────────────
const PaymentModel = require('./models/Payment');
const Payment = PaymentModel(sequelize);

User.hasMany(Payment, { foreignKey: 'userId' });
Payment.belongsTo(User, { foreignKey: 'userId' });

module.exports = { sequelize, Player, User, League, Team, QueryLog, ComparisonLog, FavoriteLog, Payment };
