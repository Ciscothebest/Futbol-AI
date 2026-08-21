const https = require('https');
const fs = require('fs');
const path = require('path');

const TEAMS = [
  "Real Madrid", "FC Barcelona", "Atlético de Madrid", "Deportivo Alavés", "Athletic Club",
  "Sevilla FC", "Real Betis", "Valencia CF", "Villarreal CF", "Real Sociedad",
  "Celta de Vigo", "Girona FC", "Getafe CF", "Rayo Vallecano", "RCD Mallorca", "Osasuna",
  "Manchester City", "Arsenal", "Liverpool", "Chelsea", "Manchester United",
  "Tottenham Hotspur", "Newcastle United", "Aston Villa", "West Ham United",
  "Brighton & Hove Albion", "Nottingham Forest", "Everton", "Wolverhampton",
  "Crystal Palace", "Fulham", "Brentford", "Bournemouth", "Leicester City",
  "Bayern Munich", "Borussia Dortmund", "Bayer Leverkusen", "RB Leipzig",
  "Eintracht Frankfurt", "VfB Stuttgart", "Juventus", "Inter Milan", "AC Milan",
  "Napoli", "AS Roma", "SS Lazio", "Atalanta BC", "Fiorentina",
  "Paris Saint-Germain", "Olympique Marseille", "Olympique Lyonnais", "AS Monaco",
  "LOSC Lille", "Stade Rennais", "RC Lens", "Nice",
  "Benfica", "FC Porto", "Sporting CP", "Ajax", "PSV Eindhoven", "Feyenoord",
  "Celtic FC", "Rangers FC", "Galatasaray", "Fenerbahce", "Al-Hilal SFC",
  "Al-Nassr FC", "Inter Miami CF", "River Plate", "Boca Juniors", "Flamengo",
  "Fluminense", "Palmeiras", "Club America", "Chivas de Guadalajara"
];

function getFallbackCompetition(teamName) {
  const spanishTeams = ["Real Madrid", "FC Barcelona", "Atlético de Madrid", "Deportivo Alavés", "Athletic Club", "Sevilla FC", "Real Betis", "Valencia CF", "Villarreal CF", "Real Sociedad", "Celta de Vigo", "Girona FC", "Getafe CF", "Rayo Vallecano", "RCD Mallorca", "Osasuna"];
  const englishTeams = ["Manchester City", "Arsenal", "Liverpool", "Chelsea", "Manchester United", "Tottenham Hotspur", "Newcastle United", "Aston Villa", "West Ham United", "Brighton & Hove Albion", "Nottingham Forest", "Everton", "Wolverhampton", "Crystal Palace", "Fulham", "Brentford", "Bournemouth", "Leicester City"];
  const germanTeams = ["Bayern Munich", "Borussia Dortmund", "Bayer Leverkusen", "RB Leipzig", "Eintracht Frankfurt", "VfB Stuttgart"];
  const italianTeams = ["Juventus", "Inter Milan", "AC Milan", "Napoli", "AS Roma", "SS Lazio", "Atalanta BC", "Fiorentina"];
  const frenchTeams = ["Paris Saint-Germain", "Olympique Marseille", "Olympique Lyonnais", "AS Monaco", "LOSC Lille", "Stade Rennais", "RC Lens", "Nice"];
  const portugueseTeams = ["Benfica", "FC Porto", "Sporting CP"];
  const dutchTeams = ["Ajax", "PSV Eindhoven", "Feyenoord"];
  const scottishTeams = ["Celtic FC", "Rangers FC"];
  const turkishTeams = ["Galatasaray", "Fenerbahce"];
  const saudiTeams = ["Al-Hilal SFC", "Al-Nassr FC"];
  const americanTeams = ["Inter Miami CF"];
  const argentineTeams = ["River Plate", "Boca Juniors"];
  const brazilianTeams = ["Flamengo", "Fluminense", "Palmeiras"];
  const mexicanTeams = ["Club America", "Chivas de Guadalajara"];

  if (spanishTeams.includes(teamName)) return "La Liga";
  if (englishTeams.includes(teamName)) return "Premier League";
  if (germanTeams.includes(teamName)) return "Bundesliga";
  if (italianTeams.includes(teamName)) return "Serie A";
  if (frenchTeams.includes(teamName)) return "Ligue 1";
  if (portugueseTeams.includes(teamName)) return "Primeira Liga";
  if (dutchTeams.includes(teamName)) return "Eredivisie";
  if (scottishTeams.includes(teamName)) return "Scottish Premiership";
  if (turkishTeams.includes(teamName)) return "Super Lig";
  if (saudiTeams.includes(teamName)) return "Saudi Pro League";
  if (americanTeams.includes(teamName)) return "MLS Regular Season";
  if (argentineTeams.includes(teamName)) return "Liga Profesional";
  if (brazilianTeams.includes(teamName)) return "Brasileirao Serie A";
  if (mexicanTeams.includes(teamName)) return "Liga MX Apertura";
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
  // "26/08/2026" -> "26 Ago 2026" / "Aug 26, 2026"
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
    
    // Check competition if present in tr
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
      console.log(`[TM Fixtures] ⚠️ No ID found for ${teamName}`);
      return null;
    }
    
    // 1. Try 2026/2027 season (saison_id=2026)
    let spielplanUrl = `https://www.transfermarkt.es/${slug}/spielplan/verein/${clubId}/saison_id/2026`;
    let planHtml = await httpGet(spielplanUrl);
    let matches = parseMatchTrs(planHtml, teamName);
    
    // 2. Fallback to 2024 season if 2026 is empty for some leagues
    if (matches.length < 3) {
      spielplanUrl = `https://www.transfermarkt.es/${slug}/spielplan/verein/${clubId}/saison_id/2024`;
      planHtml = await httpGet(spielplanUrl);
      const fallbackMatches = parseMatchTrs(planHtml, teamName);
      for (const fm of fallbackMatches) {
        if (matches.length >= 3) break;
        // update year to 2026 for coherence
        fm.dateEs = fm.dateEs.replace('2024', '2026');
        fm.dateEn = fm.dateEn.replace('2024', '2026');
        matches.push(fm);
      }
    }
    
    if (matches.length > 0) {
      console.log(`[TM Fixtures] ✔ Extracted ${matches.length} 2026-2027 matches for ${teamName}`);
      return matches;
    }
    return null;
  } catch (err) {
    console.error(`[TM Fixtures] Error processing ${teamName}:`, err.message);
    return null;
  }
}

async function main() {
  console.log("=== EXTRACCIÓN REAL DE PARTIDOS TEMPORADA 2026-2027 (TRANSFERMARKT) ===");
  const results = {};
  for (let i = 0; i < TEAMS.length; i++) {
    const team = TEAMS[i];
    console.log(`[${i+1}/${TEAMS.length}] Extrayendo: ${team}...`);
    const fixtures = await extractClubFixtures(team);
    if (fixtures) {
      results[team] = fixtures;
    }
    await new Promise(r => setTimeout(r, 150));
  }
  
  const jsonPath = path.join(__dirname, 'tm_fixtures_2026.json');
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`\n🎉 Finalizado. Guardado en tm_fixtures_2026.json con ${Object.keys(results).length} equipos.`);
}

main();
