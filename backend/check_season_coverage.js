const { Player } = require('./database');

async function checkSeasons() {
  const players = await Player.findAll();
  console.log(`TOTAL PLAYERS IN DB: ${players.length}`);

  let count2526 = 0;
  let count2425 = 0;
  let countEmptyHist = 0;
  let countNoStats = 0;

  players.forEach(p => {
    let historyList = [];
    if (Array.isArray(p.history)) historyList = p.history;
    else if (typeof p.history === 'string' && p.history.trim().startsWith('[')) {
      try { historyList = JSON.parse(p.history); } catch(e){}
    }

    if (!historyList || historyList.length === 0) countEmptyHist++;

    const seasons = historyList.map(h => h.season || '');
    if (seasons.some(s => s.includes('25/26') || s.includes('2025/26') || s.includes('25/26'))) count2526++;
    if (seasons.some(s => s.includes('24/25') || s.includes('2024/25') || s.includes('24/25'))) count2425++;

    if (!p.stats || typeof p.stats !== 'object') countNoStats++;
  });

  const pct2526 = ((count2526 / players.length) * 100).toFixed(1);
  const pct2425 = ((count2425 / players.length) * 100).toFixed(1);
  const pctEmpty = ((countEmptyHist / players.length) * 100).toFixed(1);

  console.log(`• Con temporada 2025/26 en historial: ${count2526} (${pct2526}%)`);
  console.log(`• Con temporada 2024/25 en historial: ${count2425} (${pct2425}%)`);
  console.log(`• Con historial vacío: ${countEmptyHist} (${pctEmpty}%)`);
  console.log(`• Sin objeto stats: ${countNoStats}`);

  // Sample seasons from 5 players
  console.log('\n=== MUESTRA DE TEMPORADAS EN JUGADORES ===');
  players.slice(0, 5).forEach(p => {
    let hList = p.history;
    if (typeof hList === 'string') {
      try { hList = JSON.parse(hList); } catch(e){}
    }
    console.log(`\nJugador: ${p.name} (${p.currentTeam})`);
    console.log('Seasons:', (hList || []).map(h => `${h.season}: ${h.team || p.currentTeam} (${h.matches || 0} PJ, ${h.goals || 0} G, ${h.assists || 0} A)`));
  });

  process.exit(0);
}

checkSeasons();
