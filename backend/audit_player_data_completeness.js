const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.all('SELECT id, name, currentTeam, league, photoId, position, stats, bio, bioEs, nationality, flag, marketValue FROM Players WHERE userId IS NULL', [], (err, rows) => {
  if (err) {
    console.error('SQLite query error:', err);
    process.exit(1);
  }

  const total = rows.length;
  console.log(`=== ANÁLISIS DE INTEGRIDAD DE DATOS (TOTAL: ${total} JUGADORES) ===\n`);

  let missingPhoto = 0;
  let missingStats = 0;
  let missingBio = 0;
  let missingNationality = 0;
  let missingPosition = 0;

  const pendingByLeague = {};
  const samplePending = [];

  rows.forEach(p => {
    let statsObj = {};
    if (typeof p.stats === 'string') {
      try { statsObj = JSON.parse(p.stats || '{}'); } catch(e) {}
    } else if (typeof p.stats === 'object' && p.stats !== null) {
      statsObj = p.stats;
    }

    const hasPhoto = p.photoId && p.photoId.trim() !== '' && !p.photoId.includes('initials');
    const hasStats = statsObj && (statsObj.matches !== undefined || statsObj.goals !== undefined);
    const hasBio = (p.bioEs && p.bioEs.trim() !== '') || (p.bio && p.bio.trim() !== '');
    const hasNationality = p.nationality && p.nationality.trim() !== '';
    const hasPosition = p.position && p.position.trim() !== '';

    const issues = [];
    if (!hasPhoto) { missingPhoto++; issues.push('Sin Foto Oficial TM'); }
    if (!hasStats) { missingStats++; issues.push('Sin Estadísticas 2025/26'); }
    if (!hasBio) { missingBio++; issues.push('Sin Biografía Detallada'); }
    if (!hasNationality) { missingNationality++; issues.push('Sin Nacionalidad'); }
    if (!hasPosition) { missingPosition++; issues.push('Sin Posición'); }

    if (issues.length > 0) {
      const l = p.league || 'Otras Ligas';
      if (!pendingByLeague[l]) pendingByLeague[l] = 0;
      pendingByLeague[l]++;

      if (samplePending.length < 15) {
        samplePending.push({ name: p.name, team: p.currentTeam, league: p.league, issues });
      }
    }
  });

  console.log(`1. Foto Oficial Transfermarkt: ${total - missingPhoto} / ${total} completos (${missingPhoto} pendientes)`);
  console.log(`2. Estadísticas 2025/26: ${total - missingStats} / ${total} completos (${missingStats} pendientes)`);
  console.log(`3. Biografía y Perfil Ampliado: ${total - missingBio} / ${total} completos (${missingBio} pendientes)`);
  console.log(`4. Nacionalidad y Bandera: ${total - missingNationality} / ${total} completos (${missingNationality} pendientes)`);
  console.log(`5. Posición Técnica: ${total - missingPosition} / ${total} completos (${missingPosition} pendientes)`);

  console.log('\n=== PENDIENTES POR LIGA ===');
  Object.entries(pendingByLeague).forEach(([league, count]) => {
    console.log(`- ${league}: ${count} jugadores con algún dato pendiente`);
  });

  console.log('\n=== MUESTRA DE JUGADORES CON DATOS PENDIENTES ===');
  samplePending.forEach(s => {
    console.log(`- ${s.name} (${s.team} - ${s.league}): [${s.issues.join(', ')}]`);
  });

  process.exit(0);
});
