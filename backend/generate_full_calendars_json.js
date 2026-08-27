const fs = require('fs');
const path = require('path');
const { fetchFullCalendarForClub } = require('./extract_all_tm_full_calendars');

const CLUBS = [
  // La Liga
  "Real Madrid", "FC Barcelona", "Atlético de Madrid", "Deportivo Alavés", "Athletic Club",
  "Sevilla FC", "Real Betis", "Valencia CF", "Villarreal CF", "Real Sociedad",
  "Celta de Vigo", "Girona FC", "Getafe CF", "Rayo Vallecano", "RCD Mallorca", "Osasuna",
  "RCD Espanyol", "Real Valladolid", "CD Leganés", "UD Las Palmas",
  
  // Premier League
  "Manchester City", "Arsenal", "Liverpool", "Chelsea", "Manchester United",
  "Tottenham Hotspur", "Newcastle United", "Aston Villa", "West Ham United",
  "Brighton & Hove Albion", "Nottingham Forest", "Everton", "Wolverhampton Wanderers",
  "Crystal Palace", "Fulham", "Brentford", "AFC Bournemouth", "Leicester City",
  "Ipswich Town", "Southampton FC",

  // Bundesliga
  "Bayern Munich", "Borussia Dortmund", "Bayer 04 Leverkusen", "RB Leipzig",
  "Eintracht Frankfurt", "VfB Stuttgart", "VfL Wolfsburg", "Borussia Mönchengladbach",
  "SV Werder Bremen", "TSG 1899 Hoffenheim", "SC Freiburg", "1.FC Union Berlin",

  // Serie A
  "Juventus FC", "Inter Milan", "AC Milan", "SSC Napoli", "AS Roma", "SS Lazio",
  "Atalanta BC", "ACF Fiorentina", "Bologna FC 1909", "Torino FC", "Udinese Calcio",

  // Ligue 1
  "Paris Saint-Germain", "Olympique Marseille", "Olympique Lyonnais", "AS Monaco",
  "LOSC Lille", "Stade Rennais FC", "RC Lens", "OGC Nice",

  // Others & Latin America
  "Benfica", "FC Porto", "Sporting CP", "Ajax Amsterdam", "PSV Eindhoven", "Feyenoord",
  "Galatasaray", "Fenerbahce", "Al-Hilal SFC", "Al-Nassr FC", "Inter Miami CF",
  "River Plate", "Boca Juniors", "Flamengo", "Fluminense", "Palmeiras", "Club América", "Chivas de Guadalajara"
];

async function run() {
  console.log(`=== EXTRACCIÓN DE CALENDARIOS COMPLETOS (TRANSFERMARKT API) PARA ${CLUBS.length} CLUBES ===`);
  const results = {};
  
  for (let i = 0; i < CLUBS.length; i++) {
    const club = CLUBS[i];
    console.log(`[${i+1}/${CLUBS.length}] Procesando ${club}...`);
    const matches = await fetchFullCalendarForClub(club);
    if (matches && matches.length > 0) {
      results[club] = matches;
    }
    await new Promise(r => setTimeout(r, 200));
  }

  const outPath = path.join(__dirname, 'tm_full_calendars_2026.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`\n🎉 Completado. Guardado en tm_full_calendars_2026.json con ${Object.keys(results).length} clubes y miles de partidos.`);
}

run().catch(console.error);
