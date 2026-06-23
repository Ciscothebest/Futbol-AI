const fs = require('fs');
const path = require('path');

const dir = 'C:/Users/franc/.gemini/antigravity/brain/2a1443ad-509f-4b3f-b4bf-1321185a80f6/browser';
if (fs.existsSync(dir)) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('createPlayerCard') || content.includes('openPlayerModal')) {
      console.log(`Scratchpad ${file} has player card or modal!`);
      console.log(content.substring(0, 1000));
    }
  }
}
