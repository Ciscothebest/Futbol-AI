const { sequelize, Player } = require('./database');

async function checkFullData() {
  try {
    await sequelize.authenticate();
    
    const ids = ['martin-odegaard', 'phil-foden', 'declan-rice', 'bukayo-saka', 'william-saliba'];
    
    for (const id of ids) {
      const row = await Player.findOne({ where: { id } });
      if (row) {
        const d = row.toJSON();
        
        // Parse all JSON fields
        const stats = typeof d.stats === 'string' ? JSON.parse(d.stats || 'null') : d.stats;
        const careerTotals = typeof d.careerTotals === 'string' ? JSON.parse(d.careerTotals || 'null') : d.careerTotals;
        const trophies = typeof d.trophies === 'string' ? JSON.parse(d.trophies || '[]') : d.trophies;
        const transfers = typeof d.transfers === 'string' ? JSON.parse(d.transfers || '[]') : d.transfers;
        const strengths = typeof d.strengths === 'string' ? JSON.parse(d.strengths || '[]') : d.strengths;
        const tags = typeof d.tags === 'string' ? JSON.parse(d.tags || '[]') : d.tags;
        const history = typeof d.history === 'string' ? JSON.parse(d.history || '[]') : d.history;
        
        console.log(`\n=== ${d.name} ===`);
        console.log(`  stats: ${JSON.stringify(stats)}`);
        console.log(`  careerTotals: ${JSON.stringify(careerTotals)}`);
        console.log(`  trophies (${(trophies||[]).length}): ${JSON.stringify(trophies)}`);
        console.log(`  transfers (${(transfers||[]).length}): ${JSON.stringify(transfers)}`);
        console.log(`  strengths (${(strengths||[]).length}): ${JSON.stringify(strengths)}`);
        console.log(`  tags (${(tags||[]).length}): ${JSON.stringify(tags)}`);
        console.log(`  history (${(history||[]).length}): ${JSON.stringify(history).substring(0, 200)}`);
        console.log(`  flag: "${d.flag}"`);
        console.log(`  country: "${d.country}"`);
        console.log(`  nickname: "${d.nickname}"`);
      }
    }
    
    process.exit(0);
  } catch(e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}

checkFullData();
