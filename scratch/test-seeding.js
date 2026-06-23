const { Sequelize, DataTypes } = require('../backend/node_modules/sequelize');

// Create a clean, in-memory SQLite database to test database seeding
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:',
  logging: false
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

const seedLeaguesAndTeams = require('../backend/seed-db-onboarding');

async function testSeeding() {
  console.log('🧪 Testing Database Seeding on clean in-memory database...');
  try {
    await sequelize.sync({ force: true });
    
    // We override seedLeaguesAndTeams's import of League and Team or run a dry run
    // Let's inspect the seed-db-onboarding.js file to check if it has any duplicate keys inside leagueData
    const fs = require('fs');
    const seedCode = fs.readFileSync(__dirname + '/../backend/seed-db-onboarding.js', 'utf8');
    
    // Let's parse the leagueData object in the file
    // We can evaluate just the leagueData object using eval
    const leagueDataStartIndex = seedCode.indexOf('const leagueData = {');
    const leagueDataEndIndex = seedCode.indexOf('};', leagueDataStartIndex) + 2;
    const leagueDataStr = seedCode.substring(leagueDataStartIndex, leagueDataEndIndex);
    
    let leagueData;
    eval(leagueDataStr); // sets leagueData
    
    console.log('Parsed leagueData successfully. Number of entries:', Object.keys(leagueData).length);
    
    // Check for duplicate countries or flagIso or other potential violations
    const countries = Object.keys(leagueData);
    const uniqueCountries = new Set(countries);
    console.log(`- Total country keys: ${countries.length}`);
    console.log(`- Unique country keys: ${uniqueCountries.size}`);
    
    // Check if any country details are identical or violate uniqueness
    const duplicates = [];
    const seenCountries = new Set();
    
    for (const [key, details] of Object.entries(leagueData)) {
      if (seenCountries.has(key.toLowerCase())) {
        duplicates.push(key);
      }
      seenCountries.add(key.toLowerCase());
    }
    
    if (duplicates.length > 0) {
      console.log('❌ Found duplicate country keys (case-insensitive):', duplicates);
    } else {
      console.log('✅ No duplicate country keys found (case-insensitive).');
    }

    // Check if there is a unique key violation on the model level in actual seeding
    // We can run the actual seeding by replacing the required modules or just running it
    // Wait, the seed script requires './database' which points to backend/database.js.
    // If we run seedLeaguesAndTeams(), it will use the main SQL Server or SQLite.
    // Let's see if there are any duplicate keys at all.
    
  } catch (err) {
    console.error('❌ Seeding test failed:', err);
  } finally {
    await sequelize.close();
  }
}

testSeeding();
