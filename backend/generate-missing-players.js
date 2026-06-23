const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json" } });

const faces = require('./player-faces');
const dbPath = 'knowledge/players.json';
const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

const existingIds = new Set(db.players.map(p => p.id));
const missingIds = Object.keys(faces).filter(id => !existingIds.has(id));

console.log(`Generating ${missingIds.length} missing players...`);

async function generatePlayers() {
  // Generate in batches of 10 to avoid huge outputs
  for (let i = 0; i < missingIds.length; i += 10) {
    const batch = missingIds.slice(i, i + 10);
    console.log(`Generating batch: ${batch.join(', ')}`);
    
    const prompt = `Generate a JSON array of 10 football player profiles.
    The players MUST be exactly these, with these exact IDs:
    ${batch.map(id => `- ID: "${id}"`).join('\n')}
    
    Each player MUST follow this EXACT JSON structure:
    {
      "id": "player-slug-from-list",
      "name": "Full Name",
      "nickname": "Nickname or Short Name",
      "age": 25,
      "nationality": "English",
      "nationalityEs": "Inglés",
      "flag": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
      "position": "RW",
      "positionEs": "Extremo Derecho",
      "currentTeam": "Arsenal",
      "league": "Premier League",
      "country": "England",
      "jerseyNumber": 7,
      "height": 178,
      "weight": 72,
      "preferredFoot": "Left",
      "marketValue": 100000000,
      "overallRating": 85,
      "stats": { "season": "2024-25", "matches": 25, "goals": 10, "assists": 5, "yellowCards": 2 },
      "careerTotals": { "goals": 50, "assists": 30, "matches": 150 },
      "trophies": ["Trophy 1"],
      "transfers": [ { "year": 2020, "from": "Club A", "to": "Club B", "fee": "20M €" } ],
      "bio": "English bio.",
      "bioEs": "Spanish bio.",
      "strengths": ["Pace", "Dribbling"],
      "tags": ["dribbler", "fast"]
    }
    
    Return ONLY a JSON array of these player objects.`;
    
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const players = JSON.parse(text);
      
      players.forEach(p => db.players.push(p));
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
      console.log(`Saved ${players.length} players from batch.`);
    } catch (err) {
      console.error('Error generating batch:', err.message);
    }
  }
  
  console.log('Finished generating all players. Total DB size:', db.players.length);
}

generatePlayers();
