const fs = require('fs');
const path = require('path');
const { Player } = require('../backend/database');

async function main() {
  try {
    const jsonPath = path.join(__dirname, '..', 'backend', 'knowledge', 'players.json');
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const jsonPlayers = jsonData.players;

    const dbPlayers = await Player.findAll({ attributes: ['id', 'name'] });
    const dbPlayerIds = new Set(dbPlayers.map(p => p.id));

    console.log(`Players in players.json: ${jsonPlayers.length}`);
    console.log(`Players in Database: ${dbPlayerIds.size}`);

    const missing = jsonPlayers.filter(p => !dbPlayerIds.has(p.id));
    console.log(`\nFound ${missing.length} players missing in DB:`);
    missing.forEach(p => {
      console.log(` - ID: ${p.id}, Name: ${p.name}`);
    });

  } catch(e) {
    console.error('Error:', e);
  } finally {
    process.exit(0);
  }
}

main();
