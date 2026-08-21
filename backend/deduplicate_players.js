const fs = require('fs');
const { Player } = require('./database');

function normalizeName(str) {
  if (!str) return '';
  return str.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

async function deduplicate() {
  console.log('🔍 Analizando la base de datos para identificar y purgar duplicados no reales...');
  const allPlayers = await Player.findAll();
  console.log(`📋 Total registros iniciales: ${allPlayers.length}`);

  const groupMap = new Map();

  allPlayers.forEach(p => {
    const key = normalizeName(p.name);
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key).push(p);
  });

  let deletedCount = 0;
  let mergedCount = 0;

  for (const [key, group] of groupMap.entries()) {
    if (group.length > 1) {
      // Sort group to pick the BEST master record:
      // Priority 1: Has valid photoId (not default/null)
      // Priority 2: Has injuries
      // Priority 3: Longer ID / more descriptive ID (e.g. khvicha-kvaratskhelia-paris-saint-germain vs kvaratskhelia-khvicha)
      group.sort((a, b) => {
        const aPhoto = a.photoId && !a.photoId.includes('default') && !a.photoId.includes('data:image');
        const bPhoto = b.photoId && !b.photoId.includes('default') && !b.photoId.includes('data:image');
        if (aPhoto && !bPhoto) return -1;
        if (!aPhoto && bPhoto) return 1;

        const aInj = Array.isArray(a.injuries) ? a.injuries.length : 0;
        const bInj = Array.isArray(b.injuries) ? b.injuries.length : 0;
        if (aInj !== bInj) return bInj - aInj;

        return a.id.length - b.id.length;
      });

      const keeper = group[0];
      const toDelete = group.slice(1);

      console.log(`\n• Fusionando duplicados de "${keeper.name}":`);
      console.log(`   ✅ MANTENER MASTER: [${keeper.id}] Equipo: ${keeper.currentTeam} (${keeper.league})`);

      for (const dup of toDelete) {
        console.log(`   ❌ ELIMINAR DUPLICADO: [${dup.id}] Equipo: ${dup.currentTeam} (${dup.league})`);
        
        // Merge injuries if keeper lacks them
        if ((!keeper.injuries || keeper.injuries.length === 0) && dup.injuries && dup.injuries.length > 0) {
          keeper.injuries = dup.injuries;
          await keeper.save();
          mergedCount++;
        }

        // Delete duplicate record from database
        await dup.destroy();
        deletedCount++;
      }
    }
  }

  console.log(`\n🎉 Limpieza completada: ${deletedCount} registros duplicados eliminados.`);
  
  // Re-fetch remaining clean players
  const remainingPlayers = await Player.findAll();
  console.log(`📋 Total de jugadores reales únicos en base de datos: ${remainingPlayers.length}`);

  // Update knowledge/players.json
  try {
    fs.writeFileSync('./knowledge/players.json', JSON.stringify(remainingPlayers, null, 2), 'utf8');
    console.log('💾 Sincronizado conocimiento limpio en knowledge/players.json');
  } catch(e) {
    console.error('Error guardando players.json:', e.message);
  }

  process.exit(0);
}

deduplicate();
