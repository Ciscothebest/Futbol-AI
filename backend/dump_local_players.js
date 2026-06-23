const fs = require('fs');
const path = require('path');
const { sequelize, Player } = require('./database');

async function run() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to local SQL Server database.');

    console.log('Fetching players from local database...');
    const localPlayers = await Player.findAll();
    console.log(`Fetched ${localPlayers.length} players.`);

    if (localPlayers.length === 0) {
      console.warn('⚠️ Warning: No players found in local database. Aborting dump to prevent overwriting with empty data.');
      process.exit(0);
    }

    // Format players for players.json structure
    const playersData = localPlayers.map(p => {
      const data = p.toJSON();
      
      // If Sequelize getter parsed JSON automatically, keep them as objects/arrays
      // because they will be stringified by JSON.stringify(fullOutput)
      return {
        id: data.id,
        name: data.name,
        photoId: data.photoId,
        nickname: data.nickname,
        age: data.age,
        nationality: data.nationality,
        nationalityEs: data.nationalityEs,
        flag: data.flag,
        position: data.position,
        positionEs: data.positionEs,
        currentTeam: data.currentTeam,
        league: data.league,
        country: data.country,
        jerseyNumber: data.jerseyNumber,
        height: data.height,
        weight: data.weight,
        preferredFoot: data.preferredFoot,
        marketValue: data.marketValue ? Number(data.marketValue) : null,
        overallRating: data.overallRating,
        stats: data.stats,
        careerTotals: data.careerTotals,
        trophies: data.trophies,
        transfers: data.transfers,
        bio: data.bio,
        bioEs: data.bioEs,
        strengths: data.strengths,
        tags: data.tags,
        history: data.history
      };
    });

    const output = { players: playersData };
    const outputPath = path.join(__dirname, 'knowledge/players.json');
    
    // Ensure parent directories exist
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log(`✅ Successfully dumped ${playersData.length} players to backend/knowledge/players.json`);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to dump local players:', err.message);
    process.exit(1);
  }
}

run();
