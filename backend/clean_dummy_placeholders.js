const fs = require('fs');
const { Player } = require('./database');

async function cleanDbPlaceholders() {
  console.log('🔍 Limpiando URLs de placeholders heredados (placeholder.com, ui-avatars, etc.) en la base de datos...');
  const players = await Player.findAll();
  let updated = 0;

  for (const p of players) {
    const url = p.photoId || p.photoUrl || p.avatarUrl || '';
    if (url.includes('placeholder') || url.includes('ui-avatars') || url.includes('dicebear') || url.includes('default')) {
      p.photoId = null;
      p.photoUrl = null;
      p.avatarUrl = null;
      await p.save();
      updated++;
    }
  }

  console.log(`✅ ¡Limpiados ${updated} registros con URLs de placeholder en la base de datos!`);

  // Sync with knowledge/players.json
  const cleanPlayers = await Player.findAll();
  try {
    fs.writeFileSync('./knowledge/players.json', JSON.stringify(cleanPlayers, null, 2), 'utf8');
    console.log('💾 Sincronizado conocimiento limpio en knowledge/players.json');
  } catch(e) {
    console.error('Error sincronizando players.json:', e.message);
  }

  process.exit(0);
}

cleanDbPlaceholders();
