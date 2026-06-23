const { sequelize, Player } = require('./database');

async function fixPhotoIds() {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB');

    // Fix photoIds with correct sofifa IDs (verified against cdn.sofifa.net)
    const fixes = [
      { id: 'bukayo-saka',   photoId: '246669' },  // was 239074 (wrong)
      { id: 'declan-rice',   photoId: '234378' },  // was 232049 (wrong)
      // These are already correct:
      // martin-odegaard: 222665 ✅
      // phil-foden: 237692 ✅  
      // william-saliba: 243715 ✅
    ];

    for (const fix of fixes) {
      const result = await Player.update(
        { photoId: fix.photoId },
        { where: { id: fix.id } }
      );
      console.log(`Updated photoId for ${fix.id}: ${result[0]} rows → photoId="${fix.photoId}"`);
    }

    // Verify all 5 players
    console.log('\n--- Final Verification ---');
    const ids = ['martin-odegaard', 'phil-foden', 'declan-rice', 'bukayo-saka', 'william-saliba'];
    for (const id of ids) {
      const row = await Player.findOne({ where: { id }, attributes: ['id', 'name', 'photoId', 'flag', 'nationality', 'country'] });
      if (row) {
        const d = row.toJSON();
        console.log(`${d.name}: photoId="${d.photoId}", flag="${d.flag}", nationality="${d.nationality}", country="${d.country}"`);
      }
    }

    process.exit(0);
  } catch(e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}

fixPhotoIds();
