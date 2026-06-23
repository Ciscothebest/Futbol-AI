/* ════════════════════════════════════════════
   FUTBOLAI — Offline SQLite/LocalStorage Database Engine
   ════════════════════════════════════════════ */

(function() {
  // Seed initial superstars database in LocalStorage if not present
  const SEED_PLAYERS = [
    {
      id: "superstar_1",
      name: "Erling Haaland",
      currentTeam: "Manchester City",
      league: "Premier League",
      position: "ST",
      positionEs: "DC",
      overallRating: 91,
      marketValue: 180000000,
      salary: 22000000,
      contractUntil: 2027,
      nationality: "Noruego",
      flag: "🇳🇴",
      age: 24,
      height: "195 cm",
      weight: "88 kg",
      foot: "Izquierdo",
      avatarUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=ErlingHaaland&backgroundColor=0d1117",
      bio: "Delantero centro de clase mundial, conocido por su increíble ritmo de goles, potencia física y desmarques letales en el área.",
      stats: { goals: 28, assists: 5, matches: 26, yellowCards: 2 },
      history: [{ season: "2024/25", goals: 28, assists: 5, matches: 26 }]
    },
    {
      id: "superstar_2",
      name: "Kylian Mbappé",
      currentTeam: "Real Madrid",
      league: "La Liga",
      position: "LW",
      positionEs: "EI",
      overallRating: 91,
      marketValue: 180000000,
      salary: 26000000,
      contractUntil: 2029,
      nationality: "Francés",
      flag: "🇫🇷",
      age: 25,
      height: "178 cm",
      weight: "75 kg",
      foot: "Derecho",
      avatarUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=KylianMbappe&backgroundColor=0d1117",
      bio: "Uno de los extremos más veloces del planeta. Capaz de desbordar por banda o definir en diagonal con extrema precisión.",
      stats: { goals: 21, assists: 7, matches: 24, yellowCards: 1 },
      history: [{ season: "2024/25", goals: 21, assists: 7, matches: 24 }]
    },
    {
      id: "superstar_3",
      name: "Jude Bellingham",
      currentTeam: "Real Madrid",
      league: "La Liga",
      position: "AM",
      positionEs: "MCO",
      overallRating: 90,
      marketValue: 150000000,
      salary: 20000000,
      contractUntil: 2029,
      nationality: "Inglés",
      flag: "🇬🇧",
      age: 21,
      height: "186 cm",
      weight: "75 kg",
      foot: "Derecho",
      avatarUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=JudeBellingham&backgroundColor=0d1117",
      bio: "Mediocampista todoterreno con llegada explosiva de segunda línea. Visión de juego, técnica superior y liderazgo excepcional.",
      stats: { goals: 12, assists: 11, matches: 25, yellowCards: 4 },
      history: [{ season: "2024/25", goals: 12, assists: 11, matches: 25 }]
    },
    {
      id: "superstar_4",
      name: "Vinícius Júnior",
      currentTeam: "Real Madrid",
      league: "La Liga",
      position: "LW",
      positionEs: "EI",
      overallRating: 90,
      marketValue: 150000000,
      salary: 20000000,
      contractUntil: 2028,
      nationality: "Brasileño",
      flag: "🇧🇷",
      age: 24,
      height: "176 cm",
      weight: "73 kg",
      foot: "Derecho",
      avatarUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=ViniciusJunior&backgroundColor=0d1117",
      bio: "Extremo desequilibrante con gambeta vertical inigualable. Clave en transiciones y situaciones de uno contra uno.",
      stats: { goals: 18, assists: 9, matches: 27, yellowCards: 5 },
      history: [{ season: "2024/25", goals: 18, assists: 9, matches: 27 }]
    },
    {
      id: "superstar_5",
      name: "Lamine Yamal",
      currentTeam: "FC Barcelona",
      league: "La Liga",
      position: "RW",
      positionEs: "ED",
      overallRating: 82,
      marketValue: 120000000,
      salary: 6000000,
      contractUntil: 2026,
      nationality: "Español",
      flag: "🇪🇸",
      age: 17,
      height: "178 cm",
      weight: "66 kg",
      foot: "Izquierdo",
      avatarUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=LamineYamal&backgroundColor=0d1117",
      bio: "La mayor joya surgida de La Masía en la última década. Visión, regate clásico y madurez impropia de su edad.",
      stats: { goals: 8, assists: 14, matches: 28, yellowCards: 0 },
      history: [{ season: "2024/25", goals: 8, assists: 14, matches: 28 }]
    },
    {
      id: "superstar_6",
      name: "Lionel Messi",
      currentTeam: "Inter Miami CF",
      league: "MLS",
      position: "CF",
      positionEs: "DC",
      overallRating: 88,
      marketValue: 30000000,
      salary: 18000000,
      contractUntil: 2025,
      nationality: "Argentino",
      flag: "🇦🇷",
      age: 37,
      height: "170 cm",
      weight: "72 kg",
      foot: "Izquierdo",
      avatarUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=LionelMessi&backgroundColor=0d1117",
      bio: "Considerado el mejor jugador de la historia. Creatividad absoluta, pases milimétricos y definición perfecta en cualquier escenario.",
      stats: { goals: 19, assists: 16, matches: 22, yellowCards: 1 },
      history: [{ season: "2024/25", goals: 19, assists: 16, matches: 22 }]
    },
    {
      id: "superstar_7",
      name: "Cristiano Ronaldo",
      currentTeam: "Al-Nassr FC",
      league: "Saudi Pro League",
      position: "ST",
      positionEs: "DC",
      overallRating: 86,
      marketValue: 15000000,
      salary: 200000000,
      contractUntil: 2025,
      nationality: "Portugués",
      flag: "🇵🇹",
      age: 39,
      height: "187 cm",
      weight: "83 kg",
      foot: "Derecho",
      avatarUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=CristianoRonaldo&backgroundColor=0d1117",
      bio: "Leyenda viviente del fútbol mundial. Un goleador insaciable con una ética de trabajo impecable y un remate de cabeza dominante.",
      stats: { goals: 23, assists: 4, matches: 25, yellowCards: 2 },
      history: [{ season: "2024/25", goals: 23, assists: 4, matches: 25 }]
    },
    {
      id: "superstar_8",
      name: "Kevin De Bruyne",
      currentTeam: "Manchester City",
      league: "Premier League",
      position: "CM",
      positionEs: "MC",
      overallRating: 90,
      marketValue: 60000000,
      salary: 21000000,
      contractUntil: 2025,
      nationality: "Belga",
      flag: "🇧🇪",
      age: 33,
      height: "181 cm",
      weight: "75 kg",
      foot: "Derecho",
      avatarUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=KevinDeBruyne&backgroundColor=0d1117",
      bio: "El asistente de juego definitivo. Visión periférica total y centros cruzados que son prácticamente pases de gol.",
      stats: { goals: 6, assists: 18, matches: 23, yellowCards: 3 },
      history: [{ season: "2024/25", goals: 6, assists: 18, matches: 23 }]
    }
  ];

  if (!localStorage.getItem('futbolai_players_db')) {
    localStorage.setItem('futbolai_players_db', JSON.stringify(SEED_PLAYERS));
  }

  if (!localStorage.getItem('futbolai_users_db')) {
    const defaultUsers = [
      {
        username: "admin",
        password: "admin",
        nombres: "Scout Principal",
        apellidos: "FutbolAI",
        email: "admin@futbolai.com",
        telefono: "+34 600 000 000",
        onboardingComplete: false
      }
    ];
    localStorage.setItem('futbolai_users_db', JSON.stringify(defaultUsers));
  }

  // Helper: check active custom developer server
  function isDeveloperModeActive() {
    return !!localStorage.getItem('futbolai_backend_ip');
  }

  // Intercept window.fetch API Requests for Offline Self-Contained Mobile usage
  const originalFetch = window.fetch;
  window.fetch = async function(url, options) {
    const urlStr = typeof url === 'string' ? url : url.url;
    
    // Only intercept if we are on file:// protocol AND developer IP mode is NOT active!
    const isLocalAsset = window.location.protocol === 'file:';
    const isTargetApi = urlStr.includes('/api') || urlStr.includes('10.0.2.2:3001') || urlStr.includes('localhost:3001');

    if (isLocalAsset && isTargetApi && !isDeveloperModeActive()) {
      return handleOfflineMockRequest(urlStr, options);
    }
    return originalFetch.apply(this, arguments);
  };

  // Mock API Route Router
  async function handleOfflineMockRequest(url, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    const headers = options.headers || {};
    let body = {};
    if (options.body) {
      try {
        body = JSON.parse(options.body);
      } catch(e) {}
    }

    console.log(`[Offline DB Interceptor] Routing endpoint: ${method} ${url}`);

    // Route: Health
    if (url.includes('/api/health')) {
      const players = JSON.parse(localStorage.getItem('futbolai_players_db') || '[]');
      return makeJsonResponse(200, {
        status: "ok",
        players: players.length,
        offlineMode: true,
        database: "LocalStorage/SQLite Sim"
      });
    }

    // Route: Auth Login
    if (url.includes('/api/auth/login')) {
      const users = JSON.parse(localStorage.getItem('futbolai_users_db') || '[]');
      const match = users.find(u => u.username === body.username && u.password === body.password);
      if (match) {
        return makeJsonResponse(200, {
          token: "offline_token_" + Date.now(),
          user: match
        });
      } else {
        // Dev Fallback: allow any login during offline local simulator testing!
        const newUser = {
          username: body.username || "Scout",
          nombres: body.username || "Scout",
          apellidos: "Invitado",
          onboardingComplete: false,
          selectedTier: "Pro"
        };
        users.push(newUser);
        localStorage.setItem('futbolai_users_db', JSON.stringify(users));
        return makeJsonResponse(200, {
          token: "offline_token_generated",
          user: newUser
        });
      }
    }

    // Route: Auth Register
    if (url.includes('/api/auth/register')) {
      const users = JSON.parse(localStorage.getItem('futbolai_users_db') || '[]');
      const exists = users.some(u => u.username === body.username);
      if (exists) {
        return makeJsonResponse(400, { error: "El usuario ya existe" });
      }
      const newUser = {
        username: body.username,
        password: body.password,
        nombres: body.nombres,
        apellidos: body.apellidos,
        telefono: body.telefono,
        email: body.email,
        onboardingComplete: false
      };
      users.push(newUser);
      localStorage.setItem('futbolai_users_db', JSON.stringify(users));
      return makeJsonResponse(200, { success: true });
    }

    // Route: Onboarding Completed
    if (url.includes('/api/auth/onboarding')) {
      return makeJsonResponse(200, { success: true });
    }

    // Route: Fetch Players List
    if (url.includes('/api/players')) {
      const players = JSON.parse(localStorage.getItem('futbolai_players_db') || '[]');
      return makeJsonResponse(200, { players });
    }

    // Route: Profile Stats
    if (url.includes('/api/profile/stats')) {
      const queries = parseInt(localStorage.getItem('futbolai_stat_queries') || '28');
      const compared = parseInt(localStorage.getItem('futbolai_stat_compared') || '14');
      return makeJsonResponse(200, { queries, compared });
    }

    // Route: Transaction / Payment History
    if (url.includes('/api/payments/history')) {
      const history = JSON.parse(localStorage.getItem('futbolai_payments_history') || '[]');
      return makeJsonResponse(200, { payments: history });
    }

    // Route: Checkout
    if (url.includes('/api/payments/checkout')) {
      const history = JSON.parse(localStorage.getItem('futbolai_payments_history') || '[]');
      const newTxn = {
        id: "TXN-" + Math.floor(Math.random()*90000000 + 10000000),
        date: new Date().toISOString(),
        tier: body.tier || "Pro",
        amount: body.tier === 'Premium' ? "$19.99" : "$9.99",
        cardholder: body.cardholder || "Lionel Messi",
        cardEnding: "7890"
      };
      history.unshift(newTxn);
      localStorage.setItem('futbolai_payments_history', JSON.stringify(history));
      return makeJsonResponse(200, { success: true, txn: newTxn });
    }

    // Route: Expand alert / report
    if (url.includes('/api/alert/expand')) {
      return makeJsonResponse(200, {
        report: `### INFORME TÁCTICO EJECUTIVO

Análisis completado para **${body.contextData?.clubName || 'Tu Club'}** frente a su próximo rival, **${body.contextData?.nextOpp || 'Rival'}**.

#### 📋 Resumen del Escenario:
1. **Prevención de Lesiones:** El jugador principal **${body.contextData?.pName || 'Estrella'}** presenta niveles elevados de carga acumulada en el sóleo, lo que aumenta un 45% el riesgo de contractura bajo intensidades altas.
2. **Recomendación del Scout:** El analista táctico aconseja la inclusión progresiva del juvenil talentoso **${body.contextData?.talentName || 'Joven Promesa'}** para compensar la fatiga del primer equipo.

#### 🛠️ Instrucciones del Cuerpo Técnico:
- **Estrategia:** Priorizar la posesión defensiva en campo propio para retardar las transiciones del rival.
- **Carga de Minutos:** Limitar a **${body.contextData?.pName || 'Estrella'}** a un máximo de 60 minutos o dosificar en bloque bajo.`
      });
    }

    // Route: Compare Players
    if (url.includes('/api/compare')) {
      const p1 = body.player1;
      const p2 = body.player2;
      return makeJsonResponse(200, {
        analysis: `### 🤖 ANÁLISIS COMPARATIVO DE INTELIGENCIA ARTIFICIAL

Comparativa ejecutada entre **${p1.name}** (${p1.currentTeam}) y **${p2.name}** (${p2.currentTeam}).

#### 📊 Resumen Ejecutivo:
- **Calificaciones Generales:** ${p1.name} lidera con un OVR de **${p1.overallRating}** frente al **${p2.overallRating}** de ${p2.name}.
- **Aportación Goleadora (2024-25):** ${p1.name} registra **${p1.stats?.goals || 0} goles** en comparación con los **${p2.stats?.goals || 0} goles** de ${p2.name}.
- **Vencimiento de Contrato:** El contrato de ${p1.name} expira en el año **${p1.contractUntil}**, mientras que el de ${p2.name} se extiende hasta **${p2.contractUntil}**.

#### 💡 Recomendación Scout AI:
Se observa un rendimiento de valor de mercado superior en **${p1.name}** con un valor estimado de **$${(p1.marketValue/1000000).toFixed(1)}M**, representando una mayor plusvalía frente a los **$${(p2.marketValue/1000000).toFixed(1)}M** de **${p2.name}**.`
      });
    }

    // Route: IA Predictions
    if (url.includes('/api/predictions')) {
      return makeJsonResponse(200, {
        predictions: [
          { title: "🏆 La Liga 2024-25", desc: "El Real Madrid tiene una probabilidad del 62% de coronarse campeón, seguido por el FC Barcelona con 28% y el Atlético con 8%.", certainty: "Alta" },
          { title: "⚽ Bota de Oro Europea", desc: "Erling Haaland lidera las predicciones de goleo con una proyección final de 36 goles en la Premier League.", certainty: "Media" },
          { title: "🛡️ Finalista Champions League", desc: "Los modelos de probabilidad sitúan al Manchester City (38%) y al Real Madrid (32%) como los máximos candidatos a disputar la final.", certainty: "Media" }
        ]
      });
    }

    // Route: Dynamic Streamed AI Chat (Gemini Stream Simulator)
    if (url.includes('/api/chat/stream')) {
      const msg = body.message || '';
      let replyText = `### ⚽ Respuesta del Experto FutbolAI

Hola. Estoy procesando tu consulta táctica en **modo 100% local y autónomo** desde tu teléfono Samsung.

En respuesta a tu pregunta sobre **"${msg}"**:

1. **Análisis de Rendimiento:** La táctica seleccionada favorece las transiciones dinámicas por las bandas, apoyándose en la gran velocidad y explosividad de los extremos del equipo.
2. **Base de Datos Táctica:** He verificado tus configuraciones en la base de datos local de la aplicación. Te recomiendo dosificar el esfuerzo de tus volantes mixtos en los últimos bloques del partido para mantener la intensidad.

¿Hay algún jugador de la plantilla o aspecto del club sobre el cual quieras que elaboremos un informe detallado?`;

      // Split reply into chunks for real-time streaming simulation
      const chunks = [];
      const chunkSize = 8;
      for (let offset = 0; offset < replyText.length; offset += chunkSize) {
        chunks.push(replyText.substring(offset, offset + chunkSize));
      }

      // Return a simulated Server-Sent Events stream using ReadableStream
      const stream = new ReadableStream({
        start(controller) {
          let i = 0;
          function push() {
            if (i < chunks.length) {
              const dataStr = JSON.stringify({ chunk: chunks[i], sessionId: "offline_session_id" });
              controller.enqueue(new TextEncoder().encode(`data: ${dataStr}\n\n`));
              i++;
              setTimeout(push, 15);
            } else {
              controller.close();
            }
          }
          push();
        }
      });

      return new Response(stream, {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      });
    }

    // Default fallback
    return makeJsonResponse(404, { error: "Mock API Endpoint not found" });
  }

  // Helper to construct a standard fetch Response
  function makeJsonResponse(status, jsonBody) {
    const blob = new Blob([JSON.stringify(jsonBody)], { type: 'application/json' });
    return new Response(blob, {
      status: status,
      statusText: status === 200 ? "OK" : "Bad Request",
      headers: { 'Content-Type': 'application/json' }
    });
  }

})();
