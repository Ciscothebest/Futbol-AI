const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const FootballAgent = require('./agent');
const { Player, User, League, Team, sequelize, QueryLog, ComparisonLog, FavoriteLog, Payment } = require('./database');
const seedLeaguesAndTeams = require('./seed-db-onboarding');

const app = express();
const agent = new FootballAgent();
const PORT = process.env.PORT || 3001;
const FRONTEND_PATH = path.join(__dirname, '../frontend');
const JWT_SECRET = process.env.JWT_SECRET || 'scoutai-super-secret-key-2025';

// ─── Middleware ───────────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));

app.use(express.static(FRONTEND_PATH));

// ─── Auth Routes (Prioritized) ──────────────────────────────────
const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter({ User, JWT_SECRET }));

// ─── Auth Middleware ──────────────────────────────────────────────
const authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    console.warn(`🔒 Auth failed: No header or wrong format for ${req.path}`);
    return res.status(401).json({ error: 'Sesión no válida' });
  }
  try {
    const token = header.split(' ')[1];
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    console.warn(`🔒 Auth failed: Invalid token for ${req.path} - ${err.message}`);
    return res.status(401).json({ error: 'Sesión expirada' });
  }
};

// ─── Payments Routes ─────────────────────────────────────────────
const paymentsRouter = require('./routes/payments');
app.use('/api/payments', authenticate, paymentsRouter({ Payment, User }));


// ─── Health ───────────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  try {
    const playerCount = await Player.count();
    res.json({
      status: 'ok',
      demoMode: agent.demoMode,
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
      players: playerCount,
      db: 'connected'
    });
  } catch (err) {
    res.json({ status: 'error', message: err.message });
  }
});

// ─── Players ──────────────────────────────────────────────────────
const playerFaces = require('./player-faces');

app.get('/api/players', authenticate, async (req, res) => {
  try {
    let { search, league, position, limit, team } = req.query;
    const { Op } = require('sequelize');
    
    let where = {};
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { currentTeam: { [Op.like]: `%${search}%` } },
        { nationality: { [Op.like]: `%${search}%` } },
        { nickname: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (league) {
      // Handle the kebab-case from frontend if necessary, or just direct match
      // The frontend sends something like "premier-league"
      where.league = { [Op.like]: league.replace(/-/g, ' ') };
    }
    
    if (position) {
      where.position = position.toUpperCase();
    }

    if (team) {
      where.currentTeam = team;
    }
    
    let results = await Player.findAll({
      where,
      limit: limit ? parseInt(limit) : undefined,
      order: [['overallRating', 'DESC']]
    });
    
    // Inject avatar data
    const fs = require('fs');
    const apiHost = req.protocol + '://' + req.get('host');
    results = results.map(p => {
      const data = p.toJSON();
      const localImgPath = path.join(FRONTEND_PATH, 'assets', 'players', `${data.id}.png`);
      let avatarUrl = '';
      
      if (fs.existsSync(localImgPath)) {
        avatarUrl = `/assets/players/${data.id}.png`;
      } else {
        const photoId = data.photoId || playerFaces[data.id];
        const fallbackUrl = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(data.name)}&backgroundColor=0d1117&textColor=ffffff&radius=50`;
        avatarUrl = photoId ? `${apiHost}/api/player-photo/${photoId}?v=2` : fallbackUrl;
      }
      
      return {
        ...data,
        avatarUrl
      };
    });
    
    res.json({ players: results, total: results.length });
  } catch (err) {
    console.error('API players error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/players/:id', async (req, res) => {
  try {
    const player = await Player.findByPk(req.params.id);
    if (!player) return res.status(404).json({ error: 'Player not found' });
    
    const data = player.toJSON();
    const fs = require('fs');
    const localImgPath = path.join(FRONTEND_PATH, 'assets', 'players', `${data.id}.png`);
    const apiHost = req.protocol + '://' + req.get('host');
    
    if (fs.existsSync(localImgPath)) {
      data.avatarUrl = `/assets/players/${data.id}.png`;
    } else {
      const photoId = data.photoId || playerFaces[data.id];
      const fallbackUrl = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(data.name)}&backgroundColor=0d1117&textColor=ffffff&radius=50`;
      data.photoId = photoId || null;
      data.avatarUrl = photoId ? `${apiHost}/api/player-photo/${photoId}?v=2` : fallbackUrl;
    }
    
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Image Proxy ──────────────────────────────────────────────────
app.get('/api/player-photo/:id', (req, res) => {
  const https = require('https');
  const idStr = String(req.params.id).padStart(6, '0');
  const p1 = idStr.substring(0, 3);
  const p2 = idStr.substring(3, 6);
  
  const options = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': 'https://sofifa.com/',
      'Accept': 'image/png,image/webp,*/*;q=0.8'
    }
  };

  const years = ['25', '24', '23', '22', '21'];
  let currentYearIdx = 0;

  function fetchImage() {
    if (currentYearIdx >= years.length) {
      return res.status(404).send('Image not found');
    }
    const year = years[currentYearIdx];
    const url = `https://cdn.sofifa.net/players/${p1}/${p2}/${year}_120.png`;
    
    https.get(url, options, (proxyRes) => {
      if (proxyRes.statusCode !== 200) {
        proxyRes.resume(); // Consume the stream to free up memory
        currentYearIdx++;
        return fetchImage();
      }
      
      res.setHeader('Content-Type', proxyRes.headers['content-type'] || 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      proxyRes.pipe(res);
    }).on('error', (err) => {
      console.error('Image proxy error:', err);
      res.status(500).send('Error proxying image');
    });
  }

  fetchImage();
});



// ─── Chat ─────────────────────────────────────────────────────────
app.post('/api/chat', authenticate, async (req, res) => {
  const { message, audioBase64, mimeType, sessionId, lang } = req.body;
  if (!message && !audioBase64) return res.status(400).json({ error: 'Message or audio is required' });

  const sid = sessionId || uuidv4();

  try {
    const reply = await agent.chat(sid, message || '', lang || 'es', audioBase64, mimeType);
    res.json({ reply, sessionId: sid });
  } catch (err) {
    console.error('Chat error:', err.message);
    const isRateLimit = err.message?.includes('429') || err.message?.includes('quota') || err.message?.includes('RESOURCE_EXHAUSTED');
    if (isRateLimit) {
      return res.status(429).json({
        error: 'rate_limit',
        reply: '⏳ La API de Gemini está temporalmente saturada (demasiadas peticiones por minuto). Por favor espera 1-2 minutos e intenta nuevamente.\n\n*Gemini API is temporarily rate-limited. Please wait 1-2 minutes and try again.*',
        sessionId: sid
      });
    }
    res.status(500).json({ error: 'AI agent error', details: err.message });
  }
});

app.post('/api/chat/stream', authenticate, async (req, res) => {
  const { message, sessionId, lang, audioBase64, mimeType, clubContext, clubRoster } = req.body;
  const sid = sessionId || uuidv4();

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    agent.chatStream(sid, message, lang, audioBase64, mimeType, clubContext, clubRoster,
      (chunk) => {
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      },
      (full) => {
        res.write(`data: ${JSON.stringify({ done: true, sessionId: sid })}\n\n`);
        res.end();
      },
      (err) => {
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
        res.end();
      }
    );
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

app.delete('/api/chat/:sessionId', authenticate, (req, res) => {
  agent.clearSession(req.params.sessionId);
  res.json({ success: true });
});

// ─── AI Alert Expansion ───────────────────────────────────────────
app.post('/api/alert/expand', authenticate, async (req, res) => {
  const { alertType, contextData, lang } = req.body;
  if (!alertType || !contextData) {
    return res.status(400).json({ error: 'Missing alertType or contextData' });
  }

  try {
    const report = await agent.expandAlert(alertType, contextData, lang || 'es');
    res.json({ report });
  } catch (err) {
    console.error('Alert expand error:', err.message);
    res.status(500).json({ error: 'AI agent error', details: err.message });
  }
});

// ─── Compare ──────────────────────────────────────────────────────
app.post('/api/compare', authenticate, async (req, res) => {
  const { player1Id, player2Id, lang } = req.body;
  if (!player1Id || !player2Id) {
    return res.status(400).json({ error: 'Two player IDs required' });
  }

  try {
    const analysis = await agent.comparePlayers(player1Id, player2Id, lang || 'es');
    const p1 = await Player.findByPk(player1Id);
    const p2 = await Player.findByPk(player2Id);
    res.json({ analysis, player1: p1, player2: p2 });
  } catch (err) {
    console.error('Compare error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Predictions ──────────────────────────────────────────────────
app.get('/api/predictions', authenticate, async (req, res) => {
  const lang = req.query.lang || 'es';
  try {
    const predictions = await agent.getPredictions(lang);
    res.json({ predictions });
  } catch (err) {
    console.error('Predictions error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── ADMIN DB CONSOLE ENDPOINT ─────────────────────────────────────
app.post('/api/admin/db-query', async (req, res) => {
  const { sql, secret } = req.body;
  
  if (!secret || secret.trim() !== JWT_SECRET.trim()) {
    console.warn(`🔒 Access Denied: DB Query secret mismatch. Expected length: ${JWT_SECRET.trim().length}, Received length: ${secret ? secret.trim().length : 0}`);
    return res.status(401).json({ error: 'No autorizado. El Token Secreto (JWT_SECRET) es incorrecto.' });
  }
  
  if (!sql || sql.trim() === '') {
    return res.status(400).json({ error: 'La consulta SQL está vacía.' });
  }

  try {
    const [results, metadata] = await sequelize.query(sql);
    res.json({ success: true, results, metadata });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Leagues & Positions ──────────────────────────────────────────
app.get('/api/leagues', authenticate, async (req, res) => {
  try {
    const flags = {
      'Premier League': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'La Liga': '🇪🇸',
      'Bundesliga': '🇩🇪',
      'Serie A': '🇮🇹',
      'Ligue 1': '🇫🇷',
      'MLS': '🇺🇸',
      'Saudi Pro League': '🇸🇦'
    };
    
    const uniqueLeagues = await Player.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('league')), 'league']],
      where: { league: { [require('sequelize').Op.ne]: null } }
    });

    const leagues = uniqueLeagues.map(l => ({
      id: l.league,
      name: l.league,
      flag: flags[l.league] || '⚽'
    }));
    
    res.json({ leagues });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/positions', async (req, res) => {
  try {
    const uniquePositions = await Player.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('position')), 'position']],
      where: { position: { [require('sequelize').Op.ne]: null } }
    });
    const positions = uniquePositions.map(p => p.position);
    res.json({ positions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/onboarding/leagues', authenticate, async (req, res) => {
  try {
    const leagues = await League.findAll({ order: [['country', 'ASC']] });
    res.json({ leagues });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/onboarding/teams', authenticate, async (req, res) => {
  try {
    const { country, league } = req.query;
    let where = {};
    if (country) {
      where.country = country;
    }
    if (league) {
      where.leagueName = league;
    }
    const teams = await Team.findAll({
      where,
      order: [['name', 'ASC']]
    });
    res.json({ teams });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── TEAM LOGOS DYNAMIC RESOLVER ─────────────────────────────────
const resolvedLogosCache = new Map();

async function getWikiRestLogo(teamName) {
  const https = require('https');
  const langs = ['es', 'en'];
  
  const cleanName = teamName.trim();
  const lower = cleanName.toLowerCase();
  
  // Construct targeted search variations to force football/fútbol club resolution first
  const variations = [];
  if (lower.includes('f.c.') || lower.includes('fc') || lower.includes('c.f.') || lower.includes('cf') || 
      lower.includes('club') || lower.includes('clube') || lower.includes('united') || lower.includes('city') || 
      lower.includes('real') || lower.includes('atlético') || lower.includes('atletico') || lower.includes('deportivo') ||
      lower.includes('athletic') || lower.includes('sociedad') || lower.includes('betis') || lower.includes('celta') || 
      lower.includes('girona')) {
    variations.push(cleanName);
  } else {
    // Append soccer-specific qualifiers first, then fallback to original name
    variations.push(`${cleanName} F.C.`);
    variations.push(`${cleanName} C.F.`);
    variations.push(`${cleanName} club de fútbol`);
    variations.push(`${cleanName} football club`);
    variations.push(cleanName);
  }

  for (const query of variations) {
    for (const lang of langs) {
      const q = encodeURIComponent(query);
      const opensearchUrl = `https://${lang}.wikipedia.org/w/api.php?action=opensearch&search=${q}&limit=1&namespace=0&format=json&origin=*`;
      
      try {
        const pageTitle = await new Promise((resolve) => {
          https.get(opensearchUrl, { headers: { 'User-Agent': 'FutbolAIScoutingPlatform/1.0 (contact@futbolai.com)' } }, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
              try {
                const json = JSON.parse(data);
                if (json && json[1] && json[1].length > 0) {
                  resolve(json[1][0]);
                } else {
                  resolve(null);
                }
              } catch (e) {
                resolve(null);
              }
            });
          }).on('error', () => resolve(null));
        });
        
        if (!pageTitle) continue;
        
        const formattedTitle = pageTitle.replace(/\s+/g, '_');
        const restUrl = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(formattedTitle)}`;
        
        const result = await new Promise((resolve) => {
          https.get(restUrl, { headers: { 'User-Agent': 'FutbolAIScoutingPlatform/1.0 (contact@futbolai.com)' } }, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
              try {
                const json = JSON.parse(data);
                resolve(json);
              } catch (e) {
                resolve(null);
              }
            });
          }).on('error', () => resolve(null));
        });
        
        if (result && result.thumbnail && result.thumbnail.source) {
          const logoUrl = result.thumbnail.source;
          const urlLower = logoUrl.toLowerCase();
          
          // Exclude generic maps, flags, stadium views, or player/location photos
          if (urlLower.includes('flag') || urlLower.includes('map_') || urlLower.includes('stadium') || 
              urlLower.includes('location') || urlLower.includes('escudo_de_la_provincia') || urlLower.includes('coat_of_arms')) {
            continue;
          }
          
          // Verify description or extract contains football/club-related keywords to ensure we didn't resolve a city page
          const desc = (result.description || '').toLowerCase();
          const ext = (result.extract || '').toLowerCase();
          const tLower = pageTitle.toLowerCase();
          
          const isSports = 
            desc.includes('club') || desc.includes('futbol') || desc.includes('fútbol') || desc.includes('football') || 
            desc.includes('soccer') || desc.includes('equipo') || desc.includes('team') || desc.includes('sport') ||
            desc.includes('association') || desc.includes('league') || desc.includes('liga') ||
            ext.includes('club') || ext.includes('futbol') || ext.includes('fútbol') || ext.includes('football') || 
            ext.includes('soccer') || ext.includes('equipo') || ext.includes('team') || ext.includes('sport') ||
            ext.includes('association') || ext.includes('league') || ext.includes('liga') ||
            tLower.includes('f.c.') || tLower.includes('fc') || tLower.includes('cf') || tLower.includes('c.f.') ||
            tLower.includes('club') || tLower.includes('clube');
            
          if (isSports) {
            return logoUrl;
          }
        }
      } catch (err) {
        console.error(`Error in backend REST lookup for "${query}":`, err.message);
      }
    }
  }
  return null;
}

const majorSofifaTeamIds = {
  // Spain
  "Real Madrid": "243",
  "FC Barcelona": "241",
  "Atlético de Madrid": "240",
  "Sevilla FC": "481",
  "Valencia CF": "461",
  "Villarreal CF": "483",
  "Athletic Club": "448",
  "Real Sociedad": "457",
  "Real Betis": "449",
  "Celta Vigo": "450",
  "Rayo Vallecano": "480",
  "Girona FC": "110549",
  "UD Las Palmas": "472",
  "RCD Mallorca": "453",
  "Getafe CF": "1860",
  "CD Leganés": "100888",
  "RCD Espanyol": "452",
  "Deportivo Alavés": "463",
  "Real Valladolid": "462",
  "Osasuna": "455",

  // United Kingdom
  "Manchester City": "10",
  "Arsenal": "1",
  "Liverpool": "9",
  "Chelsea": "5",
  "Manchester United": "11",
  "Tottenham Hotspur": "18",
  "Newcastle United": "13",
  "West Ham United": "19",
  "Aston Villa": "2",
  "Brighton & Hove Albion": "1808",
  "Brentford": "1898",
  "Crystal Palace": "1799",
  "Everton": "7",
  "Wolverhampton Wanderers": "110",
  "Fulham": "144",
  "AFC Bournemouth": "1943",
  "Nottingham Forest": "14",
  "Leicester City": "95",
  "Ipswich Town": "94",
  "Southampton": "17",

  // Germany
  "Bayern München": "21",
  "Bayer 04 Leverkusen": "32",
  "Borussia Dortmund": "22",
  "RB Leipzig": "112172",
  "Eintracht Frankfurt": "1824",
  "VfB Stuttgart": "36",
  "1. FC Union Berlin": "1831",
  "Werder Bremen": "38",
  "SC Freiburg": "25",
  "VfL Wolfsburg": "175",
  "TSG Hoffenheim": "10029",
  "1. FSV Mainz 05": "169",
  "FC Augsburg": "10040",
  "Borussia Mönchengladbach": "23",
  "VfL Bochum": "160",
  "1. FC Heidenheim": "111235",
  "FC St. Pauli": "110329",
  "Holstein Kiel": "112411",

  // France
  "Paris Saint-Germain": "73",
  "AS Monaco": "69",
  "Olympique Lyonnais": "66",
  "Olympique de Marseille": "219",
  "LOSC Lille": "65",
  "OGC Nice": "71",
  "Stade Rennais": "74",
  "RC Lens": "224",
  "FC Nantes": "70",
  "RC Strasbourg": "76",
  "Montpellier HSC": "72",
  "Stade de Reims": "379",
  "Toulouse FC": "180",
  "AJ Auxerre": "57",
  "Le Havre AC": "1811",
  "Stade Brestois 29": "378",
  "Angers SCO": "1530",
  "AS Saint-Étienne": "1819",

  // Italy
  "Inter Milan": "44",
  "AC Milan": "47",
  "Juventus": "45",
  "Napoli": "48",
  "Atalanta": "39",
  "AS Roma": "52",
  "SS Lazio": "46",
  "Fiorentina": "110374",
  "Torino": "54",
  "Bologna": "189",
  "Genoa": "110556",
  "Monza": "112117",
  "Lecce": "347",
  "Udinese": "55",
  "Empoli": "1746",
  "Como 1907": "112423",
  "Venezia": "205",
  "Hellas Verona": "206",
  "Cagliari": "376",
  "Parma": "50",

  // Brazil
  "CR Flamengo": "1043",
  "SE Palmeiras": "383",
  "Santos FC": "1053",
  "São Paulo FC": "598",
  "Grêmio": "1044",
  "SC Internacional": "1048",
  "SC Corinthians": "1041",
  "Atlético Mineiro": "1035",
  "Fluminense": "1042",
  "Botafogo": "517",
  "Vasco da Gama": "1058",
  "Cruzeiro": "568",
  "RB Bragantino": "113056",
  "Fortaleza": "112119",
  
  // Argentina
  "Boca Juniors": "1877",
  "River Plate": "1876",
  "San Lorenzo": "1013",
  "Racing Club": "1012",
  "Independiente": "110093",
  
  // USA
  "Inter Miami CF": "112885",
  "LA Galaxy": "697",
  "New York City FC": "112828",
  "Seattle Sounders FC": "111144",
  "Atlanta United": "112885",
  
  // Saudi Arabia
  "Al-Nassr FC": "112139",
  "Al-Hilal SFC": "112140",
  "Al-Ittihad Club": "112099",
  "Al-Ahli SFC": "112140"
};

app.get('/api/team-logo', authenticate, async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) return res.status(400).json({ error: 'Missing name' });
    
    // 1. Check major mapping
    if (majorSofifaTeamIds[name]) {
      const sofifaUrl = `https://cdn.sofifa.net/teams/${majorSofifaTeamIds[name]}/120.png`;
      return res.json({ logoUrl: sofifaUrl });
    }
    
    // 2. Check cache
    if (resolvedLogosCache.has(name)) {
      return res.json({ logoUrl: resolvedLogosCache.get(name) });
    }
    
    // 3. Resolve using REST summary
    const logoUrl = await getWikiRestLogo(name);
    if (logoUrl) {
      resolvedLogosCache.set(name, logoUrl);
      return res.json({ logoUrl });
    }
    
    res.json({ logoUrl: null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/league-logo', authenticate, async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) return res.status(400).json({ error: 'Missing name' });
    
    // Find the league in the database (case-insensitive and substring fallback)
    const nameLower = name.toLowerCase();
    let league = await League.findOne({
      where: sequelize.where(
        sequelize.fn('lower', sequelize.col('name')),
        nameLower
      )
    });

    if (!league) {
      // Substring fallback
      const allLeagues = await League.findAll();
      league = allLeagues.find(l => {
        const lNameLower = l.name.toLowerCase();
        return lNameLower.includes(nameLower) || nameLower.includes(lNameLower);
      });
    }

    if (league) {
      const dbId = league.id;
      const dbToFileMap = {"1":31,"2":55,"3":7,"4":44,"5":67,"6":58,"7":17,"8":6,"9":42,"10":39,"11":36,"12":59,"13":60,"14":47,"15":25,"16":27,"17":66,"18":73,"19":56,"20":19,"21":69,"22":1,"23":5,"24":14,"25":65,"26":70,"27":24,"28":43,"29":35,"30":37,"31":13,"32":12,"33":61,"34":40,"35":2,"36":74,"37":16,"38":71,"39":8,"40":54,"41":38,"42":75,"43":76,"44":23,"45":20,"46":21,"47":15,"48":78,"49":57,"50":63,"51":28,"52":64,"53":80,"54":29,"55":79,"56":34,"57":68,"58":18,"59":11,"60":72,"61":22,"62":46,"63":48,"64":10,"65":62,"66":41,"67":32,"68":45,"69":77,"70":26,"71":33,"72":30,"73":3,"74":51,"75":81,"76":52,"77":4,"78":50,"79":53,"80":9,"81":49};
      const fileId = dbToFileMap[dbId.toString()] || dbId;
      return res.json({ logoUrl: `/assets/leagues/liga_${fileId}.png` });
    }
    
    res.json({ logoUrl: null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── ACTIVITY LOGS ───────────────────────────────────────────

app.post('/api/logs/query', authenticate, async (req, res) => {
  try {
    const log = await QueryLog.create({
      userId: req.user.id,
      message: req.body.message || null
    });
    res.json({ success: true, log });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/logs/comparison', authenticate, async (req, res) => {
  try {
    const log = await ComparisonLog.create({
      userId: req.user.id,
      player1Id: req.body.player1Id,
      player2Id: req.body.player2Id
    });
    res.json({ success: true, log });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/logs/favorite', authenticate, async (req, res) => {
  try {
    const log = await FavoriteLog.create({
      userId: req.user.id,
      playerId: req.body.playerId,
      action: req.body.action
    });
    res.json({ success: true, log });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/profile/stats', authenticate, async (req, res) => {
  try {
    const [queries, compared, favorites] = await Promise.all([
      QueryLog.count({ where: { userId: req.user.id } }),
      ComparisonLog.count({ where: { userId: req.user.id } }),
      FavoriteLog.count({ where: { userId: req.user.id, action: 'add' } })
    ]);
    res.json({ queries, compared, favorites });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fallback for Frontend (SPA logic)
app.get(/^\/landing(\.html)?$/, (req, res) => {
  res.sendFile(path.join(FRONTEND_PATH, 'landing.html'));
});

app.get(/^(?!\/api).+/, (req, res) => {
  res.sendFile(path.join(FRONTEND_PATH, 'index.html'));
});

// ─── Auth Routes ────────────────────────────────────────────────
// Auth routes moved to top


// ─── Start ────────────────────────────────────────────────────────
const { execSync } = require('child_process');

function killPortProcess(port) {
  try {
    // Windows: find PID listening on the port and kill it
    const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
    const lines = output.split('\n').filter(l => l.includes('LISTENING'));
    const pids = [...new Set(lines.map(l => l.trim().split(/\s+/).pop()))].filter(Boolean);
    pids.forEach(pid => {
      try {
        execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
        console.log(`🔫 Killed process PID ${pid} that was blocking port ${port}`);
      } catch (_) { /* already gone */ }
    });
    return pids.length > 0;
  } catch (_) {
    return false;
  }
}

function startServer(retries = 2) {
  const server = app.listen(PORT, async () => {
    console.log(`\n⚽ FutbolAI Backend running on http://localhost:${PORT}`);
    console.log(`📂 Serving frontend from: ${FRONTEND_PATH}`);

    try {
      await sequelize.authenticate();
      
      // Safer synchronization for MSSQL
      // Instead of risky 'alter: true', we manually ensure new columns exist
      const checkColumns = async () => {
        if (sequelize.options.dialect !== 'mssql') {
          return;
        }
        const queryInterface = sequelize.getQueryInterface();
        
        // Safe case-insensitive column checker to prevent duplicate add column errors on different collations/drivers
        const tableInfo = await queryInterface.describeTable('users').catch(() => ({}));
        const hasUserColumn = (col) => Object.keys(tableInfo).some(k => k.toLowerCase() === col.toLowerCase());
        
        // Ensure passwordHash is NVARCHAR(255) to prevent truncated bcrypt hashes in older SQL Server DBs
        await sequelize.query('ALTER TABLE users ALTER COLUMN passwordHash NVARCHAR(255) NOT NULL').catch(() => {});
        
        if (!hasUserColumn('onboardingComplete')) {
          console.log('➕ Adding onboardingComplete column...');
          await sequelize.query('ALTER TABLE users ADD onboardingComplete BIT DEFAULT 0').catch(() => {});
        }
        if (!hasUserColumn('selectedCountry')) {
          console.log('➕ Adding selectedCountry column...');
          await sequelize.query('ALTER TABLE users ADD selectedCountry NVARCHAR(100) NULL').catch(() => {});
        }
        if (!hasUserColumn('selectedClub')) {
          console.log('➕ Adding selectedClub column...');
          await sequelize.query('ALTER TABLE users ADD selectedClub NVARCHAR(100) NULL').catch(() => {});
        }
        if (!hasUserColumn('preferredFormation')) {
          console.log('➕ Adding preferredFormation column...');
          await sequelize.query('ALTER TABLE users ADD preferredFormation NVARCHAR(50) NULL').catch(() => {});
        }
        if (!hasUserColumn('preferredStyle')) {
          console.log('➕ Adding preferredStyle column...');
          await sequelize.query('ALTER TABLE users ADD preferredStyle NVARCHAR(50) NULL').catch(() => {});
        }
        if (!hasUserColumn('selectedTier')) {
          console.log('➕ Adding selectedTier column...');
          await queryInterface.addColumn('users', 'selectedTier', {
            type: require('sequelize').DataTypes.STRING(50),
            defaultValue: 'Gratis',
            allowNull: true
          }).catch(() => {});
        }
        if (!hasUserColumn('nombres')) {
          console.log('➕ Adding nombres column...');
          await queryInterface.addColumn('users', 'nombres', {
            type: require('sequelize').DataTypes.STRING(100),
            allowNull: true
          }).catch(() => {});
        }
        if (!hasUserColumn('apellidos')) {
          console.log('➕ Adding apellidos column...');
          await queryInterface.addColumn('users', 'apellidos', {
            type: require('sequelize').DataTypes.STRING(100),
            allowNull: true
          }).catch(() => {});
        }
        if (!hasUserColumn('telefono')) {
          console.log('➕ Adding telefono column...');
          await queryInterface.addColumn('users', 'telefono', {
            type: require('sequelize').DataTypes.STRING(50),
            allowNull: true
          }).catch(() => {});
        }
        if (!hasUserColumn('email')) {
          console.log('➕ Adding email column...');
          await queryInterface.addColumn('users', 'email', {
            type: require('sequelize').DataTypes.STRING(150),
            allowNull: true
          }).catch(() => {});
        }
        if (!hasUserColumn('avatarUrl')) {
          console.log('➕ Adding avatarUrl column...');
          await sequelize.query('ALTER TABLE users ADD avatarUrl NVARCHAR(500) NULL').catch(() => {});
        }
        if (!hasUserColumn('role')) {
          console.log('➕ Adding role column...');
          await sequelize.query('ALTER TABLE users ADD role NVARCHAR(100) NULL').catch(() => {});
        }

        // Check columns for payments table case-insensitively
        const paymentTableInfo = await queryInterface.describeTable('payments').catch(() => ({}));
        const hasPaymentColumn = (col) => Object.keys(paymentTableInfo).some(k => k.toLowerCase() === col.toLowerCase());
        
        if (!hasPaymentColumn('userAccount')) {
          console.log('➕ Adding userAccount column to payments table...');
          await queryInterface.addColumn('payments', 'userAccount', {
            type: require('sequelize').DataTypes.STRING(100),
            allowNull: true
          }).catch(async () => {
            await sequelize.query('ALTER TABLE payments ADD userAccount NVARCHAR(100) NULL').catch(() => {});
          });
        }
      };

      // Auto-heal the users.role column size limit to prevent truncation errors for longer roles
      try {
        if (sequelize.options.dialect === 'mssql') {
          await sequelize.query('ALTER TABLE users ALTER COLUMN role NVARCHAR(150) NULL').catch(() => {});
        } else if (sequelize.options.dialect === 'postgres') {
          await sequelize.query('ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(150)').catch(() => {});
        } else if (sequelize.options.dialect === 'mysql') {
          await sequelize.query('ALTER TABLE users MODIFY COLUMN role VARCHAR(150)').catch(() => {});
        }
      } catch (err) {
        console.warn('⚠️ Column alteration failed or already applied:', err.message);
      }

      const doAlter = sequelize.options.dialect !== 'mssql';

      await User.sync();
      if (doAlter) await User.sync({ alter: true });

      await checkColumns().catch(err => console.warn('⚠️ Column sync warning (might already exist):', err.message));

      await Player.sync();
      if (doAlter) await Player.sync({ alter: true });

      await Payment.sync();
      if (doAlter) await Payment.sync({ alter: true });

      await QueryLog.sync();
      if (doAlter) await QueryLog.sync({ alter: true });

      await ComparisonLog.sync();
      if (doAlter) await ComparisonLog.sync({ alter: true });

      await FavoriteLog.sync();
      if (doAlter) await FavoriteLog.sync({ alter: true });
      await seedLeaguesAndTeams();

      // Seed players from players.json
      let count = await Player.count();
      try {
        const playersFile = path.join(__dirname, 'knowledge/players.json');
        const fs = require('fs');
        if (fs.existsSync(playersFile)) {
          const fileData = JSON.parse(fs.readFileSync(playersFile, 'utf8'));
          const totalJsonPlayers = fileData.players.length;
          
          // Get all existing player IDs in DB
          const dbPlayers = await Player.findAll({ attributes: ['id'] });
          const dbPlayerIds = new Set(dbPlayers.map(p => p.id));
          
          // Filter out players already in DB
          const missingPlayers = fileData.players.filter(p => !dbPlayerIds.has(p.id));
          
          if (missingPlayers.length > 0) {
            console.log(`🌱 Database Seeding: Syncing ${missingPlayers.length} missing players from players.json...`);
            const playersToInsert = missingPlayers.map(p => {
              return {
                ...p,
                stats: p.stats ? JSON.stringify(p.stats) : null,
                careerTotals: p.careerTotals ? JSON.stringify(p.careerTotals) : null,
                trophies: p.trophies ? JSON.stringify(p.trophies) : null,
                transfers: p.transfers ? JSON.stringify(p.transfers) : null,
                strengths: p.strengths ? JSON.stringify(p.strengths) : null,
                tags: p.tags ? JSON.stringify(p.tags) : null,
                history: p.history ? JSON.stringify(p.history) : null
              };
            });
            await Player.bulkCreate(playersToInsert);
            count = await Player.count();
            console.log(`✅ Seeded ${missingPlayers.length} missing players successfully! Total is now ${count}.`);
          } else {
            console.log(`✅ All ${totalJsonPlayers} players from players.json are already in the database.`);
          }
        } else {
          console.warn('⚠️ Seeding warning: knowledge/players.json not found.');
        }
      } catch (seedErr) {
        console.error('❌ Failed to seed players:', seedErr.message);
      }

      const userCount = await User.count();
      console.log(`📊 Database connected: ${count} players | ${userCount} users`);
    } catch (err) {
      console.error('❌ Database connection failed:', err.message);
    }

    console.log(`🤖 Mode: ${agent.demoMode ? 'DEMO (no API key)' : 'GEMINI AI'}\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️  Port ${PORT} is in use. Attempting to free it...`);
      server.close();
      const killed = killPortProcess(PORT);
      if (killed && retries > 0) {
        console.log(`🔄 Retrying in 1 second... (${retries} attempts left)`);
        setTimeout(() => startServer(retries - 1), 1000);
      } else {
        console.error(`❌ Could not free port ${PORT}. Please close the process manually and restart.`);
        process.exit(1);
      }
    } else {
      console.error('❌ Server error:', err);
      process.exit(1);
    }
  });
}

startServer();

