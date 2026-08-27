const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, 'tm_full_calendars_2026.json');
if (!fs.existsSync(jsonPath)) {
  console.error("tm_full_calendars_2026.json does not exist!");
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
console.log(`Auditing ${Object.keys(data).length} clubs...`);

const leagueStats = {};

for (const [club, matches] of Object.entries(data)) {
  const compCounts = {};
  for (const m of matches) {
    const comp = m.competition || "Liga Oficial";
    compCounts[comp] = (compCounts[comp] || 0) + 1;
  }
  
  let primaryComp = "Liga Oficial";
  let maxCount = 0;
  for (const [c, cnt] of Object.entries(compCounts)) {
    if (cnt > maxCount) {
      maxCount = cnt;
      primaryComp = c;
    }
  }
  
  if (!leagueStats[primaryComp]) leagueStats[primaryComp] = [];
  leagueStats[primaryComp].push({
    club,
    totalMatches: matches.length,
    primaryLeagueMatches: maxCount,
    allCompCounts: compCounts
  });
}

console.log("\n========================================================");
console.log("   AUDITORÍA DE COHERENCIA DE CALENDARIOS POR LIGA");
console.log("========================================================\n");

for (const [league, clubs] of Object.entries(leagueStats)) {
  const primaryCounts = clubs.map(c => c.primaryLeagueMatches);
  const minC = Math.min(...primaryCounts);
  const maxC = Math.max(...primaryCounts);
  
  console.log(`🏆 LIGA: "${league}" (${clubs.length} clubes)`);
  console.log(`   Rango de partidos de liga: [Min: ${minC}, Max: ${maxC}]`);
  
  if (minC !== maxC) {
    console.log(`   ⚠️ INCOHERENCIA DETECTADA EN "${league}":`);
    clubs.forEach(c => {
      if (c.primaryLeagueMatches !== maxC) {
        console.log(`      - ${c.club}: ${c.primaryLeagueMatches} partidos de liga (Total todas competencias: ${c.totalMatches})`);
      }
    });
  } else {
    console.log(`   ✅ COHERENCIA PERFECTA: Todos los ${clubs.length} equipos tienen exactamente ${minC} partidos en ${league}.`);
  }
  console.log("--------------------------------------------------------");
}
