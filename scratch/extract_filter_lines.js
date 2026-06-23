const fs = require('fs');

const logPath = 'C:/Users/franc/.gemini/antigravity/brain/2a1443ad-509f-4b3f-b4bf-1321185a80f6/.system_generated/logs/transcript.jsonl';
if (fs.existsSync(logPath)) {
  const content = fs.readFileSync(logPath, 'utf8');
  const lines = content.split('\n');
  const line = lines[1055];
  try {
    const obj = JSON.parse(line);
    fs.writeFileSync('scratch/step_1055.json', JSON.stringify(obj, null, 2));
    console.log("Successfully wrote step 1055 to scratch/step_1055.json");
  } catch (e) {
    console.error("Failed to parse/write step 1055:", e);
  }
}
