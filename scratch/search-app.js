const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '../frontend/app.js');
const appJs = fs.readFileSync(appPath, 'utf8');

const queries = ['initDashboard', 'goToSection', 'section-home', 'active', 'user-profile', 'onboardingComplete'];

queries.forEach(q => {
  console.log(`=== Matches for "${q}": ===`);
  const lines = appJs.split('\n');
  lines.forEach((line, idx) => {
    if (line.toLowerCase().includes(q.toLowerCase())) {
      console.log(`${idx + 1}: ${line.trim()}`);
    }
  });
});
