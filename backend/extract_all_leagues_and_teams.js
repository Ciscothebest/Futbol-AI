const sqlite3 = require('sqlite3').verbose();
const https = require('https');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

function getAllTeamsFromDb() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath);
    const teamsSet = new Set();
    
    db.serialize(() => {
      db.all("SELECT DISTINCT currentTeam FROM players WHERE currentTeam IS NOT NULL AND currentTeam != ''", [], (err, rows) => {
        if (!err && rows) {
          rows.forEach(r => teamsSet.add(r.currentTeam.trim()));
        }
        
        db.all("SELECT DISTINCT name FROM teams WHERE name IS NOT NULL AND name != ''", [], (err2, rows2) => {
          if (!err2 && rows2) {
            // take top teams or all teams
            rows2.forEach(r => teamsSet.add(r.name.trim()));
          }
          db.close();
          resolve(Array.from(teamsSet));
        });
      });
    });
  });
}

function getFallbackCompetition(teamName) {
  const t = teamName.toLowerCase();
  if (t.includes('madrid') || t.includes('barcelona') || t.includes('sevilla') || t.includes('betis') || t.includes('valencia') || t.includes('villarreal') || t.includes('sociedad') || t.includes('celta') || t.includes('girona') || t.includes('getafe') || t.includes('rayo') || t.includes('mallorca') || t.includes('osasuna') || t.includes('alavés') || t.includes('alaves') || t.includes('espanyol') || t.includes('bilbao') || t.includes('leganés') || t.includes('valladolid') || t.includes('las palmas')) return "La Liga";
  if (t.includes('manchester') || t.includes('arsenal') || t.includes('liverpool') || t.includes('chelsea') || t.includes('tottenham') || t.includes('newcastle') || t.includes('villa') || t.includes('west ham') || t.includes('brighton') || t.includes('forest') || t.includes('everton') || t.includes('wolverhampton') || t.includes('palace') || t.includes('fulham') || t.includes('brentford') || t.includes('bournemouth') || t.includes('leicester') || t.includes('ipswich') || t.includes('southampton')) return "Premier League";
  if (t.includes('bayern') || t.includes('dortmund') || t.includes('leverkusen') || t.includes('leipzig') || t.includes('frankfurt') || t.includes('stuttgart') || t.includes('gladbach') || t.includes('wolfsburg') || t.includes('freiburg') || t.includes('augsburg') || t.includes('mainz') || t.includes('union berlin') || t.includes('st. pauli') || t.includes('heidenheim') || t.includes('bochum') || t.includes('kiel') || t.includes('köln')) return "Bundesliga";
  if (t.includes('juventus') || t.includes('milan') || t.includes('napoli') || t.includes('roma') || t.includes('lazio') || t.includes('atalanta') || t.includes('fiorentina') || t.includes('bologna') || t.includes('torino') || t.includes('udinese') || t.includes('genoa') || t.includes('verona') || t.includes('cagliari') || t.includes('empoli') || t.includes('parma') || t.includes('como') || t.includes('monza') || t.includes('venezia') || t.includes('lecce')) return "Serie A";
  if (t.includes('paris') || t.includes('psg') || t.includes('marseille') || t.includes('lyon') || t.includes('monaco') || t.includes('lille') || t.includes('rennes') || t.includes('lens') || t.includes('nice') || t.includes('brest') || t.includes('reims') || t.includes('toulouse') || t.includes('strasbourg') || t.includes('montpellier') || t.includes('nantes') || t.includes('auxerre') || t.includes('saint-étienne')) return "Ligue 1";
  if (t.includes('benfica') || t.includes('porto') || t.includes('sporting') || t.includes('braga') || t.includes('vitoria') || t.includes('boavista')) return "Primeira Liga";
  if (t.includes('ajax') || t.includes('psv') || t.includes('feyenoord') || t.includes('alkmaar') || t.includes('twente') || t.includes('utrecht')) return "Eredivisie";
  if (t.includes('celtic') || t.includes('rangers')) return "Scottish Premiership";
  if (t.includes('galatasaray') || t.includes('fenerbahce') || t.includes('besiktas') || t.includes('trabzonspor')) return "Super Lig";
  if (t.includes('hilal') || t.includes('nassr') || t.includes('ittihad') || t.includes('ahli')) return "Saudi Pro League";
  if (t.includes('miami') || t.includes('la galaxy') || t.includes('lafc') || t.includes('columbus') || t.includes('atlanta') || t.includes('seattle') || t.includes('ny red bulls') || t.includes('nycffc')) return "MLS Regular Season";
  if (t.includes('river') || t.includes('boca') || t.includes('racing') || t.includes('independiente') || t.includes('san lorenzo') || t.includes('vélez') || t.includes('talleres') || t.includes('lanús') || t.includes('estudiantes') || t.includes('rosario central') || t.includes('huracán')) return "Liga Profesional";
  if (t.includes('flamengo') || t.includes('palmeiras') || t.includes('fluminense') || t.includes('botafogo') || t.includes('são paulo') || t.includes('corinthians') || t.includes('grêmio') || t.includes('vasco') || t.includes('cruzeiro') || t.includes('internacional') || t.includes('atlético mineiro') || t.includes('bahia')) return "Brasileirao Serie A";
  if (t.includes('america') || t.includes('américa') || t.includes('chivas') || t.includes('cruz azul') || t.includes('tigres') || t.includes('monterrey') || t.includes('pumas') || t.includes('toluca') || t.includes('pachuca') || t.includes('atlas') || t.includes('santos laguna')) return "Liga MX Apertura";
  return "Liga Oficial";
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

function parseMatchTrs(html, teamName) {
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
    
    let compName = getFallbackCompetition(teamName);
    const compMatch = tr.match(/title="(LaLiga|Premier League|Bundesliga|Serie A|Ligue 1|UEFA Champions League|UEFA Europa League|UEFA Conference League|Copa del Rey|FA Cup)"/i);
    if (compMatch) {
      compName = compMatch[1];
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

async function extractClubFixtures(teamName) {
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
    let matches = parseMatchTrs(planHtml, teamName);
    
    // 2. Fallback to 2024 season if 2026 has less than 3
    if (matches.length < 3) {
      spielplanUrl = `https://www.transfermarkt.es/${slug}/spielplan/verein/${clubId}/saison_id/2024`;
      planHtml = await httpGet(spielplanUrl);
      const fallbackMatches = parseMatchTrs(planHtml, teamName);
      for (const fm of fallbackMatches) {
        if (matches.length >= 3) break;
        fm.dateEs = fm.dateEs.replace('2024', '2026');
        fm.dateEn = fm.dateEn.replace('2024', '2026');
        matches.push(fm);
      }
    }
    
    if (matches.length > 0) {
      return matches;
    }
    return null;
  } catch (err) {
    return null;
  }
}

async function main() {
  console.log("=== EXTRACCIÓN MASIVA DE TODAS LAS LIGAS (TRANSFERMARKT API) ===");
  const allDbTeams = await getAllTeamsFromDb();
  console.log(`Cargados ${allDbTeams.length} equipos desde la Base de Datos.`);
  
  // Filter top 150 unique primary teams across major leagues
  const primaryTeams = Array.from(new Set([
    ...allDbTeams.filter(t => t.length > 2 && !t.includes('U19') && !t.includes('U21') && !t.includes('B Team') && !t.includes('II') && !t.includes('Sub-'))
  ])).slice(0, 160);
  
  console.log(`Procesando ${primaryTeams.length} equipos principales...`);
  
  // Load existing fixtures if present to avoid re-extracting already fetched ones
  const jsonPath = path.join(__dirname, 'tm_fixtures_2026.json');
  let results = {};
  if (fs.existsSync(jsonPath)) {
    try {
      results = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    } catch(e) {}
  }
  
  for (let i = 0; i < primaryTeams.length; i++) {
    const team = primaryTeams[i];
    if (results[team] && results[team].length === 3) {
      console.log(`[${i+1}/${primaryTeams.length}] ⚡ ${team} ya extraído (${results[team].length} partidos).`);
      continue;
    }
    console.log(`[${i+1}/${primaryTeams.length}] Extrayendo de Transfermarkt: ${team}...`);
    const fixtures = await extractClubFixtures(team);
    if (fixtures && fixtures.length > 0) {
      results[team] = fixtures;
      console.log(`   ✔ ${fixtures.length} partidos guardados para ${team}`);
    } else {
      console.log(`   ⚠️ No se encontraron partidos para ${team} (se mostrará 'No hay partidos por ahora')`);
    }
    await new Promise(r => setTimeout(r, 120));
  }
  
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`\n🎉 Extracción finalizada. Guardado en tm_fixtures_2026.json con ${Object.keys(results).length} equipos.`);
}

main();
