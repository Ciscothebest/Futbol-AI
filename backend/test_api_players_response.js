const jwt = require('jsonwebtoken');
const http = require('http');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const JWT_SECRET = process.env.JWT_SECRET || 'futbol_ai_jwt_secret_key_2026';
const token = jwt.sign({ id: '1', username: 'admin' }, JWT_SECRET, { expiresIn: '1h' });

console.log("=========================================================================");
console.log("TESTING GET /api/players ENDPOINT RESPONSE");
console.log("=========================================================================\n");

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/players',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    try {
      const data = JSON.parse(body);
      console.log(`Status Code: ${res.statusCode}`);
      console.log(`Total Players returned by /api/players: ${data.players ? data.players.length : 0}`);
      
      if (Array.isArray(data.players) && data.players.length > 0) {
        console.log("\n🔍 Sample Player Object returned by API:");
        const p = data.players[0];
        console.log({
          id: p.id,
          name: p.name,
          currentTeam: p.currentTeam,
          league: p.league,
          photoId: p.photoId,
          avatarUrl: p.avatarUrl,
          hasStats: !!p.stats,
          hasHistory: !!p.history,
          hasBio: !!p.bioEs || !!p.bio
        });

        // Group by league in returned API array
        const leagues = {};
        data.players.forEach(pl => {
          leagues[pl.league] = (leagues[pl.league] || 0) + 1;
        });
        console.log("\n📊 Leagues returned in API response:", leagues);
      } else {
        console.log("Response Body:", body);
      }
    } catch(e) {
      console.error("Parse error:", e.message, body);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();
