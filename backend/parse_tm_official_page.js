const fs = require('fs');
const path = require('path');

const contentPath = 'C:\\Users\\franc\\.gemini\\antigravity\\brain\\ce3c8ebf-1c83-446a-918f-0e5c2bc2e0cb\\.system_generated\\steps\\601\\content.md';
const html = fs.readFileSync(contentPath, 'utf8');

// Parse table rows
// <a href="/.../profil/spieler/..." title="...">Player Name</a>
// <a href="/.../marktwertverlauf/spieler/...">200,00 mill. €</a>

const rows = [];
const rowRegex = /<tr class="(?:odd|even)">([\s\S]*?)<\/tr>/g;
let rMatch;

while ((rMatch = rowRegex.exec(html)) !== null) {
  const rowHtml = rMatch[1];
  const nameMatch = /<a [^>]*title="([^"]+)"[^>]*>([^<]+)<\/a>/.exec(rowHtml);
  const valMatch = /<a [^>]*href="[^"]*marktwertverlauf[^"]*"[^>]*>([^<]+)<\/a>/.exec(rowHtml) || /<td class="rechts hauptlink">[\s\S]*?<b>([^<]+)<\/b>/.exec(rowHtml) || /<td class="rechts hauptlink">[\s\S]*?(\d+[\d,.]*\s*(?:mill\.|mil\.|milliouner|\u20ac))/.exec(rowHtml);

  if (nameMatch) {
    const name = nameMatch[2].trim();
    const title = nameMatch[1].trim();
    const val = valMatch ? valMatch[1].trim() : 'N/A';
    rows.push({ name, title, val, rowHtml });
  }
}

console.log(`Extracted ${rows.length} players from Transfermarkt page HTML:\n`);
rows.slice(0, 30).forEach((r, i) => {
  console.log(`${i + 1}. ${r.name} (${r.title}): ${r.val}`);
});
