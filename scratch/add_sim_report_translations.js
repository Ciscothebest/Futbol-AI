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
  const targetEs = "section_simulations: '🎮 Simulador de Partidos IA',";
  const replacementEs = "section_simulations: '🎮 Simulador de Partidos IA', sim_report_title: 'Reporte de Simulación IA',";
  
  if (content.includes(targetEs) && !content.includes("sim_report_title: 'Reporte de Simulación IA'")) {
    content = content.replace(targetEs, replacementEs);
    console.log(`Added Spanish sim_report_title in ${filePath}`);
  }
  
  // English translation additions (with or without trailing comma)
  const targetEn1 = "section_simulations: '🎮 AI Match Simulator',";
  const targetEn2 = "section_simulations: '🎮 AI Match Simulator'";
  
  if (content.includes(targetEn1) && !content.includes("sim_report_title: 'AI Simulation Report'")) {
    content = content.replace(targetEn1, "section_simulations: '🎮 AI Match Simulator', sim_report_title: 'AI Simulation Report',");
    console.log(`Added English sim_report_title (case 1) in ${filePath}`);
  } else if (content.includes(targetEn2) && !content.includes("sim_report_title: 'AI Simulation Report'")) {
    content = content.replace(targetEn2, "section_simulations: '🎮 AI Match Simulator', sim_report_title: 'AI Simulation Report'");
    console.log(`Added English sim_report_title (case 2) in ${filePath}`);
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
});

console.log('Done with report translations.');
