const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json" } });

const teams = [
  // Premier League
  { league: "Premier League", name: "Arsenal" }, { league: "Premier League", name: "Aston Villa" },
  { league: "Premier League", name: "Bournemouth" }, { league: "Premier League", name: "Brentford" },
  { league: "Premier League", name: "Brighton" }, { league: "Premier League", name: "Chelsea" },
  { league: "Premier League", name: "Crystal Palace" }, { league: "Premier League", name: "Everton" },
  { league: "Premier League", name: "Fulham" }, { league: "Premier League", name: "Ipswich Town" },
  { league: "Premier League", name: "Leicester City" }, { league: "Premier League", name: "Liverpool" },
  { league: "Premier League", name: "Manchester City" }, { league: "Premier League", name: "Manchester United" },
  { league: "Premier League", name: "Newcastle United" }, { league: "Premier League", name: "Nottingham Forest" },
  { league: "Premier League", name: "Southampton" }, { league: "Premier League", name: "Tottenham Hotspur" },
  { league: "Premier League", name: "West Ham United" }, { league: "Premier League", name: "Wolverhampton Wanderers" },
  // La Liga
  { league: "La Liga", name: "Alaves" }, { league: "La Liga", name: "Athletic Club" },
  { league: "La Liga", name: "Atletico Madrid" }, { league: "La Liga", name: "Barcelona" },
  { league: "La Liga", name: "Celta Vigo" }, { league: "La Liga", name: "Espanyol" },
  { league: "La Liga", name: "Getafe" }, { league: "La Liga", name: "Girona" },
  { league: "La Liga", name: "Las Palmas" }, { league: "La Liga", name: "Leganes" },
  { league: "La Liga", name: "Mallorca" }, { league: "La Liga", name: "Osasuna" },
  { league: "La Liga", name: "Rayo Vallecano" }, { league: "La Liga", name: "Real Betis" },
  { league: "La Liga", name: "Real Madrid" }, { league: "La Liga", name: "Real Sociedad" },
  { league: "La Liga", name: "Real Valladolid" }, { league: "La Liga", name: "Sevilla" },
  { league: "La Liga", name: "Valencia" }, { league: "La Liga", name: "Villarreal" },
  // Serie A
  { league: "Serie A", name: "Atalanta" }, { league: "Serie A", name: "Bologna" },
  { league: "Serie A", name: "Cagliari" }, { league: "Serie A", name: "Como" },
  { league: "Serie A", name: "Empoli" }, { league: "Serie A", name: "Fiorentina" },
  { league: "Serie A", name: "Genoa" }, { league: "Serie A", name: "Inter Milan" },
  { league: "Serie A", name: "Juventus" }, { league: "Serie A", name: "Lazio" },
  { league: "Serie A", name: "Lecce" }, { league: "Serie A", name: "AC Milan" },
  { league: "Serie A", name: "Monza" }, { league: "Serie A", name: "Napoli" },
  { league: "Serie A", name: "Parma" }, { league: "Serie A", name: "AS Roma" },
  { league: "Serie A", name: "Torino" }, { league: "Serie A", name: "Udinese" },
  { league: "Serie A", name: "Venezia" }, { league: "Serie A", name: "Hellas Verona" }
];

const dbPath = 'knowledge/players.json';
const facesPath = 'player-faces.js';

async function processTeams() {
  for (const team of teams) {
    let db = { players: [] };
    if (fs.existsSync(dbPath)) db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    
    // Check if we already have ~11 players for this team
    const teamPlayersCount = db.players.filter(p => p.currentTeam === team.name).length;
    if (teamPlayersCount >= 8) {
      console.log(`Skipping ${team.name}, already has ${teamPlayersCount} players.`);
      continue;
    }
    
    console.log(`Generating starting 11 for ${team.name}...`);
    
    let playerFaces = {};
    try { playerFaces = require('./player-faces'); } catch (e) {}

    const prompt = `Generate a JSON array of exactly 11 player profiles for the current starting lineup of ${team.name} (${team.league}) in the 2024-25 season.
    CRITICAL: For each player, include "photoId" with their real SoFIFA ID (EA FC 25 ID, 6-digits). E.g. 158023.
    Format exactly:
    { "id": "player-slug", "photoId": "123456", "name": "...", "nickname": "...", "age": 25, "nationality": "...", "nationalityEs": "...", "flag": "🇪🇸", "position": "...", "positionEs": "...", "currentTeam": "${team.name}", "league": "${team.league}", "country": "...", "jerseyNumber": 7, "height": 180, "weight": 75, "preferredFoot": "Right", "marketValue": 10000000, "overallRating": 80, "stats": { "season": "2024-25", "matches": 20, "goals": 2, "assists": 1, "yellowCards": 1 }, "careerTotals": { "goals": 10, "assists": 5, "matches": 100 }, "trophies": [], "transfers": [], "bio": "Bio", "bioEs": "Bio ES", "strengths": ["Pace"], "tags": ["tag"] }
    Return ONLY a JSON array.`;
    
    let retries = 3;
    while (retries > 0) {
      try {
        const result = await model.generateContent(prompt);
        const players = JSON.parse(result.response.text());
        
        for (const p of players) {
          if (!db.players.some(existing => existing.id === p.id)) {
            if (p.photoId) {
              playerFaces[p.id] = p.photoId;
              delete p.photoId;
            }
            db.players.push(p);
          }
        }
        
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
        let facesCode = "module.exports = {\n";
        for (const [id, photoId] of Object.entries(playerFaces)) facesCode += `  '${id}': '${photoId}',\n`;
        facesCode += "};\n";
        fs.writeFileSync(facesPath, facesCode);
        
        console.log(`Saved ${team.name}. Total players: ${db.players.length}`);
        break; // Success, exit retry loop
      } catch (err) {
        console.error(`Error generating ${team.name} (Retries left: ${retries-1}):`, err.message);
        retries--;
        await new Promise(r => setTimeout(r, 5000)); // Wait 5s before retry
      }
    }
    await new Promise(r => setTimeout(r, 2000)); // Wait 2s between teams
  }
  console.log("ALL DONE!");
}

processTeams();
