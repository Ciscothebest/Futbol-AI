const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const https = require('https');
const { Player, sequelize } = require('./database');

const sqlitePath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(sqlitePath);
const playersJsonPath = path.join(__dirname, 'knowledge', 'players.json');
const desktopLocalDir = 'C:\\Users\\franc\\OneDrive\\Escritorio\\Futbol AI Local';

function fetchTransfermarktPhoto(playerName, clubName) {
  return new Promise((resolve) => {
    // Clean name for Transfermarkt search query
    const cleanQuery = encodeURIComponent(playerName.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑâêîôûäëïöüÄËÏÖÜ\s-]/g, ''));
    const options = {
      hostname: 'www.transfermarkt.com',
      path: `/schnellsuche/ergebnis/schnellsuche?query=${cleanQuery}`,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    };

    const req = https.get(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        const imgRegex = /src="(https:\/\/img\.a\.transfermarkt\.technology\/portrait\/(?:medium|header|small|big)\/[^"]+)"/g;
        let match;
        const foundUrls = [];
        while ((match = imgRegex.exec(body)) !== null) {
          foundUrls.push(match[1]);
        }

        if (foundUrls.length > 0) {
          const hdUrl = foundUrls[0].replace(/\/portrait\/(medium|header|small)\//, '/portrait/big/');
          resolve(hdUrl);
        } else {
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.setTimeout(3000, () => {
      req.destroy();
      resolve(null);
    });
  });
}

async function fastFixLeaguePhotos() {
  console.log("=========================================================================");
  console.log("EXTRACCIÓN RÁPIDA DE FOTOS TRANSFERMARKT HD POR LOTES CONCURRENTES");
  console.log("=========================================================================\n");

  const rows = await new Promise((resolve, reject) => {
    db.all("SELECT id, name, currentTeam, league, photoId FROM Players WHERE userId IS NULL", [], (err, res) => err ? reject(err) : resolve(res));
  });

  const priorityLeagues = ['Bundesliga', 'Serie A', 'Ligue 1', 'Eredivisie', 'LDF (Liga Dominicana de Fútbol)', 'La Liga', 'Premier League'];

  const placeholderRows = rows.filter(r => {
    const p = (r.photoId || '').toLowerCase();
    return !p || p.includes('placeholder') || p.includes('dicebear') || p.includes('ui-avatars') || p.trim() === '';
  }).sort((a, b) => {
    const idxA = priorityLeagues.indexOf(a.league);
    const idxB = priorityLeagues.indexOf(b.league);
    const pA = idxA === -1 ? 99 : idxA;
    const pB = idxB === -1 ? 99 : idxB;
    return pA - pB;
  });

  console.log(`📌 Total jugadores a actualizar fotos real Transfermarkt: ${placeholderRows.length}`);

  await sequelize.authenticate();
  console.log("✅ Conectado a SQL Server (MSSQL).");

  const BATCH_SIZE = 15;
  let successCount = 0;

  for (let i = 0; i < placeholderRows.length; i += BATCH_SIZE) {
    const chunk = placeholderRows.slice(i, i + BATCH_SIZE);
    console.log(`🚀 Procesando lote [${i+1} a ${Math.min(i + BATCH_SIZE, placeholderRows.length)} / ${placeholderRows.length}]...`);

    await Promise.all(chunk.map(async (p) => {
      const photoUrl = await fetchTransfermarktPhoto(p.name, p.currentTeam);
      const finalPhoto = photoUrl || '';

      if (photoUrl) successCount++;

      // Update SQLite
      await new Promise((resolve) => {
        db.run("UPDATE Players SET photoId = ? WHERE id = ?", [finalPhoto, p.id], () => resolve());
      });

      // Update MSSQL
      await Player.update({ photoId: finalPhoto }, { where: { id: p.id } });
    }));
  }

  console.log(`\n🎉 EXTRACCIÓN Y ASIGNACIÓN DE FOTOS COMPLETADA:`);
  console.log(`- Fotos HD de Transfermarkt asignadas: ${successCount}`);
  console.log(`- Total procesados: ${placeholderRows.length}`);

  // Dump updated database to players.json
  const allUpdated = await new Promise((resolve, reject) => {
    db.all("SELECT * FROM Players WHERE userId IS NULL", [], (err, res) => err ? reject(err) : resolve(res));
  });

  const formattedPlayers = allUpdated.map(p => {
    let stats = p.stats; if (typeof stats === 'string') { try { stats = JSON.parse(stats); } catch(e) {} }
    let careerTotals = p.careerTotals; if (typeof careerTotals === 'string') { try { careerTotals = JSON.parse(careerTotals); } catch(e) {} }
    let trophies = p.trophies; if (typeof trophies === 'string') { try { trophies = JSON.parse(trophies); } catch(e) {} }
    let transfers = p.transfers; if (typeof transfers === 'string') { try { transfers = JSON.parse(transfers); } catch(e) {} }
    let strengths = p.strengths; if (typeof strengths === 'string') { try { strengths = JSON.parse(strengths); } catch(e) {} }
    let tags = p.tags; if (typeof tags === 'string') { try { tags = JSON.parse(tags); } catch(e) {} }
    let history = p.history; if (typeof history === 'string') { try { history = JSON.parse(history); } catch(e) {} }

    return { ...p, stats, careerTotals, trophies, transfers, strengths, tags, history };
  });

  fs.writeFileSync(playersJsonPath, JSON.stringify(formattedPlayers, null, 2), 'utf8');
  console.log(`✅ Archivo players.json actualizado.`);

  // Synchronize Desktop folder
  if (fs.existsSync(desktopLocalDir)) {
    const targetDbPath = path.join(desktopLocalDir, 'backend', 'database.sqlite');
    const targetJsonPath = path.join(desktopLocalDir, 'backend', 'knowledge', 'players.json');
    if (fs.existsSync(path.dirname(targetDbPath))) fs.copyFileSync(sqlitePath, targetDbPath);
    if (fs.existsSync(path.dirname(targetJsonPath))) fs.copyFileSync(playersJsonPath, targetJsonPath);
    console.log(`✅ Archivos sincronizados en escritorio.`);
  }

  process.exit(0);
}

fastFixLeaguePhotos().catch(err => {
  console.error("Error in fastFixLeaguePhotos:", err);
  process.exit(1);
});
