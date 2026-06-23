const fs = require('fs');

const logPath = 'C:/Users/franc/.gemini/antigravity/brain/2a1443ad-509f-4b3f-b4bf-1321185a80f6/.system_generated/logs/transcript.jsonl';
if (fs.existsSync(logPath)) {
  const content = fs.readFileSync(logPath, 'utf8');
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('expediente') || line.includes('Expediente')) {
      console.log(`Line ${i} contains expediente. Length = ${line.length}`);
      // Find where 'expediente' is and print some characters around it
      let idx = line.indexOf('expediente');
      if (idx === -1) idx = line.indexOf('Expediente');
      console.log(line.substring(Math.max(0, idx - 150), Math.min(line.length, idx + 300)));
    }
  }
}
