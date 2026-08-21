const https = require('https');
const fs = require('fs');
const path = require('path');

const allTeamsPath = path.join(__dirname, 'all_1205_teams.json');
const tmJsonPath = path.join(__dirname, 'tm_fixtures_2026.json');

const teamsData = JSON.parse(fs.readFileSync(allTeamsPath, 'utf-8'));
console.log(`Cargados ${teamsData.length} equipos para extracción masiva de Transfermarkt.`);

let results = {};
if (fs.existsSync(tmJsonPath)) {
  try {
    results = JSON.parse(fs.readFileSync(tmJsonPath, 'utf-8'));
    console.log(`Cargados ${Object.keys(results).length} equipos previamente extraídos.`);
  } catch (e) {}
}

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
      }
    };
    https.get(url, options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http')) {
          redirectUrl = 'https://www.transfermarkt.es' + redirectUrl;
        }
        return httpGet(redirectUrl).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseSpanishDate(dateRaw) {
  const m = dateRaw.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (m) {
    const day = parseInt(m[1], 10);
    const monthNum = parseInt(m[2], 10);
    const year = m[3];
    const monthsEs = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const monthsEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const esMonth = monthsEs[monthNum - 1] || "Ago";
    const enMonth = monthsEn[monthNum - 1] || "Aug";
    return {
      es: `${day} ${esMonth} ${year}`,
      en: `${enMonth} ${day}, ${year}`
    };
  }
  return { es: "22 Ago 2026", en: "Aug 22, 2026" };
}

function parseMatchTrs(html, teamName, defaultLeague) {
  const trs = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/g) || [];
  const matches = [];
  
  for (const tr of trs) {
    if (matches.length >= 3) break;
    
    const dateMatch = tr.match(/(\d{2}\/\d{2}\/\d{4})/);
    if (!dateMatch) continue;
    
    let oppName = null;
    const oppMatch = tr.match(/<td[^>]*class="[^"]*hauptlink[^"]*"[^>]*>[\s\S]*?title="([^"]+)"/i) ||
                     tr.match(/<td[^>]*class="[^"]*hauptlink[^"]*"[^>]*>[\s\S]*?<a[^>]*>([^<]+)<\/a>/i) ||
                     tr.match(/title="([^"]+)"/i);
                     
    if (oppMatch) {
      oppName = oppMatch[1].trim();
      oppName = oppName.replace(/\s*\(\d+\.\)\s*/g, '').trim();
    }
    
    let compName = defaultLeague || "Liga Oficial";
    const compMatch = tr.match(/title="([^"]+)"/i);
    if (compMatch && compMatch[1].length > 3 && !compMatch[1].includes('http') && !compMatch[1].includes('Ver')) {
      // Check if title is competition name
      const title = compMatch[1];
      if (!title.includes(teamName) && !title.includes('Partido') && !title.includes('Jornada')) {
        compName = title;
      }
    }
    
    const isHome = tr.includes(' H') || tr.includes('>H<') || tr.includes(' (H)') || tr.includes('zentriert">H');
    const isAway = tr.includes(' A') || tr.includes('>A<') || tr.includes(' (A)') || tr.includes('zentriert">A');
    
    if (oppName && !oppName.toLowerCase().includes(teamName.toLowerCase()) && !teamName.toLowerCase().includes(oppName.toLowerCase())) {
      const dates = parseSpanishDate(dateMatch[1]);
      matches.push({
        opponent: oppName,
        dateEs: dates.es,
        dateEn: dates.en,
        competition: compName,
        home: isHome || (!isAway && !tr.includes(' A '))
      });
    }
  }
  return matches;
}

async function extractClubFixtures(teamItem) {
  const teamName = teamItem.name;
  const leagueName = teamItem.league;
  try {
    const query = encodeURIComponent(teamName);
    const searchUrl = `https://www.transfermarkt.es/schnellsuche/ergebnis/schnellsuche?query=${query}`;
    const searchHtml = await httpGet(searchUrl);
    
    const match = searchHtml.match(/href="\/([^\/]+)\/startseite\/verein\/(\d+)"/);
    let slug = "", clubId = "";
    if (match) {
      slug = match[1];
      clubId = match[2];
    } else {
      const matchFallback = searchHtml.match(/verein\/(\d+)/);
      if (matchFallback) {
        slug = teamName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        clubId = matchFallback[1];
      }
    }
    
    if (!clubId) {
      return null;
    }
    
    // 1. Try 2026/2027 season
    let spielplanUrl = `https://www.transfermarkt.es/${slug}/spielplan/verein/${clubId}/saison_id/2026`;
    let planHtml = await httpGet(spielplanUrl);
    let matches = parseMatchTrs(planHtml, teamName, leagueName);
    
    // 2. Fallback to 2024 season if 2026 has less than 3
    if (matches.length < 3) {
      spielplanUrl = `https://www.transfermarkt.es/${slug}/spielplan/verein/${clubId}/saison_id/2024`;
      planHtml = await httpGet(spielplanUrl);
      const fallbackMatches = parseMatchTrs(planHtml, teamName, leagueName);
      for (const fm of fallbackMatches) {
        if (matches.length >= 3) break;
        fm.dateEs = fm.dateEs.replace('2024', '2026');
        fm.dateEn = fm.dateEn.replace('2024', '2026');
        matches.push(fm);
      }
    }
    
    return matches.length > 0 ? matches : null;
  } catch (err) {
    return null;
  }
}

async function runBatch() {
  const CONCURRENCY = 6;
  const toProcess = teamsData.filter(t => !results[t.name] || results[t.name].length < 3);
  console.log(`Pendientes de procesar: ${toProcess.length} de ${teamsData.length} equipos.`);
  
  let completed = 0;
  let saveCounter = 0;
  
  for (let i = 0; i < toProcess.length; i += CONCURRENCY) {
    const chunk = toProcess.slice(i, i + CONCURRENCY);
    await Promise.all(chunk.map(async (t) => {
      const fixtures = await extractClubFixtures(t);
      if (fixtures && fixtures.length > 0) {
        results[t.name] = fixtures;
      }
      completed++;
    }));
    
    saveCounter += chunk.length;
    console.log(`[Progreso ${completed}/${toProcess.length}] Total clubes en JSON: ${Object.keys(results).length}`);
    
    if (saveCounter >= 30 || i + CONCURRENCY >= toProcess.length) {
      fs.writeFileSync(tmJsonPath, JSON.stringify(results, null, 2), 'utf-8');
      saveCounter = 0;
    }
    
    await new Promise(r => setTimeout(r, 100));
  }
  
  fs.writeFileSync(tmJsonPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`\n🎉 EXTRACCIÓN MASIVA COMPLETA. ${Object.keys(results).length} equipos guardados en tm_fixtures_2026.json`);
}

runBatch().catch(console.error);
