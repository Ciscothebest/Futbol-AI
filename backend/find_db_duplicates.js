const { Player } = require('./database');

async function findDuplicates() {
  const players = await Player.findAll();
  console.log(`TOTAL PLAYERS IN DB: ${players.length}`);

  // 1. Group by exact name (case-insensitive)
  const nameMap = new Map();
  players.forEach(p => {
    const cleanName = (p.name || '').trim().toLowerCase();
    if (!nameMap.has(cleanName)) nameMap.set(cleanName, []);
    nameMap.get(cleanName).push(p);
  });

  const duplicates = [];
  nameMap.forEach((list, name) => {
    if (list.length > 1) {
      duplicates.push({
        name: list[0].name,
        count: list.length,
        items: list.map(p => ({
          id: p.id,
          team: p.currentTeam,
          league: p.league,
          age: p.age,
          photoId: p.photoId ? 'YES' : 'NO',
          injuriesCount: Array.isArray(p.injuries) ? p.injuries.length : (typeof p.injuries === 'string' ? p.injuries.length : 0)
        }))
      });
    }
  });

  console.log(`\n=== DUPLICADOS POR NOMBRE EXACTO (${duplicates.length} casos) ===`);
  duplicates.forEach(d => {
    console.log(`\n• Nombre: "${d.name}" (${d.count} registros):`);
    d.items.forEach(i => {
      console.log(`   - ID: ${i.id} | Equipo: ${i.team} | Liga: ${i.league} | Edad: ${i.age} | Foto: ${i.photoId}`);
    });
  });

  // 2. Group by normalized name + age + team to find false duplicates vs real duplicates
  console.log('\n=== REVISANDO CASOS DUDOSOS O SIMILARES ===');
  const normalizedMap = new Map();
  players.forEach(p => {
    const norm = (p.name || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
    if (!normalizedMap.has(norm)) normalizedMap.set(norm, []);
    normalizedMap.get(norm).push(p);
  });

  const normDuplicates = [];
  normalizedMap.forEach((list, norm) => {
    if (list.length > 1 && !duplicates.some(d => d.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "") === norm)) {
      normDuplicates.push({
        norm,
        items: list.map(p => ({ id: p.id, name: p.name, team: p.currentTeam, league: p.league }))
      });
    }
  });

  console.log(`Casos con nombres normalizados similares: ${normDuplicates.length}`);
  normDuplicates.forEach(d => {
    console.log(`\n• Similar key "${d.norm}":`);
    d.items.forEach(i => console.log(`   - [${i.id}] ${i.name} (${i.team} - ${i.league})`));
  });

  process.exit(0);
}

findDuplicates();
