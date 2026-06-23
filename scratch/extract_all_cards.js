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
    const lineStr = JSON.stringify(obj);
    if (lineStr.includes('player-card') || lineStr.includes('player-avatar-tactical')) {
      fs.writeFileSync(`scratch/step_${obj.step_index}_card.txt`, JSON.stringify(obj, null, 2));
      console.log(`Wrote step ${obj.step_index} containing card to scratch/step_${obj.step_index}_card.txt`);
      count++;
    }
  } catch (e) {}
}
console.log(`Found ${count} steps`);
