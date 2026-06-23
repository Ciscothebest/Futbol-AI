const fs = require('fs');
const path = require('path');

const cssPaths = [
  path.join(__dirname, '..', 'frontend', 'profile.css'),
  path.join(__dirname, '..', 'android-app', 'app', 'src', 'main', 'assets', 'frontend', 'profile.css')
];

cssPaths.forEach(cssPath => {
  if (!fs.existsSync(cssPath)) {
    console.log(`CSS file not found: ${cssPath}`);
    return;
  }
  
  let content = fs.readFileSync(cssPath, 'utf8');
  
  const target = `
.sim-loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(4, 9, 17, 0.96);
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: var(--radius-lg);
  backdrop-filter: blur(5px);
}
`.trim();

  const replacement = `
.sim-loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(4, 9, 17, 0.96);
  z-index: 21000;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(8px);
}
`.trim();

  if (content.includes(target)) {
    content = content.replace(target, replacement);
    console.log(`Updated sim-loading-overlay in ${cssPath}`);
  } else {
    // Attempt relaxed match
    const targetRelaxed = `position: absolute;\n  inset: 0;\n  background: rgba(4, 9, 17, 0.96);\n  z-index: 100;`;
    const replacementRelaxed = `position: fixed;\n  inset: 0;\n  background: rgba(4, 9, 17, 0.96);\n  z-index: 21000;`;
    if (content.includes(targetRelaxed)) {
      content = content.replace(targetRelaxed, replacementRelaxed);
      console.log(`Updated sim-loading-overlay (relaxed match) in ${cssPath}`);
    } else {
      console.log(`Target not found in ${cssPath}`);
    }
  }
  
  fs.writeFileSync(cssPath, content, 'utf8');
});

console.log('Done.');
