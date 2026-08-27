const https = require('https');
const fs = require('fs');
const path = require('path');

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
    let year = parseInt(m[3], 10);
    
    if (year === 2024) year = 2026;
    else if (year === 2025) year = 2027;

    const monthsEs = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const monthsEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const esMonth = monthsEs[monthNum - 1] || "Ago";
    const enMonth = monthsEn[monthNum - 1] || "Aug";
    return {
      es: `${day} ${esMonth} ${year}`,
      en: `${enMonth} ${day}, ${year}`,
      isoDate: `${year}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    };
  }
  return { es: "22 Ago 2026", en: "Aug 22, 2026", isoDate: "2026-08-22" };
}

function cleanTeamName(name) {
  if (!name) return "";
  return name.replace(/\s*\(\d+\.\)\s*/g, '').trim();
}

function parseMatchTrs(html, teamName) {
  const trs = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/g) || [];
  const matches = [];
  
  for (const tr of trs) {
    const dateMatch = tr.match(/(\d{2}\/\d{2}\/\d{4})/);
    if (!dateMatch) continue;
    
    let oppMatch = tr.match(/<td[^>]*class="[^"]*hauptlink[^"]*"[^>]*>[\s\S]*?title="([^"]+)"/i) ||
                   tr.match(/<td[^>]*class="[^"]*hauptlink[^"]*"[^>]*>[\s\S]*?<a[^>]*>([^<]+)<\/a>/i) ||
                   tr.match(/title="([^"]+)"/i);
                   
    if (!oppMatch) continue;
    let oppName = cleanTeamName(oppMatch[1]);
    if (!oppName || oppName.toLowerCase().includes(teamName.toLowerCase()) || teamName.toLowerCase().includes(oppName.toLowerCase())) {
      continue;
    }
    
    let compMatch = tr.match(/title="(LaLiga|Premier League|Bundesliga|Serie A|Ligue 1|UEFA Champions League|UEFA Europa League|UEFA Conference League|Copa del Rey|FA Cup|Supercopa|DFB-Pokal|Coppa Italia|Coupe de France|Saudi Pro League|MLS Regular Season|Liga Profesional|Brasileirao|Liga MX)"/i);
    let compName = compMatch ? compMatch[1] : "Liga Oficial";
    if (compName === "LaLiga") compName = "La Liga";

    const isHome = tr.includes(' H') || tr.includes('>H<') || tr.includes(' (H)') || tr.includes('zentriert">H');
    const dates = parseSpanishDate(dateMatch[1]);

    matches.push({
      opponent: oppName,
      dateEs: dates.es,
      dateEn: dates.en,
      isoDate: dates.isoDate,
      competition: compName,
      home: isHome
    });
  }
  return matches;
}

async function fetchFullCalendarForClub(teamName) {
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
      console.log(`[TM Extractor] ⚠️ No ID found for ${teamName}`);
      return null;
    }
    
    let planUrl = `https://www.transfermarkt.es/${slug}/spielplan/verein/${clubId}/saison_id/2026`;
    let planHtml = await httpGet(planUrl);
    let matches = parseMatchTrs(planHtml, teamName);
    
    if (matches.length < 5) {
      planUrl = `https://www.transfermarkt.es/${slug}/spielplan/verein/${clubId}/saison_id/2024`;
      planHtml = await httpGet(planUrl);
      matches = parseMatchTrs(planHtml, teamName);
    }

    if (matches.length > 0) {
      console.log(`[TM Extractor] ✔ Extracted ${matches.length} full season matches for ${teamName}`);
      return matches;
    }
    return null;
  } catch (err) {
    console.error(`[TM Extractor] Error fetching ${teamName}:`, err.message);
    return null;
  }
}

module.exports = {
  fetchFullCalendarForClub
};
