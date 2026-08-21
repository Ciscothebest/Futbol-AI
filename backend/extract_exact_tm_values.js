const fs = require('fs');

const contentPath = 'C:/Users/franc/.gemini/antigravity/brain/ce3c8ebf-1c83-446a-918f-0e5c2bc2e0cb/.system_generated/steps/601/content.md';
const html = fs.readFileSync(contentPath, 'utf8');

const regex = /<td class="hauptlink">\s*<a [^>]*title="([^"]+)"[\s\S]*?<td class="rechts hauptlink">[\s\S]*?<a [^>]*>([^<]+)<\/a>/g;

let m;
const tmRealValues = [];

while ((m = regex.exec(html)) !== null) {
  const name = m[1].trim();
  const valStr = m[2].trim();
  let numericVal = 0;

  if (valStr.includes('mill.')) {
    const num = parseFloat(valStr.replace(',', '.').replace(/[^\d.]/g, ''));
    numericVal = Math.round(num * 1000000);
  } else if (valStr.includes('mil.')) {
    const num = parseFloat(valStr.replace(',', '.').replace(/[^\d.]/g, ''));
    numericVal = Math.round(num * 1000);
  }
  tmRealValues.push({ name, valStr, numericVal });
}

console.log(`Extracted ${tmRealValues.length} official market values from Transfermarkt:\n`);
tmRealValues.forEach((p, i) => {
  console.log(`${i + 1}. ${p.name}: ${p.valStr} -> €${(p.numericVal / 1000000).toFixed(1)}M (${p.numericVal})`);
});
