const { Player, sequelize } = require('./database');
const fs = require('fs');
const path = require('path');
const https = require('https');

function fetchTM(pathUrl) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'www.transfermarkt.com',
      path: pathUrl,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    };
    https.get(options, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    }).on('error', (err) => resolve({ status: 500, error: err.message, body: '' }));
  });
}

async function fixBalde() {
  const player = await Player.findOne({ where: { name: 'Alejandro Balde' } });
  if (!player) {
    console.log('Alejandro Balde not found in DB');
    process.exit(0);
  }

  console.log('Updating Alejandro Balde...');
  const profilePath = '/alejandro-balde/profil/spieler/636688';
  const profileRes = await fetchTM(profilePath);
  const html = profileRes.body;

  const imgMatch = html.match(/https:\/\/img.a.transfermarkt.technology\/portrait\/[^\"]+/i);
  const photoUrl = imgMatch ? imgMatch[0] : player.photoId;

  const mvMatch = html.match(/market-value-wrapper[^>]*>([\s\S]*?)<\/a>/i) || html.match(/tm-player-market-value-development__current-value[^>]*>([\s\S]*?)<\/a>/i);
  const rawMV = mvMatch ? mvMatch[1] : '';
  const matchMV = rawMV.replace(/<[^>]+>/g, '').trim().toLowerCase().match(/€\s*([0-9]+(?:\.[0-9]+)?)\s*(m|k)?/i);
  let finalMV = player.marketValue || 0;
  if (matchMV) {
    const val = parseFloat(matchMV[1]);
    const unit = matchMV[2];
    finalMV = unit === 'm' ? Math.round(val * 1000000) : Math.round(val);
  }

  const injuryPath = '/alejandro-balde/verletzungen/spieler/636688';
  const injuryRes = await fetchTM(injuryPath);
  const injRows = [...injuryRes.body.matchAll(/<tr[^>]*class="[^"]*(?:odd|even)[^"]*"[^>]*>([\s\S]*?)<\/tr>/gi)];
  const playerInjuries = [];

  for (const r of injRows) {
    const cells = [...r[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(c => c[1].replace(/<[^>]+>/g, '').trim());
    if (cells.length >= 5 && cells[1]) {
      playerInjuries.push({
        season: cells[0],
        injury: cells[1],
        fromDate: cells[2],
        untilDate: cells[3],
        days: cells[4],
        gamesMissed: cells[5] || '0'
      });
    }
  }

  player.photoId = photoUrl;
  player.marketValue = finalMV;
  player.overallRating = 8.4;
  player.medicalStatus = playerInjuries.length > 0 && (!playerInjuries[0].untilDate || playerInjuries[0].untilDate === '-') ? 'Lesionado' : 'Disponible';
  player.injuries = JSON.stringify(playerInjuries);

  await player.save();

  const playersFile = path.join(__dirname, 'knowledge/players.json');
  if (fs.existsSync(playersFile)) {
    const allDbPlayers = await Player.findAll();
    fs.writeFileSync(playersFile, JSON.stringify({ players: allDbPlayers.map(p => p.toJSON()) }, null, 2));
  }

  console.log('✅ Successfully updated Alejandro Balde! MarketValue:', finalMV, '| Rating:', player.overallRating, '| Injuries:', playerInjuries.length);
  process.exit(0);
}

fixBalde();
