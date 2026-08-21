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
    const cleanQuery = encodeURIComponent(playerName);
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
        // Regex to extract player profile image from search results HTML
        // E.g. <img src="https://img.a.transfermarkt.technology/portrait/medium/418560-1709108116.png?lm=1" title="Erling Haaland" ...>
        const imgRegex = /src="(https:\/\/img\.a\.transfermarkt\.technology\/portrait\/(?:medium|header|small|big)\/[^"]+)"/g;
        let match;
        const foundUrls = [];
        while ((match = imgRegex.exec(body)) !== null) {
          foundUrls.push(match[1]);
        }

        if (foundUrls.length > 0) {
          // Upgrade 'medium' or 'header' or 'small' to 'big' for HD avatar quality
          const hdUrl = foundUrls[0].replace(/\/portrait\/(medium|header|small)\//, '/portrait/big/');
          resolve(hdUrl);
        } else {
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.setTimeout(3500, () => {
      req.destroy();
      resolve(null);
    });
  });
}

async function fixPlaceholderPhotos() {
  console.log("=========================================================================");
  console.log("AUDITORÍA Y CORRECCIÓN DE FOTOS REALES DE TRANSFERMARKT PARA JUGADORES");
  console.log("=========================================================================\n");

  const rows = await new Promise((resolve, reject) => {
    db.all("SELECT id, name, currentTeam, league, photoId FROM Players WHERE userId IS NULL", [], (err, res) => err ? reject(err) : resolve(res));
  });

  const placeholderRows = rows.filter(r => {
    const p = (r.photoId || '').toLowerCase();
    return !p || p.includes('placeholder') || p.includes('dicebear') || p.includes('ui-avatars') || p.trim() === '';
  });

  console.log(`📌 Total de jugadores en DB: ${rows.length}`);
  console.log(`⚠️ Jugadores con foto de marcador de posición (placeholder/PL): ${placeholderRows.length}\n`);

  await sequelize.authenticate();
  console.log("✅ Conectado a SQL Server (MSSQL).");

  let fixedCount = 0;

  for (let i = 0; i < placeholderRows.length; i++) {
    const p = placeholderRows[i];
    console.log(`[${i+1}/${placeholderRows.length}] Buscando foto Transfermarkt para: ${p.name} (${p.currentTeam})`);

    const realPhotoUrl = await fetchTransfermarktPhoto(p.name, p.currentTeam);

    if (realPhotoUrl) {
      console.log(`   📸 Encontrada foto real HD: ${realPhotoUrl}`);

      // Update SQLite
      await new Promise((resolve, reject) => {
        db.run("UPDATE Players SET photoId = ? WHERE id = ?", [realPhotoUrl, p.id], (err) => err ? reject(err) : resolve());
      });

      // Update MSSQL
      await Player.update({ photoId: realPhotoUrl }, { where: { id: p.id } });

      fixedCount++;
    } else {
      console.log(`   ⚠️ No se encontró foto en Transfermarkt. Se asigna avatar por iniciales del nombre.`);
      // Set to empty string so fallback uses actual player initials instead of "PL"
      await new Promise((resolve, reject) => {
        db.run("UPDATE Players SET photoId = '' WHERE id = ?", [p.id], (err) => err ? reject(err) : resolve());
      });
      await Player.update({ photoId: '' }, { where: { id: p.id } });
    }

    // Small throttle to respect rate limit
    await new Promise(r => setTimeout(r, 80));
  }

  console.log(`\n🎉 PROCESO DE FOTOS COMPLETADO:`);
  console.log(`- Fotos reales de Transfermarkt asignadas: ${fixedCount}`);
  console.log(`- Total corregidos: ${placeholderRows.length}`);

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

fixPlaceholderPhotos().catch(err => {
  console.error("Error fixing photos:", err);
  process.exit(1);
});
