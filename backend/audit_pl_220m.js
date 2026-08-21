const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, 'knowledge/players.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const list = data.players || [];

const plAt220M = list.filter(p => p.marketValue === 220000000);
console.log(`Total players with marketValue === €220M: ${plAt220M.length}`);

console.log('Sample players at €220M:');
plAt220M.slice(0, 15).forEach(p => {
  console.log(`- ${p.name} (${p.currentTeam} - ${p.league})`);
});
