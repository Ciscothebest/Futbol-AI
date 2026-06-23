const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");
// We can use gemini-2.5-flash or gemini-2.0-flash
const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const model = genAI.getGenerativeModel({ 
  model: modelName, 
  generationConfig: { responseMimeType: "application/json" } 
});

const customTeams = {
  "Spain": ["Real Madrid","FC Barcelona","Atlético de Madrid","Sevilla FC","Valencia CF","Villarreal CF","Athletic Club","Real Sociedad","Real Betis","Celta Vigo","Rayo Vallecano","Girona FC","UD Las Palmas","RCD Mallorca","Getafe CF","CD Leganés","RCD Espanyol","Deportivo Alavés","Real Valladolid","Osasuna"],
  "United Kingdom": ["Manchester City","Arsenal","Liverpool","Chelsea","Manchester United","Tottenham Hotspur","Newcastle United","West Ham United","Aston Villa","Brighton & Hove Albion","Brentford","Crystal Palace","Everton","Wolverhampton Wanderers","Fulham","AFC Bournemouth","Nottingham Forest","Leicester City","Ipswich Town","Southampton"],
  "Germany": ["Bayern München","Bayer 04 Leverkusen","Borussia Dortmund","RB Leipzig","Eintracht Frankfurt","VfB Stuttgart","1. FC Union Berlin","Werder Bremen","SC Freiburg","VfL Wolfsburg","TSG Hoffenheim","1. FSV Mainz 05","FC Augsburg","Borussia Mönchengladbach","VfL Bochum","1. FC Heidenheim","FC St. Pauli","Holstein Kiel"],
  "France": ["Paris Saint-Germain","AS Monaco","Olympique Lyonnais","Olympique de Marseille","LOSC Lille","OGC Nice","Stade Rennais","RC Lens","FC Nantes","RC Strasbourg","Montpellier HSC","Stade de Reims","Toulouse FC","AJ Auxerre","Le Havre AC","Stade Brestois 29","Angers SCO","AS Saint-Étienne"],
  "Italy": ["Inter Milan","AC Milan","Juventus","Napoli","Atalanta","AS Roma","SS Lazio","Fiorentina","Torino","Bologna","Genoa","Monza","Lecce","Udinese","Empoli","Como 1907","Venezia","Hellas Verona","Cagliari","Parma"],
  "Brazil": ["CR Flamengo","SE Palmeiras","Santos FC","São Paulo FC","Grêmio","SC Internacional","SC Corinthians","Atlético Mineiro","Fluminense","Botafogo","Vasco da Gama","Cruzeiro","RB Bragantino","Fortaleza","Ceará","Sport Recife","Cuiabá","Goiás","América MG","Juventude"],
  "Argentina": ["Boca Juniors","River Plate","San Lorenzo","Racing Club","Independiente","Vélez Sársfield","Huracán","Lanús","Talleres","Estudiantes","Banfield","Colón","Defensa y Justicia","Godoy Cruz","Platense","Argentinos Juniors","Rosario Central","Newell's Old Boys","Sarmiento","Instituto"],
  "Mexico": ["Club América","CD Guadalajara","Cruz Azul","Pumas UNAM","Tigres UANL","CF Monterrey","Club León","Club Pachuca","Atlas FC","Club Tijuana","Santos Laguna","Toluca","Querétaro","FC Juárez","Mazatlán FC","Puebla FC","Necaxa","San Luis"],
  "Saudi Arabia": ["Al-Nassr FC","Al-Hilal SFC","Al-Ittihad Club","Al-Ahli SFC","Al-Qadsiah","Al-Shabab FC","Al-Fateh SC","Al-Wehda FC","Al-Feiha","Al-Khaleej","Damac FC","Al-Okhdood"],
  "United States of America": ["Inter Miami CF","LA Galaxy","New York City FC","Seattle Sounders FC","Portland Timbers","Atlanta United","Columbus Crew","Philadelphia Union","New England Revolution","FC Cincinnati","Toronto FC","Vancouver Whitecaps","Austin FC","Nashville SC","Charlotte FC"]
};

async function run() {
  console.log("Gathering team list...");
  const teamsArray = [];
  for (const [country, list] of Object.entries(customTeams)) {
    for (const name of list) {
      teamsArray.push({ name, country });
    }
  }
  
  console.log(`Total teams to map: ${teamsArray.length}`);
  
  const prompt = `You are a football database assistant. Map each football club to its official SoFIFA / EA Sports FC team ID.
  Here is the list of teams (name and country):
  ${JSON.stringify(teamsArray, null, 2)}
  
  Please return a JSON object where the keys are the exact team names, and the values are their SoFIFA Team IDs as strings.
  Ensure highly accurate mappings. For example:
  "Real Madrid" -> "243"
  "FC Barcelona" -> "241"
  "Manchester City" -> "10"
  "Arsenal" -> "1"
  "Chelsea" -> "5"
  "Liverpool" -> "9"
  "Bayern München" -> "21"
  "Boca Juniors" -> "1906"
  "River Plate" -> "1876"
  "Inter Miami CF" -> "112885"
  
  Format the output strictly as a JSON object, e.g.:
  {
    "Real Madrid": "243",
    "FC Barcelona": "241",
    ...
  }`;
  
  try {
    console.log("Calling Gemini API to map team IDs...");
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log("Received response. Saving to backend/team-logos.json...");
    fs.writeFileSync('backend/team-logos.json', text);
    console.log("Saved successfully!");
  } catch (err) {
    console.error("Gemini mapping failed:", err);
    // Write fallback dictionary just in case
    const fallback = {
      "Real Madrid": "243",
      "FC Barcelona": "241",
      "Atlético de Madrid": "240",
      "Sevilla FC": "481",
      "Valencia CF": "461",
      "Villarreal CF": "483",
      "Athletic Club": "448",
      "Real Sociedad": "457",
      "Real Betis": "449",
      "Girona FC": "110549",
      "Manchester City": "10",
      "Arsenal": "1",
      "Liverpool": "9",
      "Chelsea": "5",
      "Manchester United": "11",
      "Tottenham Hotspur": "18",
      "Newcastle United": "13",
      "Bayern München": "21",
      "Bayer 04 Leverkusen": "32",
      "Borussia Dortmund": "22",
      "Paris Saint-Germain": "73",
      "Inter Milan": "44",
      "Juventus": "45",
      "AC Milan": "47",
      "Boca Juniors": "1906",
      "River Plate": "1876",
      "Inter Miami CF": "112885"
    };
    fs.writeFileSync('backend/team-logos.json', JSON.stringify(fallback, null, 2));
    console.log("Saved fallback dictionary.");
  }
}

run();
