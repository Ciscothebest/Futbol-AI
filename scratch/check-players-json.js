const { sequelize, Player } = require('../backend/database');

async function checkPlayersJson() {
  console.log('🔍 Running Database JSON Validation for players Table...');
  try {
    await sequelize.authenticate();
    
    const players = await Player.findAll({
      attributes: ['id', 'name', 'stats', 'careerTotals', 'trophies', 'transfers', 'strengths', 'tags', 'history']
    });
    
    console.log(`Found ${players.length} players. Validating JSON fields...`);
    
    let invalidCount = 0;
    
    for (const p of players) {
      try {
        // Trigger the getters by reading the attributes
        const stats = p.stats;
        const careerTotals = p.careerTotals;
        const trophies = p.trophies;
        const transfers = p.transfers;
        const strengths = p.strengths;
        const tags = p.tags;
        const history = p.history;
      } catch (err) {
        console.error(`❌ JSON Parse Error found in Player ID: ${p.id} Name: ${p.name}`);
        console.error(`   Error message: ${err.message}`);
        invalidCount++;
      }
    }
    
    if (invalidCount === 0) {
      console.log('✅ ALL players JSON fields are 100% valid and parsed successfully!');
    } else {
      console.log(`⚠️ Diagnostic found ${invalidCount} players with malformed JSON!`);
    }

  } catch (err) {
    console.error('❌ Diagnostic error:', err);
  } finally {
    await sequelize.close();
  }
}

checkPlayersJson();
