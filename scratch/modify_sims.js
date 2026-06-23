const fs = require('fs');
const path = require('path');

// Paths
const webAppJsPath = path.join(__dirname, '..', 'frontend', 'app.js');
const androidAppJsPath = path.join(__dirname, '..', 'android-app', 'app', 'src', 'main', 'assets', 'frontend', 'app.js');

// 1. Read frontend/app.js
const webJs = fs.readFileSync(webAppJsPath, 'utf8');
const webLines = webJs.split('\n');

// Extract simulation block (lines 3674 to 4058, which is index 3673 to 4057 inclusive)
const simBlockLines = webLines.slice(3673, 4058);
const simBlockText = simBlockLines.join('\n');

console.log('Extracted simulation block: lines ' + simBlockLines.length);

// 2. Read android-app/app.js
let androidJs = fs.readFileSync(androidAppJsPath, 'utf8');

// Find insertion point before 'async function incrementUserStat(key, data = {})'
const targetIncrement = 'async function incrementUserStat(key, data = {})';
if (!androidJs.includes(targetIncrement)) {
  console.error('ERROR: Could not find target increment in android app.js');
  process.exit(1);
}

// Check if block already exists
if (androidJs.includes('function initSimulationsSection()')) {
  console.log('Simulation block already exists in android app.js, skipping insertion.');
} else {
  // Insert simulation block before targetIncrement
  const insertionIndex = androidJs.indexOf(targetIncrement);
  const part1 = androidJs.substring(0, insertionIndex);
  const part2 = androidJs.substring(insertionIndex);
  androidJs = part1 + simBlockText + '\n\n' + part2;
  console.log('Inserted simulation block into android app.js');
}

// 3. Update goToSection in androidJs
const targetGoToAndroid = `  if (name === 'profile') renderProfile();`;
const replacementGoToAndroid = `  if (name === 'profile') renderProfile();\n  if (name === 'simulations') initSimulationsSection();`;

if (androidJs.includes(targetGoToAndroid) && !androidJs.includes(`if (name === 'simulations') initSimulationsSection();`)) {
  androidJs = androidJs.replace(targetGoToAndroid, replacementGoToAndroid);
  console.log('Updated goToSection in android app.js');
} else {
  console.log('goToSection in android app.js already updated or target not found.');
}

// Write back androidJs
fs.writeFileSync(androidAppJsPath, androidJs, 'utf8');

// 4. Update goToSection in webJs
let webJsUpdated = fs.readFileSync(webAppJsPath, 'utf8');
if (webJsUpdated.includes(targetGoToAndroid) && !webJsUpdated.includes(`if (name === 'simulations') initSimulationsSection();`)) {
  webJsUpdated = webJsUpdated.replace(targetGoToAndroid, replacementGoToAndroid);
  fs.writeFileSync(webAppJsPath, webJsUpdated, 'utf8');
  console.log('Updated goToSection in frontend app.js');
} else {
  console.log('goToSection in frontend app.js already updated or target not found.');
}

console.log('Done modifying JS files.');
