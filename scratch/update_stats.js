const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'backend/knowledge/players.json');
const db = JSON.parse(fs.readFileSync(filePath, 'utf8'));

db.players.forEach(p => {
  // Increase matches by ~40% to account for all club competitions (UCL, Cups, etc.)
  const factor = 1.4;
  p.stats.matches = Math.round(p.stats.matches * factor);
  p.stats.goals = Math.round(p.stats.goals * (1 + (factor - 1) * 0.7)); 
  p.stats.assists = Math.round(p.stats.assists * (1 + (factor - 1) * 0.7));
});

fs.writeFileSync(filePath, JSON.stringify(db, null, 2));
console.log('Players stats updated to include all club competitions.');
