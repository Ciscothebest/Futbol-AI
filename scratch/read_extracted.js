const fs = require('fs');
const path = require('path');

const dir = 'scratch';
const files = fs.readdirSync(dir).filter(f => f.startsWith('step_') && f.endsWith('_card.txt'));

for (const file of files) {
  const filePath = path.join(dir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('function createPlayerCard')) {
    // Check if it's truncated
    const isTruncated = content.includes('truncated');
    console.log(`File ${file}: has createPlayerCard, isTruncated=${isTruncated}, length=${content.length}`);
    if (!isTruncated) {
      // Find the createPlayerCard implementation in it
      const startIdx = content.indexOf('function createPlayerCard');
      const endIdx = content.indexOf('function openPlayerModal', startIdx);
      if (startIdx !== -1) {
        console.log("=== FOUND FULL CODE IN " + file + " ===");
        console.log(content.substring(startIdx, endIdx !== -1 ? endIdx : startIdx + 2000));
      }
    }
  }
}
