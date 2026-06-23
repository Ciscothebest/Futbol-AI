const fs = require('fs');
const path = require('path');

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
    if (obj.tool_calls) {
      for (const tc of obj.tool_calls) {
        if (tc.name === 'replace_file_content' || tc.name === 'write_to_file') {
          const args = typeof tc.args === 'string' ? JSON.parse(tc.args) : tc.args;
          const target = args.TargetFile || args.AbsolutePath;
          if (target && target.includes('app.js')) {
            console.log(`Step ${obj.step_index}: name=${tc.name}, target=${target}, keys=${Object.keys(args)}`);
            fs.writeFileSync(`scratch/step_${obj.step_index}_write.json`, JSON.stringify(args, null, 2));
            count++;
          }
        }
      }
    }
  } catch (e) {}
}
console.log(`Found ${count} write steps`);
