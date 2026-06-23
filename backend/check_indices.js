const fs = require('fs');
const path = require('path');
const { League } = require('./database');

async function run() {
  try {
    const onboardingPath = 'C:/Users/franc/OneDrive/Escritorio/Futbol AI Local/frontend/onboarding.js';
    const onboardingContent = fs.readFileSync(onboardingPath, 'utf8');
    
    // Extract leagueData object structure from onboarding.js
    // We can evaluate it or parse it. Let's do a simple regex or dynamic require if we extract it.
    // Let's extract between "const leagueData = {" and "};"
    const startIdx = onboardingContent.indexOf("const leagueData = {");
    const endIdx = onboardingContent.indexOf("};", startIdx);
    const leagueDataStr = onboardingContent.substring(startIdx, endIdx + 2);
    
    // Convert to js object by evaluating it in a safe context
    const leagueData = eval(`(function() { ${leagueDataStr}; return leagueData; })()`);
    const countryKeys = Object.keys(leagueData);
    
    const dbLeagues = await League.findAll();
    
    console.log("Country Key in onboarding.js -> index+1 -> DB League ID for that Country");
    console.log("-----------------------------------------------------------------------");
    
    countryKeys.forEach((country, idx) => {
      const onboardingId = idx + 1;
      const dbLeaguesForCountry = dbLeagues.filter(l => l.country === country);
      const dbIds = dbLeaguesForCountry.map(l => l.id).join(', ');
      console.log(`Onboarding Index ${onboardingId}: "${country}" -> DB ID(s): [${dbIds || 'NOT IN DB'}]`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
