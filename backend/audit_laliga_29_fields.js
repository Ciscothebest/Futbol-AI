const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const FIELDS_TO_CHECK = [
  'id', 'name', 'photoId', 'nickname', 'age', 'nationality', 'nationalityEs',
  'flag', 'position', 'positionEs', 'currentTeam', 'league', 'country',
  'jerseyNumber', 'height', 'weight', 'preferredFoot', 'marketValue',
  'stats', 'careerTotals', 'trophies', 'transfers', 'bio', 'bioEs',
  'strengths', 'tags', 'history', 'medicalStatus', 'injuries'
];

db.all("SELECT * FROM Players WHERE userId IS NULL AND (league LIKE '%LaLiga%' OR league LIKE '%La Liga%' OR country LIKE '%España%')", [], (err, rows) => {
  if (err) {
    console.error('SQLite query error:', err);
    process.exit(1);
  }

  const total = rows.length;
  console.log(`=== AUDITORÍA DE AUDITORES: 29 CAMPOS DE BD PARA LA LIGA (ESPAÑA) ===`);
  console.log(`Total Jugadores de La Liga evaluados: ${total}\n`);

  const fieldStats = {};
  FIELDS_TO_CHECK.forEach(f => fieldStats[f] = { filled: 0, missing: 0 });

  rows.forEach(p => {
    FIELDS_TO_CHECK.forEach(f => {
      const val = p[f];
      let isFilled = false;

      if (val !== null && val !== undefined && val !== '') {
        if (typeof val === 'string') {
          if (val.trim() !== '' && val.trim() !== '[]' && val.trim() !== '{}') {
            isFilled = true;
          }
        } else if (typeof val === 'number') {
          isFilled = true;
        } else if (typeof val === 'object') {
          if (Array.isArray(val)) {
            isFilled = val.length > 0;
          } else {
            isFilled = Object.keys(val).length > 0;
          }
        }
      }

      if (isFilled) {
        fieldStats[f].filled++;
      } else {
        fieldStats[f].missing++;
      }
    });
  });

  console.log(`ESTADO DE LOS 29 CAMPOS DE BD (LA LIGA):`);
  let index = 1;
  FIELDS_TO_CHECK.forEach(f => {
    const filled = fieldStats[f].filled;
    const missing = fieldStats[f].missing;
    const pct = ((filled / total) * 100).toFixed(1);
    const status = missing === 0 ? '🟢 100% Completo' : `🟡 ${missing} pendientes (${pct}%)`;
    console.log(`${String(index).padStart(2, ' ')}. ${f.padEnd(16, ' ')}: ${filled}/${total} ${status}`);
    index++;
  });

  process.exit(0);
});
