const fs = require('fs');
const path = require('path');

const filePaths = [
  path.join(__dirname, '..', 'frontend', 'app.js'),
  path.join(__dirname, '..', 'android-app', 'app', 'src', 'main', 'assets', 'frontend', 'app.js')
];

filePaths.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Spanish translation additions
  // Find "nav_compare: 'Comparar', nav_predictions: 'Predicciones'," and append simulations
  const targetEs = "nav_compare: 'Comparar', nav_predictions: 'Predicciones',";
  const replacementEs = "nav_compare: 'Comparar', nav_predictions: 'Predicciones', nav_simulations: 'Simulaciones', section_simulations: '🎮 Simulador de Partidos IA',";
  
  if (content.includes(targetEs) && !content.includes("nav_simulations: 'Simulaciones'")) {
    content = content.replace(targetEs, replacementEs);
    console.log(`Added Spanish translations in ${filePath}`);
  }
  
  // English translation additions
  const targetEn = "nav_compare: 'Compare', nav_predictions: 'Predictions',";
  const replacementEn = "nav_compare: 'Compare', nav_predictions: 'Predictions', nav_simulations: 'Simulations', section_simulations: '🎮 AI Match Simulator',";
  
  if (content.includes(targetEn) && !content.includes("nav_simulations: 'Simulations'")) {
    content = content.replace(targetEn, replacementEn);
    console.log(`Added English translations in ${filePath}`);
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
});

console.log('Done with translations.');
