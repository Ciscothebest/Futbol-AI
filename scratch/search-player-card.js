const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '../frontend/app.js');
const appJs = fs.readFileSync(appPath, 'utf8');

const lines = appJs.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('class=') && (line.includes('player-card') || line.includes('card') || line.includes('playerCard'))) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
