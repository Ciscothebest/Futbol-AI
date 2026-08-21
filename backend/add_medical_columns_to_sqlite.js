const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run("ALTER TABLE Players ADD COLUMN medicalStatus TEXT", err => {
    if (err && !err.message.includes('duplicate column')) console.log('medicalStatus column already exists or added');
  });
  db.run("ALTER TABLE Players ADD COLUMN injuries TEXT", err => {
    if (err && !err.message.includes('duplicate column')) console.log('injuries column already exists or added');
  });

  db.run("UPDATE Players SET medicalStatus = 'Disponible', injuries = '[\"Sin lesiones activas\"]' WHERE league LIKE '%LaLiga%' OR league LIKE '%La Liga%' OR country LIKE '%España%'", function(err) {
    if (err) console.error('Error updating medical status:', err);
    else console.log(`Successfully updated medicalStatus and injuries for ${this.changes} La Liga players!`);
    process.exit(0);
  });
});
