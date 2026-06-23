const { sequelize, Player } = require('./database');

async function fixPlayers() {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB');

    // Fix flag and country data for these 5 players
    const fixes = [
      {
        id: 'martin-odegaard',
        flag: '\uD83C\uDDF3\uD83C\uDDF4', // 🇳🇴 Norway
        nationality: 'Norwegian',
        nationalityEs: 'Noruego',
        country: 'Norway',
      },
      {
        id: 'phil-foden',
        flag: '\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67\uDB40\uDC7F', // 🏴󠁧󠁢󠁥󠁮󠁧󠁿 England
        nationality: 'English',
        nationalityEs: 'Inglés',
        country: 'England',
      },
      {
        id: 'declan-rice',
        flag: '\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67\uDB40\uDC7F', // 🏴󠁧󠁢󠁥󠁮󠁧󠁿 England
        nationality: 'English',
        nationalityEs: 'Inglés',
        country: 'England',
      },
      {
        id: 'bukayo-saka',
        flag: '\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67\uDB40\uDC7F', // 🏴󠁧󠁢󠁥󠁮󠁧󠁿 England
        nationality: 'English',
        nationalityEs: 'Inglés',
        country: 'England',
      },
      {
        id: 'william-saliba',
        flag: '\uD83C\uDDEB\uD83C\uDDF7', // 🇫🇷 France
        nationality: 'French',
        nationalityEs: 'Francés',
        country: 'France',
      },
    ];

    for (const fix of fixes) {
      const result = await Player.update(
        {
          flag: fix.flag,
          nationality: fix.nationality,
          nationalityEs: fix.nationalityEs,
          country: fix.country,
        },
        { where: { id: fix.id } }
      );
      console.log(`Updated ${fix.id}: ${result[0]} rows affected, flag="${fix.flag}", country="${fix.country}"`);
    }

    // Verify
    console.log('\n--- Verification ---');
    for (const fix of fixes) {
      const row = await Player.findOne({ where: { id: fix.id }, attributes: ['id', 'name', 'flag', 'nationality', 'nationalityEs', 'country'] });
      if (row) {
        const d = row.toJSON();
        console.log(`${d.name}: flag="${d.flag}", nationality="${d.nationality}", nationalityEs="${d.nationalityEs}", country="${d.country}"`);
      }
    }

    process.exit(0);
  } catch(e) {
    console.error('Error:', e.message);
    console.error(e.stack);
    process.exit(1);
  }
}

fixPlayers();
