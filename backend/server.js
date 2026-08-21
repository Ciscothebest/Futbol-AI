const path = require('path');
const dns = require('dns');
// Forzar a Node.js a preferir IPv4 sobre IPv6 en todas las resoluciones de red (evita fallos ENETUNREACH en Render)
dns.setDefaultResultOrder('ipv4first');

require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const FootballAgent = require('./agent');
const { Player, Prospect, User, League, Team, sequelize, QueryLog, ComparisonLog, FavoriteLog, Payment, PaymentMethod, DirectMessage, UserContact, enableRLSIfPostgres } = require('./database');

const seedLeaguesAndTeams = require('./seed-db-onboarding');
const seedDemoUsers = require('./seed-demo-users');

const app = express();
const agent = new FootballAgent();
const PORT = process.env.PORT || 3001;
const FRONTEND_PATH = path.join(__dirname, '../frontend');
const JWT_SECRET = process.env.JWT_SECRET || 'scoutai-super-secret-key-2025';

// ─── Middleware ───────────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

app.use(express.static(FRONTEND_PATH));

// ─── Auth Routes (Prioritized) ──────────────────────────────────
const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter({ User, JWT_SECRET }));

// ─── WebAuthn Well-Known Endpoint (required by Chrome 128+) ──────
// Must be at /.well-known/webauthn, return application/json,
// and list all valid origins that can use this RP ID.
app.get('/.well-known/webauthn', (req, res) => {
  const isLocal = req.hostname === 'localhost' || req.hostname === '127.0.0.1';
  const origins = isLocal
    ? ['http://localhost:3001', 'http://127.0.0.1:3001', 'http://localhost:5500']
    : [
        process.env.WEBAUTHN_ORIGIN || `https://${process.env.WEBAUTHN_RP_ID}`,
        `https://futbolai.netlify.app`
      ].filter(Boolean);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({ origins });
});

// ─── Auth Middleware ──────────────────────────────────────────────
const authenticate = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    console.warn(`🔒 Auth failed: No header or wrong format for ${req.path}`);
    return res.status(401).json({ error: 'Sesión no válida' });
  }
  try {
    const token = header.split(' ')[1];
    req.user = jwt.verify(token, JWT_SECRET);

    if (req.user && (req.user.id || req.user.username)) {
      let dbUser = req.user.id ? await User.findByPk(req.user.id) : null;
      if (!dbUser && req.user.username) {
        dbUser = await User.findOne({ where: { username: req.user.username } });
      }
      if (dbUser) {
        const userData = dbUser.toJSON ? dbUser.toJSON() : dbUser;
        req.user = { ...req.user, ...userData };
      }
    }
    next();
  } catch (err) {
    console.warn(`🔒 Auth failed: Invalid token for ${req.path} - ${err.message}`);
    return res.status(401).json({ error: 'Sesión expirada' });
  }
};

// ─── Payments Routes ─────────────────────────────────────────────
const paymentsRouter = require('./routes/payments');
app.use('/api/payments', authenticate, paymentsRouter({ Payment, User }));

const paymentMethodsRouter = require('./routes/paymentMethods');
app.use('/api/payment-methods', authenticate, paymentMethodsRouter({ PaymentMethod, User }));

// ─── Chats Routes ────────────────────────────────────────────────
const chatsRouter = require('./routes/chats');
app.use('/api/chats', authenticate, chatsRouter({ User, DirectMessage, UserContact }));


// ─── Health ───────────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  try {
    const playerCount = await Player.count();
    res.json({
      status: 'ok',
      demoMode: agent.demoMode,
      model: process.env.GEMINI_MODEL || 'deepseek-chat',
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
      const posUpper = position.toUpperCase().trim();
      const posMap = {
        'GK': ['GK', 'PO', 'POR', 'PORTERO'],
        'POR': ['GK', 'PO', 'POR', 'PORTERO'],
        'DEF': ['DEF', 'CB', 'DFC', 'LB', 'LI', 'RB', 'LD', 'LWB', 'RWB', 'DEFENSOR', 'DEFENSA'],
        'CB': ['CB', 'DFC', 'DEF'],
        'LB': ['LB', 'LI', 'DEF'],
        'RB': ['RB', 'LD', 'DEF'],
        'MED': ['MED', 'CM', 'MC', 'DM', 'MCD', 'AM', 'MCO', 'LM', 'MI', 'RM', 'MD', 'MEDIOCAMPISTA', 'MEDIOCENTRO'],
        'CM': ['CM', 'MC', 'MED'],
        'DM': ['DM', 'MCD', 'MED'],
        'AM': ['AM', 'MCO', 'MED'],
        'DEL': ['DEL', 'ST', 'DC', 'CF', 'SD', 'LW', 'EI', 'RW', 'ED', 'DELANTERO'],
        'ST': ['ST', 'DC', 'DEL'],
        'LW': ['LW', 'EI', 'DEL'],
        'RW': ['RW', 'ED', 'DEL']
      };

      const matchValues = posMap[posUpper] || [posUpper];
      where[Op.or] = [
        { position: { [Op.in]: matchValues } },
        { positionEs: { [Op.in]: matchValues } }
      ];
    }

    if (team) {
      where.currentTeam = team;
    }

    // Excluir jugadores locales (creados por usuarios en "Mis Jugadores") del módulo Jugadores.
    // Los jugadores locales tienen userId asignado; los profesionales globales tienen userId = null.
    where.userId = null;
    
    let results = await Player.findAll({
      where,
      limit: limit ? parseInt(limit) : undefined,
      order: [['marketValue', 'DESC']]
    });

    const posEsMap = {
      'GK': 'Portero (PO)', 'PO': 'Portero (PO)', 'POR': 'Portero (PO)',
      'CB': 'Defensa Central (DFC)', 'DFC': 'Defensa Central (DFC)',
      'LB': 'Lateral Izquierdo (LI)', 'LI': 'Lateral Izquierdo (LI)',
      'RB': 'Lateral Derecho (LD)', 'LD': 'Lateral Derecho (LD)',
      'LWB': 'Carrilero Izquierdo (CAD)', 'RWB': 'Carrilero Derecho (CAR)',
      'DM': 'Pivote Defensivo (MCD)', 'MCD': 'Pivote Defensivo (MCD)',
      'CM': 'Mediocentro (MC)', 'MC': 'Mediocentro (MC)',
      'AM': 'Mediapunta (MCO)', 'MCO': 'Mediapunta (MCO)',
      'LM': 'Interior Izquierdo (MI)', 'MI': 'Interior Izquierdo (MI)',
      'RM': 'Interior Derecho (MD)', 'MD': 'Interior Derecho (MD)',
      'LW': 'Extremo Izquierdo (EI)', 'EI': 'Extremo Izquierdo (EI)',
      'RW': 'Extremo Derecho (ED)', 'ED': 'Extremo Derecho (ED)',
      'CF': 'Segundo Delantero (SD)', 'SD': 'Segundo Delantero (SD)',
      'ST': 'Delantero Centro (DC)', 'DC': 'Delantero Centro (DC)',
      'DEF': 'Defensor (DEF)', 'MED': 'Mediocampista (MED)', 'DEL': 'Delantero (DEL)'
    };
    
    // Inject avatar data & guarantee non-null position fields
    const fs = require('fs');
    const apiHost = req.protocol + '://' + req.get('host');
    results = results.map(p => {
      const data = p.toJSON();
      const photoId = data.photoId || playerFaces[data.id];
      const localImgPath = path.join(FRONTEND_PATH, 'assets', 'players', `${data.id}.png`);
      const fallbackUrl = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(data.name)}&backgroundColor=0d1117&textColor=ffffff&radius=50`;
      let avatarUrl = '';
      
      if (photoId) {
        avatarUrl = `${apiHost}/api/player-photo/${encodeURIComponent(photoId)}?v=2`;
      } else if (fs.existsSync(localImgPath)) {
        avatarUrl = `/assets/players/${data.id}.png`;
      } else {
        avatarUrl = fallbackUrl;
      }

      const finalPos = data.position || data.positionEs || 'MED';
      const finalPosEs = data.positionEs || posEsMap[String(finalPos).toUpperCase()] || finalPos;
      
      return {
        ...data,
        position: finalPos,
        positionEs: finalPosEs,
        avatarUrl
      };
    });
    
    res.json({ players: results, total: results.length });
  } catch (err) {
    console.error('API players error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Mis Jugadores (CRUD Prospectos Locales) ──────────────────────
app.get('/api/my-players', authenticate, async (req, res) => {
  try {
    const players = await Prospect.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, players });
  } catch (err) {
    console.error('Error in GET /api/my-players:', err);
    res.status(500).json({ error: 'Error al obtener tus jugadores locales', details: err.message });
  }
});

app.post('/api/my-players', authenticate, async (req, res) => {
  try {
    const data = req.body;
    const newId = `loc-player-${uuidv4()}`;
    const newPlayer = await Prospect.create({
      ...data,
      id: newId,
      userId: req.user.id
    });
    res.json({ success: true, player: newPlayer });
  } catch (err) {
    console.error('Error in POST /api/my-players:', err);
    res.status(500).json({ error: 'Error al registrar jugador prospecto', details: err.message });
  }
});

app.put('/api/my-players/:id', authenticate, async (req, res) => {
  try {
    const player = await Prospect.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!player) {
      return res.status(404).json({ error: 'Jugador prospecto no encontrado o no autorizado' });
    }
    await player.update(req.body);
    res.json({ success: true, player });
  } catch (err) {
    console.error('Error in PUT /api/my-players:', err);
    res.status(500).json({ error: 'Error al actualizar jugador prospecto', details: err.message });
  }
});

app.delete('/api/my-players/:id', authenticate, async (req, res) => {
  try {
    const player = await Prospect.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!player) {
      return res.status(404).json({ error: 'Jugador prospecto no encontrado o no autorizado' });
    }
    await player.destroy();
    res.json({ success: true, message: 'Jugador prospecto eliminado con éxito' });
  } catch (err) {
    console.error('Error in DELETE /api/my-players:', err);
    res.status(500).json({ error: 'Error al eliminar jugador prospecto', details: err.message });
  }
});


// ─── All Prospects (Enterprise: ver TODOS los prospectos locales) ──────────────────────
app.get('/api/all-prospects', authenticate, async (req, res) => {
  try {
    const userTier = (req.user.selectedTier || req.user.tier || req.user.maxPaidTierInCycle || '').toLowerCase();
    const userRole = (req.user.role || '').toLowerCase();
    const isEnterprise = userTier === 'enterprise' || userRole.includes('enterprise') || userRole.includes('gerente') || userRole.includes('director') || userRole.includes('scout');

    if (!isEnterprise) {
      return res.status(403).json({ error: 'Solo los usuarios del plan Enterprise pueden ver todos los prospectos.' });
    }
    const players = await Prospect.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, players });
  } catch (err) {
    console.error('Error in GET /api/all-prospects:', err);
    res.status(500).json({ error: 'Error al obtener prospectos', details: err.message });
  }
});

app.get('/api/players/:id', async (req, res) => {

  try {
    let player = await Player.findByPk(req.params.id);
    if (!player && req.params.id && req.params.id.startsWith('loc-player-')) {
      player = await Prospect.findByPk(req.params.id);
    }
    if (!player) return res.status(404).json({ error: 'Player not found' });
    
    const data = player.toJSON();
    const posEsMap = {
      'GK': 'Portero (PO)', 'PO': 'Portero (PO)', 'POR': 'Portero (PO)',
      'CB': 'Defensa Central (DFC)', 'DFC': 'Defensa Central (DFC)',
      'LB': 'Lateral Izquierdo (LI)', 'LI': 'Lateral Izquierdo (LI)',
      'RB': 'Lateral Derecho (LD)', 'LD': 'Lateral Derecho (LD)',
      'LWB': 'Carrilero Izquierdo (CAD)', 'RWB': 'Carrilero Derecho (CAR)',
      'DM': 'Pivote Defensivo (MCD)', 'MCD': 'Pivote Defensivo (MCD)',
      'CM': 'Mediocentro (MC)', 'MC': 'Mediocentro (MC)',
      'AM': 'Mediapunta (MCO)', 'MCO': 'Mediapunta (MCO)',
      'LM': 'Interior Izquierdo (MI)', 'MI': 'Interior Izquierdo (MI)',
      'RM': 'Interior Derecho (MD)', 'MD': 'Interior Derecho (MD)',
      'LW': 'Extremo Izquierdo (EI)', 'EI': 'Extremo Izquierdo (EI)',
      'RW': 'Extremo Derecho (ED)', 'ED': 'Extremo Derecho (ED)',
      'CF': 'Segundo Delantero (SD)', 'SD': 'Segundo Delantero (SD)',
      'ST': 'Delantero Centro (DC)', 'DC': 'Delantero Centro (DC)',
      'DEF': 'Defensor (DEF)', 'MED': 'Mediocampista (MED)', 'DEL': 'Delantero (DEL)'
    };
    data.position = data.position || data.positionEs || 'MED';
    data.positionEs = data.positionEs || posEsMap[String(data.position).toUpperCase()] || data.position;

    const fs = require('fs');
    const localImgPath = path.join(FRONTEND_PATH, 'assets', 'players', `${data.id}.png`);
    const apiHost = req.protocol + '://' + req.get('host');
    const photoId = data.photoId || playerFaces[data.id];
    const fallbackUrl = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(data.name)}&backgroundColor=0d1117&textColor=ffffff&radius=50`;
    
    data.photoId = photoId || null;
    if (photoId) {
      data.avatarUrl = `${apiHost}/api/player-photo/${encodeURIComponent(photoId)}?v=2`;
    } else if (fs.existsSync(localImgPath)) {
      data.avatarUrl = `/assets/players/${data.id}.png`;
    } else {
      data.avatarUrl = fallbackUrl;
    }
    
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Image Proxy ──────────────────────────────────────────────────
app.get(['/api/player-photo/:id', '/api/player-photo/*'], (req, res) => {
  const https = require('https');
  const http = require('http');
  const rawId = req.params.id || req.params[0] || '';
  const decodedId = decodeURIComponent(rawId);

  if (decodedId.startsWith('http://') || decodedId.startsWith('https://')) {
    const targetUrl = decodedId;
    const client = targetUrl.startsWith('https://') ? https : http;
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.transfermarkt.com/',
        'Accept': 'image/png,image/webp,image/jpeg,*/*;q=0.8'
      }
    };
    return client.get(targetUrl, options, (proxyRes) => {
      if (proxyRes.statusCode !== 200) {
        proxyRes.resume();
        return res.redirect(`https://api.dicebear.com/9.x/initials/svg?seed=Player&backgroundColor=0d1117&textColor=ffffff&radius=50`);
      }
      res.setHeader('Content-Type', proxyRes.headers['content-type'] || 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      proxyRes.pipe(res);
    }).on('error', () => {
      res.redirect(`https://api.dicebear.com/9.x/initials/svg?seed=Player&backgroundColor=0d1117&textColor=ffffff&radius=50`);
    });
  }

  const cleanNumericId = decodedId.replace(/[^0-9]/g, '');
  if (!cleanNumericId) {
    return res.status(404).send('Invalid photo ID');
  }

  const idStr = String(cleanNumericId).padStart(6, '0');
  const p1 = idStr.substring(0, 3);
  const p2 = idStr.substring(3, 6);
  
  const options = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://sofifa.com/',
      'Accept': 'image/png,image/webp,image/jpeg,*/*;q=0.8'
    }
  };

  const years = ['25', '24', '23', '22', '21'];
  let currentYearIdx = 0;

  function fetchImage() {
    if (currentYearIdx >= years.length) {
      // Fallback redirect to Dicebear initials if SoFIFA image not found
      return res.redirect(`https://api.dicebear.com/9.x/initials/svg?seed=Player&backgroundColor=0d1117&textColor=ffffff&radius=50`);
    }
    const year = years[currentYearIdx];
    const url = `https://cdn.sofifa.net/players/${p1}/${p2}/${year}_120.png`;
    
    https.get(url, options, (proxyRes) => {
      if (proxyRes.statusCode !== 200) {
        proxyRes.resume();
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

// ─── Team Logo Image Proxy ────────────────────────────────────────
app.get('/api/team-logo-image/:id', (req, res) => {
  const https = require('https');
  const options = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': 'https://sofifa.com/',
      'Accept': 'image/png,image/webp,*/*;q=0.8'
    }
  };
  const url = `https://cdn.sofifa.net/teams/${req.params.id}/120.png`;
  https.get(url, options, (proxyRes) => {
    if (proxyRes.statusCode !== 200) {
      proxyRes.resume();
      return res.status(404).send('Logo not found');
    }
    res.setHeader('Content-Type', proxyRes.headers['content-type'] || 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    proxyRes.pipe(res);
  }).on('error', (err) => {
    console.error('Team logo proxy error:', err);
    res.status(500).send('Error proxying team logo');
  });
});

// ─── Chat ─────────────────────────────────────────────────────────
app.post('/api/chat', authenticate, async (req, res) => {
  const { message, audioBase64, mimeType, sessionId, lang } = req.body;
  if (!message && !audioBase64) return res.status(400).json({ error: 'Message or audio is required' });

  const sid = sessionId || uuidv4();

  try {
    let dbUser = await User.findByPk(req.user.id);
    if (dbUser) {
      if (dbUser.checkAndResetDailyLimits) await dbUser.checkAndResetDailyLimits();
      const tier = (dbUser.selectedTier || 'Gratis').toLowerCase();
      
      let limitReached = false;
      let limitMsg = '';

      if (tier === 'gratis' && (dbUser.dailyAiMessagesCount || 0) >= 5) {
        limitReached = true;
        limitMsg = 'Has alcanzado el límite diario de 5 mensajes en el Chat IA para el plan Gratis. Se restablecerá transcurridas 24 horas desde tu primer uso (límite diario no acumulativo).';
      } else if (tier === 'pro' && (dbUser.dailyAiMessagesCount || 0) >= 10) {
        limitReached = true;
        limitMsg = 'Has alcanzado el límite diario de 10 mensajes en el Chat IA para el plan Pro. Se restablecerá transcurridas 24 horas desde tu primer uso (límite diario no acumulativo).';
      } else if (tier === 'plus' && (dbUser.weeklyAiMessagesCount || 0) >= 30) {
        limitReached = true;
        limitMsg = 'Has alcanzado el límite semanal de 30 mensajes en el Chat IA para el plan Plus. Se restablecerá transcurridos 7 días desde tu primer uso (límite semanal no acumulativo).';
      } else if (tier === 'enterprise' && (dbUser.weeklyAiMessagesCount || 0) >= 50) {
        limitReached = true;
        limitMsg = 'Has alcanzado el límite semanal de 50 mensajes en el Chat IA para el plan Enterprise. Se restablecerá transcurridos 7 días desde tu primer uso (límite semanal no acumulativo).';
      }

      if (limitReached) {
        return res.status(429).json({
          error: 'limit_reached',
          reply: limitMsg,
          sessionId: sid
        });
      }

      if (tier === 'gratis' || tier === 'pro') {
        if (!dbUser.dailyAiMessagesCount || !dbUser.firstDailyAiMessageAt) {
          dbUser.firstDailyAiMessageAt = new Date();
        }
        dbUser.dailyAiMessagesCount = (dbUser.dailyAiMessagesCount || 0) + 1;
        await dbUser.save();
      } else if (tier === 'plus' || tier === 'enterprise') {
        if (!dbUser.weeklyAiMessagesCount || !dbUser.firstWeeklyAiMessageAt) {
          dbUser.firstWeeklyAiMessageAt = new Date();
        }
        dbUser.weeklyAiMessagesCount = (dbUser.weeklyAiMessagesCount || 0) + 1;
        await dbUser.save();
      }
    }

    const reply = await agent.chat(sid, message || '', lang || 'es', audioBase64, mimeType);
    res.json({ reply, sessionId: sid, user: dbUser ? dbUser.toPublicJSON() : null });
  } catch (err) {
    console.error('Chat error:', err.message);
    const isRateLimit = err.message?.includes('429') || err.message?.includes('quota') || err.message?.includes('RESOURCE_EXHAUSTED');
    if (isRateLimit) {
      return res.status(429).json({
        error: 'rate_limit',
        reply: 'La API de Gemini está temporalmente saturada (demasiadas peticiones por minuto). Por favor espera 1-2 minutos e intenta nuevamente.\n\n*Gemini API is temporarily rate-limited. Please wait 1-2 minutes and try again.*',
        sessionId: sid
      });
    }
    res.status(500).json({ error: 'AI agent error', details: err.message });
  }
});

app.post('/api/chat/stream', authenticate, async (req, res) => {
  const { message, sessionId, lang, audioBase64, mimeType, clubContext, clubRoster } = req.body;
  const sid = sessionId || uuidv4();

  let dbUser = null;
  if (req.user && req.user.id) {
    try {
      dbUser = await User.findByPk(req.user.id);
      if (dbUser) {
        if (dbUser.checkAndResetDailyLimits) await dbUser.checkAndResetDailyLimits();
        const tier = (dbUser.selectedTier || 'Gratis').toLowerCase();
        
        let limitReached = false;
        let limitMsg = '';

        if (tier === 'gratis' && (dbUser.dailyAiMessagesCount || 0) >= 5) {
          limitReached = true;
          limitMsg = 'Has alcanzado el límite diario de 5 mensajes en el Chat IA para el plan Gratis. Se restablecerá transcurridas 24 horas desde tu primer uso (límite diario no acumulativo).';
        } else if (tier === 'pro' && (dbUser.dailyAiMessagesCount || 0) >= 10) {
          limitReached = true;
          limitMsg = 'Has alcanzado el límite diario de 10 mensajes en el Chat IA para el plan Pro. Se restablecerá transcurridas 24 horas desde tu primer uso (límite diario no acumulativo).';
        } else if (tier === 'plus' && (dbUser.weeklyAiMessagesCount || 0) >= 30) {
          limitReached = true;
          limitMsg = 'Has alcanzado el límite semanal de 30 mensajes en el Chat IA para el plan Plus. Se restablecerá transcurridos 7 días desde tu primer uso (límite semanal no acumulativo).';
        } else if (tier === 'enterprise' && (dbUser.weeklyAiMessagesCount || 0) >= 50) {
          limitReached = true;
          limitMsg = 'Has alcanzado el límite semanal de 50 mensajes en el Chat IA para el plan Enterprise. Se restablecerá transcurridos 7 días desde tu primer uso (límite semanal no acumulativo).';
        }

        if (limitReached) {
          res.setHeader('Content-Type', 'text/event-stream');
          res.setHeader('Cache-Control', 'no-cache');
          res.setHeader('Connection', 'keep-alive');
          res.write(`data: ${JSON.stringify({ error: limitMsg })}\n\n`);
          res.end();
          return;
        }

        if (tier === 'gratis' || tier === 'pro') {
          if (!dbUser.dailyAiMessagesCount || !dbUser.firstDailyAiMessageAt) {
            dbUser.firstDailyAiMessageAt = new Date();
          }
          dbUser.dailyAiMessagesCount = (dbUser.dailyAiMessagesCount || 0) + 1;
          await dbUser.save();
        } else if (tier === 'plus' || tier === 'enterprise') {
          if (!dbUser.weeklyAiMessagesCount || !dbUser.firstWeeklyAiMessageAt) {
            dbUser.firstWeeklyAiMessageAt = new Date();
          }
          dbUser.weeklyAiMessagesCount = (dbUser.weeklyAiMessagesCount || 0) + 1;
          await dbUser.save();
        }
      }
    } catch (e) {
      console.warn('Error checking AI messages limit:', e.message);
    }
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  let userContext = null;
  if (req.user) {
    const u = req.user.toJSON ? req.user.toJSON() : req.user;
    const hasLocalData = Boolean(u.localCoachData);
    let localClub = null;
    if (u.localCoachData) {
      try {
        const parsed = typeof u.localCoachData === 'string' ? JSON.parse(u.localCoachData) : u.localCoachData;
        localClub = parsed.club || parsed.clubName || null;
      } catch (e) {}
    }
    const isCoach = hasLocalData || (u.role || '').toLowerCase().includes('entrenador') || (u.selectedTier || '').toLowerCase() === 'local';
    const effectiveRole = isCoach ? 'Entrenador' : (u.role || 'Usuario');
    userContext = {
      name: (u.nombres || u.apellidos) ? `${u.nombres || ''} ${u.apellidos || ''}`.trim() : (u.username || 'Usuario'),
      role: effectiveRole,
      hasBothOnboardings: hasLocalData && Boolean(u.selectedClub || u.selectedCountry || u.onboardingComplete),
      activeTier: u.selectedTier || 'Local',
      localClub: localClub,
      selectedClub: u.selectedClub
    };
  }

  try {
    agent.chatStream(sid, message, lang, audioBase64, mimeType, clubContext, clubRoster, userContext,
      (chunk) => {
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      },
      (full) => {
        res.write(`data: ${JSON.stringify({ done: true, sessionId: sid, user: dbUser ? dbUser.toPublicJSON() : null })}\n\n`);
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
    let dbUser = await User.findByPk(req.user.id);
    if (dbUser) {
      if (dbUser.checkAndResetDailyLimits) await dbUser.checkAndResetDailyLimits();
      const tier = (dbUser.selectedTier || 'Gratis').toLowerCase();

      let limitReached = false;
      let limitMsg = '';

      if (tier === 'gratis' && (dbUser.dailyComparisonsCount || 0) >= 2) {
        limitReached = true;
        limitMsg = 'Has alcanzado el límite diario de 2 comparaciones en el plan Gratis. Se restablecerá transcurridas 24 horas desde tu primer uso (límite diario no acumulativo).';
      } else if (tier === 'pro' && (dbUser.dailyComparisonsCount || 0) >= 5) {
        limitReached = true;
        limitMsg = 'Has alcanzado el límite diario de 5 comparaciones en el plan Pro. Se restablecerá transcurridas 24 horas desde tu primer uso (límite diario no acumulativo).';
      } else if (tier === 'plus' && (dbUser.weeklyComparisonsCount || 0) >= 15) {
        limitReached = true;
        limitMsg = 'Has alcanzado el límite semanal de 15 comparaciones en el plan Plus. Se restablecerá transcurridos 7 días desde tu primer uso (límite semanal no acumulativo).';
      } else if (tier === 'enterprise' && (dbUser.monthlyComparisonsCount || 0) >= 50) {
        limitReached = true;
        limitMsg = 'Has alcanzado el límite mensual de 50 comparaciones en el plan Enterprise. Se restablecerá transcurridos 30 días desde tu primer uso (límite mensual no acumulativo).';
      }

      if (limitReached) {
        return res.status(429).json({
          error: 'limit_reached',
          message: limitMsg
        });
      }

      if (tier === 'gratis' || tier === 'pro') {
        if (!dbUser.dailyComparisonsCount || !dbUser.firstDailyComparisonAt) {
          dbUser.firstDailyComparisonAt = new Date();
        }
        dbUser.dailyComparisonsCount = (dbUser.dailyComparisonsCount || 0) + 1;
        await dbUser.save();
      } else if (tier === 'plus') {
        if (!dbUser.weeklyComparisonsCount || !dbUser.firstWeeklyComparisonAt) {
          dbUser.firstWeeklyComparisonAt = new Date();
        }
        dbUser.weeklyComparisonsCount = (dbUser.weeklyComparisonsCount || 0) + 1;
        await dbUser.save();
      } else if (tier === 'enterprise') {
        if (!dbUser.monthlyComparisonsCount || !dbUser.firstMonthlyComparisonAt) {
          dbUser.firstMonthlyComparisonAt = new Date();
        }
        dbUser.monthlyComparisonsCount = (dbUser.monthlyComparisonsCount || 0) + 1;
        await dbUser.save();
      }
    }

    const analysis = await agent.comparePlayers(player1Id, player2Id, lang || 'es');
    const p1 = await Player.findByPk(player1Id);
    const p2 = await Player.findByPk(player2Id);
    res.json({ analysis, player1: p1, player2: p2, user: dbUser ? dbUser.toPublicJSON() : null });
  } catch (err) {
    console.error('Compare error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Simulations Consumable Limit ─────────────────────────────────
app.post('/api/simulations/consume', authenticate, async (req, res) => {
  try {
    let dbUser = await User.findByPk(req.user.id);
    if (!dbUser) return res.status(404).json({ error: 'Usuario no encontrado' });

    if (dbUser.checkAndResetDailyLimits) await dbUser.checkAndResetDailyLimits();
    const tier = (dbUser.selectedTier || 'Gratis').toLowerCase();

    if (tier === 'gratis' || tier === 'pro') {
      return res.status(403).json({ error: 'El módulo de Simulaciones no está disponible para tu plan. Actualiza al Plan Plus, Local o Enterprise.' });
    }

    if (tier === 'plus') {
      if ((dbUser.monthlySimulationsCount || 0) >= 5) {
        return res.status(429).json({
          error: 'limit_reached',
          message: 'Has alcanzado el límite mensual de 5 simulaciones para el Plan Plus. Se restablecerá transcurridos 30 días desde tu primer uso (límite mensual no acumulativo).'
        });
      }
      if (!dbUser.monthlySimulationsCount || !dbUser.firstMonthlySimulationAt) {
        dbUser.firstMonthlySimulationAt = new Date();
      }
      dbUser.monthlySimulationsCount = (dbUser.monthlySimulationsCount || 0) + 1;
      await dbUser.save();
    } else if (tier === 'enterprise') {
      if ((dbUser.monthlySimulationsCount || 0) >= 25) {
        return res.status(429).json({
          error: 'limit_reached',
          message: 'Has alcanzado el límite mensual de 25 simulaciones para el Plan Enterprise. Se restablecerá transcurridos 30 días desde tu primer uso (límite mensual no acumulativo).'
        });
      }
      if (!dbUser.monthlySimulationsCount || !dbUser.firstMonthlySimulationAt) {
        dbUser.firstMonthlySimulationAt = new Date();
      }
      dbUser.monthlySimulationsCount = (dbUser.monthlySimulationsCount || 0) + 1;
      await dbUser.save();
    }

    res.json({ success: true, user: dbUser.toPublicJSON() });
  } catch (err) {
    console.error('Error in /api/simulations/consume:', err);
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
    const rawTeams = await Team.findAll({
      where,
      order: [['position', 'ASC'], ['name', 'ASC']]
    });

    const teams = rawTeams.filter(t => {
      if (!t || !t.name) return false;
      const trimmed = t.name.trim();
      if (trimmed.length < 2) return false;
      if (trimmed.startsWith('"') || trimmed.startsWith('|') || trimmed.startsWith("'")) return false;
      const upper = trimmed.toUpperCase();
      if (upper.includes('N/D') || upper.includes('N/A') || upper.includes('NO DISPONIBLE') || upper.includes('UNDEFINED') || upper.includes('NULL')) return false;
      if (upper.includes('EQUIPOS') || upper.includes('CORRECTOS') || upper.includes('DOCUMENTO') || upper.includes('VER TAMBIÉN') || upper.includes('ACTUAL,')) return false;
      return true;
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
        
        // Validate that key distinguishing words of cleanName match the resolved Wikipedia pageTitle
        const genericWords = new Set(['club', 'deportivo', 'fútbol', 'futbol', 'football', 'association', 'fc', 'cf', 'f.c.', 'c.f.']);
        const keyWords = cleanName.toLowerCase().split(/\s+/).filter(w => w.length > 2 && !genericWords.has(w));
        if (keyWords.length > 0) {
          const titleLower = pageTitle.toLowerCase();
          const matchKeyWord = keyWords.some(kw => titleLower.includes(kw));
          if (!matchKeyWord) {
            continue; // Skip false-positive matches (e.g. "Club Deportivo TesF" matching "Club Deportivo ESPOLI")
          }
        }
        const restUrl = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`;
        
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

const FOOTBALL_API_BASE_URL = process.env.FOOTBALL_API_BASE_URL || 'https://futbolai.abacusai.app';
const FOOTBALL_API_KEY = process.env.FOOTBALL_API_KEY || 'fbl_0fbf2e77c710a6df117328080ec953c43849ef1c84106d46';

function fetchAbacusLogo(type, id) {
  return new Promise((resolve) => {
    if (!id) return resolve(null);
    const https = require('https');
    const url = `${FOOTBALL_API_BASE_URL}/${type}/${id}/logo?api_key=${FOOTBALL_API_KEY}`;
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'x-api-key': FOOTBALL_API_KEY
      }
    }, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        resolve(res.headers.location);
      } else if (res.statusCode === 200) {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            resolve(parsed.logo_url || parsed.logoUrl || parsed.url || null);
          } catch (e) {
            resolve(null);
          }
        });
      } else {
        resolve(null);
      }
    });
    req.on('error', () => resolve(null));
  });
}

function cleanTeamName(name) {
  if (!name) return '';
  return name.replace(/\s*\((?:descendido|campeón|campeon|debutante|invitado|relegado|descendido via playoff)[^\)]*\)/gi, '').trim();
}

// ─── DYNAMIC VECTOR BADGE GENERATOR (SVG) ───────────────────────────
app.get('/api/badge/team/:id.svg', async (req, res) => {
  try {
    const { id } = req.params;
    const team = await Team.findByPk(id);
    const rawName = team ? team.name : `Equipo ${id}`;
    const name = cleanTeamName(rawName);
    
    // Generate 3-letter initials (e.g. Real Madrid -> RMA, Flamengo -> FLA)
    const words = name.split(/\s+/).filter(w => w.length > 0);
    let initials = '';
    if (words.length >= 3) {
      initials = (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
    } else if (words.length === 2) {
      initials = (words[0][0] + words[1].substring(0, 2)).toUpperCase();
    } else {
      initials = name.substring(0, 3).toUpperCase();
    }

    // Generate deterministic colors based on team ID / name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color1 = `hsl(${Math.abs(hash % 360)}, 70%, 45%)`;
    const color2 = `hsl(${Math.abs((hash * 13) % 360)}, 65%, 25%)`;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" width="100" height="120">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${color1}" />
          <stop offset="100%" stop-color="${color2}" />
        </linearGradient>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.5"/>
        </filter>
      </defs>
      <!-- Shield Shape -->
      <path d="M 50,5 L 90,20 L 90,70 C 90,95 50,115 50,115 C 50,115 10,95 10,70 L 10,20 Z" fill="url(#bgGrad)" stroke="#FFFFFF" stroke-width="3" filter="url(#shadow)"/>
      <path d="M 50,10 L 85,23 L 85,68 C 85,90 50,108 50,108 C 50,108 15,90 15,68 L 15,23 Z" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>
      <!-- Star on Top -->
      <polygon points="50,18 52,24 58,24 53,28 55,34 50,30 45,34 47,28 42,24 48,24" fill="#FFD700"/>
      <!-- Team Initials Text -->
      <text x="50" y="68" font-family="Helvetica, Arial, sans-serif" font-weight="900" font-size="20" fill="#FFFFFF" text-anchor="middle" dominant-baseline="middle" letter-spacing="1">${initials}</text>
      <!-- Football Icon at Bottom -->
      <circle cx="50" cy="92" r="6" fill="#FFFFFF" stroke="#000" stroke-width="0.5"/>
    </svg>`;

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(svg);
  } catch (err) {
    res.status(500).send('Error generating team badge');
  }
});

// ─── TEAM LOGO RESOLVER BY ID / NAME ─────────────────────────────────
app.get(['/api/team-logo', '/api/teams/:id/logo'], async (req, res) => {
  try {
    let { id, name } = req.query;
    if (req.params.id) id = req.params.id;

    let teamRecord = null;
    if (id) {
      teamRecord = await Team.findByPk(id);
    } else if (name) {
      const clean = cleanTeamName(name);
      teamRecord = await Team.findOne({ where: { name: clean } });
      if (!teamRecord) {
        const all = await Team.findAll();
        teamRecord = all.find(t => t.name.toLowerCase().includes(clean.toLowerCase()));
      }
    }

    const teamId = teamRecord ? teamRecord.id : id;
    const teamName = teamRecord ? teamRecord.name : (name || '');

    // 1. Query FutbolAI Abacus API (https://futbolai.abacusai.app)
    if (teamId) {
      const abacusLogo = await fetchAbacusLogo('teams', teamId);
      if (abacusLogo) {
        return res.json({ id: parseInt(teamId), name: teamName, logoUrl: abacusLogo, apiKey: FOOTBALL_API_KEY });
      }
    }

    const cleanName = cleanTeamName(teamName);
    const apiHost = req.protocol + '://' + req.get('host');

    // 2. Check major Sofifa mapping
    if (majorSofifaTeamIds[cleanName] || majorSofifaTeamIds[teamName]) {
      const sofifaId = majorSofifaTeamIds[cleanName] || majorSofifaTeamIds[teamName];
      const proxiedUrl = `${apiHost}/api/team-logo-image/${sofifaId}`;
      return res.json({ id: teamId ? parseInt(teamId) : null, name: cleanName, logoUrl: proxiedUrl, apiKey: FOOTBALL_API_KEY });
    }

    // 3. Check cache / Wikipedia fallback
    if (resolvedLogosCache.has(cleanName)) {
      return res.json({ id: teamId ? parseInt(teamId) : null, name: cleanName, logoUrl: resolvedLogosCache.get(cleanName), apiKey: FOOTBALL_API_KEY });
    }

    const logoUrl = await getWikiRestLogo(cleanName);
    if (logoUrl) {
      resolvedLogosCache.set(cleanName, logoUrl);
      return res.json({ id: teamId ? parseInt(teamId) : null, name: cleanName, logoUrl, apiKey: FOOTBALL_API_KEY });
    }

    // 4. GUARANTEED VECTOR BADGE FALLBACK (Never returns null/404)
    const fallbackBadgeUrl = teamId ? `${apiHost}/api/badge/team/${teamId}.svg` : null;
    res.json({ id: teamId ? parseInt(teamId) : null, name: cleanName, logoUrl: fallbackBadgeUrl, apiKey: FOOTBALL_API_KEY });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── LEAGUE LOGO RESOLVER BY ID / NAME ───────────────────────────────
app.get(['/api/league-logo', '/api/leagues/:id/logo'], async (req, res) => {
  try {
    let { id, name } = req.query;
    if (req.params.id) id = req.params.id;

    let leagueRecord = null;
    if (id) {
      leagueRecord = await League.findByPk(id);
    } else if (name) {
      const nameLower = name.toLowerCase();
      leagueRecord = await League.findOne({
        where: sequelize.where(
          sequelize.fn('lower', sequelize.col('name')),
          nameLower
        )
      });
      if (!leagueRecord) {
        const allLeagues = await League.findAll();
        leagueRecord = allLeagues.find(l => l.name.toLowerCase().includes(nameLower));
      }
    }

    const leagueId = leagueRecord ? leagueRecord.id : id;
    const leagueName = leagueRecord ? leagueRecord.name : (name || '');

    // 1. Query FutbolAI Abacus API (https://futbolai.abacusai.app)
    if (leagueId) {
      const abacusLogo = await fetchAbacusLogo('leagues', leagueId);
      if (abacusLogo) {
        return res.json({ id: parseInt(leagueId), name: leagueName, logoUrl: abacusLogo, apiKey: FOOTBALL_API_KEY });
      }
    }

    // 2. Local asset fallback
    if (leagueRecord) {
      const dbId = leagueRecord.id;
      const dbToFileMap = {"1":31,"2":55,"3":7,"4":44,"5":67,"6":58,"7":17,"8":6,"9":42,"10":39,"11":36,"12":59,"13":60,"14":47,"15":25,"16":27,"17":66,"18":73,"19":56,"20":19,"21":69,"22":1,"23":5,"24":14,"25":65,"26":70,"27":24,"28":43,"29":35,"30":37,"31":13,"32":12,"33":61,"34":40,"35":2,"36":74,"37":16,"38":71,"39":8,"40":54,"41":38,"42":75,"43":76,"44":23,"45":20,"46":21,"47":15,"48":78,"49":57,"50":63,"51":28,"52":64,"53":80,"54":29,"55":79,"56":34,"57":68,"58":18,"59":11,"60":72,"61":22,"62":46,"63":48,"64":10,"65":62,"66":41,"67":32,"68":45,"69":77,"70":26,"71":33,"72":30,"73":3,"74":51,"75":81,"76":52,"77":4,"78":50,"79":53,"80":9,"81":49};
      const fileId = dbToFileMap[dbId.toString()] || dbId;
      return res.json({ id: dbId, name: leagueRecord.name, logoUrl: `/assets/leagues/liga_${fileId}.png`, apiKey: FOOTBALL_API_KEY });
    }

    res.json({ id: null, name: leagueName, logoUrl: null, apiKey: FOOTBALL_API_KEY });
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

// ─── Global Express Error Handling Middleware ────────────────────
app.use((err, req, res, next) => {
  console.error('🚨 [Express Error Middleware]', err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: err.message || 'Error interno del servidor en Futbol AI Backend',
    details: err.stack || err.details || null,
    path: req.originalUrl
  });
});

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
      await sequelize.sync().catch(err => console.warn('Database sync note:', err.message));
      
      // Safer synchronization for database tables
      // Manually ensure new columns exist across DB dialects (MSSQL, SQLite, Postgres)
      const checkColumns = async () => {
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
        if (!hasUserColumn('isVerified')) {
          console.log('➕ Adding isVerified column...');
          await sequelize.query('ALTER TABLE users ADD isVerified BIT DEFAULT 0').catch(() => {});
        }
        if (!hasUserColumn('otpCode')) {
          console.log('➕ Adding otpCode column...');
          await sequelize.query('ALTER TABLE users ADD otpCode NVARCHAR(6) NULL').catch(() => {});
        }
        if (!hasUserColumn('otpExpires')) {
          console.log('➕ Adding otpExpires column...');
          await sequelize.query('ALTER TABLE users ADD otpExpires DATETIMEOFFSET NULL').catch(() => {});
        }
        if (!hasUserColumn('localCoachData')) {
          console.log('➕ Adding localCoachData column...');
          await queryInterface.addColumn('users', 'localCoachData', {
            type: require('sequelize').DataTypes.TEXT,
            allowNull: true
          }).catch(async () => {
            await sequelize.query('ALTER TABLE users ADD localCoachData TEXT NULL').catch(() => {});
          });
        }
        if (!hasUserColumn('billingCycleStart')) {
          console.log('➕ Adding billingCycleStart column...');
          await queryInterface.addColumn('users', 'billingCycleStart', {
            type: require('sequelize').DataTypes.DATE,
            allowNull: true
          }).catch(async () => {
            await sequelize.query('ALTER TABLE users ADD billingCycleStart DATETIME NULL').catch(() => {});
          });
        }
        if (!hasUserColumn('billingCycleEnd')) {
          console.log('➕ Adding billingCycleEnd column...');
          await queryInterface.addColumn('users', 'billingCycleEnd', {
            type: require('sequelize').DataTypes.DATE,
            allowNull: true
          }).catch(async () => {
            await sequelize.query('ALTER TABLE users ADD billingCycleEnd DATETIME NULL').catch(() => {});
          });
        }

        if (!hasUserColumn('autoRenew')) {
          console.log('➕ Adding autoRenew column...');
          await queryInterface.addColumn('users', 'autoRenew', {
            type: require('sequelize').DataTypes.BOOLEAN,
            defaultValue: true
          }).catch(async () => {
            await sequelize.query('ALTER TABLE users ADD autoRenew BOOLEAN DEFAULT 1').catch(() => {});
          });
        }

        if (!hasUserColumn('maxPaidTierInCycle')) {
          console.log('➕ Adding maxPaidTierInCycle column...');
          await queryInterface.addColumn('users', 'maxPaidTierInCycle', {
            type: require('sequelize').DataTypes.STRING(50),
            defaultValue: 'Gratis'
          }).catch(async () => {
            await sequelize.query("ALTER TABLE users ADD maxPaidTierInCycle NVARCHAR(50) NULL DEFAULT 'Gratis'").catch(() => {});
          });
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

        // Check columns for Players table case-insensitively
        const playersTableInfo = await queryInterface.describeTable('Players').catch(() => ({}));
        const hasPlayerColumn = (col) => Object.keys(playersTableInfo).some(k => k.toLowerCase() === col.toLowerCase());
        
        if (!hasPlayerColumn('userId')) {
          console.log('➕ Adding userId column to Players table...');
          await queryInterface.addColumn('Players', 'userId', {
            type: require('sequelize').DataTypes.STRING(255),
            allowNull: true
          }).catch(async () => {
            if (sequelize.options.dialect === 'mssql') {
              await sequelize.query('ALTER TABLE Players ADD userId NVARCHAR(255) NULL').catch(() => {});
            } else {
              await sequelize.query('ALTER TABLE Players ADD COLUMN userId VARCHAR(255) NULL').catch(() => {});
            }
          });
        }

        // Check columns for Prospects table case-insensitively
        const prospectsTableInfo = await queryInterface.describeTable('Prospects').catch(() => ({}));
        const hasProspectColumn = (col) => Object.keys(prospectsTableInfo).some(k => k.toLowerCase() === col.toLowerCase());

        const prospectColsToAdd = [
          'docType', 'docNumber', 'docFileUrl', 'docFileName',
          'heightUnit', 'weightUnit',
          'improvements', 'weaknesses', 'tacticalNotes', 'highlightUrl',
          'authorizations', 'legalDetails', 'injuries'
        ];
        for (const col of prospectColsToAdd) {
          if (!hasProspectColumn(col)) {
            console.log(`➕ Adding ${col} column to Prospects table...`);
            await queryInterface.addColumn('Prospects', col, {
              type: require('sequelize').DataTypes.TEXT,
              allowNull: true
            }).catch(async () => {
              if (sequelize.options.dialect === 'mssql') {
                await sequelize.query(`ALTER TABLE Prospects ADD ${col} NVARCHAR(MAX) NULL`).catch(() => {});
              } else {
                await sequelize.query(`ALTER TABLE Prospects ADD COLUMN ${col} TEXT NULL`).catch(() => {});
              }
            });
          }
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

      const doAlter = sequelize.options.dialect !== 'mssql' && sequelize.options.dialect !== 'sqlite';

      await User.sync().catch(err => console.warn('User sync note:', err.message));
      if (doAlter) await User.sync({ alter: true }).catch(err => console.warn('User sync alter note:', err.message));

      await checkColumns().catch(err => console.warn('⚠️ Column sync warning (might already exist):', err.message));

      await Player.sync().catch(err => console.warn('Player sync note:', err.message));
      if (doAlter) await Player.sync({ alter: true }).catch(err => console.warn('Player sync alter note:', err.message));

      await Prospect.sync().catch(err => console.warn('Prospect sync note:', err.message));
      if (doAlter) await Prospect.sync({ alter: true }).catch(err => console.warn('Prospect sync alter note:', err.message));

      // Automigración de prospectos locales desde Players a Prospects
      try {
        const { Op } = require('sequelize');
        const oldLocalPlayers = await Player.findAll({
          where: {
            [Op.or]: [
              { id: { [Op.like]: 'loc-player-%' } },
              { userId: { [Op.ne]: null } }
            ]
          }
        });
        if (oldLocalPlayers.length > 0) {
          console.log(`📦 Automigrando ${oldLocalPlayers.length} prospecto(s) local(es) desde la tabla Players hacia Prospects...`);
          for (const oldP of oldLocalPlayers) {
            const raw = oldP.toJSON();
            if (raw.userId) {
              await Prospect.upsert({
                ...raw,
                stats: typeof raw.stats === 'object' ? JSON.stringify(raw.stats) : raw.stats,
                strengths: typeof raw.strengths === 'object' ? JSON.stringify(raw.strengths) : raw.strengths,
                trophies: typeof raw.trophies === 'object' ? JSON.stringify(raw.trophies) : raw.trophies,
                tags: typeof raw.tags === 'object' ? JSON.stringify(raw.tags) : raw.tags,
                history: typeof raw.history === 'object' ? JSON.stringify(raw.history) : raw.history
              }).catch(e => console.warn(`Error migrando prospecto ${raw.id}:`, e.message));
              await oldP.destroy().catch(() => {});
            }
          }
          console.log('✅ Automigración de prospectos locales completada.');
        }
      } catch (migErr) {
        console.warn('⚠️ Nota de automigración de prospectos:', migErr.message);
      }

      await Payment.sync().catch(err => console.warn('Payment sync note:', err.message));
      if (doAlter) await Payment.sync({ alter: true }).catch(err => console.warn('Payment sync alter note:', err.message));

      await PaymentMethod.sync().catch(err => console.warn('PaymentMethod sync note:', err.message));
      if (doAlter) await PaymentMethod.sync({ alter: true }).catch(err => console.warn('PaymentMethod sync alter note:', err.message));

      await QueryLog.sync().catch(err => console.warn('QueryLog sync note:', err.message));
      if (doAlter) await QueryLog.sync({ alter: true }).catch(err => console.warn('QueryLog sync alter note:', err.message));

      await ComparisonLog.sync().catch(err => console.warn('ComparisonLog sync note:', err.message));
      if (doAlter) await ComparisonLog.sync({ alter: true }).catch(err => console.warn('ComparisonLog sync alter note:', err.message));

      await FavoriteLog.sync().catch(err => console.warn('FavoriteLog sync note:', err.message));
      if (doAlter) await FavoriteLog.sync({ alter: true }).catch(err => console.warn('FavoriteLog sync alter note:', err.message));

      await DirectMessage.sync().catch(err => console.warn('DirectMessage sync note:', err.message));
      await UserContact.sync().catch(err => console.warn('UserContact sync note:', err.message));

      await seedLeaguesAndTeams();

      // Enable RLS for Postgres tables if applicable
      if (typeof enableRLSIfPostgres === 'function') {
        await enableRLSIfPostgres();
      }

      // Seed players from players.json
      let count = await Player.count();
      try {
        const playersFile = path.join(__dirname, 'knowledge/players.json');
        const fs = require('fs');
        if (fs.existsSync(playersFile)) {
          const fileData = JSON.parse(fs.readFileSync(playersFile, 'utf8'));
          const playersList = Array.isArray(fileData) ? fileData : (fileData.players || []);
          const jsonPlayerIds = new Set(playersList.map(p => p.id));
          
          // 1. Purge deleted duplicate records from active DB not present in players.json
          const dbPlayers = await Player.findAll({ attributes: ['id'] });
          const obsoletePlayers = dbPlayers.filter(p => !jsonPlayerIds.has(p.id));
          if (obsoletePlayers.length > 0) {
            console.log(`🧹 Purging ${obsoletePlayers.length} obsolete/duplicate records from active database...`);
            for (const obs of obsoletePlayers) {
              await Player.destroy({ where: { id: obs.id } });
            }
          }

          // 2. Upsert (update or insert) all clean players with photos, injuries, and 2025/26 history
          console.log(`🌱 Synchronizing ${playersList.length} players from players.json into active database...`);
          for (const p of playersList) {
            const formattedPlayer = {
              id: p.id,
              name: p.name,
              photoId: p.photoId || null,
              nickname: p.nickname || null,
              age: p.age || null,
              nationality: p.nationality || null,
              nationalityEs: p.nationalityEs || null,
              flag: p.flag || null,
              position: p.position || null,
              positionEs: p.positionEs || null,
              currentTeam: p.currentTeam || null,
              league: p.league || null,
              country: p.country || null,
              jerseyNumber: p.jerseyNumber || null,
              height: p.height || null,
              weight: p.weight || null,
              preferredFoot: p.preferredFoot || null,
              marketValue: p.marketValue || 0,
              overallRating: p.overallRating || 7.2,
              stats: p.stats ? (typeof p.stats === 'string' ? p.stats : JSON.stringify(p.stats)) : null,
              careerTotals: p.careerTotals ? (typeof p.careerTotals === 'string' ? p.careerTotals : JSON.stringify(p.careerTotals)) : null,
              trophies: p.trophies ? (typeof p.trophies === 'string' ? p.trophies : JSON.stringify(p.trophies)) : null,
              transfers: p.transfers ? (typeof p.transfers === 'string' ? p.transfers : JSON.stringify(p.transfers)) : null,
              bio: p.bio || null,
              bioEs: p.bioEs || null,
              strengths: p.strengths ? (typeof p.strengths === 'string' ? p.strengths : JSON.stringify(p.strengths)) : null,
              tags: p.tags ? (typeof p.tags === 'string' ? p.tags : JSON.stringify(p.tags)) : null,
              history: p.history ? (typeof p.history === 'string' ? p.history : JSON.stringify(p.history)) : null,
              medicalStatus: p.medicalStatus || 'Disponible',
              injuries: p.injuries ? (typeof p.injuries === 'string' ? p.injuries : JSON.stringify(p.injuries)) : null
            };
            
            await Player.upsert(formattedPlayer);
          }
          count = await Player.count();
          console.log(`✅ Synchronized ${playersList.length} players successfully in active database. Total count: ${count}`);
        } else {
          console.warn('⚠️ Seeding warning: knowledge/players.json not found.');
        }
      } catch (seedErr) {
        console.error('❌ Failed to seed players:', seedErr.message);
      }

      await seedDemoUsers();

      const userCount = await User.count();
      const realPlayerCount = await Player.count();
      console.log(`📊 Database connected: ${realPlayerCount} players | ${userCount} users`);
    } catch (err) {
      console.error('❌ Database connection failed:', err);
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

