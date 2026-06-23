const fs = require('fs');
const path = require('path');

const files = [
  '../frontend/app.js',
  '../frontend/onboarding.js',
  '../frontend/index.html'
];

files.forEach(f => {
  const filePath = path.join(__dirname, f);
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  console.log(`=== Matches in ${f} ===`);
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.includes('selectCountryDirectly') || line.includes('goToStep2') || line.includes('goToStep3') || line.includes('selectClub') || line.includes('selectTier') || line.includes('finalizarOnboarding')) {
      console.log(`${idx + 1}: ${line.trim()}`);
    }
  });
});
