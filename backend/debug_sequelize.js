const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

console.log("Checking DB files:");
console.log("1. __dirname/database.sqlite:", path.join(__dirname, 'database.sqlite'), "Exists?", fs.existsSync(path.join(__dirname, 'database.sqlite')));

const db1 = new sqlite3.Database(path.join(__dirname, 'database.sqlite'));
db1.get("SELECT COUNT(*) as count FROM Players", [], (err, row) => {
  console.log("sqlite3 count in backend/database.sqlite:", row ? row.count : err);
});

// Check if there is another database.sqlite in root or elsewhere
const rootDb = path.join(__dirname, '..', 'database.sqlite');
console.log("2. root database.sqlite:", rootDb, "Exists?", fs.existsSync(rootDb));
if (fs.existsSync(rootDb)) {
  const db2 = new sqlite3.Database(rootDb);
  db2.get("SELECT COUNT(*) as count FROM Players", [], (err, row) => {
    console.log("sqlite3 count in root database.sqlite:", row ? row.count : err);
  });
}
