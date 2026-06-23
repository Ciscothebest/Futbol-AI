const fs = require('fs');

const logPath = 'C:/Users/franc/.gemini/antigravity/brain/2a1443ad-509f-4b3f-b4bf-1321185a80f6/.system_generated/logs/transcript.jsonl';
if (fs.existsSync(logPath)) {
  const content = fs.readFileSync(logPath, 'utf8');
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('let filtered = allPlayers.filter') || line.includes('allPlayers.filter(p =>')) {
      console.log(`Line ${i} contains filter. Length = ${line.length}`);
      const idx = line.indexOf('allPlayers.filter');
      console.log(line.substring(Math.max(0, idx - 100), Math.min(line.length, idx + 1500)));
    }
  }
}
