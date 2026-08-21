const fs = require('fs');

const filePath = 'C:/Users/franc/OneDrive/Escritorio/Futbol AI Local/frontend/app.js';
let content = fs.readFileSync(filePath, 'utf8');

const normalized = content.replace(/\r\n/g, '\n');

// 1. Update matchLeague in applyFilters
const oldMatchLeague = `      const matchLeague = !leagueFilter || p.league === leagueFilter;`;
const newMatchLeague = `      const matchLeague = !leagueFilter || 
        p.league === leagueFilter || 
        (p.league && normalizeString(p.league) === normalizeString(leagueFilter)) ||
        (p.league && (p.league.toLowerCase().includes('ldf') || p.league.toLowerCase().includes('dominicana')) && (leagueFilter.toLowerCase().includes('ldf') || leagueFilter.toLowerCase().includes('dominicana')));`;

// 2. Update top7Leagues in populateLeagueFilter
const oldTop7 = `  const top7Leagues = new Set(leaguesByPlayerCount.slice(0, 7));`;
const newTop7 = `  const top7Leagues = new Set(leaguesByPlayerCount.slice(0, 7));
  for (const l of leaguesByPlayerCount) {
    if (l.includes('LDF') || l.includes('Dominicana')) {
      top7Leagues.add(l);
    }
  }`;

// 3. Update updateTeamDropdown
const oldTeamFilter = `  const teams = [...new Set(allPlayers
    .filter(p => !leagueFilter || p.league === leagueFilter)
    .map(p => p.currentTeam)
    .filter(Boolean))].sort();`;

const newTeamFilter = `  const teams = [...new Set(allPlayers
    .filter(p => {
      if (!leagueFilter) return true;
      if (p.league === leagueFilter) return true;
      if (p.league && normalizeString(p.league) === normalizeString(leagueFilter)) return true;
      if (p.league && (p.league.toLowerCase().includes('ldf') || p.league.toLowerCase().includes('dominicana')) && (leagueFilter.toLowerCase().includes('ldf') || leagueFilter.toLowerCase().includes('dominicana'))) return true;
      return false;
    })
    .map(p => p.currentTeam)
    .filter(Boolean))].sort();`;

let updated = normalized;

if (updated.includes(oldMatchLeague)) {
  updated = updated.replace(oldMatchLeague, newMatchLeague);
}

if (updated.includes(oldTop7)) {
  updated = updated.replace(oldTop7, newTop7);
}

if (updated.includes(oldTeamFilter)) {
  updated = updated.replace(oldTeamFilter, newTeamFilter);
}

fs.writeFileSync(filePath, updated, 'utf8');
console.log('SUCCESSFULLY APPLIED LDF FILTER FIXES IN APP.JS!');
