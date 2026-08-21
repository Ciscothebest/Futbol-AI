const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const contentPath = 'C:/Users/franc/.gemini/antigravity/brain/ce3c8ebf-1c83-446a-918f-0e5c2bc2e0cb/.system_generated/steps/601/content.md';
const html = fs.readFileSync(contentPath, 'utf8');

const regex = /<td class="hauptlink">\s*<a [^>]*title="([^"]+)"[\s\S]*?<td class="rechts hauptlink">[\s\S]*?<a [^>]*>([^<]+)<\/a>/g;

let m;
const tmMap = {};

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
  
  // Normalize name keys for matching
  const cleanName = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  tmMap[cleanName] = numericVal;
}

console.log(`Loaded ${Object.keys(tmMap).length} exact live values from Transfermarkt.`);

// Update knowledge/players.json
const jsonPath = path.join(__dirname, 'knowledge/players.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
let list = data.players || [];
let updatedCount = 0;

list.forEach(p => {
  const cleanPName = p.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  if (tmMap[cleanPName] !== undefined) {
    console.log(`Updating ${p.name}: €${(p.marketValue/1000000).toFixed(1)}M -> €${(tmMap[cleanPName]/1000000).toFixed(1)}M`);
    p.marketValue = tmMap[cleanPName];
    updatedCount++;
  }
});

fs.writeFileSync(jsonPath, JSON.stringify({ players: list }, null, 2), 'utf8');
console.log(`Updated ${updatedCount} players in knowledge/players.json.`);

// Update SQLite database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run('BEGIN TRANSACTION');
  const stmt = db.prepare('UPDATE Players SET marketValue = ? WHERE id = ? OR name = ?');
  
  list.forEach(p => {
    stmt.run([p.marketValue, p.id, p.name]);
  });

  stmt.finalize();
  db.run('COMMIT', (err) => {
    if (err) console.error('Error committing SQLite updates:', err);
    else console.log('Successfully updated all player market values in SQLite database.');

    db.all('SELECT name, currentTeam, marketValue FROM Players WHERE userId IS NULL ORDER BY marketValue DESC LIMIT 25', [], (err2, topRows) => {
      console.log('\nTop 25 players in database matching live Transfermarkt URL:');
      topRows.forEach((r, i) => {
        console.log(`${i + 1}. ${r.name} (${r.currentTeam}): €${(r.marketValue / 1000000).toFixed(1)}M`);
      });
      process.exit(0);
    });
  });
});
