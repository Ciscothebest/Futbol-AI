const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json" } });

const teams = [
  { league: "Premier League", name: "Arsenal" }, { league: "Premier League", name: "Aston Villa" },
  { league: "Premier League", name: "Bournemouth" }, { league: "Premier League", name: "Brentford" },
  { league: "Premier League", name: "Brighton" }, { league: "Premier League", name: "Chelsea" },
  { league: "Premier League", name: "Crystal Palace" }, { league: "Premier League", name: "Everton" },
  { league: "Premier League", name: "Fulham" }, { league: "Premier League", name: "Liverpool" },
  { league: "Premier League", name: "Manchester City" }, { league: "Premier League", name: "Manchester United" },
  { league: "Premier League", name: "Newcastle United" }, { league: "Premier League", name: "Nottingham Forest" },
  { league: "Premier League", name: "Tottenham Hotspur" }, { league: "Premier League", name: "West Ham United" },
  { league: "La Liga", name: "Athletic Club" }, { league: "La Liga", name: "Atletico Madrid" },
  { league: "La Liga", name: "Barcelona" }, { league: "La Liga", name: "Real Betis" },
  { league: "La Liga", name: "Real Madrid" }, { league: "La Liga", name: "Real Sociedad" },
  { league: "La Liga", name: "Sevilla" }, { league: "La Liga", name: "Valencia" },
  { league: "La Liga", name: "Villarreal" }, { league: "Serie A", name: "Atalanta" },
  { league: "Serie A", name: "Fiorentina" }, { league: "Serie A", name: "Inter Milan" },
  { league: "Serie A", name: "Juventus" }, { league: "Serie A", name: "Lazio" },
  { league: "Serie A", name: "AC Milan" }, { league: "Serie A", name: "Napoli" },
  { league: "Serie A", name: "AS Roma" }
];

const dbPath = 'knowledge/players.json';
const facesPath = 'player-faces.js';

let db = { players: [] };
if (fs.existsSync(dbPath)) {
  db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
}

let playerFaces = {};
try { playerFaces = require('./player-faces'); } catch (e) {}

async function processTeams() {
  for (const team of teams) {
    console.log(`Generating starting 11 for ${team.name}...`);
    
    const prompt = `Generate a JSON array of exactly 11 player profiles for the current starting lineup of ${team.name} (${team.league}) in the 2024-25 season.
    
    CRITICAL: For each player, you MUST include a "photoId" field with their real, official SoFIFA ID (EA FC 25 ID). This is a 6-digit number. E.g. Messi is "158023".
    
    Each player MUST follow this EXACT JSON structure:
    {
      "id": "player-slug-name",
      "photoId": "123456",
      "name": "Full Name",
      "nickname": "Nickname or Short Name",
      "age": 25,
      "nationality": "English",
      "nationalityEs": "Inglés",
      "flag": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
      "position": "RW",
      "positionEs": "Extremo Derecho",
      "currentTeam": "${team.name}",
      "league": "${team.league}",
      "country": "Country",
      "jerseyNumber": 7,
      "height": 178,
      "weight": 72,
      "preferredFoot": "Left",
      "marketValue": 50000000,
      "overallRating": 85,
      "stats": { "season": "2024-25", "matches": 25, "goals": 5, "assists": 5, "yellowCards": 2 },
      "careerTotals": { "goals": 50, "assists": 30, "matches": 150 },
      "trophies": ["Trophy 1"],
      "transfers": [ { "year": 2020, "from": "Club A", "to": "Club B", "fee": "20M €" } ],
      "bio": "English bio.",
      "bioEs": "Spanish bio.",
      "strengths": ["Pace"],
      "tags": ["fast"]
    }
    
    Return ONLY a JSON array of 11 objects.`;
    
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const players = JSON.parse(text);
      
      for (const p of players) {
        // Only add if not already exists by ID
        if (!db.players.some(existing => existing.id === p.id)) {
          if (p.photoId) {
            playerFaces[p.id] = p.photoId;
            delete p.photoId; // Remove from db object, keep in playerFaces
          }
          db.players.push(p);
        }
      }
      
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
      
      // Update player-faces.js
      let facesCode = "module.exports = {\n";
      for (const [id, photoId] of Object.entries(playerFaces)) {
        facesCode += `  '${id}': '${photoId}',\n`;
      }
      facesCode += "};\n";
      fs.writeFileSync(facesPath, facesCode);
      
      console.log(`Saved ${team.name}. Total players: ${db.players.length}`);
    } catch (err) {
      console.error(`Error generating ${team.name}:`, err.message);
    }
    
    // Add small delay to avoid rate limit
    await new Promise(r => setTimeout(r, 2000));
  }
  console.log("ALL DONE!");
}

processTeams();
