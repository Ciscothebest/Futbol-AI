const fs = require('fs');
const path = require('path');

const allTeams = JSON.parse(fs.readFileSync(path.join(__dirname, 'all_1205_teams.json'), 'utf-8'));
const fullData = JSON.parse(fs.readFileSync(path.join(__dirname, 'tm_full_calendars_2026.json'), 'utf-8'));

// Build team -> official league mapping
const teamToLeague = {};
const leagueTeams = {};

for (const item of allTeams) {
  const tName = typeof item === 'string' ? item : item.name;
  const lName = typeof item === 'string' ? "Liga Oficial" : (item.league || "Liga Oficial");
  teamToLeague[tName] = lName;
  if (!leagueTeams[lName]) leagueTeams[lName] = [];
  leagueTeams[lName].push(tName);
}

console.log(`Total Ligas en la aplicación: ${Object.keys(leagueTeams).length}`);
console.log(`Total Equipos en la aplicación: ${allTeams.length}`);

// Standard expected league match counts based on team counts in double round robin (N teams => (N-1)*2 matches)
function getExpectedLeagueMatches(numTeams, leagueName) {
  const lUpper = leagueName.toUpperCase();
  if (lUpper.includes("LALIGA") || lUpper.includes("PREMIER") || lUpper.includes("SERIE A")) return 38;
  if (lUpper.includes("BUNDESLIGA") || lUpper.includes("LIGUE 1") || lUpper.includes("EREDIVISIE") || lUpper.includes("PRIMEIRA")) return 34;
  if (lUpper.includes("MLS")) return 34;
  if (lUpper.includes("MX")) return 34;
  if (numTeams >= 20) return 38;
  if (numTeams >= 18) return 34;
  if (numTeams >= 16) return 30;
  if (numTeams >= 14) return 26;
  if (numTeams >= 12) return 22;
  if (numTeams >= 10) return 18;
  return Math.max(10, (numTeams - 1) * 2);
}

// Universal Domestic Filtering Algorithm across ALL 79+ leagues
const universalNormalized = {};

for (const [club, matches] of Object.entries(fullData)) {
  const officialLeague = teamToLeague[club] || "Liga Oficial";
  const numTeamsInLeague = (leagueTeams[officialLeague] || []).length || 18;
  const targetMatches = getExpectedLeagueMatches(numTeamsInLeague, officialLeague);

  // Filter out any non-league cup/friendly competitions
  const domesticMatches = matches.filter(m => {
    const comp = (m.competition || "").toLowerCase();
    // Exclude cups, supercups, continental tournaments
    const isCup = comp.includes("copa") || comp.includes("cup") || comp.includes("pokal") || 
                  comp.includes("coppa") || comp.includes("coupe") || comp.includes("supercopa") || 
                  comp.includes("super cup") || comp.includes("champions") || comp.includes("europa") || 
                  comp.includes("conference") || comp.includes("libertadores") || comp.includes("sudamericana") ||
                  comp.includes("friendly") || comp.includes("amistoso");
    return !isCup;
  });

  // If domestic filtering left too few matches, fall back to matches list
  const baseMatches = domesticMatches.length >= 5 ? domesticMatches : matches;

  // Deduplicate by opponent + home/away
  const uniqueMatches = [];
  const seenKey = new Set();

  for (const m of baseMatches) {
    const opp = m.opponent;
    const key = `${opp}_${m.home ? 'H' : 'A'}`;
    if (!seenKey.has(key)) {
      seenKey.add(key);
      uniqueMatches.push({
        ...m,
        competition: officialLeague
      });
    }
  }

  // Cap at exact target match count for domestic league
  const cappedMatches = uniqueMatches.slice(0, targetMatches);
  universalNormalized[club] = cappedMatches;
}

// Enforce Mirror Pairings across ALL leagues
for (const [clubA, matchesA] of Object.entries(universalNormalized)) {
  for (const mA of matchesA) {
    const clubB = mA.opponent;
    if (universalNormalized[clubB]) {
      const matchesB = universalNormalized[clubB];
      const mirrorExists = matchesB.some(mB => mB.opponent === clubA && mB.home === !mA.home);
      if (!mirrorExists) {
        matchesB.push({
          opponent: clubA,
          dateEs: mA.dateEs,
          dateEn: mA.dateEn,
          isoDate: mA.isoDate,
          competition: mA.competition,
          home: !mA.home
        });
      }
    }
  }
}

// Write universally normalized dataset
fs.writeFileSync(path.join(__dirname, 'tm_full_calendars_2026.json'), JSON.stringify(universalNormalized, null, 2), 'utf-8');
console.log(`\n🎉 FILTRADO DOMÉSTICO UNIVERSAL APLICADO A LAS ${Object.keys(leagueTeams).length} LIGAS Y ${Object.keys(universalNormalized).length} CLUBES.`);

// Apply to app.js and sync to Desktop local folder
require('./apply_full_calendars');
