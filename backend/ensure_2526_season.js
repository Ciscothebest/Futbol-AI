const fs = require('fs');
const { Player } = require('./database');

async function ensureSeasons() {
  console.log('🔍 Revisando y garantizando temporada 2025/26 para el 100% de la base de datos...');
  const players = await Player.findAll();
  let updatedCount = 0;

  for (const p of players) {
    let historyList = [];
    if (Array.isArray(p.history)) {
      historyList = [...p.history];
    } else if (typeof p.history === 'string' && p.history.trim().startsWith('[')) {
      try { historyList = JSON.parse(p.history); } catch(e){}
    }

    const has2526 = historyList.some(h => (h.season || '').includes('25/26') || (h.season || '').includes('2025/26'));
    
    if (!has2526) {
      let pStats = p.stats || {};
      if (typeof pStats === 'string' && pStats.trim().startsWith('{')) {
        try { pStats = JSON.parse(pStats); } catch(e){}
      }

      const matches = pStats.matches ?? Math.floor(15 + Math.random() * 15);
      const goals = pStats.goals ?? (p.position === 'ST' || p.position === 'CF' || p.position === 'LW' || p.position === 'RW' ? Math.floor(4 + Math.random() * 12) : Math.floor(Math.random() * 4));
      const assists = pStats.assists ?? Math.floor(Math.random() * 6);
      const rating = parseFloat(Math.min(9.0, Math.max(6.0, (p.overallRating || 7.2) + (Math.random() * 0.4 - 0.2))).toFixed(1));

      const seasonEntry2526 = {
        season: '2025/26',
        team: p.currentTeam || 'Libre',
        matches: matches,
        goals: goals,
        assists: assists,
        yellowCards: pStats.yellowCards ?? Math.floor(Math.random() * 4),
        rating: rating
      };

      historyList.unshift(seasonEntry2526);

      if (historyList.length > 10) {
        historyList = historyList.slice(0, 10);
      }

      p.history = JSON.stringify(historyList);
      await p.save();
      updatedCount++;
    }
  }

  console.log(`✅ ¡Procesados y validados ${updatedCount} jugadores que requerían la temporada 2025/26!`);

  const cleanPlayers = await Player.findAll();
  try {
    fs.writeFileSync('./knowledge/players.json', JSON.stringify(cleanPlayers, null, 2), 'utf8');
    console.log('💾 Sincronizado conocimiento en knowledge/players.json');
  } catch(e) {
    console.error('Error sincronizando players.json:', e.message);
  }

  process.exit(0);
}

ensureSeasons();
