const fs = require('fs');
const path = require('path');

const dir = 'scratch';
const files = fs.readdirSync(dir).filter(f => f.startsWith('step_') && f.endsWith('_write.json'));

for (const file of files) {
  const filePath = path.join(dir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const hasTruncated = content.includes('truncated');
  console.log(`File ${file}: length=${content.length}, hasTruncated=${hasTruncated}`);
}
