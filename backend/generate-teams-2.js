const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json" } });

const teams = [
  { league: "Premier League", name: "Ipswich Town" }, { league: "Premier League", name: "Leicester City" },
  { league: "Premier League", name: "Southampton" }, { league: "Premier League", name: "Wolverhampton Wanderers" },
  { league: "La Liga", name: "Alaves" }, { league: "La Liga", name: "Celta Vigo" },
  { league: "La Liga", name: "Espanyol" }, { league: "La Liga", name: "Getafe" },
  { league: "La Liga", name: "Girona" }, { league: "La Liga", name: "Las Palmas" },
  { league: "La Liga", name: "Leganes" }, { league: "La Liga", name: "Mallorca" },
  { league: "La Liga", name: "Osasuna" }, { league: "La Liga", name: "Rayo Vallecano" },
  { league: "La Liga", name: "Real Valladolid" },
  { league: "Serie A", name: "Bologna" }, { league: "Serie A", name: "Cagliari" },
  { league: "Serie A", name: "Como" }, { league: "Serie A", name: "Empoli" },
  { league: "Serie A", name: "Genoa" }, { league: "Serie A", name: "Lecce" },
  { league: "Serie A", name: "Monza" }, { league: "Serie A", name: "Parma" },
  { league: "Serie A", name: "Torino" }, { league: "Serie A", name: "Udinese" },
  { league: "Serie A", name: "Venezia" }, { league: "Serie A", name: "Hellas Verona" }
];

const dbPath = 'knowledge/players.json';
const facesPath = 'player-faces.js';

async function processTeams() {
  for (const team of teams) {
    console.log(`Generating starting 11 for ${team.name}...`);
    
    // Always re-read DB to prevent parallel overwrite issues
    let db = { players: [] };
    if (fs.existsSync(dbPath)) db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    let playerFaces = {};
    try { playerFaces = require('./player-faces'); } catch (e) {}

    const prompt = `Generate a JSON array of exactly 11 player profiles for the current starting lineup of ${team.name} (${team.league}) in the 2024-25 season.
    CRITICAL: For each player, include "photoId" with their real SoFIFA ID (6-digits).
    Format exactly:
    { "id": "player-slug", "photoId": "123456", "name": "...", "nickname": "...", "age": 25, "nationality": "...", "nationalityEs": "...", "flag": "🇪🇸", "position": "...", "positionEs": "...", "currentTeam": "${team.name}", "league": "${team.league}", "country": "...", "jerseyNumber": 7, "height": 180, "weight": 75, "preferredFoot": "Right", "marketValue": 10000000, "overallRating": 80, "stats": { "season": "2024-25", "matches": 20, "goals": 2, "assists": 1, "yellowCards": 1 }, "careerTotals": { "goals": 10, "assists": 5, "matches": 100 }, "trophies": [], "transfers": [], "bio": "Bio", "bioEs": "Bio ES", "strengths": ["Pace"], "tags": ["tag"] }
    Return ONLY a JSON array.`;
    
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
    } catch (err) {
      console.error(`Error generating ${team.name}:`, err.message);
    }
    await new Promise(r => setTimeout(r, 2000));
  }
}
processTeams();
