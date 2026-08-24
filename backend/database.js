const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// ─── DYNAMIC DATABASE CONNECTION (PostgreSQL, SQL Server or SQLite fallback) ───────────────────
const isProduction = process.env.NODE_ENV === 'production';

// Usar PostgreSQL de producción solo si DATABASE_URL está definida
const useProductionPostgres = process.env.DATABASE_URL && (isProduction || process.env.ALLOW_REMOTE_DB_IN_DEV === 'true');

// Usar SQLite como fallback ÚNICAMENTE si no hay DB_HOST ni DB_DIALECT=mssql ni DATABASE_URL
const useSQLite = process.env.DB_DIALECT === 'sqlite' || 
                  (!process.env.DB_HOST && !process.env.DATABASE_URL && process.env.DB_DIALECT !== 'mssql');

let sequelize;

if (useProductionPostgres) {
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
  let rawHost = process.env.DB_HOST || '127.0.0.1';
  // Avoid tedious IPv6 ::1 lookup sequence error on Windows when 'localhost' is provided
  const dbHost = (rawHost === 'localhost') ? '127.0.0.1' : rawHost;
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
  },
  medicalStatus: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Disponible'
  },
  injuries: {
    type: DataTypes.TEXT,
    get() {
      const val = this.getDataValue('injuries');
      if (typeof val === 'object') return val;
      try { return val ? JSON.parse(val) : []; } catch(e) { return []; }
    }
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: true
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
  country: { type: DataTypes.STRING, allowNull: false },
  position: { type: DataTypes.INTEGER, allowNull: true },
  pj: { type: DataTypes.INTEGER, allowNull: true },
  g: { type: DataTypes.INTEGER, allowNull: true },
  e: { type: DataTypes.INTEGER, allowNull: true },
  p: { type: DataTypes.INTEGER, allowNull: true },
  gf: { type: DataTypes.INTEGER, allowNull: true },
  gc: { type: DataTypes.INTEGER, allowNull: true },
  pts: { type: DataTypes.INTEGER, allowNull: true }
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

// ─── PROSPECT MODEL (JUGADORES PROSPECTOS LOCALES) ───────────────────────────
const Prospect = sequelize.define('Prospect', {
  id: { type: DataTypes.STRING, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  name: DataTypes.STRING,
  nickname: DataTypes.STRING,
  docType: DataTypes.STRING,
  docNumber: DataTypes.STRING,
  docFileUrl: DataTypes.TEXT,
  docFileName: DataTypes.STRING,
  age: DataTypes.INTEGER,
  jerseyNumber: DataTypes.INTEGER,
  position: DataTypes.STRING,
  positionEs: DataTypes.STRING,
  category: DataTypes.STRING,
  preferredFoot: DataTypes.STRING,
  height: DataTypes.INTEGER,
  heightUnit: DataTypes.STRING,
  weight: DataTypes.INTEGER,
  weightUnit: DataTypes.STRING,
  medicalStatus: DataTypes.STRING,
  photoUrl: DataTypes.TEXT,
  photoId: DataTypes.STRING,
  currentTeam: DataTypes.STRING,
  league: DataTypes.STRING,
  country: DataTypes.STRING,
  nationality: DataTypes.STRING,
  nationalityEs: DataTypes.STRING,
  flag: DataTypes.STRING,
  marketValue: DataTypes.BIGINT,
  bio: DataTypes.TEXT,
  bioEs: DataTypes.TEXT,
  stats: {
    type: DataTypes.TEXT,
    get() {
      const val = this.getDataValue('stats');
      if (typeof val === 'object') return val;
      try { return val ? JSON.parse(val) : null; } catch(e) { return null; }
    }
  },
  strengths: {
    type: DataTypes.TEXT,
    get() {
      const val = this.getDataValue('strengths');
      if (typeof val === 'object') return val;
      try { return val ? JSON.parse(val) : []; } catch(e) { return []; }
    }
  },
  improvements: {
    type: DataTypes.TEXT,
    get() {
      const val = this.getDataValue('improvements');
      if (typeof val === 'object') return val;
      try { return val ? JSON.parse(val) : []; } catch(e) { return []; }
    }
  },
  weaknesses: {
    type: DataTypes.TEXT,
    get() {
      const val = this.getDataValue('weaknesses');
      if (typeof val === 'object') return val;
      try { return val ? JSON.parse(val) : []; } catch(e) { return []; }
    }
  },
  tacticalNotes: {
    type: DataTypes.TEXT
  },
  highlightUrl: {
    type: DataTypes.TEXT
  },
  trophies: {
    type: DataTypes.TEXT,
    get() {
      const val = this.getDataValue('trophies');
      if (typeof val === 'object') return val;
      try { return val ? JSON.parse(val) : []; } catch(e) { return []; }
    }
  },
  injuries: {
    type: DataTypes.TEXT,
    get() {
      const val = this.getDataValue('injuries');
      if (typeof val === 'object') return val;
      try { return val ? JSON.parse(val) : []; } catch(e) { return []; }
    }
  },
  authorizations: {
    type: DataTypes.TEXT,
    get() {
      const val = this.getDataValue('authorizations');
      if (typeof val === 'object') return val;
      try { return val ? JSON.parse(val) : {}; } catch(e) { return {}; }
    }
  },
  legalDetails: {
    type: DataTypes.TEXT,
    get() {
      const val = this.getDataValue('legalDetails');
      if (typeof val === 'object') return val;
      try { return val ? JSON.parse(val) : {}; } catch(e) { return {}; }
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
}, {
  tableName: 'Prospects'
});

User.hasMany(Prospect, { foreignKey: 'userId', as: 'prospects' });
User.hasMany(Prospect, { foreignKey: 'userId', as: 'myPlayers' });
Prospect.belongsTo(User, { foreignKey: 'userId', as: 'coach' });


// ─── PAYMENT MODEL ───────────────────────────────────────────────────────────
const PaymentModel = require('./models/Payment');
const Payment = PaymentModel(sequelize);

User.hasMany(Payment, { foreignKey: 'userId' });
Payment.belongsTo(User, { foreignKey: 'userId' });

// ─── PAYMENT METHOD MODEL ───────────────────────────────────────────────────
const PaymentMethodModel = require('./models/PaymentMethod');
const PaymentMethod = PaymentMethodModel(sequelize);

User.hasMany(PaymentMethod, { foreignKey: 'userId' });
PaymentMethod.belongsTo(User, { foreignKey: 'userId' });

// ─── CHAT MODELS ─────────────────────────────────────────────────────────────
const DirectMessageModel = require('./models/DirectMessage');
const DirectMessage = DirectMessageModel(sequelize);

const UserContactModel = require('./models/UserContact');
const UserContact = UserContactModel(sequelize);

User.hasMany(DirectMessage, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(DirectMessage, { foreignKey: 'receiverId', as: 'receivedMessages' });
DirectMessage.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
DirectMessage.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

User.hasMany(UserContact, { foreignKey: 'userId', as: 'contacts' });
UserContact.belongsTo(User, { foreignKey: 'userId', as: 'user' });
UserContact.belongsTo(User, { foreignKey: 'contactUserId', as: 'contactUser' });

async function enableRLSIfPostgres() {
  if (sequelize.options.dialect === 'postgres') {
    console.log('🔒 Enabling Row Level Security (RLS) on public tables...');
    const tables = ['users', 'Players', 'payments', 'payment_methods', 'query_logs', 'comparison_logs', 'favorite_logs', 'leagues', 'teams', 'direct_messages', 'user_contacts'];
    for (const table of tables) {
      try {
        await sequelize.query(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`);
        console.log(`  - RLS enabled on table: ${table}`);
      } catch (err) {
        console.warn(`  ⚠️ Could not enable RLS on table ${table}:`, err.message);
      }
    }

    console.log('🛡️ Applying standard RLS policies...');
    const policies = [
      'DROP POLICY IF EXISTS "Allow public read access" ON "Players";',
      'CREATE POLICY "Allow public read access" ON "Players" FOR SELECT TO public USING (true);',
      'DROP POLICY IF EXISTS "Allow public read access" ON "leagues";',
      'CREATE POLICY "Allow public read access" ON "leagues" FOR SELECT TO public USING (true);',
      'DROP POLICY IF EXISTS "Allow public read access" ON "teams";',
      'CREATE POLICY "Allow public read access" ON "teams" FOR SELECT TO public USING (true);',
      'DROP POLICY IF EXISTS "Allow users to view their own profile" ON "users";',
      'CREATE POLICY "Allow users to view their own profile" ON "users" FOR SELECT TO authenticated USING (auth.uid() = id);',
      'DROP POLICY IF EXISTS "Allow users to update their own profile" ON "users";',
      'CREATE POLICY "Allow users to update their own profile" ON "users" FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);',
      'DROP POLICY IF EXISTS "Allow users to view their own payments" ON "payments";',
      'CREATE POLICY "Allow users to view their own payments" ON "payments" FOR SELECT TO authenticated USING (auth.uid() = "userId");',
      'DROP POLICY IF EXISTS "Allow users to manage their own payment methods" ON "payment_methods";',
      'CREATE POLICY "Allow users to manage their own payment methods" ON "payment_methods" FOR ALL TO authenticated USING (auth.uid() = "userId") WITH CHECK (auth.uid() = "userId");',
      'DROP POLICY IF EXISTS "Allow users to view their own query logs" ON "query_logs";',
      'CREATE POLICY "Allow users to view their own query logs" ON "query_logs" FOR SELECT TO authenticated USING (auth.uid() = "userId");',
      'DROP POLICY IF EXISTS "Allow users to insert their own query logs" ON "query_logs";',
      'CREATE POLICY "Allow users to insert their own query logs" ON "query_logs" FOR INSERT TO authenticated WITH CHECK (auth.uid() = "userId");',
      'DROP POLICY IF EXISTS "Allow users to view their own comparison logs" ON "comparison_logs";',
      'CREATE POLICY "Allow users to view their own comparison logs" ON "comparison_logs" FOR SELECT TO authenticated USING (auth.uid() = "userId");',
      'DROP POLICY IF EXISTS "Allow users to insert their own comparison logs" ON "comparison_logs";',
      'CREATE POLICY "Allow users to insert their own comparison logs" ON "comparison_logs" FOR INSERT TO authenticated WITH CHECK (auth.uid() = "userId");',
      'DROP POLICY IF EXISTS "Allow users to manage their own favorite logs" ON "favorite_logs";',
      'CREATE POLICY "Allow users to manage their own favorite logs" ON "favorite_logs" FOR ALL TO authenticated USING (auth.uid() = "userId") WITH CHECK (auth.uid() = "userId");'
    ];

    for (const policySql of policies) {
      try {
        await sequelize.query(policySql);
      } catch (err) {
        console.warn(`  ⚠️ Could not apply policy query: ${policySql.substring(0, 50)}... Reason:`, err.message);
      }
    }
    console.log('  - All RLS policies configured successfully.');

    // Ensure private schema exists and move rls_auto_enable function to it to hide it from public PostgREST API
    try {
      await sequelize.query('CREATE SCHEMA IF NOT EXISTS private;');
      await sequelize.query('ALTER FUNCTION public.rls_auto_enable() SET SCHEMA private;');
      console.log('  - Moved public.rls_auto_enable() to private schema.');
    } catch (err) {
      // Ignore if function does not exist in public schema
    }

    try {
      await sequelize.query('REVOKE EXECUTE ON FUNCTION private.rls_auto_enable() FROM PUBLIC;');
      console.log('  - Revoked public execute privileges on private.rls_auto_enable() function.');
    } catch (err) {
      // Ignore if function does not exist
    }
  }
}

const AiApiLog = sequelize.define('ai_api_log', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  endpoint: {
    type: DataTypes.STRING,
    allowNull: false
  },
  scenario: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userMessage: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  provider: {
    type: DataTypes.STRING,
    defaultValue: 'DeepSeek'
  },
  model: {
    type: DataTypes.STRING,
    defaultValue: 'deepseek-chat'
  },
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 200
  },
  tokensEstimated: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  costUSD: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0
  },
  userEmail: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'ai_api_logs',
  timestamps: true,
  updatedAt: false
});

module.exports = { sequelize, Player, Prospect, User, League, Team, QueryLog, ComparisonLog, FavoriteLog, Payment, PaymentMethod, DirectMessage, UserContact, AiApiLog, enableRLSIfPostgres };

