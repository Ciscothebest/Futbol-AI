const fs = require('fs');

const contentPath = 'C:\\Users\\franc\\.gemini\\antigravity\\brain\\ce3c8ebf-1c83-446a-918f-0e5c2bc2e0cb\\.system_generated\\steps\\601\\content.md';
const html = fs.readFileSync(contentPath, 'utf8');

const rowRegex = /<tr class="(?:odd|even)">([\s\S]*?)<\/tr>/g;
let rMatch = rowRegex.exec(html);

if (rMatch) {
  console.log('=== ROW 1 HTML ===');
  console.log(rMatch[1]);
}
