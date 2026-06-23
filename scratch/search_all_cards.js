const fs = require('fs');

const logPath = 'C:/Users/franc/.gemini/antigravity/brain/2a1443ad-509f-4b3f-b4bf-1321185a80f6/.system_generated/logs/transcript.jsonl';
if (!fs.existsSync(logPath)) {
  console.error("Log file doesn't exist");
  process.exit(1);
}

const content = fs.readFileSync(logPath, 'utf8');
const lines = content.split('\n');
let count = 0;
for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const obj = JSON.parse(line);
    // Find all steps containing createPlayerCard
    const lineStr = JSON.stringify(obj);
    if (lineStr.includes('createPlayerCard') && lineStr.includes('card.innerHTML')) {
      console.log(`Step ${obj.step_index}: type=${obj.type}, source=${obj.source}, len=${lineStr.length}`);
      count++;
    }
  } catch (e) {}
}
console.log(`Found ${count} candidates`);
