const https = require('https');
const fs = require('fs');
const path = require('path');
const { Player, sequelize } = require('./database');

function fetchTM(pathUrl) {
  return new Promise((resolve) => {
    const cleanPath = encodeURI(pathUrl);
    const options = {
      hostname: 'www.transfermarkt.com',
      path: cleanPath,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    };
    const req = https.get(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', (err) => resolve({ status: 500, error: err.message, body: '' }));
    req.setTimeout(8000, () => {
      req.destroy();
      resolve({ status: 408, error: 'Timeout', body: '' });
    });
  });
}

function parseMarketValue(raw) {
  if (!raw) return 0;
  const clean = raw.replace(/<[^>]+>/g, '').trim().toLowerCase();
  const match = clean.match(/€\s*([0-9]+(?:\.[0-9]+)?)\s*(m|k)?/i);
  if (!match) return 0;
  const val = parseFloat(match[1]);
  const unit = match[2];
  if (unit === 'm') return Math.round(val * 1000000);
  if (unit === 'k') return Math.round(val * 1000);
  return Math.round(val);
}

function calculateInjurySeverity(injuryName, daysStr, fromDate, untilDate) {
  const name = String(injuryName || '').toLowerCase();
  const daysMatch = String(daysStr || '').match(/([0-9]+)/);
  let days = daysMatch ? parseInt(daysMatch[1], 10) : 0;

  if (days <= 0 && fromDate && untilDate && fromDate.includes('/') && untilDate.includes('/')) {
    const p1 = fromDate.split('/');
    const p2 = untilDate.split('/');
    if (p1.length === 3 && p2.length === 3) {
      const d1 = new Date(parseInt(p1[2], 10), parseInt(p1[1], 10) - 1, parseInt(p1[0], 10));
      const d2 = new Date(parseInt(p2[2], 10), parseInt(p2[1], 10) - 1, parseInt(p2[0], 10));
      const diffMs = d2.getTime() - d1.getTime();
      if (!isNaN(diffMs) && diffMs >= 0) {
        days = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
      }
    }
  }

  if (name.includes('cruzado') || name.includes('cruciate') || name.includes('tear') || name.includes('rotura') || name.includes('desgarro') || name.includes('fracture') || name.includes('surgery') || name.includes('operation') || days >= 30) {
    return 'Grave';
  } else if (days >= 14 || name.includes('strain') || name.includes('sprain') || name.includes('distensión') || name.includes('esguince')) {
    return 'Moderada';
  }
  return 'Leve';
}

function calculateObjectiveRating(position, totalMatches, totalGoals, totalAssists, marketValue) {
  const matches = Math.max(1, totalMatches || 0);
  const goals = totalGoals || 0;
  const assists = totalAssists || 0;
  const pos = String(position || '').toUpperCase();

  let contributionPerMatch = 0;
  let baseRating = 6.2;

  if (pos.includes('GK') || pos.includes('POR') || pos.includes('ARQ')) {
    contributionPerMatch = matches >= 15 ? 0.4 : (matches / 30) * 0.4;
    baseRating = 6.4 + contributionPerMatch;
  } else if (pos.includes('CB') || pos.includes('DEF') || pos.includes('LB') || pos.includes('RB')) {
    contributionPerMatch = (goals * 1.0 + assists * 0.8) / matches;
    baseRating = 6.3 + Math.min(1.6, contributionPerMatch * 2.5);
  } else if (pos.includes('CM') || pos.includes('MED') || pos.includes('CAM') || pos.includes('CDM')) {
    contributionPerMatch = (goals * 0.8 + assists * 0.8) / matches;
    baseRating = 6.3 + Math.min(1.8, contributionPerMatch * 2.2);
  } else {
    contributionPerMatch = (goals * 0.8 + assists * 0.5) / matches;
    baseRating = 6.2 + Math.min(1.8, contributionPerMatch * 2.0);
  }

  let marketBonus = 0;
  if (marketValue >= 120000000) marketBonus = 0.4;
  else if (marketValue >= 70000000) marketBonus = 0.3;
  else if (marketValue >= 30000000) marketBonus = 0.2;
  else if (marketValue >= 10000000) marketBonus = 0.1;

  const finalRating = Math.min(9.0, Math.max(5.5, baseRating + marketBonus));
  return parseFloat(finalRating.toFixed(1));
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function searchPlayerOnTM(name) {
  let searchPath = `/schnellsuche/ergebnis/schnellsuche?query=${name}`;
  let searchRes = await fetchTM(searchPath);
  let matches = [...searchRes.body.matchAll(/href="([^"]*spieler\/[0-9]+)"/gi)];

  if ((!matches || matches.length === 0) && (name.includes(' Jr.') || name.includes(' Jr'))) {
    const cleanName = name.replace(/\s+Jr\.?/gi, ' Junior');
    searchPath = `/schnellsuche/ergebnis/schnellsuche?query=${cleanName}`;
    searchRes = await fetchTM(searchPath);
    matches = [...searchRes.body.matchAll(/href="([^"]*spieler\/[0-9]+)"/gi)];
  }

  if ((!matches || matches.length === 0) && name.includes(' ')) {
    const firstLastName = name.split(' ')[0];
    searchPath = `/schnellsuche/ergebnis/schnellsuche?query=${firstLastName}`;
    searchRes = await fetchTM(searchPath);
    matches = [...searchRes.body.matchAll(/href="([^"]*spieler\/[0-9]+)"/gi)];
  }

  return matches;
}

async function updateLaLigaPlayers() {
  console.log('🚀 Iniciando re-procesamiento exhaustivo y literal de datos y lesiones para La Liga...\n');

  await sequelize.query('ALTER TABLE Players ADD medicalStatus NVARCHAR(50) NULL').catch(() => {});
  await sequelize.query('ALTER TABLE Players ADD injuries NVARCHAR(MAX) NULL').catch(() => {});

  const laLigaPlayers = await Player.findAll({ where: { league: 'La Liga' } });
  console.log(`📋 Total de jugadores a procesar en La Liga: ${laLigaPlayers.length}\n`);

  let updatedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < laLigaPlayers.length; i++) {
    const player = laLigaPlayers[i];
    const indexStr = `[${i + 1}/${laLigaPlayers.length}]`;
    console.log(`${indexStr} Procesando: ${player.name} (${player.currentTeam})...`);

    try {
      const matches = await searchPlayerOnTM(player.name);
      if (!matches || matches.length === 0) {
        console.warn(`  ⚠️ No se encontró perfil en Transfermarkt para "${player.name}".`);
        skippedCount++;
        await delay(250);
        continue;
      }

      const profilePath = matches[0][1];
      const tmPlayerIdMatch = profilePath.match(/spieler\/([0-9]+)/);
      const tmPlayerId = tmPlayerIdMatch ? tmPlayerIdMatch[1] : null;

      // 1. Perfil
      const profileRes = await fetchTM(profilePath);
      const html = profileRes.body;

      const imgMatch = html.match(/https:\/\/img.a.transfermarkt.technology\/portrait\/[^\"]+/i);
      const photoUrl = imgMatch ? imgMatch[0] : player.photoId;

      const mvMatch = html.match(/market-value-wrapper[^>]*>([\s\S]*?)<\/a>/i) ||
                      html.match(/tm-player-market-value-development__current-value[^>]*>([\s\S]*?)<\/a>/i);
      const rawMV = mvMatch ? mvMatch[1] : '';
      const parsedMV = parseMarketValue(rawMV);
      const finalMV = parsedMV > 0 ? parsedMV : (player.marketValue || 0);

      const heightMatch = html.match(/itemprop="height"[^>]*>([0-9]+,?[0-9]*)\s*m</i) || html.match(/Height:[^>]*>([0-9]+,?[0-9]*)\s*m</i);
      let height = player.height;
      if (heightMatch) {
        const valStr = heightMatch[1].replace(',', '.');
        const hMeter = parseFloat(valStr);
        if (hMeter > 1.0 && hMeter < 2.5) height = Math.round(hMeter * 100);
      }

      const footMatch = html.match(/Foot:[^>]*>([^<]+)</i) || html.match(/Pie preferido:[^>]*>([^<]+)</i);
      let preferredFoot = player.preferredFoot || 'Right';
      if (footMatch) {
        const fStr = footMatch[1].trim().toLowerCase();
        if (fStr.includes('left') || fStr.includes('izquierdo')) preferredFoot = 'Left';
        else if (fStr.includes('both') || fStr.includes('ambos')) preferredFoot = 'Both';
        else if (fStr.includes('right') || fStr.includes('derecho')) preferredFoot = 'Right';
      }

      const shirtMatch = html.match(/class="data-header__shirt-number"[^>]*>#([0-9]+)</i);
      const jerseyNumber = shirtMatch ? parseInt(shirtMatch[1]) : player.jerseyNumber;

      // 2. Historial de Temporadas (máximo 10)
      let historySeasons = [];
      if (tmPlayerId) {
        const statsPath = profilePath.includes('/profil/') 
          ? profilePath.replace('/profil/', '/leistungsdaten/') + '/plus/1'
          : `/spieler/leistungsdaten/spieler/${tmPlayerId}/plus/1`;
        const statsRes = await fetchTM(statsPath);
        const statsHtml = statsRes.body;

        const tableRows = [...statsHtml.matchAll(/<tr[^>]*class="[^\"]*(?:odd|even)[^\"]*"[^>]*>([\s\S]*?)<\/tr>/gi)];
        const seasonsMap = new Map();

        for (const rowMatch of tableRows) {
          const row = rowMatch[1];
          const seasonMatch = row.match(/<td[^>]*class="zentriert"[^>]*>([0-9]{2}\/[0-9]{2}|[0-9]{4})<\/td>/i);
          const teamMatch = row.match(/title="([^"]+)"[^>]*href="[^"]*verein\/[0-9]+/i);
          const matchesTd = [...row.matchAll(/<td[^>]*class="zentriert"[^>]*>([0-9]+|-|\s*)<\/td>/gi)];

          if (seasonMatch && teamMatch) {
            const season = seasonMatch[1].trim();
            const team = teamMatch[1].trim();
            const matchesCount = matchesTd.length > 1 && !isNaN(parseInt(matchesTd[1][1])) ? parseInt(matchesTd[1][1]) : 0;
            const goalsCount = matchesTd.length > 2 && !isNaN(parseInt(matchesTd[2][1])) ? parseInt(matchesTd[2][1]) : 0;
            const assistsCount = matchesTd.length > 3 && !isNaN(parseInt(matchesTd[3][1])) ? parseInt(matchesTd[3][1]) : 0;

            if (!seasonsMap.has(season)) {
              const sRating = calculateObjectiveRating(player.position, matchesCount, goalsCount, assistsCount, finalMV);
              seasonsMap.set(season, {
                season,
                team,
                matches: matchesCount,
                goals: goalsCount,
                assists: assistsCount,
                yellowCards: 0,
                rating: sRating
              });
            }
          }
        }

        if (seasonsMap.size > 0) {
          historySeasons = Array.from(seasonsMap.values()).slice(0, 10);
        }
      }

      if (historySeasons.length === 0 && player.history) {
        historySeasons = typeof player.history === 'string' ? JSON.parse(player.history) : player.history;
      }
      if (Array.isArray(historySeasons) && historySeasons.length > 10) {
        historySeasons = historySeasons.slice(0, 10);
      }

      const totalM = historySeasons.reduce((acc, h) => acc + (h.matches || 0), 0);
      const totalG = historySeasons.reduce((acc, h) => acc + (h.goals || 0), 0);
      const totalA = historySeasons.reduce((acc, h) => acc + (h.assists || 0), 0);

      const overallRating = calculateObjectiveRating(player.position, totalM, totalG, totalA, finalMV);

      // 3. Historial de Lesiones Literal
      let playerInjuries = [];
      let medicalStatus = 'Disponible';
      if (tmPlayerId) {
        let injuryPath = profilePath.includes('/profil/') 
          ? profilePath.replace('/profil/', '/verletzungen/')
          : `/spieler/verletzungen/spieler/${tmPlayerId}`;
        const injuryRes = await fetchTM(injuryPath);
        const injRows = [...injuryRes.body.matchAll(/<tr[^>]*class="[^"]*(?:odd|even)[^"]*"[^>]*>([\s\S]*?)<\/tr>/gi)];

        for (const r of injRows) {
          const cells = [...r[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(c => c[1].replace(/<[^>]+>/g, '').trim());
          if (cells.length >= 5 && cells[1]) {
            const severity = calculateInjurySeverity(cells[1], cells[4], cells[2], cells[3]);
            playerInjuries.push({
              season: cells[0],
              injury: cells[1],
              fromDate: cells[2],
              untilDate: cells[3],
              days: cells[4],
              gamesMissed: cells[5] || '0',
              severity: severity
            });
          }
        }

        if (playerInjuries.length > 0) {
          const latest = playerInjuries[0];
          if (latest.untilDate === '?' || latest.untilDate === '-' || !latest.untilDate || latest.untilDate.toLowerCase().includes('expected')) {
            medicalStatus = 'Lesionado';
          } else {
            medicalStatus = 'Disponible';
          }
        }
      }

      player.photoId = photoUrl || player.photoId;
      player.height = height || player.height;
      player.preferredFoot = preferredFoot;
      player.jerseyNumber = jerseyNumber || player.jerseyNumber;
      player.marketValue = finalMV;
      player.overallRating = overallRating;
      player.history = JSON.stringify(historySeasons);
      player.medicalStatus = medicalStatus;
      player.injuries = JSON.stringify(playerInjuries);

      await player.save();
      updatedCount++;

      console.log(`  ✅ [${player.name}] | Rating ${overallRating} | Lesiones: ${playerInjuries.length} (${medicalStatus}) | Historial: ${historySeasons.length} temp.`);

    } catch (err) {
      console.error(`  ❌ Error actualizando ${player.name}:`, err.message);
      skippedCount++;
    }

    await delay(200);
  }

  // Sincronizar archivo local knowledge/players.json
  try {
    const playersFile = path.join(__dirname, 'knowledge/players.json');
    if (fs.existsSync(playersFile)) {
      const allDbPlayers = await Player.findAll();
      const playersJsonData = { players: allDbPlayers.map(p => p.toJSON()) };
      fs.writeFileSync(playersFile, JSON.stringify(playersJsonData, null, 2), 'utf8');
      console.log('\n📦 Sincronizado knowledge/players.json con los nuevos datos.');
    }
  } catch (syncErr) {
    console.warn('\n⚠️ Aviso de sincronización de players.json:', syncErr.message);
  }

  console.log(`\n🎉 Re-procesamiento completado para La Liga:`);
  console.log(`   Jugadores actualizados con éxito: ${updatedCount}`);
  console.log(`   Jugadores omitidos/no encontrados: ${skippedCount}`);
}

updateLaLigaPlayers().catch(e => {
  console.error('❌ Error fatal:', e.message);
  process.exit(1);
});
