const https = require('https');
const fs = require('fs');
const path = require('path');
const { fetchFullCalendarForClub } = require('./extract_all_tm_full_calendars');

const allTeamsPath = path.join(__dirname, 'all_1205_teams.json');
const tmFullJsonPath = path.join(__dirname, 'tm_full_calendars_2026.json');

const teamsData = JSON.parse(fs.readFileSync(allTeamsPath, 'utf-8'));
console.log(`Cargados ${teamsData.length} equipos para extracción masiva de calendarios completos desde Transfermarkt.`);

let results = {};
if (fs.existsSync(tmFullJsonPath)) {
  try {
    results = JSON.parse(fs.readFileSync(tmFullJsonPath, 'utf-8'));
    console.log(`Cargados ${Object.keys(results).length} clubes con calendarios completos en JSON.`);
  } catch (e) {}
}

async function runBatch() {
  const CONCURRENCY = 8;
  const toProcess = teamsData.filter(t => {
    const name = typeof t === 'string' ? t : t.name;
    return !results[name] || results[name].length < 5;
  });
  
  console.log(`Pendientes de extraer calendario completo: ${toProcess.length} de ${teamsData.length} equipos.`);

  let completed = 0;
  let saveCounter = 0;

  for (let i = 0; i < toProcess.length; i += CONCURRENCY) {
    const chunk = toProcess.slice(i, i + CONCURRENCY);
    await Promise.all(chunk.map(async (t) => {
      const teamName = typeof t === 'string' ? t : t.name;
      const matches = await fetchFullCalendarForClub(teamName);
      if (matches && matches.length > 0) {
        results[teamName] = matches;
      }
      completed++;
    }));

    saveCounter += chunk.length;
    console.log(`[Progreso ${completed}/${toProcess.length}] Total clubes con calendario completo: ${Object.keys(results).length}`);

    if (saveCounter >= 30 || i + CONCURRENCY >= toProcess.length) {
      fs.writeFileSync(tmFullJsonPath, JSON.stringify(results, null, 2), 'utf-8');
      saveCounter = 0;
    }

    await new Promise(r => setTimeout(r, 80));
  }

  fs.writeFileSync(tmFullJsonPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`\n🎉 EXTRACCIÓN MASIVA COMPLETA PARA LOS 1200+ EQUIPOS. ${Object.keys(results).length} equipos guardados.`);

  // Trigger app.js update
  require('./apply_full_calendars');
}

runBatch().catch(console.error);
