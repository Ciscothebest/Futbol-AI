const fs = require('fs');

const logPath = 'C:/Users/franc/.gemini/antigravity/brain/2a1443ad-509f-4b3f-b4bf-1321185a80f6/.system_generated/logs/transcript.jsonl';
if (fs.existsSync(logPath)) {
  const content = fs.readFileSync(logPath, 'utf8');
  const lines = content.split('\n');
  const line = lines[951]; // 0-indexed index 951
  try {
    const obj = JSON.parse(line);
    fs.writeFileSync('scratch/step_951.js', obj.content);
    console.log("Successfully wrote step 951 content to scratch/step_951.js");
  } catch (e) {
    console.error("Failed to parse or write step 951:", e);
  }
} else {
  console.error("Log file not found");
}
