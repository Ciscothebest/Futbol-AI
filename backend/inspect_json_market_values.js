const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, 'knowledge/players.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const list = Array.isArray(data) ? data : (data.players || []);

console.log(`Total players in players.json: ${list.length}`);

const valueCounts = {};
list.forEach(p => {
  const v = p.marketValue;
  valueCounts[v] = (valueCounts[v] || 0) + 1;
});

console.log('Value counts sample:');
console.log(Object.entries(valueCounts).slice(0, 20));

console.log('\nSample 10 players from players.json:');
list.slice(0, 10).forEach(p => {
  console.log(`- ${p.id} (${p.name}): marketValue = ${p.marketValue} (€${(p.marketValue / 1000000).toFixed(1)}M)`);
});
