const https = require('https');
const fs = require('fs');
const { Player } = require('./database');

function fetchUrl(url) {
  return new Promise((resolve) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', () => resolve(''));
  });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function startPhotoScrape() {
  console.log('🔍 Iniciando escaneo de fotos oficiales en Transfermarkt...');
  
  const allPlayersInDb = await Player.findAll();
  const missing = allPlayersInDb.filter(p => !p.photoId || p.photoId.trim() === '' || p.photoId.includes('default') || p.photoId === 'null');
  
  console.log(`📋 Total de jugadores a revisar: ${missing.length} / ${allPlayersInDb.length}`);

  let updatedCount = 0;
  let notFoundCount = 0;

  for (let i = 0; i < missing.length; i++) {
    const p = missing[i];
    console.log(`\n[${i + 1}/${missing.length}] Buscando foto para: ${p.name} (${p.currentTeam || 'Sin equipo'})...`);

    try {
      const searchUrl = `https://www.transfermarkt.es/schnellsuche/ergebnis/schnellsuche?query=${encodeURIComponent(p.name)}`;
      const html = await fetchUrl(searchUrl);

      const playerMatch = html.match(/<a[^>]*href="([^"]*profil\/spieler\/[^"]*)"/i) || html.match(/<a[^>]*href="([^"]*spieler[^"]*)"/i);
      
      if (playerMatch) {
        const profilePath = playerMatch[1];
        const profileUrl = `https://www.transfermarkt.es${profilePath}`;
        const pHtml = await fetchUrl(profileUrl);

        const imgMatch = pHtml.match(/src="([^"]*portrait\/header\/[^"]*)"/i) || 
                         pHtml.match(/src="([^"]*portrait\/medium\/[^"]*)"/i);

        if (imgMatch && imgMatch[1] && !imgMatch[1].includes('default') && !imgMatch[1].includes('portrait_small')) {
          const photoUrl = imgMatch[1];
          p.photoId = photoUrl;
          p.photoUrl = photoUrl;
          p.avatarUrl = photoUrl;
          await p.save();
          updatedCount++;
          console.log(`  ✅ Foto encontrada y guardada: ${photoUrl}`);
        } else {
          notFoundCount++;
          console.log(`  ℹ️ Sin foto oficial en Transfermarkt (se mantendrá silueta 'Sin imagen').`);
        }
      } else {
        notFoundCount++;
        console.log(`  ⚠️ Perfil no encontrado en Transfermarkt.`);
      }
    } catch (err) {
      console.error(`  ❌ Error procesando ${p.name}:`, err.message);
    }

    // Gentle rate limit delay
    await delay(300);
  }

  console.log(`\n🎉 Escaneo completado: ${updatedCount} fotos actualizadas, ${notFoundCount} sin foto oficial en Transfermarkt.`);
  
  // Update knowledge/players.json
  try {
    const updatedDbPlayers = await Player.findAll();
    fs.writeFileSync('./knowledge/players.json', JSON.stringify(updatedDbPlayers, null, 2), 'utf8');
    console.log('💾 Sincronizado conocimiento en knowledge/players.json');
  } catch(e) {
    console.error('Error sincronizando players.json:', e.message);
  }
}

startPhotoScrape();
