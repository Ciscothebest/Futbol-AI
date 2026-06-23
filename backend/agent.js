const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Player } = require('./database');
const { Op } = require('sequelize');

// Compact system prompt — no player data injected here (keeps token count low)
const SYSTEM_PROMPT = `You are FutbolAI ⚽ — a world-class football intelligence assistant with deep expertise in global football. You are bilingual: always detect the language the user writes in (Spanish or English) and respond in that same language. If the message is ambiguous, respond in Spanish.

You can:
- Answer detailed questions about any player's stats, career, playing style, strengths and weaknesses
- Compare players side by side with nuanced analysis beyond just statistics
- Provide informed predictions about player performance, transfers, and league outcomes
- Discuss tactics, formations, and how specific players fit into systems
- Talk about historical achievements, transfer history, and trophies

PREMIER LEAGUE CONTEXT (2024-25 Season):
The Premier League has 20 clubs. Current teams:
Arsenal, Aston Villa, Bournemouth, Brentford, Brighton & Hove Albion, Burnley, Chelsea, Crystal Palace, Everton, Fulham, Leeds United, Liverpool, Manchester City, Manchester United, Newcastle United, Nottingham Forest, Sunderland, Tottenham Hotspur, West Ham United, Wolverhampton Wanderers.

Key facts: 38-game season, top 4 qualify for Champions League, 5th/6th for Europa League, 7th for Conference League, bottom 3 relegated. Current champions: Manchester City (multiple consecutive titles). Premier League is widely considered the most competitive and watched league in the world.

Be passionate, engaging, and expert. Use football terminology naturally.
If player data is provided in the user message, use it. If not, use your broad football knowledge.`;

async function findRelevantPlayers(message, limit = 5) {
  if (!message || message.length < 3) return [];
  const msg = message.toLowerCase();
  
  // Extract potential names/terms (words > 3 chars)
  const terms = msg.split(/\s+/).filter(w => w.length > 3);
  if (terms.length === 0) return [];

  // Build OR conditions for ALL valid terms, not just the first two
  const orConditions = [];
  for (const term of terms) {
    orConditions.push({ name: { [Op.like]: `%${term}%` } });
    orConditions.push({ nickname: { [Op.like]: `%${term}%` } });
    orConditions.push({ id: { [Op.like]: `%${term.replace(/\s/g, '-').substring(0, 20)}%` } });
  }

  // Use DB to find matches directly with indexed queries
  const matches = await Player.findAll({
    where: { [Op.or]: orConditions },
    limit: limit,
    attributes: ['id', 'name', 'flag', 'currentTeam', 'league', 'position', 'overallRating', 'stats', 'bio', 'trophies', 'strengths', 'age', 'nationality']
  });

  if (matches.length === 0) {
    // Return empty context if no players found, better than forcing unrelated top players
    return [];
  }

  return matches.map(p => ({
    name: p.name, flag: p.flag, team: p.currentTeam, league: p.league,
    position: p.position, age: p.age, rating: p.overallRating,
    goals: p.stats?.goals, assists: p.stats?.assists, matches: p.stats?.matches,
    marketValue: p.marketValue, strengths: p.strengths?.slice(0, 4),
    nationality: p.nationality, bio: p.bio, trophies: p.trophies?.slice(0, 5),
  }));
}

class FootballAgent {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.model = process.env.GEMINI_MODEL || 'gemini-2.0-flash-lite';
    this.sessions = new Map(); // sessionId -> history[]
    this.demoMode = !this.apiKey || this.apiKey === 'your_gemini_api_key_here';

    if (!this.demoMode) {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      const modelName = this.model;
      this.geminiModel = this.genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: SYSTEM_PROMPT,
      });
    }

    console.log(this.demoMode
      ? '⚠️  Demo mode active (no API key). Using SQLite database.'
      : `✅ Gemini connected (${this.model})`
    );
  }

  async chat(sessionId, userMessage, language = 'es', audioBase64 = null, mimeType = null) {
    if (this.demoMode) {
      return this._demoResponse(userMessage || "audio_message");
    }

    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, []);
    }

    const history = this.sessions.get(sessionId);
    const langPrefix = language === 'en'
      ? '[RESPOND IN ENGLISH ONLY] '
      : '[RESPONDE SIEMPRE EN ESPAÑOL] ';

    // Inject relevant player data dynamically per message
    const relevantPlayers = await findRelevantPlayers(userMessage || '');
    const playerContext = relevantPlayers.length
      ? `\n\n[Player DB context]: ${JSON.stringify(relevantPlayers)}`
      : '';

    const messageParts = [];
    if (userMessage || playerContext) {
      messageParts.push({ text: langPrefix + (userMessage || 'El usuario ha enviado un mensaje de voz.') + playerContext });
    } else {
      messageParts.push({ text: langPrefix + 'El usuario ha enviado un mensaje de voz.' });
    }

    if (audioBase64 && mimeType) {
      messageParts.push({ inlineData: { data: audioBase64, mimeType } });
    }

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const chat = this.geminiModel.startChat({ history });
        const result = await chat.sendMessage(messageParts);
        const responseText = result.response.text();

        // Store original message in history (not the augmented one)
        const userHistoryPart = { role: 'user', parts: [] };
        if (userMessage) userHistoryPart.parts.push({ text: userMessage });
        if (audioBase64) userHistoryPart.parts.push({ text: '[Mensaje de Audio]' });

        history.push(userHistoryPart);
        history.push({ role: 'model', parts: [{ text: responseText }] });

        if (history.length > 40) {
          this.sessions.set(sessionId, history.slice(-40));
        }

        return responseText;
      } catch (err) {
        console.error("❌ Gemini Chat Error:", err);
        const errMsg = err.message || '';
        const isModelError = errMsg.includes('not found') || errMsg.includes('404') || errMsg.includes('supported') || errMsg.includes('model');
        const isKeyError = errMsg.includes('key') || errMsg.includes('API_KEY') || errMsg.includes('400') || errMsg.includes('403') || errMsg.includes('unauthorized');
        
        if (isModelError && this.model !== 'gemini-2.5-flash') {
          console.warn(`⚠️ Model '${this.model}' failed. Falling back to stable 'gemini-2.5-flash'...`);
          this.model = 'gemini-2.5-flash';
          this.geminiModel = this.genAI.getGenerativeModel({
            model: this.model,
            systemInstruction: SYSTEM_PROMPT,
          });
          attempt--;
          continue;
        }

        if (isKeyError) {
          console.warn('⚠️ Gemini API Key invalid or disabled. Falling back to Demo Mode.');
          this.demoMode = true;
          return this._demoResponse(userMessage || "audio_message");
        }

        const isRateLimit = errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('RESOURCE_EXHAUSTED');
        if (isRateLimit && attempt < 2) { // Reduced attempts
          const retryMatch = errMsg.match(/"retryDelay":"(\d+)s"/);
          const delaySec = retryMatch ? Math.min(parseInt(retryMatch[1]), 5) + 1 : 3;
          const delayMs = delaySec * 1000;
          console.log(`⏳ Rate limit hit (attempt ${attempt + 1}/2), retrying in ${delaySec}s...`);
          await new Promise(r => setTimeout(r, delayMs));
          continue;
        }
        if (isRateLimit) {
           console.warn('⚠️ API Limit reached in standard chat. Falling back to Demo Mode.');
           return (await this._demoResponse(userMessage)) + (language === 'en' ? "\n\n*(Offline mode)*" : "\n\n*(Modo offline)*");
        }
        console.error('Gemini API error:', errMsg);
        throw err;
      }
    }
  }

  async chatStream(sessionId, userMessage, language = 'es', audioBase64 = null, mimeType = null, clubContext = null, clubRoster = null, onChunk, onDone, onError) {
    if (this.demoMode) {
      const resp = await this._demoResponse(userMessage || "audio_message");
      onChunk(resp);
      onDone(resp);
      return;
    }

    if (!this.sessions.has(sessionId)) this.sessions.set(sessionId, []);
    const history = this.sessions.get(sessionId);
    const langPrefix = language === 'en' ? '[RESPOND IN ENGLISH] ' : '[RESPONDE EN ESPAÑOL] ';

    const relevantPlayers = await findRelevantPlayers(userMessage || '');
    const playerContext = relevantPlayers.length ? `\n\n[Contexto Jugadores]: ${JSON.stringify(relevantPlayers)}` : '';
    
    const rosterRestriction = clubRoster ? `\n\n[ROSTER ACTUAL DEL EQUIPO]: ${clubRoster}\nUtiliza obligatoriamente esta lista de jugadores para cualquier consulta sobre la alineación, plantilla, fortalezas o debilidades actuales de ${clubContext}.` : '';
    const clubRestriction = clubContext ? `\n\n[INSTRUCCIÓN DE CONTEXTO]: Estás operando en el panel del club ${clubContext}. Asume por defecto que todas las preguntas, análisis o peticiones del usuario se refieren al equipo ${clubContext}. Si el usuario hace una pregunta general (ej: '¿quién es mi mejor jugador?' o '¿cómo formamos?'), responde basándote en la plantilla de ${clubContext}.${rosterRestriction}\n\nNota: Si el usuario menciona explícitamente a otro equipo, liga o jugador externo, ESTÁS AUTORIZADO a responder sobre ese otro tema sin restricciones.` : '';
    
    const messageParts = [];
    let promptText = langPrefix + clubRestriction + '\n';
    if (userMessage) {
      promptText += userMessage + playerContext;
    } else if (audioBase64) {
      promptText += 'El usuario ha enviado un mensaje de voz.' + playerContext;
    } else {
      promptText += 'Mensaje de voz.';
    }
    messageParts.push({ text: promptText });

    if (audioBase64 && mimeType) {
      messageParts.push({ inlineData: { data: audioBase64, mimeType } });
    }
    
    try {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const chat = this.geminiModel.startChat({ history });
          const result = await chat.sendMessageStream(messageParts);
          
          let fullResponse = '';
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            fullResponse += chunkText;
            onChunk(chunkText);
          }

          // Store in history
          const userHistoryPart = { role: 'user', parts: [] };
          if (userMessage) userHistoryPart.parts.push({ text: userMessage });
          if (audioBase64) userHistoryPart.parts.push({ text: '[Mensaje de Audio]' });
          history.push(userHistoryPart);
          history.push({ role: 'model', parts: [{ text: fullResponse }] });
          if (history.length > 40) this.sessions.set(sessionId, history.slice(-40));

          onDone(fullResponse);
          return;
        } catch (err) {
          const errMsg = err.message || '';
          const isModelError = errMsg.includes('not found') || errMsg.includes('404') || errMsg.includes('supported') || errMsg.includes('model');
          const isKeyError = errMsg.includes('key') || errMsg.includes('API_KEY') || errMsg.includes('400') || errMsg.includes('403') || errMsg.includes('unauthorized');
          
          if (isModelError && this.model !== 'gemini-2.5-flash') {
            console.warn(`⚠️ Model '${this.model}' failed in stream. Falling back to stable 'gemini-2.5-flash'...`);
            this.model = 'gemini-2.5-flash';
            this.geminiModel = this.genAI.getGenerativeModel({
              model: this.model,
              systemInstruction: SYSTEM_PROMPT,
            });
            attempt--;
            continue;
          }

          if (isKeyError) {
            console.warn('⚠️ Gemini API Key invalid in stream. Falling back to Demo Mode.');
            this.demoMode = true;
            throw new Error('key_error');
          }

          const isRateLimit = errMsg.includes('429') || errMsg.includes('quota');
          if (isRateLimit && attempt === 0) {
            console.log('⏳ Stream rate limit hit, retrying once in 3s...');
            await new Promise(r => setTimeout(r, 3000));
            continue;
          }
          throw err;
        }
      }
    } catch (err) {
      const errMsg = err.message || '';
      const isRateLimit = errMsg.includes('429') || errMsg.includes('quota');
      const isKeyError = errMsg === 'key_error' || errMsg.includes('key') || errMsg.includes('API_KEY') || errMsg.includes('400') || errMsg.includes('403') || errMsg.includes('unauthorized');
      
      if (isRateLimit || isKeyError) {
        console.warn('⚠️ Falling back to Demo Mode for this request.');
        this.demoMode = true;
        const fallback = await this._demoResponse(userMessage || "audio_message");
        const notice = language === 'en' 
          ? "\n\n*(Note: Running in offline mode due to high traffic)*" 
          : "\n\n*(Nota: Operando en modo offline por alta demanda)*";
        onChunk(fallback + notice);
        onDone(fallback + notice);
      } else {
        console.error('Stream error:', errMsg);
        onError(err);
      }
    }
  }

  async comparePlayers(player1Id, player2Id, language = 'es') {
    const p1 = await Player.findByPk(player1Id);
    const p2 = await Player.findByPk(player2Id);
    if (!p1 || !p2) throw new Error('Player not found');

    const langInstruction = language === 'en'
      ? 'Respond entirely in English.'
      : 'Responde completamente en español.';

    const prompt = `${langInstruction} Compare these two players in detail:
Player 1: ${JSON.stringify(p1)}
Player 2: ${JSON.stringify(p2)}

Provide: overall comparison, who wins in each key attribute, best league fit, ceiling analysis, and a final verdict.`;

    if (this.demoMode) {
      return this._demoComparison(p1, p2);
    }

    try {
      const result = await this.geminiModel.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      console.error("❌ Gemini Comparison Error:", err);
      return this._demoComparison(p1, p2) + '\n\n*⚠️ AI Analysis unavailable due to API rate limits.*';
    }
  }

  async getPredictions(language = 'es') {
    const langInstruction = language === 'en'
      ? 'Respond entirely in English.'
      : 'Responde completamente en español.';

    const prompt = `${langInstruction} Based on the current football season and the player database provided, generate 5 exciting football predictions for the rest of the 2024-25 season. Include: top scorer race, Ballon d\'Or front-runners, surprise performer, transfer rumor prediction, and a bold upset prediction. Be engaging and use real data from the database.`;

    if (this.demoMode) {
      return this._demoPredictions();
    }

    try {
      const result = await this.geminiModel.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      console.error("❌ Gemini Predictions Error:", err);
      return this._demoPredictions() + '\n\n*⚠️ AI Predictions unavailable due to API rate limits.*';
    }
  }

  async expandAlert(alertType, contextData, language = 'es') {
    const langInstruction = language === 'en'
      ? 'Respond entirely in English.'
      : 'Responde completamente en español.';

    const prompt = `${langInstruction} 
Act as a Senior Sporting Director / Chief Analyst for ${contextData.clubName}. 
You are providing a direct, formal executive brief based on this system alert: "${alertType}".
Context Data:
${JSON.stringify(contextData, null, 2)}

Write a highly professional, executive report (max 150 words).
- Format the text following a clean, formal structure (similar to APA style). 
- Use ONLY the following bold headers: **Resumen Ejecutivo:**, **Análisis Técnico:**, and **Recomendación:**.
- Under each header, write a single well-structured paragraph. DO NOT use bullet points or chaotic lists.
- DO NOT use AI pleasantries like "Here is your report" or "As an AI...". Start immediately with the analysis.
- DO NOT invent fake data. Use the exact player name, opponent, and club name provided.
- Tone: Serious, analytical, data-driven, direct, suitable for a Sporting Director.`;

    if (this.demoMode) {
      return `### Análisis Generado\n*Modo offline activo. API de IA no conectada.*\nAlerta: ${alertType}\nDetalles: ${JSON.stringify(contextData)}`;
    }

    try {
      const result = await this.geminiModel.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      console.error('Gemini expandAlert error:', err.message);
      return `⚠️ Error al generar contexto AI: ${err.message}`;
    }
  }

  clearSession(sessionId) {
    this.sessions.delete(sessionId);
  }

  // ─── Demo Fallbacks (no API key) ───────────────────────────────
  async _demoResponse(message) {
    const msg = message.toLowerCase();
    const allPlayers = await Player.findAll({
      attributes: ['id', 'name', 'flag', 'currentTeam', 'league', 'position', 'positionEs', 'overallRating', 'stats', 'bio', 'trophies']
    });
    const found = allPlayers.find(p =>
      msg.includes(p.name.toLowerCase()) ||
      msg.includes(p.id.replace('-', ' '))
    );

    if (found) {
      return `**${found.name}** ${found.flag}\n\n📍 **Club:** ${found.currentTeam} (${found.league})\n🎯 **Position:** ${found.positionEs} / ${found.position}\n⭐ **Rating:** ${found.overallRating}/100\n\n📊 **2024-25 Stats:**\n- Goals: ${found.stats?.goals} in ${found.stats?.matches} matches\n- Assists: ${found.stats?.assists}\n\n📝 ${found.bio}\n\n🏆 **Trophies:** ${found.trophies?.slice(0, 3).join(', ')}\n\n---\n*Demo mode — SQLite database connected.*`;
    }

    return `¡Hola! Soy **FutbolAI** ⚽ — tu experto en fútbol mundial.\n\nActualmente en **modo demo** (sin API key). Puedo darte información sobre jugadores en mi base de datos.\n\nPrueba preguntando sobre: **Haaland, Mbappé, Messi, Ronaldo, Vinicius, Bellingham**, y más.\n\n---\n*Hello! I'm **FutbolAI** ⚽ — your global football expert. Currently in demo mode. Ask me about any top player!*`;
  }

  _demoComparison(p1, p2) {
    return `## ${p1.name} vs ${p2.name}\n\n| Attribute | ${p1.name} | ${p2.name} |\n|---|---|---|\n| Rating | ${p1.overallRating} | ${p2.overallRating} |\n| Goals 24-25 | ${p1.stats.goals} | ${p2.stats.goals} |\n| Assists | ${p1.stats.assists} | ${p2.stats.assists} |\n| Position | ${p1.position} | ${p2.position} |\n| League | ${p1.league} | ${p2.league} |\n\n**${p1.overallRating >= p2.overallRating ? p1.name : p2.name}** edges it overall with a higher rating.\n\n*Connect your Gemini API key for a full AI-powered analysis!*`;
  }

  async _demoPredictions() {
    const topPlayers = await Player.findAll({ order: [['overallRating', 'DESC']], limit: 10 });
    const topScorer = topPlayers[0]; // Simplified
    return `## 🔮 AI Predictions — 2024-25 Season\n\n**1. Top Scorer Race:** ${topScorer.name} ${topScorer.flag} (${topScorer.stats.goals} goals) leads the race and is on track for the golden boot.\n\n**2. Ballon d'Or Front-Runner:** Vinicius Jr. & Bellingham are neck-and-neck for the award after stellar Champions League campaigns.\n\n**3. Surprise Performer:** Lamine Yamal continues to defy his age — don't be surprised to see him nominated for the Ballon d'Or before he turns 20.\n\n**4. Transfer Rumour:** Florian Wirtz is expected to move to a top-6 EPL club this summer in a deal exceeding €150M.\n\n**5. Bold Upset:** Arsenal to win the Premier League title for the first time since the Invincibles era.\n\n*Connect your Gemini API key for dynamic, real-time AI predictions!*`;
  }
}

module.exports = FootballAgent;
