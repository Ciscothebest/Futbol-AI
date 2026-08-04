const { Player, Prospect, sequelize } = require('./database');
const { Op } = require('sequelize');
const https = require('https');

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-2f1665d0795a4b9eb124def134ddac83';

// ─────────────────────────────────────────────────────────────
// SYSTEM PROMPT — Prioridad: datos de la app → conocimiento propio → búsqueda web
// ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Eres FutbolAI ⚽ — un asistente de inteligencia de fútbol de clase mundial con expertise profundo en fútbol global. Eres bilingüe: siempre detecta el idioma en que escribe el usuario (español o inglés) y responde en ese mismo idioma. Si el mensaje es ambiguo, responde en español.

REGLAS CRÍTICAS DE COMPORTAMIENTO:
1. PRIORIDAD DE FUENTES: Cuando se te proporciona información de la base de datos de la aplicación en el contexto, esa información ES LA VERDAD. Úsala como fuente principal y cita los datos concretos de la app (ratings, equipos, posiciones, estadísticas).
2. CONOCIMIENTO PROPIO: Para información que NO está en la base de datos (jugadores históricos, eventos recientes, ligas no cubiertas), usa tu conocimiento entrenado sobre fútbol mundial.
3. COBERTURA GLOBAL: Tienes conocimiento de TODAS las ligas y competiciones del mundo: La Liga, Serie A, Bundesliga, Ligue 1, MLS, Liga MX, Eredivisie, Primeira Liga, Champions League, Europa League, Copa Libertadores, Copa del Mundo, Eurocopa, y muchas más. NO te limites solo a la Premier League.
4. NUNCA menciones limitaciones de información al usuario. Si no tienes datos exactos, responde con tu mejor análisis basado en tu conocimiento general.
5. Responde de forma apasionada, experta y con terminología futbolística natural.
6. Usa formato Markdown cuando sea apropiado para estructurar respuestas largas.

CAPACIDADES:
- Análisis detallado de jugadores: estadísticas, carrera, estilo de juego, fortalezas y debilidades
- Comparaciones entre jugadores con análisis matizado más allá de las estadísticas
- Predicciones sobre rendimiento, fichajes y resultados de ligas
- Tácticas, formaciones y cómo los jugadores encajan en sistemas
- Historia del fútbol, palmarés, rachas y records
- Mercado de fichajes, valoraciones y rumores
- Análisis de partidos y tendencias tácticas actuales`;

class FootballAgent {
  constructor() {
    this.apiKey = DEEPSEEK_API_KEY;
    this.model = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
    this.demoMode = !this.apiKey;
    this.sessions = new Map();
  }

  // ─── Busca jugadores en la BD por nombre, equipo, liga o posición ───
  async findRelevantPlayers(message, limit = 8) {
    if (!message || message.length < 3) return [];
    const msg = message.toLowerCase();

    // Extraer términos significativos (más de 2 caracteres)
    const terms = msg.split(/\s+/).filter(w => w.length > 2);
    if (terms.length === 0) return [];

    const orConditions = [];
    for (const term of terms) {
      orConditions.push({ name: { [Op.like]: `%${term}%` } });
      orConditions.push({ nickname: { [Op.like]: `%${term}%` } });
      orConditions.push({ currentTeam: { [Op.like]: `%${term}%` } });
      orConditions.push({ league: { [Op.like]: `%${term}%` } });
      orConditions.push({ nationality: { [Op.like]: `%${term}%` } });
      orConditions.push({ position: { [Op.like]: `%${term.toUpperCase()}%` } });
    }

    try {
      const players = await Player.findAll({
        where: { [Op.or]: orConditions, userId: null },
        limit,
        order: [['overallRating', 'DESC']],
        attributes: [
          'id', 'name', 'nickname', 'flag', 'currentTeam', 'league',
          'position', 'overallRating', 'stats', 'bio', 'bioEs',
          'trophies', 'strengths', 'age', 'nationality', 'marketValue',
          'history', 'weaknesses'
        ]
      });
      return players;
    } catch (e) {
      console.error('findRelevantPlayers error:', e.message);
      return [];
    }
  }

  // ─── Busca prospectos locales relevantes ───
  async findRelevantProspects(message, limit = 5) {
    if (!message || message.length < 3) return [];
    const msg = message.toLowerCase();
    const terms = msg.split(/\s+/).filter(w => w.length > 2);
    if (terms.length === 0) return [];

    const orConditions = [];
    for (const term of terms) {
      orConditions.push({ name: { [Op.like]: `%${term}%` } });
      orConditions.push({ club: { [Op.like]: `%${term}%` } });
      orConditions.push({ position: { [Op.like]: `%${term.toUpperCase()}%` } });
    }

    try {
      return await Prospect.findAll({
        where: { [Op.or]: orConditions },
        limit,
        order: [['createdAt', 'DESC']]
      });
    } catch (e) {
      return [];
    }
  }

  // ─── Obtiene estadísticas globales de la app para dar contexto al modelo ───
  async getAppStats() {
    try {
      const totalPlayers = await Player.count({ where: { userId: null } });
      const leagues = await Player.findAll({
        attributes: [[sequelize.fn('DISTINCT', sequelize.col('league')), 'league']],
        where: { league: { [Op.ne]: null }, userId: null }
      });
      const topPlayers = await Player.findAll({
        where: { userId: null },
        order: [['overallRating', 'DESC']],
        limit: 5,
        attributes: ['name', 'currentTeam', 'overallRating', 'position', 'league']
      });
      return {
        totalPlayers,
        leagues: leagues.map(l => l.league).filter(Boolean),
        topPlayers: topPlayers.map(p => `${p.name} (${p.currentTeam}, ${p.league}, ${p.position}, Rating: ${p.overallRating})`)
      };
    } catch (e) {
      return null;
    }
  }

  // ─── Construye el contexto enriquecido de la app para incluir en el prompt ───
  buildAppContext(players, prospects, appStats, userContext = null) {
    let ctx = '';

    if (userContext) {
      ctx += `\n\n=== INFORMACIÓN Y ROL DEL USUARIO EN FUTBOLAI ===`;
      ctx += `\nNombre del usuario: ${userContext.name || 'Usuario'}`;
      ctx += `\nROL PRINCIPAL EN LA PLATAFORMA: ${userContext.role}`;
      if (userContext.hasBothOnboardings) {
        ctx += `\nNOTA DE ROL PRIMARIO: Este usuario ha completado AMBOS procesos de onboarding (Entrenador Local y Club Profesional). Sin importar cuál plan tenga activo actualmente (${userContext.activeTier}), SU ROL PRINCIPAL Y PRIMARIO ES ENTRENADOR. Dirígete a él primordialmente como Entrenador / Coach.`;
      } else if (userContext.role === 'Entrenador') {
        ctx += `\nEste usuario es Entrenador. Dirígete a él primordialmente como Entrenador / Coach.`;
      }
      if (userContext.localClub) {
        ctx += `\nClub Local que entrena: ${userContext.localClub}`;
      }
      if (userContext.selectedClub) {
        ctx += `\nClub Profesional / Organización: ${userContext.selectedClub}`;
      }
    }

    if (appStats) {
      ctx += `\n\n=== DATOS DE LA APLICACIÓN FUTBOLAI ===`;
      ctx += `\nBase de datos: ${appStats.totalPlayers} jugadores profesionales registrados.`;
      ctx += `\nLigas cubiertas: ${appStats.leagues.join(', ') || 'Múltiples ligas globales'}.`;
      if (appStats.topPlayers.length > 0) {
        ctx += `\nTop jugadores por rating en la app: ${appStats.topPlayers.join(' | ')}.`;
      }
    }

    if (players.length > 0) {
      ctx += `\n\n=== JUGADORES ENCONTRADOS EN LA BASE DE DATOS DE LA APP ===\n`;
      players.forEach(p => {
        const stats = typeof p.stats === 'string' ? JSON.parse(p.stats || '{}') : (p.stats || {});
        const statsStr = Object.entries(stats).slice(0, 8).map(([k, v]) => `${k}:${v}`).join(', ');
        const bio = p.bioEs || p.bio || '';
        ctx += `\n• ${p.name}`;
        if (p.nickname) ctx += ` (alias: ${p.nickname})`;
        ctx += `\n  Equipo: ${p.currentTeam} | Liga: ${p.league || 'N/A'} | Posición: ${p.position}`;
        ctx += `\n  Edad: ${p.age || 'N/A'} | Nacionalidad: ${p.nationality || 'N/A'} | Rating Global: ${p.overallRating}`;
        if (p.marketValue) ctx += ` | Valor: €${(p.marketValue/1000000).toFixed(1)}M`;
        if (statsStr) ctx += `\n  Estadísticas: ${statsStr}`;
        if (p.strengths) ctx += `\n  Fortalezas: ${p.strengths}`;
        if (p.weaknesses) ctx += `\n  Debilidades: ${p.weaknesses}`;
        if (p.trophies) ctx += `\n  Palmarés: ${p.trophies}`;
        if (bio) ctx += `\n  Bio: ${bio.substring(0, 200)}`;
        ctx += '\n';
      });
    }

    if (prospects.length > 0) {
      ctx += `\n=== PROSPECTOS LOCALES REGISTRADOS EN LA APP ===\n`;
      prospects.forEach(p => {
        ctx += `• ${p.name} | Posición: ${p.position || 'N/A'} | Club: ${p.club || 'N/A'} | Rating: ${p.rating || 'N/A'} | Categoría: ${p.category || 'N/A'}\n`;
      });
    }

    return ctx;
  }

  callDeepSeekAPI(messages) {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify({
        model: this.model,
        messages,
        temperature: 0.7,
        max_tokens: 2000
      });

      const req = https.request({
        hostname: 'api.deepseek.com',
        port: 443,
        path: '/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Length': Buffer.byteLength(postData)
        }
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const parsed = JSON.parse(body);
              const content = parsed.choices?.[0]?.message?.content;
              if (content) resolve(content);
              else reject(new Error('Respuesta vacía de DeepSeek'));
            } catch(e) {
              reject(e);
            }
          } else {
            reject(new Error(`DeepSeek API Error: ${res.statusCode} ${body}`));
          }
        });
      });

      req.on('error', (e) => reject(e));
      req.write(postData);
      req.end();
    });
  }

  callDeepSeekAPIStream(messages, onChunk, onDone, onError) {
    const postData = JSON.stringify({
      model: this.model,
      messages,
      temperature: 0.7,
      max_tokens: 2000,
      stream: true
    });

    const req = https.request({
      hostname: 'api.deepseek.com',
      port: 443,
      path: '/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let fullText = '';
      let buffer = '';

      res.on('data', chunk => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.substring(6).trim();
            if (dataStr === '[DONE]') continue;
            try {
              const parsed = JSON.parse(dataStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                fullText += content;
                if (typeof onChunk === 'function') onChunk(content);
              }
            } catch (e) {
              // Ignore parse errors on partial chunks
            }
          }
        }
      });

      res.on('end', () => {
        if (typeof onDone === 'function') onDone(fullText);
      });
    });

    req.on('error', (err) => {
      if (typeof onError === 'function') onError(err);
    });

    req.write(postData);
    req.end();
  }

  clearSession(sessionId) {
    if (sessionId && this.sessions.has(sessionId)) {
      this.sessions.delete(sessionId);
    }
  }

  async chat(sessionId, message, lang = 'es', audioBase64 = null, mimeType = null, userContext = null) {
    const history = this.sessions.get(sessionId) || [];

    const [relevantPlayers, prospects, appStats] = await Promise.all([
      this.findRelevantPlayers(message),
      this.findRelevantProspects(message),
      this.getAppStats()
    ]);

    const contextStr = this.buildAppContext(relevantPlayers, prospects, appStats, userContext);

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT + contextStr }
    ];

    history.forEach(msg => {
      messages.push({ role: msg.role === 'user' ? 'user' : 'assistant', content: msg.content });
    });

    const userText = message || (audioBase64 ? '(Audio de voz procesado)' : 'Hola');
    messages.push({ role: 'user', content: userText });

    const reply = await this.callDeepSeekAPI(messages);

    history.push({ role: 'user', content: userText });
    history.push({ role: 'assistant', content: reply });
    if (history.length > 20) history.splice(0, 2);
    this.sessions.set(sessionId, history);

    return reply;
  }

  chatStream(sessionId, message, lang = 'es', audioBase64 = null, mimeType = null, clubContext = null, clubRoster = null, userContext = null, onChunk, onDone, onError) {
    if (typeof userContext === 'function') {
      onError = onDone;
      onDone = onChunk;
      onChunk = userContext;
      userContext = null;
    }

    const history = this.sessions.get(sessionId) || [];

    Promise.all([
      this.findRelevantPlayers(message),
      this.findRelevantProspects(message),
      this.getAppStats()
    ]).then(([relevantPlayers, prospects, appStats]) => {

      let contextStr = this.buildAppContext(relevantPlayers, prospects, appStats, userContext);

      if (clubContext) {
        contextStr += `\n\n=== CONTEXTO DE CLUB LOCAL DEL USUARIO ===\n${JSON.stringify(clubContext, null, 2)}`;
      }
      if (clubRoster && clubRoster.length > 0) {
        contextStr += `\n\nPLANTILLA LOCAL:\n`;
        clubRoster.forEach(p => {
          contextStr += `• ${p.name} | Posición: ${p.position} | Rating: ${p.rating || 'N/A'}\n`;
        });
      }

      const messages = [
        { role: 'system', content: SYSTEM_PROMPT + contextStr }
      ];

      history.forEach(msg => {
        messages.push({ role: msg.role === 'user' ? 'user' : 'assistant', content: msg.content });
      });

      const userText = message || (audioBase64 ? '(Mensaje de audio)' : 'Hola');
      messages.push({ role: 'user', content: userText });

      this.callDeepSeekAPIStream(
        messages,
        (chunk) => {
          if (typeof onChunk === 'function') onChunk(chunk);
        },
        (fullText) => {
          history.push({ role: 'user', content: userText });
          history.push({ role: 'assistant', content: fullText });
          if (history.length > 20) history.splice(0, 2);
          this.sessions.set(sessionId, history);
          if (typeof onDone === 'function') onDone(fullText);
        },
        (err) => {
          if (typeof onError === 'function') onError(err);
        }
      );
    }).catch(err => {
      if (typeof onError === 'function') onError(err);
    });
  }

  async comparePlayers(player1Id, player2Id, lang = 'es') {
    const p1 = await Player.findByPk(player1Id);
    const p2 = await Player.findByPk(player2Id);

    if (!p1 || !p2) {
      throw new Error(`No se encontró uno o ambos jugadores para la comparación (${player1Id}, ${player2Id})`);
    }

    const fmt = (p) => ({
      nombre: p.name,
      equipo: p.currentTeam,
      liga: p.league,
      posicion: p.position,
      rating: p.overallRating,
      nacionalidad: p.nationality,
      edad: p.age,
      valorMercado: p.marketValue ? `€${(p.marketValue/1000000).toFixed(1)}M` : 'N/A',
      estadisticas: p.stats,
      puntosFuertes: p.strengths,
      debilidades: p.weaknesses,
      trofeos: p.trophies
    });

    const prompt = `Realiza una comparación táctica, técnica y estadística profesional entre estos dos futbolistas:\n\nJugador 1: ${JSON.stringify(fmt(p1))}\nJugador 2: ${JSON.stringify(fmt(p2))}\n\nEscribe la respuesta en ${lang === 'en' ? 'Inglés' : 'Español'} con formato Markdown profesional. Incluye:\n1. Resumen Ejecutivo y Comparativo Táctico.\n2. Análisis por atributos (Físico, Ataque, Defensa, Visión de Juego, Liderazgo).\n3. Fortalezas diferenciales de cada jugador.\n4. Veredicto Final del Scout de IA (¿en qué contexto destaca mejor cada uno?).`;

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ];

    return await this.callDeepSeekAPI(messages);
  }

  async getPredictions(lang = 'es') {
    const topPlayers = await Player.findAll({ where: { userId: null }, order: [['overallRating', 'DESC']], limit: 10 });
    const topPlayersList = topPlayers.map(p => `${p.name} (${p.currentTeam}, ${p.league}, ${p.overallRating} rating)`).join(', ');

    const prompt = `Genera un informe detallado de predicciones tácticas y de rendimiento con IA para la temporada actual (2024-25).\nJugadores top en la base de datos: ${topPlayersList}.\n\nEscribe en ${lang === 'en' ? 'Inglés' : 'Español'} en formato Markdown elegante. Incluye:\n- 🏆 Candidatos al Balón de Oro y Bota de Oro.\n- 🚀 Jugadores Revelación y Promesas a seguir.\n- 🔄 Predicciones de Fichajes y Mercado.\n- 📊 Tendencias Tácticas Dominantes.`;

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ];

    return await this.callDeepSeekAPI(messages);
  }

  async expandAlert(alertType, contextData, lang = 'es') {
    const prompt = `Genera un análisis técnico ampliado para la alerta de scouting tipo: "${alertType}".\nDatos de contexto: ${JSON.stringify(contextData)}.\nResponde en ${lang === 'en' ? 'Inglés' : 'Español'} en Markdown.`;

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ];

    return await this.callDeepSeekAPI(messages);
  }

  async ask(userMessage, conversationHistory = []) {
    return await this.chat('default-ask', userMessage, 'es');
  }

  async compare(player1, player2) {
    const p1Id = typeof player1 === 'object' ? player1.id : player1;
    const p2Id = typeof player2 === 'object' ? player2.id : player2;
    return await this.comparePlayers(p1Id, p2Id, 'es');
  }

  async predict() {
    return await this.getPredictions('es');
  }
}

module.exports = FootballAgent;
