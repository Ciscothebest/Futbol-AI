const { sequelize, League, Team } = require('../backend/database');

async function checkLeaguesAndTeams() {
  console.log('🔍 Running Leagues and Teams Table Data Validation...');
  try {
    await sequelize.authenticate();
    
    const leagueCount = await League.count();
    const teamCount = await Team.count();
    
    console.log(`Leagues count in DB: ${leagueCount}`);
    console.log(`Teams count in DB: ${teamCount}`);
    
    if (leagueCount === 0 || teamCount === 0) {
      console.log('⚠️ Leagues or Teams table is empty! Seeding may have failed.');
      return;
    }
    
    // Check for duplicate countries in leagues
    const leagues = await League.findAll();
    const countries = leagues.map(l => l.country);
    const uniqueCountries = new Set(countries);
    
    console.log(`Unique countries in leagues: ${uniqueCountries.size} / ${leagues.length}`);
    if (uniqueCountries.size !== leagues.length) {
      console.log('❌ DATABASE ERROR: Duplicate country entries found in leagues table!');
      const duplicates = countries.filter((item, index) => countries.indexOf(item) !== index);
      console.log('Duplicate countries:', duplicates);
    } else {
      console.log('✅ Leagues table has 100% unique country entries!');
    }
    
    // Check if any team has invalid data
    const teams = await Team.findAll({ limit: 10 });
    console.log('Sample teams in DB:', teams.map(t => `${t.name} (${t.country} - ${t.leagueName})`));
    
  } catch (err) {
    console.error('❌ Data check failed:', err);
  } finally {
    await sequelize.close();
  }
}

checkLeaguesAndTeams();
