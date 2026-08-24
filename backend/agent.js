const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Player } = require('./database');
const { Op } = require('sequelize');

// Compact system prompt — no player data injected here (keeps token count low)
const SYSTEM_PROMPT = `You are FutbolAI — a world-class football intelligence assistant with deep expertise in global football. You are bilingual: always detect the language the user writes in (Spanish or English) and respond in that same language. If the message is ambiguous, respond in Spanish.

STRICT FORMATTING AND CONTENT RULES:
1. NO EMOJIS ALLOWED: Do NOT use any emojis, emoticons, flag symbols, or decorative icons anywhere in your response. Keep all text completely emoji-free.
2. NO RATINGS ALLOWED: Do NOT include, mention, or calculate numeric "ratings", "overall ratings", or video-game style scores (e.g. NEVER write "Rating: 90/100" or "Overall: 88").
Always describe players qualitatively and strictly through their real-life statistics (goals, assists, matches), tactical qualities, skills, performance, position, and achievements.

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

Be professional, engaging, and expert. Use football terminology naturally.
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
    attributes: ['id', 'name', 'flag', 'currentTeam', 'league', 'position', 'stats', 'bio', 'trophies', 'strengths', 'age', 'nationality']
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
    this.deepseekApiKey = process.env.DEEPSEEK_API_KEY;
    this.deepseekModel = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
    this.geminiApiKey = process.env.GEMINI_API_KEY;
    this.model = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';
    this.sessions = new Map(); // sessionId -> history[]
    
    // In-memory TTL caches for expensive AI operations
    this.predictionsCache = new Map(); // language -> { data, timestamp }
    this.comparisonCache = new Map();  // key -> { data, timestamp }
    this.alertCache = new Map();       // key -> { data, timestamp }
    
    this.isProduction = process.env.NODE_ENV === 'production';
    
    if (this.geminiApiKey && this.geminiApiKey !== 'your_gemini_api_key_here') {
      try {
        this.genAI = new GoogleGenerativeAI(this.geminiApiKey);
        this.geminiModel = this.genAI.getGenerativeModel({
          model: this.model,
          systemInstruction: SYSTEM_PROMPT,
        });
      } catch (err) {
        console.warn('⚠️ Gemini initialization error:', err.message);
      }
    }

    const hasKeys = !!(this.geminiApiKey || this.deepseekApiKey);
    this.demoMode = !hasKeys || (this.geminiApiKey === 'your_gemini_api_key_here' && this.deepseekApiKey === 'your_deepseek_api_key_here');

    // Provider preference: 'gemini' or 'deepseek'
    const prefProvider = (process.env.AI_PROVIDER || process.env.PRIMARY_AI_PROVIDER || '').toLowerCase();
    if (prefProvider === 'gemini') {
      this.primaryProvider = 'gemini';
    } else if (prefProvider === 'deepseek') {
      this.primaryProvider = 'deepseek';
    } else {
      // Default: Prefer Gemini if Gemini API key is available, else DeepSeek
      this.primaryProvider = (this.geminiApiKey && this.geminiApiKey !== 'your_gemini_api_key_here')
        ? 'gemini'
        : 'deepseek';
    }

    console.log(this.demoMode
      ? '⚠️  Demo mode active (no valid API key). Using SQLite database.'
      : (this.isProduction
        ? `🚀 [PRODUCCIÓN] Proveedor primario IA: ${this.primaryProvider.toUpperCase()} (${this.primaryProvider === 'deepseek' ? this.deepseekModel : this.model})`
        : `💻 [LOCAL] Gemini AI primario (${this.model})`)
    );
  }

  async callDeepSeek(prompt, systemInstruction = SYSTEM_PROMPT) {
    if (!this.isProduction) {
      throw new Error('DeepSeek API sólo está disponible en entorno de producción (NODE_ENV=production)');
    }
    const apiKey = this.deepseekApiKey;
    if (!apiKey || apiKey === 'your_deepseek_api_key_here') {
      throw new Error('DEEPSEEK_API_KEY no está configurada o es inválida');
    }
    const model = this.deepseekModel;

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: prompt }
        ],
        temperature: 0.6
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`DeepSeek API error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  async generateText(prompt, systemInstruction = SYSTEM_PROMPT) {
    if (this.demoMode) return null;

    if (this.isProduction) {
      // In Production: DeepSeek primary -> Gemini fallback
      if (this.deepseekApiKey) {
        try {
          console.log(`🤖 [PROD] Generando con DeepSeek API (${this.deepseekModel})...`);
          return await this.callDeepSeek(prompt, systemInstruction);
        } catch (err) {
          console.warn('⚠️ [PROD] Error en DeepSeek API, intentando Gemini fallback:', err.message);
        }
      }
      if (this.geminiModel) {
        try {
          console.log(`🤖 [PROD Fallback] Generando con Gemini API (${this.model})...`);
          const result = await this.geminiModel.generateContent(prompt);
          return result.response.text();
        } catch (err) {
          console.warn('⚠️ [PROD] Error en Gemini API fallback:', err.message);
        }
      }
    } else {
      // In Local: Gemini only
      if (this.geminiModel) {
        try {
          console.log(`🤖 [LOCAL] Generando con Gemini API (${this.model})...`);
          const result = await this.geminiModel.generateContent(prompt);
          return result.response.text();
        } catch (err) {
          console.warn('⚠️ [LOCAL] Error en Gemini API:', err.message);
        }
      }
    }

    return null;
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

    const relevantPlayers = await findRelevantPlayers(userMessage || '');
    const playerContext = relevantPlayers.length
      ? `\n\n[Player DB context]: ${JSON.stringify(relevantPlayers)}`
      : '';

    const userPromptText = langPrefix + (userMessage || 'El usuario ha enviado un mensaje de voz.') + playerContext;

    // Use DeepSeek in Production if no audio is provided
    if (this.isProduction && this.deepseekApiKey && !audioBase64) {
      try {
        console.log(`🤖 [PROD Chat] Enviando consulta a DeepSeek API...`);
        const respText = await this.callDeepSeek(userPromptText, SYSTEM_PROMPT);
        
        history.push({ role: 'user', parts: [{ text: userMessage || '[Audio]' }] });
        history.push({ role: 'model', parts: [{ text: respText }] });
        if (history.length > 40) this.sessions.set(sessionId, history.slice(-40));

        return respText;
      } catch (err) {
        console.warn('⚠️ DeepSeek chat error in PROD, falling back to Gemini:', err.message);
      }
    }

    if (!this.geminiModel) {
      return this._demoResponse(userMessage || "audio_message");
    }

    const messageParts = [];
    messageParts.push({ text: userPromptText });

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

  async chatStream(sessionId, userMessage, language = 'es', audioBase64 = null, mimeType = null, clubContext = null, clubRoster = null, userContext = null, onChunk, onDone, onError) {
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
    const clubRestriction = clubContext ? `\n\n[INSTRUCCIÓN DE CONTEXTO]: Estás operando en el panel del club ${clubContext}. Asume por defecto que todas las preguntas, análisis o peticiones del usuario se referirán al equipo ${clubContext}. Si el usuario hace una pregunta general (ej: '¿quién es mi mejor jugador?' o '¿cómo formamos?'), responde basándote en la plantilla de ${clubContext}.${rosterRestriction}\n\nNota: Si el usuario menciona explícitamente a otro equipo, liga o jugador externo, ESTÁS AUTORIZADO a responder sobre ese otro tema sin restricciones.` : '';
    
    const fullPromptText = langPrefix + clubRestriction + '\n' + (userMessage || 'Mensaje de voz.') + playerContext;

    if (this.isProduction && this.deepseekApiKey) {
      try {
        console.log(`🤖 [PROD ChatStream] Transmitiendo desde DeepSeek API...`);
        const fullResponse = await this.callDeepSeek(fullPromptText, SYSTEM_PROMPT);
        onChunk(fullResponse);

        const userHistoryPart = { role: 'user', parts: [{ text: userMessage || '[Audio]' }] };
        history.push(userHistoryPart);
        history.push({ role: 'model', parts: [{ text: fullResponse }] });
        if (history.length > 40) this.sessions.set(sessionId, history.slice(-40));

        onDone(fullResponse);
        return;
      } catch (err) {
        console.warn('⚠️ DeepSeek chatStream error in PROD, falling back to Gemini:', err.message);
      }
    }

    if (!this.geminiModel) {
      const resp = await this._demoResponse(userMessage || "audio_message");
      onChunk(resp);
      onDone(resp);
      return;
    }

    const messageParts = [{ text: fullPromptText }];
    
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
          const userHistoryPart = { role: 'user', parts: [{ text: userMessage || '[Audio]' }] };
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
            console.warn('⚠️ Gemini API Key invalid. Falling back to Demo Mode.');
            const resp = await this._demoResponse(userMessage);
            onChunk(resp);
            onDone(resp);
            return;
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
      console.warn('⚠️ AI Engine exception in chatStream, serving intelligent database response:', errMsg);
      try {
        const fallback = await this._demoResponse(userMessage || "audio_message");
        onChunk(fallback);
        onDone(fallback);
      } catch (fallbackErr) {
        console.error('Stream fallback error:', fallbackErr.message);
        const errText = language === 'en'
          ? 'An error occurred while generating the AI response. Please try again in a moment.'
          : 'Ocurrió una incidencia al procesar la respuesta. Por favor intenta nuevamente en unos momentos.';
        onChunk(errText);
        onDone(errText);
      }
    }
  }

  // ─── Shared ground-truth calculator, used by BOTH the AI prompt and the
  // offline/demo report — so the two paths can never disagree on the numbers,
  // the per-row winner, or the overall verdict. Only the surrounding prose
  // (summary, fit, ceiling paragraphs) is generated separately per path.
  _buildComparisonCriteria(p1, p2) {
    const higherWins = (a, b) => {
      const numA = Number(a) || 0;
      const numB = Number(b) || 0;
      if (numA > numB) return 1;
      if (numB > numA) return 2;
      return 0;
    };
    const lowerWins = (a, b) => {
      const numA = Number(a) || 0;
      const numB = Number(b) || 0;
      if (numA < numB) return 1;
      if (numB < numA) return 2;
      return 0;
    };

    const contrib = (p) => (p.stats && p.stats.matches > 0) ? (((p.stats.goals || 0) + (p.stats.assists || 0)) / p.stats.matches) : 0;
    const p1Contrib = contrib(p1);
    const p2Contrib = contrib(p2);

    const p1Short = (p1.name || '').split(' ').pop() || p1.name;
    const p2Short = (p2.name || '').split(' ').pop() || p2.name;

    const rows = [
      { label: 'Goles temporada', v1: p1.stats?.goals ?? 0, v2: p2.stats?.goals ?? 0, w: higherWins(p1.stats?.goals ?? 0, p2.stats?.goals ?? 0) },
      { label: 'Asistencias', v1: p1.stats?.assists ?? 0, v2: p2.stats?.assists ?? 0, w: higherWins(p1.stats?.assists ?? 0, p2.stats?.assists ?? 0) },
      { label: 'G+A / partido', v1: p1Contrib.toFixed(2), v2: p2Contrib.toFixed(2), w: higherWins(p1Contrib, p2Contrib) },
      { label: 'Partidos jugados', v1: p1.stats?.matches ?? 0, v2: p2.stats?.matches ?? 0, w: higherWins(p1.stats?.matches ?? 0, p2.stats?.matches ?? 0) },
      { label: 'Goles carrera', v1: p1.careerTotals?.goals ?? (p1.stats?.goals ?? 0), v2: p2.careerTotals?.goals ?? (p2.stats?.goals ?? 0), w: higherWins(p1.careerTotals?.goals ?? (p1.stats?.goals ?? 0), p2.careerTotals?.goals ?? (p2.stats?.goals ?? 0)) },
      { label: 'Trofeos', v1: p1.trophies?.length ?? 0, v2: p2.trophies?.length ?? 0, w: higherWins(p1.trophies?.length ?? 0, p2.trophies?.length ?? 0) },
      { label: 'Amarillas', v1: p1.stats?.yellowCards ?? 0, v2: p2.stats?.yellowCards ?? 0, w: lowerWins(p1.stats?.yellowCards ?? 0, p2.stats?.yellowCards ?? 0) },
      { label: 'Valor mercado', v1: `${(p1.marketValue / 1000000).toFixed(0)}M€`, v2: `${(p2.marketValue / 1000000).toFixed(0)}M€`, w: higherWins(p1.marketValue, p2.marketValue) },
    ];

    const p1Wins = rows.filter(r => r.w === 1).length;
    const p2Wins = rows.filter(r => r.w === 2).length;
    const overallWinner = p1Wins === p2Wins ? null : (p1Wins > p2Wins ? p1Short : p2Short);
    const loser = overallWinner ? (overallWinner === p1Short ? p2Short : p1Short) : null;
    const winnerRows = overallWinner ? rows.filter(r => (overallWinner === p1Short ? r.w === 1 : r.w === 2)) : [];
    const loserRows = overallWinner ? rows.filter(r => (overallWinner === p1Short ? r.w === 2 : r.w === 1)) : [];
    const decidingRow = overallWinner ? [...rows].reverse().find(r => r.w === (overallWinner === p1Short ? 1 : 2)) : null;

    // Natural Spanish list join: "a, b y c" instead of "a y b y c"
    const naturalJoin = (items) => {
      if (items.length === 0) return 'ningún criterio claro';
      if (items.length === 1) return items[0];
      return `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`;
    };

    const getWinnerLabel = (w) => {
      if (w === 1) return p1Short;
      if (w === 2) return p2Short;
      return 'Empate';
    };

    const tableMarkdown = `| Criterio | ${p1Short} | ${p2Short} | Gana |\n|---|---|---|---|\n` +
      rows.map(r => `| ${r.label} | ${r.v1} | ${r.v2} | ${getWinnerLabel(r.w)} |`).join('\n');

    return { rows, tableMarkdown, p1Wins, p2Wins, overallWinner, loser, winnerRows, loserRows, decidingRow, naturalJoin, p1Short, p2Short };
  }

  async comparePlayers(player1Id, player2Id, language = 'es') {
    const p1 = await Player.findByPk(player1Id);
    const p2 = await Player.findByPk(player2Id);
    if (!p1 || !p2) throw new Error('Player not found');

    // Ground truth computed once — same numbers, same per-row winner, same
    // overall verdict feed both the AI prompt below and the offline fallback.
    const criteria = this._buildComparisonCriteria(p1, p2);

    const langInstruction = language === 'en'
      ? 'Respond entirely in English.'
      : 'Responde completamente en español.';

    const headers = language === 'en'
      ? {
          summary: '📋 Executive Summary',
          attrs: '⚔️ Attribute-by-Attribute Duel',
          verdict: '🏆 Final Verdict'
        }
      : {
          summary: '📋 Resumen Ejecutivo',
          attrs: '⚔️ Duelo por Atributos',
          verdict: '🏆 Veredicto Final'
        };

    const verdictFacts = criteria.overallWinner
      ? `The winner is ${criteria.overallWinner} (won ${criteria.overallWinner === p1.name ? criteria.p1Wins : criteria.p2Wins} of ${criteria.rows.length} criteria). The criteria ${criteria.overallWinner} won: ${criteria.winnerRows.map(r => r.label).join('; ')}. The deciding/most important row is "${criteria.decidingRow.label}" (${criteria.decidingRow.v1} vs ${criteria.decidingRow.v2}). The criteria ${criteria.loser} won instead: ${criteria.loserRows.map(r => r.label).join('; ')}.`
      : `It is a tie: ${criteria.p1Wins}-${criteria.p2Wins} criteria won each. ${p1.name} won: ${criteria.rows.filter(r => r.w === 1).map(r => r.label).join('; ') || 'none'}. ${p2.name} won: ${criteria.rows.filter(r => r.w === 2).map(r => r.label).join('; ') || 'none'}.`;

    const prompt = `${langInstruction} You are writing a scouting report comparing two players. Follow this EXACT structure — same section headers, same order, every time — so the report is consistent and easy to scan. Every paragraph must cite concrete data from the player objects below (real numbers, named trophies, actual transfer fees/clubs, named strengths) — never vague filler like "he is a great player":

## ${headers.summary}
One paragraph (3-4 sentences) framing the comparison: nationality (flag), age, current club, and one named strength each (from the strengths array) that defines their game.

## ${headers.attrs}
Reproduce EXACTLY this markdown table, unchanged (it is already computed from real stats — do not recalculate, re-sort, or re-decide any winner):

${criteria.tableMarkdown}

## ${headers.verdict}
Write two parts, in this order, and base them strictly on these precomputed facts — do not recount or contradict them: ${verdictFacts}
1. A bold one-line headline sentence: "**Veredicto: [Winner] gana el duelo.**" (or "**Veredicto: empate técnico.**" if tied).
2. An explanatory paragraph (4-5 sentences) that: names exactly which criteria rows the winner took (from the facts above) and why those matter most for a modern player in their position; explicitly acknowledges the specific criteria the loser won and what that strength is worth in practice; and closes with a concrete, practical takeaway framed as a recommendation (e.g. which player fits better for a team prioritizing physical dominance vs. one prioritizing pace/creativity, or which is the safer investment given age and trend). Do not justify the verdict by citing a generic rating.

Do not add extra sections, do not skip a section, and do not use any headers other than the three above. Do not use pleasantries or a preamble — start directly with "## ${headers.summary}".

Player 1: ${JSON.stringify(p1)}
Player 2: ${JSON.stringify(p2)}`;

    if (this.demoMode) {
      return this._demoComparison(p1, p2, criteria);
    }

    const cacheKey = `${p1.id}_${p2.id}_${language}`;
    const NOW = Date.now();
    const CACHE_TTL = 60 * 60 * 1000; // 1 hora de caché
    const cached = this.comparisonCache.get(cacheKey);
    if (cached && (NOW - cached.timestamp < CACHE_TTL)) {
      console.log(`⚡ [CACHÉ] Retornando comparación (${cacheKey}) sin consumir API`);
      return cached.data;
    }

    let resultText = null;

    if (this.primaryProvider === 'deepseek' && this.isProduction && this.deepseekApiKey) {
      try {
        console.log(`🤖 Generando análisis comparativo con DeepSeek API (${this.deepseekModel})...`);
        resultText = await this.callDeepSeek(prompt, SYSTEM_PROMPT);
      } catch (err) {
        console.warn('⚠️ DeepSeek API error en comparación, intentando Gemini fallback:', err.message);
      }
    }

    if (!resultText && this.geminiModel) {
      try {
        console.log(`🤖 Generando análisis comparativo con Gemini API (${this.model})...`);
        const result = await this.geminiModel.generateContent(prompt);
        resultText = result.response.text();
      } catch (err) {
        console.warn('⚠️ Gemini API error en comparación:', err.message);
      }
    }

    if (!resultText && this.primaryProvider === 'gemini' && this.isProduction && this.deepseekApiKey) {
      try {
        console.log(`🤖 Generando análisis comparativo con DeepSeek API fallback (${this.deepseekModel})...`);
        resultText = await this.callDeepSeek(prompt, SYSTEM_PROMPT);
      } catch (err) {
        console.warn('⚠️ DeepSeek API fallback error en comparación:', err.message);
      }
    }

    if (resultText) {
      this.comparisonCache.set(cacheKey, { data: resultText, timestamp: NOW });
      return resultText;
    }

    return this._demoComparison(p1, p2, criteria);
  }

  async getPredictions(language = 'es') {
    return this._demoPredictions();
  }

  async expandAlert(alertType, contextData, language = 'es') {
    if (this.demoMode) {
      return 'Reporte en modo demo.';
    }

    const clubName = (contextData && contextData.clubName) || 'el equipo';
    const pName = (contextData && contextData.pName) || 'el jugador';
    const cacheKey = `${alertType}_${pName}_${clubName}_${language}`;
    const NOW = Date.now();
    const CACHE_TTL = 60 * 60 * 1000; // 1 hora de caché
    const cached = this.alertCache.get(cacheKey);
    if (cached && (NOW - cached.timestamp < CACHE_TTL)) {
      console.log(`⚡ [CACHÉ] Retornando reporte de alerta sin consumir API`);
      return cached.data;
    }

    const langInstruction = language === 'en'
      ? 'Respond entirely in English.'
      : 'Responde completamente en español.';

    const nextOpp = (contextData && contextData.nextOpp) || 'el rival';

    const prompt = `${langInstruction} 
Act as a Senior Sporting Director / Chief Analyst for ${clubName}. 
You are providing a direct, formal executive brief based on this system alert: "${alertType}".
Context Data:
${JSON.stringify(contextData, null, 2)}

Write a highly professional, executive report (max 150 words).
Use EXACTLY these three bold headers:
**Resumen Ejecutivo:**
[Executive summary paragraph analyzing real data for player ${pName} of ${clubName} ahead of match vs ${nextOpp}]

**Puntos Clave del Análisis:**
- Carga: [Real min vs squad baseline, e.g. 290 min vs 254 min (+14.2%)]
- Sprint: [Real sprint distance vs personal baseline, e.g. 801 m vs 900 m (-11.0%)]
- Recuperación: [Real rest days vs medical baseline, e.g. 1.5 days vs 3.0 days (-50.0%)]

**Recomendación:**
[Actionable recommendation for ${pName} and ${clubName}]

- Every analytical point MUST include explicit quantitative baseline comparisons (e.g. current vs baseline value and exact percentage change like "290 min vs 254 min squad baseline (+14.2%)"). NEVER state a metric change without giving the baseline value.
- DO NOT use video game acronyms or attributes (e.g. DO NOT write OVR, POT, Pace, Dribbling). Use real sporting terminology only.
- DO NOT use em-dashes '—' or complex dashes. Write clear, simple, and direct professional sentences.
- Each item under "Puntos Clave del Análisis" MUST be a single line starting with "- Label: Value". Do not split a point into multiple lines.
- DO NOT invent fake data. Use the exact player name, opponent, and club name provided.
- Tone: Serious, highly analytical, data-driven, persuasive, suitable for a Sporting Director.`;

    let resultText = null;

    if (this.primaryProvider === 'deepseek' && this.isProduction && this.deepseekApiKey) {
      try {
        console.log(`🤖 Generando reporte de alerta con DeepSeek API (${this.deepseekModel})...`);
        resultText = await this.callDeepSeek(prompt, SYSTEM_PROMPT);
      } catch (err) {
        console.warn('⚠️ DeepSeek API error en expandAlert, intentando Gemini fallback:', err.message);
      }
    }

    if (!resultText && this.geminiModel) {
      try {
        console.log(`🤖 Generando reporte de alerta con Gemini API...`);
        const result = await this.geminiModel.generateContent(prompt);
        resultText = result.response.text();
      } catch (err) {
        console.warn('⚠️ Gemini API error en expandAlert:', err.message);
      }
    }

    if (!resultText && this.primaryProvider === 'gemini' && this.isProduction && this.deepseekApiKey) {
      try {
        console.log(`🤖 Generando reporte de alerta con DeepSeek API fallback (${this.deepseekModel})...`);
        resultText = await this.callDeepSeek(prompt, SYSTEM_PROMPT);
      } catch (err) {
        console.warn('⚠️ DeepSeek API fallback error en expandAlert:', err.message);
      }
    }

    if (resultText) {
      this.alertCache.set(cacheKey, { data: resultText, timestamp: NOW });
      return resultText;
    }

    return 'Análisis en proceso. Por favor reintenta en unos instantes.';
  }

  clearSession(sessionId) {
    this.sessions.delete(sessionId);
  }

  // ─── Demo Fallbacks (no API key) ───────────────────────────────
  async _demoResponse(message) {
    const msg = (message || '').toLowerCase();
    const allPlayers = await Player.findAll({
      attributes: ['id', 'name', 'currentTeam', 'league', 'position', 'positionEs', 'stats', 'bio', 'trophies']
    });

    const isTopList = msg.includes('top') || msg.includes('mejores') || msg.includes('mencioname') || msg.includes('dame') || msg.includes('lista') || msg.includes('jugadores');
    
    let positionFilter = null;
    if (msg.includes('extremo derecho') || msg.includes('extremos derechos') || msg.includes('rw') || msg.includes('banda derecha')) {
      positionFilter = ['RW', 'RM', 'Extremo Derecho', 'ED', 'Derecho'];
    } else if (msg.includes('extremo izquierdo') || msg.includes('extremos izquierdos') || msg.includes('lw') || msg.includes('lm')) {
      positionFilter = ['LW', 'LM', 'Extremo Izquierdo', 'EI', 'Izquierdo'];
    } else if (msg.includes('delantero') || msg.includes('delanteros') || msg.includes('st') || msg.includes('atacante')) {
      positionFilter = ['ST', 'CF', 'DC', 'DEL', 'Delantero'];
    } else if (msg.includes('mediocampista') || msg.includes('centrocampista') || msg.includes('medio')) {
      positionFilter = ['CM', 'CAM', 'CDM', 'MC', 'MCD', 'MCO'];
    } else if (msg.includes('defensa') || msg.includes('central') || msg.includes('lateral')) {
      positionFilter = ['CB', 'LB', 'RB', 'DFC', 'DFI', 'DFD'];
    } else if (msg.includes('portero') || msg.includes('arquero') || msg.includes('gk')) {
      positionFilter = ['GK', 'POR', 'PO'];
    }

    if (isTopList || positionFilter) {
      let filtered = allPlayers;
      if (positionFilter) {
        filtered = allPlayers.filter(p => positionFilter.some(pos => (p.position || '').toUpperCase().includes(pos) || (p.positionEs || '').toLowerCase().includes(pos.toLowerCase())));
      }
      const topList = filtered.slice(0, 10);

      if (topList.length > 0) {
        const titlePos = positionFilter ? 'Top Jugadores en la posición solicitada' : 'Top 10 Jugadores Destacados';
        let resText = `**${titlePos} (Base de Datos FutbolAI):**\n\n`;
        topList.forEach((p, idx) => {
          const statsStr = p.stats ? ` (Goles: ${p.stats.goals || 0}, Asistencias: ${p.stats.assists || 0})` : '';
          resText += `**${idx + 1}. ${p.name}** — *${p.currentTeam}* | Posición: ${p.positionEs || p.position}${statsStr}\n`;
        });
        return resText;
      }
    }

    const found = allPlayers.find(p =>
      msg.includes(p.name.toLowerCase()) ||
      msg.includes(p.id.replace('-', ' '))
    );

    if (found) {
      return `**${found.name}**\n\n- **Club:** ${found.currentTeam} (${found.league})\n- **Posición:** ${found.positionEs || found.position}\n\n**Estadísticas 2024-25:**\n- Goles: ${found.stats?.goals || 0} en ${found.stats?.matches || 0} partidos\n- Asistencias: ${found.stats?.assists || 0}\n\n**Descripción:** ${found.bio || 'Jugador destacado en el fútbol mundial.'}\n\n**Palmarés:** ${(found.trophies || []).slice(0, 3).join(', ') || 'N/A'}`;
    }

    const top5 = [...allPlayers].slice(0, 5);
    let generalRes = `Hola, soy FutbolAI — tu asistente inteligente de fútbol mundial.\n\nAquí tienes algunos de los jugadores más destacados de nuestra base de datos:\n\n`;
    top5.forEach((p, i) => {
      generalRes += `**${i+1}. ${p.name}** (${p.currentTeam}) — Posición: ${p.positionEs || p.position}\n`;
    });
    generalRes += `\n*Puedes preguntarme sobre cualquier jugador, equipo o posición de fútbol.*`;
    return generalRes;
  }

  _demoComparison(p1, p2, criteria = null) {
    const { rows, tableMarkdown, p1Wins, p2Wins, overallWinner, loser, winnerRows, loserRows, decidingRow, naturalJoin, p1Short, p2Short } =
      criteria || this._buildComparisonCriteria(p1, p2);

    const getFlagEmoji = (countryCode) => {
      if (!countryCode) return '';
      if (countryCode.length === 2) {
        const codePoints = countryCode
          .toUpperCase()
          .split('')
          .map(char => 127397 + char.charCodeAt(0));
        return ' ' + String.fromCodePoint(...codePoints);
      }
      return countryCode.length <= 4 ? ` ${countryCode}` : '';
    };

    const strengths2 = (p) => {
      const arr = (p.strengths || []).map(s => String(s).toLowerCase());
      if (arr.length === 0) return 'su regularidad';
      if (arr.length === 1) return arr[0];
      return `${arr[0]} y ${arr[1]}`;
    };

    const verdictText = overallWinner
      ? `**Veredicto: ${overallWinner} gana el duelo.**\n\n${overallWinner} se impone en ${naturalJoin(winnerRows.map(r => r.label.toLowerCase()))} — con ${decidingRow ? `"${decidingRow.label.toLowerCase()}" (${decidingRow.v1} vs ${decidingRow.v2})` : 'su rendimiento'} como el dato que más pesa. Sin embargo, ${loser} sigue siendo superior en ${naturalJoin(loserRows.map(r => r.label.toLowerCase()))}. En la práctica: si el sistema prioriza los criterios donde ${overallWinner} manda, es la opción más segura; si se valora más la eficiencia goleadora pura, la balanza puede inclinarse hacia ${loser}.`
      : `**Veredicto: empate técnico.**\n\nEl duelo queda empatado ${p1Wins}-${p2Wins} en los criterios evaluados — ${p1Short} destaca en ${naturalJoin(rows.filter(r => r.w === 1).map(r => r.label.toLowerCase()))}, mientras ${p2Short} lo hace en ${naturalJoin(rows.filter(r => r.w === 2).map(r => r.label.toLowerCase()))}. Ninguno domina claramente al otro.`;

    return `## 📋 Resumen Ejecutivo\n${p1.name}${getFlagEmoji(p1.flag)} (${p1.age} años, ${p1.currentTeam}) destaca por ${strengths2(p1)}, mientras que ${p2.name}${getFlagEmoji(p2.flag)} (${p2.age} años, ${p2.currentTeam}) se apoya en ${strengths2(p2)}. Ambos ocupan la posición de delantero y llegan a esta comparación en plena competencia por el estatus de mejor delantero del momento.\n\n## ⚔️ Duelo por Atributos\n${tableMarkdown}\n\n## 🏆 Veredicto Final\n${verdictText}`;
  }

  async _demoPredictions() {
    const topPlayers = await Player.findAll({ order: [['overallRating', 'DESC']], limit: 10 });
    const topScorer = topPlayers[0]; // Simplified
    return `## 🔮 AI Predictions — 2024-25 Season\n\n**1. Top Scorer Race:** ${topScorer.name} ${topScorer.flag} (${topScorer.stats.goals} goals) leads the race and is on track for the golden boot.\n\n**2. Ballon d'Or Front-Runner:** Vinicius Jr. & Bellingham are neck-and-neck for the award after stellar Champions League campaigns.\n\n**3. Surprise Performer:** Lamine Yamal continues to defy his age — don't be surprised to see him nominated for the Ballon d'Or before he turns 20.\n\n**4. Transfer Rumour:** Florian Wirtz is expected to move to a top-6 EPL club this summer in a deal exceeding €150M.\n\n**5. Bold Upset:** Arsenal to win the Premier League title for the first time since the Invincibles era.`;
  }
}

module.exports = FootballAgent;
