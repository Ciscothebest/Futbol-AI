const fs = require('fs');

const dbPath = 'knowledge/players.json';
const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
const playerFaces = require('./player-faces');

const realPlayers = db.players.filter(p => playerFaces[p.id]);

db.players = realPlayers;

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

console.log(`Filtered players.json. Kept ${realPlayers.length} real players. Removed fictional players.`);
