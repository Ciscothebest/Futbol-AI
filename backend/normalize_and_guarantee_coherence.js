const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, 'tm_full_calendars_2026.json');
if (!fs.existsSync(jsonPath)) {
  console.error("tm_full_calendars_2026.json not found!");
  process.exit(1);
}

const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
console.log(`Loaded ${Object.keys(rawData).length} clubs for coherence normalization.`);

const LEAGUE_DEFINITIONS = {
  "La Liga": {
    targetMatches: 38,
    teams: [
      "Real Madrid", "FC Barcelona", "Atlético de Madrid", "Deportivo Alavés", "Athletic Club",
      "Sevilla FC", "Real Betis", "Valencia CF", "Villarreal CF", "Real Sociedad",
      "Celta de Vigo", "Girona FC", "Getafe CF", "Rayo Vallecano", "RCD Mallorca", "Osasuna",
      "RCD Espanyol", "Real Valladolid", "CD Leganés", "UD Las Palmas"
    ]
  },
  "Premier League": {
    targetMatches: 38,
    teams: [
      "Manchester City", "Arsenal FC", "Arsenal", "Liverpool", "Chelsea", "Manchester United",
      "Tottenham Hotspur", "Tottenham", "Newcastle United", "Aston Villa", "West Ham United",
      "Brighton & Hove Albion", "Brighton", "Nottingham Forest", "Everton", "Wolverhampton Wanderers",
      "Crystal Palace", "Fulham", "Brentford", "AFC Bournemouth", "Bournemouth", "Leicester City",
      "Ipswich Town", "Southampton FC"
    ]
  },
  "Bundesliga": {
    targetMatches: 34,
    teams: [
      "Bayern Munich", "Bayern München", "Borussia Dortmund", "Bayer 04 Leverkusen", "RB Leipzig",
      "Eintracht Frankfurt", "VfB Stuttgart", "VfL Wolfsburg", "Borussia Mönchengladbach",
      "SV Werder Bremen", "TSG 1899 Hoffenheim", "SC Freiburg", "1.FC Union Berlin"
    ]
  },
  "Serie A": {
    targetMatches: 38,
    teams: [
      "Juventus FC", "Juventus", "Inter Milan", "Inter", "AC Milan", "SSC Napoli", "AS Roma", "SS Lazio",
      "Atalanta BC", "ACF Fiorentina", "Bologna FC 1909", "Torino FC", "Udinese Calcio"
    ]
  },
  "Ligue 1": {
    targetMatches: 34,
    teams: [
      "Paris Saint-Germain", "Olympique Marseille", "Olympique Lyonnais", "AS Monaco",
      "LOSC Lille", "Stade Rennais FC", "RC Lens", "OGC Nice"
    ]
  },
  "Eredivisie": {
    targetMatches: 34,
    teams: [
      "Ajax Amsterdam", "PSV Eindhoven", "Feyenoord"
    ]
  },
  "Primeira Liga": {
    targetMatches: 34,
    teams: [
      "Benfica", "FC Porto", "Sporting CP"
    ]
  },
  "Saudi Pro League": {
    targetMatches: 34,
    teams: [
      "Al-Hilal SFC", "Al-Nassr FC"
    ]
  }
};

function normalizeTeamName(name) {
  if (!name) return "";
  let clean = name.replace(/\s*\(\d+\.\)\s*/g, '').replace(/\s*U\d+\s*/gi, '').trim();
  const aliasMap = {
    "Bayern München": "Bayern Munich",
    "Arsenal FC": "Arsenal",
    "Tottenham Hotspur": "Tottenham",
    "AFC Bournemouth": "Bournemouth",
    "Brighton & Hove Albion": "Brighton",
    "Inter Milan": "Inter",
    "Juventus FC": "Juventus"
  };
  return aliasMap[clean] || clean;
}

const normalizedData = {};

// Step 1: Clean & Filter strictly by Domestic League or primary competition for known teams
for (const [club, matches] of Object.entries(rawData)) {
  const normClub = normalizeTeamName(club);
  
  // Find if club belongs to a standard league definition
  let targetDef = null;
  let targetCompName = null;
  for (const [leagueName, def] of Object.entries(LEAGUE_DEFINITIONS)) {
    if (def.teams.some(t => normalizeTeamName(t) === normClub)) {
      targetDef = def;
      targetCompName = leagueName;
      break;
    }
  }

  let leagueMatches = matches;
  if (targetCompName) {
    // Filter matches to domestic league only
    leagueMatches = matches.filter(m => {
      const comp = (m.competition || "").toLowerCase();
      if (comp.includes("champions") || comp.includes("europa") || comp.includes("conference") ||
          comp.includes("copa del rey") || comp.includes("fa cup") || comp.includes("dfb-pokal") ||
          comp.includes("coppa italia") || comp.includes("coupe de france") || comp.includes("supercopa") || comp.includes("super cup")) {
        return false;
      }
      return true;
    });
  }

  // Deduplicate matches by (opponent + home/away) or date
  const uniqueMatches = [];
  const seenKey = new Set();

  for (const m of leagueMatches) {
    const opp = normalizeTeamName(m.opponent);
    const key = `${opp}_${m.home ? 'H' : 'A'}`;
    if (!seenKey.has(key)) {
      seenKey.add(key);
      uniqueMatches.push({
        ...m,
        opponent: opp,
        competition: targetCompName || m.competition || "Liga Oficial"
      });
    }
  }

  // Trim if exceeds target matches (e.g. 38 for La Liga/Premier/Serie A, 34 for Bundesliga/Ligue 1)
  let finalMatches = uniqueMatches;
  if (targetDef && finalMatches.length > targetDef.targetMatches) {
    finalMatches = finalMatches.slice(0, targetDef.targetMatches);
  }

  normalizedData[normClub] = finalMatches;
}

// Step 2: Enforce Mirror Facing Coherence (Team A Home vs Team B Away <=> Team B Away vs Team A Home)
for (const [clubA, matchesA] of Object.entries(normalizedData)) {
  for (const mA of matchesA) {
    const clubB = mA.opponent;
    if (normalizedData[clubB]) {
      const matchesB = normalizedData[clubB];
      const mirrorExists = matchesB.some(mB => 
        normalizeTeamName(mB.opponent) === clubA && mB.home === !mA.home
      );
      if (!mirrorExists) {
        // Add mirror match to Team B for 100% coherence!
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

// Write normalized fixtures to tm_full_calendars_2026.json
fs.writeFileSync(jsonPath, JSON.stringify(normalizedData, null, 2), 'utf-8');
console.log(`✅ Normalización completada con éxito. ${Object.keys(normalizedData).length} clubes procesados y coherentes.`);

// Run apply_full_calendars to update app.js and desktop sync
require('./apply_full_calendars');
