const { sequelize, Player } = require('./database');
const { Op } = require('sequelize');

async function checkPlayersDetail() {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB');
    
    const ids = ['martin-odegaard', 'phil-foden', 'declan-rice', 'bukayo-saka', 'william-saliba'];
    
    for (const id of ids) {
      const row = await Player.findOne({
        where: { id }
      });
      if (row) {
        const d = row.toJSON();
        const stats = typeof d.stats === 'string' ? JSON.parse(d.stats || '{}') : (d.stats || {});
        console.log(`\n=== ${d.name} ===`);
        console.log(`  id: ${d.id}`);
        console.log(`  photoId: ${d.photoId}`);
        console.log(`  age: ${d.age}`);
        console.log(`  nationality: ${d.nationality}`);
        console.log(`  nationalityEs: ${d.nationalityEs}`);
        console.log(`  currentTeam: ${d.currentTeam}`);
        console.log(`  league: ${d.league}`);
        console.log(`  position: ${d.position}`);
        console.log(`  jerseyNumber: ${d.jerseyNumber}`);
        console.log(`  height: ${d.height}`);
        console.log(`  weight: ${d.weight}`);
        console.log(`  marketValue: ${d.marketValue}`);
        console.log(`  overallRating: ${d.overallRating}`);
        console.log(`  stats keys: ${Object.keys(stats).join(', ')}`);
        const statsVals = Object.entries(stats).slice(0, 5).map(([k,v]) => `${k}=${v}`).join(', ');
        console.log(`  stats sample: ${statsVals}`);
        const trophies = typeof d.trophies === 'string' ? JSON.parse(d.trophies || '[]') : (d.trophies || []);
        console.log(`  trophies: ${trophies.length} items`);
        const bio = d.bio ? d.bio.substring(0, 100) : 'NULL';
        console.log(`  bio: ${bio}`);
        const bioEs = d.bioEs ? d.bioEs.substring(0, 100) : 'NULL';
        console.log(`  bioEs: ${bioEs}`);
      } else {
        console.log(`\n=== ${id} NOT FOUND ===`);
      }
    }
    
    process.exit(0);
  } catch(e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}

checkPlayersDetail();
