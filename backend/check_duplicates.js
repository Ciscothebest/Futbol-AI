const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const dirPath = 'C:/Users/franc/OneDrive/Escritorio/logos_api/ligas';
const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.png'));

const hashToFiles = {};
files.forEach(f => {
  const fullPath = path.join(dirPath, f);
  const hash = crypto.createHash('md5').update(fs.readFileSync(fullPath)).digest('hex');
  hashToFiles[hash] = hashToFiles[hash] || [];
  hashToFiles[hash].push(f);
});

console.log("Groups of identical logo files:");
console.log("------------------------------");
Object.entries(hashToFiles).forEach(([hash, group]) => {
  if (group.length > 1) {
    console.log(`Hash: ${hash} (Size: ${fs.statSync(path.join(dirPath, group[0])).size} bytes)`);
    console.log(`  Files: ${group.join(', ')}`);
  }
});
process.exit(0);
