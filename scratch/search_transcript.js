const fs = require('fs');
const path = require('path');

const logPath = 'C:/Users/franc/.gemini/antigravity/brain/2a1443ad-509f-4b3f-b4bf-1321185a80f6/.system_generated/logs/transcript.jsonl';
if (!fs.existsSync(logPath)) {
  console.error("Log file doesn't exist");
  process.exit(1);
}

const content = fs.readFileSync(logPath, 'utf8');
const lines = content.split('\n');
for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const obj = JSON.parse(line);
    if (obj.step_index === 703) {
      console.log("Found step 703!");
      // Write content to a file
      fs.writeFileSync('scratch/step_703.js', obj.content);
      console.log("Wrote step 703 to scratch/step_703.js");
      break;
    }
  } catch (e) {
    // ignore
  }
}
