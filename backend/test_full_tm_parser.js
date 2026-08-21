const https = require('https');

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
    req.setTimeout(10000, () => {
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

function parseInfoTableField(html, label) {
  const regex = new RegExp(`${label}:[\\s\\S]*?<span[^>]*class="[^\"]*info-table__content[^\"]*"[^>]*>([\\s\\S]*?)<\\/span>`, 'i');
  const match = html.match(regex);
  if (match) {
    return match[1].replace(/<[^>]+>/g, '').trim();
  }
  return null;
}

async function extractFullPlayerData(name, tmId, profileSlug) {
  console.log(`\n========================================`);
  console.log(`Extracting Transfermarkt details for: ${name} (ID: ${tmId})`);

  // 1. Profile Page
  const profileRes = await fetchTM(`/${profileSlug}/profil/spieler/${tmId}`);
  const pHtml = profileRes.body;

  const rawMV = (pHtml.match(/market-value-wrapper[^>]*>([\s\S]*?)<\/a>/i) ||
                 pHtml.match(/tm-player-market-value-development__current-value[^>]*>([\s\S]*?)<\/a>/i) || [''])[0];
  const marketValue = parseMarketValue(rawMV);

  const imgMatch = pHtml.match(/https:\/\/img.a.transfermarkt.technology\/portrait\/[^\"]+/i);
  const photoUrl = imgMatch ? imgMatch[0] : null;

  const jerseyMatch = pHtml.match(/data-header__shirt-number[^>]*>\s*#?([0-9]+)\s*</i);
  const jerseyNumber = jerseyMatch ? parseInt(jerseyMatch[1], 10) : null;

  const rawHeight = parseInfoTableField(pHtml, 'Height');
  let height = null;
  if (rawHeight) {
    const hMatch = rawHeight.match(/([0-9,.]+)\s*m/);
    if (hMatch) height = Math.round(parseFloat(hMatch[1].replace(',', '.')) * 100);
  }

  const foot = parseInfoTableField(pHtml, 'Foot') || 'Right';
  const ageStr = parseInfoTableField(pHtml, 'Age');
  const age = ageStr ? parseInt(ageStr, 10) : null;
  const position = parseInfoTableField(pHtml, 'Position') || 'Attacker';

  console.log(`✅ Basic info: MV=€${marketValue.toLocaleString()} | Photo=${photoUrl ? 'YES' : 'NO'} | Jersey=#${jerseyNumber} | Height=${height}cm | Foot=${foot} | Age=${age} | Pos=${position}`);

  // 2. Transfers Page
  const transfersRes = await fetchTM(`/${profileSlug}/transfers/spieler/${tmId}`);
  const tHtml = transfersRes.body;
  const transferRows = [...tHtml.matchAll(/<tr[^>]*class="[^\"]*tm-transfers-element[^\"]*"[^>]*>([\s\S]*?)<\/tr>/gi)];
  const transfers = [];
  for (const r of transferRows.slice(0, 5)) {
    const yearMatch = r[1].match(/([12][0-9]{3})/);
    const clubsMatch = [...r[1].matchAll(/<a[^>]*class="[^\"]*tm-tab-club-name[^\"]*"[^>]*>([\s\S]*?)<\/a>/gi)].map(c => c[1].replace(/<[^>]+>/g, '').trim());
    const feeMatch = r[1].match(/<td[^>]*class="[^\"]*tm-transfers-element__fee[^\"]*"[^>]*>([\s\S]*?)<\/td>/i);

    if (clubsMatch.length >= 2) {
      transfers.push({
        year: yearMatch ? parseInt(yearMatch[1], 10) : 2024,
        from: clubsMatch[0] || 'Unknown',
        to: clubsMatch[1] || 'Unknown',
        fee: feeMatch ? feeMatch[1].replace(/<[^>]+>/g, '').trim() : 'Free'
      });
    }
  }
  console.log(`🔄 Transfers found: ${transfers.length}`);

  // 3. Trophies Page
  const trophiesRes = await fetchTM(`/${profileSlug}/erfolge/spieler/${tmId}`);
  const trHtml = trophiesRes.body;
  const trophyMatches = [...trHtml.matchAll(/<h2[^>]*class="[^\"]*content-box-headline[^\"]*"[^>]*>([\s\S]*?)<\/h2>/gi)]
    .map(m => m[1].replace(/<[^>]+>/g, '').trim())
    .filter(t => t && !t.includes('Personal awards') && !t.includes('Trophies'));
  console.log(`🏆 Trophies found (${trophyMatches.length}):`, trophyMatches.slice(0, 5));

  // 4. Injuries Page
  const injuriesRes = await fetchTM(`/${profileSlug}/verletzungen/spieler/${tmId}`);
  const iHtml = injuriesRes.body;
  const injuryRows = [...iHtml.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
  const injuries = [];
  for (const r of injuryRows) {
    if (r[1].includes('td') && !r[1].includes('Season')) {
      const cells = [...r[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(c => c[1].replace(/<[^>]+>/g, '').trim());
      if (cells.length >= 4 && cells[1]) {
        injuries.push({
          season: cells[0] || '2024/25',
          injury: cells[1],
          from: cells[2],
          until: cells[3],
          days: cells[4] || 'N/A'
        });
      }
    }
  }
  console.log(`🚑 Injuries log found (${injuries.length}):`, injuries.slice(0, 3));
}

async function main() {
  await extractFullPlayerData('Erling Haaland', '418560', 'erling-haaland');
  await extractFullPlayerData('Bukayo Saka', '433177', 'bukayo-saka');
}

main();
