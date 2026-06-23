const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '../frontend/styles.css');
const css = fs.readFileSync(cssPath, 'utf8');

const queries = ['onboarding', 'step-container', 'club-selection', 'clubs-grid'];

queries.forEach(q => {
  console.log(`=== Matches for "${q}": ===`);
  const lines = css.split('\n');
  lines.forEach((line, idx) => {
    if (line.toLowerCase().includes(q.toLowerCase())) {
      console.log(`${idx + 1}: ${line.trim()}`);
    }
  });
});
