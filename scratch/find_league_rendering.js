const fs = require('fs');

const code = fs.readFileSync('frontend/app.js', 'utf8');
const lines = code.split('\n');

console.log('--- Search Results for ${p.league} ---');
lines.forEach((line, idx) => {
  if (line.includes('${p.league}')) {
    console.log(`Line ${idx+1}: ${line.trim()}`);
  }
});

console.log('\n--- Search Results for detailsEl ---');
lines.forEach((line, idx) => {
  if (line.includes('detailsEl') && (line.includes('league') || line.includes('country') || line.includes('innerHTML') || line.includes('textContent'))) {
    console.log(`Line ${idx+1}: ${line.trim()}`);
  }
});

console.log('\n--- Search Results for simulator leagueEl ---');
lines.forEach((line, idx) => {
  if (line.includes('leagueEl') && (line.includes('innerHTML') || line.includes('textContent'))) {
    console.log(`Line ${idx+1}: ${line.trim()}`);
  }
});
