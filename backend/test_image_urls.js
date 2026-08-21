const path = require('path');
const { Player } = require('./database');

async function testImages() {
  console.log("=================================================");
  console.log("TESTING PLAYER PHOTO IDS AND AVATAR URLS");
  console.log("=================================================\n");

  const laLigaSample = await Player.findAll({ where: { league: 'La Liga' }, limit: 5 });
  const plSample = await Player.findAll({ where: { league: 'Premier League' }, limit: 5 });

  console.log("--- LA LIGA PLAYERS ---");
  laLigaSample.forEach(p => {
    console.log(`- ID: ${p.id} | Name: ${p.name} | photoId: ${p.photoId}`);
  });

  console.log("\n--- PREMIER LEAGUE PLAYERS ---");
  plSample.forEach(p => {
    console.log(`- ID: ${p.id} | Name: ${p.name} | photoId: ${p.photoId}`);
  });
}

testImages().then(() => process.exit(0)).catch(e => console.error(e));
