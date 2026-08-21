const { Player } = require('./database');

async function getPhotoStats() {
  const players = await Player.findAll();

  function isSilhouette(p) {
    const url = p.photoUrl || p.avatarUrl || p.photoId || '';
    if (!url || url.trim() === '' || url === 'null') return true;
    const lower = url.toLowerCase();
    return lower.includes('default.jpg') || 
           lower.includes('spieler/default') || 
           lower.includes('default_header') || 
           lower.includes('portrait_small.jpg') || 
           lower.includes('default_avatar') || 
           lower.includes('data:image/svg');
  }

  const withPhoto = players.filter(p => !isSilhouette(p));
  const withSilhouette = players.filter(p => isSilhouette(p));

  const pctPhoto = ((withPhoto.length / players.length) * 100).toFixed(1);
  const pctSil = ((withSilhouette.length / players.length) * 100).toFixed(1);

  console.log('=== CONTEO GENERAL DE FOTOGRAFÍAS ===');
  console.log(`TOTAL JUGADORES: ${players.length}`);
  console.log(`CON FOTO OFICIAL: ${withPhoto.length} (${pctPhoto}%)`);
  console.log(`CON SILUETA (SIN IMAGEN): ${withSilhouette.length} (${pctSil}%)`);
  console.log('\n=== DESGLOSE POR LIGA ===');

  const leagues = [...new Set(players.map(p => p.league).filter(Boolean))].sort();
  leagues.forEach(l => {
    const lPlayers = players.filter(p => p.league === l);
    const lPhoto = lPlayers.filter(p => !isSilhouette(p));
    const lSil = lPlayers.filter(p => isSilhouette(p));
    console.log(`• ${l}: ${lPhoto.length} con foto / ${lSil.length} silueta (Total: ${lPlayers.length})`);
  });

  process.exit(0);
}

getPhotoStats();
