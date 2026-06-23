const fs = require('fs');
const path = require('path');

const srcBase = path.join(__dirname, '..');
const destBase = 'C:\\Users\\franc\\OneDrive\\Escritorio\\Futbol AI Local';

const filesToSync = [
  'frontend/index.html',
  'frontend/app.js',
  'frontend/landing.html',
  'frontend/onboarding.js',
  'frontend/styles.css',
  'frontend/profile.css',
  'android-app/app/src/main/assets/frontend/index.html',
  'android-app/app/src/main/assets/frontend/app.js',
  'android-app/app/src/main/assets/frontend/landing.html',
  'android-app/app/src/main/assets/frontend/onboarding.js',
  'android-app/app/src/main/assets/frontend/styles.css',
  'android-app/app/src/main/assets/frontend/profile.css',
  'backend/server.js',
  'backend/models/User.js',
  'backend/routes/auth.js',
  'backend/routes/payments.js',
  'backend/team-logos.json',
  'backend/knowledge/players.json',
  'backend/league_identities.json',
  'backend/league_identities_progress.json'
];

filesToSync.forEach(relPath => {
  const srcPath = path.join(srcBase, relPath);
  const destPath = path.join(destBase, relPath);
  
  if (!fs.existsSync(srcPath)) {
    console.log(`Source file does not exist: ${srcPath}`);
    return;
  }
  
  // Ensure target directory exists
  const destDir = path.dirname(destPath);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
    console.log(`Created directory: ${destDir}`);
  }
  
  // Copy file
  fs.copyFileSync(srcPath, destPath);
  console.log(`Copied ${relPath} -> ${destPath}`);
});

console.log('Sync completed successfully.');
