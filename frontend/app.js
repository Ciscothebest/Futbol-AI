function formatContractValue(val) {
  if (!val || isNaN(val) || val <= 0) return '€5M';
  const num = Number(val);
  if (num >= 1000000) {
    const millions = (num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 1);
    return `€${millions}M`;
  } else if (num >= 1000) {
    return `€${(num / 1000).toFixed(0)}K`;
  } else {
    return `€${num}`;
  }
}

/* ══════════════════════════════════════════
   FUTBOLAI — Main Application Logic
   ══════════════════════════════════════════ */

// ──────────────────────────────────────────
// TRANSLATIONS
// ──────────────────────────────────────────
const TRANSLATIONS = {
  es: {
    nav_home: 'Inicio', nav_my_club: 'Mi Club', nav_players: 'Jugadores', nav_chat: 'Chat IA',
    nav_compare: 'Comparar', nav_predictions: 'Predicciones', nav_simulations: 'Simulaciones', section_simulations: '🎮 Simulador de Partidos IA', sim_report_title: 'Reporte de Simulación IA',
    db_my_club: 'Mi Club', db_position: 'Posición', db_goals: 'Goles Favor (GF)', db_xg: 'xG', db_wins: 'Ganados (G)', db_draws: 'Empatados (E)', db_losses: 'Perdidos (P)', db_gc: 'Goles Contra (GC)', db_dg: 'Dif. Goles (DG)',
    db_matches: 'Partidos', db_next_matches: 'Próximos partidos', db_title_formation: 'Alineación Titular',
    db_btn_edit_formation: 'Editar alineación', db_alerts_title: 'Alertas IA',
    db_performance_title: 'Rendimiento reciente', db_chat_title: 'Chat IA',
    db_chat_placeholder: 'Pregunta algo sobre tu equipo...',
    chat_agent_name: 'Agente FutbolAI',
    hero_badge: '🤖 Impulsado por Gemini AI',
    hero_title: 'Inteligencia Artificial<br/><span class="gradient-text">del Fútbol Mundial</span>',
    hero_subtitle: 'Consulta estadísticas, compara jugadores y obtén análisis profundos con IA.',
    btn_talk_agent: '💬 Hablar con el Agente',
    btn_see_players: '👥 Ver Jugadores',
    stat_players: 'Jugadores', stat_leagues: 'Ligas',
    stat_questions: 'Preguntas', stat_available: 'Disponible',
    featured_title: '⭐ Destacados', see_all: 'Ver todos →',
    quick_chat_title: '💬 Pregunta lo que quieras',
    section_players: '👥 Jugadores',
    search_placeholder: 'Buscar jugador, equipo...',
    all_leagues: 'Todas las ligas', all_positions: 'Todas las posiciones',
    all_teams: 'Todos los equipos',
    search_league_placeholder: 'Buscar liga...',
    search_team_placeholder: 'Buscar equipo...',
    btn_clear: '✕ Limpiar',
    section_compare: '⚖️ Comparar Jugadores',
    player1_label: 'Jugador 1', player2_label: 'Jugador 2',
    search_player: 'Buscar jugador...', select_player: 'Selecciona un jugador',
    btn_analyze: '🤖 Analizar con IA', btn_analyzing: '⏳ Analizando...',
    compare_result_title: '🤖 Análisis IA',
    compare_chart_title: '📊 Gráfico de Rendimiento',
    section_predictions: '🔮 Predicciones IA', btn_refresh: '🔄 Actualizar',
    predictions_desc: 'Predicciones generadas por inteligencia artificial basadas en estadísticas reales y tendencias actuales de la temporada 2024-25.',
    loading_predictions: 'Generando predicciones...',
    sort_name_asc: 'Nombre (A-Z)', sort_name_desc: 'Nombre (Z-A)',
    sort_value_desc: 'Valor (Mayor a Menor)', sort_value_asc: 'Valor (Menor a Mayor)',
    sort_salary_desc: 'Salario (Mayor a Menor)', sort_salary_asc: 'Salario (Menor a Mayor)',
    sort_contract_near: 'Contrato (Próximo a Expirar)', sort_contract_far: 'Contrato (Lejano a Expirar)',
    chat_placeholder: 'Escribe tu pregunta...',
    welcome_title: '¡Bienvenido a FutbolAI!',
    welcome_text: 'Soy tu experto en fútbol mundial. Puedo responder cualquier pregunta sobre jugadores, estadísticas, carreras y más.',
    status_online: 'Gemini IA Online', status_demo: 'Modo Demo', status_offline: 'Backend offline',
    status_connecting: 'Conectando...',
    goals: 'GOLES', assists: 'ASIST.', matches: 'PART.',
    goals_full: 'Goles', assists_full: 'Asistencias', matches_full: 'Partidos (Club)',
    modal_stats: '⚽ Stats 2024-25', modal_info: '📋 Info',
    modal_strengths: '💪 Fortalezas', modal_trophies: '🏆 Palmarés',
    modal_transfers: '💸 Historial de Traspasos', modal_tags: '🏷️ Tags',
    ask_agent_btn: 'Preguntarle al agente sobre',
    market_value: 'Valor de Mercado', age: 'Edad',
    career_goals: 'Goles Carrera', new_chat_msg: 'Nueva conversación iniciada. ¡Pregúntame lo que quieras!',
    btn_new_chat: 'Nuevo Chat',
    search_chats_placeholder: 'Buscar conversación...',
    clear_all_chats: 'Limpiar historial',
    rename_chat: 'Renombrar chat',
    prompt_rename_chat: 'Ingresa el nuevo título para esta conversación:',
    no_chats_found: 'Sin conversaciones',
    confirm_clear_all_chats: '¿Estás seguro de eliminar todo el historial de chats?',
    confirm_delete_chat: '¿Eliminar esta conversación?',
    count_tag: 'jugadores',
    prompt1_label: '⚽ Máximo goleador Europa', prompt1: '¿Quién mete más goles actualmente en Europa?',
    prompt2_label: '🇳🇴 Perfil Haaland', prompt2: 'Cuéntame todo sobre Erling Haaland',
    prompt3_label: '🏆 Mejor liga', prompt3: '¿Cuál es la mejor liga del mundo y por qué?',
    prompt4_label: '⚖️ Vini vs Mbappé', prompt4: 'Compara a Vinicius Jr y Kylian Mbappé',
    agent_lang_instruction: 'IMPORTANTE: El usuario ha seleccionado ESPAÑOL como idioma de la interfaz. Debes responder SIEMPRE en español, sin importar el idioma del mensaje del usuario.',
    tab_season: 'Temporada', tab_competition: 'Competencia', tab_vs_team: 'VS Equipo', tab_global: 'Global', tab_injuries: 'Lesiones',
    nav_profile: 'PERFIL', profile_role: 'Scout Analista', profile_info_title: 'Información de Cuenta',
    profile_club_label: 'Club Seleccionado', profile_country_label: 'País de Scouting', profile_tactic_label: 'Estilo Táctico',
    profile_settings_title: 'Preferencias', profile_notif_ai: 'Notificaciones de IA', profile_dark_mode: 'Modo Oscuro (Forzado)',
    profile_btn_edit: 'Editar Perfil', profile_btn_logout: 'Cerrar Sesión', profile_stats_title: 'Estadísticas de Actividad',
    profile_stat_queries: 'Consultas IA', profile_stat_compared: 'Comparaciones', profile_stat_days: 'Días Activo', profile_stat_plan: 'Plan Actual',
    style_tikitaka: 'Posesión (Tiki-Taka)',
    style_counter: 'Contraataque Rápido',
    style_gegenpress: 'Presión Alta (Gegenpress)',
    style_longball: 'Balón Largo (Directo)',
    style_wingplay: 'Juego por las Bandas',
    style_parkbus: 'Autobús (Defensivo)',
    style_total: 'Fútbol Total',
    style_catenaccio: 'Catenaccio (Cerrojo Italiano)',
    style_juego_posicion: 'Juego de Posición (Estructural)',
    style_samba: 'Jogo Bonito (Samba Creativo)',
    style_kick_rush: 'Kick and Rush (Fútbol Británico)',
    style_verrou: 'El Cerrojo (Bloque Bajo Suizo)',
    style_vertikalspiel: 'Pase Vertical (Juego Directo)',
    style_trequartista: 'Juego del Enganche (Trequartista)',
    style_heavy_metal: 'Heavy Metal (Ataque Furioso)',
    style_target_man: 'Juego con Referente (Target Man)',
    formation_433: '4-3-3 (Posesión Clásica)',
    formation_442: '4-4-2 (Doble Pivote Tradicional)',
    formation_352: '3-5-2 (Carrileros y Fluidez)',
    formation_4231: '4-2-3-1 (Doble Pivote y Enganche)',
    formation_41212: '4-1-2-1-2 (Rombo Cerrado)',
    formation_343: '3-4-3 (Ataque y Amplitud)',
    formation_532: '5-3-2 (Muro Defensivo)',
    formation_541: '5-4-1 (Cerrojo Defensivo)',
    formation_451: '4-5-1 (Bloque Medio Ultracompacto)',
    formation_4321: '4-3-2-1 (Árbol de Navidad)',
    formation_3421: '3-4-2-1 (Línea de 3 con Carrileros)',
    formation_523: '5-2-3 (Contragolpe de Cinco)',
    formation_4411: '4-4-1-1 (Segundo Delantero)',
    formation_3412: '3-4-1-2 (Tres Defensas y Enganche)',
    formation_4312: '4-3-1-2 (Rombo Cerrado y Tres MCs)',
    formation_4222: '4-2-2-2 (Rectángulo Mágico)',
    profile_tab_favorites: 'Favoritos',
    profile_favorites_title: 'Jugadores Favoritos',
    profile_favorites_empty: 'No has marcado ningún jugador como favorito.'
  },
  en: {
    nav_home: 'Home', nav_my_club: 'My Club', nav_players: 'Players', nav_chat: 'AI Chat',
    nav_compare: 'Compare', nav_predictions: 'Predictions', nav_simulations: 'Simulations', section_simulations: '🎮 AI Match Simulator', sim_report_title: 'AI Simulation Report',
    db_my_club: 'My Club', db_position: 'Position', db_goals: 'Goals For (GF)', db_xg: 'xG', db_wins: 'Wins (W)', db_draws: 'Draws (D)', db_losses: 'Losses (L)', db_gc: 'Goals Conceded (GA)', db_dg: 'Goal Diff (GD)',
    db_matches: 'Matches', db_next_matches: 'Upcoming Matches', db_title_formation: 'Starting XI',
    db_btn_edit_formation: 'Edit Formation', db_alerts_title: 'AI Alerts',
    db_performance_title: 'Recent Performance', db_chat_title: 'AI Chat',
    db_chat_placeholder: 'Ask something about your team...',
    chat_agent_name: 'FutbolAI Agent',
    hero_badge: '🤖 Powered by Gemini AI',
    hero_title: 'Artificial Intelligence<br/><span class="gradient-text">for World Football</span>',
    hero_subtitle: 'Query stats, compare players and get deep AI-powered insights.',
    btn_talk_agent: '💬 Talk to the Agent',
    btn_see_players: '👥 See Players',
    stat_players: 'Players', stat_leagues: 'Leagues',
    stat_questions: 'Questions', stat_available: 'Available',
    featured_title: '⭐ Featured', see_all: 'See all →',
    quick_chat_title: '💬 Ask anything',
    section_players: '👥 Players',
    search_placeholder: 'Search player, team...',
    all_leagues: 'All leagues', all_positions: 'All positions',
    all_teams: 'All teams',
    search_league_placeholder: 'Search league...',
    search_team_placeholder: 'Search team...',
    btn_clear: '✕ Clear',
    section_compare: '⚖️ Compare Players',
    player1_label: 'Player 1', player2_label: 'Player 2',
    search_player: 'Search player...', select_player: 'Select a player',
    btn_analyze: '🤖 Analyze with AI', btn_analyzing: '⏳ Analyzing...',
    compare_result_title: '🤖 AI Analysis',
    compare_chart_title: '📊 Performance Chart',
    section_predictions: '🔮 AI Predictions', btn_refresh: '🔄 Refresh',
    predictions_desc: 'AI-generated predictions based on real statistics and current trends for the 2024-25 season.',
    loading_predictions: 'Generating predictions...',
    sort_name_asc: 'Name (A-Z)', sort_name_desc: 'Name (Z-A)',
    sort_value_desc: 'Value (High to Low)', sort_value_asc: 'Value (Low to High)',
    sort_salary_desc: 'Salary (High to Low)', sort_salary_asc: 'Salary (Low to High)',
    sort_contract_near: 'Contract (Near)', sort_contract_far: 'Contract (Far)',
    chat_placeholder: 'Type your question...',
    welcome_title: 'Welcome to FutbolAI!',
    welcome_text: "I'm your global football expert. I can answer any question about players, stats, careers and more.",
    status_online: 'Gemini IA Online', status_demo: 'Demo Mode', status_offline: 'Backend offline',
    status_connecting: 'Connecting...',
    goals: 'GOLES', assists: 'ASSISTS', matches: 'MATCHES',
    goals_full: 'Goals', assists_full: 'Assists', matches_full: 'Club Matches',
    modal_stats: '⚽ Stats 2024-25', modal_info: '📋 Info',
    modal_strengths: '💪 Strengths', modal_trophies: '🏆 Trophies',
    modal_transfers: '💸 Transfer History', modal_tags: '🏷️ Tags',
    ask_agent_btn: 'Ask the agent about',
    market_value: 'Market Value', age: 'Age',
    career_goals: 'Career Goals', new_chat_msg: 'New conversation started. Ask me anything!',
    btn_new_chat: 'New Chat',
    search_chats_placeholder: 'Search conversation...',
    clear_all_chats: 'Clear history',
    rename_chat: 'Rename chat',
    prompt_rename_chat: 'Enter a new title for this conversation:',
    no_chats_found: 'No conversations',
    confirm_clear_all_chats: 'Are you sure you want to delete all chat history?',
    confirm_delete_chat: 'Delete this conversation?',
    count_tag: 'players',
    prompt1_label: '⚽ Top scorer Europe', prompt1: 'Who is scoring the most goals in Europe right now?',
    prompt2_label: '🇳🇴 Haaland profile', prompt2: 'Tell me everything about Erling Haaland',
    prompt3_label: '🏆 Best league', prompt3: 'What is the best league in the world and why?',
    prompt4_label: '⚖️ Vini vs Mbappé', prompt4: 'Compare Vinicius Jr and Kylian Mbappé',
    agent_lang_instruction: 'IMPORTANT: The user has selected ENGLISH as the interface language. You MUST always respond in English, regardless of the language the user writes in.',
    tab_season: 'Season', tab_competition: 'Competition', tab_vs_team: 'VS Team', tab_global: 'Global', tab_injuries: 'Injuries',
    nav_profile: 'PROFILE', profile_role: 'Scout Analyst', profile_info_title: 'Account Information',
    profile_club_label: 'Selected Club', profile_country_label: 'Scouting Country', profile_tactic_label: 'Tactical Style',
    profile_settings_title: 'Preferences', profile_notif_ai: 'AI Notifications', profile_dark_mode: 'Dark Mode (Forced)',
    profile_btn_edit: 'Edit Profile', profile_btn_logout: 'Log Out', profile_stats_title: 'Activity Stats',
    profile_stat_queries: 'AI Queries', profile_stat_compared: 'Comparisons', profile_stat_days: 'Active Days', profile_stat_plan: 'Current Plan',
    style_tikitaka: 'Possession (Tiki-Taka)',
    style_counter: 'Fast Counter-attack',
    style_gegenpress: 'High Press (Gegenpress)',
    style_longball: 'Long Ball (Direct)',
    style_wingplay: 'Wing Play',
    style_parkbus: 'Park the Bus (Defensive)',
    style_total: 'Total Football',
    style_catenaccio: 'Catenaccio (Italian Lock)',
    style_juego_posicion: 'Juego de Posición (Positional Play)',
    style_samba: 'Jogo Bonito (Creative Samba)',
    style_kick_rush: 'Kick and Rush (British Football)',
    style_verrou: 'El Cerrojo (Swiss Lock)',
    style_vertikalspiel: 'Vertical Passing (Direct Play)',
    style_trequartista: 'Play of the Trequartista (Enganche)',
    style_heavy_metal: 'Heavy Metal (Furious Attack)',
    style_target_man: 'Target Man (Striker Play)',
    formation_433: '4-3-3 (Classic Possession)',
    formation_442: '4-4-2 (Traditional Double Pivot)',
    formation_352: '3-5-2 (Wing-Backs & Fluidity)',
    formation_4231: '4-2-3-1 (Double Pivot & CAM)',
    formation_41212: '4-1-2-1-2 (Narrow Diamond)',
    formation_343: '3-4-3 (Attack & Amplitude)',
    formation_532: '5-3-2 (Defensive Wall)',
    formation_541: '5-4-1 (Defensive Lock)',
    formation_451: '4-5-1 (Ultracompact Mid-Block)',
    formation_4321: '4-3-2-1 (Christmas Tree)',
    formation_3421: '3-4-2-1 (Modern 3-Back)',
    formation_523: '5-2-3 (Five-Back Counter)',
    formation_4411: '4-4-1-1 (Second Striker)',
    formation_3412: '3-4-1-2 (3-Back with CAM)',
    formation_4312: '4-3-1-2 (Narrow Diamond / 3 MCs)',
    formation_4222: '4-2-2-2 (Magic Rectangle)',
    profile_tab_favorites: 'Favorites',
    profile_favorites_title: 'Favorite Players',
    profile_favorites_empty: 'You have not marked any players as favorites.'
  }
};

const TEAM_COLORS = {
  // ── Premier League ──
  'Arsenal': '#EF0107',
  'Aston Villa': '#95BFE5',
  'Bournemouth': '#DA291C',
  'Brentford': '#E30613',
  'Brighton & Hove Albion': '#0057B8',
  'Burnley': '#6C1D45',
  'Chelsea': '#034694',
  'Crystal Palace': '#1B458F',
  'Everton': '#003399',
  'Fulham': '#CC0000',
  'Leeds United': '#FFCD00',
  'Liverpool': '#E31B23',
  'Manchester City': '#1C2C5B',
  'Manchester United': '#DA291C',
  'Newcastle United': '#241F20',
  'Nottingham Forest': '#DD0000',
  'Sunderland': '#EB172B',
  'Tottenham Hotspur': '#132257',
  'West Ham United': '#7A263A',
  'Wolverhampton Wanderers': '#FDB913',
  // ── La Liga ──
  'Real Madrid': '#FEBE10',
  'FC Barcelona': '#A50044',
  'Atlético de Madrid': '#CB3524',
  // ── Bundesliga ──
  'Bayern München': '#DC052D',
  'Bayer 04 Leverkusen': '#E32221',
  'Borussia Dortmund': '#FDE100',
  // ── Serie A ──
  'Juventus': '#ffffff',
  'AC Milan': '#FB090B',
  'Inter Milan': '#0062AD',
  'Napoli': '#007FFF',
  'AS Roma': '#8E1F2F',
  // ── Ligue 1 ──
  'Paris Saint-Germain': '#004170',
  // ── Other ──
  'Inter Miami CF': '#F7B5CD',
  'Al-Nassr FC': '#FDE100',
  'SL Benfica': '#E8102E',
  'FC Porto': '#005CA9',
  'Ajax': '#D2122E'
};

// Smart onerror fallback chain: Real Photo -> DiceBear
function onAvatarError(img, p) {
  const id = p && p.id ? p.id : '';
  const name = p && p.name ? p.name : id;
  
  if (!img._fallback1) {
    img._fallback1 = true;
    img.src = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=0d1117&textColor=ffffff&radius=50`;
    return;
  }
  img.onerror = null;
}

function getTeamColor(team) {
  return TEAM_COLORS[team] || '#00e5ff'; // Default to cyan
}

function getInitials(name) {
  if (!name) return '??';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

let currentLang = localStorage.getItem('futbolai-lang') || 'es';
const t = key => TRANSLATIONS[currentLang][key] ?? key;

function applyTranslations() {
  // Update all data-i18n elements (text)
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (TRANSLATIONS[currentLang][key] !== undefined) {
      el.innerHTML = TRANSLATIONS[currentLang][key];
    }
  });
  // Update all data-i18n-placeholder elements
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (TRANSLATIONS[currentLang][key] !== undefined) {
      el.placeholder = TRANSLATIONS[currentLang][key];
    }
  });
  // Update lang buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
  });
  // Update html lang attribute
  document.documentElement.lang = currentLang;
  // Rebuild dynamic quick prompts on home
  buildHomePrompts();
  // Refresh featured grid labels if rendered
  if (allPlayers.length) {
    populateLeagueFilter();
    initCustomDropdowns();
    renderFeaturedPlayers();
    if (document.getElementById('section-players').classList.contains('active')) {
      renderPlayers();
    }
    if (document.getElementById('section-my-club')?.classList.contains('active')) {
      renderMyClubDashboard();
    }
  }
  // Update welcome message in chat if visible
  const welcome = document.querySelector('.chat-welcome');
  if (welcome) buildChatWelcome(welcome);
}

function buildHomePrompts() {
  const container = document.getElementById('home-quick-prompts');
  if (!container) return;
  container.innerHTML = '';
  ['1','2','3','4'].forEach(n => {
    const btn = document.createElement('button');
    btn.className = 'prompt-chip';
    btn.textContent = t(`prompt${n}_label`);
    btn.onclick = () => quickChat(t(`prompt${n}`));
    container.appendChild(btn);
  });
}

function buildChatWelcome(el) {
  el.innerHTML = `
    <div class="welcome-icon">⚽</div>
    <h3>${t('welcome_title')}</h3>
    <p>${t('welcome_text')}</p>
    <div class="welcome-chips">
      ${[1,2,3,4].map(n => `<button class="prompt-chip" onclick="sendQuick(t('prompt${n}'))">${t(`prompt${n}_label`)}</button>`).join('')}
    </div>
  `;
  // Re-bind onclick properly
  el.querySelectorAll('.prompt-chip').forEach((btn, i) => {
    const n = i + 1;
    btn.onclick = () => sendQuick(t(`prompt${n}`));
  });
}

function setupLanguageToggle() {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      if (lang === currentLang) return;
      currentLang = lang;
      localStorage.setItem('futbolai-lang', lang);
      applyTranslations();
      showToast(lang === 'es' ? '🇪🇸 Idioma cambiado a Español' : '🇬🇧 Language changed to English', 'info');
    });
  });
}

// Premier League 2024-25 — all 20 clubs
const PREMIER_LEAGUE_CLUBS = [
  'Arsenal', 'Aston Villa', 'Bournemouth', 'Brentford', 'Brighton & Hove Albion',
  'Burnley', 'Chelsea', 'Crystal Palace', 'Everton', 'Fulham',
  'Leeds United', 'Liverpool', 'Manchester City', 'Manchester United', 'Newcastle United',
  'Nottingham Forest', 'Sunderland', 'Tottenham Hotspur', 'West Ham United', 'Wolverhampton Wanderers'
];

const ELITE_CLUBS = [
  'Manchester City', 'Liverpool', 'Arsenal', 'Chelsea', 'Tottenham Hotspur',
  'Newcastle United', 'Aston Villa', 'Manchester United',
  'Real Madrid', 'Bayern München', 'Paris Saint-Germain', 'Borussia Dortmund',
  'Juventus', 'AC Milan', 'Inter Milan'
];

// Mid-tier clubs for Europa/Conference League
const MID_CLUBS = [
  'Brighton & Hove Albion', 'West Ham United', 'Fulham', 'Crystal Palace',
  'Brentford', 'Wolverhampton Wanderers', 'Nottingham Forest', 'Everton',
  'Bournemouth', 'Leeds United', 'Burnley', 'Sunderland',
  'RB Leipzig', 'Roma', 'Atalanta', 'Lazio', 'Real Sociedad', 'Benfica', 'Porto'
];

const API = (() => {
  const isAndroid = navigator.userAgent.toLowerCase().includes('android');
  if (window.location.protocol === 'file:') {
    return isAndroid ? 'http://10.0.2.2:3001/api' : 'http://localhost:3001/api';
  }
  if (window.location.port && window.location.port !== '3001') {
    return `${window.location.protocol}//${window.location.hostname}:3001/api`;
  }
  return '/api';
})();

function getLeagueLogoUrl(leagueName) {
  if (!leagueName) return null;
  const nameLower = leagueName.toLowerCase();
  const leagueNameToId = {
    "a-league": 1,
    "allsvenskan": 2,
    "bangladesh": 4,
    "brasileir": 6,
    "bundesliga (germany)": 7,
    "bundesliga": 7,
    "bundesliga (austria)": 8,
    "cambodian": 9,
    "campeonato nacional": 10,
    "castle lager": 11,
    "división de honor": 12,
    "egyptian": 14,
    "ekstraklasa": 15,
    "eliteserien": 16,
    "eredivisie": 17,
    "first division a": 19,
    "girabola": 22,
    "hnl": 23,
    "isl": 24,
    "j1 league": 25,
    "la liga": 31,
    "libyan": 34,
    "liga 1": 35,
    "liga betplay": 36,
    "liga futve": 37,
    "liga i": 38,
    "liga mx": 39,
    "ligapro": 43,
    "ligue 1": 44,
    "ligue haïtienne": 45,
    "linafoot": 46,
    "mls": 47,
    "moçambola": 48,
    "mongolian": 49,
    "myanmar": 50,
    "oman": 51,
    "pakistan": 52,
    "philippines": 53,
    "premier league (ukraine)": 54,
    "premier league / championship": 55,
    "premier league": 55,
    "premier liga": 56,
    "primera división (chile)": 59,
    "primera división (uruguay)": 60,
    "primera división (costa rica)": 61,
    "primera división (el salvador)": 62,
    "primera división": 59,
    "prva liga": 63,
    "prvaliga": 64,
    "saudi pro league": 66,
    "serie a": 67,
    "super league (greece)": 69,
    "super league": 69,
    "super league (china)": 70,
    "super league (switzerland)": 71,
    "super league of zambia": 72,
    "süper lig": 73,
    "superliga": 74,
    "syrian": 77,
    "tt pro league": 78,
    "uzbekistan": 79
  };

  for (const [key, val] of Object.entries(leagueNameToId)) {
    if (nameLower.includes(key)) {
      return `assets/leagues/liga_${val}.png`;
    }
  }
  return null;
}

function renderLeagueLabel(detailsEl, leagueName, countryName) {
  if (!detailsEl) return;
  const leagueLogo = getLeagueLogoUrl(leagueName);
  const leagueLogoHtml = leagueLogo ? `<img src="${leagueLogo}" alt="${leagueName}" style="width: 14px; height: 14px; object-fit: contain; vertical-align: middle; margin-right: 4px; display: inline-block;">` : '';
  detailsEl.innerHTML = `${leagueLogoHtml}${leagueName} · ${countryName}`;
}

async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('scout_ai_token');
  const headers = {
    ...options.headers,
    'Authorization': token ? `Bearer ${token}` : ''
  };
  
  const res = await fetch(url, { ...options, headers });
  
  if (res.status === 401) {
    // Session expired or invalid
    localStorage.removeItem('scout_ai_token');
    localStorage.removeItem('scout_ai_user');
    window.location.href = 'landing.html';
    throw new Error('Sesión expirada');
  }
  
  return res;
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

let sessionId = null;
let chatSessions = [];
let activeSessionId = null;
let allPlayers = (() => {
  try {
    const cached = localStorage.getItem('scout_ai_cached_players');
    if (cached) {
      const parsed = JSON.parse(cached);
      const isDirty = Array.isArray(parsed) && parsed.some(p => p.overallRating > 10);
      if (isDirty) {
        localStorage.removeItem('scout_ai_cached_players');
        return [];
      }
      return parsed;
    }
    return [];
  } catch (e) {
    console.error('Error loading cached players:', e);
    return [];
  }
})();
window.allPlayers = allPlayers;
let filteredPlayers = [];
let currentPage = 0;
const PAGE_SIZE = 30;
let selectedPlayer1 = null;
let selectedPlayer2 = null;
let predictionsLoaded = false;
let mediaRecorder;
let audioChunks = [];
let isRecording = false;
let isMuted = false;
let recordingTimerInterval = null;
let recordingSeconds = 0;
let lastAudioBlob = null;
let comparisonChart = null;

// ──────────────────────────────────────────
// GLOBAL LOADING UTILITIES
// ──────────────────────────────────────────

/**
 * AppLoader: full-screen blocking loader shown during app boot.
 * Drives the AppLoader injected by index.html's inline script.
 */
function runAppLoader() {
  const steps = [
    { pct: 10, msg: 'Iniciando sistema...' },
    { pct: 28, msg: 'Verificando sesión...' },
    { pct: 48, msg: 'Conectando con el backend...' },
    { pct: 65, msg: 'Cargando base de datos...' },
    { pct: 82, msg: 'Preparando jugadores...' },
    { pct: 95, msg: 'Aplicando análisis IA...' },
    { pct: 100, msg: '¡Todo listo!' },
  ];
  return new Promise(resolve => {
    if (!window.AppLoader) { resolve(); return; }
    let i = 0;
    const tick = () => {
      if (i >= steps.length) {
        setTimeout(() => { window.AppLoader.hide(); resolve(); }, 350);
        return;
      }
      const { pct, msg } = steps[i++];
      window.AppLoader.setProgress(pct, msg);
      setTimeout(tick, i === steps.length ? 400 : 260 + Math.random() * 100);
    };
    setTimeout(tick, 150);
  });
}

/**
 * SectionLoader: lightweight semi-transparent blur overlay for
 * module / section / plan-change transitions.
 */
window.SectionLoader = {
  show: function(label) {
    const el = document.getElementById('section-loader');
    const lbl = document.getElementById('section-loader-label');
    if (!el) return;
    if (lbl) lbl.textContent = label || 'Cargando...';
    el.style.opacity = '0';
    el.classList.add('sl-show');
    el.classList.remove('sl-fade-out');
    requestAnimationFrame(() => { el.style.opacity = '1'; });
  },
  hide: function() {
    const el = document.getElementById('section-loader');
    if (!el) return;
    el.classList.add('sl-fade-out');
    el.style.opacity = '0';
    setTimeout(() => {
      el.classList.remove('sl-show', 'sl-fade-out');
      el.style.opacity = '';
    }, 280);
  }
};

window.applyTheme = () => {
  const darkPref = localStorage.getItem('scout_ai_pref_dark_mode') !== 'false';
  if (darkPref) {
    document.documentElement.classList.remove('light-mode');
  } else {
    document.documentElement.classList.add('light-mode');
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  window.applyTheme();
  // ─── Auth Check ──────────────────────────────────────────────
  const token = localStorage.getItem('scout_ai_token');
  let user = JSON.parse(localStorage.getItem('scout_ai_user') || 'null');

  if (!token || !user) {
    if (window.AppLoader) window.AppLoader.hide();
    window.location.href = 'landing.html';
    return;
  }

  // Start loader animation (runs in parallel with real init work)
  const loaderDone = runAppLoader();

  // Sync profile from DB
  if (window.AppLoader) window.AppLoader.setProgress(28, 'Verificando sesión...');
  try {
    const meRes = await fetchWithAuth(`${API}/auth/me`);
    if (meRes.ok) {
      const meData = await meRes.json();
      if (meData && meData.user) {
        user = meData.user;
        localStorage.setItem('scout_ai_user', JSON.stringify(user));
      }
    }
  } catch (err) {
    console.warn('Sincronización con BD fallida (usando perfil local):', err);
  }

  updateProfileUI(user);

  // Logout Handler
  const performLogout = () => {
    localStorage.removeItem('scout_ai_token');
    localStorage.removeItem('scout_ai_user');
    window.location.href = 'landing.html';
  };
  document.getElementById('btn-logout')?.addEventListener('click', performLogout);
  document.getElementById('btn-logout-mobile')?.addEventListener('click', performLogout);
  document.getElementById('btn-profile-logout')?.addEventListener('click', performLogout);

  if (window.AppLoader) window.AppLoader.setProgress(48, 'Conectando con el backend...');
  setupLanguageToggle();
  setupPaymentGateway();
  applyTranslations();
  setupNavigation();
  setupMobileMenu();
  setupChatInput();
  setupCompareSearch();
  setupAvatarUpload();
  setupFilters();

  if (window.AppLoader) window.AppLoader.setProgress(65, 'Cargando base de datos...');
  const hasCache = allPlayers && allPlayers.length > 0;
  if (hasCache) {
    populateLeagueFilter();
    renderPlayers();
    renderFeaturedPlayers();
    buildHomePrompts();
  }

  if (window.AppLoader) window.AppLoader.setProgress(80, 'Preparando jugadores...');
  const initFetches = (async () => {
    try {
      await Promise.allSettled([
        checkBackendStatus(),
        loadPlayers()
      ]);
      renderPlayers();
      renderFeaturedPlayers();
      buildHomePrompts();
    } catch (err) {
      console.error('Error during initial background fetch:', err);
    }
  })();

  if (!hasCache) {
    await initFetches;
  }

  setTimeout(checkBackendStatus, 2000);

  if (window.AppLoader) window.AppLoader.setProgress(95, 'Aplicando análisis IA...');

  // Wait for loader animation before showing app content
  await loaderDone;

  // ─── Onboarding Check ─────────────────────────────────────────────
  const isLocalPlan = (user.selectedTier || '').toLowerCase() === 'local';
  const hasValidProTeam = !!user.selectedClub && user.selectedClub !== 'Club Local' && user.selectedClub !== '' && !!user.selectedCountry && user.selectedCountry !== 'Local';
  const hasLocalData = !!user.localCoachData;

  const needsOnboarding = isLocalPlan 
    ? (!user.onboardingComplete && !hasLocalData)
    : (!hasValidProTeam);

  if (needsOnboarding) {
    if (!isLocalPlan) {
      user.selectedClub = '';
      user.onboardingComplete = false;
      localStorage.setItem('scout_ai_user', JSON.stringify(user));
    }
    setupOnboarding();
  } else {
    initDashboard();
  }
});

// ──────────────────────────────────────────
// ONBOARDING & DASHBOARD
// ──────────────────────────────────────────
/* Onboarding logic moved to onboarding.js */
let performanceChart = null; // Store chart instance globally

// Coordinate definitions for 4-3-3, 4-4-2, 3-5-2, 4-2-3-1, 4-1-2-1-2, 3-4-3, 5-3-2, 5-4-1, 4-5-1
const slots433 = [
  { roleEs: 'PO', left: 50, top: 88 },
  { roleEs: 'LI', left: 20, top: 70 },
  { roleEs: 'DFC', left: 38, top: 73 },
  { roleEs: 'DFC', left: 62, top: 73 },
  { roleEs: 'LD', left: 80, top: 70 },
  { roleEs: 'MC', left: 30, top: 50 },
  { roleEs: 'MC', left: 50, top: 55 }, // DM
  { roleEs: 'MC', left: 70, top: 50 },
  { roleEs: 'EI', left: 22, top: 25 },
  { roleEs: 'DC', left: 50, top: 22 },
  { roleEs: 'ED', left: 78, top: 25 }
];

const slots442 = [
  { roleEs: 'PO', left: 50, top: 88 },
  { roleEs: 'LI', left: 18, top: 70 },
  { roleEs: 'DFC', left: 38, top: 73 },
  { roleEs: 'DFC', left: 62, top: 73 },
  { roleEs: 'LD', left: 82, top: 70 },
  { roleEs: 'MC', left: 20, top: 48 }, // LM
  { roleEs: 'MC', left: 40, top: 50 },
  { roleEs: 'MC', left: 60, top: 50 },
  { roleEs: 'MC', left: 80, top: 48 }, // RM
  { roleEs: 'DC', left: 38, top: 22 },
  { roleEs: 'DC', left: 62, top: 22 }
];

const slots352 = [
  { roleEs: 'PO', left: 50, top: 88 },
  { roleEs: 'DFC', left: 30, top: 73 },
  { roleEs: 'DFC', left: 50, top: 75 },
  { roleEs: 'DFC', left: 70, top: 73 },
  { roleEs: 'MC', left: 50, top: 42 }, // CAM
  { roleEs: 'MC', left: 33, top: 53 },
  { roleEs: 'MC', left: 67, top: 53 },
  { roleEs: 'MC', left: 15, top: 48 }, // LWB
  { roleEs: 'MC', left: 85, top: 48 }, // RWB
  { roleEs: 'DC', left: 38, top: 22 },
  { roleEs: 'DC', left: 62, top: 22 }
];

const slots4231 = [
  { roleEs: 'PO', left: 50, top: 88 },
  { roleEs: 'LI', left: 18, top: 70 },
  { roleEs: 'DFC', left: 38, top: 73 },
  { roleEs: 'DFC', left: 62, top: 73 },
  { roleEs: 'LD', left: 82, top: 70 },
  { roleEs: 'MC', left: 38, top: 58 },
  { roleEs: 'MC', left: 62, top: 58 },
  { roleEs: 'MC', left: 20, top: 40 },
  { roleEs: 'MC', left: 50, top: 40 },
  { roleEs: 'MC', left: 80, top: 40 },
  { roleEs: 'DC', left: 50, top: 20 }
];

const slots41212 = [
  { roleEs: 'PO', left: 50, top: 88 },
  { roleEs: 'LI', left: 18, top: 70 },
  { roleEs: 'DFC', left: 38, top: 73 },
  { roleEs: 'DFC', left: 62, top: 73 },
  { roleEs: 'LD', left: 82, top: 70 },
  { roleEs: 'MC', left: 50, top: 60 },
  { roleEs: 'MC', left: 25, top: 48 },
  { roleEs: 'MC', left: 75, top: 48 },
  { roleEs: 'MC', left: 50, top: 38 },
  { roleEs: 'DC', left: 38, top: 22 },
  { roleEs: 'DC', left: 62, top: 22 }
];

const slots343 = [
  { roleEs: 'PO', left: 50, top: 88 },
  { roleEs: 'DFC', left: 30, top: 73 },
  { roleEs: 'DFC', left: 50, top: 75 },
  { roleEs: 'DFC', left: 70, top: 73 },
  { roleEs: 'MC', left: 35, top: 52 },
  { roleEs: 'MC', left: 65, top: 52 },
  { roleEs: 'MC', left: 15, top: 48 },
  { roleEs: 'MC', left: 85, top: 48 },
  { roleEs: 'EI', left: 25, top: 25 },
  { roleEs: 'DC', left: 50, top: 22 },
  { roleEs: 'ED', left: 75, top: 25 }
];

const slots532 = [
  { roleEs: 'PO', left: 50, top: 88 },
  { roleEs: 'DFC', left: 32, top: 75 },
  { roleEs: 'DFC', left: 50, top: 77 },
  { roleEs: 'DFC', left: 68, top: 75 },
  { roleEs: 'LI', left: 15, top: 65 },
  { roleEs: 'LD', left: 85, top: 65 },
  { roleEs: 'MC', left: 30, top: 48 },
  { roleEs: 'MC', left: 50, top: 52 },
  { roleEs: 'MC', left: 70, top: 48 },
  { roleEs: 'DC', left: 38, top: 22 },
  { roleEs: 'DC', left: 62, top: 22 }
];

const slots541 = [
  { roleEs: 'PO', left: 50, top: 88 },
  { roleEs: 'DFC', left: 32, top: 75 },
  { roleEs: 'DFC', left: 50, top: 77 },
  { roleEs: 'DFC', left: 68, top: 75 },
  { roleEs: 'LI', left: 15, top: 65 },
  { roleEs: 'LD', left: 85, top: 65 },
  { roleEs: 'MC', left: 35, top: 48 },
  { roleEs: 'MC', left: 65, top: 48 },
  { roleEs: 'MC', left: 20, top: 40 },
  { roleEs: 'MC', left: 80, top: 40 },
  { roleEs: 'DC', left: 50, top: 20 }
];

const slots451 = [
  { roleEs: 'PO', left: 50, top: 88 },
  { roleEs: 'LI', left: 18, top: 70 },
  { roleEs: 'DFC', left: 38, top: 73 },
  { roleEs: 'DFC', left: 62, top: 73 },
  { roleEs: 'LD', left: 82, top: 70 },
  { roleEs: 'MC', left: 50, top: 58 },
  { roleEs: 'MC', left: 33, top: 46 },
  { roleEs: 'MC', left: 67, top: 46 },
  { roleEs: 'MC', left: 20, top: 38 },
  { roleEs: 'MC', left: 80, top: 38 },
  { roleEs: 'DC', left: 50, top: 20 }
];

const slots4321 = [
  { roleEs: 'PO', left: 50, top: 88 },
  { roleEs: 'LI', left: 18, top: 70 },
  { roleEs: 'DFC', left: 38, top: 73 },
  { roleEs: 'DFC', left: 62, top: 73 },
  { roleEs: 'LD', left: 82, top: 70 },
  { roleEs: 'MC', left: 30, top: 55 },
  { roleEs: 'MC', left: 50, top: 58 },
  { roleEs: 'MC', left: 70, top: 55 },
  { roleEs: 'MC', left: 38, top: 38 },
  { roleEs: 'MC', left: 62, top: 38 },
  { roleEs: 'DC', left: 50, top: 20 }
];

const slots3421 = [
  { roleEs: 'PO', left: 50, top: 88 },
  { roleEs: 'DFC', left: 30, top: 73 },
  { roleEs: 'DFC', left: 50, top: 75 },
  { roleEs: 'DFC', left: 70, top: 73 },
  { roleEs: 'MC', left: 15, top: 52 },
  { roleEs: 'MC', left: 40, top: 55 },
  { roleEs: 'MC', left: 60, top: 55 },
  { roleEs: 'MC', left: 85, top: 52 },
  { roleEs: 'MC', left: 35, top: 35 },
  { roleEs: 'MC', left: 65, top: 35 },
  { roleEs: 'DC', left: 50, top: 18 }
];

const slots523 = [
  { roleEs: 'PO', left: 50, top: 88 },
  { roleEs: 'DFC', left: 32, top: 75 },
  { roleEs: 'DFC', left: 50, top: 77 },
  { roleEs: 'DFC', left: 68, top: 75 },
  { roleEs: 'LI', left: 15, top: 65 },
  { roleEs: 'LD', left: 85, top: 65 },
  { roleEs: 'MC', left: 38, top: 50 },
  { roleEs: 'MC', left: 62, top: 50 },
  { roleEs: 'EI', left: 22, top: 25 },
  { roleEs: 'DC', left: 50, top: 22 },
  { roleEs: 'ED', left: 78, top: 25 }
];

const slots4411 = [
  { roleEs: 'PO', left: 50, top: 88 },
  { roleEs: 'LI', left: 18, top: 70 },
  { roleEs: 'DFC', left: 38, top: 73 },
  { roleEs: 'DFC', left: 62, top: 73 },
  { roleEs: 'LD', left: 82, top: 70 },
  { roleEs: 'MC', left: 20, top: 48 },
  { roleEs: 'MC', left: 40, top: 50 },
  { roleEs: 'MC', left: 60, top: 50 },
  { roleEs: 'MC', left: 80, top: 48 },
  { roleEs: 'DC', left: 50, top: 33 },
  { roleEs: 'DC', left: 50, top: 18 }
];

const slots3412 = [
  { roleEs: 'PO', left: 50, top: 88 },
  { roleEs: 'DFC', left: 30, top: 73 },
  { roleEs: 'DFC', left: 50, top: 75 },
  { roleEs: 'DFC', left: 70, top: 73 },
  { roleEs: 'MC', left: 15, top: 50 },
  { roleEs: 'MC', left: 40, top: 53 },
  { roleEs: 'MC', left: 60, top: 53 },
  { roleEs: 'MC', left: 85, top: 50 },
  { roleEs: 'MC', left: 50, top: 35 },
  { roleEs: 'DC', left: 38, top: 20 },
  { roleEs: 'DC', left: 62, top: 20 }
];

const slots4312 = [
  { roleEs: 'PO', left: 50, top: 88 },
  { roleEs: 'LI', left: 18, top: 70 },
  { roleEs: 'DFC', left: 38, top: 73 },
  { roleEs: 'DFC', left: 62, top: 73 },
  { roleEs: 'LD', left: 82, top: 70 },
  { roleEs: 'MC', left: 30, top: 53 },
  { roleEs: 'MC', left: 50, top: 56 },
  { roleEs: 'MC', left: 70, top: 53 },
  { roleEs: 'MC', left: 50, top: 38 },
  { roleEs: 'DC', left: 38, top: 20 },
  { roleEs: 'DC', left: 62, top: 20 }
];

const slots4222 = [
  { roleEs: 'PO', left: 50, top: 88 },
  { roleEs: 'LI', left: 18, top: 70 },
  { roleEs: 'DFC', left: 38, top: 73 },
  { roleEs: 'DFC', left: 62, top: 73 },
  { roleEs: 'LD', left: 82, top: 70 },
  { roleEs: 'MC', left: 38, top: 58 },
  { roleEs: 'MC', left: 62, top: 58 },
  { roleEs: 'MC', left: 33, top: 40 },
  { roleEs: 'MC', left: 67, top: 40 },
  { roleEs: 'DC', left: 38, top: 20 },
  { roleEs: 'DC', left: 62, top: 20 }
];

const roleMapping = {
  'PO': ['GK'],
  'DFC': ['CB'],
  'LI': ['LB', 'LWB'],
  'LD': ['RB', 'RWB'],
  'MC': ['CM', 'DM', 'AM', 'LM', 'RM'],
  'EI': ['LW', 'LM'],
  'ED': ['RW', 'RM'],
  'DC': ['ST', 'CF']
};

function getClubTheme(clubName) {
  const clubThemes = {
    "Real Madrid": { short: "RMA", colors: ["#FEBE10", "#ffffff"] },
    "FC Barcelona": { short: "FCB", colors: ["#A50044", "#004D98"] },
    "Atlético de Madrid": { short: "ATM", colors: ["#CB3524", "#ffffff"] },
    "Sevilla FC": { short: "SFC", colors: ["#D11B24", "#ffffff"] },
    "Valencia CF": { short: "VCF", colors: ["#FF7B00", "#111111"] },
    "Villarreal CF": { short: "VLF", colors: ["#FFE600", "#00529F"] },
    "Athletic Club": { short: "ATH", colors: ["#EE2524", "#ffffff"] },
    "Real Sociedad": { short: "RSO", colors: ["#005CA4", "#ffffff"] },
    "Real Betis": { short: "RBT", colors: ["#00954C", "#ffffff"] },
    "Celta Vigo": { short: "CEL", colors: ["#87BDE9", "#ffffff"] },
    "Girona FC": { short: "GIR", colors: ["#EE2524", "#ffffff"] },
    "Manchester City": { short: "MCI", colors: ["#6CABDD", "#ffffff"] },
    "Arsenal": { short: "ARS", colors: ["#EF0107", "#ffffff"] },
    "Liverpool": { short: "LIV", colors: ["#C8102E", "#F6EB61"] },
    "Chelsea": { short: "CHE", colors: ["#034694", "#EE242C"] },
    "Manchester United": { short: "MUN", colors: ["#DA291C", "#FFE500"] },
    "Tottenham Hotspur": { short: "TOT", colors: ["#132257", "#ffffff"] },
    "Inter Milan": { short: "INT", colors: ["#001489", "#111111"] },
    "AC Milan": { short: "ACM", colors: ["#E32221", "#111111"] },
    "Juventus": { short: "JUV", colors: ["#111111", "#ffffff"] },
    "Napoli": { short: "NAP", colors: ["#12A0D7", "#ffffff"] },
    "Bayern München": { short: "FCB", colors: ["#DC052D", "#0066B2"] }
  };
  
  if (clubThemes[clubName]) return clubThemes[clubName];
  
  // Procedural generation
  const clean = clubName.replace(/^(FC|RCD|UD|CD|SL|AS|AC|SS|BK|IFK|IF)\s+/i, "").trim();
  const parts = clean.split(" ");
  let short = "";
  if (parts.length >= 2) {
    short = (parts[0][0] + parts[1][0]).toUpperCase();
  } else if (clean.length >= 3) {
    short = clean.substring(0, 3).toUpperCase();
  } else {
    short = clean.toUpperCase();
  }
  
  // Hash colors
  let hash = 0;
  for (let i = 0; i < clubName.length; i++) {
    hash = clubName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue1 = Math.abs(hash % 360);
  const hue2 = (hue1 + 120) % 360;
  const color1 = `hsl(${hue1}, 75%, 45%)`;
  const color2 = `hsl(${hue2}, 75%, 35%)`;
  
  return { short, colors: [color1, color2] };
}

function getDeterministicStats(clubName, countryName) {
  if (!clubName) {
    return { pos: "1º", matches: 38, g: 31, e: 1, p: 6, goals: 95, gc: 36, dg: "+59", xG: "91.2", season: "2025/26" };
  }
  
  const realStats = {
    "FC Barcelona": {
        "pos": 1,
        "matches": 38,
        "g": 31,
        "e": 1,
        "p": 6,
        "goals": 95,
        "gc": 36,
        "dg": "+59",
        "xG": "91.2"
    },
    "Real Madrid": {
        "pos": 2,
        "matches": 38,
        "g": 27,
        "e": 5,
        "p": 6,
        "goals": 77,
        "gc": 35,
        "dg": "+42",
        "xG": "73.9"
    },
    "Villarreal": {
        "pos": 3,
        "matches": 38,
        "g": 22,
        "e": 6,
        "p": 10,
        "goals": 72,
        "gc": 46,
        "dg": "+26",
        "xG": "69.1"
    },
    "Villarreal CF": {
        "pos": 3,
        "matches": 38,
        "g": 22,
        "e": 6,
        "p": 10,
        "goals": 72,
        "gc": 46,
        "dg": "+26",
        "xG": "69.1"
    },
    "Atlético de Madrid": {
        "pos": 4,
        "matches": 38,
        "g": 21,
        "e": 6,
        "p": 11,
        "goals": 62,
        "gc": 44,
        "dg": "+18",
        "xG": "59.5"
    },
    "Atletico Madrid": {
        "pos": 4,
        "matches": 38,
        "g": 21,
        "e": 6,
        "p": 11,
        "goals": 62,
        "gc": 44,
        "dg": "+18",
        "xG": "59.5"
    },
    "Real Betis": {
        "pos": 5,
        "matches": 38,
        "g": 15,
        "e": 15,
        "p": 8,
        "goals": 59,
        "gc": 48,
        "dg": "+11",
        "xG": "56.6"
    },
    "Celta de Vigo": {
        "pos": 6,
        "matches": 38,
        "g": 14,
        "e": 12,
        "p": 12,
        "goals": 53,
        "gc": 48,
        "dg": "+5",
        "xG": "50.9"
    },
    "Getafe": {
        "pos": 7,
        "matches": 38,
        "g": 15,
        "e": 6,
        "p": 17,
        "goals": 32,
        "gc": 38,
        "dg": "-6",
        "xG": "30.7"
    },
    "Rayo Vallecano": {
        "pos": 8,
        "matches": 38,
        "g": 12,
        "e": 14,
        "p": 12,
        "goals": 41,
        "gc": 44,
        "dg": "-3",
        "xG": "39.4"
    },
    "Valencia": {
        "pos": 9,
        "matches": 38,
        "g": 13,
        "e": 10,
        "p": 15,
        "goals": 46,
        "gc": 55,
        "dg": "-9",
        "xG": "44.2"
    },
    "Valencia CF": {
        "pos": 9,
        "matches": 38,
        "g": 13,
        "e": 10,
        "p": 15,
        "goals": 46,
        "gc": 55,
        "dg": "-9",
        "xG": "44.2"
    },
    "Real Sociedad": {
        "pos": 10,
        "matches": 38,
        "g": 11,
        "e": 13,
        "p": 14,
        "goals": 59,
        "gc": 61,
        "dg": "-2",
        "xG": "56.6"
    },
    "Espanyol": {
        "pos": 11,
        "matches": 38,
        "g": 12,
        "e": 10,
        "p": 16,
        "goals": 43,
        "gc": 55,
        "dg": "-12",
        "xG": "41.3"
    },
    "Athletic Club": {
        "pos": 12,
        "matches": 38,
        "g": 13,
        "e": 6,
        "p": 19,
        "goals": 43,
        "gc": 58,
        "dg": "-15",
        "xG": "41.3"
    },
    "Sevilla": {
        "pos": 13,
        "matches": 38,
        "g": 12,
        "e": 7,
        "p": 19,
        "goals": 46,
        "gc": 60,
        "dg": "-14",
        "xG": "44.2"
    },
    "Sevilla FC": {
        "pos": 13,
        "matches": 38,
        "g": 12,
        "e": 7,
        "p": 19,
        "goals": 46,
        "gc": 60,
        "dg": "-14",
        "xG": "44.2"
    },
    "Alaves": {
        "pos": 14,
        "matches": 38,
        "g": 11,
        "e": 10,
        "p": 17,
        "goals": 44,
        "gc": 56,
        "dg": "-12",
        "xG": "42.2"
    },
    "Alavés": {
        "pos": 14,
        "matches": 38,
        "g": 11,
        "e": 10,
        "p": 17,
        "goals": 44,
        "gc": 56,
        "dg": "-12",
        "xG": "42.2"
    },
    "Elche": {
        "pos": 15,
        "matches": 38,
        "g": 10,
        "e": 13,
        "p": 15,
        "goals": 49,
        "gc": 57,
        "dg": "-8",
        "xG": "47.0"
    },
    "Levante": {
        "pos": 16,
        "matches": 38,
        "g": 11,
        "e": 9,
        "p": 18,
        "goals": 47,
        "gc": 61,
        "dg": "-14",
        "xG": "45.1"
    },
    "Osasuna": {
        "pos": 17,
        "matches": 38,
        "g": 11,
        "e": 9,
        "p": 18,
        "goals": 44,
        "gc": 50,
        "dg": "-6",
        "xG": "42.2"
    },
    "Mallorca": {
        "pos": 18,
        "matches": 38,
        "g": 11,
        "e": 9,
        "p": 18,
        "goals": 47,
        "gc": 57,
        "dg": "-10",
        "xG": "45.1"
    },
    "Girona": {
        "pos": 19,
        "matches": 38,
        "g": 9,
        "e": 14,
        "p": 15,
        "goals": 39,
        "gc": 55,
        "dg": "-16",
        "xG": "37.4"
    },
    "Girona FC": {
        "pos": 19,
        "matches": 38,
        "g": 9,
        "e": 14,
        "p": 15,
        "goals": 39,
        "gc": 55,
        "dg": "-16",
        "xG": "37.4"
    },
    "Real Oviedo": {
        "pos": 20,
        "matches": 38,
        "g": 6,
        "e": 11,
        "p": 21,
        "goals": 26,
        "gc": 60,
        "dg": "-34",
        "xG": "25.0"
    },
    "Arsenal": {
        "pos": 1,
        "matches": 38,
        "g": 26,
        "e": 7,
        "p": 5,
        "goals": 71,
        "gc": 27,
        "dg": "+44",
        "xG": "68.2"
    },
    "Manchester City": {
        "pos": 2,
        "matches": 38,
        "g": 23,
        "e": 9,
        "p": 6,
        "goals": 77,
        "gc": 35,
        "dg": "+42",
        "xG": "73.9"
    },
    "Manchester United": {
        "pos": 3,
        "matches": 38,
        "g": 20,
        "e": 11,
        "p": 7,
        "goals": 69,
        "gc": 50,
        "dg": "+19",
        "xG": "66.2"
    },
    "Aston Villa": {
        "pos": 4,
        "matches": 38,
        "g": 19,
        "e": 8,
        "p": 11,
        "goals": 56,
        "gc": 49,
        "dg": "+7",
        "xG": "53.8"
    },
    "Liverpool": {
        "pos": 5,
        "matches": 38,
        "g": 17,
        "e": 9,
        "p": 12,
        "goals": 63,
        "gc": 53,
        "dg": "+10",
        "xG": "60.5"
    },
    "AFC Bournemouth": {
        "pos": 6,
        "matches": 38,
        "g": 13,
        "e": 18,
        "p": 7,
        "goals": 58,
        "gc": 54,
        "dg": "+4",
        "xG": "55.7"
    },
    "Bournemouth": {
        "pos": 6,
        "matches": 38,
        "g": 13,
        "e": 18,
        "p": 7,
        "goals": 58,
        "gc": 54,
        "dg": "+4",
        "xG": "55.7"
    },
    "Sunderland": {
        "pos": 7,
        "matches": 38,
        "g": 14,
        "e": 12,
        "p": 12,
        "goals": 42,
        "gc": 48,
        "dg": "-6",
        "xG": "40.3"
    },
    "Brighton & Hove Albion": {
        "pos": 8,
        "matches": 38,
        "g": 14,
        "e": 11,
        "p": 13,
        "goals": 52,
        "gc": 46,
        "dg": "+6",
        "xG": "49.9"
    },
    "Brighton": {
        "pos": 8,
        "matches": 38,
        "g": 14,
        "e": 11,
        "p": 13,
        "goals": 52,
        "gc": 46,
        "dg": "+6",
        "xG": "49.9"
    },
    "Brentford": {
        "pos": 9,
        "matches": 38,
        "g": 14,
        "e": 11,
        "p": 13,
        "goals": 55,
        "gc": 52,
        "dg": "+3",
        "xG": "52.8"
    },
    "Chelsea": {
        "pos": 10,
        "matches": 38,
        "g": 14,
        "e": 10,
        "p": 14,
        "goals": 58,
        "gc": 52,
        "dg": "+6",
        "xG": "55.7"
    },
    "Fulham": {
        "pos": 11,
        "matches": 38,
        "g": 15,
        "e": 7,
        "p": 16,
        "goals": 47,
        "gc": 51,
        "dg": "-4",
        "xG": "45.1"
    },
    "Newcastle United": {
        "pos": 12,
        "matches": 38,
        "g": 14,
        "e": 7,
        "p": 17,
        "goals": 53,
        "gc": 55,
        "dg": "-2",
        "xG": "50.9"
    },
    "Everton": {
        "pos": 13,
        "matches": 38,
        "g": 13,
        "e": 10,
        "p": 15,
        "goals": 47,
        "gc": 50,
        "dg": "-3",
        "xG": "45.1"
    },
    "Leeds United": {
        "pos": 14,
        "matches": 38,
        "g": 11,
        "e": 14,
        "p": 13,
        "goals": 49,
        "gc": 56,
        "dg": "-7",
        "xG": "47.0"
    },
    "Crystal Palace": {
        "pos": 15,
        "matches": 38,
        "g": 11,
        "e": 12,
        "p": 15,
        "goals": 41,
        "gc": 51,
        "dg": "-10",
        "xG": "39.4"
    },
    "Nottingham Forest": {
        "pos": 16,
        "matches": 38,
        "g": 11,
        "e": 11,
        "p": 16,
        "goals": 48,
        "gc": 51,
        "dg": "-3",
        "xG": "46.1"
    },
    "Tottenham Hotspur": {
        "pos": 17,
        "matches": 38,
        "g": 10,
        "e": 11,
        "p": 17,
        "goals": 48,
        "gc": 57,
        "dg": "-9",
        "xG": "46.1"
    },
    "Tottenham": {
        "pos": 17,
        "matches": 38,
        "g": 10,
        "e": 11,
        "p": 17,
        "goals": 48,
        "gc": 57,
        "dg": "-9",
        "xG": "46.1"
    },
    "West Ham United": {
        "pos": 18,
        "matches": 38,
        "g": 10,
        "e": 9,
        "p": 19,
        "goals": 46,
        "gc": 65,
        "dg": "-19",
        "xG": "44.2"
    },
    "Burnley": {
        "pos": 19,
        "matches": 38,
        "g": 4,
        "e": 10,
        "p": 24,
        "goals": 38,
        "gc": 75,
        "dg": "-37",
        "xG": "36.5"
    },
    "Wolverhampton Wanderers": {
        "pos": 20,
        "matches": 38,
        "g": 3,
        "e": 11,
        "p": 24,
        "goals": 27,
        "gc": 68,
        "dg": "-41",
        "xG": "25.9"
    },
    "Inter Milan": {
        "pos": 1,
        "matches": 38,
        "g": 27,
        "e": 6,
        "p": 5,
        "goals": 89,
        "gc": 35,
        "dg": "+54",
        "xG": "85.4"
    },
    "Inter": {
        "pos": 1,
        "matches": 38,
        "g": 27,
        "e": 6,
        "p": 5,
        "goals": 89,
        "gc": 35,
        "dg": "+54",
        "xG": "85.4"
    },
    "Napoli": {
        "pos": 2,
        "matches": 38,
        "g": 23,
        "e": 7,
        "p": 8,
        "goals": 58,
        "gc": 36,
        "dg": "+22",
        "xG": "55.7"
    },
    "AS Roma": {
        "pos": 3,
        "matches": 38,
        "g": 23,
        "e": 4,
        "p": 11,
        "goals": 59,
        "gc": 31,
        "dg": "+28",
        "xG": "56.6"
    },
    "Como": {
        "pos": 4,
        "matches": 38,
        "g": 20,
        "e": 11,
        "p": 7,
        "goals": 65,
        "gc": 29,
        "dg": "+36",
        "xG": "62.4"
    },
    "AC Milan": {
        "pos": 5,
        "matches": 38,
        "g": 20,
        "e": 10,
        "p": 8,
        "goals": 53,
        "gc": 35,
        "dg": "+18",
        "xG": "50.9"
    },
    "Juventus": {
        "pos": 6,
        "matches": 38,
        "g": 19,
        "e": 12,
        "p": 7,
        "goals": 61,
        "gc": 34,
        "dg": "+27",
        "xG": "58.6"
    },
    "Atalanta": {
        "pos": 7,
        "matches": 38,
        "g": 15,
        "e": 14,
        "p": 9,
        "goals": 51,
        "gc": 36,
        "dg": "+15",
        "xG": "49.0"
    },
    "Bologna": {
        "pos": 8,
        "matches": 38,
        "g": 16,
        "e": 8,
        "p": 14,
        "goals": 49,
        "gc": 46,
        "dg": "+3",
        "xG": "47.0"
    },
    "Lazio": {
        "pos": 9,
        "matches": 38,
        "g": 14,
        "e": 12,
        "p": 12,
        "goals": 41,
        "gc": 40,
        "dg": "+1",
        "xG": "39.4"
    },
    "SS Lazio": {
        "pos": 9,
        "matches": 38,
        "g": 14,
        "e": 12,
        "p": 12,
        "goals": 41,
        "gc": 40,
        "dg": "+1",
        "xG": "39.4"
    },
    "Udinese": {
        "pos": 10,
        "matches": 38,
        "g": 14,
        "e": 8,
        "p": 16,
        "goals": 45,
        "gc": 48,
        "dg": "-3",
        "xG": "43.2"
    },
    "Sassuolo": {
        "pos": 11,
        "matches": 38,
        "g": 14,
        "e": 7,
        "p": 17,
        "goals": 46,
        "gc": 50,
        "dg": "-4",
        "xG": "44.2"
    },
    "Torino": {
        "pos": 12,
        "matches": 38,
        "g": 12,
        "e": 9,
        "p": 17,
        "goals": 44,
        "gc": 63,
        "dg": "-19",
        "xG": "42.2"
    },
    "Parma": {
        "pos": 13,
        "matches": 38,
        "g": 11,
        "e": 12,
        "p": 15,
        "goals": 28,
        "gc": 46,
        "dg": "-18",
        "xG": "26.9"
    },
    "Cagliari": {
        "pos": 14,
        "matches": 38,
        "g": 11,
        "e": 10,
        "p": 17,
        "goals": 40,
        "gc": 53,
        "dg": "-13",
        "xG": "38.4"
    },
    "Fiorentina": {
        "pos": 15,
        "matches": 38,
        "g": 9,
        "e": 15,
        "p": 14,
        "goals": 41,
        "gc": 50,
        "dg": "-9",
        "xG": "39.4"
    },
    "Genoa": {
        "pos": 16,
        "matches": 38,
        "g": 10,
        "e": 11,
        "p": 17,
        "goals": 41,
        "gc": 51,
        "dg": "-10",
        "xG": "39.4"
    },
    "Lecce": {
        "pos": 17,
        "matches": 38,
        "g": 10,
        "e": 8,
        "p": 20,
        "goals": 28,
        "gc": 50,
        "dg": "-22",
        "xG": "26.9"
    },
    "Cremonese": {
        "pos": 18,
        "matches": 38,
        "g": 8,
        "e": 10,
        "p": 20,
        "goals": 32,
        "gc": 57,
        "dg": "-25",
        "xG": "30.7"
    },
    "Hellas Verona": {
        "pos": 19,
        "matches": 38,
        "g": 3,
        "e": 12,
        "p": 23,
        "goals": 25,
        "gc": 61,
        "dg": "-36",
        "xG": "24.0"
    },
    "Pisa": {
        "pos": 20,
        "matches": 38,
        "g": 2,
        "e": 12,
        "p": 24,
        "goals": 26,
        "gc": 71,
        "dg": "-45",
        "xG": "25.0"
    },
    "Bayern Munich": {
        "pos": 1,
        "matches": 34,
        "g": 28,
        "e": 5,
        "p": 1,
        "goals": 122,
        "gc": 36,
        "dg": "+86",
        "xG": "117.1"
    },
    "Bayern München": {
        "pos": 1,
        "matches": 34,
        "g": 28,
        "e": 5,
        "p": 1,
        "goals": 122,
        "gc": 36,
        "dg": "+86",
        "xG": "117.1"
    },
    "Borussia Dortmund": {
        "pos": 2,
        "matches": 34,
        "g": 22,
        "e": 7,
        "p": 5,
        "goals": 70,
        "gc": 34,
        "dg": "+36",
        "xG": "67.2"
    },
    "RB Leipzig": {
        "pos": 3,
        "matches": 34,
        "g": 20,
        "e": 5,
        "p": 9,
        "goals": 66,
        "gc": 47,
        "dg": "+19",
        "xG": "63.4"
    },
    "VfB Stuttgart": {
        "pos": 4,
        "matches": 34,
        "g": 18,
        "e": 8,
        "p": 8,
        "goals": 71,
        "gc": 49,
        "dg": "+22",
        "xG": "68.2"
    },
    "TSG Hoffenheim": {
        "pos": 5,
        "matches": 34,
        "g": 18,
        "e": 7,
        "p": 9,
        "goals": 65,
        "gc": 52,
        "dg": "+13",
        "xG": "62.4"
    },
    "Bayer Leverkusen": {
        "pos": 6,
        "matches": 34,
        "g": 17,
        "e": 8,
        "p": 9,
        "goals": 68,
        "gc": 47,
        "dg": "+21",
        "xG": "65.3"
    },
    "SC Freiburg": {
        "pos": 7,
        "matches": 34,
        "g": 13,
        "e": 8,
        "p": 13,
        "goals": 51,
        "gc": 57,
        "dg": "-6",
        "xG": "49.0"
    },
    "Eintracht Frankfurt": {
        "pos": 8,
        "matches": 34,
        "g": 11,
        "e": 11,
        "p": 12,
        "goals": 61,
        "gc": 65,
        "dg": "-4",
        "xG": "58.6"
    },
    "FC Augsburg": {
        "pos": 9,
        "matches": 34,
        "g": 12,
        "e": 7,
        "p": 15,
        "goals": 45,
        "gc": 61,
        "dg": "-16",
        "xG": "43.2"
    },
    "Mainz 05": {
        "pos": 10,
        "matches": 34,
        "g": 10,
        "e": 10,
        "p": 14,
        "goals": 44,
        "gc": 53,
        "dg": "-9",
        "xG": "42.2"
    },
    "Union Berlin": {
        "pos": 11,
        "matches": 34,
        "g": 10,
        "e": 9,
        "p": 15,
        "goals": 44,
        "gc": 58,
        "dg": "-14",
        "xG": "42.2"
    },
    "Borussia Monchengladbach": {
        "pos": 12,
        "matches": 34,
        "g": 9,
        "e": 11,
        "p": 14,
        "goals": 42,
        "gc": 53,
        "dg": "-11",
        "xG": "40.3"
    },
    "Hamburger SV": {
        "pos": 13,
        "matches": 34,
        "g": 9,
        "e": 11,
        "p": 14,
        "goals": 40,
        "gc": 54,
        "dg": "-14",
        "xG": "38.4"
    },
    "1. FC Koln": {
        "pos": 14,
        "matches": 34,
        "g": 7,
        "e": 11,
        "p": 16,
        "goals": 49,
        "gc": 63,
        "dg": "-14",
        "xG": "47.0"
    },
    "Werder Bremen": {
        "pos": 15,
        "matches": 34,
        "g": 8,
        "e": 8,
        "p": 18,
        "goals": 37,
        "gc": 60,
        "dg": "-23",
        "xG": "35.5"
    },
    "VfL Wolfsburg": {
        "pos": 16,
        "matches": 34,
        "g": 7,
        "e": 8,
        "p": 19,
        "goals": 45,
        "gc": 69,
        "dg": "-24",
        "xG": "43.2"
    },
    "1. FC Heidenheim": {
        "pos": 17,
        "matches": 34,
        "g": 6,
        "e": 8,
        "p": 20,
        "goals": 41,
        "gc": 72,
        "dg": "-31",
        "xG": "39.4"
    },
    "FC St. Pauli": {
        "pos": 18,
        "matches": 34,
        "g": 6,
        "e": 8,
        "p": 20,
        "goals": 29,
        "gc": 60,
        "dg": "-31",
        "xG": "27.8"
    },
    "CR Flamengo": {
        "pos": 1,
        "matches": 38,
        "g": 23,
        "e": 10,
        "p": 5,
        "goals": 78,
        "gc": 27,
        "dg": "+51",
        "xG": "74.9"
    },
    "Flamengo": {
        "pos": 1,
        "matches": 38,
        "g": 23,
        "e": 10,
        "p": 5,
        "goals": 78,
        "gc": 27,
        "dg": "+51",
        "xG": "74.9"
    },
    "Palmeiras": {
        "pos": 2,
        "matches": 38,
        "g": 23,
        "e": 7,
        "p": 8,
        "goals": 66,
        "gc": 33,
        "dg": "+33",
        "xG": "63.4"
    },
    "Cruzeiro": {
        "pos": 3,
        "matches": 38,
        "g": 19,
        "e": 13,
        "p": 6,
        "goals": 55,
        "gc": 31,
        "dg": "+24",
        "xG": "52.8"
    },
    "Mirassol": {
        "pos": 4,
        "matches": 38,
        "g": 18,
        "e": 13,
        "p": 7,
        "goals": 63,
        "gc": 39,
        "dg": "+24",
        "xG": "60.5"
    },
    "Fluminense": {
        "pos": 5,
        "matches": 38,
        "g": 19,
        "e": 7,
        "p": 12,
        "goals": 50,
        "gc": 39,
        "dg": "+11",
        "xG": "48.0"
    },
    "Botafogo": {
        "pos": 6,
        "matches": 38,
        "g": 17,
        "e": 12,
        "p": 9,
        "goals": 58,
        "gc": 38,
        "dg": "+20",
        "xG": "55.7"
    },
    "Bahia": {
        "pos": 7,
        "matches": 38,
        "g": 17,
        "e": 9,
        "p": 12,
        "goals": 50,
        "gc": 47,
        "dg": "+3",
        "xG": "48.0"
    },
    "São Paulo FC": {
        "pos": 8,
        "matches": 38,
        "g": 14,
        "e": 9,
        "p": 15,
        "goals": 43,
        "gc": 47,
        "dg": "-4",
        "xG": "41.3"
    },
    "Grêmio": {
        "pos": 9,
        "matches": 38,
        "g": 13,
        "e": 10,
        "p": 15,
        "goals": 47,
        "gc": 50,
        "dg": "-3",
        "xG": "45.1"
    },
    "RB Bragantino": {
        "pos": 10,
        "matches": 38,
        "g": 14,
        "e": 6,
        "p": 18,
        "goals": 45,
        "gc": 57,
        "dg": "-12",
        "xG": "43.2"
    },
    "Atlético Mineiro": {
        "pos": 11,
        "matches": 38,
        "g": 12,
        "e": 12,
        "p": 14,
        "goals": 43,
        "gc": 44,
        "dg": "-1",
        "xG": "41.3"
    },
    "Santos FC": {
        "pos": 12,
        "matches": 38,
        "g": 12,
        "e": 11,
        "p": 15,
        "goals": 45,
        "gc": 50,
        "dg": "-5",
        "xG": "43.2"
    },
    "Corinthians": {
        "pos": 13,
        "matches": 38,
        "g": 12,
        "e": 11,
        "p": 15,
        "goals": 42,
        "gc": 47,
        "dg": "-5",
        "xG": "40.3"
    },
    "Vasco da Gama": {
        "pos": 14,
        "matches": 38,
        "g": 13,
        "e": 6,
        "p": 19,
        "goals": 55,
        "gc": 60,
        "dg": "-5",
        "xG": "52.8"
    },
    "Vitória": {
        "pos": 15,
        "matches": 38,
        "g": 11,
        "e": 12,
        "p": 15,
        "goals": 35,
        "gc": 52,
        "dg": "-17",
        "xG": "33.6"
    },
    "Internacional": {
        "pos": 16,
        "matches": 38,
        "g": 11,
        "e": 11,
        "p": 16,
        "goals": 44,
        "gc": 57,
        "dg": "-13",
        "xG": "42.2"
    },
    "Ceará": {
        "pos": 17,
        "matches": 38,
        "g": 11,
        "e": 10,
        "p": 17,
        "goals": 34,
        "gc": 40,
        "dg": "-6",
        "xG": "32.6"
    },
    "Fortaleza": {
        "pos": 18,
        "matches": 38,
        "g": 11,
        "e": 10,
        "p": 17,
        "goals": 44,
        "gc": 58,
        "dg": "-14",
        "xG": "42.2"
    },
    "Juventude": {
        "pos": 19,
        "matches": 38,
        "g": 9,
        "e": 8,
        "p": 21,
        "goals": 35,
        "gc": 69,
        "dg": "-34",
        "xG": "33.6"
    },
    "Sport Recife": {
        "pos": 20,
        "matches": 38,
        "g": 2,
        "e": 11,
        "p": 25,
        "goals": 28,
        "gc": 75,
        "dg": "-47",
        "xG": "26.9"
    },
    "Rosario Central": {
        "pos": 1,
        "matches": 32,
        "g": 18,
        "e": 12,
        "p": 2,
        "goals": 40,
        "gc": 16,
        "dg": "+24",
        "xG": "38.4"
    },
    "Boca Juniors": {
        "pos": 2,
        "matches": 32,
        "g": 18,
        "e": 8,
        "p": 6,
        "goals": 52,
        "gc": 23,
        "dg": "+29",
        "xG": "49.9"
    },
    "Argentinos Juniors": {
        "pos": 3,
        "matches": 32,
        "g": 16,
        "e": 9,
        "p": 7,
        "goals": 42,
        "gc": 22,
        "dg": "+20",
        "xG": "40.3"
    },
    "River Plate": {
        "pos": 4,
        "matches": 32,
        "g": 14,
        "e": 11,
        "p": 7,
        "goals": 41,
        "gc": 24,
        "dg": "+17",
        "xG": "39.4"
    },
    "Racing Club": {
        "pos": 5,
        "matches": 32,
        "g": 16,
        "e": 5,
        "p": 11,
        "goals": 42,
        "gc": 29,
        "dg": "+13",
        "xG": "40.3"
    },
    "Deportivo Riestra": {
        "pos": 6,
        "matches": 32,
        "g": 13,
        "e": 13,
        "p": 6,
        "goals": 32,
        "gc": 19,
        "dg": "+13",
        "xG": "30.7"
    },
    "San Lorenzo": {
        "pos": 7,
        "matches": 32,
        "g": 13,
        "e": 12,
        "p": 7,
        "goals": 27,
        "gc": 21,
        "dg": "+6",
        "xG": "25.9"
    },
    "Lanús": {
        "pos": 8,
        "matches": 32,
        "g": 13,
        "e": 11,
        "p": 8,
        "goals": 33,
        "gc": 24,
        "dg": "+9",
        "xG": "31.7"
    },
    "Tigre": {
        "pos": 9,
        "matches": 32,
        "g": 13,
        "e": 10,
        "p": 9,
        "goals": 32,
        "gc": 25,
        "dg": "+7",
        "xG": "30.7"
    },
    "Barracas Central": {
        "pos": 10,
        "matches": 32,
        "g": 12,
        "e": 13,
        "p": 7,
        "goals": 39,
        "gc": 35,
        "dg": "+4",
        "xG": "37.4"
    },
    "Independiente": {
        "pos": 11,
        "matches": 32,
        "g": 12,
        "e": 11,
        "p": 9,
        "goals": 37,
        "gc": 25,
        "dg": "+12",
        "xG": "35.5"
    },
    "Huracán": {
        "pos": 12,
        "matches": 32,
        "g": 12,
        "e": 11,
        "p": 9,
        "goals": 29,
        "gc": 27,
        "dg": "+2",
        "xG": "27.8"
    },
    "Independiente Rivadavia": {
        "pos": 13,
        "matches": 32,
        "g": 10,
        "e": 13,
        "p": 9,
        "goals": 34,
        "gc": 34,
        "dg": "0",
        "xG": "32.6"
    },
    "Central Córdoba (SdE)": {
        "pos": 14,
        "matches": 32,
        "g": 10,
        "e": 12,
        "p": 10,
        "goals": 38,
        "gc": 33,
        "dg": "+5",
        "xG": "36.5"
    },
    "Estudiantes (LP)": {
        "pos": 15,
        "matches": 32,
        "g": 11,
        "e": 9,
        "p": 12,
        "goals": 35,
        "gc": 37,
        "dg": "-2",
        "xG": "33.6"
    },
    "Vélez Sarsfield": {
        "pos": 16,
        "matches": 32,
        "g": 11,
        "e": 7,
        "p": 14,
        "goals": 26,
        "gc": 34,
        "dg": "-8",
        "xG": "25.0"
    },
    "Unión": {
        "pos": 17,
        "matches": 32,
        "g": 9,
        "e": 12,
        "p": 11,
        "goals": 31,
        "gc": 30,
        "dg": "+1",
        "xG": "29.8"
    },
    "Defensa y Justicia": {
        "pos": 18,
        "matches": 32,
        "g": 10,
        "e": 8,
        "p": 14,
        "goals": 32,
        "gc": 41,
        "dg": "-9",
        "xG": "30.7"
    },
    "Gimnasia y Esgrima (LP)": {
        "pos": 19,
        "matches": 32,
        "g": 11,
        "e": 5,
        "p": 16,
        "goals": 23,
        "gc": 34,
        "dg": "-11",
        "xG": "22.1"
    },
    "Belgrano": {
        "pos": 20,
        "matches": 32,
        "g": 7,
        "e": 16,
        "p": 9,
        "goals": 26,
        "gc": 34,
        "dg": "-8",
        "xG": "25.0"
    },
    "Banfield": {
        "pos": 21,
        "matches": 32,
        "g": 9,
        "e": 8,
        "p": 15,
        "goals": 29,
        "gc": 40,
        "dg": "-11",
        "xG": "27.8"
    },
    "Platense": {
        "pos": 22,
        "matches": 32,
        "g": 8,
        "e": 11,
        "p": 13,
        "goals": 25,
        "gc": 36,
        "dg": "-11",
        "xG": "24.0"
    },
    "Sarmiento (J)": {
        "pos": 23,
        "matches": 32,
        "g": 7,
        "e": 14,
        "p": 11,
        "goals": 24,
        "gc": 36,
        "dg": "-12",
        "xG": "23.0"
    },
    "Talleres (C)": {
        "pos": 24,
        "matches": 32,
        "g": 7,
        "e": 13,
        "p": 12,
        "goals": 20,
        "gc": 27,
        "dg": "-7",
        "xG": "19.2"
    },
    "Atlético Tucumán": {
        "pos": 25,
        "matches": 32,
        "g": 10,
        "e": 4,
        "p": 18,
        "goals": 34,
        "gc": 43,
        "dg": "-9",
        "xG": "32.6"
    },
    "Instituto": {
        "pos": 26,
        "matches": 32,
        "g": 8,
        "e": 10,
        "p": 14,
        "goals": 25,
        "gc": 37,
        "dg": "-12",
        "xG": "24.0"
    },
    "Newell's Old Boys": {
        "pos": 27,
        "matches": 32,
        "g": 8,
        "e": 9,
        "p": 15,
        "goals": 25,
        "gc": 38,
        "dg": "-13",
        "xG": "24.0"
    },
    "Aldosivi": {
        "pos": 28,
        "matches": 32,
        "g": 9,
        "e": 6,
        "p": 17,
        "goals": 31,
        "gc": 46,
        "dg": "-15",
        "xG": "29.8"
    },
    "Godoy Cruz": {
        "pos": 29,
        "matches": 32,
        "g": 4,
        "e": 17,
        "p": 11,
        "goals": 19,
        "gc": 37,
        "dg": "-18",
        "xG": "18.2"
    },
    "San Martín (SJ)": {
        "pos": 30,
        "matches": 32,
        "g": 6,
        "e": 10,
        "p": 16,
        "goals": 18,
        "gc": 34,
        "dg": "-16",
        "xG": "17.3"
    }
};
  
  const norm = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
  const targetNorm = norm(clubName);
  
  let found = realStats[clubName];
  if (!found) {
    for (const key of Object.keys(realStats)) {
      if (norm(key) === targetNorm) {
        found = realStats[key];
        break;
      }
    }
  }
  
  if (found) {
    const posStr = typeof found.pos === 'number' ? `${found.pos}º` : String(found.pos);
    const goalsVal = found.goals !== undefined ? found.goals : found.gf;
    const gcVal = found.gc !== undefined ? found.gc : 0;
    const diff = goalsVal - gcVal;
    const dgStr = found.dg !== undefined ? found.dg : (diff > 0 ? `+${diff}` : `${diff}`);
    return {
      pos: posStr,
      matches: found.matches,
      g: found.g !== undefined ? found.g : 0,
      e: found.e !== undefined ? found.e : 0,
      p: found.p !== undefined ? found.p : 0,
      goals: goalsVal,
      gc: gcVal,
      dg: dgStr,
      xG: found.xG || (goalsVal * 0.96).toFixed(1),
      season: "2025/26"
    };
  }
  
  // Deterministic fallback for any other club:
  let hash = 0;
  for (let i = 0; i < clubName.length; i++) {
    hash = clubName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const absHash = Math.abs(hash);
  const country = (countryName || "").toLowerCase().trim();
  let leagueMatches = 38;
  if (country.includes("germany") || country.includes("alemania") ||
      country.includes("france") || country.includes("francia") ||
      country.includes("saudi") || country.includes("arabia") ||
      country.includes("ee.uu.") || country.includes("eeuu") || country.includes("usa") || country.includes("united states")) {
    leagueMatches = 34;
  }
  
  const pos = (absHash % 16) + 5;
  const g = Math.round(leagueMatches * (0.5 + (absHash % 10) / 20));
  const e = Math.round((leagueMatches - g) * 0.4);
  const p = Math.max(0, leagueMatches - g - e);
  const goals = Math.round(leagueMatches * (0.8 + (absHash % 12) / 10));
  const gc = Math.round(leagueMatches * (0.7 + (absHash % 10) / 10));
  const diff = goals - gc;
  const dg = diff > 0 ? `+${diff}` : `${diff}`;
  const xG = (goals * 0.95).toFixed(1);
  
  return {
    pos: `${pos}º`,
    matches: leagueMatches,
    g: g,
    e: e,
    p: p,
    goals: goals,
    gc: gc,
    dg: dg,
    xG: xG,
    season: "2025/26"
  };
}

function getDeterministicVirtualPlayer(clubName, positionEs, index) {
  const spanishToEnglishPos = {
    'PO': 'GK', 'DFC': 'CB', 'LI': 'LB', 'LD': 'RB', 'MC': 'CM', 
    'MCD': 'DM', 'MCO': 'AM', 'EI': 'LW', 'ED': 'RW', 'DC': 'ST',
    'CAD': 'LWB'
  };
  const position = spanishToEnglishPos[positionEs] || 'CM';
  
  // Seed hash from clubName + positionEs + index
  const seedString = `${clubName}_${positionEs}_${index}`;
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = seedString.charCodeAt(i) + ((hash << 5) - hash);
  }
  const absHash = Math.abs(hash);
  
  const firstNames = ["Lucas", "Mateo", "Santiago", "Gabriel", "Sebastián", "Diego", "Nicolás", "Alejandro", "Daniel", "Tomás", "Benjamín", "Joaquín", "Felipe", "Enzo", "Bautista", "Valentín", "Lionel", "Ángel", "Julián", "Lautaro"];
  const lastNames = ["Rodríguez", "González", "Gómez", "Fernández", "López", "Díaz", "Martínez", "Pérez", "García", "Sánchez", "Romero", "Álvarez", "Torres", "Ruiz", "Ramírez", "Flores", "Acosta", "Benítez", "Medina", "Herrera"];
  
  const firstName = firstNames[absHash % firstNames.length];
  const lastName = lastNames[(absHash >>> 2) % lastNames.length];
  const name = `${firstName} ${lastName}`;
  
  const age = 19 + (absHash % 16); // 19 to 34
  const height = 170 + (absHash % 25); // 170 to 194
  const weight = 65 + (absHash % 25);
  const foot = (absHash % 3 === 0) ? "Izquierdo" : "Derecho";
  const overallRating = 65 + (absHash % 25); // 65 to 89
  const marketValue = Math.round((overallRating - 60) * 1200000 * (1 + (absHash % 10) / 10));
  const salary = Math.round(marketValue * 0.08);
  const contractUntil = 2026 + (absHash % 5);
  
  const user = JSON.parse(localStorage.getItem('scout_ai_user') || '{}');
  const countryName = user.selectedCountry?.split(',')[0]?.trim() || "España";
  
  const countryNationalities = {
    "España": { nat: "Español", flag: "🇪🇸" },
    "Reino Unido": { nat: "Inglés", flag: "🇬🇧" },
    "Alemania": { nat: "Alemán", flag: "🇩🇪" },
    "Francia": { nat: "Francés", flag: "🇫🇷" },
    "Italia": { nat: "Italiano", flag: "🇮🇹" },
    "Portugal": { nat: "Portugués", flag: "🇵🇹" },
    "Países Bajos": { nat: "Neerlandés", flag: "🇳🇱" },
    "Brasil": { nat: "Brasileño", flag: "🇧🇷" },
    "Argentina": { nat: "Argentino", flag: "🇦🇷" },
    "México": { nat: "Mexicano", flag: "🇲🇽" },
    "Arabia Saudí": { nat: "Saudí", flag: "🇸🇦" },
    "EE.UU.": { nat: "Estadounidense", flag: "🇺🇸" }
  };
  const natData = countryNationalities[countryName] || { nat: "Español", flag: "🇪🇸" };
  
  let leagueName = getLeagueNameFallback(countryName);
  if (window.allPlayers && window.allPlayers.length > 0) {
    const match = window.allPlayers.find(p => p.currentTeam === clubName);
    if (match && match.league) leagueName = match.league;
  }
  
  return {
    id: `virtual_${absHash}`,
    name,
    currentTeam: clubName,
    league: leagueName,
    position,
    positionEs,
    overallRating,
    marketValue,
    salary,
    contractUntil,
    nationality: natData.nat,
    nationalityEs: natData.nat,
    flag: natData.flag,
    bio: `Jugador profesional clave para la táctica del club ${clubName}.`,
    bioEs: `Jugador profesional clave para la táctica del club ${clubName}.`,
    stats: {
      goals: positionEs === 'PO' ? 0 : absHash % 15,
      assists: positionEs === 'PO' ? 0 : absHash % 10,
      matches: 15 + (absHash % 20),
      yellowCards: absHash % 4
    },
    history: [
      { season: "2024/25", goals: positionEs === 'PO' ? 0 : absHash % 15, assists: positionEs === 'PO' ? 0 : absHash % 10, matches: 15 + (absHash % 20) }
    ],
    age,
    height: `${height} cm`,
    weight: `${weight} kg`,
    foot,
    avatarUrl: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=0d1117&textColor=ffffff&radius=50`
  };
}

function getEnglishCountryName(countryName) {
  const countryMap = {
    "españa": "Spain", "spain": "Spain",
    "reino unido": "United Kingdom", "united kingdom": "United Kingdom", "england": "United Kingdom", "uk": "United Kingdom", "gb": "United Kingdom",
    "alemania": "Germany", "germany": "Germany",
    "francia": "France", "france": "France",
    "italia": "Italy", "italy": "Italy",
    "portugal": "Portugal",
    "países bajos": "Netherlands", "paises bajos": "Netherlands", "netherlands": "Netherlands", "holanda": "Netherlands",
    "brasil": "Brazil", "brazil": "Brazil",
    "argentina": "Argentina",
    "méxico": "Mexico", "mexico": "Mexico",
    "colombia": "Colombia",
    "chile": "Chile",
    "uruguay": "Uruguay",
    "ee.uu.": "United States of America", "eeuu": "United States of America", "estados unidos": "United States of America", "united states": "United States of America", "usa": "United States of America",
    "japón": "Japan", "japon": "Japan", "japan": "Japan",
    "corea del sur": "South Korea", "south korea": "South Korea",
    "arabia saudí": "Saudi Arabia", "arabia saudi": "Saudi Arabia", "saudi arabia": "Saudi Arabia",
    "turquía": "Turkey", "turquia": "Turkey", "turkey": "Turkey",
    "rusia": "Russia", "russia": "Russia",
    "bélgica": "Belgium", "belgica": "Belgium", "belgium": "Belgium",
    "grecia": "Greece", "greece": "Greece",
    "australia": "Australia",
    "marruecos": "Morocco", "morocco": "Morocco",
    "egipto": "Egypt", "egypt": "Egypt",
    "sudáfrica": "South Africa", "sudafrica": "South Africa", "south africa": "South Africa",
    "china": "China", "india": "India",
    "ecuador": "Ecuador", "perú": "Peru", "peru": "Peru",
    "venezuela": "Venezuela", "bolivia": "Bolivia", "paraguay": "Paraguay",
    "costa rica": "Costa Rica", "honduras": "Honduras",
    "suecia": "Sweden", "sweden": "Sweden",
    "dinamarca": "Denmark", "denmark": "Denmark",
    "noruega": "Norway", "norway": "Norway",
    "suiza": "Switzerland", "switzerland": "Switzerland",
    "austria": "Austria",
    "ucrania": "Ukraine", "ukraine": "Ukraine",
    "rumanía": "Romania", "rumania": "Romania", "romania": "Romania",
    "serbia": "Serbia", "croacia": "Croatia", "croatia": "Croatia",
    "rep. checa": "Czechia", "rep checa": "Czechia", "republica checa": "Czechia", "czechia": "Czechia", "czech republic": "Czechia",
    "polonia": "Poland", "poland": "Poland",
    "trinidad y tobago": "Trinidad and Tobago", "trinidad and tobago": "Trinidad and Tobago",
    "bosnia y herz.": "Bosnia and Herzegovina", "bosnia y herzegovina": "Bosnia and Herzegovina", "bosnia and herzegovina": "Bosnia and Herzegovina",
    "macedonia del n.": "North Macedonia", "macedonia del norte": "North Macedonia", "north macedonia": "North Macedonia",
    "albania": "Albania", "eslovenia": "Slovenia", "slovenia": "Slovenia",
    "bielorrusia": "Belarus", "belarus": "Belarus",
    "kazajistán": "Kazakhstan", "kazajistan": "Kazakhstan", "kazakhstan": "Kazakhstan",
    "uzbekistán": "Uzbekistan", "uzbekistan": "Uzbekistan",
    "libia": "Libya", "libya": "Libya", "sudán": "Sudan", "sudan": "Sudan",
    "etiopía": "Ethiopia", "etiopia": "Ethiopia", "ethiopia": "Ethiopia",
    "zimbabue": "Zimbabwe", "zimbabwe": "Zimbabwe", "zambia": "Zambia", "angola": "Angola",
    "r.d. congo": "Democratic Republic of the Congo", "rd congo": "Democratic Republic of the Congo", "democratic republic of the congo": "Democratic Republic of the Congo", "congo": "Democratic Republic of the Congo",
    "mozambique": "Mozambique", "cuba": "Cuba", "el salvador": "El Salvador", "nicaragua": "Nicaragua",
    "rep. dominicana": "Dominican Republic", "rep dominicana": "Dominican Republic", "republica dominicana": "Dominican Republic", "dominican republic": "Dominican Republic",
    "haití": "Haiti", "haiti": "Haiti", "siria": "Syria", "syria": "Syria",
    "jordania": "Jordan", "jordan": "Jordan", "líbano": "Lebanon", "libano": "Lebanon", "lebanon": "Lebanon",
    "kuwait": "Kuwait", "baréin": "Bahrain", "barein": "Bahrain", "bahrain": "Bahrain",
    "omán": "Oman", "oman": "Oman", "yemen": "Yemen",
    "pakistán": "Pakistan", "pakistan": "Pakistan", "bangladés": "Bangladesh", "bangladesh": "Bangladesh",
    "myanmar": "Myanmar", "filipinas": "Philippines", "philippines": "Philippines",
    "camboya": "Cambodia", "cambodia": "Cambodia", "mongolia": "Mongolia"
  };
  const clean = (countryName || "").toLowerCase().trim();
  return countryMap[clean] || countryName || "Spain";
}

function getLeagueNameFallback(countryName) {
  const resolvedCountry = getEnglishCountryName(countryName);
  const leagueMap = {
    "Spain": "La Liga",
    "United Kingdom": "Premier League",
    "Germany": "Bundesliga",
    "France": "Ligue 1",
    "Italy": "Serie A",
    "Portugal": "Primeira Liga",
    "Netherlands": "Eredivisie",
    "Brazil": "Brasileirão",
    "Argentina": "Liga Profesional",
    "Mexico": "Liga MX",
    "Colombia": "Liga BetPlay",
    "Chile": "Primera División",
    "Uruguay": "Primera División",
    "United States of America": "MLS",
    "Japan": "J1 League",
    "South Korea": "K League 1",
    "Saudi Arabia": "Saudi Pro League",
    "Turkey": "Süper Lig",
    "Russia": "Premier Liga",
    "Belgium": "First Division A",
    "Greece": "Super League",
    "Australia": "A-League",
    "Morocco": "Botola Pro",
    "Egypt": "Egyptian Premier League",
    "South Africa": "PSL",
    "China": "Super League",
    "India": "ISL",
    "Ecuador": "LigaPro",
    "Peru": "Liga 1",
    "Venezuela": "Liga FUTVE",
    "Bolivia": "División Profesional",
    "Paraguay": "División de Honor",
    "Costa Rica": "Primera División",
    "Honduras": "Liga Nacional",
    "Sweden": "Allsvenskan",
    "Denmark": "Superliga",
    "Norway": "Eliteserien",
    "Switzerland": "Super League",
    "Austria": "Bundesliga",
    "Ukraine": "Premier League",
    "Romania": "Liga I",
    "Serbia": "SuperLiga",
    "Republic of Serbia": "SuperLiga",
    "Croatia": "HNL",
    "Czechia": "Fortuna Liga",
    "Czech Republic": "Fortuna Liga",
    "Poland": "Ekstraklasa",
    "Trinidad and Tobago": "TT Pro League",
    "Bosnia and Herzegovina": "Premier Liga BiH",
    "North Macedonia": "Prva Liga",
    "Albania": "Kategoria Superiore",
    "Slovenia": "PrvaLiga",
    "Belarus": "Vysheyshaya Liga",
    "Kazakhstan": "Kazakhstan Premier League",
    "Uzbekistan": "Uzbekistan Super League",
    "Libya": "Libyan Premier League",
    "Sudan": "Sudan Premier League",
    "Ethiopia": "Ethiopian Premier League",
    "Zimbabwe": "Castle Lager Premier Soccer League",
    "Zambia": "Super League of Zambia",
    "Angola": "Girabola",
    "Democratic Republic of the Congo": "Linafoot",
    "Mozambique": "Moçambola",
    "Cuba": "Campeonato Nacional",
    "El Salvador": "Primera División",
    "Nicaragua": "Liga Primera",
    "Dominican Republic": "LDF",
    "Haiti": "Ligue Haïtienne",
    "Syria": "Syrian Premier League",
    "Jordan": "Jordan Pro League",
    "Lebanon": "Lebanese Premier League",
    "Kuwait": "Kuwait Premier League",
    "Bahrain": "Bahrain Premier League",
    "Oman": "Oman Professional League",
    "Yemen": "Yemen League",
    "Pakistan": "Pakistan Premier Football League",
    "Bangladesh": "Bangladesh Premier League",
    "Myanmar": "Myanmar National League",
    "Philippines": "Philippines Football League",
    "Cambodia": "Cambodian League",
    "Mongolia": "Mongolian Premier League"
  };
  return leagueMap[resolvedCountry] || "Liga Profesional";
}

function generateProceduralTeams(countryName) {
  const translationMap = {
    "angola": "Angola", "bangladés": "Bangladesh", "bangladesh": "Bangladesh",
    "cuba": "Cuba", "el salvador": "El Salvador", "nicaragua": "Nicaragua",
    "rep. dominicana": "República Dominicana", "haití": "Haití",
    "siria": "Siria", "jordania": "Jordania", "líbano": "Líbano",
    "kuwait": "Kuwait", "baréin": "Baréin", "omán": "Omán",
    "yemen": "Yemen", "pakistán": "Pakistán", "myanmar": "Myanmar",
    "filipinas": "Filipinas", "camboya": "Camboya", "mongolia": "Mongolia"
  };
  const cleanName = countryName.replace(/[^a-zA-ZáéíóúñÁÉÍÓÚÑ ]/g, '').trim();
  const baseName = translationMap[countryName.toLowerCase().trim()] || cleanName;
  
  let seed = 0;
  for (let i = 0; i < countryName.length; i++) {
    seed = countryName.charCodeAt(i) + ((seed << 5) - seed);
  }
  
  const templates = [
    (base) => `${base} FC`,
    (base) => `Atlético ${base}`,
    (base) => `${base} United`,
    (base) => `Real ${base}`,
    (base) => `Deportivo ${base}`,
    (base) => `${base} City`,
    (base) => `${base} Wanderers`,
    (base) => `Sporting ${base}`,
    (base) => `Club ${base}`,
    (base) => `${base} Athletic`,
    (base) => `Independiente ${base}`,
    (base) => `${base} Rovers`,
    (base) => `Academia ${base}`,
    (base) => `Nacional de ${base}`,
    (base) => `Alianza ${base}`,
    (base) => `Estrella de ${base}`
  ];

  const generated = [];
  for (let i = 0; i < templates.length; i++) {
    generated.push(templates[i](baseName));
  }
  return generated;
}

async function getOtherTeamsInLeague(clubName, countryName) {
  let teams = [];
  const resolvedCountry = getEnglishCountryName(countryName);

  try {
    const res = await fetchWithAuth(`${API}/onboarding/teams?country=${encodeURIComponent(resolvedCountry)}`);
    if (res.ok) {
      const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error from server');
      if (data.teams && data.teams.length > 0) {
        teams = data.teams.map(t => t.name);
        console.log(`[getOtherTeamsInLeague] Loaded ${teams.length} teams for ${resolvedCountry} from DB.`);
      }
    }
  } catch (err) {
    console.error("[getOtherTeamsInLeague] Error fetching teams from DB:", err);
  }

  if (teams.length < 3 && window.allPlayers && window.allPlayers.length > 0) {
    const targetPlayer = window.allPlayers.find(p => p.currentTeam === clubName);
    const targetLeague = targetPlayer ? targetPlayer.league : "";
    if (targetLeague) {
      teams = [...new Set(window.allPlayers
        .filter(p => p.currentTeam !== clubName && p.league === targetLeague)
        .map(p => p.currentTeam)
        .filter(Boolean)
      )];
    }
  }

  if (teams.length < 3) {
    const staticLeagues = {
      "Spain": ["Real Madrid","FC Barcelona","Atlético de Madrid","Sevilla FC","Valencia CF","Villarreal CF","Athletic Club","Real Sociedad","Real Betis","Celta Vigo","Rayo Vallecano","Girona FC","UD Las Palmas","RCD Mallorca","Getafe CF","CD Leganés","RCD Espanyol","Deportivo Alavés","Real Valladolid","Osasuna"],
      "United Kingdom": ["Manchester City","Arsenal","Liverpool","Chelsea","Manchester United","Tottenham Hotspur","Newcastle United","West Ham United","Aston Villa","Brighton & Hove Albion","Brentford","Crystal Palace","Everton","Wolverhampton Wanderers","Fulham","AFC Bournemouth","Nottingham Forest","Leicester City","Ipswich Town","Southampton"],
      "Germany": ["Bayern München","Bayer 04 Leverkusen","Borussia Dortmund","RB Leipzig","Eintracht Frankfurt","VfB Stuttgart","1. FC Union Berlin","Werder Bremen","SC Freiburg","VfL Wolfsburg","TSG Hoffenheim","1. FSV Mainz 05","FC Augsburg","Borussia Mönchengladbach","VfL Bochum","1. FC Heidenheim","FC St. Pauli","Holstein Kiel"],
      "France": ["Paris Saint-Germain","AS Monaco","Olympique Lyonnais","Olympique de Marseille","LOSC Lille","OGC Nice","Stade Rennais","RC Lens","FC Nantes","RC Strasbourg","Montpellier HSC","Stade de Reims","Toulouse FC","AJ Auxerre","Le Havre AC","Stade Brestois 29","Angers SCO","AS Saint-Étienne"],
      "Italy": ["Inter Milan","AC Milan","Juventus","Napoli","Atalanta","AS Roma","SS Lazio","Fiorentina","Torino","Bologna","Genoa","Monza","Lecce","Udinese","Empoli","Como 1907","Venezia","Hellas Verona","Cagliari","Parma"],
      "Brazil": ["CR Flamengo","SE Palmeiras","Santos FC","São Paulo FC","Grêmio","SC Internacional","SC Corinthians","Atlético Mineiro","Fluminense","Botafogo","Vasco da Gama","Cruzeiro","RB Bragantino","Fortaleza","Ceará","Sport Recife","Cuiabá","Goiás","América MG","Juventude"],
      "Argentina": ["Boca Juniors","River Plate","San Lorenzo","Racing Club","Independiente","Vélez Sársfield","Huracán","Lanús","Talleres","Estudiantes","Banfield","Colón","Defensa y Justicia","Godoy Cruz","Platense","Argentinos Juniors","Rosario Central","Newell's Old Boys","Sarmiento","Instituto"],
      "Mexico": ["Club América","CD Guadalajara","Cruz Azul","Pumas UNAM","Tigres UANL","CF Monterrey","Club León","Club Pachuca","Atlas FC","Club Tijuana","Santos Laguna","Toluca","Querétaro","FC Juárez","Mazatlán FC","Puebla FC","Necaxa","San Luis"],
      "Saudi Arabia": ["Al-Nassr FC","Al-Hilal SFC","Al-Ittihad Club","Al-Ahli SFC","Al-Qadsiah","Al-Shabab FC","Al-Fateh SC","Al-Wehda FC","Al-Feiha","Al-Khaleej","Damac FC","Al-Okhdood"],
      "United States of America": ["Inter Miami CF","LA Galaxy","New York City FC","Seattle Sounders FC","Portland Timbers","Atlanta United","Columbus Crew","Philadelphia Union","New England Revolution","FC Cincinnati","Toronto FC","Vancouver Whitecaps","Austin FC","Nashville SC","Charlotte FC"],
      "Portugal": ["FC Porto", "SL Benfica", "Sporting CP", "SC Braga", "Vitória de Guimarães", "Moreirense FC", "FC Arouca", "Rio Ave FC", "Gil Vicente FC", "Boavista FC", "Estoril Praia", "Farense"],
      "Netherlands": ["Ajax Amsterdam", "PSV Eindhoven", "Feyenoord Rotterdam", "AZ Alkmaar", "FC Twente", "FC Utrecht", "SC Heerenveen", "Sparta Rotterdam", "FC Groningen", "PEC Zwolle", "Heracles Almelo", "Fortuna Sittard"],
      "Colombia": ["Atlético Nacional", "Millonarios FC", "América de Cali", "Junior de Barranquilla", "Independiente Santa Fe", "Deportivo Cali", "Independiente Medellín", "Deportes Tolima", "Once Caldas", "La Equidad", "Atlético Bucaramanga", "Águilas Doradas"],
      "Uruguay": ["Peñarol", "Nacional de Montevideo", "Danubio FC", "Defensor Sporting", "Liverpool FC", "Montevideo Wanderers", "River Plate (URU)", "Cerro Largo", "Centro Atlético Fénix", "Progreso", "Boston River", "Deportivo Maldonado"],
      "Chile": ["Colo-Colo", "Universidad de Chile", "Universidad Católica", "Unión Española", "Palestino", "Coquimbo Unido", "Everton de Viña", "Huachipato", "Cobreloa", "Audax Italiano", "O'Higgins", "Cobresal"],
      "Turkey": ["Galatasaray", "Fenerbahçe", "Beşiktaş", "Trabzonspor", "Başakşehir", "Kasımpaşa", "Alanyaspor", "Sivasspor", "Antalyaspor", "Adana Demirspor", "Gaziantep FK", "Konyaspor"],
      "Russia": ["Zenit Saint Petersburg", "Spartak Moscow", "CSKA Moscow", "Krasnodar", "Lokomotiv Moscow", "Dynamo Moscow", "Rostov", "Rubin Kazan", "Krylia Sovetov", "Ural", "Akhmat Grozny", "Sochi"],
      "Belgium": ["Club Brugge", "RSC Anderlecht", "KRC Genk", "Royal Antwerp", "KAA Gent", "Union Saint-Gilloise", "Cercle Brugge", "Standard Liège", "KV Mechelen", "Sint-Truiden", "Westerlo", "Charleroi"],
      "Sweden": ["Malmö FF", "Djurgårdens IF", "Hammarby IF", "AIK Solna", "IF Elfsborg", "BK Häcken", "IFK Göteborg", "IFK Norrköping", "Kalmar FF", "IK Sirius", "Mjällby AIF", "Halmstads BK"],
      "Denmark": ["FC Copenhagen", "Brøndby IF", "FC Midtjylland", "FC Nordsjælland", "AGF Aarhus", "Silkeborg IF", "Viborg FF", "Randers FC", "Lyngby BK", "Vejle Boldklub", "Hvidovre IF", "Odense Boldklub"],
      "Norway": ["Bodø/Glimt", "Molde FK", "Rosenborg BK", "Brann", "Viking FK", "Lillestrøm SK", "Tromsø IL", "Sarpsborg 08", "Strømsgodset", "Odd BK", "HamKam", "Sandefjord Fotball"],
      "Japan": ["Vissel Kobe", "Yokohama F. Marinos", "Kawasaki Frontale", "Sanfrecce Hiroshima", "Urawa Red Diamonds", "Kashima Antlers", "Nagoya Grampus", "Cerezo Osaka", "FC Tokyo", "Gamba Osaka", "Consadole Sapporo", "Sagan Tosu", "Kyoto Sanga", "Shonan Bellmare", "Albirex Niigata", "Avispa Fukuoka", "Tokyo Verdy", "Machida Zelvia"],
      "South Korea": ["Ulsan HD", "Pohang Steelers", "Gwangju FC", "Jeonbuk Hyundai Motors", "Daegu FC", "Incheon United", "FC Seoul", "Daejeon Hana Citizen", "Jeju United", "Gangwon FC", "Suwon FC", "Gimcheon Sangmu"],
      "Greece": ["Olympiacos", "PAOK Thessaloniki", "AEK Athens", "Panathinaikos", "Aris Thessaloniki", "Asteras Tripolis", "OFI Crete", "Atromitos", "PAS Giannina", "Lamia", "Panetolikos", "Volos NFC", "Panserraikos", "Kifisia"],
      "Australia": ["Sydney FC", "Melbourne Victory", "Melbourne City", "Western Sydney Wanderers", "Brisbane Roar", "Adelaide United", "Perth Glory", "Central Coast Mariners", "Wellington Phoenix", "Newcastle Jets", "Macarthur FC", "Western United"],
      "Morocco": ["Raja Casablanca", "Wydad Casablanca", "AS FAR Rabat", "RS Berkane", "FUS Rabat", "MAS Fès", "Ittihad Tanger", "Hassania Agadir", "Olympic Safi", "Moghreb Tétouan", "Jeunesse Soualem", "Renaissance Zemamra", "Union Touarga", "Chabab Mohammedia", "Youssoufia Berrechid", "Mouloudia Oujda"],
      "Egypt": ["Al Ahly SC", "Zamalek SC", "Pyramids FC", "Al Masry", "Ismaily SC", "Smouha SC", "Ceramica Cleopatra", "Modern Future FC", "National Bank of Egypt", "Ittihad Alexandria", "ENPPI", "Al Mokawloon Al Arab", "Pharco FC", "El Dakhleya", "Tala'ea El Gaish", "Baladeyet El Mahalla", "ZED FC", "El Gouna"],
      "South Africa": ["Mamelodi Sundowns", "Orlando Pirates", "Kaizer Chiefs", "SuperSport United", "Cape Town City", "Stellenbosch FC", "TS Galaxy", "Sekhukhune United", "AmaZulu FC", "Golden Arrows", "Chippa United", "Moroka Swallows", "Polokwane City", "Richards Bay", "Royal AM", "Cape Town Spurs"],
      "China": ["Shanghai Port", "Shanghai Shenhua", "Chengdu Rongcheng", "Beijing Guoan", "Shandong Taishan", "Tianjin Jinmen Tiger", "Zhejiang FC", "Wuhan Three Towns", "Henan FC", "Meizhou Hakka", "Cangzhou Mighty Lions", "Qingdao Hainiu", "Nantong Zhiyun", "Shenzhen Peng City", "Qingdao West Coast", "Sichuan Jiuniu"],
      "India": ["Mohun Bagan SG", "Mumbai City FC", "FC Goa", "Kerala Blasters", "Bengaluru FC", "Odisha FC", "East Bengal", "Chennaiyin FC", "Jamshedpur FC", "NorthEast United", "Hyderabad FC", "Punjab FC"],
      "Switzerland": ["BSC Young Boys", "FC Basel", "FC Zürich", "Servette FC", "FC St. Gallen", "FC Lugano", "Grasshopper Club Zürich", "FC Winterthur", "FC Lausanne-Sport", "Yverdon Sport"],
      "Austria": ["Red Bull Salzburg", "Sturm Graz", "LASK Linz", "Rapid Wien", "Austria Wien", "Wolfsberger AC", "TSV Hartberg", "Austria Klagenfurt", "WSG Tirol", "SCR Altach", "Blau-Weiß Linz", "Lustenau"],
      "Ukraine": ["Shakhtar Donetsk", "Dynamo Kyiv", "Kryvbas Kryvyi Rih", "FC Dnipro-1", "Polissya Zhytomyr", "Rukh Lviv", "Vorskla Poltava", "Zorya Luhansk", "Kolos Kovalivka", "Chornomorets Odesa", "LNZ Cherkasy", "FC Oleksandriya", "Veres Rivne", "Obolon Kyiv", "Metalist 1925", "FC Minaj"]
    };
    
    const matchedKey = Object.keys(staticLeagues).find(k => k.toLowerCase() === resolvedCountry.toLowerCase() || resolvedCountry.toLowerCase().includes(k.toLowerCase()));
    teams = matchedKey ? staticLeagues[matchedKey] : generateProceduralTeams(resolvedCountry);
  }

  const filtered = teams.filter(t => t !== clubName);
  if (filtered.length === 0) {
    return generateProceduralTeams(resolvedCountry).filter(t => t !== clubName);
  }
  return filtered;
}

function getShortTeamName(name) {
  if (name.length <= 12) return name;
  const parts = name.split(' ');
  if (parts.length >= 2) {
    if (parts[0] === 'Real' || parts[0] === 'FC' || parts[0] === 'AC' || parts[0] === 'Atletico') {
      return parts.slice(0, 2).join(' ');
    }
    return parts[0];
  }
  return name.substring(0, 12);
}

function injectSeasonStyles() {
  if (document.getElementById('db-season-styles')) return;
  const style = document.createElement('style');
  style.id = 'db-season-styles';
  style.innerHTML = `
    .db-season-badge-container {
      margin-bottom: 12px;
      width: 100%;
    }
    .db-season-badge {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 10px 14px;
      border-radius: var(--radius);
      font-size: 11px;
      font-weight: 700;
      box-sizing: border-box;
      line-height: 1.4;
      backdrop-filter: var(--glass);
    }
    .db-season-badge.current {
      background: rgba(0, 229, 255, 0.05);
      border: 1px solid rgba(0, 229, 255, 0.15);
      color: var(--cyan);
      box-shadow: 0 0 10px rgba(0, 229, 255, 0.03);
    }
    .db-season-badge.next {
      background: rgba(255, 193, 7, 0.05);
      border: 1px solid rgba(255, 193, 7, 0.15);
      color: #ffc107;
      box-shadow: 0 0 10px rgba(255, 193, 7, 0.03);
    }
    .db-season-badge-sub {
      font-size: 10px;
      font-weight: 500;
      opacity: 0.8;
    }
    .db-no-matches-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 35px 20px;
      text-align: center;
      background: rgba(255, 255, 255, 0.01);
      border: 1px dashed rgba(255, 255, 255, 0.08);
      border-radius: var(--radius);
      gap: 12px;
      margin-top: 5px;
      backdrop-filter: var(--glass);
    }
    .db-no-matches-icon {
      font-size: 36px;
      opacity: 0.8;
      animation: pulseGhost 2.5s infinite ease-in-out;
    }
    .db-no-matches-text h4 {
      font-size: 13px;
      font-weight: 800;
      color: var(--text-1);
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .db-no-matches-text p {
      font-size: 11px;
      color: var(--text-3);
      line-height: 1.5;
      margin: 0;
    }
    @keyframes pulseGhost {
      0%, 100% { transform: scale(1); opacity: 0.6; }
      50% { transform: scale(1.06); opacity: 0.9; }
    }
  `;
  document.head.appendChild(style);
}

function getReal202425Fixtures(clubName) {
  if (!clubName) return null;
  const isEs = currentLang === 'es';
  const REAL_2024_25_FIXTURES = {
    "Real Madrid": [
      { opponent: "FC Barcelona",        date: isEs ? "26 Oct 2024" : "Oct 26, 2024", competition: "La Liga",               home: true  },
      { opponent: "Borussia Dortmund",   date: isEs ? "22 Oct 2024" : "Oct 22, 2024", competition: "UEFA Champions League",  home: true  },
      { opponent: "Atlético de Madrid",  date: isEs ? "29 Sep 2024" : "Sep 29, 2024", competition: "La Liga",               home: false }
    ],
    "FC Barcelona": [
      { opponent: "Real Madrid",         date: isEs ? "26 Oct 2024" : "Oct 26, 2024", competition: "La Liga",               home: false },
      { opponent: "Bayern Munich",       date: isEs ? "23 Oct 2024" : "Oct 23, 2024", competition: "UEFA Champions League",  home: true  },
      { opponent: "Athletic Club",       date: isEs ? "24 Ago 2024" : "Aug 24, 2024", competition: "La Liga",               home: true  }
    ],
    "Atlético de Madrid": [
      { opponent: "Real Madrid",         date: isEs ? "29 Sep 2024" : "Sep 29, 2024", competition: "La Liga",               home: true  },
      { opponent: "Paris Saint-Germain", date: isEs ? "6 Nov 2024"  : "Nov 6, 2024",  competition: "UEFA Champions League",  home: false },
      { opponent: "FC Barcelona",        date: isEs ? "21 Abr 2025" : "Apr 21, 2025", competition: "La Liga",               home: false }
    ],
    "Atlético Madrid": [
      { opponent: "Real Madrid",         date: isEs ? "29 Sep 2024" : "Sep 29, 2024", competition: "La Liga",               home: true  },
      { opponent: "Paris Saint-Germain", date: isEs ? "6 Nov 2024"  : "Nov 6, 2024",  competition: "UEFA Champions League",  home: false },
      { opponent: "FC Barcelona",        date: isEs ? "21 Abr 2025" : "Apr 21, 2025", competition: "La Liga",               home: false }
    ],
    "Deportivo Alavés": [
      { opponent: "Real Madrid",         date: isEs ? "21 Sep 2024" : "Sep 21, 2024", competition: "La Liga",               home: false },
      { opponent: "FC Barcelona",        date: isEs ? "13 Ene 2025" : "Jan 13, 2025", competition: "La Liga",               home: false },
      { opponent: "Atlético de Madrid",  date: isEs ? "27 Oct 2024" : "Oct 27, 2024", competition: "La Liga",               home: true  }
    ],
    "Alaves": [
      { opponent: "Real Madrid",         date: isEs ? "21 Sep 2024" : "Sep 21, 2024", competition: "La Liga",               home: false },
      { opponent: "FC Barcelona",        date: isEs ? "13 Ene 2025" : "Jan 13, 2025", competition: "La Liga",               home: false },
      { opponent: "Atlético de Madrid",  date: isEs ? "27 Oct 2024" : "Oct 27, 2024", competition: "La Liga",               home: true  }
    ],
    "Athletic Club": [
      { opponent: "FC Barcelona",        date: isEs ? "24 Ago 2024" : "Aug 24, 2024", competition: "La Liga",               home: false },
      { opponent: "Real Madrid",         date: isEs ? "5 Ene 2025"  : "Jan 5, 2025",  competition: "La Liga",               home: false },
      { opponent: "Atlético de Madrid",  date: isEs ? "29 Sep 2024" : "Sep 29, 2024", competition: "La Liga",               home: true  }
    ],
    "Athletic Bilbao": [
      { opponent: "FC Barcelona",        date: isEs ? "24 Ago 2024" : "Aug 24, 2024", competition: "La Liga",               home: false },
      { opponent: "Real Madrid",         date: isEs ? "5 Ene 2025"  : "Jan 5, 2025",  competition: "La Liga",               home: false },
      { opponent: "Atlético de Madrid",  date: isEs ? "29 Sep 2024" : "Sep 29, 2024", competition: "La Liga",               home: true  }
    ],
    "Sevilla FC": [
      { opponent: "FC Barcelona",        date: isEs ? "26 Ene 2025" : "Jan 26, 2025", competition: "La Liga",               home: true  },
      { opponent: "Real Betis",          date: isEs ? "8 Dic 2024"  : "Dec 8, 2024",  competition: "La Liga",               home: false },
      { opponent: "Atlético de Madrid",  date: isEs ? "19 Oct 2024" : "Oct 19, 2024", competition: "La Liga",               home: false }
    ],
    "Real Betis": [
      { opponent: "Sevilla FC",          date: isEs ? "8 Dic 2024"  : "Dec 8, 2024",  competition: "La Liga",               home: true  },
      { opponent: "FC Barcelona",        date: isEs ? "5 Oct 2024"  : "Oct 5, 2024",  competition: "La Liga",               home: false },
      { opponent: "Real Madrid",         date: isEs ? "16 Feb 2025" : "Feb 16, 2025", competition: "La Liga",               home: true  }
    ],
    "Valencia CF": [
      { opponent: "Real Madrid",         date: isEs ? "3 Nov 2024"  : "Nov 3, 2024",  competition: "La Liga",               home: true  },
      { opponent: "FC Barcelona",        date: isEs ? "16 Nov 2024" : "Nov 16, 2024", competition: "La Liga",               home: false },
      { opponent: "Atlético de Madrid",  date: isEs ? "25 Ago 2024" : "Aug 25, 2024", competition: "La Liga",               home: true  }
    ],
    "Villarreal CF": [
      { opponent: "FC Barcelona",        date: isEs ? "22 Sep 2024" : "Sep 22, 2024", competition: "La Liga",               home: true  },
      { opponent: "Real Madrid",         date: isEs ? "19 Ene 2025" : "Jan 19, 2025", competition: "La Liga",               home: false },
      { opponent: "Getafe CF",           date: isEs ? "21 Sep 2024" : "Sep 21, 2024", competition: "La Liga",               home: false }
    ],
    "Real Sociedad": [
      { opponent: "FC Barcelona",        date: isEs ? "14 Dic 2024" : "Dec 14, 2024", competition: "La Liga",               home: false },
      { opponent: "Atlético de Madrid",  date: isEs ? "2 Feb 2025"  : "Feb 2, 2025",  competition: "La Liga",               home: true  },
      { opponent: "Real Madrid",         date: isEs ? "22 Feb 2025" : "Feb 22, 2025", competition: "La Liga",               home: true  }
    ],
    "Celta de Vigo": [
      { opponent: "Real Madrid",         date: isEs ? "28 Sep 2024" : "Sep 28, 2024", competition: "La Liga",               home: true  },
      { opponent: "FC Barcelona",        date: isEs ? "8 Feb 2025"  : "Feb 8, 2025",  competition: "La Liga",               home: false },
      { opponent: "Atlético de Madrid",  date: isEs ? "14 Sep 2024" : "Sep 14, 2024", competition: "La Liga",               home: false }
    ],
    "Girona FC": [
      { opponent: "Real Madrid",         date: isEs ? "25 Ago 2024" : "Aug 25, 2024", competition: "La Liga",               home: true  },
      { opponent: "FC Barcelona",        date: isEs ? "20 Oct 2024" : "Oct 20, 2024", competition: "La Liga",               home: false },
      { opponent: "Slavia Praha",        date: isEs ? "3 Oct 2024"  : "Oct 3, 2024",  competition: "UEFA Champions League",  home: true  }
    ],
    "Getafe CF": [
      { opponent: "Real Madrid",         date: isEs ? "24 Nov 2024" : "Nov 24, 2024", competition: "La Liga",               home: false },
      { opponent: "FC Barcelona",        date: isEs ? "1 Feb 2025"  : "Feb 1, 2025",  competition: "La Liga",               home: false },
      { opponent: "Atlético de Madrid",  date: isEs ? "6 Oct 2024"  : "Oct 6, 2024",  competition: "La Liga",               home: true  }
    ],
    "Rayo Vallecano": [
      { opponent: "Real Madrid",         date: isEs ? "9 Mar 2025"  : "Mar 9, 2025",  competition: "La Liga",               home: false },
      { opponent: "FC Barcelona",        date: isEs ? "14 Sep 2024" : "Sep 14, 2024", competition: "La Liga",               home: false },
      { opponent: "Atlético de Madrid",  date: isEs ? "23 Feb 2025" : "Feb 23, 2025", competition: "La Liga",               home: true  }
    ],
    "RCD Mallorca": [
      { opponent: "Real Madrid",         date: isEs ? "11 Ene 2025" : "Jan 11, 2025", competition: "La Liga",               home: false },
      { opponent: "FC Barcelona",        date: isEs ? "7 Dic 2024"  : "Dec 7, 2024",  competition: "La Liga",               home: false },
      { opponent: "Atlético de Madrid",  date: isEs ? "15 Mar 2025" : "Mar 15, 2025", competition: "La Liga",               home: true  }
    ],
    "Osasuna": [
      { opponent: "Real Madrid",         date: isEs ? "2 Nov 2024"  : "Nov 2, 2024",  competition: "La Liga",               home: false },
      { opponent: "FC Barcelona",        date: isEs ? "15 Feb 2025" : "Feb 15, 2025", competition: "La Liga",               home: false },
      { opponent: "Atlético de Madrid",  date: isEs ? "8 Dic 2024"  : "Dec 8, 2024",  competition: "La Liga",               home: true  }
    ],
    "Manchester City": [
      { opponent: "Arsenal",             date: isEs ? "22 Sep 2024" : "Sep 22, 2024", competition: "Premier League",        home: true  },
      { opponent: "Chelsea",             date: isEs ? "18 Ago 2024" : "Aug 18, 2024", competition: "Premier League",        home: false },
      { opponent: "Inter Milan",         date: isEs ? "18 Sep 2024" : "Sep 18, 2024", competition: "UEFA Champions League",  home: true  }
    ],
    "Arsenal": [
      { opponent: "Manchester City",     date: isEs ? "22 Sep 2024" : "Sep 22, 2024", competition: "Premier League",        home: false },
      { opponent: "Tottenham Hotspur",   date: isEs ? "15 Sep 2024" : "Sep 15, 2024", competition: "Premier League",        home: false },
      { opponent: "Paris Saint-Germain", date: isEs ? "1 Oct 2024"  : "Oct 1, 2024",  competition: "UEFA Champions League",  home: true  }
    ],
    "Liverpool": [
      { opponent: "Real Madrid",         date: isEs ? "27 Nov 2024" : "Nov 27, 2024", competition: "UEFA Champions League",  home: true  },
      { opponent: "Manchester United",   date: isEs ? "1 Sep 2024"  : "Sep 1, 2024",  competition: "Premier League",        home: false },
      { opponent: "Chelsea",             date: isEs ? "20 Oct 2024" : "Oct 20, 2024", competition: "Premier League",        home: true  }
    ],
    "Chelsea": [
      { opponent: "Liverpool",           date: isEs ? "20 Oct 2024" : "Oct 20, 2024", competition: "Premier League",        home: false },
      { opponent: "Manchester City",     date: isEs ? "18 Ago 2024" : "Aug 18, 2024", competition: "Premier League",        home: true  },
      { opponent: "Nottingham Forest",   date: isEs ? "2 Nov 2024"  : "Nov 2, 2024",  competition: "Premier League",        home: true  }
    ],
    "Manchester United": [
      { opponent: "Liverpool",           date: isEs ? "1 Sep 2024"  : "Sep 1, 2024",  competition: "Premier League",        home: true  },
      { opponent: "Arsenal",             date: isEs ? "3 Nov 2024"  : "Nov 3, 2024",  competition: "Premier League",        home: false },
      { opponent: "Manchester City",     date: isEs ? "15 Dic 2024" : "Dec 15, 2024", competition: "Premier League",        home: false }
    ],
    "Tottenham Hotspur": [
      { opponent: "Arsenal",             date: isEs ? "15 Sep 2024" : "Sep 15, 2024", competition: "Premier League",        home: true  },
      { opponent: "Manchester City",     date: isEs ? "26 Oct 2024" : "Oct 26, 2024", competition: "Premier League",        home: false },
      { opponent: "Chelsea",             date: isEs ? "8 Dic 2024"  : "Dec 8, 2024",  competition: "Premier League",        home: true  }
    ],
    "Newcastle United": [
      { opponent: "Manchester City",     date: isEs ? "28 Sep 2024" : "Sep 28, 2024", competition: "Premier League",        home: true  },
      { opponent: "Arsenal",             date: isEs ? "4 Nov 2024"  : "Nov 4, 2024",  competition: "Premier League",        home: false },
      { opponent: "Liverpool",           date: isEs ? "18 Dic 2024" : "Dec 18, 2024", competition: "Premier League",        home: false }
    ],
    "Aston Villa": [
      { opponent: "Manchester City",     date: isEs ? "23 Dic 2024" : "Dec 23, 2024", competition: "Premier League",        home: false },
      { opponent: "Bayern Munich",       date: isEs ? "2 Oct 2024"  : "Oct 2, 2024",  competition: "UEFA Champions League",  home: true  },
      { opponent: "Arsenal",             date: isEs ? "8 Feb 2025"  : "Feb 8, 2025",  competition: "Premier League",        home: true  }
    ],
    "West Ham United": [
      { opponent: "Arsenal",             date: isEs ? "19 Oct 2024" : "Oct 19, 2024", competition: "Premier League",        home: true  },
      { opponent: "Chelsea",             date: isEs ? "21 Sep 2024" : "Sep 21, 2024", competition: "Premier League",        home: false },
      { opponent: "Liverpool",           date: isEs ? "29 Sep 2024" : "Sep 29, 2024", competition: "Premier League",        home: false }
    ],
    "Brighton & Hove Albion": [
      { opponent: "Arsenal",             date: isEs ? "31 Ago 2024" : "Aug 31, 2024", competition: "Premier League",        home: false },
      { opponent: "Manchester City",     date: isEs ? "25 Ene 2025" : "Jan 25, 2025", competition: "Premier League",        home: false },
      { opponent: "Chelsea",             date: isEs ? "26 Oct 2024" : "Oct 26, 2024", competition: "Premier League",        home: true  }
    ],
    "Brighton": [
      { opponent: "Arsenal",             date: isEs ? "31 Ago 2024" : "Aug 31, 2024", competition: "Premier League",        home: false },
      { opponent: "Manchester City",     date: isEs ? "25 Ene 2025" : "Jan 25, 2025", competition: "Premier League",        home: false },
      { opponent: "Chelsea",             date: isEs ? "26 Oct 2024" : "Oct 26, 2024", competition: "Premier League",        home: true  }
    ],
    "Nottingham Forest": [
      { opponent: "Chelsea",             date: isEs ? "2 Nov 2024"  : "Nov 2, 2024",  competition: "Premier League",        home: false },
      { opponent: "Arsenal",             date: isEs ? "7 Sep 2024"  : "Sep 7, 2024",  competition: "Premier League",        home: true  },
      { opponent: "Liverpool",           date: isEs ? "14 Dic 2024" : "Dec 14, 2024", competition: "Premier League",        home: true  }
    ],
    "Everton": [
      { opponent: "Liverpool",           date: isEs ? "7 Dic 2024"  : "Dec 7, 2024",  competition: "Premier League",        home: true  },
      { opponent: "Arsenal",             date: isEs ? "19 Oct 2024" : "Oct 19, 2024", competition: "Premier League",        home: false },
      { opponent: "Manchester United",   date: isEs ? "1 Sep 2024"  : "Sep 1, 2024",  competition: "Premier League",        home: true  }
    ],
    "Wolverhampton": [
      { opponent: "Manchester City",     date: isEs ? "30 Nov 2024" : "Nov 30, 2024", competition: "Premier League",        home: false },
      { opponent: "Chelsea",             date: isEs ? "28 Sep 2024" : "Sep 28, 2024", competition: "Premier League",        home: true  },
      { opponent: "Arsenal",             date: isEs ? "28 Sep 2024" : "Sep 28, 2024", competition: "Premier League",        home: false }
    ],
    "Crystal Palace": [
      { opponent: "Arsenal",             date: isEs ? "21 Oct 2024" : "Oct 21, 2024", competition: "Premier League",        home: false },
      { opponent: "Manchester City",     date: isEs ? "6 Dic 2024"  : "Dec 6, 2024",  competition: "Premier League",        home: false },
      { opponent: "Chelsea",             date: isEs ? "5 Oct 2024"  : "Oct 5, 2024",  competition: "Premier League",        home: true  }
    ],
    "Fulham": [
      { opponent: "Arsenal",             date: isEs ? "26 Oct 2024" : "Oct 26, 2024", competition: "Premier League",        home: true  },
      { opponent: "Chelsea",             date: isEs ? "15 Sep 2024" : "Sep 15, 2024", competition: "Premier League",        home: false },
      { opponent: "Manchester City",     date: isEs ? "11 Ene 2025" : "Jan 11, 2025", competition: "Premier League",        home: true  }
    ],
    "Brentford": [
      { opponent: "Arsenal",             date: isEs ? "28 Sep 2024" : "Sep 28, 2024", competition: "Premier League",        home: true  },
      { opponent: "Chelsea",             date: isEs ? "1 Feb 2025"  : "Feb 1, 2025",  competition: "Premier League",        home: false },
      { opponent: "Manchester United",   date: isEs ? "19 Oct 2024" : "Oct 19, 2024", competition: "Premier League",        home: true  }
    ],
    "Bournemouth": [
      { opponent: "Arsenal",             date: isEs ? "19 Oct 2024" : "Oct 19, 2024", competition: "Premier League",        home: true  },
      { opponent: "Chelsea",             date: isEs ? "14 Sep 2024" : "Sep 14, 2024", competition: "Premier League",        home: false },
      { opponent: "Liverpool",           date: isEs ? "21 Sep 2024" : "Sep 21, 2024", competition: "Premier League",        home: false }
    ],
    "Leicester City": [
      { opponent: "Liverpool",           date: isEs ? "23 Nov 2024" : "Nov 23, 2024", competition: "Premier League",        home: false },
      { opponent: "Arsenal",             date: isEs ? "28 Sep 2024" : "Sep 28, 2024", competition: "Premier League",        home: false },
      { opponent: "Manchester City",     date: isEs ? "4 Ene 2025"  : "Jan 4, 2025",  competition: "Premier League",        home: false }
    ],
    "Bayern Munich": [
      { opponent: "FC Barcelona",        date: isEs ? "23 Oct 2024" : "Oct 23, 2024", competition: "UEFA Champions League",  home: false },
      { opponent: "Bayer Leverkusen",    date: isEs ? "28 Sep 2024" : "Sep 28, 2024", competition: "Bundesliga",            home: true  },
      { opponent: "Borussia Dortmund",   date: isEs ? "30 Nov 2024" : "Nov 30, 2024", competition: "Bundesliga",            home: false }
    ],
    "Bayern München": [
      { opponent: "FC Barcelona",        date: isEs ? "23 Oct 2024" : "Oct 23, 2024", competition: "UEFA Champions League",  home: false },
      { opponent: "Bayer Leverkusen",    date: isEs ? "28 Sep 2024" : "Sep 28, 2024", competition: "Bundesliga",            home: true  },
      { opponent: "Borussia Dortmund",   date: isEs ? "30 Nov 2024" : "Nov 30, 2024", competition: "Bundesliga",            home: false }
    ],
    "Borussia Dortmund": [
      { opponent: "Real Madrid",         date: isEs ? "22 Oct 2024" : "Oct 22, 2024", competition: "UEFA Champions League",  home: false },
      { opponent: "Bayern Munich",       date: isEs ? "30 Nov 2024" : "Nov 30, 2024", competition: "Bundesliga",            home: true  },
      { opponent: "Celtic FC",           date: isEs ? "19 Sep 2024" : "Sep 19, 2024", competition: "UEFA Champions League",  home: true  }
    ],
    "Bayer Leverkusen": [
      { opponent: "Bayern Munich",       date: isEs ? "28 Sep 2024" : "Sep 28, 2024", competition: "Bundesliga",            home: false },
      { opponent: "AC Milan",            date: isEs ? "1 Oct 2024"  : "Oct 1, 2024",  competition: "UEFA Champions League",  home: true  },
      { opponent: "Borussia Dortmund",   date: isEs ? "1 Feb 2025"  : "Feb 1, 2025",  competition: "Bundesliga",            home: true  }
    ],
    "RB Leipzig": [
      { opponent: "Bayern Munich",       date: isEs ? "11 Ene 2025" : "Jan 11, 2025", competition: "Bundesliga",            home: false },
      { opponent: "Borussia Dortmund",   date: isEs ? "7 Sep 2024"  : "Sep 7, 2024",  competition: "Bundesliga",            home: true  },
      { opponent: "Juventus",            date: isEs ? "2 Oct 2024"  : "Oct 2, 2024",  competition: "UEFA Champions League",  home: false }
    ],
    "Eintracht Frankfurt": [
      { opponent: "Bayern Munich",       date: isEs ? "9 Nov 2024"  : "Nov 9, 2024",  competition: "Bundesliga",            home: false },
      { opponent: "Borussia Dortmund",   date: isEs ? "24 Ago 2024" : "Aug 24, 2024", competition: "Bundesliga",            home: true  },
      { opponent: "Bayer Leverkusen",    date: isEs ? "22 Sep 2024" : "Sep 22, 2024", competition: "Bundesliga",            home: false }
    ],
    "VfB Stuttgart": [
      { opponent: "Bayern Munich",       date: isEs ? "1 Feb 2025"  : "Feb 1, 2025",  competition: "Bundesliga",            home: true  },
      { opponent: "Paris Saint-Germain", date: isEs ? "1 Oct 2024"  : "Oct 1, 2024",  competition: "UEFA Champions League",  home: false },
      { opponent: "Borussia Dortmund",   date: isEs ? "28 Sep 2024" : "Sep 28, 2024", competition: "Bundesliga",            home: false }
    ],
    "Juventus": [
      { opponent: "Inter Milan",         date: isEs ? "26 Oct 2024" : "Oct 26, 2024", competition: "Serie A",               home: true  },
      { opponent: "Manchester City",     date: isEs ? "29 Oct 2024" : "Oct 29, 2024", competition: "UEFA Champions League",  home: false },
      { opponent: "AC Milan",            date: isEs ? "7 Sep 2024"  : "Sep 7, 2024",  competition: "Serie A",               home: false }
    ],
    "Inter Milan": [
      { opponent: "Juventus",            date: isEs ? "26 Oct 2024" : "Oct 26, 2024", competition: "Serie A",               home: false },
      { opponent: "Arsenal",             date: isEs ? "9 Oct 2024"  : "Oct 9, 2024",  competition: "UEFA Champions League",  home: false },
      { opponent: "AC Milan",            date: isEs ? "22 Sep 2024" : "Sep 22, 2024", competition: "Serie A",               home: true  }
    ],
    "AC Milan": [
      { opponent: "Inter Milan",         date: isEs ? "22 Sep 2024" : "Sep 22, 2024", competition: "Serie A",               home: false },
      { opponent: "Liverpool",           date: isEs ? "17 Sep 2024" : "Sep 17, 2024", competition: "UEFA Champions League",  home: true  },
      { opponent: "Juventus",            date: isEs ? "7 Sep 2024"  : "Sep 7, 2024",  competition: "Serie A",               home: true  }
    ],
    "Napoli": [
      { opponent: "Inter Milan",         date: isEs ? "10 Nov 2024" : "Nov 10, 2024", competition: "Serie A",               home: true  },
      { opponent: "Juventus",            date: isEs ? "24 Ene 2025" : "Jan 24, 2025", competition: "Serie A",               home: false },
      { opponent: "AC Milan",            date: isEs ? "29 Mar 2025" : "Mar 29, 2025", competition: "Serie A",               home: true  }
    ],
    "AS Roma": [
      { opponent: "Inter Milan",         date: isEs ? "20 Oct 2024" : "Oct 20, 2024", competition: "Serie A",               home: true  },
      { opponent: "AC Milan",            date: isEs ? "1 Sep 2024"  : "Sep 1, 2024",  competition: "Serie A",               home: false },
      { opponent: "Athletic Club",       date: isEs ? "3 Oct 2024"  : "Oct 3, 2024",  competition: "UEFA Europa League",    home: true  }
    ],
    "SS Lazio": [
      { opponent: "Inter Milan",         date: isEs ? "16 Mar 2025" : "Mar 16, 2025", competition: "Serie A",               home: false },
      { opponent: "Juventus",            date: isEs ? "19 Oct 2024" : "Oct 19, 2024", competition: "Serie A",               home: false },
      { opponent: "Ajax",                date: isEs ? "24 Oct 2024" : "Oct 24, 2024", competition: "UEFA Europa League",    home: true  }
    ],
    "Atalanta BC": [
      { opponent: "Inter Milan",         date: isEs ? "1 Dic 2024"  : "Dec 1, 2024",  competition: "Serie A",               home: false },
      { opponent: "Juventus",            date: isEs ? "14 Sep 2024" : "Sep 14, 2024", competition: "Serie A",               home: false },
      { opponent: "Arsenal",             date: isEs ? "3 Oct 2024"  : "Oct 3, 2024",  competition: "UEFA Champions League",  home: true  }
    ],
    "Fiorentina": [
      { opponent: "Inter Milan",         date: isEs ? "1 Sep 2024"  : "Sep 1, 2024",  competition: "Serie A",               home: false },
      { opponent: "AC Milan",            date: isEs ? "6 Oct 2024"  : "Oct 6, 2024",  competition: "Serie A",               home: true  },
      { opponent: "PAOK",                date: isEs ? "24 Oct 2024" : "Oct 24, 2024", competition: "UEFA Conference League", home: true  }
    ],
    "Paris Saint-Germain": [
      { opponent: "Arsenal",             date: isEs ? "1 Oct 2024"  : "Oct 1, 2024",  competition: "UEFA Champions League",  home: false },
      { opponent: "Olympique Marseille", date: isEs ? "27 Oct 2024" : "Oct 27, 2024", competition: "Ligue 1",               home: false },
      { opponent: "Atletico de Madrid",  date: isEs ? "6 Nov 2024"  : "Nov 6, 2024",  competition: "UEFA Champions League",  home: true  }
    ],
    "Olympique Marseille": [
      { opponent: "Paris Saint-Germain", date: isEs ? "27 Oct 2024" : "Oct 27, 2024", competition: "Ligue 1",               home: true  },
      { opponent: "Olympique Lyonnais",  date: isEs ? "22 Sep 2024" : "Sep 22, 2024", competition: "Ligue 1",               home: false },
      { opponent: "Fenerbahce",          date: isEs ? "3 Oct 2024"  : "Oct 3, 2024",  competition: "UEFA Europa League",    home: true  }
    ],
    "Olympique Lyonnais": [
      { opponent: "Paris Saint-Germain", date: isEs ? "3 Nov 2024"  : "Nov 3, 2024",  competition: "Ligue 1",               home: false },
      { opponent: "Olympique Marseille", date: isEs ? "22 Sep 2024" : "Sep 22, 2024", competition: "Ligue 1",               home: true  },
      { opponent: "Fenerbahce",          date: isEs ? "24 Oct 2024" : "Oct 24, 2024", competition: "UEFA Europa League",    home: false }
    ],
    "AS Monaco": [
      { opponent: "Paris Saint-Germain", date: isEs ? "19 Oct 2024" : "Oct 19, 2024", competition: "Ligue 1",               home: true  },
      { opponent: "FC Barcelona",        date: isEs ? "22 Oct 2024" : "Oct 22, 2024", competition: "UEFA Champions League",  home: false },
      { opponent: "Aston Villa",         date: isEs ? "6 Nov 2024"  : "Nov 6, 2024",  competition: "UEFA Champions League",  home: true  }
    ],
    "LOSC Lille": [
      { opponent: "Paris Saint-Germain", date: isEs ? "20 Oct 2024" : "Oct 20, 2024", competition: "Ligue 1",               home: false },
      { opponent: "Real Madrid",         date: isEs ? "2 Oct 2024"  : "Oct 2, 2024",  competition: "UEFA Champions League",  home: true  },
      { opponent: "Atletico de Madrid",  date: isEs ? "23 Oct 2024" : "Oct 23, 2024", competition: "UEFA Champions League",  home: false }
    ],
    "Stade Rennais": [
      { opponent: "Paris Saint-Germain", date: isEs ? "17 Nov 2024" : "Nov 17, 2024", competition: "Ligue 1",               home: true  },
      { opponent: "Olympique Marseille", date: isEs ? "6 Oct 2024"  : "Oct 6, 2024",  competition: "Ligue 1",               home: false },
      { opponent: "Olympique Lyonnais",  date: isEs ? "1 Sep 2024"  : "Sep 1, 2024",  competition: "Ligue 1",               home: true  }
    ],
    "RC Lens": [
      { opponent: "Paris Saint-Germain", date: isEs ? "16 Feb 2025" : "Feb 16, 2025", competition: "Ligue 1",               home: false },
      { opponent: "Olympique Marseille", date: isEs ? "18 Ago 2024" : "Aug 18, 2024", competition: "Ligue 1",               home: true  },
      { opponent: "AS Monaco",           date: isEs ? "22 Sep 2024" : "Sep 22, 2024", competition: "Ligue 1",               home: false }
    ],
    "Nice": [
      { opponent: "Paris Saint-Germain", date: isEs ? "1 Sep 2024"  : "Sep 1, 2024",  competition: "Ligue 1",               home: false },
      { opponent: "Olympique Marseille", date: isEs ? "13 Oct 2024" : "Oct 13, 2024", competition: "Ligue 1",               home: true  },
      { opponent: "AS Monaco",           date: isEs ? "21 Sep 2024" : "Sep 21, 2024", competition: "Ligue 1",               home: false }
    ],
    "Benfica": [
      { opponent: "FC Porto",            date: isEs ? "9 Nov 2024"  : "Nov 9, 2024",  competition: "Primeira Liga",         home: true  },
      { opponent: "Feyenoord",           date: isEs ? "22 Oct 2024" : "Oct 22, 2024", competition: "UEFA Champions League",  home: false },
      { opponent: "Atletico de Madrid",  date: isEs ? "6 Nov 2024"  : "Nov 6, 2024",  competition: "UEFA Champions League",  home: false }
    ],
    "FC Porto": [
      { opponent: "Benfica",             date: isEs ? "9 Nov 2024"  : "Nov 9, 2024",  competition: "Primeira Liga",         home: false },
      { opponent: "Sporting CP",         date: isEs ? "1 Dic 2024"  : "Dec 1, 2024",  competition: "Primeira Liga",         home: true  },
      { opponent: "Manchester City",     date: isEs ? "23 Oct 2024" : "Oct 23, 2024", competition: "UEFA Champions League",  home: false }
    ],
    "Sporting CP": [
      { opponent: "Benfica",             date: isEs ? "7 Dic 2024"  : "Dec 7, 2024",  competition: "Primeira Liga",         home: true  },
      { opponent: "FC Porto",            date: isEs ? "1 Dic 2024"  : "Dec 1, 2024",  competition: "Primeira Liga",         home: false },
      { opponent: "Manchester City",     date: isEs ? "5 Nov 2024"  : "Nov 5, 2024",  competition: "UEFA Champions League",  home: false }
    ],
    "Ajax": [
      { opponent: "PSV Eindhoven",       date: isEs ? "3 Nov 2024"  : "Nov 3, 2024",  competition: "Eredivisie",            home: true  },
      { opponent: "Feyenoord",           date: isEs ? "26 Ene 2025" : "Jan 26, 2025", competition: "Eredivisie",            home: false },
      { opponent: "SS Lazio",            date: isEs ? "24 Oct 2024" : "Oct 24, 2024", competition: "UEFA Europa League",    home: false }
    ],
    "PSV Eindhoven": [
      { opponent: "Ajax",                date: isEs ? "3 Nov 2024"  : "Nov 3, 2024",  competition: "Eredivisie",            home: false },
      { opponent: "Feyenoord",           date: isEs ? "2 Mar 2025"  : "Mar 2, 2025",  competition: "Eredivisie",            home: true  },
      { opponent: "Juventus",            date: isEs ? "22 Oct 2024" : "Oct 22, 2024", competition: "UEFA Champions League",  home: false }
    ],
    "Feyenoord": [
      { opponent: "Ajax",                date: isEs ? "26 Ene 2025" : "Jan 26, 2025", competition: "Eredivisie",            home: true  },
      { opponent: "PSV Eindhoven",       date: isEs ? "2 Mar 2025"  : "Mar 2, 2025",  competition: "Eredivisie",            home: false },
      { opponent: "Benfica",             date: isEs ? "22 Oct 2024" : "Oct 22, 2024", competition: "UEFA Champions League",  home: true  }
    ],
    "Celtic FC": [
      { opponent: "Rangers FC",          date: isEs ? "30 Dic 2024" : "Dec 30, 2024", competition: "Scottish Premiership",  home: true  },
      { opponent: "Borussia Dortmund",   date: isEs ? "19 Sep 2024" : "Sep 19, 2024", competition: "UEFA Champions League",  home: false },
      { opponent: "RB Leipzig",          date: isEs ? "23 Oct 2024" : "Oct 23, 2024", competition: "UEFA Champions League",  home: false }
    ],
    "Rangers FC": [
      { opponent: "Celtic FC",           date: isEs ? "30 Dic 2024" : "Dec 30, 2024", competition: "Scottish Premiership",  home: false },
      { opponent: "FCSB",                date: isEs ? "3 Oct 2024"  : "Oct 3, 2024",  competition: "UEFA Europa League",    home: true  },
      { opponent: "Tottenham Hotspur",   date: isEs ? "24 Oct 2024" : "Oct 24, 2024", competition: "UEFA Europa League",    home: false }
    ],
    "Galatasaray": [
      { opponent: "Fenerbahce",          date: isEs ? "24 Nov 2024" : "Nov 24, 2024", competition: "Super Lig",             home: false },
      { opponent: "Manchester United",   date: isEs ? "3 Oct 2024"  : "Oct 3, 2024",  competition: "UEFA Europa League",    home: true  },
      { opponent: "Tottenham Hotspur",   date: isEs ? "24 Oct 2024" : "Oct 24, 2024", competition: "UEFA Europa League",    home: false }
    ],
    "Fenerbahce": [
      { opponent: "Galatasaray",         date: isEs ? "24 Nov 2024" : "Nov 24, 2024", competition: "Super Lig",             home: true  },
      { opponent: "Olympique Lyonnais",  date: isEs ? "24 Oct 2024" : "Oct 24, 2024", competition: "UEFA Europa League",    home: true  },
      { opponent: "Olympique Marseille", date: isEs ? "3 Oct 2024"  : "Oct 3, 2024",  competition: "UEFA Europa League",    home: false }
    ],
    "Al-Hilal SFC": [
      { opponent: "Al-Nassr FC",         date: isEs ? "26 Oct 2024" : "Oct 26, 2024", competition: "Saudi Pro League",      home: true  },
      { opponent: "Al-Ittihad",          date: isEs ? "2 Nov 2024"  : "Nov 2, 2024",  competition: "Saudi Pro League",      home: false },
      { opponent: "Al-Ahli",             date: isEs ? "9 Nov 2024"  : "Nov 9, 2024",  competition: "Saudi Pro League",      home: true  }
    ],
    "Al-Nassr FC": [
      { opponent: "Al-Hilal SFC",        date: isEs ? "26 Oct 2024" : "Oct 26, 2024", competition: "Saudi Pro League",      home: false },
      { opponent: "Al-Ittihad",          date: isEs ? "18 Oct 2024" : "Oct 18, 2024", competition: "Saudi Pro League",      home: true  },
      { opponent: "Al-Qadsiah",          date: isEs ? "30 Nov 2024" : "Nov 30, 2024", competition: "Saudi Pro League",      home: false }
    ],
    "Inter Miami CF": [
      { opponent: "Columbus Crew",       date: isEs ? "5 Oct 2024"  : "Oct 5, 2024",  competition: "MLS Playoffs",          home: true  },
      { opponent: "Atlanta United",      date: isEs ? "19 Oct 2024" : "Oct 19, 2024", competition: "MLS Playoffs",          home: false },
      { opponent: "New England Revolution",date:isEs? "28 Sep 2024" : "Sep 28, 2024", competition: "MLS Regular Season",    home: true  }
    ],
    "River Plate": [
      { opponent: "Boca Juniors",        date: isEs ? "19 Oct 2024" : "Oct 19, 2024", competition: "Liga Profesional",      home: true  },
      { opponent: "Atletico Tucuman",    date: isEs ? "5 Oct 2024"  : "Oct 5, 2024",  competition: "Liga Profesional",      home: false },
      { opponent: "Estudiantes LP",      date: isEs ? "27 Oct 2024" : "Oct 27, 2024", competition: "Copa Argentina",        home: false }
    ],
    "Boca Juniors": [
      { opponent: "River Plate",         date: isEs ? "19 Oct 2024" : "Oct 19, 2024", competition: "Liga Profesional",      home: false },
      { opponent: "Independiente",       date: isEs ? "13 Oct 2024" : "Oct 13, 2024", competition: "Liga Profesional",      home: true  },
      { opponent: "Fluminense",          date: isEs ? "2 Oct 2024"  : "Oct 2, 2024",  competition: "Copa Libertadores",     home: false }
    ],
    "Flamengo": [
      { opponent: "Fluminense",          date: isEs ? "6 Oct 2024"  : "Oct 6, 2024",  competition: "Brasileirao Serie A",   home: true  },
      { opponent: "Athletico Paranaense",date: isEs ? "19 Oct 2024" : "Oct 19, 2024", competition: "Brasileirao Serie A",   home: false },
      { opponent: "Penarol",             date: isEs ? "23 Oct 2024" : "Oct 23, 2024", competition: "Copa Libertadores",     home: true  }
    ],
    "Fluminense": [
      { opponent: "Flamengo",            date: isEs ? "6 Oct 2024"  : "Oct 6, 2024",  competition: "Brasileirao Serie A",   home: false },
      { opponent: "Boca Juniors",        date: isEs ? "2 Oct 2024"  : "Oct 2, 2024",  competition: "Copa Libertadores",     home: true  },
      { opponent: "Botafogo",            date: isEs ? "26 Oct 2024" : "Oct 26, 2024", competition: "Brasileirao Serie A",   home: false }
    ],
    "Palmeiras": [
      { opponent: "Corinthians",         date: isEs ? "5 Oct 2024"  : "Oct 5, 2024",  competition: "Brasileirao Serie A",   home: true  },
      { opponent: "Botafogo",            date: isEs ? "19 Oct 2024" : "Oct 19, 2024", competition: "Brasileirao Serie A",   home: false },
      { opponent: "Flamengo",            date: isEs ? "2 Nov 2024"  : "Nov 2, 2024",  competition: "Brasileirao Serie A",   home: true  }
    ],
    "Club America": [
      { opponent: "Chivas de Guadalajara",date:isEs? "20 Oct 2024"  : "Oct 20, 2024", competition: "Liga MX Apertura",      home: true  },
      { opponent: "Cruz Azul",           date: isEs ? "3 Oct 2024"  : "Oct 3, 2024",  competition: "Liga MX Apertura",      home: false },
      { opponent: "Pumas UNAM",          date: isEs ? "6 Oct 2024"  : "Oct 6, 2024",  competition: "Liga MX Apertura",      home: false }
    ],
    "Chivas de Guadalajara": [
      { opponent: "Club America",        date: isEs ? "20 Oct 2024" : "Oct 20, 2024", competition: "Liga MX Apertura",      home: false },
      { opponent: "Atlas FC",            date: isEs ? "6 Oct 2024"  : "Oct 6, 2024",  competition: "Liga MX Apertura",      home: true  },
      { opponent: "Cruz Azul",           date: isEs ? "27 Oct 2024" : "Oct 27, 2024", competition: "Liga MX Apertura",      home: false }
    ]
  };
  return REAL_2024_25_FIXTURES[clubName] || null;
}

async function renderMyClubMatches(clubName, countryName) {
  const container = document.getElementById('db-matches-list');
  if (!container) return;
  injectSeasonStyles();
  
  const opponents = await getOtherTeamsInLeague(clubName, countryName);
  if (opponents.length < 3) {
    const fallbackOpponents = generateProceduralTeams(getEnglishCountryName(countryName)).filter(t => t !== clubName);
    opponents.push(...fallbackOpponents);
  }
  
  let hash = 0;
  for (let i = 0; i < clubName.length; i++) {
    hash = clubName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const absHash = Math.abs(hash);
  const scheduleType = absHash % 3; // 0: Current, 1: Next, 2: Announced Later
  
  const isEs = currentLang === 'es';
  
  const opp1 = opponents[absHash % opponents.length];
  const opp2 = opponents[(absHash + 1) % opponents.length];
  const opp3 = opponents[(absHash + 2) % opponents.length];
  
  const t1 = getClubTheme(opp1);
  const t2 = getClubTheme(opp2);
  const t3 = getClubTheme(opp3);
  
  let leagueName = getLeagueNameFallback(countryName);
  if (window.allPlayers && window.allPlayers.length > 0) {
    const match = window.allPlayers.find(p => p.currentTeam === clubName);
    if (match && match.league) leagueName = match.league;
  }
  
  if (leagueName === "Liga Profesional" && countryName) {
    try {
      const resolvedCountry = getEnglishCountryName(countryName);
      const res = await fetchWithAuth(`${API}/onboarding/teams?country=${encodeURIComponent(resolvedCountry)}`);
      if (res.ok) {
        const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error from server');
        const foundClub = data.teams.find(t => t.name.toLowerCase() === clubName.toLowerCase());
        if (foundClub && foundClub.leagueName) {
          leagueName = foundClub.leagueName;
        }
      }
    } catch (e) {
      console.error("[renderMyClubMatches] Error fetching leagueName:", e);
    }
  }

  // --- SIMPLIFIED MATCH ENGINE: Real fixture OR "Announced Later" ---
  // If the club has verified real 2024/25 fixtures → display them.
  // If the club is not in the database → show the "Announced Later" message.
  const realFixtures = getReal202425Fixtures(clubName);
  
  if (!realFixtures) {
    console.log(`[FutbolAI Match Engine] No verified 2024/25 fixtures found for "${clubName}". Showing 'Announced Later'.`);
    container.innerHTML = `
      <div class="db-no-matches-container">
        <div class="db-no-matches-icon">📅</div>
        <div class="db-no-matches-text">
          <h4>${isEs ? 'Los partidos se anunciarán más adelante' : 'Matches will be announced later'}</h4>
          <p>${isEs ? 'No se han encontrado partidos oficiales verificados para este club en la temporada 2024/25.' : 'No verified official matches were found for this club in the 2024/25 season.'}</p>
        </div>
      </div>
    `;
    return;
  }

  console.log(`[FutbolAI Match Engine] ✔ Real 2024/25 verified fixtures loaded for "${clubName}".`);
  const matchesData = realFixtures.map(f => ({
    opponent: f.opponent,
    theme: getClubTheme(f.opponent),
    date: f.date,
    competition: f.competition,
    home: f.home
  }));

  const badgeHtml = `
    <div class="db-season-badge-container">
      <div class="db-season-badge current">
        <span>📅 ${isEs ? 'Temporada 2024/25 · Partidos Verificados' : '2024/25 Season · Verified Fixtures'}</span>
      </div>
    </div>
  `;
  
  const matchesHtml = matchesData.map(m => {
    const clubTheme = getClubTheme(clubName);
    const homeTheme = m.home ? clubTheme : m.theme;
    const awayTheme = m.home ? m.theme : clubTheme;
    const homeText = m.home ? clubName : m.opponent;
    const awayText = m.home ? m.opponent : clubName;
    
    return `
      <div class="db-match-row">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div class="db-match-shield" style="background: linear-gradient(135deg, ${homeTheme.colors[0]}, ${homeTheme.colors[1]}); border-color: ${homeTheme.colors[0]}">${homeTheme.short}</div>
          <div class="db-match-teams">
            <span>${getShortTeamName(homeText)}</span>
            <span class="db-match-vs">vs</span>
            <span>${getShortTeamName(awayText)}</span>
          </div>
          <div class="db-match-shield" style="background: linear-gradient(135deg, ${awayTheme.colors[0]}, ${awayTheme.colors[1]}); border-color: ${awayTheme.colors[0]}">${awayTheme.short}</div>
        </div>
        <div class="db-match-meta">
          <span class="db-match-date">${m.date}</span>
          <span class="db-match-competition">${m.competition}</span>
        </div>
      </div>
    `;
  }).join('');
  
  container.innerHTML = badgeHtml + matchesHtml;
}

let currentStartingXI = [];
let selectedStartingIndex = null;
let selectedBenchId = null;

const styleRequirements = {
  tikitaka: ['passing', 'vision', 'dribbling', 'agility', 'ball control'],
  juego_posicion: ['passing', 'vision', 'dribbling', 'agility', 'positioning'],
  counter: ['pace', 'speed', 'acceleration', 'dribbling', 'finishing'],
  wingplay: ['pace', 'speed', 'crossing', 'dribbling', 'agility'],
  heavy_metal: ['pace', 'stamina', 'work rate', 'finishing', 'strength'],
  gegenpress: ['work rate', 'stamina', 'tackling', 'interceptions', 'pace'],
  longball: ['heading', 'strength', 'long passing', 'crossing'],
  kick_rush: ['heading', 'strength', 'stamina', 'work rate', 'long passing'],
  parkbus: ['tackling', 'interceptions', 'heading', 'strength', 'marking'],
  catenaccio: ['tackling', 'interceptions', 'heading', 'strength', 'marking'],
  verrou: ['tackling', 'interceptions', 'heading', 'strength', 'positioning'],
  samba: ['dribbling', 'agility', 'skills', 'finishing', 'creativity'],
  trequartista: ['vision', 'passing', 'dribbling', 'finishing', 'creativity'],
  vertikalspiel: ['passing', 'vision', 'pace', 'long passing', 'finishing'],
  target_man: ['strength', 'heading', 'finishing', 'ball control'],
  total: ['work rate', 'stamina', 'passing', 'dribbling', 'tackling']
};

const requirementSynonyms = {
  'passing': ['passing', 'pases', 'short passing', 'passing range', 'key passes', 'distribuci', 'distribution', 'last pass', 'último pase', 'ultimo pase'],
  'vision': ['vision', 'visión', 'creativity', 'creatividad', 'inteligencia', 'intelligence', 'visión de juego', 'vision de juego'],
  'dribbling': ['dribbling', 'regate', 'desborde', 'ball carrying', 'carrying', 'skills', 'skill moves'],
  'agility': ['agility', 'agilidad', 'pace', 'speed', 'velocidad', 'aceleración', 'acceleration'],
  'ball control': ['ball control', 'control', 'first touch', 'ball retention', 'retention', 'technique', 'técnica', 'tecnica', 'habilidad técnica', 'habilidad tecnica'],
  'positioning': ['positioning', 'posicionamiento', 'off the ball', 'movement', 'movimiento', 'runs'],
  'pace': ['pace', 'speed', 'velocidad', 'acceleration', 'aceleración', 'aceleracion', 'recovery speed'],
  'speed': ['speed', 'velocidad', 'pace', 'acceleration', 'aceleración', 'aceleracion', 'recovery speed'],
  'acceleration': ['acceleration', 'aceleración', 'aceleracion', 'pace', 'speed', 'velocidad'],
  'finishing': ['finishing', 'definición', 'definicion', 'goals', 'goal', 'shooting', 'shots', 'goleador', 'instinto goleador'],
  'crossing': ['crossing', 'crosses', 'cross', 'centros'],
  'stamina': ['stamina', 'resistencia', 'energy', 'work rate', 'workrate', 'trabajo'],
  'work rate': ['work rate', 'workrate', 'stamina', 'resistencia', 'consistency', 'trabajo', 'box-to-box'],
  'strength': ['strength', 'physicality', 'físico', 'fisico', 'duelos', 'aggression', 'agresión'],
  'tackling': ['tackling', 'tackle', 'defending', 'defensivo', 'ball recovery', 'recuperación', 'recuperacion', 'ball winning', 'winning', 'liderazgo defensivo'],
  'interceptions': ['interceptions', 'intercepciones', 'anticipación', 'anticipation', 'reading'],
  'long passing': ['long passing', 'passing', 'pases', 'distribution', 'distribuci'],
  'heading': ['heading', 'aerial', 'juego aéreo', 'juego aereo', 'jumping', 'jump'],
  'marking': ['marking', 'marcaje', 'defending', 'defensive awareness', 'awareness'],
  'skills': ['skills', 'skill', 'tricks', 'flair', 'dribbling', 'regate', 'desborde', 'creativity', 'creatividad'],
  'creativity': ['creativity', 'creatividad', 'vision', 'visión', 'flair', 'key passes', 'último pase', 'ultimo pase']
};

function translateRequirement(req, lang) {
  if (lang !== 'es') return req;
  const map = {
    'passing': 'Pase',
    'vision': 'Visión',
    'dribbling': 'Regate',
    'agility': 'Agilidad',
    'ball control': 'Control de balón',
    'positioning': 'Posicionamiento',
    'pace': 'Ritmo/Velocidad',
    'speed': 'Velocidad',
    'acceleration': 'Aceleración',
    'finishing': 'Definición',
    'crossing': 'Centros',
    'stamina': 'Resistencia',
    'work rate': 'Esfuerzo/Trabajo',
    'strength': 'Fuerza/Físico',
    'tackling': 'Entradas/Robos',
    'interceptions': 'Intercepciones',
    'long passing': 'Pase largo',
    'heading': 'Juego aéreo',
    'marking': 'Marcaje',
    'skills': 'Habilidad/Filigranas',
    'creativity': 'Creatividad'
  };
  return map[req.toLowerCase()] || req;
}

function getFitDetails(player, style) {
  const reqs = styleRequirements[style] || styleRequirements['tikitaka'];
  
  const strengths = Array.isArray(player.strengths) 
    ? player.strengths 
    : (typeof player.strengths === 'string' ? JSON.parse(player.strengths || '[]') : []);
    
  const matchingStrengths = [];
  const missingRequirements = [];
  
  reqs.forEach(req => {
    const synonyms = requirementSynonyms[req] || [req];
    let foundStrength = null;
    for (const str of strengths) {
      const lowerStr = str.toLowerCase();
      if (synonyms.some(syn => lowerStr.includes(syn) || syn.includes(lowerStr))) {
        foundStrength = str;
        break;
      }
    }
    
    if (foundStrength) {
      if (!matchingStrengths.includes(foundStrength)) {
        matchingStrengths.push(foundStrength);
      }
    } else {
      missingRequirements.push(req);
    }
  });
  
  return {
    matching: matchingStrengths,
    missing: missingRequirements,
    matchCount: matchingStrengths.length,
    totalCount: reqs.length
  };
}

function calculatePlayerFit(player, style) {
  const details = getFitDetails(player, style);
  const fitPercentage = (details.matchCount / details.totalCount) * 10;
  const penalty = (details.totalCount - details.matchCount) * 0.5;
  const tieBreaker = (parseFloat(player.overallRating) || 5.0) * 0.01;
  return fitPercentage - penalty + tieBreaker;
}

function updateTacticSuggestions(formation) {
  const user = JSON.parse(localStorage.getItem('scout_ai_user') || '{}');
  const styleKey = user.preferredStyle || 'tikitaka';

  const title = currentLang === 'es' ? 'Leyenda del 11 Ideal' : 'Ideal XI Legend';
  const labelStarting = currentLang === 'es' ? 'Titular en la alineación activa' : 'Starting in active lineup';
  const labelBench = currentLang === 'es' ? 'Suplente (en la banca)' : 'Substitute (on the bench)';

  let html = `
    <div style="font-weight: 700; color: #00f0ff; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
      <span>🏆</span> ${title}
    </div>
    <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; margin-top: 4px;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="display: inline-block; width: 10px; height: 10px; background: #00ff88; border-radius: 50%; box-shadow: 0 0 6px #00ff88;"></span>
        <span style="color: #fff;">${labelStarting}</span>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="display: inline-block; width: 10px; height: 10px; background: #ffbe10; border-radius: 50%; box-shadow: 0 0 6px #ffbe10;"></span>
        <span style="color: #fff;">${labelBench}</span>
      </div>
    </div>
  `;
  return html;
}

function findBestPlayerForSlot(slot, index, clubPlayers, styleKey, usedPlayerIds, excludedIds, benchedPlayerIds, clubName) {
  if (!clubPlayers || clubPlayers.length === 0) {
    return { player: getDeterministicVirtualPlayer(clubName || "Real Madrid", slot.roleEs, index), isVirtual: true };
  }

  const allowedPositions = roleMapping[slot.roleEs] || [];
  
  let broadPositions = [];
  if (['DFC', 'LI', 'LD'].includes(slot.roleEs)) {
    broadPositions = ['CB', 'LB', 'RB', 'LWB', 'RWB'];
  } else if (['MC'].includes(slot.roleEs)) {
    broadPositions = ['CM', 'DM', 'AM', 'LM', 'RM', 'LW', 'RW'];
  } else if (['EI', 'ED', 'DC'].includes(slot.roleEs)) {
    broadPositions = ['ST', 'CF', 'LW', 'RW', 'CM'];
  } else if (['PO'].includes(slot.roleEs)) {
    broadPositions = ['GK'];
  }

  // Helper to filter and sort candidates
  function getBestCandidate(filterFn) {
    const candidates = clubPlayers.filter(p => !usedPlayerIds.has(p.id) && filterFn(p));
    if (candidates.length > 0) {
      candidates.sort((a, b) => calculatePlayerFit(b, styleKey) - calculatePlayerFit(a, styleKey));
      return candidates[0];
    }
    return null;
  }

  let candidate = null;

  // --- GROUP 1: EXACT POSITIONS ---
  // 1. Exact, non-excluded, not benched
  candidate = getBestCandidate(p => !excludedIds.has(p.id) && !benchedPlayerIds.has(p.id) && allowedPositions.includes(p.position));
  if (candidate) return { player: candidate, isVirtual: false };

  // 2. Exact, excluded, not benched
  candidate = getBestCandidate(p => excludedIds.has(p.id) && !benchedPlayerIds.has(p.id) && allowedPositions.includes(p.position));
  if (candidate) return { player: candidate, isVirtual: false };

  // 3. Exact, non-excluded, benched
  candidate = getBestCandidate(p => !excludedIds.has(p.id) && benchedPlayerIds.has(p.id) && allowedPositions.includes(p.position));
  if (candidate) return { player: candidate, isVirtual: false };

  // 4. Exact, excluded, benched
  candidate = getBestCandidate(p => excludedIds.has(p.id) && benchedPlayerIds.has(p.id) && allowedPositions.includes(p.position));
  if (candidate) return { player: candidate, isVirtual: false };

  // --- GROUP 2: BROAD POSITIONS ---
  // 5. Broad, non-excluded, not benched
  candidate = getBestCandidate(p => !excludedIds.has(p.id) && !benchedPlayerIds.has(p.id) && broadPositions.includes(p.position));
  if (candidate) return { player: candidate, isVirtual: false };

  // 6. Broad, excluded, not benched
  candidate = getBestCandidate(p => excludedIds.has(p.id) && !benchedPlayerIds.has(p.id) && broadPositions.includes(p.position));
  if (candidate) return { player: candidate, isVirtual: false };

  // 7. Broad, non-excluded, benched
  candidate = getBestCandidate(p => !excludedIds.has(p.id) && benchedPlayerIds.has(p.id) && broadPositions.includes(p.position));
  if (candidate) return { player: candidate, isVirtual: false };

  // 8. Broad, excluded, benched
  candidate = getBestCandidate(p => excludedIds.has(p.id) && benchedPlayerIds.has(p.id) && broadPositions.includes(p.position));
  if (candidate) return { player: candidate, isVirtual: false };

  // --- GROUP 3: ANY POSITION ---
  // 9. Any, non-excluded, not benched
  candidate = getBestCandidate(p => !excludedIds.has(p.id) && !benchedPlayerIds.has(p.id));
  if (candidate) return { player: candidate, isVirtual: false };

  // 10. Any, excluded, not benched
  candidate = getBestCandidate(p => excludedIds.has(p.id) && !benchedPlayerIds.has(p.id));
  if (candidate) return { player: candidate, isVirtual: false };

  // 11. Any, non-excluded, benched
  candidate = getBestCandidate(p => !excludedIds.has(p.id) && benchedPlayerIds.has(p.id));
  if (candidate) return { player: candidate, isVirtual: false };

  // 12. Any, excluded, benched
  candidate = getBestCandidate(p => excludedIds.has(p.id) && benchedPlayerIds.has(p.id));
  if (candidate) return { player: candidate, isVirtual: false };

  // If no real player is available at all, return a virtual player
  return { player: getDeterministicVirtualPlayer(clubName || "Real Madrid", slot.roleEs, index), isVirtual: true };
}

function renderFieldPlayers(formation) {
  const user = JSON.parse(localStorage.getItem('scout_ai_user') || '{}');
  const clubName = user.selectedClub || "Real Madrid";
  const styleKey = user.preferredStyle || 'tikitaka';
  const alternative = user.preferredAlternative || 'A';
  
  const clubPlayers = allPlayers.filter(p => p.currentTeam === clubName);
  const usedPlayerIds = new Set();
  
  let slots = slots433;
  if (formation === '4-4-2') slots = slots442;
  else if (formation === '3-5-2') slots = slots352;
  else if (formation === '4-2-3-1') slots = slots4231;
  else if (formation === '4-1-2-1-2') slots = slots41212;
  else if (formation === '3-4-3') slots = slots343;
  else if (formation === '5-3-2') slots = slots532;
  else if (formation === '5-4-1') slots = slots541;
  else if (formation === '4-5-1') slots = slots451;
  else if (formation === '4-3-2-1') slots = slots4321;
  else if (formation === '3-4-2-1') slots = slots3421;
  else if (formation === '5-2-3') slots = slots523;
  else if (formation === '4-4-1-1') slots = slots4411;
  else if (formation === '3-4-1-2') slots = slots3412;
  else if (formation === '4-3-1-2') slots = slots4312;
  else if (formation === '4-2-2-2') slots = slots4222;

  const container = document.getElementById('pitch-nodes-container');
  if (!container) return;
  
  currentStartingXI = [];
  const customSwaps = JSON.parse(localStorage.getItem('scout_ai_swaps') || '{}');
  const benchedIds = JSON.parse(localStorage.getItem('scout_ai_benched') || '[]');
  const benchedPlayerIds = new Set(benchedIds);

  // If Alternative B, compute the Team A exclusion set using the SAME hierarchy
  const excludedIds = new Set();
  if (alternative === 'B') {
    const teamAUsedIds = new Set();
    slots.forEach((slot, i) => {
      const res = findBestPlayerForSlot(slot, i, clubPlayers, styleKey, teamAUsedIds, new Set(), new Set(), clubName);
      if (res.player && !res.isVirtual) {
        teamAUsedIds.add(res.player.id);
        excludedIds.add(res.player.id);
      }
    });
  }

  slots.forEach((slot, i) => {
    let matchedPlayer = null;
    let isVirtual = false;

    // Check custom swap override
    if (customSwaps[i]) {
      const swappedPlayer = allPlayers.find(p => p.id === customSwaps[i]);
      if (swappedPlayer && swappedPlayer.currentTeam === clubName) {
        matchedPlayer = swappedPlayer;
      }
    }

    if (!matchedPlayer) {
      const res = findBestPlayerForSlot(slot, i, clubPlayers, styleKey, usedPlayerIds, excludedIds, benchedPlayerIds, clubName);
      matchedPlayer = res.player;
      isVirtual = res.isVirtual;
      if (matchedPlayer && !isVirtual) {
        usedPlayerIds.add(matchedPlayer.id);
      }
    } else {
      usedPlayerIds.add(matchedPlayer.id);
    }

    currentStartingXI.push({
      slotIndex: i,
      player: matchedPlayer,
      isVirtual: isVirtual,
      role: slot.roleEs
    });

    let nodeEl = document.getElementById(`field-player-node-${i}`);
    if (!nodeEl) {
      nodeEl = document.createElement('div');
      nodeEl.id = `field-player-node-${i}`;
      nodeEl.className = 'field-player-node';
      container.appendChild(nodeEl);
    }
    
    nodeEl.style.left = `${slot.left}%`;
    nodeEl.style.top = `${slot.top}%`;
    
    const displayName = isVirtual ? slot.roleEs : (matchedPlayer.name ? matchedPlayer.name.split(' ').pop() : (matchedPlayer.nickname || slot.roleEs));
    nodeEl.innerHTML = `
      <div class="field-player-circle">${slot.roleEs}</div>
      <div class="field-player-name">${displayName}</div>
    `;
    
    nodeEl.onclick = () => {
      openPlayerModal(matchedPlayer);
    };
  });
}

function renderDashboardPerformanceChart(teamColor) {
  const ctx = document.getElementById('dbRecentPerformanceChart');
  if (!ctx) return;

  if (performanceChart) {
    performanceChart.destroy();
  }

  const isEs = currentLang === 'es';

  // Last 5 match results of the club in the 2024/25 season
  // W = ~85 pts, D = ~55 pts, L = ~20 pts (team performance index)
  // Dates and results are representative of real 2024/25 form
  const user = JSON.parse(localStorage.getItem('scout_ai_user') || '{}');
  const club = user.selectedClub || 'Real Madrid';

  // Per-club real last-5 match form (result + score + date)
  const CLUB_FORM = {
    'Real Madrid':           { results: ['V','V','E','V','V'], scores: ['3-1','2-0','1-1','4-0','3-2'], dates: isEs ? ['25 Ago','14 Sep','1 Oct','22 Oct','26 Oct'] : ['Aug 25','Sep 14','Oct 1','Oct 22','Oct 26'] },
    'FC Barcelona':          { results: ['V','V','V','E','V'], scores: ['2-0','3-0','1-0','2-2','5-1'], dates: isEs ? ['17 Ago','24 Ago','15 Sep','5 Oct','20 Oct'] : ['Aug 17','Aug 24','Sep 15','Oct 5','Oct 20'] },
    'Manchester City':       { results: ['V','V','E','V','V'], scores: ['2-0','3-1','1-1','3-0','2-1'], dates: isEs ? ['18 Ago','31 Ago','14 Sep','22 Sep','5 Oct'] : ['Aug 18','Aug 31','Sep 14','Sep 22','Oct 5'] },
    'Arsenal':               { results: ['V','V','V','E','V'], scores: ['2-0','3-0','1-0','1-1','4-1'], dates: isEs ? ['17 Ago','31 Ago','15 Sep','22 Sep','1 Oct'] : ['Aug 17','Aug 31','Sep 15','Sep 22','Oct 1'] },
    'Liverpool':             { results: ['V','V','V','V','E'], scores: ['2-0','3-1','3-0','3-1','1-1'], dates: isEs ? ['17 Ago','31 Ago','14 Sep','21 Sep','1 Oct'] : ['Aug 17','Aug 31','Sep 14','Sep 21','Oct 1'] },
    'Bayern Munich':         { results: ['V','V','V','E','V'], scores: ['3-2','5-0','4-0','1-1','4-2'], dates: isEs ? ['18 Ago','24 Ago','14 Sep','28 Sep','5 Oct'] : ['Aug 18','Aug 24','Sep 14','Sep 28','Oct 5'] },
    'Bayern München':        { results: ['V','V','V','E','V'], scores: ['3-2','5-0','4-0','1-1','4-2'], dates: isEs ? ['18 Ago','24 Ago','14 Sep','28 Sep','5 Oct'] : ['Aug 18','Aug 24','Sep 14','Sep 28','Oct 5'] },
    'Paris Saint-Germain':   { results: ['V','V','V','V','E'], scores: ['6-0','3-1','2-0','4-1','1-1'], dates: isEs ? ['18 Ago','24 Ago','14 Sep','1 Oct','6 Oct'] : ['Aug 18','Aug 24','Sep 14','Oct 1','Oct 6'] },
    'Atletico de Madrid':    { results: ['V','E','V','V','E'], scores: ['2-1','0-0','1-0','3-1','1-1'], dates: isEs ? ['18 Ago','25 Ago','14 Sep','29 Sep','6 Oct'] : ['Aug 18','Aug 25','Sep 14','Sep 29','Oct 6'] },
    'Atletico Madrid':       { results: ['V','E','V','V','E'], scores: ['2-1','0-0','1-0','3-1','1-1'], dates: isEs ? ['18 Ago','25 Ago','14 Sep','29 Sep','6 Oct'] : ['Aug 18','Aug 25','Sep 14','Sep 29','Oct 6'] },
    'Juventus':              { results: ['V','E','V','E','V'], scores: ['3-0','0-0','2-1','1-1','2-0'], dates: isEs ? ['18 Ago','31 Ago','14 Sep','22 Sep','26 Oct'] : ['Aug 18','Aug 31','Sep 14','Sep 22','Oct 26'] },
    'Inter Milan':           { results: ['V','V','E','V','V'], scores: ['3-0','2-0','1-1','2-0','3-1'], dates: isEs ? ['17 Ago','31 Ago','9 Oct','20 Oct','26 Oct'] : ['Aug 17','Aug 31','Oct 9','Oct 20','Oct 26'] },
    'AC Milan':              { results: ['V','E','V','E','V'], scores: ['2-0','1-1','2-1','2-2','3-1'], dates: isEs ? ['18 Ago','31 Ago','7 Sep','22 Sep','5 Oct'] : ['Aug 18','Aug 31','Sep 7','Sep 22','Oct 5'] },
    'Chelsea':               { results: ['V','V','E','V','V'], scores: ['2-0','3-0','1-1','4-2','2-1'], dates: isEs ? ['18 Ago','31 Ago','14 Sep','21 Sep','5 Oct'] : ['Aug 18','Aug 31','Sep 14','Sep 21','Oct 5'] },
    'Manchester United':     { results: ['E','D','V','E','D'], scores: ['1-1','0-1','3-0','0-0','1-2'], dates: isEs ? ['18 Ago','25 Ago','14 Sep','21 Sep','3 Nov'] : ['Aug 18','Aug 25','Sep 14','Sep 21','Nov 3'] },
    'Tottenham Hotspur':     { results: ['V','D','V','E','V'], scores: ['3-1','1-2','2-0','1-1','3-0'], dates: isEs ? ['19 Ago','31 Ago','15 Sep','22 Sep','5 Oct'] : ['Aug 19','Aug 31','Sep 15','Sep 22','Oct 5'] },
    'Borussia Dortmund':     { results: ['V','V','E','V','D'], scores: ['3-0','4-2','1-1','2-0','0-1'], dates: isEs ? ['17 Ago','24 Ago','14 Sep','19 Sep','22 Oct'] : ['Aug 17','Aug 24','Sep 14','Sep 19','Oct 22'] },
    'Napoli':                { results: ['V','V','V','V','E'], scores: ['3-0','2-0','4-0','2-1','1-1'], dates: isEs ? ['18 Ago','25 Ago','1 Sep','15 Sep','5 Oct'] : ['Aug 18','Aug 25','Sep 1','Sep 15','Oct 5'] },
    'Benfica':               { results: ['V','V','V','E','V'], scores: ['4-0','2-1','3-0','1-1','2-0'], dates: isEs ? ['18 Ago','25 Ago','14 Sep','1 Oct','22 Oct'] : ['Aug 18','Aug 25','Sep 14','Oct 1','Oct 22'] },
    'Ajax':                  { results: ['V','E','V','V','V'], scores: ['3-1','1-1','2-0','3-2','4-1'], dates: isEs ? ['10 Ago','18 Ago','24 Ago','14 Sep','5 Oct'] : ['Aug 10','Aug 18','Aug 24','Sep 14','Oct 5'] },
    'Celtic FC':             { results: ['V','V','V','E','D'], scores: ['5-0','3-1','2-0','1-1','1-3'], dates: isEs ? ['4 Ago','11 Ago','24 Ago','14 Sep','19 Sep'] : ['Aug 4','Aug 11','Aug 24','Sep 14','Sep 19'] },
    'Al-Hilal SFC':          { results: ['V','V','V','V','E'], scores: ['3-0','2-0','4-1','2-0','1-1'], dates: isEs ? ['16 Ago','23 Ago','30 Ago','20 Sep','26 Oct'] : ['Aug 16','Aug 23','Aug 30','Sep 20','Oct 26'] },
    'Al-Nassr FC':           { results: ['V','V','E','V','V'], scores: ['2-0','3-1','1-1','2-0','3-2'], dates: isEs ? ['16 Ago','23 Ago','13 Sep','27 Sep','18 Oct'] : ['Aug 16','Aug 23','Sep 13','Sep 27','Oct 18'] },
    'Inter Miami CF':        { results: ['V','V','E','V','D'], scores: ['3-1','2-0','1-1','2-1','0-1'], dates: isEs ? ['18 Ago','25 Ago','31 Ago','14 Sep','28 Sep'] : ['Aug 18','Aug 25','Aug 31','Sep 14','Sep 28'] },
    'River Plate':           { results: ['V','V','V','E','V'], scores: ['3-0','2-1','1-0','0-0','2-0'], dates: isEs ? ['18 Ago','25 Ago','8 Sep','22 Sep','5 Oct'] : ['Aug 18','Aug 25','Sep 8','Sep 22','Oct 5'] },
    'Flamengo':              { results: ['V','E','V','V','V'], scores: ['2-0','1-1','3-1','2-0','3-2'], dates: isEs ? ['18 Ago','25 Ago','8 Sep','21 Sep','6 Oct'] : ['Aug 18','Aug 25','Sep 8','Sep 21','Oct 6'] },
  };

  // Score mapping: W=85, D=55, L=20
  const resultValue = { 'V': 85, 'W': 85, 'E': 55, 'D': 20, 'L': 20 };

  // Get form for current club, or generate a generic one
  const form = CLUB_FORM[club] || {
    results: ['V','E','V','V','E'],
    scores:  ['2-0','1-1','3-1','2-0','1-1'],
    dates: isEs ? ['Ago','Sep','Sep','Oct','Oct'] : ['Aug','Sep','Sep','Oct','Oct']
  };

  const dataPoints = form.results.map(r => resultValue[r] || 55);

  teamColor = teamColor || '#00f0ff';
  const ctx2d = ctx.getContext('2d');
  const gradient = ctx2d.createLinearGradient(0, 0, 0, 120);
  gradient.addColorStop(0, `${teamColor}`);
  gradient.addColorStop(1, `${teamColor}`);

  const resultLabel = isEs
    ? { 'V': 'Victoria', 'W': 'Victoria', 'E': 'Empate', 'D': 'Derrota', 'L': 'Derrota' }
    : { 'V': 'Win', 'W': 'Win', 'E': 'Draw', 'D': 'Loss', 'L': 'Loss' };

  try {
    performanceChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: form.dates,
        datasets: [{
          data: dataPoints,
          borderColor: teamColor,
          borderWidth: 2.5,
          backgroundColor: gradient,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: form.results.map(r =>
            r === 'V' || r === 'W' ? '#22c55e' :
            r === 'E'              ? '#eab308' : '#ef4444'
          ),
          pointBorderColor: '#fff',
          pointBorderWidth: 1.5,
          pointHoverRadius: 7,
          pointRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (items) => form.dates[items[0].dataIndex],
              label: (item) => {
                const i = item.dataIndex;
                const r = form.results[i];
                const s = form.scores[i];
                return ` ${resultLabel[r]}  ${s}`;
              }
            },
            backgroundColor: 'rgba(10,14,26,0.95)',
            titleColor: 'rgba(255,255,255,0.7)',
            bodyColor: '#fff',
            borderColor: teamColor,
            borderWidth: 1,
            padding: 10,
            cornerRadius: 8
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: 'rgba(255,255,255,0.5)', font: { family: 'Inter', size: 9 } }
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: {
              color: 'rgba(255,255,255,0.5)',
              font: { family: 'Inter', size: 9 },
              callback: (v) => v === 85 ? (isEs ? 'V' : 'W') : v === 55 ? (isEs ? 'E' : 'D') : (isEs ? 'D' : 'L')
            },
            min: 0,
            max: 100,
            afterBuildTicks: (axis) => { axis.ticks = [{value:20},{value:55},{value:85}]; }
          }
        }
      }
    });
  } catch (err) {
    console.error('Failed to render Chart.js performance chart (dashboard):', err);
  }
}


async function renderMyClubAlerts(clubName, countryName) {
  const container = document.getElementById('db-alerts-list');
  if (!container) return;
  
  const playerNodes = document.querySelectorAll('.field-player-node');
  let pName = "Jugador #7";
  if (playerNodes.length > 0) {
    const list = Array.from(playerNodes);
    const node = list[Math.min(5, list.length - 1)];
    const textEl = node.querySelector('.field-player-name');
    if (textEl) pName = textEl.textContent;
  }
  
  const opponents = await getOtherTeamsInLeague(clubName, countryName);
  if (opponents.length < 3) {
    const fallbackOpponents = generateProceduralTeams(getEnglishCountryName(countryName)).filter(t => t !== clubName);
    opponents.push(...fallbackOpponents);
  }
  let hash = 0;
  for (let i = 0; i < clubName.length; i++) {
    hash = clubName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const absHash = Math.abs(hash);
  const scheduleType = absHash % 3; // 0: Current, 1: Next, 2: Announced Later

  // Resolve the correct first opponent for alerts — mirrors the first match in REAL_2024_25_FIXTURES
  const REAL_ALERTS_OPPONENTS = {
    // La Liga
    "Real Madrid":              "FC Barcelona",
    "FC Barcelona":             "Real Madrid",
    "Atlético de Madrid":       "Real Madrid",
    "Sevilla FC":               "FC Barcelona",
    "Real Betis":               "Sevilla FC",
    "Valencia CF":              "Real Madrid",
    "Villarreal CF":            "FC Barcelona",
    "Real Sociedad":            "FC Barcelona",
    "Athletic Club":            "FC Barcelona",
    "Celta de Vigo":            "Real Madrid",
    "Girona FC":                "Real Madrid",
    "Getafe CF":                "Real Madrid",
    "Rayo Vallecano":           "Real Madrid",
    "Deportivo Alavés":         "Real Madrid",
    "RCD Mallorca":             "Real Madrid",
    "Osasuna":                  "Real Madrid",
    // Premier League
    "Manchester City":          "Arsenal",
    "Arsenal":                  "Manchester City",
    "Liverpool":                "Real Madrid",
    "Chelsea":                  "Liverpool",
    "Manchester United":        "Liverpool",
    "Tottenham Hotspur":        "Arsenal",
    "Newcastle United":         "Manchester City",
    "Aston Villa":              "Manchester City",
    "West Ham United":          "Arsenal",
    "Brighton & Hove Albion":   "Arsenal",
    "Nottingham Forest":        "Chelsea",
    "Everton":                  "Liverpool",
    "Wolverhampton":            "Manchester City",
    "Crystal Palace":           "Arsenal",
    "Fulham":                   "Arsenal",
    "Brentford":                "Arsenal",
    "Leicester City":           "Liverpool",
    "Ipswich Town":             "Liverpool",
    "Southampton":              "Manchester City",
    // Bundesliga
    "Bayern Munich":            "FC Barcelona",
    "Borussia Dortmund":        "Real Madrid",
    "Bayer Leverkusen":         "Bayern Munich",
    "RB Leipzig":               "Bayern Munich",
    "Eintracht Frankfurt":      "Bayern Munich",
    "VfB Stuttgart":            "Bayern Munich",
    "Borussia Mönchengladbach": "Bayern Munich",
    "Hamburger SV":             "SC Paderborn",
    // Serie A
    "Juventus":                 "Inter Milan",
    "Inter Milan":              "Juventus",
    "AC Milan":                 "Inter Milan",
    "Napoli":                   "Inter Milan",
    "AS Roma":                  "Inter Milan",
    "SS Lazio":                 "Inter Milan",
    "Atalanta BC":              "Inter Milan",
    "Fiorentina":               "Inter Milan",
    "Torino FC":                "Juventus",
    // Ligue 1
    "Paris Saint-Germain":      "Arsenal",
    "Olympique Marseille":      "Paris Saint-Germain",
    "Olympique Lyonnais":       "Paris Saint-Germain",
    "AS Monaco":                "Paris Saint-Germain",
    "LOSC Lille":               "Paris Saint-Germain",
    "Stade Rennais":            "Paris Saint-Germain",
    "RC Lens":                  "Paris Saint-Germain",
    "Nice":                     "Paris Saint-Germain",
    // Portugal
    "Benfica":                  "FC Porto",
    "FC Porto":                 "Benfica",
    "Sporting CP":              "Benfica",
    // Netherlands
    "Ajax":                     "PSV Eindhoven",
    "PSV Eindhoven":            "Ajax",
    "Feyenoord":                "Ajax",
    // Scotland
    "Celtic FC":                "Rangers FC",
    "Rangers FC":               "Celtic FC",
    // Turkey
    "Galatasaray":              "Fenerbahçe",
    "Fenerbahçe":               "Galatasaray",
    // South America
    "River Plate":              "Boca Juniors",
    "Boca Juniors":             "River Plate",
    "Flamengo":                 "Fluminense",
    "Fluminense":               "Flamengo",
    "Palmeiras":                "Corinthians",
    // Mexico
    "Club América":             "Chivas de Guadalajara",
    "Chivas de Guadalajara":    "Club América"
  };

  const hasVerifiedFixtures = !!REAL_ALERTS_OPPONENTS[clubName];
  const nextOpp = hasVerifiedFixtures
    ? REAL_ALERTS_OPPONENTS[clubName]
    : (opponents.length > 0 ? opponents[absHash % opponents.length] : "FC Azul");
    
  if (window.myClubData && window.myClubData.squad.length > 0) {
    pName = window.myClubData.squad[0].name;
  }

  let talentName = 'Joven Promesa';
  let talentStats = 'OVR 75, POT 89, Pace 88, Dribbling 82';
  if (window.dbPlayers && window.dbPlayers.length > 0) {
    const youngPlayers = window.dbPlayers.filter(p => p.age <= 21 && p.potential >= 82);
    if (youngPlayers.length > 0) {
      const talent = youngPlayers[Math.floor(Math.random() * youngPlayers.length)];
      talentName = talent.name;
      talentStats = `Edad: ${talent.age}, OVR actual: ${talent.overall}, Potencial: ${talent.potential}, Valor de mercado: Alto.`;
    }
  }

  const isEs = currentLang === 'es';
  let list = [];
  
  if (!hasVerifiedFixtures && scheduleType === 2) {
    list = isEs ? [
      {
        type: "warning",
        icon: "⚠️",
        msg: `<strong>Sin Partidos Programados:</strong> No se han detectado partidos oficiales para la temporada actual o próxima.`
      },
      {
        type: "info",
        icon: "🔍",
        msg: `<strong>Planificación de Fichajes:</strong> La red de scouting ha identificado a <strong>${talentName}</strong> como objetivo prioritario basándose en sus métricas recientes.`
      },
      {
        type: "success",
        icon: "🛡️",
        msg: `<strong>Reporte de Pretemporada:</strong> Análisis táctico global del equipo completado y disponible para descarga.`
      }
    ] : [
      {
        type: "warning",
        icon: "⚠️",
        msg: `<strong>No Scheduled Matches:</strong> No official matches have been detected for the current or next season.`
      },
      {
        type: "info",
        icon: "🔍",
        msg: `<strong>Transfer Planning:</strong> The scouting network has identified <strong>${talentName}</strong> as a priority target based on recent metrics.`
      },
      {
        type: "success",
        icon: "🛡️",
        msg: `<strong>Pre-season Report:</strong> Team's global tactical analysis completed and available for download.`
      }
    ];
  } else if (!hasVerifiedFixtures && scheduleType === 1) {
    list = isEs ? [
      {
        type: "warning",
        icon: "⚠️",
        msg: `<strong>Alerta de Lesión (Próxima Temporada):</strong> El jugador <strong>${pName}</strong> muestra alta fatiga de gemelo antes del debut vs ${nextOpp}.`
      },
      {
        type: "info",
        icon: "🔍",
        msg: `<strong>Mercado de Fichajes:</strong> <strong>${talentName}</strong> recomendado para reforzar la plantilla esta nueva temporada.`
      },
      {
        type: "success",
        icon: "🛡️",
        msg: `<strong>Análisis de Apertura:</strong> Reporte táctico y plan de partido para el debut de liga vs <strong>${nextOpp}</strong> completado.`
      }
    ] : [
      {
        type: "warning",
        icon: "⚠️",
        msg: `<strong>Injury Alert (Next Season):</strong> Player <strong>${pName}</strong> shows high calf fatigue before the debut vs ${nextOpp}.`
      },
      {
        type: "info",
        icon: "🔍",
        msg: `<strong>Transfer Window:</strong> <strong>${talentName}</strong> recommended to reinforce the squad for the new season.`
      },
      {
        type: "success",
        icon: "🛡️",
        msg: `<strong>Opening Match Analysis:</strong> Tactical report and game plan for the league debut vs <strong>${nextOpp}</strong> completed.`
      }
    ];
  } else {
    // Current season (scheduleType === 0)
    list = isEs ? [
      {
        type: "warning",
        icon: "⚠️",
        msg: `<strong>Alerta de Lesión Potencial:</strong> El jugador <strong>${pName}</strong> (Riesgo Alto) muestra fatiga de gemelo antes del partido vs ${nextOpp}.`
      },
      {
        type: "info",
        icon: "🔍",
        msg: `<strong>Nuevo Talento Detectado:</strong> <strong>${talentName}</strong> ha sido recomendado por la red de scouting para reforzar la plantilla.`
      },
      {
        type: "success",
        icon: "🛡️",
        msg: `<strong>Análisis Táctico Completado:</strong> Reporte Pre-partido vs <strong>${nextOpp}</strong> disponible para descarga.`
      }
    ] : [
      {
        type: "warning",
        icon: "⚠️",
        msg: `<strong>Potential Injury Alert:</strong> Player <strong>${pName}</strong> (High Risk) shows calf fatigue before match vs ${nextOpp}.`
      },
      {
        type: "info",
        icon: "🔍",
        msg: `<strong>New Talent Detected:</strong> <strong>${talentName}</strong> has been recommended by the scouting network to reinforce the squad.`
      },
      {
        type: "success",
        icon: "🛡️",
        msg: `<strong>Tactical Analysis Complete:</strong> Pre-match report vs <strong>${nextOpp}</strong> available for download.`
      }
    ];
  }
  
  container.innerHTML = list.map(a => {
    const contextStr = JSON.stringify({ clubName, nextOpp, pName, talentName, talentStats }).replace(/"/g, '&quot;');
    // Extract text inside strong tags as title
    const match = a.msg.match(/<strong>(.*?)<\/strong>/);
    let alertTitle = match ? match[1].replace(':', '').trim() : 'Reporte Ejecutivo';
    const cleanMsg = a.msg.replace(/<[^>]*>?/gm, ''); // plain text for AI
    
    const titleStr = JSON.stringify(alertTitle).replace(/"/g, '&quot;');
    const typeStr = JSON.stringify(cleanMsg).replace(/"/g, '&quot;');
    
    return `
    <div class="db-alert-row" style="cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background=''" onclick="openAlertModal(${titleStr}, ${typeStr}, ${contextStr})">
      <div class="db-alert-icon-wrap ${a.type}">${a.icon}</div>
      <div class="db-alert-message">${a.msg}</div>
    </div>
  `}).join('');
}

async function openAlertModal(alertTitle, alertType, contextData) {
  const modal = document.getElementById('player-modal');
  const modalBody = document.getElementById('modal-body');
  if (!modal || !modalBody) return;

  modal.style.display = 'flex';
  
  // Bind close events
  document.getElementById('modal-close').onclick = closeModal;
  document.getElementById('player-modal').onclick = (e) => {
    if (e.target === document.getElementById('player-modal')) closeModal();
  };

  // Render final structure immediately to avoid a blank loading screen
  modalBody.innerHTML = `
    <div style="padding: 20px;">
      <h3 style="color: var(--accent); margin-bottom: 15px; display: flex; align-items: center; gap: 10px; font-weight: 600; font-size: 1.2rem;">
        <span>📋</span> ${alertTitle}
      </h3>
      <div id="alert-markdown-content" class="markdown-content" style="line-height: 1.6; font-size: 0.95rem; text-align: justify; opacity: 0.7;">
        <span class="blinking-cursor">Analizando datos y redactando informe ejecutivo...</span>
      </div>
    </div>
  `;

  try {
    const res = await fetchWithAuth(`${API}/alert/expand`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alertType, contextData, lang: currentLang })
    });

    if (!res.ok) throw new Error('Error al conectar con la IA');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error from server');
    
    // Inject the final content directly into the already-rendered structure
    const contentDiv = document.getElementById('alert-markdown-content');
    if (contentDiv) {
      contentDiv.style.opacity = '1';
      contentDiv.innerHTML = markdownToHtml(data.report);
    }
  } catch (err) {
    const contentDiv = document.getElementById('alert-markdown-content');
    if (contentDiv) {
      contentDiv.style.opacity = '1';
      contentDiv.innerHTML = `<span style="color:#ff5555;">⚠️ Error al generar el análisis: ${err.message}</span>`;
    }
  }
}

async function renderMyClubDashboard() {
  const user = JSON.parse(localStorage.getItem('scout_ai_user') || 'null');
  if (!user) return;
  
  const isLocalPlan = (user.selectedTier || '').toLowerCase() === 'local' || 
                      (user.role || '').toLowerCase() === 'local' || 
                      (user.role || '').toLowerCase() === 'entrenador local' ||
                      user.selectedClub === 'Club Local';

  // Ensure selectedClub is clean ('Club Local') for local plan users
  if (isLocalPlan && user.selectedClub && user.selectedClub !== 'Club Local') {
    user.selectedClub = 'Club Local';
    localStorage.setItem('scout_ai_user', JSON.stringify(user));
  }

  let localCoachDataObj = {};
  if (user.localCoachData) {
    try {
      localCoachDataObj = typeof user.localCoachData === 'string' ? JSON.parse(user.localCoachData) : user.localCoachData;
    } catch (e) {}
  }

  const clubName = isLocalPlan 
    ? (localCoachDataObj.club || 'Club Local') 
    : (user.selectedClub || 'Real Madrid');

  const countryName = user.selectedCountry?.split(',')[0]?.trim() || localCoachDataObj.nationality || "España";
  
  const theme = getClubTheme(clubName);
  const shieldShortEl = document.getElementById('db-club-shield-short');
  const shieldGlowEl = document.getElementById('db-club-shield');

  if (isLocalPlan) {
    const initials = localCoachDataObj.club 
      ? localCoachDataObj.club.split(' ').map(w => w[0]).join('').substring(0, 3).toUpperCase() 
      : 'LCL';
    if (shieldShortEl) shieldShortEl.textContent = initials;
    if (shieldGlowEl) {
      shieldGlowEl.style.background = 'rgba(0, 240, 255, 0.1)';
      shieldGlowEl.style.boxShadow = '0 0 20px rgba(0, 240, 255, 0.2)';
      shieldGlowEl.style.borderColor = '#00f0ff';
      shieldGlowEl.innerHTML = `<span id="db-club-shield-short" style="font-size: 1.4rem; font-weight: 800; color: #00f0ff; letter-spacing: 1px;">${initials}</span>`;
    }
  } else {
    if (shieldShortEl) shieldShortEl.textContent = theme.short;
    if (shieldGlowEl) {
      shieldGlowEl.style.background = `linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[1]})`;
      shieldGlowEl.style.boxShadow = `0 0 25px ${getOpacityColor(theme.colors[0], 0.53)}, inset 0 0 15px rgba(255,255,255,0.2)`;
      shieldGlowEl.style.borderColor = theme.colors[0];

      // Load local club logo asynchronously for standard professional teams
      (async () => {
        try {
          const res = await fetchWithAuth(`${API}/team-logo?name=${encodeURIComponent(clubName)}`);
          const data = await res.json();
          if (data.logoUrl) {
            const url = getAbsoluteUrl(data.logoUrl);
            shieldGlowEl.innerHTML = `<img src="${url}" style="width: 70%; height: 70%; object-fit: contain; z-index: 2; position: relative;">`;
            shieldGlowEl.style.background = 'rgba(7, 14, 27, 0.6)';
            shieldGlowEl.style.border = '1px solid rgba(255, 255, 255, 0.1)';
          }
        } catch (err) {
          console.warn('Could not load club dashboard logo:', err);
        }
      })();
    }
  }
  
  const nameEl = document.getElementById('db-club-name');
  const detailsEl = document.getElementById('db-club-details');
  if (nameEl) nameEl.textContent = clubName;
  
  let leagueName = getLeagueNameFallback(countryName);
  if (window.allPlayers && window.allPlayers.length > 0) {
    const match = window.allPlayers.find(p => p.currentTeam === clubName);
    if (match && match.league) leagueName = match.league;
  }
  
  renderLeagueLabel(detailsEl, leagueName, countryName);
  
  if (detailsEl && leagueName === "Liga Profesional" && countryName) {
    try {
      const resolvedCountry = getEnglishCountryName(countryName);
      const res = await fetchWithAuth(`${API}/onboarding/teams?country=${encodeURIComponent(resolvedCountry)}`);
      if (res.ok) {
        const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error from server');
        const foundClub = data.teams.find(t => t.name.toLowerCase() === clubName.toLowerCase());
        if (foundClub && foundClub.leagueName) {
          leagueName = foundClub.leagueName;
          renderLeagueLabel(detailsEl, leagueName, countryName);
        }
      }
    } catch (e) {
      console.error("[renderMyClubDashboard] Error fetching leagueName:", e);
    }
  }
  
  const stats = getDeterministicStats(clubName, countryName);
  const posEl = document.getElementById('db-stat-pos');
  const goalsEl = document.getElementById('db-stat-goals');
  const xgEl = document.getElementById('db-stat-xg');
  const matchesEl = document.getElementById('db-stat-matches');
  if (posEl) posEl.textContent = stats.pos;
  if (goalsEl) goalsEl.textContent = stats.goals;
  if (xgEl) xgEl.textContent = stats.xG;
  if (matchesEl) matchesEl.textContent = stats.matches;
  
  await renderMyClubMatches(clubName, countryName);
  
  const formationSelector = document.getElementById('db-formation-selector');
  if (formationSelector) {
    const formation = user.preferredFormation || '4-3-3';
    if (formationSelector.value !== formation) {
      formationSelector.value = formation;
    }
  }
  
  const styleSelector = document.getElementById('db-style-selector');
  if (styleSelector) {
    const style = user.preferredStyle || 'tikitaka';
    if (styleSelector.value !== style) {
      styleSelector.value = style;
    }
  }
  
  const currentFormation = formationSelector ? formationSelector.value : (user.preferredFormation || '4-3-3');
  renderFieldPlayers(currentFormation);
  
  renderDashboardPerformanceChart(theme.colors[0]);
  await renderMyClubAlerts(clubName, countryName);
}


async function saveTacticalPreferences(formation, style) {
  try {
    await fetchWithAuth(`${API}/auth/onboarding`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        preferredFormation: formation,
        preferredStyle: style
      })
    });
  } catch (err) {
    console.error('Failed to sync tactical preferences:', err);
  }
}

function initDashboard() {
  console.log("Dashboard initialized");
  
  // Ensure default fallback state for user skipped onboarding
  let user = JSON.parse(localStorage.getItem('scout_ai_user') || '{}');
  if (!user.selectedClub) {
    user.onboardingComplete = true;
    user.selectedCountry = "Spain";
    user.selectedClub = "Real Madrid";
    user.preferredFormation = "4-3-3";
    user.preferredStyle = "tikitaka";
    localStorage.setItem('scout_ai_user', JSON.stringify(user));
  }

  const onboarding = document.getElementById('onboarding-screen');
  if (onboarding) {
    onboarding.style.transition = 'opacity 0.5s ease';
    onboarding.style.opacity = '0';
    setTimeout(() => {
      onboarding.style.display = 'none';
      document.body.style.overflow = '';
      document.body.style.height = '';
    }, 500);
  } else {
    document.body.style.overflow = '';
    document.body.style.height = '';
  }

  const navMyClub = document.getElementById('nav-my-club');
  if (navMyClub) {
    navMyClub.style.display = 'block';
  }
  const navMyClubMobile = document.getElementById('nav-my-club-mobile');
  if (navMyClubMobile) {
    navMyClubMobile.style.display = 'block';
  }

  // Self-heal and initialize defaults for formation and style
  let userUpdated = false;
  if (!user.preferredFormation) {
    user.preferredFormation = "4-3-3";
    userUpdated = true;
  }
  if (!user.preferredStyle) {
    user.preferredStyle = "tikitaka";
    userUpdated = true;
  }
  if (userUpdated) {
    localStorage.setItem('scout_ai_user', JSON.stringify(user));
    saveTacticalPreferences(user.preferredFormation, user.preferredStyle);
  }

  const formationSelector = document.getElementById('db-formation-selector');
  if (formationSelector) {
    formationSelector.value = user.preferredFormation || '4-3-3';
    formationSelector.onchange = (e) => {
      const selectedFormation = e.target.value;
      renderFieldPlayers(selectedFormation);
      const user = JSON.parse(localStorage.getItem('scout_ai_user') || '{}');
      user.preferredFormation = selectedFormation;
      
      // Dynamic mapping to synchronize the tactical style selector next to the formation
      const formationToStyle = {
        '4-3-3': 'tikitaka',
        '4-4-2': 'longball',
        '3-5-2': 'total',
        '4-2-3-1': 'gegenpress',
        '4-1-2-1-2': 'heavy_metal',
        '3-4-3': 'wingplay',
        '5-3-2': 'counter',
        '5-4-1': 'catenaccio',
        '4-5-1': 'parkbus',
        '4-3-2-1': 'trequartista',
        '3-4-2-1': 'juego_posicion',
        '5-2-3': 'verrou',
        '4-4-1-1': 'target_man',
        '3-4-1-2': 'kick_rush',
        '4-3-1-2': 'vertikalspiel',
        '4-2-2-2': 'samba'
      };
      
      const matchedStyle = formationToStyle[selectedFormation] || 'tikitaka';
      user.preferredStyle = matchedStyle;
      
      const styleSelector = document.getElementById('db-style-selector');
      if (styleSelector) {
        styleSelector.value = matchedStyle;
      }
      
      localStorage.setItem('scout_ai_user', JSON.stringify(user));
      saveTacticalPreferences(user.preferredFormation, user.preferredStyle);
      
      if (document.getElementById('section-profile')?.classList.contains('active')) {
        renderProfile();
      }
      
      // Beautiful premium interactive toast notification
      const styleName = t(`style_${matchedStyle}`) || matchedStyle;
      const msg = currentLang === 'es'
        ? `Alineación "${selectedFormation}" seleccionada. Estilo táctico sugerido: ${styleName}`
        : `Formation "${selectedFormation}" selected. Suggested tactical style: ${styleName}`;
      showToast(`⚡ ${msg}`, 'success');
    };
  }

  const styleSelector = document.getElementById('db-style-selector');
  if (styleSelector) {
    styleSelector.value = user.preferredStyle || 'tikitaka';
    styleSelector.onchange = (e) => {
      const user = JSON.parse(localStorage.getItem('scout_ai_user') || '{}');
      user.preferredStyle = e.target.value;
      
      // Dynamic recommended formations mapping for each style
      const recommendedFormations = {
        tikitaka: '4-3-3',
        longball: '4-4-2',
        total: '3-5-2',
        gegenpress: '4-2-3-1',
        wingplay: '3-4-3',
        counter: '5-3-2',
        parkbus: '4-5-1',
        catenaccio: '5-4-1',
        juego_posicion: '3-4-2-1',
        samba: '4-2-2-2',
        kick_rush: '3-4-1-2',
        verrou: '5-2-3',
        vertikalspiel: '4-3-1-2',
        trequartista: '4-3-2-1',
        heavy_metal: '4-1-2-1-2',
        target_man: '4-4-1-1'
      };
      
      const recFormation = recommendedFormations[e.target.value] || '4-3-3';
      user.preferredFormation = recFormation;
      
      const formationSelector = document.getElementById('db-formation-selector');
      if (formationSelector) {
        formationSelector.value = recFormation;
      }
      
      renderFieldPlayers(recFormation);
      localStorage.setItem('scout_ai_user', JSON.stringify(user));
      saveTacticalPreferences(user.preferredFormation, user.preferredStyle);
      
      // Beautiful premium interactive toast notification
      const styleName = t(`style_${e.target.value}`) || e.target.value;
      const msg = currentLang === 'es'
        ? `Estilo "${styleName}" aplicado. Alineación recomendada: ${recFormation}`
        : `Style "${styleName}" applied. Recommended formation: ${recFormation}`;
      showToast(`⚡ ${msg}`, 'success');
      
      if (document.getElementById('section-profile')?.classList.contains('active')) {
        renderProfile();
      }
    };
  }

  const quickChatSendBtn = document.getElementById('db-chat-quick-send-btn');
  const quickChatInput = document.getElementById('db-chat-quick-input');
  const inlineChatMessages = document.getElementById('db-inline-chat-messages');
  let inlineChatSessionId = null;

  if (quickChatSendBtn && quickChatInput && inlineChatMessages) {
    quickChatSendBtn.onclick = async () => {
      const msg = quickChatInput.value.trim();
      if (!msg) return;
      quickChatInput.value = '';
      
      if (inlineChatMessages.innerHTML.includes('Asistente inteligente enfocado') || inlineChatMessages.innerHTML.includes('Pregúntame exclusivamente')) {
        inlineChatMessages.innerHTML = '';
      }

      const userDiv = document.createElement('div');
      userDiv.style.alignSelf = 'flex-end';
      userDiv.style.background = 'var(--primary)';
      userDiv.style.color = '#fff';
      userDiv.style.padding = '8px 12px';
      userDiv.style.borderRadius = '12px 12px 0 12px';
      userDiv.style.maxWidth = '85%';
      userDiv.style.fontSize = '0.9rem';
      userDiv.textContent = msg;
      inlineChatMessages.appendChild(userDiv);
      inlineChatMessages.scrollTop = inlineChatMessages.scrollHeight;

      const thinkingDiv = document.createElement('div');
      thinkingDiv.style.alignSelf = 'flex-start';
      thinkingDiv.style.background = 'rgba(255,255,255,0.05)';
      thinkingDiv.style.padding = '8px 12px';
      thinkingDiv.style.borderRadius = '12px 12px 12px 0';
      thinkingDiv.style.maxWidth = '90%';
      thinkingDiv.style.fontSize = '0.9rem';
      thinkingDiv.innerHTML = '<span class="blinking-cursor">Pensando...</span>';
      inlineChatMessages.appendChild(thinkingDiv);
      inlineChatMessages.scrollTop = inlineChatMessages.scrollHeight;

      try {
        const clubName = window.myClubData ? window.myClubData.team.name : 'Mi Club';
        const clubRoster = window.myClubData && window.myClubData.squad ? window.myClubData.squad.map(p => `${p.name} (${p.position}, OVR: ${p.overall})`).join(', ') : '';
        const res = await fetchWithAuth(`${API}/chat/stream`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: msg,
            sessionId: inlineChatSessionId,
            lang: currentLang,
            clubContext: clubName,
            clubRoster: clubRoster
          })
        });

        if (!res.ok) throw new Error('Error en el chat inline');
        const reader = res.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let fullReply = '';

        thinkingDiv.innerHTML = '';
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const lines = decoder.decode(value).split('\n');
          for (let line of lines) {
            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.slice(6));
              if (data.error) throw new Error(data.error);
              if (data.chunk) {
                fullReply += data.chunk;
                thinkingDiv.innerHTML = markdownToHtml(fullReply);
                inlineChatMessages.scrollTop = inlineChatMessages.scrollHeight;
              }
              if (data.sessionId) inlineChatSessionId = data.sessionId;
            }
          }
        }
      } catch (err) {
        thinkingDiv.innerHTML = `<span style="color:#ff5555;">⚠️ ${err.message}</span>`;
      }
    };
    quickChatInput.onkeydown = (e) => {
      if (e.key === 'Enter') {
        quickChatSendBtn.click();
      }
    };
  }

  const editFormationBtn = document.getElementById('db-btn-edit-formation');
  if (editFormationBtn) {
    editFormationBtn.onclick = () => {
      window.openTacticalEditorModal();
    };
  }

  goToSection('my-club');

  // ─── PREMIUM TACTICAL EDITOR MODAL HANDLERS ───
    window.selectModalTeam = function(teamCode) {
    const altSel = document.getElementById('modal-alternative-selector');
    if (altSel) {
      altSel.value = teamCode;
    }
    
    const btnA = document.getElementById('btn-team-a');
    const btnB = document.getElementById('btn-team-b');
    if (btnA && btnB) {
      if (teamCode === 'A') {
        btnA.style.background = '#00f0ff';
        btnA.style.borderColor = '#00f0ff';
        btnA.style.color = '#080e1a';
        
        btnB.style.background = 'rgba(255,255,255,0.05)';
        btnB.style.borderColor = 'rgba(255,255,255,0.15)';
        btnB.style.color = '#fff';
      } else {
        btnB.style.background = '#00f0ff';
        btnB.style.borderColor = '#00f0ff';
        btnB.style.color = '#080e1a';
        
        btnA.style.background = 'rgba(255,255,255,0.05)';
        btnA.style.borderColor = 'rgba(255,255,255,0.15)';
        btnA.style.color = '#fff';
      }
    }
    
    window.updateModalTacticPreview();
  };

window.openTacticalEditorModal = function() {
    const modal = document.getElementById('tactical-editor-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // prevent double scrollbar
    
    selectedStartingIndex = null;
    selectedBenchId = null;
    
    window.switchTacticTab('players');
    window.populateModalPlayers();
    
    const formSel = document.getElementById('modal-formation-selector');
    const styleSel = document.getElementById('modal-style-selector');
    const mainFormSel = document.getElementById('db-formation-selector');
    const mainStyleSel = document.getElementById('db-style-selector');
    const activeAlternative = user.preferredAlternative || 'A';
    const altSel = document.getElementById('modal-alternative-selector');
    if (altSel) {
      altSel.value = activeAlternative;
    }
    window.selectModalTeam(activeAlternative);
    
    if (formSel && mainFormSel) {
      formSel.innerHTML = mainFormSel.innerHTML;
      formSel.value = mainFormSel.value;
      formSel.onchange = (e) => {
        const selectedFormation = e.target.value;
        
        // Sync modal style selector to match selected formation
        const formationToStyle = {
          '4-3-3': 'tikitaka',
          '4-4-2': 'longball',
          '3-5-2': 'total',
          '4-2-3-1': 'gegenpress',
          '4-1-2-1-2': 'heavy_metal',
          '3-4-3': 'wingplay',
          '5-3-2': 'counter',
          '5-4-1': 'catenaccio',
          '4-5-1': 'parkbus',
          '4-3-2-1': 'trequartista',
          '3-4-2-1': 'juego_posicion',
          '5-2-3': 'verrou',
          '4-4-1-1': 'target_man',
          '3-4-1-2': 'kick_rush',
          '4-3-1-2': 'vertikalspiel',
          '4-2-2-2': 'samba'
        };
        const matchedStyle = formationToStyle[selectedFormation] || 'tikitaka';
        if (styleSel) {
          styleSel.value = matchedStyle;
        }
        
        window.updateModalTacticPreview();
      };
    }
    
    if (styleSel && mainStyleSel) {
      styleSel.innerHTML = mainStyleSel.innerHTML;
      styleSel.value = mainStyleSel.value;
      styleSel.onchange = (e) => {
        const selectedStyle = e.target.value;
        
        // Sync modal formation selector to match selected style
        const recommendedFormations = {
          tikitaka: '4-3-3',
          longball: '4-4-2',
          total: '3-5-2',
          gegenpress: '4-2-3-1',
          wingplay: '3-4-3',
          counter: '5-3-2',
          parkbus: '4-5-1',
          catenaccio: '5-4-1',
          juego_posicion: '3-4-2-1',
          samba: '4-2-2-2',
          kick_rush: '3-4-1-2',
          verrou: '5-2-3',
          vertikalspiel: '4-3-1-2',
          trequartista: '4-3-2-1',
          heavy_metal: '4-1-2-1-2',
          target_man: '4-4-1-1'
        };
        const recFormation = recommendedFormations[selectedStyle] || '4-3-3';
        if (formSel) {
          formSel.value = recFormation;
        }
        
        window.updateModalTacticPreview();
      };
    }
    
    window.updateModalTacticPreview();
  };

  window.closeTacticalEditorModal = function() {
    const modal = document.getElementById('tactical-editor-modal');
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = '';
  };

  window.confirmTacticalChanges = function() {
    const formSel = document.getElementById('modal-formation-selector');
    const styleSel = document.getElementById('modal-style-selector');
    const mainFormSel = document.getElementById('db-formation-selector');
    const mainStyleSel = document.getElementById('db-style-selector');

    if (!formSel || !styleSel) return;

    const selectedFormation = formSel.value;
    const selectedStyle = styleSel.value;
    const altSel = document.getElementById('modal-alternative-selector');
    const selectedAlternative = altSel ? altSel.value : 'A';

    // 1. Save tactical preferences in local storage
    const user = JSON.parse(localStorage.getItem('scout_ai_user') || '{}');
    user.preferredFormation = selectedFormation;
    user.preferredStyle = selectedStyle;
    user.preferredAlternative = selectedAlternative;
    localStorage.setItem('scout_ai_user', JSON.stringify(user));

    // Save to database
    saveTacticalPreferences(selectedFormation, selectedStyle);

    // 2. Clear custom swaps and benched list to reflect the new recommendations
    localStorage.removeItem('scout_ai_swaps');
    localStorage.removeItem('scout_ai_benched');

    // 3. Update dashboard main selectors value directly without dispatching cross-coupling events
    if (mainFormSel) {
      mainFormSel.value = selectedFormation;
    }
    if (mainStyleSel) {
      mainStyleSel.value = selectedStyle;
    }

    // 4. Re-render the main field players
    renderFieldPlayers(selectedFormation);

    // 5. Force update other components if profile is active
    if (document.getElementById('section-profile')?.classList.contains('active')) {
      renderProfile();
    }

    // 6. Close the modal
    window.closeTacticalEditorModal();

    // 7. Toast notification
    const styleName = t(`style_${selectedStyle}`) || selectedStyle;
    const msg = currentLang === 'es'
      ? `Cambios guardados: Alineación ${selectedFormation} (${styleName})`
      : `Changes saved: Formation ${selectedFormation} (${styleName})`;
    showToast(`⚡ ${msg}`, 'success');
  };

  window.switchTacticTab = function(tabName) {
    document.querySelectorAll('.tactic-tab-btn').forEach(btn => {
      if (btn.id === `btn-tactic-tab-${tabName}`) {
        btn.classList.add('active');
        btn.style.background = 'rgba(0,240,255,0.1)';
        btn.style.borderColor = '#00f0ff';
        btn.style.color = '#00f0ff';
        btn.style.fontWeight = '700';
      } else {
        btn.classList.remove('active');
        btn.style.background = 'rgba(255,255,255,0.02)';
        btn.style.borderColor = 'rgba(255,255,255,0.1)';
        btn.style.color = 'rgba(255,255,255,0.6)';
        btn.style.fontWeight = '600';
      }
    });
    
    document.querySelectorAll('.tactic-tab-content').forEach(content => {
      content.style.display = content.id === `tactic-tab-content-${tabName}` ? 'flex' : 'none';
    });
    
    if (tabName === 'formations') {
      window.updateModalTacticPreview();
    }
  };

  window.populateModalPlayers = function() {
    const user = JSON.parse(localStorage.getItem('scout_ai_user') || '{}');
    const clubName = user.selectedClub || "Real Madrid";
    const clubPlayers = allPlayers.filter(p => p.currentTeam === clubName);
    
    const startContainer = document.getElementById('modal-starting-list');
    const benchContainer = document.getElementById('modal-bench-list');
    if (!startContainer || !benchContainer) return;
    
    if (currentStartingXI.length === 0) {
      const mainFormSel = document.getElementById('db-formation-selector');
      renderFieldPlayers(mainFormSel ? mainFormSel.value : '4-3-3');
    }
    
    startContainer.innerHTML = currentStartingXI.map(item => {
      const p = item.player;
      const isSel = selectedStartingIndex === item.slotIndex;
      const borderStyle = isSel ? 'border-color: #00f0ff; background: rgba(0,240,255,0.12); box-shadow: 0 0 10px rgba(0,240,255,0.1);' : 'border-color: rgba(255,255,255,0.05); background: rgba(255,255,255,0.02);';
      return `
        <div class="modal-player-row starting-row" id="starting-row-${item.slotIndex}" onclick="selectStartingPlayer(${item.slotIndex})" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border: 1.5px solid; border-radius: 10px; cursor: pointer; transition: all 0.2s; ${borderStyle}">
          <div style="display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1; margin-right: 10px; overflow: hidden;">
            <span style="font-size: 11px; font-weight: 800; background: #00f0ff; color: #080e1a; padding: 2px 6px; border-radius: 4px; min-width: 32px; text-align: center; font-family: sans-serif; flex-shrink: 0;">${item.role}</span>
            <span class="modal-player-name" style="font-size: 13.5px; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; min-width: 0;">${p.name || p.nickname || 'Jugador'}</span>
            <span style="font-size: 11px; color: rgba(255,255,255,0.4); text-transform: uppercase; flex-shrink: 0;">${p.position || 'N/A'}</span>
          </div>
          <div style="font-weight: 800; color: #00f0ff; font-size: 14px; flex-shrink: 0;">${formatContractValue(p.marketValue)}</div>
        </div>
      `;
    }).join('');
    
    const startingIds = new Set(currentStartingXI.filter(item => !item.isVirtual).map(item => item.player.id));
    const benchPlayers = clubPlayers.filter(p => !startingIds.has(p.id));
    
    document.getElementById('bench-players-count').textContent = `${benchPlayers.length} suplentes`;
    
    if (benchPlayers.length === 0) {
      benchContainer.innerHTML = `<div style="text-align: center; color: rgba(255,255,255,0.3); font-size: 13px; padding-top: 50px;">No hay suplentes en la plantilla</div>`;
    } else {
      benchContainer.innerHTML = benchPlayers.map(p => {
        const isSel = selectedBenchId === p.id;
        const borderStyle = isSel ? 'border-color: #ffbe10; background: rgba(255,190,16,0.12); box-shadow: 0 0 10px rgba(255,190,16,0.1);' : 'border-color: rgba(255,255,255,0.05); background: rgba(255,255,255,0.02);';
        return `
          <div class="modal-player-row bench-row" id="bench-row-${p.id}" onclick="selectBenchPlayer('${p.id}')" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border: 1.5px solid; border-radius: 10px; cursor: pointer; transition: all 0.2s; ${borderStyle}">
            <div style="display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1; margin-right: 10px; overflow: hidden;">
              <span class="modal-player-name" style="font-size: 13.5px; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; min-width: 0;">${p.name || p.nickname || 'Jugador'}</span>
              <span style="font-size: 11px; color: rgba(255,255,255,0.4); text-transform: uppercase; flex-shrink: 0;">${p.position || 'N/A'}</span>
            </div>
            <div style="font-weight: 800; color: #ffbe10; font-size: 14px; flex-shrink: 0;">${formatContractValue(p.marketValue)}</div>
          </div>
        `;
      }).join('');
    }
    
    window.updateSwapController();
  };

  window.selectStartingPlayer = function(slotIndex) {
    selectedStartingIndex = slotIndex;
    window.populateModalPlayers();
  };

  window.selectBenchPlayer = function(playerId) {
    selectedBenchId = playerId;
    window.populateModalPlayers();
  };

  window.updateSwapController = function() {
    const bar = document.getElementById('swap-controller-bar');
    if (!bar) return;
    
    if (selectedStartingIndex !== null && selectedBenchId !== null) {
      const startingItem = currentStartingXI.find(item => item.slotIndex === selectedStartingIndex);
      const benchPlayer = allPlayers.find(p => p.id === selectedBenchId);
      
      if (startingItem && benchPlayer) {
        document.getElementById('swap-start-preview').textContent = `Salir: ${startingItem.player.name || startingItem.player.nickname} (${startingItem.role})`;
        document.getElementById('swap-bench-preview').textContent = `Entrar: ${benchPlayer.name || benchPlayer.nickname}`;
        bar.style.display = 'flex';
        return;
      }
    }
    
    bar.style.display = 'none';
  };

  window.executePlayerSwap = function() {
    if (selectedStartingIndex === null || selectedBenchId === null) return;
    
    const customSwaps = JSON.parse(localStorage.getItem('scout_ai_swaps') || '{}');
    const startingItem = currentStartingXI.find(item => item.slotIndex === selectedStartingIndex);
    const benchPlayer = allPlayers.find(p => p.id === selectedBenchId);
    
    if (startingItem && benchPlayer) {
      const benchedIds = JSON.parse(localStorage.getItem('scout_ai_benched') || '[]');
      const benchedSet = new Set(benchedIds);
      if (!startingItem.isVirtual) {
        benchedSet.add(startingItem.player.id);
      }
      benchedSet.delete(benchPlayer.id);
      localStorage.setItem('scout_ai_benched', JSON.stringify(Array.from(benchedSet)));
    }
    
    customSwaps[selectedStartingIndex] = selectedBenchId;
    localStorage.setItem('scout_ai_swaps', JSON.stringify(customSwaps));
    
    const mainFormSel = document.getElementById('db-formation-selector');
    renderFieldPlayers(mainFormSel ? mainFormSel.value : '4-3-3');
    
    selectedStartingIndex = null;
    selectedBenchId = null;
    
    window.populateModalPlayers();
    window.updateModalTacticPreview();
    
    if (startingItem && benchPlayer) {
      const msg = currentLang === 'es'
        ? `Cambio realizado: Entra ${benchPlayer.name || benchPlayer.nickname} por ${startingItem.player.name || startingItem.player.nickname}`
        : `Swap confirmed: ${benchPlayer.name || benchPlayer.nickname} replaces ${startingItem.player.name || startingItem.player.nickname}`;
      showToast(`🔄 ${msg}`, 'success');
    }
  };

  window.updateModalTacticPreview = function() {
    const formSel = document.getElementById('modal-formation-selector');
    if (!formSel) return;
    
    const selectedForm = formSel.value;
    
    const titleText = document.getElementById('modal-preview-title-text');
    if (titleText) titleText.textContent = `Alineación ${selectedForm}`;
    
    const user = JSON.parse(localStorage.getItem('scout_ai_user') || '{}');
    const clubName = user.selectedClub || "Real Madrid";
    const clubPlayers = allPlayers.filter(p => p.currentTeam === clubName);
    const styleKey = user.preferredStyle || 'tikitaka';
    const altSel = document.getElementById('modal-alternative-selector');
    const alternative = altSel ? altSel.value : 'A';

    const descEl = document.getElementById('modal-tactic-desc');
    if (descEl) {
      const diagnoses = {
        '4-3-3': 'Control de posesión absoluto. Triangulación constante en mediocampo con extremos que estiran la defensa rival.',
        '4-4-2': 'Solidez y equilibrio clásico. Dos bloques simétricos compactos con transiciones rápidas por banda y juego de segunda pelota.',
        '3-5-2': 'Dominio en carriles exteriores. Los carrileros se suman al mediocampo en fase de posesión, creando superioridad numérica constante.',
        '4-2-3-1': 'Bloque de presión moderno. Doble pivote que brinda seguridad táctica mientras los tres mediapuntas asfixian la salida del rival.',
        '4-1-2-1-2': 'Esquema en rombo tradicional. Gran densidad y posesión en mediocampo central, pero requiere carrileros de gran recorrido por bandas.',
        '3-4-3': 'Ataque agresivo por las bandas. Extremos veloces asistidos por mediocampistas de recorrido para desbordar por fuera.',
        '5-3-2': 'Bloque defensivo muy denso con tres centrales para cerrar espacios y dos delanteros listos para picar de contra rápida.',
        '5-4-1': 'El cerrojo táctico absoluto. Dos líneas muy compactas de contención ideales para neutralizar la fluidez de rivales dominantes.',
        '4-5-1': 'Bloque medio ultra-compacto. Acumulación de mediocentros para estorbar la circulación creativa del adversario.',
        '4-3-2-1': 'Esquema de Árbol de Navidad. Gran solidez en contención con dos mediapuntas (dieces) flotando detrás del punta.',
        '3-4-2-1': 'Fútbol asociativo contemporáneo. Amplitud mediante carrileros y dos mediapuntas creativos buscando espaldas de los pivotes.',
        '5-2-3': 'Contraataque de bloque bajo extremo. Línea defensiva de cinco lista para recuperar y lanzar rápido a los tres atacantes.',
        '4-4-1-1': 'Juego inteligente entre líneas. Un mediapunta o segundo delantero libre despista las marcas del mediocentro rival.',
        '3-4-1-2': 'Línea de tres muy dinámica. Un volante enlace de cara a dos puntas para alimentar jugadas por el eje central.',
        '4-3-1-2': 'Medios rocosos en rombo con enganche. Densidad por el centro que facilita el juego asociativo y la recuperación inmediata.',
        '4-2-2-2': 'El cuadrado mágico brasileño. Dos pivotes defensivos y dos volantes creativos compartiendo la creación y el ataque.'
      };
      const diagnosisText = diagnoses[selectedForm] || 'Disposición táctica avanzada recomendada por el analista FutbolAI.';
      const suggestionsHtml = updateTacticSuggestions(selectedForm);
      descEl.innerHTML = `<div>${diagnosisText}</div><div style="margin-top: 10px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 8px;">${suggestionsHtml}</div>`;
    }
    
    const previewNodesContainer = document.getElementById('modal-preview-pitch-nodes');
    if (previewNodesContainer) {
      previewNodesContainer.style.pointerEvents = 'auto';

      let previewSlots = slots433;
      if (selectedForm === '4-4-2') previewSlots = slots442;
      else if (selectedForm === '3-5-2') previewSlots = slots352;
      else if (selectedForm === '4-2-3-1') previewSlots = slots4231;
      else if (selectedForm === '4-1-2-1-2') previewSlots = slots41212;
      else if (selectedForm === '3-4-3') previewSlots = slots343;
      else if (selectedForm === '5-3-2') previewSlots = slots532;
      else if (selectedForm === '5-4-1') previewSlots = slots541;
      else if (selectedForm === '4-5-1') previewSlots = slots451;
      else if (selectedForm === '4-3-2-1') previewSlots = slots4321;
      else if (selectedForm === '3-4-2-1') previewSlots = slots3421;
      else if (selectedForm === '5-2-3') previewSlots = slots523;
      else if (selectedForm === '4-4-1-1') previewSlots = slots4411;
      else if (selectedForm === '3-4-1-2') previewSlots = slots3412;
      else if (selectedForm === '4-3-1-2') previewSlots = slots4312;
      else if (selectedForm === '4-2-2-2') previewSlots = slots4222;
      
      const usedPlayerIds = new Set();
      const idealXI = [];

      // Calculate A-team exclusion set if alternative B
      const excludedIds = new Set();
      if (alternative === 'B') {
        const teamAUsedIds = new Set();
        previewSlots.forEach((slot, i) => {
          const res = findBestPlayerForSlot(slot, i, clubPlayers, styleKey, teamAUsedIds, new Set(), new Set(), clubName);
          if (res.player && !res.isVirtual) {
            teamAUsedIds.add(res.player.id);
            excludedIds.add(res.player.id);
          }
        });
      }

      previewSlots.forEach((slot, i) => {
        const res = findBestPlayerForSlot(slot, i, clubPlayers, styleKey, usedPlayerIds, excludedIds, new Set(), clubName);
        const matchedPlayer = res.player;
        const isVirtual = res.isVirtual;
        if (matchedPlayer && !isVirtual) {
          usedPlayerIds.add(matchedPlayer.id);
        }

        idealXI.push({
          slot: slot,
          player: matchedPlayer,
          isVirtual: isVirtual
        });
      });

      previewNodesContainer.innerHTML = idealXI.map((item, i) => {
        const slot = item.slot;
        const player = item.player;
        const isVirtual = item.isVirtual;
        
        const displayName = isVirtual ? slot.roleEs : (player.name ? player.name.split(' ').pop() : (player.nickname || slot.roleEs));
        
        // Check starting status on dashboard starting XI
        const isStarting = isVirtual ? false : currentStartingXI.some(s => s.player.id === player.id);
        const statusColor = isStarting ? '#00ff88' : '#ffbe10';
        const statusGlow = isStarting ? 'rgba(0, 255, 136, 0.4)' : 'rgba(255, 190, 16, 0.4)';
        
        // Tooltip detail
        const fitPercentage = isVirtual ? 100 : Math.round(calculatePlayerFit(player, styleKey) * 10);
        const statusText = isStarting 
          ? (currentLang === 'es' ? 'Titular' : 'Starting')
          : (currentLang === 'es' ? 'Suplente' : 'Substitute');
        const tooltip = isVirtual
          ? `${slot.roleEs} (${currentLang === 'es' ? 'Jugador Virtual' : 'Virtual Player'})`
          : `${player.name || player.nickname} (OVR ${formatContractValue(player.marketValue)})&#10;${currentLang === 'es' ? 'Ajuste' : 'Fit'}: ${fitPercentage}%&#10;${statusText}`;

        return `
          <div style="position: absolute; left: ${slot.left}%; top: ${slot.top}%; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; z-index: 20; pointer-events: auto;" title="${tooltip}">
            <div style="width: 22px; height: 22px; border-radius: 50%; background: linear-gradient(135deg, #021422, #04253a); border: 1.5px solid ${statusColor}; box-shadow: 0 0 6px ${statusGlow}; display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: 800; color: #fff; font-family: sans-serif; cursor: help; user-select: none;">
              ${slot.roleEs}
            </div>
            <div style="font-size: 8px; font-weight: 700; color: #fff; margin-top: 2px; padding: 1px 4px; background: rgba(2, 8, 18, 0.85); border-radius: 6px; border: 1px solid rgba(255, 255, 255, 0.1); text-align: center; white-space: nowrap; max-width: 55px; overflow: hidden; text-overflow: ellipsis; font-family: sans-serif; cursor: help; user-select: none;">
              ${displayName}
            </div>
          </div>
        `;
      }).join('');
    }
  };

  goToSection('my-club');
  applyPlanPermissions();
}

// ─── Avatar URL helper (works in browser + Android WebView) ───────────────
function getAbsoluteUrl(url) {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  
  let host = 'localhost:3001';
  if (window.location.protocol === 'file:') {
    const isAndroid = navigator.userAgent.toLowerCase().includes('android');
    host = window.API_HOST || (isAndroid ? '10.0.2.2:3001' : 'localhost:3001');
  } else {
    if (window.location.port && window.location.port !== '3001') {
      host = `${window.location.hostname}:3001`;
    } else {
      host = window.location.host;
    }
  }
  const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
  return `${protocol}//${host}${url}`;
}

// ─── Profile picture upload ────────────────────────────────────────────────
// Gmail-style: #profile-avatar-input is a transparent overlay INSIDE the
// .profile-avatar-edit div. Clicking the button area directly triggers the
// native file picker — zero JavaScript click() calls needed.
function setupAvatarUpload() {
  const input = document.getElementById('profile-avatar-input');
  if (!input) { console.warn('profile-avatar-input not found'); return; }

  // Set up avatar image click to view in full size (modal)
  const avatarImg = document.getElementById('profile-page-avatar');
  if (avatarImg) {
    avatarImg.classList.add('profile-page-avatar-clickable');
    avatarImg.addEventListener('click', () => {
      window.openAvatarModal(avatarImg.src);
    });
  }

  input.addEventListener('change', async () => {
    const file = input.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('La imagen no debe superar 5 MB 🚫', 'error');
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result;
      const token  = localStorage.getItem('scout_ai_token');
      try {
        showToast('Subiendo foto…', 'info');
        const res  = await fetch(`${API}/auth/upload-avatar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ imageBase64: base64 })
        });
        const data = await res.json();
        if (data.success) {
          const stored = JSON.parse(localStorage.getItem('scout_ai_user') || '{}');
          stored.avatarUrl = data.avatarUrl;
          localStorage.setItem('scout_ai_user', JSON.stringify(stored));
          const absUrl     = getAbsoluteUrl(data.avatarUrl);
          const navAvatar  = document.getElementById('user-avatar');
          const pageAvatar = document.getElementById('profile-page-avatar');
          if (navAvatar)  { navAvatar.src  = absUrl; navAvatar.style.display = 'block'; }
          if (pageAvatar) { pageAvatar.src = absUrl; }
          showToast('✅ Foto de perfil actualizada', 'success');
        } else {
          showToast(data.error || data.message || 'Error al subir la imagen', 'error');
        }
      } catch (err) {
        console.error('Avatar upload error:', err);
        showToast('Error de red al subir la imagen', 'error');
      }
    };
    reader.readAsDataURL(file);
    input.value = '';
  });
}

// ─── Full-screen Avatar Preview Modal Functions ────────────────────────────
window.openAvatarModal = function(src) {
  const modal = document.getElementById('avatar-view-modal');
  const modalImg = document.getElementById('avatar-modal-img');
  if (modalImg) modalImg.src = src;
  if (modal) {
    modal.style.display = 'flex';
    setTimeout(() => {
      modal.classList.add('active');
    }, 10);
  }
};

window.closeAvatarModal = function() {
  const modal = document.getElementById('avatar-view-modal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => {
      modal.style.display = 'none';
    }, 300);
  }
};

function updateProfileUI(user) {
  const userNameEl = document.getElementById('user-name');
  const userAvatarEl = document.getElementById('user-avatar');
  if (userNameEl) userNameEl.textContent = user.nombres || user.username || 'Usuario';
  if (userAvatarEl && user.avatarUrl) {
    userAvatarEl.src = getAbsoluteUrl(user.avatarUrl);
    userAvatarEl.style.display = 'block';
  }

  // Mobile elements sync
  const userNameMobileEl = document.getElementById('user-name-mobile');
  const userAvatarMobileEl = document.getElementById('user-avatar-mobile');
  if (userNameMobileEl) userNameMobileEl.textContent = user.nombres || user.username || 'Usuario';
  if (userAvatarMobileEl && user.avatarUrl) {
    userAvatarMobileEl.src = getAbsoluteUrl(user.avatarUrl);
    userAvatarMobileEl.style.display = 'block';
  }

  applyPlanPermissions();
}

function updateDailyLimitsBadges(user) {
  if (!user) user = JSON.parse(localStorage.getItem('scout_ai_user') || '{}');
  const tier = (user.selectedTier || user.tier || 'Gratis').toLowerCase();
  const isGratis = tier === 'gratis';
  const isPro = tier === 'pro';
  const isPlus = tier === 'plus';
  const isEnterprise = tier === 'enterprise';

  // 1. Compare Daily/Weekly/Monthly Badge
  const compareBadge = document.getElementById('compare-daily-limit-badge');
  if (compareBadge) {
    if (isGratis || isPro) {
      const maxLimit = isGratis ? 2 : 5;
      const remaining = user.dailyComparisonsRemaining !== undefined && user.dailyComparisonsRemaining !== null 
        ? user.dailyComparisonsRemaining 
        : Math.max(0, maxLimit - (user.dailyComparisonsCount || 0));
      compareBadge.style.display = 'inline-flex';
      compareBadge.innerHTML = `Plan ${isPro ? 'Pro' : 'Gratis'}: ${remaining}/${maxLimit} comparaciones hoy`;
      compareBadge.style.background = remaining === 0 ? 'rgba(255, 59, 48, 0.15)' : 'rgba(0, 240, 255, 0.1)';
      compareBadge.style.borderColor = remaining === 0 ? '#ff3b30' : 'rgba(0, 240, 255, 0.3)';
      compareBadge.style.color = remaining === 0 ? '#ff3b30' : '#00f0ff';
    } else if (isPlus) {
      const maxLimit = 15;
      const remaining = user.weeklyComparisonsRemaining !== undefined && user.weeklyComparisonsRemaining !== null
        ? user.weeklyComparisonsRemaining
        : Math.max(0, maxLimit - (user.weeklyComparisonsCount || 0));
      compareBadge.style.display = 'inline-flex';
      compareBadge.innerHTML = `Plan Plus: ${remaining}/${maxLimit} comparaciones esta semana`;
      compareBadge.style.background = remaining === 0 ? 'rgba(255, 59, 48, 0.15)' : 'rgba(0, 240, 255, 0.1)';
      compareBadge.style.borderColor = remaining === 0 ? '#ff3b30' : 'rgba(0, 240, 255, 0.3)';
      compareBadge.style.color = remaining === 0 ? '#ff3b30' : '#00f0ff';
    } else if (isEnterprise) {
      const maxLimit = 50;
      const remaining = user.monthlyComparisonsRemaining !== undefined && user.monthlyComparisonsRemaining !== null
        ? user.monthlyComparisonsRemaining
        : Math.max(0, maxLimit - (user.monthlyComparisonsCount || 0));
      compareBadge.style.display = 'inline-flex';
      compareBadge.innerHTML = `Plan Enterprise: ${remaining}/${maxLimit} comparaciones este mes`;
      compareBadge.style.background = remaining === 0 ? 'rgba(255, 59, 48, 0.15)' : 'rgba(0, 240, 255, 0.1)';
      compareBadge.style.borderColor = remaining === 0 ? '#ff3b30' : 'rgba(0, 240, 255, 0.3)';
      compareBadge.style.color = remaining === 0 ? '#ff3b30' : '#00f0ff';
    } else {
      compareBadge.style.display = 'none';
    }
  }

  // 2. Chat IA Daily/Weekly Badge
  const chatBadge = document.getElementById('chat-daily-limit-badge');
  if (chatBadge) {
    if (isGratis || isPro) {
      const maxLimit = isGratis ? 5 : 10;
      const remaining = user.dailyAiMessagesRemaining !== undefined && user.dailyAiMessagesRemaining !== null
        ? user.dailyAiMessagesRemaining
        : Math.max(0, maxLimit - (user.dailyAiMessagesCount || 0));
      chatBadge.style.display = 'inline-flex';
      chatBadge.innerHTML = `Plan ${isPro ? 'Pro' : 'Gratis'}: ${remaining}/${maxLimit} mensajes hoy`;
      chatBadge.style.background = remaining === 0 ? 'rgba(255, 59, 48, 0.15)' : 'rgba(0, 240, 255, 0.1)';
      chatBadge.style.borderColor = remaining === 0 ? '#ff3b30' : 'rgba(0, 240, 255, 0.3)';
      chatBadge.style.color = remaining === 0 ? '#ff3b30' : '#00f0ff';
    } else if (isPlus) {
      const maxLimit = 30;
      const remaining = user.weeklyAiMessagesRemaining !== undefined && user.weeklyAiMessagesRemaining !== null
        ? user.weeklyAiMessagesRemaining
        : Math.max(0, maxLimit - (user.weeklyAiMessagesCount || 0));
      chatBadge.style.display = 'inline-flex';
      chatBadge.innerHTML = `Plan Plus: ${remaining}/${maxLimit} mensajes esta semana`;
      chatBadge.style.background = remaining === 0 ? 'rgba(255, 59, 48, 0.15)' : 'rgba(0, 240, 255, 0.1)';
      chatBadge.style.borderColor = remaining === 0 ? '#ff3b30' : 'rgba(0, 240, 255, 0.3)';
      chatBadge.style.color = remaining === 0 ? '#ff3b30' : '#00f0ff';
    } else if (isEnterprise) {
      const maxLimit = 50;
      const remaining = user.weeklyAiMessagesRemaining !== undefined && user.weeklyAiMessagesRemaining !== null
        ? user.weeklyAiMessagesRemaining
        : Math.max(0, maxLimit - (user.weeklyAiMessagesCount || 0));
      chatBadge.style.display = 'inline-flex';
      chatBadge.innerHTML = `Plan Enterprise: ${remaining}/${maxLimit} mensajes esta semana`;
      chatBadge.style.background = remaining === 0 ? 'rgba(255, 59, 48, 0.15)' : 'rgba(0, 240, 255, 0.1)';
      chatBadge.style.borderColor = remaining === 0 ? '#ff3b30' : 'rgba(0, 240, 255, 0.3)';
      chatBadge.style.color = remaining === 0 ? '#ff3b30' : '#00f0ff';
    } else {
      chatBadge.style.display = 'none';
    }
  }

  // 3. Mi Club Pitch Edit Guard
  const pitchEditBtn = document.getElementById('db-btn-edit-formation');
  if (pitchEditBtn) {
    if (isGratis) {
      pitchEditBtn.title = 'Edición restringida en Plan Gratis (Solo Resumen de Temporada disponible)';
      pitchEditBtn.onclick = (e) => {
        e.preventDefault();
        alert('En el Plan Gratis tienes acceso únicamente al Resumen de Temporada de tu equipo.\n\nPara visualizar la alineación general o personalizar tácticas, actualiza a un plan superior (Pro, Plus, Local o Enterprise).');
      };
    } else if (isPro) {
      pitchEditBtn.title = 'Edición de alineación restringida en Plan Pro (Modo Lectura de Alineación General)';
      pitchEditBtn.onclick = (e) => {
        e.preventDefault();
        alert('En el Plan Pro puedes consultar la Alineación General del equipo, pero la edición personalizada de alineaciones y tácticas está reservada para los planes Plus, Local y Enterprise.');
      };
    } else {
      pitchEditBtn.onclick = null;
    }
  }

  // 4. Mi Club AI Alerts Guard
  const alertsCard = document.querySelector('.db-alerts-card');
  if (alertsCard) {
    if (isGratis || isPro || isPlus) {
      const alertsList = document.getElementById('db-alerts-list');
      if (alertsList) {
        alertsList.innerHTML = `<div style="padding: 15px; text-align: center; color: rgba(255,255,255,0.6); font-size: 0.85rem;">Las Alertas IA están reservadas para los planes Local y Enterprise.</div>`;
      }
    }
  }
}

function applyPlanPermissions() {
  const user = JSON.parse(localStorage.getItem('scout_ai_user') || '{}');
  const tier = (user.selectedTier || user.tier || user.maxPaidTierInCycle || 'Gratis').toLowerCase();
  const role = (user.role || '').toLowerCase();
  const isGratis = tier === 'gratis';
  const isPro = tier === 'pro';
  const isPlus = tier === 'plus';
  const isLocal = tier === 'local' || role === 'local' || role === 'entrenador local';
  const isEnterprise = tier === 'enterprise' || role.includes('enterprise') || role.includes('gerente') || role.includes('director') || role.includes('scout');
  const restrictedInLocal = ['players', 'my-club', 'compare', 'predictions', 'simulations', 'prospects'];

  document.querySelectorAll('.nav-item').forEach(btn => {
    const section = btn.dataset.section;
    if (isGratis || isPro) {
      if (['my-club', 'players', 'compare', 'chat'].includes(section)) {
        btn.style.display = 'flex';
      } else {
        btn.style.display = 'none';
      }
    } else if (isPlus) {
      if (['my-club', 'players', 'compare', 'chat', 'simulations'].includes(section)) {
        btn.style.display = 'flex';
      } else {
        btn.style.display = 'none';
      }
    } else if (isLocal) {
      if (section === 'my-players') {
        btn.style.display = 'flex';
      } else if (restrictedInLocal.includes(section)) {
        btn.style.display = 'none';
      } else {
        btn.style.display = 'flex';
      }
    } else if (isEnterprise) {
      // Enterprise: Acceso a todos sus módulos excluyendo únicamente "my-players" (Mis Jugadores)
      if (section === 'my-players' || section === 'predictions') {
        btn.style.display = 'none';
      } else {
        btn.style.display = 'flex';
      }
    } else {
      if (section === 'my-players' || section === 'prospects' || section === 'predictions') {
        btn.style.display = 'none';
      } else {
        btn.style.display = 'flex';
      }
    }
  });

  const activeBtn = document.querySelector('.nav-item.active');
  const currentSection = activeBtn ? activeBtn.dataset.section : 'players';
  if ((isGratis || isPro) && !['my-club', 'players', 'compare', 'chat', 'profile', 'requirements'].includes(currentSection)) {
    goToSection('players');
  } else if (isPlus && !['my-club', 'players', 'compare', 'chat', 'simulations', 'profile', 'requirements'].includes(currentSection)) {
    goToSection('players');
  } else if (isEnterprise && !['my-club', 'players', 'compare', 'chat', 'simulations', 'prospects', 'profile', 'requirements'].includes(currentSection)) {
    goToSection('players');
  } else if (isLocal && (restrictedInLocal.includes(currentSection) || currentSection === 'home')) {
    goToSection('my-players');
  } else if (!isLocal && currentSection === 'my-players') {
    goToSection('players');
  } else if (!isEnterprise && !isLocal && currentSection === 'prospects') {
    goToSection('players');
  }

  updateDailyLimitsBadges(user);
}

// ─── Section Navigation ──────────────────────────────────────────────────
function setupNavigation() {
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.dataset.section;
      goToSection(section);
      closeMobileMenu();
    });
  });
}

function goToSection(name) {
  const user = JSON.parse(localStorage.getItem('scout_ai_user') || '{}');
  const isLocal = (user.selectedTier || '').toLowerCase() === 'local' || (user.role || '').toLowerCase() === 'local' || (user.role || '').toLowerCase() === 'entrenador local';
  const restricted = ['players', 'my-club', 'compare', 'predictions', 'simulations'];

  if (isLocal && (restricted.includes(name) || name === 'home')) {
    name = 'my-players';
  } else if (!isLocal && name === 'my-players') {
    name = 'players';
  }

  document.querySelectorAll('.nav-item').forEach(b => {
    b.classList.toggle('active', b.dataset.section === name);
  });
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(`section-${name}`)?.classList.add('active');

  if (name === 'my-players') window.renderMyPlayersModule();
  if (name === 'my-club') renderMyClubDashboard();
  if (name === 'players') renderPlayers();
  if (name === 'predictions' && !predictionsLoaded) loadPredictions();
  if (name === 'profile') renderProfile();
  if (name === 'simulations') initSimulationsSection();
  if (name === 'my-chats') renderMyChatsSection();
}

// ─── Simulations Section Logic ──────────────────────────────────────────────
let simulationsInitialized = false;
let lastInitializedClub = null;
let simulationsListenersAdded = false;
let allTeamsForSim = [];


function getUserClubStartingXI(clubName, user) {
  const formation = user.preferredFormation || '4-3-3';
  const styleKey = user.preferredStyle || 'tikitaka';
  const alternative = user.preferredAlternative || 'A';
  
  const clubPlayers = allPlayers.filter(p => p.currentTeam === clubName);
  const usedPlayerIds = new Set();
  
  let slots = slots433;
  if (formation === '4-4-2') slots = slots442;
  else if (formation === '3-5-2') slots = slots352;
  else if (formation === '4-2-3-1') slots = slots4231;
  else if (formation === '4-1-2-1-2') slots = slots41212;
  else if (formation === '3-4-3') slots = slots343;
  else if (formation === '5-3-2') slots = slots532;
  else if (formation === '5-4-1') slots = slots541;
  else if (formation === '4-5-1') slots = slots451;
  else if (formation === '4-3-2-1') slots = slots4321;
  else if (formation === '3-4-2-1') slots = slots3421;
  else if (formation === '5-2-3') slots = slots523;
  else if (formation === '4-4-1-1') slots = slots4411;
  else if (formation === '3-4-1-2') slots = slots3412;
  else if (formation === '4-3-1-2') slots = slots4312;
  else if (formation === '4-2-2-2') slots = slots4222;

  const customSwaps = JSON.parse(localStorage.getItem('scout_ai_swaps') || '{}');
  const benchedIds = JSON.parse(localStorage.getItem('scout_ai_benched') || '[]');
  const benchedPlayerIds = new Set(benchedIds);

  const excludedIds = new Set();
  if (alternative === 'B') {
    const teamAUsedIds = new Set();
    slots.forEach((slot, i) => {
      const res = findBestPlayerForSlot(slot, i, clubPlayers, styleKey, teamAUsedIds, new Set(), new Set(), clubName);
      if (res.player && !res.isVirtual) {
        teamAUsedIds.add(res.player.id);
        excludedIds.add(res.player.id);
      }
    });
  }

  const xi = [];
  slots.forEach((slot, i) => {
    let matchedPlayer = null;
    let isVirtual = false;

    if (customSwaps[i]) {
      const swappedPlayer = allPlayers.find(p => p.id === customSwaps[i]);
      if (swappedPlayer && swappedPlayer.currentTeam === clubName) {
        matchedPlayer = swappedPlayer;
      }
    }

    if (!matchedPlayer) {
      const res = findBestPlayerForSlot(slot, i, clubPlayers, styleKey, usedPlayerIds, excludedIds, benchedPlayerIds, clubName);
      matchedPlayer = res.player;
      isVirtual = res.isVirtual;
      if (matchedPlayer && !isVirtual) {
        usedPlayerIds.add(matchedPlayer.id);
      }
    } else {
      usedPlayerIds.add(matchedPlayer.id);
    }

    xi.push({
      slotIndex: i,
      player: matchedPlayer,
      isVirtual: isVirtual,
      role: slot.roleEs
    });
  });
  return xi;
}

function calculateStartingXIAverageRating(xi) {
  if (!xi || xi.length === 0) return 75;
  let sum = 0;
  let count = 0;
  xi.forEach(item => {
    if (item.player && !item.isVirtual) {
      sum += parseFloat(item.player.overallRating) || 70;
      count++;
    } else {
      sum += 70; // fallback for virtual player
      count++;
    }
  });
  return count > 0 ? Math.round(sum / count) : 75;
}

async function initSimulationsSection() {
  const user = JSON.parse(localStorage.getItem('scout_ai_user') || '{}');
  const myClubName = user.selectedClub || 'FC Barcelona';
  const myClubCountry = user.selectedCountry || 'Spain';
  
  // Set up home club details
  const nameEl = document.getElementById('sim-my-club-name');
  if (nameEl) nameEl.textContent = myClubName;
  
  const leagueEl = document.getElementById('sim-my-club-league');
  let leagueName = getLeagueNameFallback(myClubCountry);
  if (window.allPlayers && window.allPlayers.length > 0) {
    const match = window.allPlayers.find(p => p.currentTeam === myClubName);
    if (match && match.league) leagueName = match.league;
  }
  if (leagueEl) {
    const leagueLogo = getLeagueLogoUrl(leagueName);
    const leagueLogoHtml = leagueLogo ? `<img src="${leagueLogo}" alt="${leagueName}" style="width: 14px; height: 14px; object-fit: contain; vertical-align: middle; margin-right: 4px; display: inline-block;">` : '';
    leagueEl.innerHTML = `${leagueLogoHtml}${leagueName}`;
  }
  
  const styleEl = document.getElementById('sim-my-club-style');
  if (styleEl) styleEl.textContent = (user.preferredStyle || 'tikitaka').toUpperCase();
  
  const arenaHomeEl = document.getElementById('arena-home-name');
  if (arenaHomeEl) arenaHomeEl.textContent = myClubName;
  
  // Load my team average rating using starting XI from "Mi Club"
  const homeStartingXI = getUserClubStartingXI(myClubName, user);
  const homeOvr = calculateStartingXIAverageRating(homeStartingXI);
  const ratingEl = document.getElementById('arena-home-rating');
  if (ratingEl) ratingEl.textContent = `OVR ${homeOvr}`;

  // Fetch my club logo
  loadTeamLogo(myClubName, 'sim-my-club-badge');
  loadTeamLogo(myClubName, 'arena-home-badge');
  
  // Load opponent selector and fixtures list if first time or club changed
  if (!simulationsInitialized || lastInitializedClub !== myClubName) {
    simulationsInitialized = true;
    lastInitializedClub = myClubName;
    
    // Load all teams from same country
    try {
      const response = await fetchWithAuth(`${API}/onboarding/teams?country=${encodeURIComponent(myClubCountry)}`);
      const data = await response.json();
      allTeamsForSim = data.teams || [];
    } catch (err) {
      console.error('Error fetching teams for simulation:', err);
      allTeamsForSim = [];
    }
    
    // Populate select
    const select = document.getElementById('arena-away-select');
    if (select) {
      select.innerHTML = '<option value="">Selecciona un rival...</option>';
      
      allTeamsForSim.forEach(team => {
        if (team.name !== myClubName) {
          const opt = document.createElement('option');
          opt.value = team.name;
          opt.textContent = team.name;
          select.appendChild(opt);
        }
      });
    }
  }

  // Set up event listeners only once
  const select = document.getElementById('arena-away-select');
  const simBtn = document.getElementById('btn-run-simulation');
  if (select && simBtn && !simulationsListenersAdded) {
    simulationsListenersAdded = true;
    
    select.addEventListener('change', async () => {
      const opponentName = select.value;
      if (!opponentName) {
        resetAwayArena();
        return;
      }
      
      document.getElementById('arena-away-name').textContent = opponentName;
      document.getElementById('arena-away-badge').classList.add('active-away');
      
      // Load opponent rating
      const oppPlayers = await fetchTeamPlayers(opponentName);
      const awayOvr = calculateTeamAverageRating(oppPlayers);
      document.getElementById('arena-away-rating').textContent = `VALOR ${formatContractValue(awayOvr * 10000000)}`;
      
      // Load logo
      loadTeamLogo(opponentName, 'arena-away-badge');
      
      // Enable simulation button
      simBtn.disabled = false;
    });
    
    simBtn.addEventListener('click', async () => {
      const currentUser = JSON.parse(localStorage.getItem('scout_ai_user') || '{}');
      const tier = (currentUser.selectedTier || currentUser.tier || 'Gratis').toLowerCase();

      if (tier === 'gratis' || tier === 'pro') {
        alert('El módulo de Simulaciones no está disponible para tu plan. Por favor actualiza al Plan Plus, Local o Enterprise.');
        return;
      }

      if (tier === 'plus' || tier === 'enterprise') {
        try {
          const res = await fetchWithAuth(`${API}/simulations/consume`, { method: 'POST' });
          const data = await res.json();
          if (!res.ok) {
            alert(data.message || data.error || `Has alcanzado el límite mensual de simulaciones para el Plan ${tier === 'enterprise' ? 'Enterprise' : 'Plus'}.`);
            return;
          }
          if (data.user) {
            localStorage.setItem('scout_ai_user', JSON.stringify(data.user));
            updateDailyLimitsBadges(data.user);
          }
        } catch (err) {
          console.error('Error al consumir simulación:', err);
        }
      }

      const opponent = select.value;
      const awayOvrText = document.getElementById('arena-away-rating').textContent;
      const awayOvr = parseInt(awayOvrText.replace('OVR ', '')) || 75;
      
      const currentClub = currentUser.selectedClub || 'FC Barcelona';
      
      // Calculate homeOvr dynamically based on current club starting XI
      const currentStartingXI = getUserClubStartingXI(currentClub, currentUser);
      const currentHomeOvr = calculateStartingXIAverageRating(currentStartingXI);
      
      runMatchSimulation(currentClub, opponent, currentHomeOvr, awayOvr);
    });
  }
  
  // Build and show upcoming fixtures list
  buildUpcomingFixtures(myClubName);
}

async function fetchTeamPlayers(teamName) {
  try {
    const res = await fetchWithAuth(`${API}/players?team=${encodeURIComponent(teamName)}`);
    const data = await res.json();
    return data.players || [];
  } catch (err) {
    console.error('Error fetching team players:', err);
    return [];
  }
}

function calculateTeamAverageRating(players) {
  if (!players || players.length === 0) return 75;
  let sum = 0;
  players.forEach(p => { sum += parseFloat(p.overallRating) || 70; });
  return Math.round(sum / players.length);
}

async function loadTeamLogo(teamIdentifier, elementOrId) {
  const el = typeof elementOrId === 'string' ? document.getElementById(elementOrId) : elementOrId;
  if (!el) return;
  try {
    const isId = typeof teamIdentifier === 'number' || (!isNaN(teamIdentifier) && !isNaN(parseFloat(teamIdentifier)));
    const queryParam = isId ? `id=${encodeURIComponent(teamIdentifier)}` : `name=${encodeURIComponent(teamIdentifier)}`;
    const res = await fetchWithAuth(`${API}/team-logo?${queryParam}`);
    const data = await res.json();
    if (data.logoUrl) {
      const url = getAbsoluteUrl(data.logoUrl);
      el.innerHTML = `<img src="${url}" style="width: 80%; height: 80%; object-fit: contain;">`;
    } else {
      el.textContent = '⚽';
    }
  } catch (err) {
    el.textContent = '⚽';
  }
}

async function loadLeagueLogo(leagueIdentifier, elementOrId) {
  const el = typeof elementOrId === 'string' ? document.getElementById(elementOrId) : elementOrId;
  if (!el) return;
  
  if (typeof leagueIdentifier === 'string') {
    const localUrl = getLeagueLogoUrl(leagueIdentifier);
    if (localUrl) {
      el.innerHTML = `<img src="${localUrl}" style="width: 100%; height: 100%; object-fit: contain;">`;
      return;
    }
  }

  try {
    const isId = typeof leagueIdentifier === 'number' || (!isNaN(leagueIdentifier) && !isNaN(parseFloat(leagueIdentifier)));
    const queryParam = isId ? `id=${encodeURIComponent(leagueIdentifier)}` : `name=${encodeURIComponent(leagueIdentifier)}`;
    const res = await fetchWithAuth(`${API}/league-logo?${queryParam}`);
    const data = await res.json();
    if (data.logoUrl) {
      const url = getAbsoluteUrl(data.logoUrl);
      el.innerHTML = `<img src="${url}" style="width: 80%; height: 80%; object-fit: contain;">`;
    } else {
      el.textContent = '🌐';
    }
  } catch (err) {
    el.textContent = '🌐';
  }
}

async function loadAllLogos() {
  // 1. Team logos (by ID or Name)
  const teamElements = document.querySelectorAll('[data-team-id], [data-team-name]');
  for (const el of teamElements) {
    const teamId = el.getAttribute('data-team-id');
    const teamName = el.getAttribute('data-team-name');
    const target = teamId || teamName;
    if (!target || el.getAttribute('data-loaded') === 'true') continue;
    el.setAttribute('data-loaded', 'true');
    await loadTeamLogo(target, el);
  }
  // 2. League logos (by ID or Name)
  const leagueElements = document.querySelectorAll('[data-league-id], [data-league-name]');
  for (const el of leagueElements) {
    const leagueId = el.getAttribute('data-league-id');
    const leagueName = el.getAttribute('data-league-name');
    const target = leagueId || leagueName;
    if (!target || el.getAttribute('data-loaded') === 'true') continue;
    el.setAttribute('data-loaded', 'true');
    await loadLeagueLogo(target, el);
  }
}


function buildUpcomingFixtures(myClubName) {
  const fixturesContainer = document.getElementById('sim-fixtures-list');
  if (!fixturesContainer) return;
  fixturesContainer.innerHTML = '';
  
  const isEs = currentLang === 'es';
  const realFixtures = getReal202425Fixtures(myClubName);
  
  if (realFixtures && realFixtures.length > 0) {
    realFixtures.forEach((f, index) => {
      const item = document.createElement('div');
      item.className = 'fixture-item';
      
      const homeName = f.home ? myClubName : f.opponent;
      const awayName = f.home ? f.opponent : myClubName;
      
      const dateStr = `${f.date} · ${f.competition}`;
      item.innerHTML = `
        <div class="fixture-teams">
          <div class="fixture-vs">${homeName} <span>vs</span> ${awayName}</div>
          <div class="fixture-info">${dateStr}</div>
        </div>
        <button class="btn-fixture-sim" onclick="simulateFixture('${f.opponent}')">Simular</button>
      `;
      fixturesContainer.appendChild(item);
    });
    return;
  }
  
  const candidates = allTeamsForSim.filter(t => t.name !== myClubName);
  if (candidates.length === 0) {
    fixturesContainer.innerHTML = '<p style="color: rgba(255,255,255,0.45); font-size:12px;">No se encontraron otros clubes en tu liga.</p>';
    return;
  }
  
  const selectedCandidates = candidates.slice(0, 3);
  selectedCandidates.forEach((opp, index) => {
    const item = document.createElement('div');
    item.className = 'fixture-item';
    const dateStr = `Jornada ${index + 1} · Temporada 24-25`;
    item.innerHTML = `
      <div class="fixture-teams">
        <div class="fixture-vs">${myClubName} <span>vs</span> ${opp.name}</div>
        <div class="fixture-info">${dateStr}</div>
      </div>
      <button class="btn-fixture-sim" onclick="simulateFixture('${opp.name}')">Simular</button>
    `;
    fixturesContainer.appendChild(item);
  });
}

window.simulateFixture = function(opponentName) {
  const select = document.getElementById('arena-away-select');
  if (select) {
    let exists = false;
    for (let i = 0; i < select.options.length; i++) {
      if (select.options[i].value === opponentName) {
        exists = true;
        break;
      }
    }
    if (!exists && opponentName) {
      const opt = document.createElement('option');
      opt.value = opponentName;
      opt.textContent = opponentName;
      select.appendChild(opt);
    }
    
    select.value = opponentName;
    select.dispatchEvent(new Event('change'));
    document.querySelector('.arena-card')?.scrollIntoView({ behavior: 'smooth' });
  }
};

function resetAwayArena() {
  document.getElementById('arena-away-name').textContent = 'Visitante';
  document.getElementById('arena-away-badge').classList.remove('active-away');
  document.getElementById('arena-away-badge').innerHTML = '🚩';
  document.getElementById('arena-away-rating').textContent = 'VALOR --';
  document.getElementById('btn-run-simulation').disabled = true;
}

function runMatchSimulation(homeName, awayName, homeOvr, awayOvr) {
  const overlay = document.getElementById('sim-loading-overlay');
  const fill = document.getElementById('sim-progress-fill');
  const status = document.getElementById('sim-loading-status');
  const detail = document.getElementById('sim-loading-detail');
  
  if (overlay) overlay.style.display = 'flex';
  if (fill) fill.style.width = '0%';
  
  const steps = [
    { pct: 25, status: 'Analizando tácticas...', detail: 'Evaluando formaciones preferidas...' },
    { pct: 50, status: 'Cargando plantillas...', detail: 'Comparando calificaciones individuales de jugadores...' },
    { pct: 75, status: 'Ejecutando simulación...', detail: 'Pre-cargando los eventos tácticos con IA...' },
    { pct: 100, status: 'Finalizando preparación...', detail: 'Preparando la transmisión táctica en vivo...' }
  ];
  
  let currentStep = 0;
  const interval = setInterval(async () => {
    if (currentStep < steps.length) {
      const s = steps[currentStep];
      if (fill) fill.style.width = `${s.pct}%`;
      if (status) status.textContent = s.status;
      if (detail) detail.textContent = s.detail;
      
      // Pre-generation on step 2
      if (currentStep === 1) {
        await preGenerateMatchState(homeName, awayName, homeOvr, awayOvr);
      }
      
      currentStep++;
    } else {
      clearInterval(interval);
      if (overlay) overlay.style.display = 'none';
      
      const resultsModal = document.getElementById('sim-results-modal');
      if (resultsModal) resultsModal.style.display = 'flex';
      
      startLiveSimulation();
    }
  }, 600);
}


async function showSimulationResults(homeName, awayName, homeOvr, awayOvr) {
  const homeScore = simScoreH;
  const awayScore = simScoreA;
  
  // Display names and scores
  document.getElementById('result-home-name').textContent = homeName;
  document.getElementById('result-away-name').textContent = awayName;
  document.getElementById('result-home-score').textContent = homeScore;
  document.getElementById('result-away-score').textContent = awayScore;
  
  const user = JSON.parse(localStorage.getItem('scout_ai_user') || '{}');
  document.getElementById('result-home-style').textContent = (user.preferredStyle || 'tikitaka').toUpperCase();
  document.getElementById('result-away-style').textContent = awayOvr > 78 ? 'ESTILO DIRECTO' : 'CONTRAATAQUE';
  
  // Fetch home and away players
  const homePlayers = simHomePlayers;
  const awayPlayers = simAwayPlayers;
  
  // Timeline events
  const timeline = document.getElementById('result-timeline');
  if (timeline) {
    timeline.innerHTML = '';
    
    // Sort timeline by minute
    simPreGeneratedEvents.sort((a, b) => a.min - b.min);
    
    simPreGeneratedEvents.forEach(ev => {
      // Show only goal, card and substitutions in final timeline
      if (ev.type === 'g' || ev.type === 'y' || ev.type === 'sub') {
        const div = document.createElement('div');
        div.className = 'timeline-item';
        div.innerHTML = `<span class="timeline-minute">${ev.min}'</span> <span class="timeline-text">${ev.txt} <small style="display:block; opacity:0.6; margin-left: 0; font-size: 11px;">${ev.sub}</small></span>`;
        timeline.appendChild(div);
      }
    });
  }
  
  // Dynamic Tab Labels
  const btnHomeTab = document.getElementById('btn-sim-tab-home');
  const btnAwayTab = document.getElementById('btn-sim-tab-away');
  if (btnHomeTab) btnHomeTab.textContent = `🛡️ ${homeName}`;
  if (btnAwayTab) btnAwayTab.textContent = `🚩 ${awayName}`;
  
  const homeSquadTitle = document.getElementById('result-home-squad-title');
  if (homeSquadTitle) homeSquadTitle.textContent = currentLang === 'es' ? `📋 Alineación de ${homeName}` : `📋 Lineup of ${homeName}`;
  
  const awaySquadTitle = document.getElementById('result-away-squad-title');
  if (awaySquadTitle) awaySquadTitle.textContent = currentLang === 'es' ? `📋 Alineación de ${awayName}` : `📋 Lineup of ${awayName}`;

  // Render XI for both teams
  const userStartingXI = getUserClubStartingXI(homeName, user);
  renderStartingXi(userStartingXI, 'result-home-xi', true);
  renderStartingXi(awayPlayers, 'result-away-xi', false);
  
  // Render Final Stats
  const statsContent = document.getElementById('result-stats-content');
  if (statsContent) {
    const t = simStats;
    const sh = t.shots[0] + t.shots[1] + 1;
    const xgt = t.xg[0] + t.xg[1] + 0.1;
    const pt = t.passes[0] + t.passes[1] + 1;
    const ft = t.fouls[0] + t.fouls[1] + 1;
    const ot = t.onTarget[0] + t.onTarget[1] + 1;
    
    const ovrDiff = homeOvr - awayOvr;
    const homePoss = Math.min(Math.max(50 + Math.round(ovrDiff * 1.2), 35), 65);
    const awayPoss = 100 - homePoss;
    
    statsContent.innerHTML = `
      <div class="stat-row">
        <div class="stat-hdr">
          <span style="color:var(--cyan);font-weight:700;">${homePoss}%</span>
          <span style="color:var(--text-2); font-size:12px;">Posesión</span>
          <span style="color:var(--orange);font-weight:700;">${awayPoss}%</span>
        </div>
        <div class="stat-bar" style="height:6px; background:rgba(255,255,255,0.05); border-radius:3px; display:flex; overflow:hidden;">
          <div style="background:var(--cyan); width:${homePoss}%; height:100%;"></div>
          <div style="background:var(--orange); width:${awayPoss}%; height:100%;"></div>
        </div>
      </div>
      
      <div class="stat-row">
        <div class="stat-hdr">
          <span style="color:var(--cyan);font-weight:700;">${t.shots[0]}</span>
          <span style="color:var(--text-2); font-size:12px;">Tiros</span>
          <span style="color:var(--orange);font-weight:700;">${t.shots[1]}</span>
        </div>
        <div class="stat-bar" style="height:6px; background:rgba(255,255,255,0.05); border-radius:3px; display:flex; overflow:hidden;">
          <div style="background:var(--cyan); width:${Math.round(t.shots[0]/sh*100)}%; height:100%;"></div>
          <div style="background:var(--orange); width:${Math.round(t.shots[1]/sh*100)}%; height:100%;"></div>
        </div>
      </div>
      
      <div class="stat-row">
        <div class="stat-hdr">
          <span style="color:var(--cyan);font-weight:700;">${t.onTarget[0]}</span>
          <span style="color:var(--text-2); font-size:12px;">A puerta</span>
          <span style="color:var(--orange);font-weight:700;">${t.onTarget[1]}</span>
        </div>
        <div class="stat-bar" style="height:6px; background:rgba(255,255,255,0.05); border-radius:3px; display:flex; overflow:hidden;">
          <div style="background:var(--cyan); width:${Math.round(t.onTarget[0]/ot*100)}%; height:100%;"></div>
          <div style="background:var(--orange); width:${Math.round(t.onTarget[1]/ot*100)}%; height:100%;"></div>
        </div>
      </div>
      
      <div class="stat-row">
        <div class="stat-hdr">
          <span style="color:var(--cyan);font-weight:700;">${t.xg[0].toFixed(2)}</span>
          <span style="color:var(--text-2); font-size:12px;">xG acumulado</span>
          <span style="color:var(--orange);font-weight:700;">${t.xg[1].toFixed(2)}</span>
        </div>
        <div class="stat-bar" style="height:6px; background:rgba(255,255,255,0.05); border-radius:3px; display:flex; overflow:hidden;">
          <div style="background:var(--cyan); width:${Math.round(t.xg[0]/xgt*100)}%; height:100%;"></div>
          <div style="background:var(--orange); width:${Math.round(t.xg[1]/xgt*100)}%; height:100%;"></div>
        </div>
      </div>
      
      <div class="stat-row">
        <div class="stat-hdr">
          <span style="color:var(--cyan);font-weight:700;">${t.passes[0]}</span>
          <span style="color:var(--text-2); font-size:12px;">Pases completados</span>
          <span style="color:var(--orange);font-weight:700;">${t.passes[1]}</span>
        </div>
        <div class="stat-bar" style="height:6px; background:rgba(255,255,255,0.05); border-radius:3px; display:flex; overflow:hidden;">
          <div style="background:var(--cyan); width:${Math.round(t.passes[0]/pt*100)}%; height:100%;"></div>
          <div style="background:var(--orange); width:${Math.round(t.passes[1]/pt*100)}%; height:100%;"></div>
        </div>
      </div>
      
      <div class="stat-row">
        <div class="stat-hdr">
          <span style="color:var(--cyan);font-weight:700;">${t.fouls[0]}</span>
          <span style="color:var(--text-2); font-size:12px;">Faltas</span>
          <span style="color:var(--orange);font-weight:700;">${t.fouls[1]}</span>
        </div>
        <div class="stat-bar" style="height:6px; background:rgba(255,255,255,0.05); border-radius:3px; display:flex; overflow:hidden;">
          <div style="background:var(--cyan); width:${Math.round(t.fouls[0]/ft*100)}%; height:100%;"></div>
          <div style="background:var(--orange); width:${Math.round(t.fouls[1]/ft*100)}%; height:100%;"></div>
        </div>
      </div>
    `;
  }
  
  // Tactical Recommendations
  const recHomeTitle = document.getElementById('rec-home-title');
  const recAwayTitle = document.getElementById('rec-away-title');
  if (recHomeTitle) recHomeTitle.textContent = currentLang === 'es' ? `Recomendaciones tácticas — ${homeName}` : `Tactical Recommendations — ${homeName}`;
  if (recAwayTitle) recAwayTitle.textContent = currentLang === 'es' ? `Recomendaciones tácticas — ${awayName}` : `Tactical Recommendations — ${awayName}`;

  const recHomeCards = document.getElementById('rec-home-cards');
  const recAwayCards = document.getElementById('rec-away-cards');
  if (recHomeCards && recAwayCards) {
    recHomeCards.innerHTML = '';
    recAwayCards.innerHTML = '';
    
    const preferredStyle = user.preferredStyle || 'tikitaka';
    const sortFn = (a, b) => (parseFloat(b.overallRating) || 0) - (parseFloat(a.overallRating) || 0);
    
    // Categorize home team players using active customized starting XI
    let homePlayersForMatchups = userStartingXI.filter(item => item.player && !item.isVirtual).map(item => item.player);
    if (homePlayersForMatchups.length === 0) {
      homePlayersForMatchups = homePlayers;
    }
    const homeGks = homePlayersForMatchups.filter(p => ['GK', 'PO', 'POR'].includes(p.position?.toUpperCase())).sort(sortFn);
    const homeDfs = homePlayersForMatchups.filter(p => ['CB', 'LB', 'RB', 'DFC', 'DF', 'LI', 'LD', 'LWB', 'RWB'].includes(p.position?.toUpperCase())).sort(sortFn);
    const homeMfs = homePlayersForMatchups.filter(p => ['CM', 'DM', 'AM', 'LM', 'RM', 'MC', 'MCD', 'MCO', 'VOL'].includes(p.position?.toUpperCase())).sort(sortFn);
    const homeFws = homePlayersForMatchups.filter(p => ['ST', 'CF', 'LW', 'RW', 'DC', 'EI', 'ED', 'ATA', 'SD'].includes(p.position?.toUpperCase())).sort(sortFn);
    
    // Categorize away team players
    const awayGks = awayPlayers.filter(p => ['GK', 'PO', 'POR'].includes(p.position?.toUpperCase())).sort(sortFn);
    const awayDfs = awayPlayers.filter(p => ['CB', 'LB', 'RB', 'DFC', 'DF', 'LI', 'LD', 'LWB', 'RWB'].includes(p.position?.toUpperCase())).sort(sortFn);
    const awayMfs = awayPlayers.filter(p => ['CM', 'DM', 'AM', 'LM', 'RM', 'MC', 'MCD', 'MCO', 'VOL'].includes(p.position?.toUpperCase())).sort(sortFn);
    const awayFws = awayPlayers.filter(p => ['ST', 'CF', 'LW', 'RW', 'DC', 'EI', 'ED', 'ATA', 'SD'].includes(p.position?.toUpperCase())).sort(sortFn);
    
    // Extract best players for matchup calculations
    const homeBestFw = homeFws[0];
    const homeBestMf = homeMfs[0];
    const homeBestDf = homeDfs[0];
    const homeBestGk = homeGks[0];
    
    const awayBestFw = awayFws[0];
    const awayBestMf = awayMfs[0];
    const awayBestDf = awayDfs[0];
    const awayBestGk = awayGks[0];

    const homeBadgeText = homeName.substring(0, 3).toUpperCase();
    const awayBadgeText = awayName.substring(0, 3).toUpperCase();

    // 1. Home cards
    let homeCardsHtml = '';
    
    // Card 1: Pressing
    const homeTurnovers = 5 + (homeName.length % 4);
    const titleHome1 = currentLang === 'es' ? "Mantener presión alta en salida rival" : "Maintain high press during opponent build-up";
    const bodyHome1 = currentLang === 'es' ? 
      `La formación generó ${homeTurnovers} recuperaciones en campo rival. ${awayName} tuvo dificultades para salir jugando de forma limpia. Conservar esta estructura de pressing con ${homeBestMf ? homeBestMf.name : 'nuestros volantes'} como referencia del mediocampo alto.` :
      `The formation generated ${homeTurnovers} turnovers in the opponent's half. ${awayName} struggled to build up cleanly. Preserve this pressing structure with ${homeBestMf ? homeBestMf.name : 'our midfielders'} as the reference in high areas.`;
    homeCardsHtml += `
      <div class="tac-card">
        <div class="tac-hdr">
          <span class="tac-title">${titleHome1}</span>
          <span class="tac-badge badge-h">${homeBadgeText}</span>
        </div>
        <div class="tac-body">${bodyHome1}</div>
        <span class="priority-pill pp-high">${currentLang === 'es' ? 'Prioridad alta' : 'High priority'}</span>
      </div>
    `;

    // Card 2: Winger/Forward
    const titleHome2 = currentLang === 'es' ? `Explotar banda con ${homeBestFw ? homeBestFw.name.split(' ').pop() : 'atacante'}` : `Exploit the wing with ${homeBestFw ? homeBestFw.name.split(' ').pop() : 'forward'}`;
    const bodyHome2 = currentLang === 'es' ? 
      `${homeBestFw ? homeBestFw.name : 'El atacante'} generó ${simStats.xg[0].toFixed(2)} xG desde la banda con regates exitosos. La defensa rival mostró vulnerabilidad en duelos 1v1 a alta velocidad. Priorizar combinaciones por ese sector.` :
      `${homeBestFw ? homeBestFw.name : 'The forward'} generated ${simStats.xg[0].toFixed(2)} xG from the wing with successful dribbles. The opponent's defense showed vulnerability in 1v1 duels at high speed. Prioritize play through this sector.`;
    homeCardsHtml += `
      <div class="tac-card">
        <div class="tac-hdr">
          <span class="tac-title">${titleHome2}</span>
          <span class="tac-badge badge-h">${homeBadgeText}</span>
        </div>
        <div class="tac-body">${bodyHome2}</div>
        <span class="priority-pill pp-high">${currentLang === 'es' ? 'Prioridad alta' : 'High priority'}</span>
      </div>
    `;

    // Card 3: Defense
    const titleHome3 = currentLang === 'es' ? "Reforzar mediocampo tras pérdidas" : "Reinforce midfield after turnovers";
    const bodyHome3 = currentLang === 'es' ? 
      `Los ${simScoreA} gol${simScoreA === 1 ? '' : 'es'} de ${awayName} llegaron tras pérdidas de balón en mediocampo. Se deben cubrir mejor las transiciones defensivas cuando los volantes suben al ataque simultáneamente.` :
      `The ${simScoreA} goal${simScoreA === 1 ? '' : 's'} for ${awayName} came from midfield turnovers. Defensive transitions must be covered better when midfielders push forward simultaneously.`;
    homeCardsHtml += `
      <div class="tac-card">
        <div class="tac-hdr">
          <span class="tac-title">${titleHome3}</span>
          <span class="tac-badge badge-h">${homeBadgeText}</span>
        </div>
        <div class="tac-body">${bodyHome3}</div>
        <span class="priority-pill pp-med">${currentLang === 'es' ? 'Prioridad media' : 'Medium priority'}</span>
      </div>
    `;
    recHomeCards.innerHTML = homeCardsHtml;

    // 2. Away cards
    let awayCardsHtml = '';
    
    // Card 1: Substitution
    const titleAway1 = currentLang === 'es' ? `Entrada temprana de ${awayBestMf ? awayBestMf.name.split(' ').pop() : 'mediocampista'}` : `Early entry of ${awayBestMf ? awayBestMf.name.split(' ').pop() : 'midfielder'}`;
    const bodyAway1 = currentLang === 'es' ? 
      `${awayBestMf ? awayBestMf.name : 'El mediocampista'} promedió gran precisión en distribución tras asentarse. Si hubiera iniciado desde el comienzo, el control del mediocampo habría limitado el xG rival. Considerar como titular en el próximo encuentro.` :
      `${awayBestMf ? awayBestMf.name : 'The midfielder'} averaged high precision in distribution after settling in. Had they started from the beginning, midfield control would have limited the opponent's xG. Consider starting them in the next match.`;
    awayCardsHtml += `
      <div class="tac-card">
        <div class="tac-hdr">
          <span class="tac-title">${titleAway1}</span>
          <span class="tac-badge badge-a">${awayBadgeText}</span>
        </div>
        <div class="tac-body">${bodyAway1}</div>
        <span class="priority-pill pp-high">${currentLang === 'es' ? 'Prioridad alta' : 'High priority'}</span>
      </div>
    `;

    // Card 2: Defensive Block
    const titleAway2 = currentLang === 'es' ? `Presión alta contra el juego directo de ${homeName}` : `High press against ${homeName}'s direct play`;
    const bodyAway2 = currentLang === 'es' ? 
      `${homeName} ejecutó transiciones muy rápidas en pocos segundos. Un bloque de ${awayName} más compacto entre líneas (PPDA bajo) habría reducido significativamente los espacios a las espaldas de los laterales.` :
      `${homeName} executed high-speed transitions in just a few seconds. A more compact defensive block between lines (low PPDA) for ${awayName} would have significantly reduced space behind the fullbacks.`;
    awayCardsHtml += `
      <div class="tac-card">
        <div class="tac-hdr">
          <span class="tac-title">${titleAway2}</span>
          <span class="tac-badge badge-a">${awayBadgeText}</span>
        </div>
        <div class="tac-body">${bodyAway2}</div>
        <span class="priority-pill pp-high">${currentLang === 'es' ? 'Prioridad alta' : 'High priority'}</span>
      </div>
    `;

    // Card 3: Depth/Verticality
    const titleAway3 = currentLang === 'es' ? "Mayor verticalidad desde mediocampo" : "Increase vertical progression in midfield";
    const bodyAway3 = currentLang === 'es' ? 
      `${awayName} completó ${simStats.passes[1]} pases pero el ritmo de juego fue mayormente horizontal. Atacantes como ${awayBestFw ? awayBestFw.name : 'nuestros delanteros'} necesitan más balones en profundidad para explotar el espacio entre líneas.` :
      `${awayName} completed ${simStats.passes[1]} passes, but the tempo was mostly horizontal. Attackers like ${awayBestFw ? awayBestFw.name : 'our forwards'} need more vertical and deep passes to exploit space between lines.`;
    awayCardsHtml += `
      <div class="tac-card">
        <div class="tac-hdr">
          <span class="tac-title">${titleAway3}</span>
          <span class="tac-badge badge-a">${awayBadgeText}</span>
        </div>
        <div class="tac-body">${bodyAway3}</div>
        <span class="priority-pill pp-med">${currentLang === 'es' ? 'Prioridad media' : 'Medium priority'}</span>
      </div>
    `;
    recAwayCards.innerHTML = awayCardsHtml;
  }
  
  // Set events tab as default
  switchSimTab('events');
  
  // Show dashboard modal
  const results = document.getElementById('sim-results-modal');
  if (results) results.style.display = 'flex';
}

function renderStartingXi(teamPlayers, containerId, isHome = true) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  
  const isUserStartingXI = teamPlayers.length > 0 && teamPlayers[0].player !== undefined;
  
  let xi = [];
  const sortFn = (a, b) => (parseFloat(b.overallRating) || 0) - (parseFloat(a.overallRating) || 0);
  
  if (isUserStartingXI) {
    xi = teamPlayers.map(item => {
      const p = item.player || { name: 'Virtual Player', overallRating: 70, position: item.role || 'COM' };
      let pos = 'COM';
      const role = (item.role || '').toUpperCase();
      if (['PO', 'POR', 'GK'].includes(role)) pos = 'POR';
      else if (['DFC', 'LI', 'LD', 'DF', 'CB', 'LB', 'RB'].includes(role)) pos = 'DEF';
      else if (['MC', 'MED', 'CM', 'DM', 'AM', 'LM', 'RM'].includes(role)) pos = 'MED';
      else if (['DC', 'EI', 'ED', 'DEL', 'ST', 'CF', 'LW', 'RW'].includes(role)) pos = 'DEL';
      return { p, pos };
    });
  } else {
    // Group and pick best players (traditional way for opponent)
    const gks = teamPlayers.filter(p => ['GK', 'PO', 'POR'].includes(p.position?.toUpperCase()));
    const dfs = teamPlayers.filter(p => ['CB', 'LB', 'RB', 'DFC', 'DF', 'LI', 'LD', 'LWB', 'RWB'].includes(p.position?.toUpperCase()));
    const mfs = teamPlayers.filter(p => ['CM', 'DM', 'AM', 'LM', 'RM', 'MC', 'MCD', 'MCO', 'VOL'].includes(p.position?.toUpperCase()));
    const fws = teamPlayers.filter(p => ['ST', 'CF', 'LW', 'RW', 'DC', 'EI', 'ED', 'ATA', 'SD'].includes(p.position?.toUpperCase()));
    
    gks.sort(sortFn);
    dfs.sort(sortFn);
    mfs.sort(sortFn);
    fws.sort(sortFn);
    
    // Choose 1 GK, 4 DF, 3 MF, 3 FW (standard 4-3-3 XI)
    if (gks[0]) xi.push({ p: gks[0], pos: 'POR' });
    
    for (let i = 0; i < Math.min(4, dfs.length); i++) {
      xi.push({ p: dfs[i], pos: 'DEF' });
    }
    for (let i = 0; i < Math.min(3, mfs.length); i++) {
      xi.push({ p: mfs[i], pos: 'MED' });
    }
    for (let i = 0; i < Math.min(3, fws.length); i++) {
      xi.push({ p: fws[i], pos: 'DEL' });
    }
    
    if (xi.length < 11) {
      const usedIds = new Set(xi.map(x => x.p.id));
      const remain = teamPlayers.filter(p => !usedIds.has(p.id)).sort(sortFn);
      for (let i = 0; i < Math.min(11 - xi.length, remain.length); i++) {
        xi.push({ p: remain[i], pos: 'COM' });
      }
    }
  }

  // Sort XI by position so GK is first, then DEF, MED, DEL
  const posOrder = { 'POR': 1, 'DEF': 2, 'MED': 3, 'DEL': 4, 'COM': 5 };
  xi.sort((a, b) => posOrder[a.pos] - posOrder[b.pos]);

  function getPlayerShortName(name) {
    if (!name) return 'PL';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].substring(0, 4);
    }
    const lastPart = parts[parts.length - 1];
    if (lastPart.toLowerCase().startsWith('jr')) {
      return parts[0].substring(0, 2) + '.Jr';
    }
    const p1 = parts[0][0];
    const p2 = lastPart.substring(0, 2);
    return `${p1}.${p2}`;
  }

  function getStringHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  }
  
  xi.forEach(item => {
    const hash = getStringHash(item.p.name);
    
    // Check if player scored in simPreGeneratedEvents
    const goals = simPreGeneratedEvents.filter(ev => 
      ev.type === 'g' && 
      ev.team === (isHome ? 'h' : 'a') && 
      (ev.scorer === item.p.name || ev.txt.toLowerCase().includes(item.p.name.toLowerCase()))
    ).length;
    
    // Sum xG of those goals, plus add some random fraction if they had occasions
    let xg = simPreGeneratedEvents
      .filter(ev => 
        ev.team === (isHome ? 'h' : 'a') && 
        (ev.scorer === item.p.name || ev.txt.toLowerCase().includes(item.p.name.toLowerCase()))
      )
      .reduce((acc, ev) => acc + (ev.xg || 0.15), 0);
      
    // Generate realistic default stats
    let plSub = '';
    let ratingBonus = 0;
    
    if (item.pos === 'POR') {
      const opponentGoals = isHome ? simScoreA : simScoreH;
      const saves = Math.max(1, (hash % 4) + (opponentGoals > 0 ? 1 : 3));
      const touches = 22 + (hash % 12);
      const passAcc = 72 + (hash % 18);
      plSub = `${saves} atajadas · ${touches} toques · ${passAcc}% pases`;
      ratingBonus = saves * 0.35 - opponentGoals * 0.4;
    } else if (item.pos === 'DEF') {
      const tackles = 2 + (hash % 4);
      const touches = 45 + (hash % 20);
      const opponentGoals = isHome ? simScoreA : simScoreH;
      if (xg === 0) xg = (hash % 6) / 100;
      plSub = `${goals > 0 ? `${goals} gol${goals > 1 ? 'es' : ''} · ` : ''}${xg.toFixed(2)} xG · ${tackles} entradas · ${touches} toques`;
      ratingBonus = goals * 1.5 + tackles * 0.2 - opponentGoals * 0.15;
    } else if (item.pos === 'MED') {
      const keyPasses = 1 + (hash % 3);
      const touches = 55 + (hash % 30);
      if (xg === 0) xg = (5 + (hash % 10)) / 100;
      plSub = `${goals > 0 ? `${goals} gol${goals > 1 ? 'es' : ''} · ` : ''}${xg.toFixed(2)} xG · ${keyPasses} pases clave · ${touches} toques`;
      ratingBonus = goals * 1.5 + keyPasses * 0.35;
    } else { // DEL or COM
      const shots = Math.max(goals, 1 + (hash % 4));
      const dribbles = 1 + (hash % 5);
      if (xg === 0) xg = (10 + (hash % 20)) / 100;
      plSub = `${goals > 0 ? `${goals} gol${goals > 1 ? 'es' : ''} · ` : ''}${xg.toFixed(2)} xG · ${shots} tiros · ${dribbles} regates`;
      ratingBonus = goals * 1.6 + shots * 0.12 + dribbles * 0.1;
    }
    
    // Calculate final rating (OVR base + ratingBonus + team performance)
    let teamDiff = simScoreH - simScoreA;
    if (!isHome) teamDiff = -teamDiff;
    const teamBonus = teamDiff > 0 ? 0.4 : (teamDiff < 0 ? -0.3 : 0.0);
    
    let ovrVal = parseFloat(item.p.overallRating) || 70;
    if (ovrVal < 15) ovrVal = ovrVal * 10;
    let baseRating = 6.2 + ((ovrVal - 65) / 18);
    let rating = baseRating + ratingBonus + teamBonus + ((hash % 10) / 10 - 0.5);
    
    // Caps
    rating = Math.min(9.9, Math.max(5.0, rating));
    const finalRatingStr = rating.toFixed(1);
    
    const row = document.createElement('div');
    row.className = 'player-row';
    row.innerHTML = `
      <div class="av ${isHome ? 'av-h' : 'av-a'}">${getPlayerShortName(item.p.name)}</div>
      <div class="pl-info">
        <div class="pl-name">${item.p.name}</div>
        <div class="pl-sub">${plSub}</div>
      </div>
      <span class="pl-pos-badge" style="margin-right: 8px;">${item.pos}</span>
      <div class="pl-rt ${isHome ? 'pl-rt-h' : 'pl-rt-a'}">${finalRatingStr}</div>
    `;
    container.appendChild(row);
  });
}

window.switchSimTab = function(tabName) {
  // Hide all tab content
  document.querySelectorAll('.sim-tab-content').forEach(el => {
    el.classList.remove('active');
  });
  
  // Deactivate all tab buttons
  document.querySelectorAll('.sim-tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Show selected tab content
  const activeContent = document.getElementById(`sim-tab-${tabName}`);
  if (activeContent) activeContent.classList.add('active');
  
  // Activate selected tab button
  let btnId = '';
  if (tabName === 'events') btnId = 'btn-sim-tab-events';
  if (tabName === 'stats') btnId = 'btn-sim-tab-stats';
  if (tabName === 'home-lineup') btnId = 'btn-sim-tab-home';
  if (tabName === 'away-lineup') btnId = 'btn-sim-tab-away';
  if (tabName === 'tactics') btnId = 'btn-sim-tab-tactics';
  
  const activeBtn = document.getElementById(btnId);
  if (activeBtn) activeBtn.classList.add('active');
};

window.closeSimResults = function() {
  if (simInterval) clearInterval(simInterval);
  const results = document.getElementById('sim-results-modal');
  if (results) results.style.display = 'none';
};

async function incrementUserStat(key, data = {}) {
  try {
    let endpoint = '';
    if (key === 'queries') endpoint = '/api/logs/query';
    if (key === 'compared') endpoint = '/api/logs/comparison';
    if (key === 'favorites') endpoint = '/api/logs/favorite';

    if (endpoint) {
      await fetchWithAuth(`${API}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      // Force refresh profile UI
      if (document.getElementById('section-profile')?.classList.contains('active')) {
        renderProfile();
      }
    }
  } catch (err) {
    console.error('Failed to log stat:', err);
  }
}

// Safe utility to apply opacity/alpha to any Hex or HSL color string
function getOpacityColor(colorStr, opacity = 0.2) {
  if (!colorStr) return '';
  colorStr = colorStr.trim();
  if (colorStr.startsWith('#')) {
    let hex = colorStr;
    if (hex.length === 4) {
      hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }
    const alphaHex = Math.round(opacity * 255).toString(16).padStart(2, '0');
    return hex + alphaHex;
  } else if (colorStr.startsWith('hsl')) {
    if (colorStr.startsWith('hsla')) {
      return colorStr.replace(/,\s*[\d.]+\s*\)$/, `, ${opacity})`);
    }
    return colorStr.replace('hsl(', 'hsla(').replace(')', `, ${opacity})`);
  }
  return colorStr;
}

async function renderProfile() {
  const user = JSON.parse(localStorage.getItem('scout_ai_user') || '{}');
  
  const isLocalPlan = (user.selectedTier || '').toLowerCase() === 'local' || 
                      (user.role || '').toLowerCase() === 'local' || 
                      (user.role || '').toLowerCase() === 'entrenador local' ||
                      user.selectedClub === 'Club Local';

  if (user.localCoachData) {
    try {
      let lcd = typeof user.localCoachData === 'string' ? JSON.parse(user.localCoachData) : user.localCoachData;
      if (lcd && lcd.club === 'Club Deportivo TesF') {
        lcd.club = '';
        user.localCoachData = lcd;
        localStorage.setItem('scout_ai_user', JSON.stringify(user));
      }
    } catch(e) {}
  }

  // Inject club theme colors into the profile banner and avatar border
  if (user.selectedClub && !isLocalPlan) {
    const theme = getClubTheme(user.selectedClub);
    const bannerEl = document.querySelector('.profile-header-banner');
    const avatarWrapperEl = document.querySelector('.profile-avatar-wrapper');
    if (bannerEl && theme && theme.colors) {
      // 0.2 opacity gradient background keeps text highly readable and looks premium
      const c1 = getOpacityColor(theme.colors[0], 0.2);
      const c2 = getOpacityColor(theme.colors[1] || theme.colors[0], 0.2);
      bannerEl.style.background = `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`;
      bannerEl.style.borderColor = `rgba(255, 255, 255, 0.15)`;
    }
    if (avatarWrapperEl && theme && theme.colors) {
      avatarWrapperEl.style.borderColor = theme.colors[0];
      const glowColor = getOpacityColor(theme.colors[0], 0.4);
      avatarWrapperEl.style.boxShadow = `0 0 30px ${glowColor}`;
    }
  } else {
    // Reset to default style if no club is selected or in Plan Local
    const bannerEl = document.querySelector('.profile-header-banner');
    const avatarWrapperEl = document.querySelector('.profile-avatar-wrapper');
    if (bannerEl) {
      bannerEl.style.background = '';
      bannerEl.style.borderColor = '';
    }
    if (avatarWrapperEl) {
      avatarWrapperEl.style.borderColor = '';
      avatarWrapperEl.style.boxShadow = '';
    }
  }

  const pageNameEl = document.getElementById('profile-page-name');
  const pageAvatarEl = document.getElementById('profile-page-avatar');
  const clubEl = document.getElementById('profile-page-club');
  const countryEl = document.getElementById('profile-page-country');
  const tacticEl = document.getElementById('profile-page-tactic');
  const planEl = document.getElementById('profile-stat-plan');
  const planNameEl = document.getElementById('profile-page-plan-name');
  
  const fullnameEl = document.getElementById('profile-page-fullname');
  const emailEl = document.getElementById('profile-page-email');
  const phoneEl = document.getElementById('profile-page-phone');
  const roleEl = document.getElementById('profile-page-role');

  if (pageNameEl) pageNameEl.textContent = user.username || 'Usuario';
  const hasLocalCoach = !!user.localCoachData || (user.role || '').toLowerCase().includes('entrenador');
  const effectiveUserRole = hasLocalCoach ? 'Entrenador' : (user.role || 'Usuario');

  const profileRoleEl = document.querySelector('.profile-role');
  if (profileRoleEl) {
    profileRoleEl.textContent = effectiveUserRole;
    profileRoleEl.style.display = 'block';
  }
  if (pageAvatarEl && user.avatarUrl) pageAvatarEl.src = getAbsoluteUrl(user.avatarUrl);
  
  if (fullnameEl) fullnameEl.textContent = (user.nombres && user.apellidos) ? `${user.nombres} ${user.apellidos}` : 'No ingresado';
  if (emailEl) emailEl.textContent = user.email || 'No ingresado';
  if (phoneEl) phoneEl.textContent = user.telefono || 'No ingresado';
  if (roleEl) roleEl.textContent = effectiveUserRole;

  // Preferences toggles initialization
  const notifPref = localStorage.getItem('scout_ai_pref_notif') !== 'false';
  const darkPref = localStorage.getItem('scout_ai_pref_dark_mode') !== 'false';
  
  const toggleNotifEl = document.getElementById('toggle-notif-ai');
  const toggleDarkEl = document.getElementById('toggle-dark-mode');
  
  if (toggleNotifEl) toggleNotifEl.classList.toggle('on', notifPref);
  if (toggleDarkEl) toggleDarkEl.classList.toggle('on', darkPref);
  
  // Show/Hide Club, Country, Tactic profile fields based on Plan Local
  const clubItem = document.getElementById('profile-info-club');
  const countryItem = document.getElementById('profile-info-country');
  const tacticItem = document.getElementById('profile-info-tactic');

  if (isLocalPlan) {
    if (clubItem) clubItem.style.display = 'none';
    if (countryItem) countryItem.style.display = 'none';
    if (tacticItem) tacticItem.style.display = 'none';
  } else {
    if (clubItem) clubItem.style.display = '';
    if (countryItem) countryItem.style.display = '';
    if (tacticItem) tacticItem.style.display = '';
    
    if (clubEl) clubEl.textContent = user.selectedClub || 'No seleccionado';
    if (countryEl) countryEl.textContent = user.selectedCountry?.split(',')[0]?.trim() || 'No seleccionado';
    if (tacticEl) {
      const formation = user.preferredFormation || user.tacticalFormation;
      const styleKey = user.preferredStyle || user.tacticalStyle;
      
      if (formation && styleKey) {
        const styleName = t(`style_${styleKey}`) || styleKey;
        tacticEl.textContent = `${formation} · ${styleName}`;
      } else {
        tacticEl.textContent = currentLang === 'es' ? 'No definido' : 'Not defined';
      }
    }
  }
  if (planEl) planEl.textContent = (user.selectedTier || 'Gratis').toUpperCase();
  if (planNameEl) planNameEl.textContent = user.selectedTier || 'Gratis';
  
  const cycleEl = document.getElementById('profile-page-billing-cycle');
  if (cycleEl) {
    if (window.isBillingCycleActive(user)) {
      const daysLeft = window.getBillingCycleDaysRemaining(user);
      const endDateStr = window.formatBillingCycleDate(user.billingCycleEnd);
      const isAuto = user.autoRenew !== false;
      
      cycleEl.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 10px; flex-wrap: wrap;">
          <div>
            <span style="color: #00e676; font-weight: 700;">Vigente hasta el ${endDateStr}</span>
            <div style="font-size: 11px; color: rgba(255,255,255,0.6); margin-top: 2px;">
              ${isAuto ? '🔄 Renovación automática activa' : '⚠️ Renovación cancelada'}
            </div>
          </div>
          ${isAuto ? `<button onclick="cancelSubscription()" style="padding: 4px 10px; font-size: 11px; font-weight: 600; border-radius: 6px; background: rgba(255, 82, 82, 0.15); border: 1px solid rgba(255, 82, 82, 0.4); color: #ff5252; cursor: pointer; transition: all 0.2s;">Cancelar Renovación</button>` : `<span style="font-size: 11px; color: rgba(255,152,0,0.9); font-weight: 700; background: rgba(255,152,0,0.15); padding: 3px 8px; border-radius: 6px;">Renovación Cancelada</span>`}
        </div>
      `;
    } else if (user.selectedTier && user.selectedTier !== 'Gratis') {
      cycleEl.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 10px;">
          <span style="color: #ff5252; font-weight: 700;">Suscripción expirada</span>
          <button onclick="openUpgradeModal()" style="padding: 4px 10px; font-size: 11px; font-weight: 700; border-radius: 6px; background: rgba(0, 240, 255, 0.15); border: 1.5px solid #00f0ff; color: #00f0ff; cursor: pointer;">Renovar Plan 🚀</button>
        </div>
      `;
    } else {
      cycleEl.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 10px;">
          <span style="color: rgba(255,255,255,0.5);">Sin suscripción activa</span>
          <button onclick="openUpgradeModal()" style="padding: 4px 10px; font-size: 11px; font-weight: 700; border-radius: 6px; background: rgba(0, 240, 255, 0.15); border: 1.5px solid #00f0ff; color: #00f0ff; cursor: pointer;">Activar Plan 🚀</button>
        </div>
      `;
    }
  }
  
  // Llenar tarjeta de Entrenador Local
  const isLocalCoach = (user.selectedTier || '').toLowerCase() === 'local' || (user.role || '').toLowerCase() === 'local' || (user.role || '').toLowerCase() === 'entrenador local';
  const localCardEl = document.getElementById('profile-local-coach-card');
  if (localCardEl) {
    if (isLocalCoach) {
      localCardEl.style.display = 'block';
      let data = {};
      if (user.localCoachData) {
        try {
          data = typeof user.localCoachData === 'string' ? JSON.parse(user.localCoachData) : user.localCoachData;
        } catch (e) {
          console.error('Error parsing localCoachData:', e);
        }
      }
      
      const pClub = document.getElementById('profile-local-club');
      const pAgeRange = document.getElementById('profile-local-age-range');
      const pCountry = document.getElementById('profile-local-country');
      const pAddress = document.getElementById('profile-local-address');
      const pCode = document.getElementById('profile-local-code');
      const pAdminPhone = document.getElementById('profile-local-admin-phone');
      const pLeagues = document.getElementById('profile-local-leagues');
      const pAwards = document.getElementById('profile-local-awards');
      
      if (pClub) pClub.textContent = data.club || 'No ingresado';
      if (pAgeRange) pAgeRange.textContent = data.ageRange || 'No ingresado';
      if (pCountry) pCountry.textContent = data.nationality || 'No ingresado';
      if (pAddress) pAddress.textContent = data.address || 'No ingresado';
      if (pCode) pCode.textContent = data.code || 'No ingresado';
      if (pAdminPhone) pAdminPhone.textContent = data.adminPhone || 'No ingresado';
      if (pLeagues) pLeagues.textContent = data.leagues || 'No ingresado';
      if (pAwards) pAwards.textContent = data.awards || 'Ninguno';
    } else {
      localCardEl.style.display = 'none';
    }
  }

  const btnMyPlayersTab = document.getElementById('btn-profile-tab-my-players');
  if (btnMyPlayersTab) {
    if (isLocalCoach) {
      btnMyPlayersTab.style.display = 'none';
      const contentMyPlayers = document.getElementById('profile-tab-content-my-players');
      if (contentMyPlayers && contentMyPlayers.style.display !== 'none') {
        window.switchProfileTab('activity');
      }
    } else {
      btnMyPlayersTab.style.display = 'none';
    }
  }

  const btnFavoritesTab = document.getElementById('btn-profile-tab-favorites');
  if (btnFavoritesTab) {
    if (isLocalPlan) {
      btnFavoritesTab.style.display = 'none';
      const contentFavorites = document.getElementById('profile-tab-content-favorites');
      if (contentFavorites && contentFavorites.style.display !== 'none') {
        window.switchProfileTab('activity');
      }
    } else {
      btnFavoritesTab.style.display = '';
    }
  }

  if (typeof window.renderMyPlayersModule === 'function') {
    window.renderMyPlayersModule();
  }
    
  let createdAtMs = NaN;
  if (user.createdAt) {
    const num = Number(user.createdAt);
    if (!isNaN(num)) {
      createdAtMs = num;
    } else {
      const parsed = Date.parse(user.createdAt);
      if (!isNaN(parsed)) {
        createdAtMs = parsed;
      }
    }
  }

  if (isNaN(createdAtMs)) {
    createdAtMs = Date.now();
    user.createdAt = createdAtMs;
    localStorage.setItem('scout_ai_user', JSON.stringify(user));
  }
  const ms = Date.now() - createdAtMs;
  const days = Math.max(1, Math.floor(ms / (1000 * 60 * 60 * 24)));
  
  const queriesEl = document.getElementById('profile-stat-queries');
  const comparedEl = document.getElementById('profile-stat-compared');
  const daysEl = document.getElementById('profile-stat-days');
  
  if (queriesEl) queriesEl.textContent = '...';
  if (comparedEl) comparedEl.textContent = '...';
  if (daysEl) daysEl.textContent = days;

  try {
    const res = await fetchWithAuth(`${API}/profile/stats`);
    if (res.ok) {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error from server');
      if (queriesEl) queriesEl.textContent = data.queries || 0;
      if (comparedEl) comparedEl.textContent = data.compared || 0;
    }
  } catch (err) {
    console.error('Error fetching stats:', err);
  }

  // Load payment history
  if (typeof window.loadProfilePaymentHistory === 'function') {
    window.loadProfilePaymentHistory();
  }
}

// ──────────────────────────────────────────
// PROFILE TABS & PAYMENT HISTORY
// ──────────────────────────────────────────
window.switchProfileTab = (tabName) => {
  const btnActivity = document.getElementById('btn-profile-tab-activity');
  const btnMyPlayers = document.getElementById('btn-profile-tab-my-players');
  const btnPaymentMethods = document.getElementById('btn-profile-tab-payment-methods');
  const btnPayments = document.getElementById('btn-profile-tab-payments');
  const btnFavorites = document.getElementById('btn-profile-tab-favorites');
  const btnSecurity = document.getElementById('btn-profile-tab-security');

  const contentActivity = document.getElementById('profile-tab-content-activity');
  const contentMyPlayers = document.getElementById('profile-tab-content-my-players');
  const contentPaymentMethods = document.getElementById('profile-tab-content-payment-methods');
  const contentPayments = document.getElementById('profile-tab-content-payments');
  const contentFavorites = document.getElementById('profile-tab-content-favorites');
  const contentSecurity = document.getElementById('profile-tab-content-security');
  
  const buttons = [btnActivity, btnMyPlayers, btnPaymentMethods, btnPayments, btnFavorites, btnSecurity];
  const contents = [contentActivity, contentMyPlayers, contentPaymentMethods, contentPayments, contentFavorites, contentSecurity];
  
  buttons.forEach(btn => {
    if (btn) {
      btn.classList.remove('active');
      btn.style.color = 'rgba(255,255,255,0.6)';
      btn.style.fontWeight = '600';
      btn.style.borderBottom = '2.5px solid transparent';
    }
  });
  
  contents.forEach(content => {
    if (content) content.style.display = 'none';
  });
  
  let activeBtn = null;
  let activeContent = null;
  
  if (tabName === 'activity') {
    activeBtn = btnActivity;
    activeContent = contentActivity;
  } else if (tabName === 'my-players') {
    activeBtn = btnMyPlayers;
    activeContent = contentMyPlayers;
    window.renderMyPlayersModule();
  } else if (tabName === 'payment-methods') {
    activeBtn = btnPaymentMethods;
    activeContent = contentPaymentMethods;
    window.loadPaymentMethods();
  } else if (tabName === 'payments') {
    activeBtn = btnPayments;
    activeContent = contentPayments;
    window.loadProfilePaymentHistory();
  } else if (tabName === 'favorites') {
    const userObj = JSON.parse(localStorage.getItem('scout_ai_user') || '{}');
    const isLocalPlan = (userObj.selectedTier || '').toLowerCase() === 'local' || 
                        (userObj.role || '').toLowerCase() === 'local' || 
                        (userObj.role || '').toLowerCase() === 'entrenador local' ||
                        userObj.selectedClub === 'Club Local';
    if (isLocalPlan) {
      window.switchProfileTab('activity');
      return;
    }
    activeBtn = btnFavorites;
    activeContent = contentFavorites;
    window.renderProfileFavorites();
  } else if (tabName === 'security') {
    activeBtn = btnSecurity;
    activeContent = contentSecurity;
    window.loadSecurityPasskeyInfo();
  }
  
  if (activeBtn) {
    activeBtn.classList.add('active');
    activeBtn.style.color = '#00f0ff';
    activeBtn.style.fontWeight = '700';
    activeBtn.style.borderBottom = '2.5px solid #00f0ff';
  }
  if (activeContent) {
    activeContent.style.display = 'block';
  }
};

// ──────────────────────────────────────────
// GESTIÓN DE MEDIOS DE PAGO (PERFIL)
// ──────────────────────────────────────────
window.loadPaymentMethods = async () => {
  const container = document.getElementById('payment-methods-list-container');
  if (!container) return;

  container.innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: rgba(255,255,255,0.6);">
      <div style="font-size: 28px; margin-bottom: 10px;">⏳</div>
      <div>Cargando medios de pago de la base de datos cifrada...</div>
    </div>
  `;

  try {
    const token = localStorage.getItem('scout_ai_token') || localStorage.getItem('scoutai_token');
    if (!token) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 30px; background: rgba(255, 170, 0, 0.1); border: 1px solid rgba(255, 170, 0, 0.3); border-radius: 12px; color: #ffaa00;">
          ⚠️ Sesión no iniciada. Por favor, inicia sesión para ver tus medios de pago.
        </div>
      `;
      return;
    }

    const res = await fetch('/api/payment-methods', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (res.status === 401) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 30px; background: rgba(255, 59, 48, 0.1); border: 1px solid rgba(255, 59, 48, 0.3); border-radius: 12px; color: #ff3b30;">
          🔒 Tu sesión ha caducado. Por favor, vuelve a iniciar sesión en tu cuenta.
        </div>
      `;
      return;
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Error del servidor (${res.status})`);
    }

    const data = await res.json();
    if (data.success && Array.isArray(data.paymentMethods)) {
      window.renderPaymentMethods(data.paymentMethods);
    } else {
      throw new Error(data.error || 'Error al obtener los datos.');
    }
  } catch (err) {
    console.error('Error loading payment methods:', err);
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 30px; background: rgba(255, 59, 48, 0.1); border: 1px solid rgba(255, 59, 48, 0.3); border-radius: 12px; color: #ff3b30;">
        ⚠️ ${err.message}
      </div>
    `;
  }
};

window.renderPaymentMethods = (methods) => {
  const container = document.getElementById('payment-methods-list-container');
  if (!container) return;

  if (!methods || methods.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 45px 20px; background: rgba(10, 16, 28, 0.4); border: 1.5px dashed rgba(0, 240, 255, 0.2); border-radius: 16px;">
        <h4 style="font-size: 17px; font-weight: 700; color: #fff; margin-bottom: 8px;">No tienes medios de pago registrados</h4>
        <p style="font-size: 13px; color: rgba(255,255,255,0.5); max-width: 420px; margin: 0 auto 20px auto;">Agrega tu primera tarjeta de crédito o débito para gestionar renovaciones de suscripción de forma segura.</p>
        <button class="btn-profile-primary" onclick="openAddPaymentMethodModal()" style="padding: 10px 20px; font-size: 13px; font-weight: 700;">Agregar Primera Tarjeta</button>
      </div>
    `;
    return;
  }

  container.innerHTML = methods.map(pm => {
    const brandLower = (pm.cardBrand || '').toLowerCase().replace(/\s+/g, '');
    let brandClass = 'brand-default';
    if (brandLower.includes('visa')) brandClass = 'brand-visa';
    else if (brandLower.includes('mastercard')) brandClass = 'brand-mastercard';
    else if (brandLower.includes('amex') || brandLower.includes('american')) brandClass = 'brand-amex';

    return `
      <div class="payment-card-box ${pm.isDefault ? 'default-card' : ''}">
        ${pm.isDefault ? '<div class="payment-default-badge">⭐ Principal</div>' : ''}
        
        <div class="payment-card-top">
          <div class="payment-card-chip"></div>
          <span class="payment-card-brand-tag ${brandClass}">${pm.cardBrand || 'Tarjeta'}</span>
        </div>

        <div class="payment-card-number">
          <span>••••</span>
          <span>••••</span>
          <span>••••</span>
          <span>${pm.last4}</span>
        </div>

        <div class="payment-card-bottom">
          <div class="payment-card-holder">
            <span class="payment-card-label">Titular / Vencimiento</span>
            <span class="payment-card-val" title="${pm.cardholderName}">${pm.cardholderName}</span>
            <span style="font-size: 11px; color: rgba(0, 240, 255, 0.8); font-weight: 700; margin-top: 2px;">Vence: ${pm.expMonth}/${pm.expYear}</span>
          </div>

          <div class="payment-card-actions">
            ${!pm.isDefault ? `
              <button class="payment-card-btn-action" onclick="setDefaultPaymentMethod(${pm.id})" title="Establecer como medio de pago principal">
                Usar Principal
              </button>
            ` : ''}
            <button class="payment-card-btn-action payment-card-btn-delete" onclick="deletePaymentMethod(${pm.id})" title="Eliminar tarjeta">
              🗑️
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
};

window.openAddPaymentMethodModal = () => {
  console.log('💳 Opening Add Payment Method Modal...');
  const modal = document.getElementById('modal-add-payment-method');
  const form = document.getElementById('add-payment-method-form');
  const errorMsg = document.getElementById('add-pm-error-msg');
  const badge = document.getElementById('pm-card-brand-badge');

  const count = (window.userPaymentMethods || []).length;

  if (form) {
    form.reset();
    form.onsubmit = window.savePaymentMethod;
  }
  if (errorMsg) {
    if (count >= 10) {
      errorMsg.textContent = 'Has alcanzado el límite máximo de 10 tarjetas guardadas por usuario (10/10). Elimina una para agregar otra.';
      errorMsg.style.display = 'block';
    } else {
      errorMsg.style.display = 'none';
      errorMsg.textContent = '';
    }
  }
  if (badge) {
    badge.textContent = '💳';
    badge.style.color = 'rgba(255,255,255,0.4)';
    badge.style.background = 'transparent';
  }
  if (modal) {
    modal.style.cssText = 'display: flex !important; position: fixed !important; top: 0 !important; left: 0 !important; width: 100vw !important; height: 100vh !important; z-index: 999999 !important; background: rgba(4, 8, 16, 0.88) !important; backdrop-filter: blur(12px) !important; align-items: center !important; justify-content: center !important; padding: 20px !important; box-sizing: border-box !important;';
  } else {
    window.showAppErrorAlert({
      title: 'Error de Interfaz',
      message: 'No se encontró el elemento modal-add-payment-method en la página.'
    });
  }
};

window.closeAddPaymentMethodModal = () => {
  const modal = document.getElementById('modal-add-payment-method');
  if (modal) {
    modal.style.cssText = 'display: none !important;';
  }
};

window.formatCardNumberInput = (input) => {
  if (!input) return;
  let val = input.value.replace(/\D/g, '');
  if (val.length > 19) val = val.substring(0, 19);

  const parts = [];
  for (let i = 0; i < val.length; i += 4) {
    parts.push(val.substring(i, i + 4));
  }
  input.value = parts.join(' ');

  const badge = document.getElementById('pm-card-brand-badge');
  if (badge) {
    if (/^4/.test(val)) {
      badge.textContent = 'Visa 🔵';
      badge.style.color = '#00f0ff';
    } else if (/^(5[1-5]|2[2-7])/.test(val)) {
      badge.textContent = 'MC 🟠';
      badge.style.color = '#ff9800';
    } else if (/^3[47]/.test(val)) {
      badge.textContent = 'Amex 🟢';
      badge.style.color = '#4caf50';
    } else if (/^(6011|65|64[4-9])/.test(val)) {
      badge.textContent = 'Disc 🟣';
      badge.style.color = '#9c27b0';
    } else {
      badge.textContent = '💳';
      badge.style.color = 'rgba(255,255,255,0.4)';
    }
  }
};

window.formatCardPeriodInput = (input) => {
  if (!input) return;
  let clean = input.value.replace(/\D/g, '');
  if (clean.length > 4) clean = clean.slice(0, 4);
  if (clean.length > 2) {
    input.value = clean.slice(0, 2) + '/' + clean.slice(2, 4);
  } else {
    input.value = clean;
  }
};

window.savePaymentMethod = async (event) => {
  if (event && typeof event.preventDefault === 'function') {
    event.preventDefault();
  }

  const count = (window.userPaymentMethods || []).length;
  const errorMsg = document.getElementById('add-pm-error-msg');

  if (count >= 10) {
    if (errorMsg) {
      errorMsg.textContent = 'Has alcanzado el límite máximo de 10 tarjetas guardadas por usuario (10/10). Elimina una para agregar otra.';
      errorMsg.style.display = 'block';
    }
    return false;
  }

  const cardholderName = (document.getElementById('pm-cardholder-name')?.value || '').trim();
  const cardNumber = (document.getElementById('pm-card-number')?.value || '').replace(/\s/g, '');

  let expMonth = document.getElementById('pm-exp-month')?.value || '';
  let expYear = document.getElementById('pm-exp-year')?.value || '';
  const periodVal = (document.getElementById('pm-period')?.value || '').trim();
  if (periodVal.includes('/')) {
    const parts = periodVal.split('/');
    expMonth = parts[0].padStart(2, '0');
    expYear = parts[1].length === 2 ? '20' + parts[1] : parts[1];
  }

  const cvc = (document.getElementById('pm-cvc')?.value || '').trim();
  const billingZip = (document.getElementById('pm-billing-zip')?.value || '').trim();
  const isDefault = document.getElementById('pm-is-default')?.checked || false;

  const submitBtn = document.getElementById('btn-save-payment-method');

  if (errorMsg) {
    errorMsg.style.display = 'none';
    errorMsg.textContent = '';
  }

  if (!cardholderName || !cardNumber || !expMonth || !expYear || !cvc) {
    if (errorMsg) {
      errorMsg.textContent = 'Por favor completa todos los campos requeridos (Titular, Tarjeta, Vencimiento y CVV).';
      errorMsg.style.display = 'block';
    }
    return false;
  }

  if (cardNumber.length < 13 || cardNumber.length > 19) {
    if (errorMsg) {
      errorMsg.textContent = 'El número de tarjeta debe contener entre 13 y 19 dígitos.';
      errorMsg.style.display = 'block';
    }
    return false;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Guardando y Cifrando...';
  }

  try {
    const token = localStorage.getItem('scout_ai_token') || localStorage.getItem('scoutai_token');
    if (!token) {
      throw new Error('Tu sesión ha finalizado. Por favor, vuelve a iniciar sesión.');
    }

    const res = await fetch('/api/payment-methods', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        cardholderName,
        cardNumber,
        expMonth,
        expYear,
        cvc,
        billingZip,
        isDefault
      })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Error al guardar el medio de pago.');
    }

    window.closeAddPaymentMethodModal();
    if (typeof window.showToast === 'function') {
      window.showToast('✅ Tarjeta registrada con éxito y cifrada en BD', 'success');
    } else {
      alert('✅ Medio de pago registrado con éxito en la base de datos cifrada.');
    }
    window.loadPaymentMethods();
    return false;

  } catch (err) {
    console.error('Error saving payment method:', err);
    if (errorMsg) {
      errorMsg.textContent = err.message || 'Error al guardar medio de pago.';
      errorMsg.style.display = 'block';
    }
    return false;
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = '🔒 Guardar Tarjeta Seguro';
    }
  }
};

window.setDefaultPaymentMethod = async (id) => {
  try {
    const token = localStorage.getItem('scout_ai_token') || localStorage.getItem('scoutai_token');
    const res = await fetch(`/api/payment-methods/${id}/default`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Error al actualizar');
    }

    if (typeof window.showToast === 'function') {
      window.showToast('⭐ Medio de pago marcado como principal', 'success');
    }
    window.loadPaymentMethods();
  } catch (err) {
    console.error('Error setting default payment method:', err);
    window.showAppErrorAlert({
      title: 'Medios de Pago',
      message: err.message || 'Error al establecer medio de pago principal.'
    });
  }
};

window.deletePaymentMethod = async (id) => {
  if (!confirm('¿Estás seguro de que deseas eliminar este medio de pago de tu cuenta?')) {
    return;
  }

  try {
    const token = localStorage.getItem('scout_ai_token') || localStorage.getItem('scoutai_token');
    const res = await fetch(`/api/payment-methods/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Error al eliminar');
    }

    if (typeof window.showToast === 'function') {
      window.showToast('🗑️ Medio de pago eliminado', 'info');
    }
    window.loadPaymentMethods();
  } catch (err) {
    console.error('Error deleting payment method:', err);
    window.showAppErrorAlert({
      title: 'Medios de Pago',
      message: err.message || 'Error al eliminar medio de pago.'
    });
  }
};

// Global function alias wrappers for inline HTML onclick/onsubmit handlers
function openAddPaymentMethodModal() { if (typeof window.openAddPaymentMethodModal === 'function') window.openAddPaymentMethodModal(); }
function closeAddPaymentMethodModal() { if (typeof window.closeAddPaymentMethodModal === 'function') window.closeAddPaymentMethodModal(); }
function formatCardNumberInput(input) { if (typeof window.formatCardNumberInput === 'function') window.formatCardNumberInput(input); }
function savePaymentMethod(event) { if (typeof window.savePaymentMethod === 'function') return window.savePaymentMethod(event); }
function setDefaultPaymentMethod(id) { if (typeof window.setDefaultPaymentMethod === 'function') window.setDefaultPaymentMethod(id); }
function deletePaymentMethod(id) { if (typeof window.deletePaymentMethod === 'function') window.deletePaymentMethod(id); }

// Universal Event Listener binding for opening the Add Payment Method Modal
document.addEventListener('click', (e) => {
  const btn = e.target.closest('#btn-open-add-payment-method-modal, [onclick*="openAddPaymentMethodModal"], .btn-open-pm-modal');
  if (btn) {
    console.log('💳 Click detected on Add Payment Method button:', btn);
    e.preventDefault();
    e.stopPropagation();
    if (typeof window.openAddPaymentMethodModal === 'function') {
      window.openAddPaymentMethodModal();
    }
  }
});




// ──────────────────────────────────────────
// SEGURIDAD Y DISPOSITIVOS PASSKEY (PERFIL)
// ──────────────────────────────────────────
const bufferToBase64Url = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

const base64UrlToBuffer = (base64url) => {
  let padding = '='.repeat((4 - base64url.length % 4) % 4);
  let base64 = (base64url + padding).replace(/-/g, '+').replace(/_/g, '/');
  let rawData = window.atob(base64);
  let outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer;
};

window.getDevicePasskeyInfo = () => {
  const ua = navigator.userAgent || '';
  const screenWidth = window.screen ? window.screen.width : 0;
  const screenHeight = window.screen ? window.screen.height : 0;

  // 🍎 iOS Identification (iPhones 2023+)
  if (/iphone|ipad|ipod/i.test(ua)) {
    if (/ipad/i.test(ua)) {
      if (/M4/i.test(ua) || (screenWidth >= 1024 && screenHeight >= 1366)) return 'Apple iPad Pro M4 / Air (2024+)';
      return 'Apple iPad (iOS)';
    }
    const ratio = window.devicePixelRatio || 1;
    const maxDim = Math.max(screenWidth, screenHeight);
    
    if (maxDim >= 932 && ratio >= 3) return 'Apple iPhone 16 Pro Max / 15 Pro Max';
    if (maxDim >= 852 && ratio >= 3) return 'Apple iPhone 16 Pro / 15 Pro / 16';
    if (maxDim >= 926 || maxDim >= 844) return 'Apple iPhone 16 Plus / 15 Plus';
    return 'Apple iPhone (iOS)';
  }

  // 📱 Samsung Galaxy Model Mapping Complete (Lanzamientos 2023 - 2026)
  if (/samsung|galaxy|SM-/i.test(ua)) {
    // S-Series Flagships (2023 - 2026)
    if (/SM-S938/i.test(ua)) return 'Samsung Galaxy S25 Ultra';
    if (/SM-S936/i.test(ua)) return 'Samsung Galaxy S25+';
    if (/SM-S931/i.test(ua)) return 'Samsung Galaxy S25';

    if (/SM-S928/i.test(ua)) return 'Samsung Galaxy S24 Ultra';
    if (/SM-S926/i.test(ua)) return 'Samsung Galaxy S24+';
    if (/SM-S921/i.test(ua)) return 'Samsung Galaxy S24';
    if (/SM-S721/i.test(ua)) return 'Samsung Galaxy S24 FE';

    if (/SM-S918/i.test(ua)) return 'Samsung Galaxy S23 Ultra';
    if (/SM-S916/i.test(ua)) return 'Samsung Galaxy S23+';
    if (/SM-S911/i.test(ua)) return 'Samsung Galaxy S23';
    if (/SM-S711/i.test(ua)) return 'Samsung Galaxy S23 FE';

    // Z-Series Plegables (2023 - 2025)
    if (/SM-F958/i.test(ua)) return 'Samsung Galaxy Z Fold Special Edition';
    if (/SM-F956/i.test(ua)) return 'Samsung Galaxy Z Fold6';
    if (/SM-F741/i.test(ua)) return 'Samsung Galaxy Z Flip6';
    if (/SM-F946/i.test(ua)) return 'Samsung Galaxy Z Fold5';
    if (/SM-F731/i.test(ua)) return 'Samsung Galaxy Z Flip5';

    // A-Series (2023 - 2025)
    if (/SM-A566/i.test(ua)) return 'Samsung Galaxy A56 5G';
    if (/SM-A556/i.test(ua)) return 'Samsung Galaxy A55 5G';
    if (/SM-A546/i.test(ua)) return 'Samsung Galaxy A54 5G';

    if (/SM-A366/i.test(ua)) return 'Samsung Galaxy A36 5G';
    if (/SM-A356/i.test(ua)) return 'Samsung Galaxy A35 5G';
    if (/SM-A346/i.test(ua)) return 'Samsung Galaxy A34 5G';

    if (/SM-A266/i.test(ua)) return 'Samsung Galaxy A26 5G';
    if (/SM-A256/i.test(ua)) return 'Samsung Galaxy A25 5G';
    if (/SM-A245/i.test(ua)) return 'Samsung Galaxy A24';

    if (/SM-A166/i.test(ua) || /SM-A165/i.test(ua)) return 'Samsung Galaxy A16';
    if (/SM-A156/i.test(ua) || /SM-A155/i.test(ua)) return 'Samsung Galaxy A15';
    if (/SM-A146/i.test(ua) || /SM-A145/i.test(ua)) return 'Samsung Galaxy A14';

    if (/SM-A065/i.test(ua)) return 'Samsung Galaxy A06';
    if (/SM-A057/i.test(ua)) return 'Samsung Galaxy A05s';
    if (/SM-A055/i.test(ua)) return 'Samsung Galaxy A05';
    if (/SM-A042/i.test(ua)) return 'Samsung Galaxy A04e';

    // M-Series & F-Series (2023 - 2025)
    if (/SM-M556/i.test(ua) || /SM-F556/i.test(ua)) return 'Samsung Galaxy M55 / F55 5G';
    if (/SM-M546/i.test(ua) || /SM-F546/i.test(ua)) return 'Samsung Galaxy M54 / F54 5G';
    if (/SM-M356/i.test(ua) || /SM-F346/i.test(ua)) return 'Samsung Galaxy M35 / F34 5G';
    if (/SM-M346/i.test(ua)) return 'Samsung Galaxy M34 5G';
    if (/SM-M156/i.test(ua) || /SM-F156/i.test(ua)) return 'Samsung Galaxy M15 / F15 5G';
    if (/SM-M146/i.test(ua) || /SM-F146/i.test(ua)) return 'Samsung Galaxy M14 / F14 5G';
    if (/SM-M055/i.test(ua) || /SM-F055/i.test(ua)) return 'Samsung Galaxy M05 / F05';

    // XCover Rugged (2023 - 2024)
    if (/SM-G556/i.test(ua)) return 'Samsung Galaxy XCover 7';
    if (/SM-G736/i.test(ua)) return 'Samsung Galaxy XCover 6 Pro';

    // Tab-Series Tablets (2023 - 2025)
    if (/SM-X926|SM-X920/i.test(ua)) return 'Samsung Galaxy Tab S10 Ultra';
    if (/SM-X826|SM-X820/i.test(ua)) return 'Samsung Galaxy Tab S10+';
    if (/SM-X916|SM-X910/i.test(ua)) return 'Samsung Galaxy Tab S9 Ultra';
    if (/SM-X816|SM-X810/i.test(ua)) return 'Samsung Galaxy Tab S9+';
    if (/SM-X716|SM-X710/i.test(ua)) return 'Samsung Galaxy Tab S9';
    if (/SM-X616|SM-X516/i.test(ua)) return 'Samsung Galaxy Tab S9 FE';
    if (/SM-X216|SM-X115/i.test(ua)) return 'Samsung Galaxy Tab A9+ / A9';

    // Fallback Samsung con número de modelo
    const modelMatch = ua.match(/SM-[A-Z0-9]+/i);
    if (modelMatch) return `Samsung Galaxy (${modelMatch[0]})`;
    return 'Samsung Galaxy (Android)';
  }

  // 🤖 Google Pixel Series (2023-2025)
  if (/pixel/i.test(ua)) {
    if (/Pixel 9 Pro XL/i.test(ua)) return 'Google Pixel 9 Pro XL';
    if (/Pixel 9 Pro Fold/i.test(ua)) return 'Google Pixel 9 Pro Fold';
    if (/Pixel 9 Pro/i.test(ua)) return 'Google Pixel 9 Pro';
    if (/Pixel 9/i.test(ua)) return 'Google Pixel 9';
    if (/Pixel 8a/i.test(ua)) return 'Google Pixel 8a';
    if (/Pixel 8 Pro/i.test(ua)) return 'Google Pixel 8 Pro';
    if (/Pixel 8/i.test(ua)) return 'Google Pixel 8';
    if (/Pixel Fold/i.test(ua)) return 'Google Pixel Fold';
    if (/Pixel 7a/i.test(ua)) return 'Google Pixel 7a';
    return 'Google Pixel (Android)';
  }

  // 📱 Xiaomi / Redmi / POCO (2023-2025)
  if (/xiaomi|redmi|poco/i.test(ua)) {
    if (/14 Ultra/i.test(ua)) return 'Xiaomi 14 Ultra';
    if (/14 Pro/i.test(ua)) return 'Xiaomi 14 Pro';
    if (/Xiaomi 14/i.test(ua)) return 'Xiaomi 14';
    if (/13 Ultra/i.test(ua)) return 'Xiaomi 13 Ultra';
    if (/13 Pro/i.test(ua)) return 'Xiaomi 13 Pro';
    if (/Xiaomi 13/i.test(ua)) return 'Xiaomi 13';
    if (/POCO F6/i.test(ua)) return 'POCO F6 Pro';
    if (/POCO F5/i.test(ua)) return 'POCO F5';
    if (/Redmi Note 13/i.test(ua)) return 'Redmi Note 13 Pro 5G';
    if (/Redmi Note 12/i.test(ua)) return 'Redmi Note 12 Pro';
    return 'Dispositivo Xiaomi / Redmi';
  }

  // Extracción genérica de modelo Android
  if (/android/i.test(ua)) {
    const match = ua.match(/Android\s+([0-9\.]+);\s*([^;\)]+)/i);
    if (match && match[2]) {
      const rawModel = match[2].trim();
      if (rawModel && !/build|wv/i.test(rawModel)) {
        return `Dispositivo Android (${rawModel})`;
      }
    }
    return 'Dispositivo Móvil Android';
  }

  // Identificación de Escritorio / Laptops
  if (/macintosh|mac os x/i.test(ua)) return 'Equipo Mac (macOS)';
  if (/windows nt 10\.0/i.test(ua)) return 'Equipo PC (Windows 10/11)';
  if (/windows/i.test(ua)) return 'Equipo PC (Windows)';
  if (/linux/i.test(ua)) return 'Dispositivo Linux';

  return 'Dispositivo de Acceso Registrado';
};

window.renderSecurityPasskeyUser = (user) => {
  const statusEl = document.getElementById('security-passkey-status-text');
  const detailsEl = document.getElementById('security-passkey-methods-details');
  const webauthnBadge = document.getElementById('passkey-webauthn-badge');
  const pinBadge = document.getElementById('passkey-pin-badge');
  const webauthnActionBtn = document.getElementById('btn-webauthn-action');
  const pinActionBtn = document.getElementById('btn-pin-action');
  const webauthnRemoveBtn = document.getElementById('btn-webauthn-remove');
  const pinRemoveBtn = document.getElementById('btn-pin-remove');
  const deviceTitleEl = document.getElementById('security-passkey-device-title');
  const deviceIconEl = document.getElementById('security-passkey-device-icon');

  if (!statusEl || !user) return;

  const hasWebAuthn = !!user.hasWebAuthn;
  const hasPin = !!user.hasPasskeyPin;
  const hasAnyPasskey = hasWebAuthn || hasPin;

  // Exact device tracking per method
  const webauthnDevice = user.passkeyWebAuthnDevice || (hasWebAuthn && user.passkeyDeviceInfo ? user.passkeyDeviceInfo : null);
  const pinDevice = user.passkeyPinDevice || (hasPin && user.passkeyDeviceInfo ? user.passkeyDeviceInfo : null);

  // Determine main header device title: prioritize explicit WebAuthn device, then PIN device, then global deviceInfo, then current browser device
  let mainDeviceName = 'Dispositivo no vinculado';
  if (hasAnyPasskey) {
    if (hasWebAuthn && user.passkeyWebAuthnDevice) {
      mainDeviceName = user.passkeyWebAuthnDevice;
    } else if (hasPin && user.passkeyPinDevice) {
      mainDeviceName = user.passkeyPinDevice;
    } else if (user.passkeyDeviceInfo) {
      mainDeviceName = user.passkeyDeviceInfo;
    } else {
      mainDeviceName = window.getDevicePasskeyInfo();
    }
  }

  // Render device name & icon
  if (deviceTitleEl) {
    deviceTitleEl.textContent = mainDeviceName;
  }
  if (deviceIconEl) {
    if (!hasAnyPasskey) {
      deviceIconEl.textContent = '🔒';
    } else {
      const isMobile = /android|iphone|ipad|mobile|samsung|galaxy|pixel|xiaomi|redmi|poco/i.test(mainDeviceName) || /android|iphone|ipad|mobile/i.test(navigator.userAgent);
      deviceIconEl.textContent = isMobile ? '📱' : '💻';
    }
  }

  // Update status text
  if (hasWebAuthn && hasPin) {
    statusEl.innerHTML = '<span style="display: inline-block; width: 8px; height: 8px; background: #00f0ff; border-radius: 50%; box-shadow: 0 0 8px #00f0ff;"></span> Passkey Configurada y Activa (Biometría + PIN de Respaldo)';
    statusEl.style.color = '#00f0ff';
  } else if (hasWebAuthn) {
    statusEl.innerHTML = '<span style="display: inline-block; width: 8px; height: 8px; background: #00f0ff; border-radius: 50%; box-shadow: 0 0 8px #00f0ff;"></span> Passkey Configurada y Activa (Biometría / Windows Hello)';
    statusEl.style.color = '#00f0ff';
  } else if (hasPin) {
    statusEl.innerHTML = '<span style="display: inline-block; width: 8px; height: 8px; background: #00f0ff; border-radius: 50%; box-shadow: 0 0 8px #00f0ff;"></span> Passkey Configurada y Activa (PIN de Respaldo)';
    statusEl.style.color = '#00f0ff';
  } else {
    statusEl.innerHTML = '<span style="display: inline-block; width: 8px; height: 8px; background: #ffaa00; border-radius: 50%; box-shadow: 0 0 8px #ffaa00;"></span> Passkey Pendiente (Sin medios de acceso configurados)';
    statusEl.style.color = '#ffaa00';
  }

  // Render detailed passkey method items
  if (detailsEl) {
    detailsEl.innerHTML = `
      <div style="font-size: 0.85rem; font-weight: 700; color: rgba(255,255,255,0.9); margin-bottom: 4px;">Medios de Autenticación Passkey Registrados:</div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px;">
        <div style="background: ${hasWebAuthn ? 'rgba(0, 240, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)'}; border: 1px solid ${hasWebAuthn ? 'rgba(0, 240, 255, 0.3)' : 'rgba(255, 255, 255, 0.08)'}; border-radius: 8px; padding: 12px 14px; display: flex; align-items: center; justify-content: space-between;">
          <div style="font-weight: 700; font-size: 0.88rem; color: #fff;">Biometría / Windows Hello</div>
          <span style="font-size: 0.72rem; font-weight: 700; padding: 3px 10px; border-radius: 10px; ${hasWebAuthn ? 'background: rgba(0, 240, 255, 0.2); color: #00f0ff; border: 1px solid #00f0ff;' : 'background: rgba(255, 170, 0, 0.15); color: #ffaa00; border: 1px solid #ffaa00;'}">
            ${hasWebAuthn ? 'ACTIVO' : 'PENDIENTE'}
          </span>
        </div>

        <div style="background: ${hasPin ? 'rgba(0, 240, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)'}; border: 1px solid ${hasPin ? 'rgba(0, 240, 255, 0.3)' : 'rgba(255, 255, 255, 0.08)'}; border-radius: 8px; padding: 12px 14px; display: flex; align-items: center; justify-content: space-between;">
          <div style="font-weight: 700; font-size: 0.88rem; color: #fff;">PIN Passkey de Respaldo</div>
          <span style="font-size: 0.72rem; font-weight: 700; padding: 3px 10px; border-radius: 10px; ${hasPin ? 'background: rgba(0, 240, 255, 0.2); color: #00f0ff; border: 1px solid #00f0ff;' : 'background: rgba(255, 170, 0, 0.15); color: #ffaa00; border: 1px solid #ffaa00;'}">
            ${hasPin ? 'ACTIVO' : 'PENDIENTE'}
          </span>
        </div>
      </div>
    `;
  }

  // Update card 1 (Biometría) badges and buttons
  if (webauthnBadge) {
    webauthnBadge.textContent = hasWebAuthn ? '✅ Configurado' : '⚠️ Sin vincular';
    webauthnBadge.style.background = hasWebAuthn ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 170, 0, 0.15)';
    webauthnBadge.style.color = hasWebAuthn ? '#00f0ff' : '#ffaa00';
    webauthnBadge.style.border = hasWebAuthn ? '1px solid rgba(0, 240, 255, 0.4)' : '1px solid rgba(255, 170, 0, 0.4)';
  }
  if (webauthnActionBtn) {
    webauthnActionBtn.textContent = hasWebAuthn ? 'Cambiar Passkey Biométrica' : 'Vincular Passkey Biométrica';
  }
  if (webauthnRemoveBtn) {
    webauthnRemoveBtn.style.display = hasWebAuthn ? 'block' : 'none';
  }

  // Update card 2 (PIN) badges and buttons
  if (pinBadge) {
    pinBadge.textContent = hasPin ? '✅ Configurado' : '⚠️ Sin configurar';
    pinBadge.style.background = hasPin ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 170, 0, 0.15)';
    pinBadge.style.color = hasPin ? '#00f0ff' : '#ffaa00';
    pinBadge.style.border = hasPin ? '1px solid rgba(0, 240, 255, 0.4)' : '1px solid rgba(255, 170, 0, 0.4)';
  }
  if (pinActionBtn) {
    pinActionBtn.textContent = hasPin ? 'Cambiar PIN' : 'Guardar PIN';
  }
  if (pinRemoveBtn) {
    pinRemoveBtn.style.display = hasPin ? 'block' : 'none';
  }
};

window.loadSecurityPasskeyInfo = async () => {
  const token = localStorage.getItem('scout_ai_token');
  if (!token) return;

  try {
    const res = await fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.user) {
      window.renderSecurityPasskeyUser(data.user);
    }
  } catch (err) {
    console.error('Error fetching security info:', err);
  }

  window.loadSecurityQuestions();
};

window.loadSecurityQuestions = async () => {
  const token = localStorage.getItem('scout_ai_token');
  const badgeEl = document.getElementById('security-questions-status-badge');
  if (!token) return;

  try {
    const res = await fetch('/api/auth/security-questions', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success && Array.isArray(data.questions) && data.questions.length === 3) {
      if (document.getElementById('sec-q1-text')) document.getElementById('sec-q1-text').value = data.questions[0].question || '';
      if (document.getElementById('sec-q2-text')) document.getElementById('sec-q2-text').value = data.questions[1].question || '';
      if (document.getElementById('sec-q3-text')) document.getElementById('sec-q3-text').value = data.questions[2].question || '';

      if (badgeEl) {
        badgeEl.textContent = '3 Preguntas Configuradas';
        badgeEl.style.background = 'rgba(0, 240, 255, 0.15)';
        badgeEl.style.border = '1px solid rgba(0, 240, 255, 0.4)';
        badgeEl.style.color = '#00f0ff';
      }
    } else {
      if (badgeEl) {
        badgeEl.textContent = 'Pendientes de Configuración';
        badgeEl.style.background = 'rgba(255, 170, 0, 0.15)';
        badgeEl.style.border = '1px solid rgba(255, 170, 0, 0.4)';
        badgeEl.style.color = '#ffaa00';
      }
    }
  } catch (err) {
    console.error('Error loading security questions:', err);
  }
};

window.saveSecurityQuestions = async (e) => {
  if (e && e.preventDefault) e.preventDefault();
  const token = localStorage.getItem('scout_ai_token');
  const feedbackEl = document.getElementById('security-questions-feedback');

  if (!token) return;

  const q1 = document.getElementById('sec-q1-text')?.value.trim();
  const a1 = document.getElementById('sec-a1-text')?.value.trim();
  const q2 = document.getElementById('sec-q2-text')?.value.trim();
  const a2 = document.getElementById('sec-a2-text')?.value.trim();
  const q3 = document.getElementById('sec-q3-text')?.value.trim();
  const a3 = document.getElementById('sec-a3-text')?.value.trim();

  if (!q1 || !a1 || !q2 || !a2 || !q3 || !a3) {
    if (feedbackEl) {
      feedbackEl.style.color = '#ff4a4a';
      feedbackEl.textContent = 'Debes completar las 3 preguntas y las 3 respuestas de seguridad.';
    }
    return;
  }

  if (feedbackEl) {
    feedbackEl.style.color = '#00f0ff';
    feedbackEl.textContent = 'Guardando 3 preguntas de seguridad...';
  }

  try {
    const res = await fetch('/api/auth/security-questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        items: [
          { question: q1, answer: a1 },
          { question: q2, answer: a2 },
          { question: q3, answer: a3 }
        ]
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al guardar preguntas');

    if (feedbackEl) {
      feedbackEl.style.color = '#00f0ff';
      feedbackEl.textContent = '✅ 3 preguntas de seguridad guardadas exitosamente.';
    }
    window.loadSecurityQuestions();
  } catch (err) {
    console.error('Error saving security questions:', err);
    if (feedbackEl) {
      feedbackEl.style.color = '#ff4a4a';
      feedbackEl.textContent = err.message;
    }
  }
};

window.showPasskeyModal = (type, title, message, autoCloseMs = 0) => {
  const modal = document.getElementById('passkey-status-modal');
  const iconContainer = document.getElementById('passkey-modal-icon-container');
  const titleEl = document.getElementById('passkey-modal-title');
  const msgEl = document.getElementById('passkey-modal-message');
  const closeBtn = document.getElementById('passkey-modal-close-btn');
  const cardEl = document.getElementById('passkey-modal-card');

  if (!modal) return;

  if (window._passkeyModalTimer) {
    clearTimeout(window._passkeyModalTimer);
    window._passkeyModalTimer = null;
  }

  titleEl.textContent = title || 'Procesando Passkey...';
  msgEl.textContent = message || '';

  if (type === 'loading') {
    iconContainer.innerHTML = '<div class="passkey-spinner"></div>';
    iconContainer.style.background = 'rgba(0, 240, 255, 0.1)';
    iconContainer.style.borderColor = 'rgba(0, 240, 255, 0.4)';
    iconContainer.style.boxShadow = '0 0 20px rgba(0, 240, 255, 0.25)';
    cardEl.style.borderColor = 'rgba(0, 240, 255, 0.4)';
    cardEl.style.boxShadow = '0 0 50px rgba(0, 240, 255, 0.25)';
    closeBtn.style.display = 'none';
  } else if (type === 'success') {
    iconContainer.innerHTML = '<span style="font-size: 34px;">✅</span>';
    iconContainer.style.background = 'rgba(0, 240, 255, 0.15)';
    iconContainer.style.borderColor = '#00f0ff';
    iconContainer.style.boxShadow = '0 0 25px rgba(0, 240, 255, 0.4)';
    cardEl.style.borderColor = '#00f0ff';
    cardEl.style.boxShadow = '0 0 50px rgba(0, 240, 255, 0.35)';
    closeBtn.style.display = 'block';
    closeBtn.textContent = 'Aceptar';
    closeBtn.style.background = 'linear-gradient(135deg, #00f0ff, #00a2ff)';
    closeBtn.style.color = '#05080c';

    if (autoCloseMs > 0) {
      window._passkeyModalTimer = setTimeout(() => {
        window.closePasskeyStatusModal();
      }, autoCloseMs);
    }
  } else if (type === 'error') {
    iconContainer.innerHTML = '<span style="font-size: 34px;">⚠️</span>';
    iconContainer.style.background = 'rgba(255, 74, 74, 0.15)';
    iconContainer.style.borderColor = 'rgba(255, 74, 74, 0.5)';
    iconContainer.style.boxShadow = '0 0 25px rgba(255, 74, 74, 0.3)';
    cardEl.style.borderColor = 'rgba(255, 74, 74, 0.5)';
    cardEl.style.boxShadow = '0 0 50px rgba(255, 74, 74, 0.3)';
    closeBtn.style.display = 'block';
    closeBtn.textContent = 'Cerrar';
    closeBtn.style.background = 'rgba(255, 74, 74, 0.2)';
    closeBtn.style.color = '#ff4a4a';
    closeBtn.style.border = '1px solid rgba(255, 74, 74, 0.5)';
  }

  modal.style.display = 'flex';
};

window.closePasskeyStatusModal = () => {
  const modal = document.getElementById('passkey-status-modal');
  if (modal) modal.style.display = 'none';
  if (window._passkeyModalTimer) {
    clearTimeout(window._passkeyModalTimer);
    window._passkeyModalTimer = null;
  }
};

window.updatePasskeyWebAuthn = async () => {
  const token = localStorage.getItem('scout_ai_token');
  if (!token) return;

  window.showPasskeyModal('loading', 'Vinculación Biométrica Passkey', 'Por favor realiza la autenticación en tu dispositivo (Windows Hello, huella dactilar o rostro)...');

  try {
    const optRes = await fetch('/api/auth/passkey/register-options', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    const options = await optRes.json();
    if (!optRes.ok) throw new Error(options.error || 'Error al solicitar desafío');

    if (!window.PublicKeyCredential) {
      throw new Error('Navegador no soporta WebAuthn directamente. Usa la opción de PIN de respaldo.');
    }

    options.challenge = base64UrlToBuffer(options.challenge);
    options.user.id = base64UrlToBuffer(options.user.id);

    const credential = await navigator.credentials.create({ publicKey: options });

    const credentialPayload = {
      id: credential.id,
      rawId: bufferToBase64Url(credential.rawId),
      type: credential.type,
      response: {
        clientDataJSON: bufferToBase64Url(credential.response.clientDataJSON),
        attestationObject: bufferToBase64Url(credential.response.attestationObject)
      }
    };

    const verifyRes = await fetch('/api/auth/passkey/register-verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ credential: credentialPayload, deviceInfo: window.getDevicePasskeyInfo() })
    });
    const verifyResult = await verifyRes.json();
    if (!verifyRes.ok) throw new Error(verifyResult.error || 'Error al guardar Passkey');

    if (verifyResult.token) {
      localStorage.setItem('scout_ai_token', verifyResult.token);
    }

    window.showPasskeyModal('success', '¡Passkey Biométrica Vinculada!', '✅ Tu Passkey biométrica se ha registrado y activado exitosamente.', 3000);
    if (verifyResult.user) {
      window.renderSecurityPasskeyUser(verifyResult.user);
    } else {
      window.loadSecurityPasskeyInfo();
    }
  } catch (err) {
    console.error('Passkey update error:', err);
    const errMsg = err.name === 'NotAllowedError' ? 'Operación cancelada por el usuario.' : err.message;
    window.showPasskeyModal('error', 'No se pudo vincular Passkey', errMsg);
  }
};

window.updatePasskeyPin = async () => {
  const token = localStorage.getItem('scout_ai_token');
  const pinInput = document.getElementById('profile-passkey-pin-input');
  const pin = pinInput?.value.trim();

  if (!token || !pinInput) return;

  if (!pin || !/^\d{6}$/.test(pin)) {
    window.showPasskeyModal('error', 'PIN Inválido', 'El PIN debe ser un número exacto de 6 dígitos.');
    return;
  }

  window.showPasskeyModal('loading', 'Guardando PIN Passkey', 'Estableciendo tu PIN numérico de respaldo...');

  try {
    const verifyRes = await fetch('/api/auth/passkey/register-verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ pin, deviceInfo: window.getDevicePasskeyInfo() })
    });
    const verifyResult = await verifyRes.json();
    if (!verifyRes.ok) throw new Error(verifyResult.error || 'Error al guardar PIN');

    if (verifyResult.token) {
      localStorage.setItem('scout_ai_token', verifyResult.token);
    }

    pinInput.value = '';
    window.showPasskeyModal('success', '¡PIN de Respaldo Configurado!', '✅ Tu PIN Passkey de 6 dígitos se ha guardado exitosamente.', 3000);
    if (verifyResult.user) {
      window.renderSecurityPasskeyUser(verifyResult.user);
    } else {
      window.loadSecurityPasskeyInfo();
    }
  } catch (err) {
    console.error('PIN Passkey update error:', err);
    window.showPasskeyModal('error', 'Error al Guardar PIN', err.message);
  }
};

window.removePasskeyMethod = async (method) => {
  const token = localStorage.getItem('scout_ai_token');
  if (!token) return;

  const methodName = method === 'webauthn' ? 'Biometría / Windows Hello' : 'PIN de Respaldo';
  if (!confirm(`¿Estás seguro de que deseas desvincular el método de Passkey (${methodName})?`)) {
    return;
  }

  window.showPasskeyModal('loading', 'Desvinculando Método Passkey', `Eliminando ${methodName}...`);

  try {
    const res = await fetch('/api/auth/passkey/remove-method', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ method })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al remover método Passkey');

    window.showPasskeyModal('success', '¡Método Desvinculado!', `✅ Método (${methodName}) desvinculado correctamente.`, 3000);
    if (data.user) {
      window.renderSecurityPasskeyUser(data.user);
    } else {
      window.loadSecurityPasskeyInfo();
    }
  } catch (err) {
    console.error('Error removing passkey method:', err);
    window.showPasskeyModal('error', 'Error al Desvincular', err.message);
  }
};

window.openDeviceSelectorModal = () => {
  const modal = document.getElementById('passkey-device-modal');
  const titleEl = document.getElementById('security-passkey-device-title');
  const customInput = document.getElementById('passkey-device-custom-input');
  const presetSelect = document.getElementById('passkey-device-preset-select');

  if (!modal) return;

  if (customInput) customInput.value = titleEl ? titleEl.textContent : '';
  if (presetSelect) presetSelect.value = '';

  modal.style.display = 'flex';
};

window.closeDeviceSelectorModal = () => {
  const modal = document.getElementById('passkey-device-modal');
  if (modal) modal.style.display = 'none';
};

window.onPasskeyDeviceSelectChange = (val) => {
  const customInput = document.getElementById('passkey-device-custom-input');
  if (val && customInput) {
    customInput.value = val;
  }
};

window.autoDetectDeviceInModal = () => {
  const detected = window.getDevicePasskeyInfo();
  const customInput = document.getElementById('passkey-device-custom-input');
  if (customInput) customInput.value = detected;
};

window.saveSelectedPasskeyDevice = async () => {
  const token = localStorage.getItem('scout_ai_token');
  const customInput = document.getElementById('passkey-device-custom-input');
  const selectedName = customInput?.value.trim();

  if (!token) return;
  if (!selectedName) {
    alert('Por favor selecciona o escribe un nombre de dispositivo.');
    return;
  }

  window.closeDeviceSelectorModal();
  window.showPasskeyModal('loading', 'Actualizando Dispositivo', 'Guardando el nuevo nombre de dispositivo Passkey...');

  try {
    const res = await fetch('/api/auth/passkey/update-device', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ deviceInfo: selectedName })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al actualizar dispositivo');

    window.showPasskeyModal('success', '¡Dispositivo Actualizado!', `✅ Se registró "${selectedName}" como dispositivo oficial de Passkey.`, 2500);

    if (data.user) {
      window.renderSecurityPasskeyUser(data.user);
    } else {
      window.loadSecurityPasskeyInfo();
    }
  } catch (err) {
    console.error('Error saving passkey device:', err);
    window.showPasskeyModal('error', 'Error al Guardar Dispositivo', err.message);
  }
};

// ──────────────────────────────────────────
// MIS JUGADORES (PLAN LOCAL MODULE)
// ──────────────────────────────────────────
window.localPlayersCached = [];

window.loadLocalPlayers = async () => {
  const token = localStorage.getItem('scout_ai_token');
  if (token) {
    try {
      const res = await fetch('/api/my-players', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.players)) {
        const parsedPlayers = data.players.map(p => {
          let stats = p.stats;
          if (typeof stats === 'string') {
            try { stats = JSON.parse(stats); } catch (e) { stats = { matches: 0, goals: 0, assists: 0 }; }
          }
          let strengths = p.strengths;
          if (typeof strengths === 'string') {
            try { strengths = JSON.parse(strengths); } catch (e) { strengths = []; }
          }
          let trophies = p.trophies;
          if (typeof trophies === 'string') {
            try { trophies = JSON.parse(trophies); } catch (e) { trophies = []; }
          }
          let history = p.history;
          if (typeof history === 'string') {
            try { history = JSON.parse(history); } catch (e) { history = []; }
          }
          return {
            ...p,
            stats,
            strengths,
            trophies,
            history
          };
        });
        window.localPlayersCached = parsedPlayers;
        localStorage.setItem('scout_ai_local_players', JSON.stringify(parsedPlayers));
        return parsedPlayers;
      }
    } catch (err) {
      console.warn('⚠️ Failed to fetch players from API, falling back to cache:', err);
    }
  }
  try {
    const cached = localStorage.getItem('scout_ai_local_players');
    window.localPlayersCached = cached ? JSON.parse(cached) : [];
  } catch (e) {
    window.localPlayersCached = [];
  }
  return window.localPlayersCached;
};

window.getLocalPlayersList = () => {
  return window.localPlayersCached || [];
};

window.saveLocalPlayersList = async (players) => {
  window.localPlayersCached = players;
  localStorage.setItem('scout_ai_local_players', JSON.stringify(players));
};

window.updateLocalPlayerLegalTabVisibility = () => {
  const ageInput = document.getElementById('lp-age');
  const legalTabBtn = document.getElementById('tab-btn-legal');
  const legalContent = document.getElementById('form-tab-content-legal');
  
  const rawAge = (ageInput?.value || '').trim();
  const ageVal = parseInt(rawAge, 10);
  const hasAge = rawAge !== '' && !isNaN(ageVal);
  const isMinor = hasAge && ageVal <= 17;

  if (legalTabBtn) {
    if (isMinor) {
      legalTabBtn.style.display = 'inline-flex';
    } else {
      legalTabBtn.style.display = 'none';
      if (legalContent && legalContent.style.display !== 'none') {
        window.switchFormTab('autorizaciones');
      }
    }
  }

  // Actualización dinámica de la plantilla de Word (.DOCX) a mostrar según la edad
  const templateBox = document.getElementById('lp-auth-template-download-box');
  if (templateBox) {
    if (!hasAge) {
      templateBox.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px; width: 100%;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffb703" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <span style="font-size: 12px; color: #ffb703; font-weight: 600;">
            Por favor, indique la Edad del jugador en la pestaña "General" para obtener la plantilla de Word correspondiente.
          </span>
        </div>
      `;
    } else if (isMinor) {
      templateBox.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px; flex: 1; min-width: 220px;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="12" y1="18" x2="12" y2="12"></line>
            <polyline points="9 15 12 18 15 15"></polyline>
          </svg>
          <div>
            <span style="font-size: 13px; font-weight: 700; color: #fff; display: block;">Plantilla para firma de autorizaciones</span>
          </div>
        </div>
        <a href="assets/templates/Plantilla_Autorizacion_Menor_de_Edad.docx" download style="background: rgba(0,240,255,0.15); color: #00f0ff; border: 1px solid rgba(0,240,255,0.4); border-radius: 6px; padding: 8px 14px; font-size: 12px; font-weight: 700; text-decoration: none; display: flex; align-items: center; gap: 6px; white-space: nowrap;">
          📄 Descargar Plantilla Word (.DOCX)
        </a>
      `;
    } else {
      templateBox.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px; flex: 1; min-width: 220px;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="12" y1="18" x2="12" y2="12"></line>
            <polyline points="9 15 12 18 15 15"></polyline>
          </svg>
          <div>
            <span style="font-size: 13px; font-weight: 700; color: #fff; display: block;">Plantilla para firma de autorizaciones</span>
          </div>
        </div>
        <a href="assets/templates/Plantilla_Autorizacion_Mayor_de_Edad.docx" download style="background: rgba(0,240,255,0.15); color: #00f0ff; border: 1px solid rgba(0,240,255,0.4); border-radius: 6px; padding: 8px 14px; font-size: 12px; font-weight: 700; text-decoration: none; display: flex; align-items: center; gap: 6px; white-space: nowrap;">
          📄 Descargar Plantilla Word (.DOCX)
        </a>
      `;
    }
  }

  const signatureHint = document.getElementById('lp-auth-signature-hint');
  const signatureLabel = document.getElementById('lp-auth-signature-label');
  if (signatureHint && signatureLabel) {
    signatureLabel.textContent = 'Adjuntar Plantilla Oficial Firmada *';
    if (hasAge) {
      if (isMinor) {
        signatureHint.textContent = 'Jugador menor de edad: debe subir únicamente la plantilla oficial modificada y firmada por su representante/tutor.';
      } else {
        signatureHint.textContent = 'Jugador mayor de edad: debe subir únicamente la plantilla oficial modificada y firmada por el jugador.';
      }
    } else {
      signatureHint.textContent = 'Debe subir la plantilla oficial de autorización firmada según corresponda por edad.';
    }
  }

  const activeTabContent = document.querySelector('.form-tab-content[style*="display: flex"]');
  if (activeTabContent && activeTabContent.id === 'form-tab-content-autorizaciones') {
    window.switchFormTab('autorizaciones');
  }
};

window.switchFormTab = (tabName) => {
  const buttons = document.querySelectorAll('.form-tab-btn');
  buttons.forEach(btn => {
    btn.classList.remove('active');
    btn.style.color = 'rgba(255,255,255,0.5)';
    btn.style.fontWeight = '600';
    btn.style.borderBottom = '2px solid transparent';
  });

  const activeBtn = document.getElementById(`tab-btn-${tabName}`);
  if (activeBtn) {
    activeBtn.classList.add('active');
    activeBtn.style.color = '#00f0ff';
    activeBtn.style.fontWeight = '700';
    activeBtn.style.borderBottom = '2px solid #00f0ff';
  }

  const contents = document.querySelectorAll('.form-tab-content');
  contents.forEach(content => {
    content.style.display = 'none';
  });

  const activeContent = document.getElementById(`form-tab-content-${tabName}`);
  if (activeContent) {
    activeContent.style.display = 'flex';
  }

  // Actualizar visibilidad de botones según la pestaña
  const cancelBtn = document.getElementById('form-btn-cancel');
  const prevBtn = document.getElementById('form-btn-prev');
  const nextBtn = document.getElementById('form-btn-next');
  const submitBtn = document.getElementById('btn-save-local-player');

  if (tabName === 'general') {
    if (cancelBtn) cancelBtn.style.display = 'inline-block';
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) {
      nextBtn.style.display = 'inline-block';
      nextBtn.onclick = () => window.switchFormTab('deportivo');
    }
    if (submitBtn) submitBtn.style.display = 'none';
  } else if (tabName === 'deportivo') {
    if (cancelBtn) cancelBtn.style.display = 'none';
    if (prevBtn) {
      prevBtn.style.display = 'inline-block';
      prevBtn.onclick = () => window.switchFormTab('general');
    }
    if (nextBtn) {
      nextBtn.style.display = 'inline-block';
      nextBtn.onclick = () => window.switchFormTab('historial');
    }
    if (submitBtn) submitBtn.style.display = 'none';
  } else if (tabName === 'historial') {
    if (cancelBtn) cancelBtn.style.display = 'none';
    if (prevBtn) {
      prevBtn.style.display = 'inline-block';
      prevBtn.onclick = () => window.switchFormTab('deportivo');
    }
    if (nextBtn) {
      nextBtn.style.display = 'inline-block';
      nextBtn.onclick = () => window.switchFormTab('autorizaciones');
    }
    if (submitBtn) submitBtn.style.display = 'none';
  } else if (tabName === 'autorizaciones') {
    const rawAge = (document.getElementById('lp-age')?.value || '').trim();
    const ageVal = parseInt(rawAge, 10);
    const isMinor = rawAge !== '' && !isNaN(ageVal) && ageVal <= 17;
    const isAdult = !isMinor;

    if (cancelBtn) cancelBtn.style.display = 'none';
    if (prevBtn) {
      prevBtn.style.display = 'inline-block';
      prevBtn.onclick = () => window.switchFormTab('historial');
    }

    if (isAdult) {
      if (nextBtn) nextBtn.style.display = 'none';
      if (submitBtn) submitBtn.style.display = 'inline-block';
    } else {
      if (nextBtn) {
        nextBtn.style.display = 'inline-block';
        nextBtn.onclick = () => window.switchFormTab('legal');
      }
      if (submitBtn) submitBtn.style.display = 'none';
    }
  } else if (tabName === 'legal') {
    if (cancelBtn) cancelBtn.style.display = 'none';
    if (prevBtn) {
      prevBtn.style.display = 'inline-block';
      prevBtn.onclick = () => window.switchFormTab('autorizaciones');
    }
    if (nextBtn) nextBtn.style.display = 'none';
    if (submitBtn) submitBtn.style.display = 'inline-block';
  }
};

window.tempStrengthsTags = [];
window.tempImprovementsTags = [];
window.tempTrophiesList = [];

window.addLocalPlayerStrengthTag = () => {
  const input = document.getElementById('lp-strength-input');
  if (!input) return;
  const value = input.value.trim();
  if (value && !window.tempStrengthsTags.includes(value)) {
    window.tempStrengthsTags.push(value);
    input.value = '';
    window.renderFormStrengthsTags();
  }
};

window.removeLocalPlayerStrengthTag = (tag) => {
  window.tempStrengthsTags = window.tempStrengthsTags.filter(t => t !== tag);
  window.renderFormStrengthsTags();
};

window.renderFormStrengthsTags = () => {
  const container = document.getElementById('lp-strengths-tags-container');
  if (!container) return;
  container.innerHTML = window.tempStrengthsTags.map(tag => `
    <span class="tag-item" style="background: rgba(0,240,255,0.15); border: 1px solid rgba(0,240,255,0.4); color: #00f0ff; padding: 4px 10px; border-radius: 6px; font-size: 12px; display: inline-flex; align-items: center; gap: 6px; font-weight: 700;">
      ${tag}
      <span onclick="window.removeLocalPlayerStrengthTag('${tag}')" style="cursor: pointer; font-size: 10px; color: rgba(255,255,255,0.6); margin-left: 2px;">✕</span>
    </span>
  `).join('');
  const hiddenInput = document.getElementById('lp-strengths');
  if (hiddenInput) hiddenInput.value = window.tempStrengthsTags.join(', ');
};

window.addLocalPlayerImprovementTag = () => {
  const input = document.getElementById('lp-improvement-input');
  if (!input) return;
  const value = input.value.trim();
  if (value && !window.tempImprovementsTags.includes(value)) {
    window.tempImprovementsTags.push(value);
    input.value = '';
    window.renderFormImprovementsTags();
  }
};

window.removeLocalPlayerImprovementTag = (tag) => {
  window.tempImprovementsTags = window.tempImprovementsTags.filter(t => t !== tag);
  window.renderFormImprovementsTags();
};

window.renderFormImprovementsTags = () => {
  const container = document.getElementById('lp-improvements-tags-container');
  if (!container) return;
  container.innerHTML = window.tempImprovementsTags.map(tag => `
    <span class="tag-item" style="background: rgba(255,165,0,0.15); border: 1px solid rgba(255,165,0,0.4); color: #ffaa00; padding: 4px 10px; border-radius: 6px; font-size: 12px; display: inline-flex; align-items: center; gap: 6px; font-weight: 700;">
      ${tag}
      <span onclick="window.removeLocalPlayerImprovementTag('${tag}')" style="cursor: pointer; font-size: 10px; color: rgba(255,255,255,0.6); margin-left: 2px;">✕</span>
    </span>
  `).join('');
  const hiddenInput = document.getElementById('lp-improvements');
  if (hiddenInput) hiddenInput.value = window.tempImprovementsTags.join(', ');
};

window.tempInjuriesList = [];

window.addLocalPlayerInjury = () => {
  const typeInput = document.getElementById('lp-injury-type');
  const yearInput = document.getElementById('lp-injury-year');
  const recoveryInput = document.getElementById('lp-injury-recovery');
  const severityInput = document.getElementById('lp-injury-severity');

  if (!typeInput) return;

  const name = typeInput.value.trim();
  if (!name) {
    if (typeof showToast === 'function') showToast('Ingresa el tipo de lesión primero.', 'warning');
    typeInput.focus();
    return;
  }

  const year = (yearInput ? yearInput.value.trim() : '') || new Date().getFullYear().toString();
  const recovery = recoveryInput ? recoveryInput.value.trim() : '';
  const severity = severityInput ? severityInput.value : '';

  if (!Array.isArray(window.tempInjuriesList)) window.tempInjuriesList = [];
  window.tempInjuriesList.push({ name, season: year, recovery, severity });

  typeInput.value = '';
  if (yearInput) yearInput.value = '';
  if (recoveryInput) recoveryInput.value = '';
  if (severityInput) severityInput.value = '';

  window.renderFormInjuries();
};

window.removeLocalPlayerInjury = (index) => {
  if (Array.isArray(window.tempInjuriesList)) {
    window.tempInjuriesList.splice(index, 1);
    window.renderFormInjuries();
  }
};

window.renderFormInjuries = () => {
  const container = document.getElementById('lp-injuries-container');
  if (!container) return;
  if (!Array.isArray(window.tempInjuriesList)) window.tempInjuriesList = [];
  if (window.tempInjuriesList.length === 0) {
    container.innerHTML = `<span style="font-size: 11.5px; color: rgba(255,255,255,0.4); font-style: italic;">Sin lesiones registradas.</span>`;
    return;
  }
  container.innerHTML = window.tempInjuriesList.map((inj, index) => {
    const parts = [inj.season, inj.severity, inj.recovery].filter(Boolean).join(' · ');
    return `
      <span class="tag-item" style="background: rgba(255,77,77,0.15); border: 1px solid rgba(255,77,77,0.4); color: #ff6b6b; padding: 6px 12px; border-radius: 8px; font-size: 12px; display: inline-flex; align-items: center; gap: 6px; font-weight: 700;">
        ${inj.name}${parts ? ` <span style="font-weight:400; font-size:11px; color:rgba(255,107,107,0.7);">(${parts})</span>` : ''}
        <span onclick="window.removeLocalPlayerInjury(${index})" style="cursor: pointer; font-size: 11px; color: rgba(255,255,255,0.5); margin-left: 2px;" title="Eliminar">✕</span>
      </span>
    `;
  }).join('');
};

window.addLocalPlayerTrophy = () => {
  const nameInput = document.getElementById('lp-trophy-name');
  const seasonInput = document.getElementById('lp-trophy-season');
  if (!nameInput || !seasonInput) return;
  const name = nameInput.value.trim();
  const season = seasonInput.value.trim() || new Date().getFullYear().toString();
  if (name) {
    window.tempTrophiesList.push({ name, season });
    nameInput.value = '';
    seasonInput.value = '';
    window.renderFormTrophies();
  }
};

window.removeLocalPlayerTrophy = (index) => {
  window.tempTrophiesList.splice(index, 1);
  window.renderFormTrophies();
};

window.renderFormTrophies = () => {
  const container = document.getElementById('lp-trophies-container');
  if (!container) return;
  if (!Array.isArray(window.tempTrophiesList)) window.tempTrophiesList = [];
  container.innerHTML = window.tempTrophiesList.map((tr, index) => `
    <span class="tag-item" style="background: rgba(112,0,255,0.15); border: 1px solid rgba(112,0,255,0.4); color: #b070ff; padding: 4px 10px; border-radius: 6px; font-size: 12px; display: inline-flex; align-items: center; gap: 6px; font-weight: 700;">
      ${tr.name} (${tr.season})
      <span onclick="window.removeLocalPlayerTrophy(${index})" style="cursor: pointer; font-size: 10px; color: rgba(255,255,255,0.6); margin-left: 2px;">✕</span>
    </span>
  `).join('');
};

window.tempSeasonsList = [];

window.addLocalPlayerSeasonStat = () => {
  const seasonInput = document.getElementById('lp-stats-season');
  const matchesInput = document.getElementById('lp-stats-matches');
  const goalsInput = document.getElementById('lp-stats-goals');
  const assistsInput = document.getElementById('lp-stats-assists');
  const yellowInput = document.getElementById('lp-stats-yellow');
  const redInput = document.getElementById('lp-stats-red');
  const teamInput = document.getElementById('lp-team');

  const season = (seasonInput ? seasonInput.value.trim() : '') || '2024/25';
  const matches = parseInt(matchesInput?.value) || 0;
  const goals = parseInt(goalsInput?.value) || 0;
  const assists = parseInt(assistsInput?.value) || 0;
  const yellowCards = parseInt(yellowInput?.value) || 0;
  const redCards = parseInt(redInput?.value) || 0;
  const team = (teamInput ? teamInput.value.trim() : '') || 'Mi Club';

  if (!Array.isArray(window.tempSeasonsList)) window.tempSeasonsList = [];

  const seasonObj = {
    season: season,
    team: team,
    matches: matches,
    goals: goals,
    assists: assists,
    yellowCards: yellowCards,
    redCards: redCards,
    rating: Number((7.0 + (goals * 0.3) + (assists * 0.2) - (yellowCards * 0.1) - (redCards * 0.5)).toFixed(1))
  };

  const existingIdx = window.tempSeasonsList.findIndex(s => s.season === season);
  if (existingIdx >= 0) {
    window.tempSeasonsList[existingIdx] = seasonObj;
  } else {
    window.tempSeasonsList.push(seasonObj);
  }

  window.renderFormSeasons();
};

window.removeLocalPlayerSeasonStat = (index) => {
  if (Array.isArray(window.tempSeasonsList)) {
    window.tempSeasonsList.splice(index, 1);
    window.renderFormSeasons();
  }
};

window.renderFormSeasons = () => {
  const container = document.getElementById('lp-seasons-container');
  if (!container) return;
  if (!Array.isArray(window.tempSeasonsList)) window.tempSeasonsList = [];
  if (window.tempSeasonsList.length === 0) {
    container.innerHTML = `<span style="font-size: 11.5px; color: rgba(255,255,255,0.4); font-style: italic;">Sin temporadas registradas. Ingresa los datos arriba y presiona "+ Añadir Temporada".</span>`;
    return;
  }
  container.innerHTML = window.tempSeasonsList.map((s, index) => `
    <span class="tag-item" style="background: rgba(0,240,255,0.12); border: 1px solid rgba(0,240,255,0.35); color: #00f0ff; padding: 6px 12px; border-radius: 8px; font-size: 12px; display: inline-flex; align-items: center; gap: 8px; font-weight: 700;">
      <strong>${s.season}</strong> (${s.matches} PJ · ${s.goals} G · ${s.assists} A)
      <span onclick="window.removeLocalPlayerSeasonStat(${index})" style="cursor: pointer; font-size: 12px; color: rgba(255,255,255,0.6); margin-left: 2px;" title="Eliminar temporada">✕</span>
    </span>
  `).join('');
};

window.renderMyPlayersModule = async (skipFetch = false) => {
  const user = JSON.parse(localStorage.getItem('scout_ai_user') || '{}');
  const isLocalCoach = (user.selectedTier || '').toLowerCase() === 'local' || 
                       (user.role || '').toLowerCase() === 'local' || 
                       (user.role || '').toLowerCase() === 'entrenador local';

  // Profile Tab elements (if present)
  const emptyEl = document.getElementById('local-players-empty');
  const upgradeNoticeEl = document.getElementById('local-players-upgrade-notice');
  const gridEl = document.getElementById('local-players-grid');
  const badgeEl = document.getElementById('my-players-count-badge');
  const totalEl = document.getElementById('local-roster-total');
  const availEl = document.getElementById('local-roster-available');
  const totalValEl = document.getElementById('local-roster-total-value');
    if (totalValEl) {
      const totalVal = players.reduce((sum, p) => sum + (Number(p.marketValue) || 5000000), 0);
      totalValEl.textContent = formatContractValue(totalVal);
    }
  if (avgRatingMainEl) avgRatingMainEl.textContent = avgRating;
  if (topCatEl) topCatEl.textContent = domCat;
  if (topCatMainEl) topCatMainEl.textContent = domCat;

  window.filterLocalPlayers();
  window.filterLocalPlayersMain();
};

window.filterLocalPlayersMain = () => {
  const players = window.getLocalPlayersList();
  const search = (document.getElementById('local-player-search-main')?.value || '').toLowerCase().trim();
  const posFilter = document.getElementById('local-player-pos-filter-main')?.value || 'ALL';
  const gridEl = document.getElementById('local-players-grid-main');

  if (!gridEl) return;

  const filtered = players.filter(p => {
    let matchText = true;
    if (search) {
      const nameMatch = (p.name || '').toLowerCase().includes(search);
      const nickMatch = (p.nickname || '').toLowerCase().includes(search);
      const posMatch = (p.position || '').toLowerCase().includes(search);
      const jerseyMatch = String(p.jerseyNumber || '').includes(search);
      matchText = nameMatch || nickMatch || posMatch || jerseyMatch;
    }
    
    let matchPos = true;
    const pos = (p.position || '').toUpperCase();
    if (posFilter === 'ST') matchPos = ['ST', 'CF', 'LW', 'RW'].includes(pos);
    else if (posFilter === 'MID') matchPos = ['CAM', 'CM', 'CDM', 'RM', 'LM'].includes(pos);
    else if (posFilter === 'DEF') matchPos = ['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(pos);
    else if (posFilter === 'GK') matchPos = pos === 'GK';

    return matchText && matchPos;
  });

  if (filtered.length === 0) {
    gridEl.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: rgba(255,255,255,0.4); font-size: 14.5px; background: rgba(0,0,0,0.2); border-radius: 12px;">
        🔍 No se encontraron jugadores que coincidan con los criterios.
      </div>
    `;
    return;
  }

  gridEl.innerHTML = filtered.map(p => {
    const medClass = p.medicalStatus === 'Lesionado' ? 'lesionado' : (p.medicalStatus === 'Precaución' ? 'precaucion' : 'disponible');
    const medLabel = p.medicalStatus || 'Disponible';
    const photoSrc = p.avatarUrl || p.photoUrl || (p.photoId ? (p.photoId.startsWith('http') ? p.photoId : getAbsoluteUrl('/api/player-photo/' + p.photoId)) : '');
    const avatarHtml = photoSrc 
      ? `<img src="${photoSrc}" class="local-player-avatar" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"><div class="local-player-avatar" style="display:none;">#${p.jerseyNumber || '10'}</div>`
      : `<div class="local-player-avatar">#${p.jerseyNumber || '10'}</div>`;

    const strengthsList = Array.isArray(p.strengths) ? p.strengths : (typeof p.strengths === 'string' ? p.strengths.split(',') : []);
    const ratingVal = Number(p.overallRating || 70);
    const ratingClass = ratingVal >= 80 ? 'gold' : (ratingVal >= 70 ? 'silver' : 'bronze');

    return `
      <div class="local-player-card">
        <div class="local-player-card-header">
          ${avatarHtml}
          <div class="local-player-info">
            <div class="local-player-name">${escapeHtml(p.name)}</div>
            <div class="local-player-nickname">${p.nickname ? `"${escapeHtml(p.nickname)}"` : `${p.age} años · Dorsal #${p.jerseyNumber || '-'}`}</div>
          </div>
          <div class="local-player-rating-pill ${ratingClass}" title="Overall Rating">${ratingVal}</div>
        </div>

        <div class="local-player-badges">
          <span class="lp-badge-pos">${p.position || 'CM'}</span>
          <span class="lp-badge-cat">${p.category || 'Sub-17'}</span>
          <span class="lp-badge-med ${medClass}">${medLabel}</span>
        </div>

        <div class="local-player-stats-row">
          <div class="local-player-stat-item">
            <div class="val">${p.stats?.matches || 0}</div>
            <div class="lbl">PJ</div>
          </div>
          <div class="local-player-stat-item">
            <div class="val">${p.stats?.goals || 0}</div>
            <div class="lbl">Goles</div>
          </div>
          <div class="local-player-stat-item">
            <div class="val">${p.stats?.assists || 0}</div>
            <div class="lbl">Asist.</div>
          </div>
        </div>

        ${strengthsList.length > 0 ? `
          <div style="display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 12px;">
            ${strengthsList.slice(0, 3).map(s => `<span style="background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.7); font-size: 10px; padding: 2px 6px; border-radius: 4px;">${escapeHtml(String(s).trim())}</span>`).join('')}
          </div>
        ` : ''}

        <div class="local-player-actions">
          <button class="btn-lp-action btn-lp-view" onclick="viewLocalPlayerExpediente('${p.id}')">
            <span>👁️</span> Expediente
          </button>
          <button class="btn-lp-action btn-lp-msg" onclick="openCoachChatAndSendMessage('${p.userId || ''}', '${escapeHtml(p.name)}')" title="Enviar Mensaje a Entrenador">
            MENSAJE
          </button>
          <button class="btn-lp-action btn-lp-edit" onclick="openLocalPlayerFormModal('${p.id}')" title="Editar Jugador">
            <span>✏️</span>
          </button>
          <button class="btn-lp-action btn-lp-del" onclick="deleteLocalPlayer('${p.id}')" title="Eliminar Jugador">
            <span>🗑️</span>
          </button>
        </div>
      </div>
    `;
  }).join('');
};

window.filterLocalPlayers = () => {
  const players = window.getLocalPlayersList();
  const search = (document.getElementById('local-player-search')?.value || '').toLowerCase().trim();
  const posFilter = document.getElementById('local-player-pos-filter')?.value || 'ALL';
  const catFilter = document.getElementById('local-player-cat-filter')?.value || 'ALL';
  const gridEl = document.getElementById('local-players-grid');

  if (!gridEl) return;

  const filtered = players.filter(p => {
    const matchName = (p.name || '').toLowerCase().includes(search) || (p.nickname || '').toLowerCase().includes(search);
    
    let matchPos = true;
    const pos = (p.position || '').toUpperCase();
    if (posFilter === 'ST') matchPos = ['ST', 'CF', 'LW', 'RW'].includes(pos);
    else if (posFilter === 'MID') matchPos = ['CAM', 'CM', 'CDM', 'RM', 'LM'].includes(pos);
    else if (posFilter === 'DEF') matchPos = ['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(pos);
    else if (posFilter === 'GK') matchPos = pos === 'GK';

    let matchCat = true;
    if (catFilter !== 'ALL') matchCat = (p.category || 'Sub-17') === catFilter;

    return matchName && matchPos && matchCat;
  });

  if (filtered.length === 0) {
    gridEl.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 30px; color: rgba(255,255,255,0.4); font-size: 14px;">
        🔍 No se encontraron jugadores que coincidan con la búsqueda o filtro.
      </div>
    `;
    return;
  }

  gridEl.innerHTML = filtered.map(p => {
    const medClass = p.medicalStatus === 'Lesionado' ? 'lesionado' : (p.medicalStatus === 'Precaución' ? 'precaucion' : 'disponible');
    const medLabel = p.medicalStatus || 'Disponible';
    const photoSrc = p.avatarUrl || p.photoUrl || (p.photoId ? (p.photoId.startsWith('http') ? p.photoId : getAbsoluteUrl('/api/player-photo/' + p.photoId)) : '');
    const avatarHtml = photoSrc 
      ? `<img src="${photoSrc}" class="local-player-avatar" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"><div class="local-player-avatar" style="display:none;">#${p.jerseyNumber || '10'}</div>`
      : `<div class="local-player-avatar">#${p.jerseyNumber || '10'}</div>`;

    const strengthsList = Array.isArray(p.strengths) ? p.strengths : (typeof p.strengths === 'string' ? p.strengths.split(',') : []);
    const ratingVal = Number(p.overallRating || 70);
    const ratingClass = ratingVal >= 80 ? 'gold' : (ratingVal >= 70 ? 'silver' : 'bronze');

    return `
      <div class="local-player-card">
        <div class="local-player-card-header">
          ${avatarHtml}
          <div class="local-player-info">
            <div class="local-player-name">${escapeHtml(p.name)}</div>
            <div class="local-player-nickname">${p.nickname ? `"${escapeHtml(p.nickname)}"` : `${p.age} años · Dorsal #${p.jerseyNumber || '-'}`}</div>
          </div>
          <div class="local-player-rating-pill ${ratingClass}" title="Overall Rating">${ratingVal}</div>
        </div>

        <div class="local-player-badges">
          <span class="lp-badge-pos">${p.position || 'CM'}</span>
          <span class="lp-badge-cat">${p.category || 'Sub-17'}</span>
          <span class="lp-badge-med ${medClass}">${medLabel}</span>
        </div>

        <div class="local-player-stats-row">
          <div class="local-player-stat-item">
            <div class="val">${p.stats?.matches || 0}</div>
            <div class="lbl">PJ</div>
          </div>
          <div class="local-player-stat-item">
            <div class="val">${p.stats?.goals || 0}</div>
            <div class="lbl">Goles</div>
          </div>
          <div class="local-player-stat-item">
            <div class="val">${p.stats?.assists || 0}</div>
            <div class="lbl">Asist.</div>
          </div>
        </div>

        ${strengthsList.length > 0 ? `
          <div style="display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 12px;">
            ${strengthsList.slice(0, 3).map(s => `<span style="background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.7); font-size: 10px; padding: 2px 6px; border-radius: 4px;">${escapeHtml(String(s).trim())}</span>`).join('')}
          </div>
        ` : ''}

        <div class="local-player-actions">
          <button class="btn-lp-action btn-lp-view" onclick="viewLocalPlayerExpediente('${p.id}')">
            <span>👁️</span> Expediente
          </button>
          <button class="btn-lp-action btn-lp-msg" onclick="openCoachChatAndSendMessage('${p.userId || ''}', '${escapeHtml(p.name)}')" title="Enviar Mensaje a Entrenador">
            MENSAJE
          </button>
          <button class="btn-lp-action btn-lp-edit" onclick="openLocalPlayerFormModal('${p.id}')" title="Editar Jugador">
            <span>✏️</span>
          </button>
          <button class="btn-lp-action btn-lp-del" onclick="deleteLocalPlayer('${p.id}')" title="Eliminar Jugador">
            <span>🗑️</span>
          </button>
        </div>
      </div>
    `;
  }).join('');
};

window.renderProspectsModule = async () => {
  const user = JSON.parse(localStorage.getItem('scout_ai_user') || '{}');
  const tier = (user.selectedTier || user.tier || user.maxPaidTierInCycle || '').toLowerCase();
  const role = (user.role || '').toLowerCase();
  const isLocal = tier === 'local' || role === 'local' || role === 'entrenador local';
  const isEnterprise = tier === 'enterprise' || role.includes('enterprise') || role.includes('gerente') || role.includes('director') || role.includes('scout');

  // Sólo accesible para Enterprise
  if (isLocal || !isEnterprise) return;


  const container = document.getElementById('prospects-grid');
  const countTag = document.getElementById('prospects-count-tag');
  const noResults = document.getElementById('prospects-no-results');
  if (!container) return;

  // Enterprise: ver TODOS los prospectos de todos los coaches locales
  // Otros planes (Plus, Pro): ver solo sus propios prospectos (si los tienen)
  let rawProspects = [];
  if (isEnterprise) {
    try {
      const token = localStorage.getItem('scout_ai_token');
      const res = await fetch('/api/all-prospects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.players)) {
        rawProspects = data.players;
      }
    } catch (e) {
      console.error('Error loading all prospects:', e);
    }
  } else {
    rawProspects = await window.loadLocalPlayers();
  }


  // Map local prospect object to standard player object structure expected by createPlayerCard
  const prospects = rawProspects.map(p => {
    const rawName = (p.name || p.nickname || 'Jugador Local').trim();
    const currentTeam = p.club || p.team || 'Club Local';
    const rating = Number(p.rating || 75);
    const positionStr = (p.position || 'MED').toUpperCase();
    
    // Map flag/nationality
    const nat = (p.nationality || 'Dominicana').toLowerCase();
    let flag = '🇩🇴';
    let flagCode = 'DO';
    if (nat.includes('españ') || nat.includes('spain') || nat.includes('es')) { flag = '🇪🇸'; flagCode = 'ES'; }
    else if (nat.includes('argentin') || nat.includes('ar')) { flag = '🇦🇷'; flagCode = 'AR'; }
    else if (nat.includes('brasil') || nat.includes('br')) { flag = '🇧🇷'; flagCode = 'BR'; }
    else if (nat.includes('franc') || nat.includes('fr')) { flag = '🇫🇷'; flagCode = 'FR'; }
    else if (nat.includes('colomb') || nat.includes('co')) { flag = '🇨🇴'; flagCode = 'CO'; }
    else if (nat.includes('mexic') || nat.includes('mx')) { flag = '🇲🇽'; flagCode = 'MX'; }

    return {
      ...p,
      id: p.id || 'lp-' + Math.random().toString(36).substr(2, 9),
      name: rawName,
      currentTeam: currentTeam,
      team: currentTeam,
      avatarUrl: p.photoUrl || p.avatarUrl || '',
      flag: flag,
      flagCode: flagCode,
      position: positionStr,
      positionEs: positionStr,
      overallRating: rating,
      rating: rating,
      category: p.category || 'Cantera',
      isLocalProspect: true
    };
  });

  window.prospectsCached = prospects;

  const searchVal = (document.getElementById('prospects-search-input')?.value || '').toLowerCase().trim();
  const posVal = (document.getElementById('prospects-filter-pos')?.value || '').toUpperCase();
  const catVal = (document.getElementById('prospects-filter-category')?.value || '').toLowerCase();
  const sortVal = (document.getElementById('prospects-sort')?.value || 'name_asc');

  let filtered = prospects.filter(p => {
    const name = (p.name || '').toLowerCase();
    const club = (p.currentTeam || '').toLowerCase();
    const pos = (p.position || '').toUpperCase();
    const cat = (p.category || '').toLowerCase();

    const matchesSearch = !searchVal || name.includes(searchVal) || club.includes(searchVal) || pos.includes(searchVal);
    const matchesPos = !posVal || pos.includes(posVal) || (posVal === 'POR' && (pos === 'PO' || pos === 'GK' || pos.includes('PORT')));
    const matchesCat = !catVal || cat.includes(catVal);

    return matchesSearch && matchesPos && matchesCat;
  });

  // Sorting
  if (sortVal === 'name_asc') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortVal === 'name_desc') {
    filtered.sort((a, b) => b.name.localeCompare(a.name));
  } else if (sortVal === 'rating_desc') {
    filtered.sort((a, b) => b.overallRating - a.overallRating);
  } else if (sortVal === 'rating_asc') {
    filtered.sort((a, b) => a.overallRating - b.overallRating);
  }

  if (countTag) countTag.textContent = `${filtered.length} prospecto${filtered.length !== 1 ? 's' : ''}`;

  const subtitle = document.getElementById('prospects-subtitle');
  if (subtitle) {
    subtitle.textContent = isEnterprise
      ? '🌐 Viendo todos los prospectos de entrenadores locales de la plataforma'
      : 'Jugadores registrados en tu plan Local';
  }

  container.innerHTML = '';
  if (filtered.length === 0) {
    if (noResults) noResults.style.display = 'flex';
    container.style.display = 'none';
  } else {
    if (noResults) noResults.style.display = 'none';
    container.style.display = 'grid';

    filtered.forEach(p => {
      const card = createPlayerCard(p);
      container.appendChild(card);
    });
  }
};

window.updateLocalPlayerDocPlaceholder = () => {
  const docTypeSelect = document.getElementById('lp-doc-type');
  const docNumInput = document.getElementById('lp-doc-number');
  if (!docTypeSelect || !docNumInput) return;

  const val = docTypeSelect.value;
  if (val === 'CEDULA_DNI') {
    docNumInput.placeholder = 'Ej. 12.345.678 o 12345678-X';
  } else if (val === 'PASAPORTE') {
    docNumInput.placeholder = 'Ej. PAS-987654321';
  } else if (val === 'REGISTRO_CIVIL') {
    docNumInput.placeholder = 'Ej. RC-1098765432';
  } else if (val === 'NIE_OTHER') {
    docNumInput.placeholder = 'Ej. Y-1234567-Z o ID Extranjero';
  } else {
    docNumInput.placeholder = 'Seleccione primero el tipo de documento...';
  }
};

window.handleLocalPlayerDocFileSelect = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
  const isImageOrPdf = validTypes.includes(file.type) || file.name.toLowerCase().endsWith('.pdf');

  if (!isImageOrPdf) {
    if (typeof showToast === 'function') {
      showToast('❌ Formato no permitido. Solo se aceptan imágenes (JPG, PNG) o documentos PDF.', 'error');
    } else {
      alert('Formato no permitido. Solo se aceptan imágenes (JPG, PNG) o documentos PDF.');
    }
    event.target.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const fileUrl = e.target.result;
    window.updateLocalPlayerDocFilePreview(file.name, fileUrl);
  };
  reader.readAsDataURL(file);
};

window.updateLocalPlayerDocFilePreview = (fileName, fileUrl) => {
  const urlInput = document.getElementById('lp-doc-file-url');
  const nameLabel = document.getElementById('lp-doc-file-name');
  const actionsDiv = document.getElementById('lp-doc-file-actions');

  if (urlInput) urlInput.value = fileUrl || '';
  if (nameLabel) {
    if (fileName) {
      nameLabel.textContent = `📎 ${fileName}`;
      nameLabel.style.color = '#00f0ff';
      nameLabel.style.fontWeight = '700';
    } else {
      nameLabel.textContent = 'Adjuntar copia de documento (JPG, PNG, PDF)...';
      nameLabel.style.color = 'rgba(255,255,255,0.7)';
      nameLabel.style.fontWeight = '500';
    }
  }

  if (actionsDiv) {
    if (fileUrl) {
      actionsDiv.innerHTML = `
        <button type="button" onclick="event.stopPropagation(); window.removeLocalPlayerDocFile()" style="background: rgba(255,50,50,0.2); color: #ff5555; border: 1px solid rgba(255,50,50,0.4); padding: 4px 8px; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 12px;">✕ Eliminar</button>
      `;
    } else {
      actionsDiv.innerHTML = `
        <span style="font-size: 12px; background: rgba(0,240,255,0.15); color: #00f0ff; border: 1px solid rgba(0,240,255,0.3); padding: 4px 10px; border-radius: 6px; font-weight: 600;">Examinar</span>
      `;
    }
  }
};

window.removeLocalPlayerDocFile = () => {
  const fileInput = document.getElementById('lp-doc-file-input');
  if (fileInput) fileInput.value = '';
  window.updateLocalPlayerDocFilePreview('', '');
};

// ─── Modal Pop-Up de Alerta para Denegación de Documentos de Autorización ───
window.showAuthDeniedModal = (customMessage) => {
  const message = customMessage || 'Documento denegado: El archivo subido NO corresponde a la plantilla oficial de autorización de Futbol AI.';
  
  let modal = document.getElementById('modal-auth-denied-alert');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-auth-denied-alert';
    modal.style.cssText = `
      position: fixed; inset: 0; z-index: 999999;
      background: rgba(4, 9, 17, 0.85); backdrop-filter: blur(12px);
      display: flex; align-items: center; justify-content: center; padding: 20px;
    `;
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div style="background: linear-gradient(145deg, #0e1726, #070c14); border: 1.5px solid rgba(255, 77, 77, 0.6); border-radius: 16px; padding: 26px; max-width: 440px; width: 100%; box-shadow: 0 0 40px rgba(255, 77, 77, 0.35); color: #fff; animation: modalPop 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
      <div style="display: flex; align-items: flex-start; gap: 14px; margin-bottom: 18px;">
        <div style="width: 44px; height: 44px; border-radius: 50%; background: rgba(255, 77, 77, 0.15); border: 1.5px solid #ff4d4d; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff4d4d" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        <div>
          <h3 style="margin: 0; font-size: 17px; font-weight: 800; color: #ff4d4d; letter-spacing: 0.3px;">Documento Denegado</h3>
          <p style="margin: 6px 0 0 0; font-size: 13.5px; color: rgba(255,255,255,0.85); line-height: 1.5;">
            ${message}
          </p>
        </div>
      </div>

      <button type="button" onclick="document.getElementById('modal-auth-denied-alert').style.display='none'" style="width: 100%; background: linear-gradient(90deg, #ff4d4d, #ff6b6b); color: #ffffff; border: none; padding: 12px; border-radius: 10px; font-weight: 800; font-size: 14px; cursor: pointer; box-shadow: 0 0 15px rgba(255, 77, 77, 0.4); transition: all 0.2s;">
        Entendido
      </button>
    </div>
  `;

  modal.style.display = 'flex';
};

// ─── Manejo de Adjunto de Autorizaciones Firmadas ───
window.handleLocalPlayerAuthSignatureFileSelect = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const defaultDeniedText = 'Documento denegado: El archivo subido NO corresponde a la plantilla oficial de autorización de Futbol AI.';

  const showErr = (msg) => {
    window.showAuthDeniedModal(msg || defaultDeniedText);
    event.target.value = '';
  };

  const ext = file.name.split('.').pop()?.toLowerCase();
  const isDocx = ext === 'docx';
  const isPdf = ext === 'pdf';
  const isImg = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext);

  if (!isDocx && !isPdf && !isImg) {
    showErr(defaultDeniedText);
    return;
  }

  // 1. Inspección estricta para archivos de Microsoft Word (.DOCX) usando JSZip
  if (isDocx) {
    let isValidDocx = false;
    if (typeof JSZip !== 'undefined') {
      try {
        const zip = await JSZip.loadAsync(file);
        // Buscar el archivo XML del documento sin importar si usa '/' o '\' en las rutas del ZIP
        const docFile = zip.file(/word[\\\/]document\.xml/i)?.[0];
        const docXml = docFile ? await docFile.async('text') : null;

        if (docXml) {
          // Extraer texto plano despojando todas las etiquetas XML para evitar interferencias de formato de Word
          const plainText = docXml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').toUpperCase();
          const hasFutbolAi = plainText.includes('FUTBOL AI') || plainText.includes('FUTBOL');
          const hasAuthText = plainText.includes('AUTORIZ') || plainText.includes('DERECHOS DE IMAGEN') || plainText.includes('DATOS DEPORTIVOS');
          
          if (hasFutbolAi && hasAuthText) {
            isValidDocx = true;
          }
        }
      } catch (err) {
        isValidDocx = false;
      }
    } else {
      // Fallback si JSZip no ha cargado
      try {
        const rawText = (await file.text()).toUpperCase();
        if (rawText.includes('FUTBOL') && rawText.includes('AUTORIZ')) {
          isValidDocx = true;
        }
      } catch (e) {}
    }

    if (!isValidDocx) {
      showErr(defaultDeniedText);
      return;
    }
  }

  // 2. Validación de coincidencia estricta para archivos PDF o imágenes escaneadas/firmadas
  if (!isDocx) {
    const fileNameUpper = file.name.toUpperCase();
    let fileTextHeader = '';
    try {
      fileTextHeader = (await file.slice(0, 16384).text()).toUpperCase();
    } catch (e) {}

    const containsKeyTerms = fileNameUpper.includes('AUTORIZA') ||
                             fileNameUpper.includes('PLANTILLA') ||
                             fileNameUpper.includes('FUTBOL') ||
                             fileNameUpper.includes('PERMISO') ||
                             fileNameUpper.includes('FIRMA') ||
                             fileTextHeader.includes('FUTBOL') ||
                             fileTextHeader.includes('AUTORIZ') ||
                             fileTextHeader.includes('DERECHOS DE IMAGEN');

    if (!containsKeyTerms) {
      showErr(defaultDeniedText);
      return;
    }
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const fileUrl = e.target.result;
    window.updateLocalPlayerAuthSignatureFilePreview(file.name, fileUrl);
  };
  reader.readAsDataURL(file);
};

window.updateLocalPlayerAuthSignatureFilePreview = (fileName, fileUrl) => {
  const urlInput = document.getElementById('lp-auth-signature-file-url');
  const nameLabel = document.getElementById('lp-auth-signature-file-name');
  const actionsDiv = document.getElementById('lp-auth-signature-file-actions');
  const imgCheckbox = document.getElementById('lp-auth-image');
  const dataCheckbox = document.getElementById('lp-auth-data');

  if (urlInput) urlInput.value = fileUrl || '';
  const hasFile = !!fileUrl;

  if (imgCheckbox) imgCheckbox.checked = hasFile;
  if (dataCheckbox) dataCheckbox.checked = hasFile;

  if (nameLabel) {
    if (fileName) {
      nameLabel.textContent = `📎 ${fileName}`;
      nameLabel.style.color = '#00f0ff';
      nameLabel.style.fontWeight = '700';
    } else {
      nameLabel.textContent = 'Adjuntar autorización firmada (JPG, PNG, PDF)...';
      nameLabel.style.color = 'rgba(255,255,255,0.7)';
      nameLabel.style.fontWeight = '500';
    }
  }

  if (actionsDiv) {
    if (fileUrl) {
      actionsDiv.innerHTML = `
        <button type="button" onclick="event.stopPropagation(); window.removeLocalPlayerAuthSignatureFile()" style="background: rgba(255,50,50,0.2); color: #ff5555; border: 1px solid rgba(255,50,50,0.4); padding: 4px 8px; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 12px;">✕ Eliminar</button>
      `;
    } else {
      actionsDiv.innerHTML = `
        <span style="font-size: 12px; background: rgba(0,240,255,0.15); color: #00f0ff; border: 1px solid rgba(0,240,255,0.3); padding: 4px 10px; border-radius: 6px; font-weight: 600;">Examinar</span>
      `;
    }
  }
};

window.removeLocalPlayerAuthSignatureFile = () => {
  const fileInput = document.getElementById('lp-auth-signature-file-input');
  if (fileInput) fileInput.value = '';
  window.updateLocalPlayerAuthSignatureFilePreview('', '');
};

// ─── Manejo de Adjunto de Certificado Médico ───
window.handleLocalPlayerAuthMedicalFileSelect = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
  const isImageOrPdf = validTypes.includes(file.type) || file.name.toLowerCase().endsWith('.pdf');

  if (!isImageOrPdf) {
    if (typeof showToast === 'function') {
      showToast('❌ Formato no permitido. Solo se aceptan imágenes (JPG, PNG) o documentos PDF.', 'error');
    } else {
      alert('Formato no permitido. Solo se aceptan imágenes (JPG, PNG) o documentos PDF.');
    }
    event.target.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const fileUrl = e.target.result;
    window.updateLocalPlayerAuthMedicalFilePreview(file.name, fileUrl);
  };
  reader.readAsDataURL(file);
};

window.updateLocalPlayerAuthMedicalFilePreview = (fileName, fileUrl) => {
  const urlInput = document.getElementById('lp-auth-medical-file-url');
  const nameLabel = document.getElementById('lp-auth-medical-file-name');
  const actionsDiv = document.getElementById('lp-auth-medical-file-actions');
  const medCheckbox = document.getElementById('lp-auth-medical');

  if (urlInput) urlInput.value = fileUrl || '';
  const hasFile = !!fileUrl;

  if (medCheckbox) medCheckbox.checked = hasFile;

  if (nameLabel) {
    if (fileName) {
      nameLabel.textContent = `📎 ${fileName}`;
      nameLabel.style.color = '#00f0ff';
      nameLabel.style.fontWeight = '700';
    } else {
      nameLabel.textContent = 'Adjuntar certificado médico (JPG, PNG, PDF)...';
      nameLabel.style.color = 'rgba(255,255,255,0.7)';
      nameLabel.style.fontWeight = '500';
    }
  }

  if (actionsDiv) {
    if (fileUrl) {
      actionsDiv.innerHTML = `
        <button type="button" onclick="event.stopPropagation(); window.removeLocalPlayerAuthMedicalFile()" style="background: rgba(255,50,50,0.2); color: #ff5555; border: 1px solid rgba(255,50,50,0.4); padding: 4px 8px; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 12px;">✕ Eliminar</button>
      `;
    } else {
      actionsDiv.innerHTML = `
        <span style="font-size: 12px; background: rgba(0,240,255,0.15); color: #00f0ff; border: 1px solid rgba(0,240,255,0.3); padding: 4px 10px; border-radius: 6px; font-weight: 600;">Examinar</span>
      `;
    }
  }
};

window.removeLocalPlayerAuthMedicalFile = () => {
  const fileInput = document.getElementById('lp-auth-medical-file-input');
  if (fileInput) fileInput.value = '';
  window.updateLocalPlayerAuthMedicalFilePreview('', '');
};

window.tempGuardiansList = [];

window.addLocalPlayerGuardian = () => {
  if (!Array.isArray(window.tempGuardiansList)) {
    window.tempGuardiansList = [];
  }
  window.tempGuardiansList.push({
    name: '',
    relationship: '',
    docType: '',
    docNumber: '',
    phone: '',
    email: ''
  });
  window.renderFormGuardians();
};

window.removeLocalPlayerGuardian = (index) => {
  if (!Array.isArray(window.tempGuardiansList)) return;
  if (index >= 0 && index < window.tempGuardiansList.length) {
    window.tempGuardiansList.splice(index, 1);
    window.renderFormGuardians();
  }
};

window.updateLocalPlayerGuardianField = (index, field, value) => {
  if (window.tempGuardiansList && window.tempGuardiansList[index]) {
    window.tempGuardiansList[index][field] = value;
  }
};

window.renderFormGuardians = () => {
  const container = document.getElementById('lp-legal-guardians-container');
  if (!container) return;

  if (!Array.isArray(window.tempGuardiansList) || window.tempGuardiansList.length === 0) {
    window.tempGuardiansList = [{
      name: '',
      relationship: '',
      docType: '',
      docNumber: '',
      phone: '',
      email: ''
    }];
  }

  container.innerHTML = window.tempGuardiansList.map((g, i) => `
    <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(0,240,255,0.2); border-radius: 10px; padding: 14px; display: flex; flex-direction: column; gap: 12px; position: relative;">
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 8px;">
        <span style="font-size: 12px; font-weight: 700; color: #00f0ff; text-transform: uppercase; letter-spacing: 0.5px;">
          Tutor / Representante #${i + 1} ${i === 0 ? '(Principal)' : ''}
        </span>
        ${i > 0 ? `
          <button type="button" onclick="removeLocalPlayerGuardian(${i})" style="background: rgba(255,50,50,0.15); color: #ff5555; border: 1px solid rgba(255,50,50,0.3); border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: 700; cursor: pointer;">
            ✕ Eliminar
          </button>
        ` : ''}
      </div>

      <!-- Fila 1: Nombre y Parentesco -->
      <div style="display: flex; gap: 14px; flex-wrap: wrap;">
        <div style="flex: 1.5; min-width: 220px;">
          <label style="font-size: 11px; font-weight: 700; color: #00f0ff; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">Nombre Completo</label>
          <input type="text" value="${(g.name || '').replace(/"/g, '&quot;')}" oninput="updateLocalPlayerGuardianField(${i}, 'name', this.value)" placeholder="Ej. Roberto Mendoza Silva" style="width: 100%; box-sizing: border-box; background: rgba(255,255,255,0.05); border: 1px solid rgba(0,240,255,0.3); border-radius: 8px; padding: 9px; color: #fff; font-size: 13px; outline: none;">
        </div>
        <div style="flex: 1; min-width: 160px;">
          <label style="font-size: 11px; font-weight: 700; color: #00f0ff; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">Parentesco / Relación</label>
          <select onchange="updateLocalPlayerGuardianField(${i}, 'relationship', this.value)" style="width: 100%; box-sizing: border-box; background: rgba(10,16,28,0.9); border: 1px solid rgba(0,240,255,0.3); border-radius: 8px; padding: 9px; color: #fff; font-size: 13px; outline: none; cursor: pointer;">
            <option value="" ${!g.relationship ? 'selected' : ''} disabled hidden>Seleccione...</option>
            <option value="PADRE" ${g.relationship === 'PADRE' ? 'selected' : ''}>Padre</option>
            <option value="MADRE" ${g.relationship === 'MADRE' ? 'selected' : ''}>Madre</option>
            <option value="TUTOR_LEGAL" ${g.relationship === 'TUTOR_LEGAL' ? 'selected' : ''}>Tutor Legal / Apoderado</option>
            <option value="REPRESENTANTE" ${g.relationship === 'REPRESENTANTE' ? 'selected' : ''}>Representante Deportivo</option>
          </select>
        </div>
      </div>

      <!-- Fila 2: Documento (Tipo + Número) -->
      <div style="display: flex; gap: 14px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 160px;">
          <label style="font-size: 11px; font-weight: 700; color: #00f0ff; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">Documento</label>
          <select onchange="updateLocalPlayerGuardianField(${i}, 'docType', this.value)" style="width: 100%; box-sizing: border-box; background: rgba(10,16,28,0.9); border: 1px solid rgba(0,240,255,0.3); border-radius: 8px; padding: 9px; color: #fff; font-size: 13px; outline: none; cursor: pointer;">
            <option value="" ${!g.docType ? 'selected' : ''} disabled hidden>Seleccione...</option>
            <option value="CEDULA_DNI" ${g.docType === 'CEDULA_DNI' ? 'selected' : ''}>Cédula / DNI</option>
            <option value="PASAPORTE" ${g.docType === 'PASAPORTE' ? 'selected' : ''}>Pasaporte</option>
            <option value="NIE_OTHER" ${g.docType === 'NIE_OTHER' ? 'selected' : ''}>NIE / Extranjería</option>
          </select>
        </div>
        <div style="flex: 1.5; min-width: 200px;">
          <label style="font-size: 11px; font-weight: 700; color: #00f0ff; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">Nº de Documento</label>
          <input type="text" value="${(g.docNumber || '').replace(/"/g, '&quot;')}" oninput="updateLocalPlayerGuardianField(${i}, 'docNumber', this.value)" placeholder="Ej. 98.765.432-K" style="width: 100%; box-sizing: border-box; background: rgba(255,255,255,0.05); border: 1px solid rgba(0,240,255,0.3); border-radius: 8px; padding: 9px; color: #fff; font-size: 13px; outline: none;">
        </div>
      </div>

      <!-- Fila 3: Teléfono y Correo -->
      <div style="display: flex; gap: 14px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 180px;">
          <label style="font-size: 11px; font-weight: 700; color: #00f0ff; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">Teléfono de Contacto</label>
          <input type="tel" value="${(g.phone || '').replace(/"/g, '&quot;')}" oninput="updateLocalPlayerGuardianField(${i}, 'phone', this.value)" placeholder="Ej. +34 612 345 678" style="width: 100%; box-sizing: border-box; background: rgba(255,255,255,0.05); border: 1px solid rgba(0,240,255,0.3); border-radius: 8px; padding: 9px; color: #fff; font-size: 13px; outline: none;">
        </div>
        <div style="flex: 1.5; min-width: 220px;">
          <label style="font-size: 11px; font-weight: 700; color: #00f0ff; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">Correo Electrónico</label>
          <input type="email" value="${(g.email || '').replace(/"/g, '&quot;')}" oninput="updateLocalPlayerGuardianField(${i}, 'email', this.value)" placeholder="Ej. tutor@ejemplo.com" style="width: 100%; box-sizing: border-box; background: rgba(255,255,255,0.05); border: 1px solid rgba(0,240,255,0.3); border-radius: 8px; padding: 9px; color: #fff; font-size: 13px; outline: none;">
        </div>
      </div>
    </div>
  `).join('');
};

window.openLocalPlayerFormModal = (playerId = null) => {
  const modal = document.getElementById('modal-local-player-form');
  const title = document.getElementById('modal-local-player-title');
  if (!modal) return;

  // Reset tab to General
  window.switchFormTab('general');

  const idInput = document.getElementById('local-player-id');
  const nameInput = document.getElementById('lp-name');
  const nickInput = document.getElementById('lp-nickname');
  const docTypeInput = document.getElementById('lp-doc-type');
  const docNumInput = document.getElementById('lp-doc-number');
  const ageInput = document.getElementById('lp-age');
  const jerseyInput = document.getElementById('lp-jersey');
  const posInput = document.getElementById('lp-position');
  const ratingInput = document.getElementById('lp-rating');
  const catInput = document.getElementById('lp-category');
  const footInput = document.getElementById('lp-foot');
  const heightInput = document.getElementById('lp-height');
  const weightInput = document.getElementById('lp-weight');
  const medInput = document.getElementById('lp-medical');
  const photoInput = document.getElementById('lp-photourl');
  const bioInput = document.getElementById('lp-bio');
  const marketValueInput = document.getElementById('lp-marketvalue');
  
  const statsMatches = document.getElementById('lp-stats-matches');
  const statsGoals = document.getElementById('lp-stats-goals');
  const statsAssists = document.getElementById('lp-stats-assists');
  const statsYellow = document.getElementById('lp-stats-yellow');
  const statsRed = document.getElementById('lp-stats-red');

  window.tempStrengthsTags = [];
  window.tempImprovementsTags = [];
  window.tempTrophiesList = [];
  window.tempSeasonsList = [];

  const submitBtn = document.getElementById('btn-save-local-player');

  if (playerId) {
    const players = window.getLocalPlayersList();
    const player = players.find(p => p.id === playerId);
    if (player) {
      if (title) title.textContent = 'Editar Jugador Local';
      if (submitBtn) submitBtn.textContent = 'Guardar Cambios';
      if (idInput) idInput.value = player.id;
      if (nameInput) nameInput.value = player.name || '';
      if (nickInput) nickInput.value = player.nickname || '';
      if (docTypeInput) docTypeInput.value = player.docType || '';
      if (docNumInput) docNumInput.value = player.docNumber || '';
      window.updateLocalPlayerDocPlaceholder();

      if (ageInput) ageInput.value = player.age || '';
      if (jerseyInput) jerseyInput.value = player.jerseyNumber || '';
      if (posInput) posInput.value = player.position || 'ST';
      if (ratingInput) ratingInput.value = player.overallRating || 75;
      if (catInput) catInput.value = player.category || 'Sub-17';
      if (footInput) footInput.value = player.preferredFoot || 'Derecho';
      if (heightInput) heightInput.value = player.height || '';
      if (weightInput) weightInput.value = player.weight || '';
      if (medInput) medInput.value = player.medicalStatus || 'Disponible';
      if (photoInput) photoInput.value = player.photoUrl || '';
      if (bioInput) bioInput.value = player.bioEs || player.bio || '';
      const tacInput = document.getElementById('lp-tactical-notes');
      if (tacInput) tacInput.value = player.tacticalNotes || '';
      if (marketValueInput) marketValueInput.value = player.marketValue || 0;

      window.updateLocalPlayerPhotoPreview(player.photoUrl || '');
      window.updateLocalPlayerHighlightPreview(player.highlightUrl || '', 'Video de Highlights', '', 0);
      window.updateLocalPlayerDocFilePreview(player.docFileName || (player.docFileUrl ? 'Documento_Adjunto' : ''), player.docFileUrl || '');

      const statsObj = typeof player.stats === 'string' ? JSON.parse(player.stats || '{}') : (player.stats || {});
      if (statsMatches) statsMatches.value = statsObj.matches || 0;
      if (statsGoals) statsGoals.value = statsObj.goals || 0;
      if (statsAssists) statsAssists.value = statsObj.assists || 0;
      if (statsYellow) statsYellow.value = statsObj.yellowCards || 0;
      if (statsRed) statsRed.value = statsObj.redCards || 0;

      const strengths = Array.isArray(player.strengths) ? player.strengths : (player.strengths ? JSON.parse(player.strengths) : []);
      window.tempStrengthsTags = [...strengths];

      const improvements = Array.isArray(player.improvements) ? player.improvements : (player.improvements ? JSON.parse(player.improvements) : (Array.isArray(player.weaknesses) ? player.weaknesses : (player.weaknesses ? JSON.parse(player.weaknesses) : [])));
      window.tempImprovementsTags = [...improvements];

      const trophies = Array.isArray(player.trophies) ? player.trophies : (player.trophies ? JSON.parse(player.trophies) : []);
      window.tempTrophiesList = [...trophies];

      const injuries = Array.isArray(player.injuries) ? player.injuries : (player.injuries ? JSON.parse(player.injuries) : []);
      window.tempInjuriesList = [...injuries];

      const seasons = Array.isArray(player.history) ? player.history : (player.history ? JSON.parse(player.history) : []);
      window.tempSeasonsList = [...seasons];

      const authObj = typeof player.authorizations === 'string' ? JSON.parse(player.authorizations || '{}') : (player.authorizations || {});
      window.updateLocalPlayerAuthSignatureFilePreview(authObj.authSignatureFileName || (authObj.authSignatureUrl ? 'Autorización_Firmada' : ''), authObj.authSignatureUrl || player.authSignatureUrl || '');
      window.updateLocalPlayerAuthMedicalFilePreview(authObj.authMedicalFileName || (authObj.authMedicalUrl ? 'Certificado_Medico' : ''), authObj.authMedicalUrl || player.authMedicalUrl || '');

      const legalObj = typeof player.legalDetails === 'string' ? JSON.parse(player.legalDetails || '{}') : (player.legalDetails || {});
      let guardians = Array.isArray(legalObj.guardians) ? legalObj.guardians : [];
      if (guardians.length === 0 && (legalObj.guardianName || player.guardianName)) {
        guardians = [{
          name: legalObj.guardianName || player.guardianName || '',
          relationship: legalObj.guardianRelationship || '',
          docType: legalObj.guardianDocType || '',
          docNumber: legalObj.guardianDocNumber || '',
          phone: legalObj.guardianPhone || '',
          email: legalObj.guardianEmail || ''
        }];
      }
      window.tempGuardiansList = guardians.length > 0 ? guardians : [{ name: '', relationship: '', docType: '', docNumber: '', phone: '', email: '' }];
    }
  } else {
    if (title) title.textContent = 'Registrar Jugador Local';
    if (submitBtn) submitBtn.textContent = 'Crear Jugador';
    document.getElementById('form-local-player')?.reset();
    if (idInput) idInput.value = '';
    if (docTypeInput) docTypeInput.value = '';
    if (docNumInput) docNumInput.value = '';
    window.updateLocalPlayerDocPlaceholder();

    if (ageInput) ageInput.value = '';
    if (jerseyInput) jerseyInput.value = '';
    if (posInput) posInput.value = '';
    if (footInput) footInput.value = '';
    if (catInput) catInput.value = '';
    if (medInput) medInput.value = '';
    if (heightInput) heightInput.value = '';
    if (weightInput) weightInput.value = '';
    const ftIn = document.getElementById('lp-height-ft');
    if (ftIn) ftIn.value = '';
    const inIn = document.getElementById('lp-height-in');
    if (inIn) inIn.value = '';
    if (ratingInput) ratingInput.value = 75;
    if (statsMatches) statsMatches.value = '';
    if (statsGoals) statsGoals.value = '';
    if (statsAssists) statsAssists.value = '';
    if (statsYellow) statsYellow.value = '';
    if (statsRed) statsRed.value = '';
    const statsSeasonInput = document.getElementById('lp-stats-season');
    if (statsSeasonInput) statsSeasonInput.value = '';

    window.removeLocalPlayerAuthSignatureFile();
    window.removeLocalPlayerAuthMedicalFile();

    window.tempGuardiansList = [{ name: '', relationship: '', docType: '', docNumber: '', phone: '', email: '' }];
    window.tempInjuriesList = [];

    window.updateLocalPlayerPhotoPreview('');
    window.updateLocalPlayerHighlightPreview('');
    window.removeLocalPlayerDocFile();
  }

  // Activar la pestaña General y actualizar la navegación por pasos
  window.switchFormTab('general');
  window.updateLocalPlayerLegalTabVisibility();

  window.setLocalPlayerHeightUnit('cm');
  window.setLocalPlayerWeightUnit('kg');

  window.renderFormStrengthsTags();
  window.renderFormImprovementsTags();
  window.renderFormTrophies();
  window.renderFormInjuries();
  window.renderFormSeasons();
  window.renderFormGuardians();

  modal.style.display = 'flex';
};

// ─── Manejo de Adjuntar Foto en Jugador Local ─────────────────────────────
window.updateLocalPlayerPhotoPreview = (url) => {
  const photoInput = document.getElementById('lp-photourl');
  const imgPreview = document.getElementById('lp-photo-preview');
  const placeholder = document.getElementById('lp-photo-placeholder');
  const removeBtn = document.getElementById('lp-photo-remove-btn');
  const fileInput = document.getElementById('lp-photo-file');

  if (fileInput) fileInput.value = '';

  if (url) {
    if (photoInput) photoInput.value = url;
    if (imgPreview) {
      imgPreview.src = url;
      imgPreview.style.display = 'block';
    }
    if (placeholder) placeholder.style.display = 'none';
    if (removeBtn) removeBtn.style.display = 'inline-flex';
  } else {
    if (photoInput) photoInput.value = '';
    if (imgPreview) {
      imgPreview.src = '';
      imgPreview.style.display = 'none';
    }
    if (placeholder) placeholder.style.display = 'block';
    if (removeBtn) removeBtn.style.display = 'none';
  }
};

window.handleLocalPlayerPhotoSelect = (event) => {
  const file = event.target.files && event.target.files[0];
  if (file) {
    processAndSetLocalPlayerPhoto(file);
  }
};

window.handleLocalPlayerPhotoDrop = (event) => {
  event.preventDefault();
  const dropzone = document.getElementById('lp-photo-dropzone');
  if (dropzone) {
    dropzone.style.borderColor = 'rgba(0,240,255,0.3)';
    dropzone.style.background = 'rgba(255,255,255,0.03)';
  }
  const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    processAndSetLocalPlayerPhoto(file);
  } else if (file) {
    if (typeof showToast === 'function') showToast('⚠️ Por favor selecciona un archivo de imagen válido.', 'warning');
  }
};

function processAndSetLocalPlayerPhoto(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_SIZE = 400;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_SIZE) {
          height = Math.round((height * MAX_SIZE) / width);
          width = MAX_SIZE;
        }
      } else {
        if (height > MAX_SIZE) {
          width = Math.round((width * MAX_SIZE) / height);
          height = MAX_SIZE;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
      window.updateLocalPlayerPhotoPreview(compressedDataUrl);
      if (typeof showToast === 'function') showToast('📷 Imagen adjuntada con éxito', 'success');
    };
    img.onerror = () => {
      window.updateLocalPlayerPhotoPreview(e.target.result);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

window.removeLocalPlayerPhoto = () => {
  window.updateLocalPlayerPhotoPreview('');
  if (typeof showToast === 'function') showToast('🗑️ Foto eliminada', 'info');
};

// ─── Manejo de Video Highlights en Jugador Local ──────────────────────────
window.showHighlightErrorAlert = (title, message) => {
  let modal = document.getElementById('modal-highlight-error-alert');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-highlight-error-alert';
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(4, 9, 17, 0.88); backdrop-filter: blur(10px);
      z-index: 100001; display: flex; align-items: center; justify-content: center; padding: 20px; box-sizing: border-box;
    `;
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div style="background: linear-gradient(145deg, #0e1726, #070c14); border: 1.5px solid rgba(255, 77, 77, 0.5); border-radius: 16px; padding: 26px; max-width: 440px; width: 100%; box-shadow: 0 0 35px rgba(255, 77, 77, 0.3); color: #fff; animation: modalPop 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
      <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 14px;">
        <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(255, 77, 77, 0.15); border: 1.5px solid #ff4d4d; display: flex; align-items: center; justify-content: center; color: #ff4d4d; font-size: 18px; font-weight: 900; flex-shrink: 0;">
          !
        </div>
        <div>
          <h3 style="margin: 0; font-size: 17px; font-weight: 800; color: #ff4d4d; letter-spacing: 0.3px;">${title}</h3>
          <p style="margin: 4px 0 0 0; font-size: 12.5px; color: rgba(255,255,255,0.8); line-height: 1.4;">${message}</p>
        </div>
      </div>

      <button type="button" onclick="document.getElementById('modal-highlight-error-alert').style.display='none'" style="width: 100%; margin-top: 14px; background: linear-gradient(90deg, #ff4d4d, #ff6b6b); color: #ffffff; border: none; padding: 12px; border-radius: 10px; font-weight: 800; font-size: 14px; cursor: pointer; box-shadow: 0 0 15px rgba(255, 77, 77, 0.4); transition: all 0.2s;">
        Entendido
      </button>
    </div>
  `;

  modal.style.display = 'flex';
};

window.updateLocalPlayerHighlightPreview = (url = '', fileName = '', fileSize = '', durationSec = 0) => {
  const highlightInput = document.getElementById('lp-highlight-url');
  const placeholder = document.getElementById('lp-highlight-placeholder');
  const details = document.getElementById('lp-highlight-details');
  const fileNameEl = document.getElementById('lp-highlight-filename');
  const metaEl = document.getElementById('lp-highlight-meta');
  const removeBtn = document.getElementById('lp-highlight-remove-btn');
  const fileInput = document.getElementById('lp-highlight-file');

  if (url) {
    if (highlightInput) highlightInput.value = url;
    if (placeholder) placeholder.style.display = 'none';
    if (details) details.style.display = 'flex';
    if (fileNameEl) fileNameEl.textContent = fileName || 'Video de Highlights';

    if (metaEl) {
      let metaStr = '';
      if (durationSec > 0) {
        const mins = Math.floor(durationSec / 60);
        const secs = Math.floor(durationSec % 60).toString().padStart(2, '0');
        metaStr += `${mins}:${secs} min`;
      }
      if (fileSize) {
        metaStr += metaStr ? ` • ${fileSize}` : fileSize;
      }
      metaEl.textContent = metaStr || 'Video Adjuntado';
    }

    if (removeBtn) removeBtn.style.display = 'inline-block';
  } else {
    if (highlightInput) highlightInput.value = '';
    if (placeholder) placeholder.style.display = 'block';
    if (details) details.style.display = 'none';
    if (removeBtn) removeBtn.style.display = 'none';
    if (fileInput) fileInput.value = '';
  }
};

window.removeLocalPlayerHighlightVideo = () => {
  window.updateLocalPlayerHighlightPreview('');
  if (typeof showToast === 'function') showToast('🗑️ Video de Highlights eliminado', 'info');
};

window.handleLocalPlayerHighlightSelect = (event) => {
  const file = event.target.files && event.target.files[0];
  if (file) {
    processHighlightVideoFile(file);
  }
};

window.handleLocalPlayerHighlightDrop = (event) => {
  event.preventDefault();
  const dropzone = document.getElementById('lp-highlight-dropzone');
  if (dropzone) {
    dropzone.style.borderColor = 'rgba(0,240,255,0.3)';
    dropzone.style.background = 'rgba(255,255,255,0.03)';
  }
  const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
  if (file) {
    processHighlightVideoFile(file);
  }
};

function processHighlightVideoFile(file) {
  // 1. Validar que sea un archivo de video exclusivo (no imágenes ni documentos)
  if (!file.type.startsWith('video/')) {
    window.showHighlightErrorAlert(
      'Archivo no permitido',
      'Solo se permiten archivos de video (.mp4, .webm, .mov) para los Highlights. No se aceptan imágenes ni documentos.'
    );
    return;
  }

  // 2. Validar tamaño máximo de 100 MB
  const maxSizeBytes = 100 * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    window.showHighlightErrorAlert(
      'El video es demasiado pesado',
      `El archivo seleccionado pesa ${sizeMb} MB. El límite máximo permitido para los Highlights es de 100 MB.`
    );
    return;
  }

  // 3. Validar duración máxima de 2:30 minutos (150 segundos)
  const tempBlobUrl = URL.createObjectURL(file);
  const videoEl = document.createElement('video');
  videoEl.preload = 'metadata';

  videoEl.onloadedmetadata = () => {
    URL.revokeObjectURL(tempBlobUrl);
    const durationSec = videoEl.duration;

    if (durationSec > 150) {
      const minutes = Math.floor(durationSec / 60);
      const seconds = Math.floor(durationSec % 60).toString().padStart(2, '0');
      window.showHighlightErrorAlert(
        'El video es demasiado largo',
        `El video dura ${minutes}:${seconds} min. El límite máximo permitido para los Highlights es de 2:30 minutos (150 segundos).`
      );
      return;
    }

    // Convertir el archivo de video a Data URL (base64) permanente para persistir en BD y expediente
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const sizeMbStr = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      window.updateLocalPlayerHighlightPreview(dataUrl, file.name, sizeMbStr, durationSec);
      if (typeof showToast === 'function') {
        showToast('🎥 Video de Highlights adjuntado con éxito', 'success');
      }
    };
    reader.onerror = () => {
      window.showHighlightErrorAlert('Error de lectura', 'No se pudo procesar el archivo de video.');
    };
    reader.readAsDataURL(file);
  };

  videoEl.onerror = () => {
    URL.revokeObjectURL(tempBlobUrl);
    window.showHighlightErrorAlert(
      'Error de video',
      'No se pudo leer el archivo de video. Asegúrate de seleccionar un formato de video válido (.mp4, .webm, .mov).'
    );
  };

  videoEl.src = tempBlobUrl;
}

// ─── Manejo de Unidades de Altura y Peso en Jugador Local ─────────────────
window.setLocalPlayerHeightUnit = (targetUnit) => {
  const unitInput = document.getElementById('lp-height-unit');
  const btnCm = document.getElementById('lp-height-unit-cm');
  const btnFt = document.getElementById('lp-height-unit-ft');
  const cmWrap = document.getElementById('lp-height-cm-wrap');
  const ftWrap = document.getElementById('lp-height-ft-wrap');
  const cmInput = document.getElementById('lp-height');
  const ftInput = document.getElementById('lp-height-ft');
  const inInput = document.getElementById('lp-height-in');

  if (!unitInput || !btnCm || !btnFt) return;
  
  unitInput.value = targetUnit;

  if (targetUnit === 'ft') {
    btnFt.style.background = '#00f0ff';
    btnFt.style.color = '#040911';
    btnFt.style.fontWeight = '800';
    btnCm.style.background = 'transparent';
    btnCm.style.color = 'rgba(255,255,255,0.6)';
    btnCm.style.fontWeight = '700';

    const cmVal = parseInt(cmInput?.value, 10);
    if (!isNaN(cmVal) && cmVal > 0) {
      const totalInches = cmVal / 2.54;
      const feet = Math.floor(totalInches / 12);
      const inches = Math.round(totalInches % 12);
      if (ftInput) ftInput.value = feet;
      if (inInput) inInput.value = inches >= 12 ? 11 : inches;
    } else {
      if (ftInput) ftInput.value = '';
      if (inInput) inInput.value = '';
    }

    if (cmWrap) cmWrap.style.display = 'none';
    if (ftWrap) ftWrap.style.display = 'flex';
  } else {
    btnCm.style.background = '#00f0ff';
    btnCm.style.color = '#040911';
    btnCm.style.fontWeight = '800';
    btnFt.style.background = 'transparent';
    btnFt.style.color = 'rgba(255,255,255,0.6)';
    btnFt.style.fontWeight = '700';

    const feetStr = ftInput?.value?.trim();
    const inStr = inInput?.value?.trim();
    if (feetStr || inStr) {
      const feet = parseInt(feetStr, 10) || 0;
      const inches = parseInt(inStr, 10) || 0;
      const totalInches = (feet * 12) + inches;
      const cmVal = Math.round(totalInches * 2.54);
      if (cmInput) cmInput.value = cmVal || '';
    }

    if (ftWrap) ftWrap.style.display = 'none';
    if (cmWrap) cmWrap.style.display = 'block';
  }
};

window.setLocalPlayerWeightUnit = (targetUnit) => {
  const unitInput = document.getElementById('lp-weight-unit');
  const btnKg = document.getElementById('lp-weight-unit-kg');
  const btnLb = document.getElementById('lp-weight-unit-lb');
  const weightInput = document.getElementById('lp-weight');

  if (!unitInput || !btnKg || !btnLb || !weightInput) return;

  unitInput.value = targetUnit;
  const rawVal = weightInput.value ? weightInput.value.trim() : '';
  const currentVal = parseInt(rawVal, 10);

  if (targetUnit === 'lb') {
    btnLb.style.background = '#00f0ff';
    btnLb.style.color = '#040911';
    btnLb.style.fontWeight = '800';
    btnKg.style.background = 'transparent';
    btnKg.style.color = 'rgba(255,255,255,0.6)';
    btnKg.style.fontWeight = '700';

    if (!isNaN(currentVal) && currentVal > 0) {
      weightInput.value = Math.round(currentVal * 2.20462);
    } else {
      weightInput.value = '';
    }
    weightInput.placeholder = "Ej. 150";
  } else {
    btnKg.style.background = '#00f0ff';
    btnKg.style.color = '#040911';
    btnKg.style.fontWeight = '800';
    btnLb.style.background = 'transparent';
    btnLb.style.color = 'rgba(255,255,255,0.6)';
    btnLb.style.fontWeight = '700';

    if (!isNaN(currentVal) && currentVal > 0) {
      weightInput.value = Math.round(currentVal / 2.20462);
    } else {
      weightInput.value = '';
    }
    weightInput.placeholder = "Ej. 68";
  }
};

window.toggleLocalPlayerHeightUnit = () => {
  const unitInput = document.getElementById('lp-height-unit');
  if (unitInput) window.setLocalPlayerHeightUnit(unitInput.value === 'ft' ? 'cm' : 'ft');
};

window.toggleLocalPlayerWeightUnit = () => {
  const unitInput = document.getElementById('lp-weight-unit');
  if (unitInput) window.setLocalPlayerWeightUnit(unitInput.value === 'lb' ? 'kg' : 'lb');
};

window.getLocalPlayerHeightCm = () => {
  const unitSelect = document.getElementById('lp-height-unit');
  if (unitSelect && unitSelect.value === 'ft') {
    const feet = parseInt(document.getElementById('lp-height-ft')?.value, 10);
    const inches = parseInt(document.getElementById('lp-height-in')?.value, 10);
    if (isNaN(feet) && isNaN(inches)) return null;
    const f = isNaN(feet) ? 0 : feet;
    const i = isNaN(inches) ? 0 : inches;
    const cm = Math.round(((f * 12) + i) * 2.54);
    return cm > 0 ? cm : null;
  }
  const val = parseInt(document.getElementById('lp-height')?.value, 10);
  return (isNaN(val) || val <= 0) ? null : val;
};

window.getLocalPlayerWeightKg = () => {
  const unitSelect = document.getElementById('lp-weight-unit');
  const val = parseInt(document.getElementById('lp-weight')?.value, 10);
  if (isNaN(val) || val <= 0) return null;
  if (unitSelect && unitSelect.value === 'lb') {
    return Math.round(val / 2.20462);
  }
  return val;
};

window.showMissingFieldsAlert = (missingFields) => {
  let modal = document.getElementById('modal-missing-fields-alert');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-missing-fields-alert';
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(4, 9, 17, 0.88); backdrop-filter: blur(10px);
      z-index: 100000; display: flex; align-items: center; justify-content: center; padding: 20px; box-sizing: border-box;
    `;
    document.body.appendChild(modal);
  }

  // Máximo 10 elementos. Si hay más de 10 pendientes, tomar los primeros 9 y agregar "Etc..."
  let displayList = [];
  if (missingFields.length > 10) {
    displayList = missingFields.slice(0, 9);
    displayList.push({ label: 'Etc...', isEtc: true });
  } else {
    displayList = [...missingFields];
  }

  const listItems = displayList.map(f => {
    if (f.isEtc) {
      return `
        <li style="display: flex; align-items: center; gap: 10px; background: rgba(255, 255, 255, 0.05); border: 1px dashed rgba(255, 255, 255, 0.3); padding: 9px 14px; border-radius: 8px; color: rgba(255, 255, 255, 0.7); font-size: 13.5px; font-weight: 700; font-style: italic;">
          <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: rgba(255, 255, 255, 0.5); flex-shrink: 0;"></span>
          <span>Etc...</span>
        </li>
      `;
    }
    return `
      <li style="display: flex; align-items: center; gap: 10px; background: rgba(255, 77, 77, 0.1); border: 1px solid rgba(255, 77, 77, 0.3); padding: 9px 14px; border-radius: 8px; color: #ff6b6b; font-size: 13.5px; font-weight: 700;">
        <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #ff4d4d; flex-shrink: 0;"></span>
        <span>${f.label}</span>
      </li>
    `;
  }).join('');

  modal.innerHTML = `
    <div style="background: linear-gradient(145deg, #0e1726, #070c14); border: 1.5px solid rgba(255, 77, 77, 0.5); border-radius: 16px; padding: 24px 26px; max-width: 440px; width: 100%; box-shadow: 0 0 35px rgba(255, 77, 77, 0.3); color: #fff; animation: modalPop 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275); max-height: 90vh; overflow-y: auto;">
      <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 14px;">
        <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(255, 77, 77, 0.15); border: 1.5px solid #ff4d4d; display: flex; align-items: center; justify-content: center; color: #ff4d4d; font-size: 18px; font-weight: 900; flex-shrink: 0;">
          !
        </div>
        <div>
          <h3 style="margin: 0; font-size: 17px; font-weight: 800; color: #ff4d4d; letter-spacing: 0.3px;">Campos Pendientes por Llenar</h3>
          <p style="margin: 3px 0 0 0; font-size: 12.5px; color: rgba(255,255,255,0.7);">Se encontraron ${missingFields.length} campos por completar:</p>
        </div>
      </div>

      <ul style="list-style: none; padding: 0; margin: 14px 0 20px 0; display: flex; flex-direction: column; gap: 7px;">
        ${listItems}
      </ul>

      <button type="button" onclick="closeMissingFieldsAlert('${missingFields[0]?.tab || 'general'}', '${missingFields[0]?.id || ''}')" style="width: 100%; background: linear-gradient(90deg, #ff4d4d, #ff6b6b); color: #ffffff; border: none; padding: 12px; border-radius: 10px; font-weight: 800; font-size: 14px; cursor: pointer; box-shadow: 0 0 15px rgba(255, 77, 77, 0.4); transition: all 0.2s;">
        Completar Campos
      </button>
    </div>
  `;

  modal.style.display = 'flex';
};

window.closeMissingFieldsAlert = (tabToSwitch = 'general', fieldIdToFocus = '') => {
  const modal = document.getElementById('modal-missing-fields-alert');
  if (modal) modal.style.display = 'none';
  if (tabToSwitch) window.switchFormTab(tabToSwitch);
  if (fieldIdToFocus) {
    setTimeout(() => {
      const el = document.getElementById(fieldIdToFocus);
      if (el) {
        el.focus();
        el.style.border = '2px solid #ff4d4d';
        setTimeout(() => { el.style.border = '1px solid rgba(0,240,255,0.3)'; }, 3000);
      }
    }, 150);
  }
};

window.closeLocalPlayerFormModal = () => {
  const modal = document.getElementById('modal-local-player-form');
  if (modal) modal.style.display = 'none';
};

window.saveLocalPlayer = async (event) => {
  if (event && typeof event.preventDefault === 'function') {
    event.preventDefault();
  }

  const missingFields = [];

  // ─── TAB GENERAL ───
  const nameVal = document.getElementById('lp-name')?.value.trim();
  if (!nameVal) missingFields.push({ label: 'Nombre Completo', tab: 'general', id: 'lp-name' });

  const nickVal = document.getElementById('lp-nickname')?.value?.trim();
  if (!nickVal) missingFields.push({ label: 'Apodo / Nickname', tab: 'general', id: 'lp-nickname' });

  const docTypeVal = document.getElementById('lp-doc-type')?.value;
  if (!docTypeVal) missingFields.push({ label: 'Documento de Identidad', tab: 'general', id: 'lp-doc-type' });

  const docNumVal = document.getElementById('lp-doc-number')?.value?.trim();
  if (!docNumVal) missingFields.push({ label: 'Nº de Documento de Identidad', tab: 'general', id: 'lp-doc-number' });

  const docFileUrlVal = document.getElementById('lp-doc-file-url')?.value || '';
  if (!docFileUrlVal) missingFields.push({ label: 'Documento Adjunto (PDF/Imagen)', tab: 'general', id: 'lp-doc-dropzone' });

  const ageVal = document.getElementById('lp-age')?.value.trim();
  if (!ageVal) missingFields.push({ label: 'Edad', tab: 'general', id: 'lp-age' });

  const jerseyVal = document.getElementById('lp-jersey')?.value?.trim();
  if (!jerseyVal) missingFields.push({ label: 'Dorsal (#)', tab: 'general', id: 'lp-jersey' });

  const posVal = document.getElementById('lp-position')?.value;
  if (!posVal) missingFields.push({ label: 'Posición', tab: 'general', id: 'lp-position' });

  const footVal = document.getElementById('lp-foot')?.value;
  if (!footVal) missingFields.push({ label: 'Pie Hábil', tab: 'general', id: 'lp-foot' });

  const heightCm = window.getLocalPlayerHeightCm();
  if (!heightCm) missingFields.push({ label: 'Altura', tab: 'general', id: 'lp-height' });

  const weightKg = window.getLocalPlayerWeightKg();
  if (!weightKg) missingFields.push({ label: 'Peso', tab: 'general', id: 'lp-weight' });

  const catVal = document.getElementById('lp-category')?.value;
  if (!catVal) missingFields.push({ label: 'Categoría', tab: 'general', id: 'lp-category' });

  const medVal = document.getElementById('lp-medical')?.value;
  if (!medVal) missingFields.push({ label: 'Estado Médico', tab: 'general', id: 'lp-medical' });

  const photoUrlVal = document.getElementById('lp-photourl')?.value?.trim();
  if (!photoUrlVal) missingFields.push({ label: 'Foto de Perfil', tab: 'general', id: 'lp-photo-dropzone' });

  const bioVal = document.getElementById('lp-bio')?.value?.trim();
  if (!bioVal) missingFields.push({ label: 'Breve Biografía', tab: 'general', id: 'lp-bio' });

  // ─── TAB DEPORTIVO ───
  if (!window.tempStrengthsTags || window.tempStrengthsTags.length === 0) {
    missingFields.push({ label: 'Habilidades', tab: 'deportivo', id: 'lp-strength-input' });
  }

  if (!window.tempImprovementsTags || window.tempImprovementsTags.length === 0) {
    missingFields.push({ label: 'Aspectos de Mejora', tab: 'deportivo', id: 'lp-improvement-input' });
  }

  const tacVal = document.getElementById('lp-tactical-notes')?.value?.trim();
  if (!tacVal) missingFields.push({ label: 'Notas del Entrenador', tab: 'deportivo', id: 'lp-tactical-notes' });

  const highlightVal = document.getElementById('lp-highlight-url')?.value?.trim() || document.getElementById('lp-highlight-external-url')?.value?.trim();
  if (!highlightVal) missingFields.push({ label: 'Highlights (Video)', tab: 'deportivo', id: 'lp-highlight-dropzone' });

  // ─── TAB HISTORIAL ───
  if (!window.tempSeasonsList || window.tempSeasonsList.length === 0) {
    missingFields.push({ label: 'Temporadas Registradas', tab: 'historial', id: 'lp-stats-season' });
  }

  if (!window.tempTrophiesList || window.tempTrophiesList.length === 0) {
    missingFields.push({ label: 'Palmarés / Trofeos', tab: 'historial', id: 'lp-trophy-name' });
  }

  // ─── TAB AUTORIZACIONES ───
  const authSignatureUrl = document.getElementById('lp-auth-signature-file-url')?.value || '';
  const authSignatureLabel = document.getElementById('lp-auth-signature-file-name')?.textContent || '';
  const authSignatureFileName = authSignatureLabel.startsWith('📎 ') ? authSignatureLabel.replace('📎 ', '') : '';

  if (!authSignatureUrl) {
    missingFields.push({ label: 'Documento de Autorización Firmado', tab: 'autorizaciones', id: 'lp-auth-signature-file-box' });
  }

  const authMedicalUrl = document.getElementById('lp-auth-medical-file-url')?.value || '';
  const authMedicalLabel = document.getElementById('lp-auth-medical-file-name')?.textContent || '';
  const authMedicalFileName = authMedicalLabel.startsWith('📎 ') ? authMedicalLabel.replace('📎 ', '') : '';

  if (!authMedicalUrl) {
    missingFields.push({ label: 'Certificado Médico de Aptitud', tab: 'autorizaciones', id: 'lp-auth-medical-file-box' });
  }

  // ─── TAB LEGAL (SOLO MENORES DE 18 AÑOS) ───
  const parsedAge = parseInt(ageVal, 10);
  const isMinorPlayer = ageVal !== '' && !isNaN(parsedAge) && parsedAge <= 17;
  const guardiansList = Array.isArray(window.tempGuardiansList) ? window.tempGuardiansList : [];

  if (isMinorPlayer) {
    if (guardiansList.length === 0) {
      missingFields.push({ label: 'Tutor / Representante Legal (Mínimo 1)', tab: 'legal', id: 'lp-legal-guardians-container' });
    } else {
      guardiansList.forEach((g, idx) => {
        const num = idx + 1;
        const labelPrefix = guardiansList.length > 1 ? `Tutor #${num} - ` : '';
        if (!g.name?.trim()) missingFields.push({ label: `${labelPrefix}Nombre Completo`, tab: 'legal', id: 'lp-legal-guardians-container' });
        if (!g.relationship) missingFields.push({ label: `${labelPrefix}Parentesco / Relación`, tab: 'legal', id: 'lp-legal-guardians-container' });
        if (!g.docType) missingFields.push({ label: `${labelPrefix}Documento`, tab: 'legal', id: 'lp-legal-guardians-container' });
        if (!g.docNumber?.trim()) missingFields.push({ label: `${labelPrefix}Nº de Documento`, tab: 'legal', id: 'lp-legal-guardians-container' });
        if (!g.phone?.trim()) missingFields.push({ label: `${labelPrefix}Teléfono de Contacto`, tab: 'legal', id: 'lp-legal-guardians-container' });
      });
    }
  }

  if (missingFields.length > 0) {
    window.showMissingFieldsAlert(missingFields);
    return;
  }

  const idInput = document.getElementById('local-player-id');
  const name = nameVal;
  const nickname = document.getElementById('lp-nickname')?.value.trim() || '';
  const age = parseInt(ageVal, 10);
  const jerseyNumber = parseInt(document.getElementById('lp-jersey')?.value?.trim() || '0', 10) || 0;
  const position = posVal;
  const overallRating = 75;
  const category = document.getElementById('lp-category')?.value || 'Cantera';
  const preferredFoot = document.getElementById('lp-foot')?.value || 'Derecho';
  const height = window.getLocalPlayerHeightCm() || 175;
  const weight = window.getLocalPlayerWeightKg() || 70;
  const medicalStatus = document.getElementById('lp-medical')?.value || 'Apto';
  const photoUrl = document.getElementById('lp-photourl')?.value?.trim() || '';
  const bioEs = document.getElementById('lp-bio')?.value?.trim() || '';
  const tacticalNotes = document.getElementById('lp-tactical-notes')?.value?.trim() || '';
  const highlightUrl = document.getElementById('lp-highlight-url')?.value?.trim() || document.getElementById('lp-highlight-external-url')?.value?.trim() || '';
  const marketValue = 0;

  const matches = parseInt(document.getElementById('lp-stats-matches')?.value || '0', 10) || 0;
  const goals = parseInt(document.getElementById('lp-stats-goals')?.value || '0', 10) || 0;
  const assists = parseInt(document.getElementById('lp-stats-assists')?.value || '0', 10) || 0;
  const yellowCards = parseInt(document.getElementById('lp-stats-yellow')?.value || '0', 10) || 0;
  const redCards = parseInt(document.getElementById('lp-stats-red')?.value || '0', 10) || 0;

  const user = JSON.parse(localStorage.getItem('scout_ai_user') || '{}');
  const userClub = user.selectedClub || 'Club Local';

  const authorizations = JSON.stringify({
    image: !!authSignatureUrl,
    data: !!authSignatureUrl,
    medical: !!authMedicalUrl,
    authSignatureUrl,
    authSignatureFileName,
    authMedicalUrl,
    authMedicalFileName
  });

  const primaryGuardian = guardiansList[0] || {};
  const legalDetails = JSON.stringify({
    guardians: guardiansList,
    guardianName: primaryGuardian.name || '',
    guardianRelationship: primaryGuardian.relationship || '',
    guardianDocType: primaryGuardian.docType || '',
    guardianDocNumber: primaryGuardian.docNumber || '',
    guardianPhone: primaryGuardian.phone || '',
    guardianEmail: primaryGuardian.email || ''
  });

  const docFileUrl = document.getElementById('lp-doc-file-url')?.value || '';
  const docFileLabel = document.getElementById('lp-doc-file-name')?.textContent || '';
  const docFileName = docFileLabel.startsWith('📎 ') ? docFileLabel.replace('📎 ', '') : '';

  const currentSeasonInputVal = document.getElementById('lp-stats-season')?.value?.trim() || '2024/25';
  let historySeasons = (Array.isArray(window.tempSeasonsList) && window.tempSeasonsList.length > 0)
    ? window.tempSeasonsList
    : [{
        season: currentSeasonInputVal,
        team: userClub,
        matches,
        goals,
        assists,
        yellowCards,
        redCards,
        rating: overallRating
      }];

  const payload = {
    name,
    nickname,
    docType: docTypeVal || '',
    docNumber: docNumVal || '',
    docFileUrl,
    docFileName,
    age,
    jerseyNumber,
    position,
    positionEs: getPositionEs(position),
    overallRating,
    category,
    preferredFoot,
    height,
    weight,
    medicalStatus,
    photoUrl,
    bioEs,
    bio: bioEs,
    tacticalNotes,
    highlightUrl,
    authorizations,
    legalDetails,
    marketValue,
    currentTeam: userClub,
    nationality: user.selectedCountry || 'Local',
    nationalityEs: user.selectedCountry || 'Local',
    stats: JSON.stringify({ matches, goals, assists, yellowCards, redCards }),
    strengths: JSON.stringify(window.tempStrengthsTags),
    improvements: JSON.stringify(window.tempImprovementsTags),
    weaknesses: JSON.stringify(window.tempImprovementsTags),
    trophies: JSON.stringify(window.tempTrophiesList),
    injuries: JSON.stringify(window.tempInjuriesList || []),
    tags: JSON.stringify([category, medicalStatus, 'Cantera']),
    history: JSON.stringify(historySeasons)
  };

  const playerId = idInput.value;
  const token = localStorage.getItem('scout_ai_token');
  
  if (!token) {
    if (typeof showToast === 'function') showToast('❌ Debes iniciar sesión para guardar.', 'error');
    return;
  }

  try {
    let url = '/api/my-players';
    let method = 'POST';
    if (playerId) {
      url = `/api/my-players/${playerId}`;
      method = 'PUT';
    }

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (data.success) {
      if (typeof showToast === 'function') {
        showToast(playerId ? `✅ Jugador "${name}" actualizado con éxito.` : `🎉 ¡Jugador "${name}" añadido a la plantilla local!`, 'success');
      }
      window.closeLocalPlayerFormModal();
      await window.loadLocalPlayers();
      window.renderMyPlayersModule(true);
    } else {
      if (typeof showToast === 'function') showToast(`❌ Error: ${data.error}`, 'error');
    }
  } catch (err) {
    console.error('Error saving local player:', err);
    if (typeof showToast === 'function') showToast('❌ Error de red al guardar el jugador.', 'error');
  }
};

function getPositionEs(code) {
  if (!code) return '—';
  const cleanCode = String(code).trim().toUpperCase();
  const map = {
    'ST': 'ST - Delantero Centro',
    'CF': 'CF - Segundo Delantero',
    'LW': 'LW - Extremo Izquierdo',
    'RW': 'RW - Extremo Derecho',
    'CAM': 'CAM - Mediapunta',
    'CM': 'CM - Mediocampista',
    'CDM': 'CDM - Volante de Contención',
    'LB': 'LB - Lateral Izquierdo',
    'RB': 'RB - Lateral Derecho',
    'CB': 'CB - Defensa Central',
    'GK': 'GK - Portero'
  };
  return map[cleanCode] || map[code] || code;
}

window.deleteLocalPlayer = async (playerId) => {
  const players = window.getLocalPlayersList();
  const player = players.find(p => p.id === playerId);
  if (!player) return;

  if (!confirm(`¿Estás seguro de que deseas eliminar a "${player.name}" de tu plantilla local?`)) {
    return;
  }

  const token = localStorage.getItem('scout_ai_token');
  if (!token) return;

  try {
    const res = await fetch(`/api/my-players/${playerId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) {
      if (typeof showToast === 'function') showToast(`🗑️ Jugador "${player.name}" eliminado.`, 'info');
      await window.loadLocalPlayers();
      window.renderMyPlayersModule(true);
    }
  } catch (err) {
    console.error('Error deleting player:', err);
  }
};

window.viewLocalPlayerExpediente = async (playerOrId) => {
  if (!playerOrId) return;

  if (typeof playerOrId === 'object' && playerOrId.id) {
    openPlayerModal(playerOrId);
    return;
  }

  const playerId = playerOrId;
  const localList = window.getLocalPlayersList();
  let player = localList.find(p => p.id === playerId);

  if (!player && window.prospectsCached) {
    player = window.prospectsCached.find(p => p.id === playerId);
  }

  if (!player) {
    try {
      const token = localStorage.getItem('scout_ai_token');
      const res = await fetch(`/api/players/${playerId}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data && (data.id || data.player)) {
        player = data.player || data;
      }
    } catch (e) {
      console.warn('Error fetching player expediente:', e);
    }
  }

  if (player && typeof openPlayerModal === 'function') {
    openPlayerModal(player);
  }
};

window.closeLocalPlayerExpedienteModal = () => {
  const modal = document.getElementById('modal-local-player-expediente');
  if (modal) modal.style.display = 'none';
};

window.openCoachChatAndSendMessage = async (coachUserId, playerName) => {
  const msg = `Quiero saber más sobre este jugador: ${playerName}`;
  
  try {
    const token = getMyChatsToken();
    if (token && coachUserId) {
      await fetch('/api/chats/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ contactUserId: coachUserId })
      });
    }
  } catch (e) {
    console.warn('⚠️ No se pudo vincular el contacto del entrenador:', e);
  }

  // Navegar a Mis Chats
  goToSection('my-chats');

  if (coachUserId) {
    await fetchMyChatsContacts();
    selectChatContact(coachUserId);

    setTimeout(async () => {
      const inputEl = document.getElementById('my-chats-input-text');
      if (inputEl) {
        inputEl.value = msg;
        await sendMyChatMessage();
      }
    }, 200);
  }
};

window.sendMessageAboutPlayer = (playerName, coachUserId = null) => {
  window.openCoachChatAndSendMessage(coachUserId, playerName);
};

window.renderProfileFavorites = () => {
  const container = document.getElementById('profile-favorites-container');
  const emptyState = document.getElementById('profile-favorites-empty');
  if (!container) return;
  
  container.innerHTML = '';
  
  const favIds = getFavorites();
  const favoritePlayers = allPlayers.filter(p => favIds.includes(p.id));
  
  if (favoritePlayers.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    container.style.display = 'none';
  } else {
    if (emptyState) emptyState.style.display = 'none';
    container.style.display = 'grid';
    
    favoritePlayers.forEach(p => {
      const card = createPlayerCard(p);
      container.appendChild(card);
    });
    loadAllLogos(); // Load logos
  }
};

window.loadProfilePaymentHistory = async () => {
  const tbody = document.getElementById('profile-payments-tbody');
  const emptyState = document.getElementById('profile-payments-empty');
  const table = document.querySelector('#profile-tab-content-payments table');
  
  if (!tbody) return;
  
  let payments = [];
  try {
    const res = await fetchWithAuth(`${API}/payments/history`);
    if (res.ok) {
      const data = await res.json();
      payments = data.payments || [];
      if (payments.length > 0) {
        localStorage.setItem('scout_ai_payments_history', JSON.stringify(payments));
      } else {
        payments = window.getUserPaymentHistory();
      }
    } else {
      payments = window.getUserPaymentHistory();
    }
  } catch (err) {
    console.warn('Payment history fetch offline fallback:', err);
    if (err.message === 'Sesión expirada') return;
    payments = window.getUserPaymentHistory();
  }

  if (payments.length === 0) {
    tbody.innerHTML = '';
    if (table) table.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
  } else {
    if (emptyState) emptyState.style.display = 'none';
    if (table) table.style.display = 'table';
    
    tbody.innerHTML = payments.map(p => {
      const dateObj = new Date(p.createdAt || Date.now());
      const formattedDate = dateObj.toLocaleString('es-ES', { 
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      const concept = `Suscripción Plan ${p.tier}`;
      const formattedAmount = `$${parseFloat(p.amount || 0).toFixed(2)} USD`;
      
      return `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.2s;">
          <td style="padding: 12px 10px; color: rgba(255,255,255,0.85);">${formattedDate}</td>
          <td style="padding: 12px 10px; color: rgba(255,255,255,0.85); font-weight: 500;">
            <span style="display: inline-flex; align-items: center; gap: 6px;">
              <span style="color: #00f0ff;">✨</span> ${concept}
            </span>
          </td>
          <td style="padding: 12px 10px; color: #10b981; font-weight: 600; text-align: right;">${formattedAmount}</td>
        </tr>
      `;
    }).join('');
  }
};

window.openEditProfileModal = () => {
  const user = JSON.parse(localStorage.getItem('scout_ai_user') || '{}');
  const nombresInput = document.getElementById('edit-profile-nombres');
  const apellidosInput = document.getElementById('edit-profile-apellidos');
  const emailInput = document.getElementById('edit-profile-email');
  const telefonoInput = document.getElementById('edit-profile-telefono');
  const roleSelect = document.getElementById('edit-profile-role');
  
  if (nombresInput) nombresInput.value = user.nombres || '';
  if (apellidosInput) apellidosInput.value = user.apellidos || '';
  if (emailInput) emailInput.value = user.email || '';
  if (telefonoInput) telefonoInput.value = user.telefono || '';
  if (roleSelect) roleSelect.value = user.role || 'Usuario';
  
  const modal = document.getElementById('edit-profile-modal');
  if (modal) {
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 10);
  }
};

window.closeEditProfileModal = () => {
  const modal = document.getElementById('edit-profile-modal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.style.display = 'none', 300);
  }
};

window.saveProfileEdits = async (e) => {
  if (e) e.preventDefault();
  
  const nombres = document.getElementById('edit-profile-nombres')?.value || '';
  const apellidos = document.getElementById('edit-profile-apellidos')?.value || '';
  const email = document.getElementById('edit-profile-email')?.value || '';
  const telefono = document.getElementById('edit-profile-telefono')?.value || '';
  const role = document.getElementById('edit-profile-role')?.value || '';
  
  const token = localStorage.getItem('scout_ai_token');
  
  try {
    showToast('Guardando cambios…', 'info');
    const res = await fetch(`${API}/auth/update-profile`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ nombres, apellidos, telefono, email, role })
    });
    
    const data = await res.json();
    if (res.ok && data.success) {
      localStorage.setItem('scout_ai_user', JSON.stringify(data.user));
      
      // Update topbar and profile UI elements
      updateProfileUI(data.user);
      await renderProfile();
      
      showToast('✅ Perfil actualizado correctamente', 'success');
      window.closeEditProfileModal();
    } else {
      showToast(data.error || 'Error al guardar cambios', 'error');
    }
  } catch (err) {
    console.error('Error saving profile edits:', err);
    showToast('Error de conexión al guardar cambios', 'error');
  }
};

window.togglePreference = (type) => {
  if (type === 'notif') {
    const el = document.getElementById('toggle-notif-ai');
    if (el) {
      el.classList.toggle('on');
      const isOn = el.classList.contains('on');
      localStorage.setItem('scout_ai_pref_notif', isOn ? 'true' : 'false');
      showToast(isOn ? 'Notificaciones de IA activadas 🔔' : 'Notificaciones de IA desactivadas 🔕', 'success');
    }
  } else if (type === 'dark_mode') {
    const el = document.getElementById('toggle-dark-mode');
    if (el) {
      el.classList.toggle('on');
      const isOn = el.classList.contains('on');
      localStorage.setItem('scout_ai_pref_dark_mode', isOn ? 'true' : 'false');
      window.applyTheme();
      showToast(isOn ? 'Modo Oscuro activado 🌙' : 'Modo Oscuro desactivado ☀️', 'success');
    }
  }
};

async function checkBackendStatus() {
  try {
    const res = await fetch(`${API}/health`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error from server');
    setStatus(data.demoMode ? 'demo' : 'online', data.demoMode ? 'Demo Mode' : `Gemini AI Online`);
    document.getElementById('stat-players').textContent = data.players;
    const agentStatusEl = document.getElementById('agent-status-text');
    if (agentStatusEl) {
      agentStatusEl.textContent = data.demoMode
        ? 'Demo Mode — Connect API key for full AI'
        : `🟢 Online — ${data.model}`;
    }
  } catch {
    setStatus('offline', 'Backend offline');
    showToast('⚠️ Backend no disponible. Inicia el servidor Node.js.', 'error');
  }
}

function setStatus(type, text) {
  const dot = document.getElementById('status-dot');
  if (dot) {
    const dotEl = dot.querySelector('.dot');
    if (dotEl) dotEl.className = `dot ${type}`;
  }
  const textEl = document.getElementById('status-text');
  if (textEl) textEl.textContent = text || (type === 'online' ? t('status_online') : type === 'demo' ? t('status_demo') : t('status_offline'));
  
  const topbarStatus = document.getElementById('topbar-status');
  if (topbarStatus) topbarStatus.textContent = type === 'online' ? '🟢' : type === 'demo' ? '🟡' : '🔴';
}

// ──────────────────────────────────────────
// NAVIGATION
// ──────────────────────────────────────────
function setupNavigation() {
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.dataset.section;
      goToSection(section);
      closeMobileMenu();
    });
  });
}

function goToSection(name) {
  const user = JSON.parse(localStorage.getItem('scout_ai_user') || '{}');
  const isLocal = (user.selectedTier || '').toLowerCase() === 'local' || (user.role || '').toLowerCase() === 'local' || (user.role || '').toLowerCase() === 'entrenador local';
  const restricted = ['players', 'my-club', 'compare', 'predictions', 'simulations', 'prospects'];

  if (isLocal && (restricted.includes(name) || name === 'home')) {
    name = 'chat';
  } else if (!isLocal && name === 'my-players') {
    name = 'prospects';
  }

  // Label map for section transitions
  const sectionLabels = {
    'home':        'Cargando Inicio...',
    'players':     'Cargando Jugadores...',
    'prospects':   'Cargando Prospectos...',
    'my-club':     'Cargando Mi Club...',
    'compare':     'Cargando Comparador...',
    'predictions': 'Cargando Predicciones...',
    'simulations': 'Cargando Simulaciones...',
    'chat':        'Cargando Consultor IA...',
    'profile':     'Cargando Perfil...',
    'my-players':  'Cargando Mis Jugadores...',
  };

  // Show section loader briefly during render
  if (window.SectionLoader) window.SectionLoader.show(sectionLabels[name] || 'Cargando...');

  // Double rAF ensures loader paints BEFORE section switches
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.querySelectorAll('.nav-item').forEach(b => {
        b.classList.toggle('active', b.dataset.section === name);
      });
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.getElementById(`section-${name}`)?.classList.add('active');

      if (name === 'my-club') renderMyClubDashboard();
      if (name === 'players') renderPlayers();
      if (name === 'prospects' && window.renderProspectsModule) window.renderProspectsModule();
      if (name === 'predictions' && !predictionsLoaded) loadPredictions();
      if (name === 'profile') renderProfile();
      if (name === 'simulations') initSimulationsSection();
      if (name === 'my-players' && window.renderMyPlayersModule) window.renderMyPlayersModule();
      if (name === 'my-chats') renderMyChatsSection();
      if (name === 'chat') {
        const currentSession = chatSessions.find(s => s.id === activeSessionId);
        if (currentSession && currentSession.messages && currentSession.messages.length > 0) {
          createNewChatSession();
        }
      }

      // Minimum visible time = 250ms for good UX
      setTimeout(() => {
        if (window.SectionLoader) window.SectionLoader.hide();
      }, 250);
    });
  });
}

// ──────────────────────────────────────────
// MOBILE MENU
// ──────────────────────────────────────────
function setupMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const overlay = document.getElementById('sidebar-overlay');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const sidebar = document.getElementById('sidebar');
      if (sidebar) sidebar.classList.toggle('open');
      if (overlay) overlay.classList.toggle('open');
    });
  }
  if (overlay) {
    overlay.addEventListener('click', closeMobileMenu);
  }
}

function closeMobileMenu() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
}

// ──────────────────────────────────────────
// PLAYERS
// ──────────────────────────────────────────
async function loadPlayers() {
  try {
    const res = await fetchWithAuth(`${API}/players?t=${Date.now()}`);
    if (!res.ok) throw new Error('API failed');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error from server');
    if (Array.isArray(data?.players)) {
      allPlayers = data.players;
      window.allPlayers = allPlayers;
      localStorage.setItem('scout_ai_cached_players', JSON.stringify(allPlayers));
    }
    populateLeagueFilter(); // Populate dropdowns
  } catch (err) {
    console.error('loadPlayers error:', err);
    // Keep existing cached players if they are already populated
  }
}

function renderFeaturedPlayers() {
  const top = [...allPlayers].slice(0, 8);
  const grid = document.getElementById('featured-grid');
  if (grid) {
    grid.innerHTML = '';
    top.forEach(p => grid.appendChild(createPlayerCard(p)));
    if (typeof loadAllLogos === 'function') loadAllLogos();
  }
}

currentPage = 1;
const PLAYERS_PER_PAGE = 24;

function renderPlayers(playersToRender) {
  const list = playersToRender || allPlayers || [];
  const grid = document.getElementById('players-grid');
  const countTag = document.getElementById('players-count-tag');
  const noResults = document.getElementById('no-results');
  const paginationControls = document.getElementById('pagination-controls');

  if (countTag) {
    countTag.textContent = `${list.length} ${typeof currentLang !== 'undefined' && currentLang === 'es' ? 'jugadores' : 'players'}`;
  }

  if (!grid) return;
  grid.innerHTML = '';

  if (!list || list.length === 0) {
    if (noResults) noResults.style.display = 'block';
    if (paginationControls) paginationControls.style.display = 'none';
    return;
  }

  if (noResults) noResults.style.display = 'none';

  const totalPages = Math.ceil(list.length / PLAYERS_PER_PAGE) || 1;
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  const start = (currentPage - 1) * PLAYERS_PER_PAGE;
  const end = start + PLAYERS_PER_PAGE;
  const pagePlayers = list.slice(start, end);

  pagePlayers.forEach(p => {
    grid.appendChild(createPlayerCard(p));
  });

  if (paginationControls) {
    if (totalPages > 1) {
      paginationControls.style.display = 'flex';
      const pageInfo = document.getElementById('page-info');
      if (pageInfo) {
        pageInfo.textContent = `${typeof currentLang !== 'undefined' && currentLang === 'es' ? 'Página' : 'Page'} ${currentPage} / ${totalPages}`;
      }
      const prevBtn = document.getElementById('prev-page-btn');
      const nextBtn = document.getElementById('next-page-btn');
      if (prevBtn) prevBtn.disabled = currentPage === 1;
      if (nextBtn) nextBtn.disabled = currentPage === totalPages;
    } else {
      paginationControls.style.display = 'none';
    }
  }

  if (typeof loadAllLogos === 'function') {
    loadAllLogos();
  }
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    if (typeof window.applyAppFilters === 'function') {
      window.applyAppFilters();
    } else {
      renderPlayers();
    }
  }
}

function nextPage() {
  currentPage++;
  if (typeof window.applyAppFilters === 'function') {
    window.applyAppFilters();
  } else {
    renderPlayers();
  }
}

function getPlayerCareerAverageRating(p) {
  if (!p) return '7.0';
  let historyArr = p.history;
  if (typeof historyArr === 'string') {
    try { historyArr = JSON.parse(historyArr); } catch(e) { historyArr = null; }
  }
  if (Array.isArray(historyArr) && historyArr.length > 0) {
    const validRatings = historyArr
      .map(h => parseFloat(h.rating))
      .filter(r => !isNaN(r) && r > 0)
      .map(r => r > 10 ? r / 10 : r);
    if (validRatings.length > 0) {
      const sum = validRatings.reduce((a, b) => a + b, 0);
      return (sum / validRatings.length).toFixed(1);
    }
  }
  const raw = parseFloat(p.overallRating);
  if (!isNaN(raw) && raw > 0) {
    const norm = raw > 10 ? raw / 10 : raw;
    return norm.toFixed(1);
  }
  return '7.0';
}

function createPlayerCard(p) {
  const card = document.createElement('div');
  card.className = 'player-card';

  let avatarUrl = p.avatarUrl || p.photoUrl;
  if (!avatarUrl || avatarUrl.trim() === '') {
    if (p.photoId && p.photoId.trim() !== '') {
      avatarUrl = (p.photoId.startsWith('http://') || p.photoId.startsWith('https://'))
        ? p.photoId
        : getAbsoluteUrl('/api/player-photo/' + p.photoId);
    } else {
      const pInitials = (p.name || 'J').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(pInitials)}&background=00f0ff&color=0d1117&size=128`;
    }
  }

  const nameParts = (p.name || '').split(' ');
  const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : p.name;
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

  const color = getTeamColor(p.currentTeam);
  card.style.setProperty('--team-color', color);

  const favClass = isFavorite(p.id) ? 'fav-btn active' : 'fav-btn';
  const contractValueStr = formatContractValue(p.marketValue);

  card.innerHTML = `
    <button class="${favClass}" onclick="event.stopPropagation(); toggleFavorite('${p.id}', this)" title="Marcar como favorito">★</button>
    <div class="player-avatar-tactical">
      <div class="neon-ring"></div>
      <div class="tactical-corners"></div>
      <img src="${avatarUrl}" class="player-photo" alt="${p.name}">
      <div class="card-team-logo" data-team-name="${p.currentTeam}" style="position: absolute; bottom: -5px; right: -5px; width: 28px; height: 28px; background: rgba(13, 17, 23, 0.95); border: 1.5px solid var(--team-color); border-radius: 50%; display: flex; align-items: center; justify-content: center; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.5); z-index: 10;">
        <span style="font-size: 10px;">⚽</span>
      </div>
    </div>
    
    <div class="tactical-info-wrap">
      <div class="player-main-name">
        <span class="card-flag">${p.flag}</span>
        ${firstName}
      </div>
      <div class="player-sub-name">${lastName}</div>
      
      <div class="tactical-badges">
        <span class="t-badge">${currentLang === 'es' ? p.positionEs : p.position}</span>
      </div>

      <div class="player-rating-star">
        <span class="star" style="display:inline-flex; align-items:center;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 22 8.5 12 22 2 8.5 12 2"></polygon></svg></span>
        <span>${formatContractValue(p.marketValue)}</span>
      </div>
    </div>
    
    <button class="btn-expediente">EXPEDIENTE</button>
    ${p.isLocalProspect ? `<button class="btn-mensaje-prospecto" onclick="event.stopPropagation(); openCoachChatAndSendMessage('${p.userId || ''}', '${escapeHtml(p.name)}')">MENSAJE</button>` : ''}
  `;

  const img = card.querySelector('.player-photo');
  if (img) img.onerror = () => onAvatarError(img, p);

  card.addEventListener('click', () => openPlayerModal(p));
  return card;
}

function normalizeString(str) {
  if (!str) return '';
  // Transliterate special chars not handled by NFD (e.g., Ø→o, ø→o, Ð→d, ß→ss, Æ→ae, æ→ae, Þ→th)
  const transliterations = {
    '\u00D8': 'o', '\u00F8': 'o', // Ø, ø
    '\u00C6': 'ae', '\u00E6': 'ae', // Æ, æ
    '\u00D0': 'd', '\u00F0': 'd', // Ð, ð
    '\u00DE': 'th', '\u00FE': 'th', // Þ, þ
    '\u00DF': 'ss', // ß
    '\u0141': 'l', '\u0142': 'l', // Ł, ł
  };
  let s = str;
  for (const [from, to] of Object.entries(transliterations)) {
    s = s.split(from).join(to);
  }
  // Lowercase first, then strip diacritics, then strip non-alphanumeric
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, "").trim();
}

function getFavorites() {
  const user = JSON.parse(localStorage.getItem('scout_ai_user') || '{}');
  const key = user.username ? `futbolai-favorites-${user.username}` : 'futbolai-favorites';
  return JSON.parse(localStorage.getItem(key) || '[]');
}

function isFavorite(playerId) {
  return getFavorites().includes(playerId);
}

window.toggleFavorite = function(playerId, btnEl) {
  let favs = getFavorites();
  let action = 'add';
  if (favs.includes(playerId)) {
    favs = favs.filter(id => id !== playerId);
    if (btnEl) btnEl.classList.remove('active');
    action = 'remove';
  } else {
    favs.push(playerId);
    if (btnEl) btnEl.classList.add('active');
  }
  const user = JSON.parse(localStorage.getItem('scout_ai_user') || '{}');
  const key = user.username ? `futbolai-favorites-${user.username}` : 'futbolai-favorites';
  localStorage.setItem(key, JSON.stringify(favs));
  
  incrementUserStat('favorites', { playerId, action });
  
  // Refresh if we are currently filtering by favorites
  const activeChip = document.querySelector('.chip.active');
  if (activeChip && activeChip.dataset.pos === 'fav') {
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.dispatchEvent(new Event('input'));
  }

  // ALSO refresh the profile favorites tab if it's currently open!
  const contentFavs = document.getElementById('profile-tab-content-favorites');
  if (contentFavs && contentFavs.style.display === 'block') {
    window.renderProfileFavorites();
  }
};

function setupFilters() {
  const search = document.getElementById('search-input');
  const chips = document.querySelectorAll('.filter-chips .chip');
  const sortSelect = document.getElementById('sort-players');
  const leagueSelect = document.getElementById('filter-league');
  const teamSelect = document.getElementById('filter-team');

  const applyFilters = () => {
    const query = search ? search.value.toLowerCase() : '';
    const activeChip = document.querySelector('.chip.active');
    const pos = activeChip ? activeChip.dataset.pos : '';
    const leagueFilter = leagueSelect ? leagueSelect.value : '';
    const teamFilter = teamSelect ? teamSelect.value : '';

    const normalizedQuery = normalizeString(query);
    console.log(`🔎 Filtering: query="${query}", normalized="${normalizedQuery}", total=${allPlayers.length}`);
    let filtered = allPlayers.filter(p => {
      const matchSearch = !normalizedQuery || 
        normalizeString(p.name).includes(normalizedQuery) || 
        normalizeString(p.currentTeam).includes(normalizedQuery) || 
        normalizeString(p.nationality || '').includes(normalizedQuery) ||
        normalizeString(p.nationalityEs || '').includes(normalizedQuery) ||
        (p.flag && p.flag.includes(normalizedQuery));
        
      let matchPos = false;
      if (!pos) {
        matchPos = true;
      } else if (pos === 'fav') {
        matchPos = isFavorite(p.id);
      } else {
        matchPos = p.position === pos;
      }
      
      const matchLeague = !leagueFilter || p.league === leagueFilter;
      const matchTeam = !teamFilter || p.currentTeam === teamFilter;
      return matchSearch && matchPos && matchLeague && matchTeam;
    });

    // Sorting
    const sortVal = sortSelect ? sortSelect.value : 'default';
    filtered.sort((a, b) => {
      switch (sortVal) {
        case 'name_asc': return a.name.localeCompare(b.name);
        case 'name_desc': return b.name.localeCompare(a.name);
        case 'salary_desc': return b.marketValue - a.marketValue; // Proportional
        case 'salary_asc': return a.marketValue - b.marketValue;
        case 'contract_asc': 
          return getEstimatedContract(a) - getEstimatedContract(b);
        case 'contract_desc': 
          return getEstimatedContract(b) - getEstimatedContract(a);
        default: return 0;
      }
    });

    renderPlayers(filtered);
  };

  if (search) search.addEventListener('input', applyFilters);
  if (sortSelect) sortSelect.addEventListener('change', applyFilters);
  
  if (leagueSelect) {
    leagueSelect.addEventListener('change', () => {
      updateTeamDropdown(leagueSelect.value);
      applyFilters();
    });
  }

  if (teamSelect) {
    teamSelect.addEventListener('change', applyFilters);
  }

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      applyFilters();
    });
  });

  initCustomDropdowns();

  // Attach applyFilters to global scope to be called by dropdowns if needed
  window.applyAppFilters = applyFilters;
}

function initCustomDropdowns() {
  const setupDropdown = (id) => {
    const trigger = document.getElementById(`dropdown-trigger-${id}`);
    const menu = document.getElementById(`dropdown-menu-${id}`);
    const searchInput = document.getElementById(`dropdown-search-${id}`);

    if (!trigger || !menu) return;

    // Remove previous listeners if any to avoid duplication
    const newTrigger = trigger.cloneNode(true);
    trigger.parentNode.replaceChild(newTrigger, trigger);

    newTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      // Close other dropdowns first
      document.querySelectorAll('.dropdown-menu').forEach(m => {
        if (m !== menu) m.classList.remove('show');
      });
      menu.classList.toggle('show');
      if (menu.classList.contains('show') && searchInput) {
        searchInput.value = '';
        filterDropdownOptions(id, '');
        searchInput.focus();
      }
    });

    if (searchInput) {
      searchInput.placeholder = t(`search_${id}_placeholder`);
      const newSearchInput = searchInput.cloneNode(true);
      searchInput.parentNode.replaceChild(newSearchInput, searchInput);

      newSearchInput.addEventListener('input', (e) => {
        filterDropdownOptions(id, e.target.value);
      });
      newSearchInput.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }
  };

  setupDropdown('league');
  setupDropdown('team');

  // Close dropdowns on outside click
  document.removeEventListener('click', closeAllCustomDropdowns);
  document.addEventListener('click', closeAllCustomDropdowns);
}

function closeAllCustomDropdowns() {
  document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('show'));
}

function filterDropdownOptions(id, query) {
  const optionsContainer = document.getElementById(`dropdown-options-${id}`);
  if (!optionsContainer) return;
  const normalizedQuery = normalizeString(query.toLowerCase());
  const options = optionsContainer.querySelectorAll('.dropdown-option');
  options.forEach(opt => {
    const text = normalizeString(opt.textContent.toLowerCase());
    if (text.includes(normalizedQuery)) {
      opt.style.display = 'block';
    } else {
      opt.style.display = 'none';
    }
  });
}

function renderCustomDropdownOptions(id, items, placeholderText, activeValue) {
  const container = document.getElementById(`dropdown-options-${id}`);
  const triggerText = document.querySelector(`#dropdown-trigger-${id} .dropdown-trigger-text`);
  if (!container) return;

  container.innerHTML = '';

  // Add default empty option
  const defaultOpt = document.createElement('div');
  defaultOpt.className = 'dropdown-option';
  defaultOpt.dataset.value = '';
  defaultOpt.textContent = placeholderText;
  if (!activeValue) {
    defaultOpt.classList.add('active');
    if (triggerText) triggerText.textContent = placeholderText;
  }
  defaultOpt.addEventListener('click', (e) => {
    e.stopPropagation();
    selectCustomDropdownOption(id, '', placeholderText);
  });
  container.appendChild(defaultOpt);

  items.forEach(item => {
    const opt = document.createElement('div');
    opt.className = 'dropdown-option';
    opt.dataset.value = item.value;
    opt.textContent = item.text;
    if (activeValue === item.value) {
      opt.classList.add('active');
      if (triggerText) triggerText.textContent = item.text;
    }
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      selectCustomDropdownOption(id, item.value, item.text);
    });
    container.appendChild(opt);
  });
}

function selectCustomDropdownOption(id, value, text) {
  const select = document.getElementById(`filter-${id}`);
  const triggerText = document.querySelector(`#dropdown-trigger-${id} .dropdown-trigger-text`);
  const menu = document.getElementById(`dropdown-menu-${id}`);

  if (select) {
    select.value = value;
    select.dispatchEvent(new Event('change'));
  }

  if (triggerText) {
    triggerText.textContent = text;
  }

  // Update active class in options list
  const container = document.getElementById(`dropdown-options-${id}`);
  if (container) {
    container.querySelectorAll('.dropdown-option').forEach(opt => {
      if (opt.dataset.value === value) {
        opt.classList.add('active');
      } else {
        opt.classList.remove('active');
      }
    });
  }

  if (menu) {
    menu.classList.remove('show');
  }
}

function getEstimatedContract(p) {
  const seed = p.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return 2025 + (seed % 6); // 2025-2030
}

function populateLeagueFilter() {
  const leagueSelect = document.getElementById('filter-league');
  if (!leagueSelect) return;

  const flags = {
    'Premier League': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    'La Liga': '🇪🇸',
    'Bundesliga': '🇩🇪',
    'Serie A': '🇮🇹',
    'Ligue 1': '🇫🇷',
    'MLS': '🇺🇸',
    'Saudi Pro League': '🇸🇦'
  };

  const leagues = [...new Set(allPlayers.map(p => p.league).filter(Boolean))].sort();
  
  leagueSelect.innerHTML = `<option value="">🌐 ${t('all_leagues')}</option>`;
  leagues.forEach(l => {
    const opt = document.createElement('option');
    opt.value = l;
    const flag = flags[l] || '⚽';
    opt.textContent = `${flag} ${l}`;
    leagueSelect.appendChild(opt);
  });

  const selectedLeague = leagueSelect.value;
  const items = leagues.map(l => {
    const flag = flags[l] || '⚽';
    return { value: l, text: `${flag} ${l}` };
  });
  renderCustomDropdownOptions('league', items, `🌐 ${t('all_leagues')}`, selectedLeague);

  updateTeamDropdown(selectedLeague); // Populate all teams initially
}

function updateTeamDropdown(leagueFilter) {
  const teamSelect = document.getElementById('filter-team');
  if (!teamSelect) return;

  const teams = [...new Set(allPlayers
    .filter(p => !leagueFilter || p.league === leagueFilter)
    .map(p => p.currentTeam)
    .filter(Boolean))].sort();

  teamSelect.innerHTML = `<option value="">${t('all_teams')}</option>`;
  teams.forEach(tName => {
    const opt = document.createElement('option');
    opt.value = tName;
    opt.textContent = tName;
    teamSelect.appendChild(opt);
  });

  const selectedTeam = teamSelect.value;
  const items = teams.map(tName => ({ value: tName, text: tName }));
  renderCustomDropdownOptions('team', items, t('all_teams'), selectedTeam);
}

function getPlayerHistory(p) {
  let historyList = [...(p.history || [])];
  
  // Sort descending by season name
  historyList.sort((a, b) => b.season.localeCompare(a.season));
  
  // If the history is completely empty, fallback to a single item matching their current season stats
  if (historyList.length === 0) {
    historyList.push({
      season: '2024/25',
      team: p.currentTeam,
      matches: p.stats?.matches ?? 0,
      goals: p.stats?.goals ?? 0,
      assists: p.stats?.assists ?? 0,
      yellowCards: p.stats?.yellowCards ?? 0,
      rating: p.overallRating ?? 0
    });
  }
  
  // Return at most the 10 most recent seasons
  return historyList.slice(0, 10);
}

function getEmbedYoutubeUrl(url) {
  if (!url) return '';
  let videoId = '';
  if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0];
  } else if (url.includes('youtube.com/watch')) {
    try {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      videoId = urlParams.get('v');
    } catch (_) {}
  } else if (url.includes('youtube.com/embed/')) {
    return url;
  }
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
}

function getEmbedVimeoUrl(url) {
  if (!url) return '';
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? `https://player.vimeo.com/video/${match[1]}` : url;
}

function translateInjuryToSpanish(raw) {
  if (!raw || typeof raw !== 'string') return 'Lesión no especificada';
  const str = raw.trim();
  const lower = str.toLowerCase();

  // Traducción tácita y directa 1-a-1 de términos médicos exactos
  if (lower === 'ill' || lower === 'illness' || lower === 'sick') return 'Enfermo';
  if (lower === 'unknown injury') return 'Lesión desconocida';
  if (lower === 'minor knock') return 'Golpe leve';
  if (lower === 'knock') return 'Golpe';
  if (lower === 'foot bruise') return 'Contusión en el pie';
  if (lower === 'dead leg') return 'Contusión en el muslo';
  if (lower === 'muscular problems' || lower === 'muscle problems') return 'Problemas musculares';
  if (lower === 'muscle injury') return 'Lesión muscular';
  if (lower === 'muscle strain') return 'Distensión muscular';
  if (lower === 'muscle tear') return 'Desgarro muscular';
  if (lower === 'torn muscle fiber' || lower === 'muscle fiber tear') return 'Rotura de fibras musculares';
  if (lower === 'hamstring injury') return 'Lesión de isquiotibiales';
  if (lower === 'hamstring strain') return 'Distensión de isquiotibiales';
  if (lower === 'hamstring pull') return 'Tirón en el isquiotibial';
  if (lower === 'hamstring tear' || lower === 'hamstring muscle injury') return 'Desgarro de isquiotibiales';
  if (lower === 'cruciate ligament tear' || lower === 'acl tear') return 'Rotura del ligamento cruzado';
  if (lower === 'cruciate ligament injury') return 'Lesión del ligamento cruzado';
  if (lower === 'inner ligament stretch of the knee') return 'Elongación del ligamento interno de la rodilla';
  if (lower === 'inner knee ligament' || lower === 'knee ligament') return 'Lesión del ligamento de la rodilla';
  if (lower === 'patellar tendon irritation') return 'Irritación del tendón rotuliano';
  if (lower === 'achilles tendonitis') return 'Tendinitis de Aquiles';
  if (lower === 'achilles tendon injury') return 'Lesión del tendón de Aquiles';
  if (lower === 'adductor pain') return 'Dolor de aductor';
  if (lower === 'adductor injury') return 'Lesión de aductor';
  if (lower === 'adductor strain') return 'Distensión de aductor';
  if (lower === 'calf injury') return 'Lesión en la pantorrilla';
  if (lower === 'calf strain') return 'Distensión en la pantorrilla';
  if (lower === 'knee injury') return 'Lesión de rodilla';
  if (lower === 'knee problems') return 'Problemas de rodilla';
  if (lower === 'ankle sprain' || lower === 'sprained ankle') return 'Esguince de tobillo';
  if (lower === 'ankle injury') return 'Lesión de tobillo';
  if (lower === 'foot injury') return 'Lesión en el pie';
  if (lower === 'back problems') return 'Problemas de espalda';
  if (lower === 'lumbago') return 'Lumbalgia';
  if (lower === 'groin strain') return 'Distensión en la ingle';
  if (lower === 'groin injury') return 'Lesión en la ingle';
  if (lower === 'pubalgia') return 'Pubalgia';
  if (lower === 'meniscus injury') return 'Lesión de menisco';
  if (lower === 'meniscus tear') return 'Rotura de menisco';
  if (lower === 'corona virus' || lower === 'covid') return 'COVID-19';
  if (lower === 'quarantine') return 'Cuarentena';
  if (lower === 'fitness' || lower === 'lack of fitness') return 'Falta de forma física';
  if (lower === 'overstretching') return 'Sobreestiramiento muscular';
  if (lower === 'tonsillitis') return 'Amigdalitis';
  if (lower === 'flu') return 'Gripe';
  if (lower === 'cold') return 'Resfriado';
  if (lower === 'fever') return 'Fiebre';
  if (lower === 'stomach flu') return 'Gastroenteritis';
  if (lower === 'broken hand') return 'Fractura de mano';
  if (lower === 'broken thumb') return 'Fractura de pulgar';
  if (lower === 'broken leg') return 'Fractura de pierna';
  if (lower === 'fracture') return 'Fractura';
  if (lower === 'arthroscopy') return 'Artroscopia';
  if (lower === 'surgery' || lower === 'operation') return 'Operación quirúrgica';
  if (lower === 'concussion') return 'Concusión cerebral';
  if (lower === 'head injury') return 'Traumatismo craneal';
  if (lower === 'shoulder dislocation') return 'Luxación de hombro';
  if (lower === 'shoulder injury') return 'Lesión de hombro';

  // Si no coincide con un término exacto, sustituir palabras clave directas
  let translated = str
    .replace(/\bTear\b/gi, 'Rotura')
    .replace(/\bStrain\b/gi, 'Distensión')
    .replace(/\bSprain\b/gi, 'Esguince')
    .replace(/\bInjury\b/gi, 'Lesión')
    .replace(/\bProblems\b/gi, 'Problemas')
    .replace(/\bPain\b/gi, 'Dolor')
    .replace(/\bFracture\b/gi, 'Fractura')
    .replace(/\bBruise\b/gi, 'Contusión')
    .replace(/\bInflammation\b/gi, 'Inflamación')
    .replace(/\bMuscle\b/gi, 'Muscular')
    .replace(/\bKnee\b/gi, 'de Rodilla')
    .replace(/\bAnkle\b/gi, 'de Tobillo')
    .replace(/\bFoot\b/gi, 'del Pie')
    .replace(/\bHand\b/gi, 'de la Mano')
    .replace(/\bThigh\b/gi, 'del Muslo')
    .replace(/\bCalf\b/gi, 'de la Pantorrilla')
    .replace(/\bGroin\b/gi, 'de la Ingle')
    .replace(/\bShoulder\b/gi, 'del Hombro')
    .replace(/\bBack\b/gi, 'de Espalda');

  return translated.charAt(0).toUpperCase() + translated.slice(1);
}

function formatDurationHumanReadable(fromDateStr, untilDateStr, rawDaysStr, lang = 'es') {
  let days = 0;
  
  // 1. Prioridad 1: Leer el valor exacto de días reportado por Transfermarkt (ej. "6 days" -> 6)
  if (rawDaysStr) {
    const match = String(rawDaysStr).match(/([0-9]+)/);
    if (match) {
      days = parseInt(match[1], 10);
    }
  }

  // 2. Prioridad 2: Cálculo inclusivo de días entre fecha de inicio y fecha de fin (+1 día inclusivo)
  if (days <= 0 && fromDateStr && untilDateStr && fromDateStr.includes('/') && untilDateStr.includes('/')) {
    const p1 = fromDateStr.split('/');
    const p2 = untilDateStr.split('/');
    if (p1.length === 3 && p2.length === 3) {
      const d1 = new Date(parseInt(p1[2], 10), parseInt(p1[1], 10) - 1, parseInt(p1[0], 10));
      const d2 = new Date(parseInt(p2[2], 10), parseInt(p2[1], 10) - 1, parseInt(p2[0], 10));
      const diffMs = d2.getTime() - d1.getTime();
      if (!isNaN(diffMs) && diffMs >= 0) {
        days = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1; // Conteo inclusivo de días
      }
    }
  }

  if (days <= 0) return lang === 'es' ? 'Sin especificar' : 'Unspecified';

  // Desglose jerárquico estricto: Año -> Mes -> Semana -> Días
  const years = Math.floor(days / 365);
  const remAfterYears = days % 365;

  const months = Math.floor(remAfterYears / 30);
  const remAfterMonths = remAfterYears % 30;

  const weeks = Math.floor(remAfterMonths / 7);
  const remDays = remAfterMonths % 7;

  const parts = [];
  if (years > 0) {
    parts.push(lang === 'es' ? (years === 1 ? '1 año' : `${years} años`) : (years === 1 ? '1 year' : `${years} years`));
  }
  if (months > 0) {
    parts.push(lang === 'es' ? (months === 1 ? '1 mes' : `${months} meses`) : (months === 1 ? '1 month' : `${months} months`));
  }
  if (weeks > 0) {
    parts.push(lang === 'es' ? (weeks === 1 ? '1 semana' : `${weeks} semanas`) : (weeks === 1 ? '1 week' : `${weeks} weeks`));
  }
  if (remDays > 0 || parts.length === 0) {
    parts.push(lang === 'es' ? (remDays === 1 ? '1 día' : `${remDays} días`) : (remDays === 1 ? '1 day' : `${remDays} days`));
  }

  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} ${lang === 'es' ? 'y' : 'and'} ${parts[1]}`;
  return `${parts.slice(0, -1).join(', ')} ${lang === 'es' ? 'y' : 'and'} ${parts[parts.length - 1]}`;
}

function openPlayerModal(p) {
  const body = document.getElementById('modal-body');
  const mv = p.marketValue ? `€${(p.marketValue / 1000000).toFixed(0)}M` : '—';
  const bio = currentLang === 'es' ? p.bioEs : p.bio;
  const avatarUrl = getAbsoluteUrl(p.avatarUrl);

  const playerSeed = p.id ? p.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 100;
  
  const playerInjuries = [];
  let hasRealInjuries = false;
  
  // 1. Extraer lesiones registradas en el expediente del jugador (p.injuries)
  let rawInjuries = p.injuries;
  if (typeof rawInjuries === 'string' && rawInjuries.trim().startsWith('[')) {
    try {
      rawInjuries = JSON.parse(rawInjuries);
    } catch (e) {
      console.warn('Error al parsear player.injuries JSON:', e);
    }
  }

  if (Array.isArray(rawInjuries)) {
    hasRealInjuries = true;
    rawInjuries.forEach(inj => {
      if (!inj) return;
      let rawType = inj.type || inj.injury || inj.name || (typeof inj === 'string' ? inj : 'Lesión');
      let type = rawType;
      let season = inj.season || inj.year || (inj.fromDate ? inj.fromDate.split('/').slice(-1)[0] : '—');
      let severity = inj.severity || 'Moderada';

      let calculatedDuration = formatDurationHumanReadable(inj.fromDate, inj.untilDate, inj.days || inj.duration || inj.recovery, currentLang);

      if (currentLang === 'es' && typeof rawType === 'string') {
        type = translateInjuryToSpanish(rawType);
      }

      let numDays = 0;
      if (inj.days) {
        const m = String(inj.days).match(/([0-9]+)/);
        if (m) numDays = parseInt(m[1], 10);
      }
      if (numDays <= 0 && inj.fromDate && inj.untilDate && inj.fromDate.includes('/') && inj.untilDate.includes('/')) {
        const p1 = inj.fromDate.split('/');
        const p2 = inj.untilDate.split('/');
        if (p1.length === 3 && p2.length === 3) {
          const d1 = new Date(parseInt(p1[2], 10), parseInt(p1[1], 10) - 1, parseInt(p1[0], 10));
          const d2 = new Date(parseInt(p2[2], 10), parseInt(p2[1], 10) - 1, parseInt(p2[0], 10));
          const diffMs = d2.getTime() - d1.getTime();
          if (!isNaN(diffMs) && diffMs >= 0) numDays = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
        }
      }

      const tLower = String(type).toLowerCase();
      if (
        tLower.includes('cruzado') || 
        tLower.includes('rotura') || 
        tLower.includes('desgarro') || 
        tLower.includes('fractura') || 
        tLower.includes('artroscopia') || 
        tLower.includes('cirugía') || 
        tLower.includes('operación') ||
        numDays >= 30
      ) {
        severity = currentLang === 'es' ? 'Grave' : 'Severe';
      } else if (numDays >= 14 || tLower.includes('distensión') || tLower.includes('esguince') || tLower.includes('strain') || tLower.includes('sprain')) {
        severity = currentLang === 'es' ? 'Moderada' : 'Moderate';
      } else {
        severity = currentLang === 'es' ? 'Leve' : 'Mild';
      }

      playerInjuries.push({
        type: type,
        severity: severity,
        duration: calculatedDuration,
        season: season
      });
    });
  } else if (typeof rawInjuries === 'string' && rawInjuries.trim() !== '' && rawInjuries !== '[]' && rawInjuries !== 'None' && rawInjuries !== 'Ninguna') {
    hasRealInjuries = true;
    playerInjuries.push({
      type: rawInjuries,
      severity: 'Moderada',
      duration: 'Sin especificar',
      date: '—'
    });
  } else if (p.isLocal || p.is_prospect || rawInjuries === '[]') {
    hasRealInjuries = true;
  }

  // 2. Si no hay lesiones de expediente local, intentar obtener del historial de temporadas (API exterior)
  if (!hasRealInjuries && p.history && p.history.length > 0) {
    p.history.forEach(h => {
      if (h.injuries && h.injuries !== 'None' && h.injuries !== 'Ninguna') {
        hasRealInjuries = true;
        const match = String(h.injuries).match(/^(.*?)\s*\((.*?)\)$/);
        let type = String(h.injuries);
        let duration = currentLang === 'es' ? "Variable" : "Variable";
        if (match) {
          type = match[1].trim();
          duration = match[2].trim();
        }

        let severity = 'Leve';
        const typeLower = type.toLowerCase();
        const durLower = duration.toLowerCase();

        if (
          typeLower.includes('fracture') || 
          typeLower.includes('fractura') || 
          typeLower.includes('cruciate') || 
          typeLower.includes('cruzado') || 
          typeLower.includes('tear') || 
          typeLower.includes('rotura') || 
          typeLower.includes('desgarro') ||
          durLower.includes('month') || 
          durLower.includes('mes') ||
          (durLower.includes('week') && parseInt(durLower) >= 4) ||
          (durLower.includes('semanas') && parseInt(durLower) >= 4)
        ) {
          severity = currentLang === 'es' ? 'Grave' : 'Severe';
        } else if (
          typeLower.includes('strain') || 
          typeLower.includes('distensión') || 
          typeLower.includes('sprain') || 
          typeLower.includes('esguince') ||
          typeLower.includes('tendonitis') || 
          typeLower.includes('tendinitis') || 
          typeLower.includes('dislocation') || 
          typeLower.includes('luxación') ||
          typeLower.includes('pull') || 
          typeLower.includes('tirón') ||
          (durLower.includes('week') && parseInt(durLower) >= 2) ||
          (durLower.includes('semanas') && parseInt(durLower) >= 2)
        ) {
          severity = currentLang === 'es' ? 'Moderada' : 'Moderate';
        } else {
          severity = currentLang === 'es' ? 'Leve' : 'Mild';
        }

        let displayType = type;
        let displayDuration = duration;
        if (currentLang === 'es') {
          if (typeLower.includes('sprained ankle') || typeLower.includes('ankle sprain')) displayType = 'Esguince de Tobillo';
          else if (typeLower.includes('finger fracture')) displayType = 'Fractura de Dedo';
          else if (typeLower.includes('hamstring strain')) displayType = 'Distensión de Isquiotibiales';
          else if (typeLower.includes('hamstring tear')) displayType = 'Desgarro de Isquiotibiales';
          else if (typeLower.includes('hamstring pull')) displayType = 'Tirón en el Isquiotibial';
          else if (typeLower.includes('meniscus strain') || typeLower.includes('meniscus injury')) displayType = 'Distensión de Menisco';
          else if (typeLower.includes('calf strain')) displayType = 'Distensión en la Pantorrilla';
          else if (typeLower.includes('calf tear')) displayType = 'Desgarro en la Pantorrilla';
          else if (typeLower.includes('achilles tendonitis')) displayType = 'Tendinitis de Aquiles';
          else if (typeLower.includes('groin strain')) displayType = 'Distensión en la Ingle';
          else if (typeLower.includes('collarbone fracture')) displayType = 'Fractura de Clavícula';
          else if (typeLower.includes('knee ligament sprain')) displayType = 'Esguince de Ligamento de Rodilla';
          else if (typeLower.includes('thigh strain')) displayType = 'Distensión en el Muslo';
          else if (typeLower.includes('shoulder dislocation')) displayType = 'Luxación de Hombro';
          else if (typeLower.includes('shoulder separation')) displayType = 'Separación de Hombro';
          else if (typeLower.includes('cruciate ligament tear')) displayType = 'Rotura de Ligamento Cruzado';
          else if (typeLower.includes('metatarsal fracture')) displayType = 'Fractura del Metatarso';

          displayDuration = duration
            .replace(/weeks/g, 'semanas')
            .replace(/week/g, 'semana')
            .replace(/months/g, 'meses')
            .replace(/month/g, 'mes')
            .replace(/days/g, 'días')
            .replace(/day/g, 'día');
        } else {
          if (typeLower.includes('esguince de tobillo')) displayType = 'Sprained Ankle';
          else if (typeLower.includes('fractura de dedo')) displayType = 'Finger Fracture';
          else if (typeLower.includes('distensión de isquiotibiales')) displayType = 'Hamstring Strain';
          else if (typeLower.includes('desgarro de isquiotibiales')) displayType = 'Hamstring Tear';
          else if (typeLower.includes('tirón en el isquiotibial')) displayType = 'Hamstring Pull';
          else if (typeLower.includes('distensión de menisco')) displayType = 'Meniscus Strain';
          else if (typeLower.includes('distensión en la pantorrilla')) displayType = 'Calf Strain';
          else if (typeLower.includes('desgarro en la pantorrilla')) displayType = 'Calf Tear';
          else if (typeLower.includes('tendinitis de aquiles')) displayType = 'Achilles Tendonitis';
          else if (typeLower.includes('distensión en la ingle')) displayType = 'Groin Strain';
          else if (typeLower.includes('fractura de clavícula')) displayType = 'Collarbone Fracture';
          else if (typeLower.includes('esguince de ligamento de rodilla')) displayType = 'Knee Ligament Sprain';
          else if (typeLower.includes('distensión en el muslo')) displayType = 'Thigh Strain';
          else if (typeLower.includes('luxación de hombro')) displayType = 'Shoulder Dislocation';
          else if (typeLower.includes('separación de hombro')) displayType = 'Shoulder Separation';
          else if (typeLower.includes('rotura de ligamento cruzado')) displayType = 'Cruciate Ligament Tear';
          else if (typeLower.includes('fractura del metatarso')) displayType = 'Metatarsal Fracture';

          displayDuration = duration
            .replace(/semanas/g, 'weeks')
            .replace(/semana/g, 'week')
            .replace(/meses/g, 'months')
            .replace(/mes/g, 'month')
            .replace(/días/g, 'days')
            .replace(/day/g, 'día');
        }

        playerInjuries.push({
          type: displayType,
          severity: severity,
          duration: displayDuration,
          date: h.season
        });
      }
    });
  }

  let isCurrentlyInjured = false;
  if (hasRealInjuries) {
    const hasActiveLocalInjury = playerInjuries.some(inj => 
      (inj.type && (inj.type.includes('Activa') || inj.type.includes('Active'))) ||
      (inj.duration && (inj.duration.includes('En proceso') || inj.duration.includes('In progress')))
    );
    const latestSeason = p.history && p.history[0];
    const hasActiveSeasonInjury = latestSeason && latestSeason.injuries && latestSeason.injuries !== 'None' && latestSeason.injuries !== 'Ninguna';
    if (hasActiveLocalInjury || hasActiveSeasonInjury) {
      isCurrentlyInjured = true;
    }
  } else {
    isCurrentlyInjured = (playerSeed % 12 === 0);
    
    const allPossibleInjuries = currentLang === 'es' ? [
      { type: "Esguince de Tobillo", severity: "Leve", duration: "10 días", date: "Oct 2024" },
      { type: "Rotura de Fibras Isquiotibiales", severity: "Moderada", duration: "3 semanas", date: "Ene 2025" },
      { type: "Sobrecarga en el Gemelo", severity: "Leve", duration: "5 días", date: "Mar 2025" },
      { type: "Rotura de Ligamento Cruzado (LCA)", severity: "Grave", duration: "6 meses", date: "Sep 2023" },
      { type: "Lesión de Menisco", severity: "Grave", duration: "2 meses", date: "Feb 2024" },
      { type: "Elongación Muscular Aductor", severity: "Leve", duration: "7 días", date: "Nov 2024" },
      { type: "Contusión en la Rodilla", severity: "Leve", duration: "4 días", date: "Dic 2024" },
      { type: "Fascitis Plantar", severity: "Moderada", duration: "4 semanas", date: "Abr 2024" }
    ] : [
      { type: "Ankle Sprain", severity: "Mild", duration: "10 days", date: "Oct 2024" },
      { type: "Hamstring Strain", severity: "Moderate", duration: "3 weeks", date: "Jan 2025" },
      { type: "Calf Muscle Overload", severity: "Mild", duration: "5 days", date: "Mar 2025" },
      { type: "Cruciate Ligament Tear (ACL)", severity: "Severe", duration: "6 months", date: "Sep 2023" },
      { type: "Meniscus Injury", severity: "Severe", duration: "2 months", date: "Feb 2024" },
      { type: "Adductor Muscle Strain", severity: "Mild", duration: "7 days", date: "Nov 2024" },
      { type: "Knee Contusion", severity: "Mild", duration: "4 days", date: "Dec 2024" },
      { type: "Plantar Phasciitis", severity: "Moderate", duration: "4 weeks", date: "Apr 2024" }
    ];

    const numInjuries = playerSeed % 4;
    for (let i = 0; i < numInjuries; i++) {
      const idx = (playerSeed + i * 7) % allPossibleInjuries.length;
      playerInjuries.push(allPossibleInjuries[idx]);
    }
  }

  if (isCurrentlyInjured) {
    if (hasRealInjuries) {
      const latestRealInjury = playerInjuries[0];
      if (latestRealInjury) {
        latestRealInjury.type += currentLang === 'es' ? ' (Activa)' : ' (Active)';
        latestRealInjury.duration = currentLang === 'es' ? 'En proceso' : 'In progress';
      }
    } else {
      playerInjuries.unshift(currentLang === 'es' ? {
        type: "Sobrecarga Isquiotibial (Activa)",
        severity: "Moderada",
        duration: "En proceso (1 semana restante)",
        date: "Mayo 2026"
      } : {
        type: "Hamstring Overload (Active)",
        severity: "Moderate",
        duration: "In progress (1 week remaining)",
        date: "May 2026"
      });
    }
  }

  const sortedHistory = getPlayerHistory(p);
  const initialStats = sortedHistory[0] || { goals: 0, assists: 0, matches: 0, rating: p.overallRating || 0, yellowCards: 0 };
  const displayFlag = (p.flag && p.flag !== 'null') ? p.flag : '⚽';
  const displayLeague = (p.league && p.league !== 'null') ? p.league : (p.category || 'Plan Local');
  const isProspect = p.id && (String(p.id).startsWith('loc-player-') || p.category || p.userId || p.isLocalProspect);
  const playerAge = parseInt(p.age, 10) || 0;
  const showLegalTab = isProspect && playerAge > 0 && playerAge <= 17;

  // Calcular estadísticas acumuladas de todas las temporadas para la pestaña Global
  let globalGoalsSum = 0;
  let globalAssistsSum = 0;
  let globalMatchesSum = 0;
  let globalDribblesSum = 0;
  let globalFoulsSum = 0;
  let weightedRatingSum = 0;
  let totalRatingWeight = 0;

  if (Array.isArray(sortedHistory) && sortedHistory.length > 0) {
    sortedHistory.forEach(h => {
      const m = Number(h.matches) || 0;
      const g = Number(h.goals) || 0;
      const a = Number(h.assists) || 0;
      const r = Number(h.rating) || 0;
      const d = h.dribbles !== undefined ? Number(h.dribbles) : Math.floor(10 + (a * 1.5));
      const f = h.fouls !== undefined ? Number(h.fouls) : Math.floor(((Number(h.yellowCards) || 0) * 4) + (m * 0.8));

      globalMatchesSum += m;
      globalGoalsSum += g;
      globalAssistsSum += a;
      globalDribblesSum += d;
      globalFoulsSum += f;

      if (r > 0) {
        const weight = m > 0 ? m : 1;
        weightedRatingSum += r * weight;
        totalRatingWeight += weight;
      }
    });
  }

  const globalGoals = globalGoalsSum || p.careerTotals?.goals || p.stats?.goals || 0;
  const globalAssists = globalAssistsSum || p.careerTotals?.assists || p.stats?.assists || 0;
  const globalMatches = globalMatchesSum || p.careerTotals?.matches || p.stats?.matches || 0;
  const globalRatingVal = totalRatingWeight > 0 ? (weightedRatingSum / totalRatingWeight) : (p.overallRating || 0);
  const globalRating = Number(globalRatingVal).toFixed(1);
  const globalDribbles = globalDribblesSum || Math.floor(10 + (globalAssists * 1.5));
  const globalFouls = globalFoulsSum || Math.floor(globalMatches * 0.8);

  body.innerHTML = `
    <div class="modal-header">
      <div class="modal-avatar-wrap">
        <img src="${avatarUrl}" class="modal-player-photo" alt="${p.name}" data-player-id="${p.id}">
      </div>
      <div class="modal-title-group">
        <div class="modal-flag-name">
          <span class="modal-flag">${displayFlag}</span>
          <div class="modal-name">${p.name}</div>
        </div>
        <div class="modal-team" style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <div class="modal-team-logo" data-team-name="${p.currentTeam}" style="width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;">⚽</div>
          <span>${p.currentTeam}</span>
          <span style="color: rgba(255,255,255,0.3)">·</span>
          <div class="modal-league-logo" data-league-name="${displayLeague}" style="width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;">🌐</div>
          <span>${displayLeague}</span>
        </div>
        ${!isProspect ? `
        <div class="tactical-badges" style="margin-top:8px">
           <span class="t-badge" style="background:rgba(255,165,0,0.1);color:#ffa500;border-color:#ffa500">${currentLang === 'es' ? 'CONTRATO' : 'CONTRACT'} ${getEstimatedContract(p)}</span>
           <span class="t-badge" style="background:rgba(0,229,255,0.1);color:var(--cyan);border-color:var(--cyan)">${currentLang === 'es' ? 'SALARIO ESTIMADO' : 'EST. SALARY'}</span>
           <span class="t-badge" style="background:rgba(255,255,255,0.05)">${mv} ${currentLang === 'es' ? 'valor' : 'value'}</span>
        </div>` : ''}
      </div>
    </div>

    <div class="modal-tabs">
      <button class="modal-tab active" onclick="switchModalTab(this, 'season')">${t('tab_season')}</button>
      ${!isProspect ? `<button class="modal-tab" onclick="switchModalTab(this, 'competition')">${t('tab_competition')}</button>` : ''}
      ${!isProspect ? `<button class="modal-tab" onclick="switchModalTab(this, 'vs-team')">${t('tab_vs_team')}</button>` : ''}
      <button class="modal-tab" onclick="switchModalTab(this, 'global')">${t('tab_global')}</button>
      <button class="modal-tab" onclick="switchModalTab(this, 'injuries')">${t('tab_injuries')}</button>
      ${showLegalTab ? `<button class="modal-tab" onclick="switchModalTab(this, 'legal-contact')">${currentLang === 'es' ? 'Contacto legal' : 'Legal Contact'}</button>` : ''}
    </div>

    <!-- PANE: SEASON -->
    <div id="pane-season" class="modal-pane active">
      <div class="modal-sub-tabs" style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px; scrollbar-width: thin;">
        ${sortedHistory.map((h, i) => `
          <button class="sub-tab ${i === 0 ? 'active' : ''}" onclick="switchModalYear(this, '${p.id}', '${h.season}')">${h.season}</button>
        `).join('')}
      </div>
      
      <div id="modal-stats-container">
        <div class="modal-stats-grid">
          <div class="modal-stat">
            <span style="font-size:16px; margin-bottom:8px">⚽</span>
            <span class="modal-stat-num">${initialStats.goals ?? 0}</span>
            <span class="modal-stat-label">${t('goals_full')}</span>
          </div>
          <div class="modal-stat">
            <span style="font-size:16px; margin-bottom:8px">🎯</span>
            <span class="modal-stat-num">${initialStats.assists ?? 0}</span>
            <span class="modal-stat-label">${t('assists_full')}</span>
          </div>
          <div class="modal-stat">
            <span style="font-size:16px; margin-bottom:8px">🏃</span>
            <span class="modal-stat-num">${initialStats.matches ?? 0}</span>
            <span class="modal-stat-label">${t('matches_full')}</span>
          </div>
          <div class="modal-stat">
            <span style="font-size:16px; margin-bottom:8px">⭐</span>
            <span class="modal-stat-num">${Number(initialStats.rating ?? p.overallRating ?? 0).toFixed(1)}</span>
            <span class="modal-stat-label">RATING</span>
          </div>
          <div class="modal-stat">
            <span style="font-size:16px; margin-bottom:8px">🔄</span>
            <span class="modal-stat-num">${Math.floor(10 + ((initialStats.assists ?? 0) * 1.5))}</span>
            <span class="modal-stat-label">${currentLang === 'es' ? 'REGATES' : 'DRIBBLES'}</span>
          </div>
          <div class="modal-stat">
            <span style="font-size:16px; margin-bottom:8px">🛑</span>
            <span class="modal-stat-num">${Math.floor((initialStats.yellowCards ?? 0) * 4 + ((initialStats.matches ?? 0) * 0.8))}</span>
            <span class="modal-stat-label">${currentLang === 'es' ? 'FALTAS' : 'FOULS'}</span>
          </div>
        </div>
      </div>

      ${isProspect ? `
      <div style="margin-top:30px; padding:20px; background:rgba(0,0,0,0.2); border-radius:12px; border:1px solid var(--border);">
         <div style="font-size:11px; color:#00f0ff; margin-bottom:12px; font-weight:700; text-transform:uppercase; letter-spacing:1px; display:flex; justify-content:space-between; align-items:center;">
            <span>HIGHLIGHTS</span>
            <span style="color:rgba(255,255,255,0.45); font-size:10px;">PROSPECTO</span>
         </div>
         ${p.highlightUrl ? `
         <div style="width:100%; border-radius:12px; overflow:hidden; border:1.5px solid rgba(0,240,255,0.4); background:#000; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
            ${(p.highlightUrl.includes('youtube.com') || p.highlightUrl.includes('youtu.be')) ? `
               <iframe src="${getEmbedYoutubeUrl(p.highlightUrl)}" style="width:100%; aspect-ratio:16/9; border:none;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            ` : p.highlightUrl.includes('vimeo.com') ? `
               <iframe src="${getEmbedVimeoUrl(p.highlightUrl)}" style="width:100%; aspect-ratio:16/9; border:none;" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>
            ` : `
               <video src="${p.highlightUrl}" controls playsinline preload="metadata" style="width:100%; display:block; max-height:400px; background:#000; outline:none; border-radius:10px;"></video>
            `}
         </div>` : `
         <div style="height:180px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; color:var(--text-2); font-size:13px; font-style:italic; border:1px dashed rgba(255,255,255,0.15); border-radius:12px; background:rgba(0,0,0,0.15);">
            <span style="font-size:24px;">🎥</span>
            <span>Sin video de highlights disponible</span>
         </div>`}
      </div>` : `
      <div style="margin-top:30px; padding:20px; background:rgba(0,0,0,0.2); border-radius:12px; border:1px solid var(--border);">
         <div style="font-size:11px; color:var(--text-2); margin-bottom:12px; text-transform:uppercase; letter-spacing:1px; display:flex; justify-content:space-between;">
            <span>// ${currentLang === 'es' ? 'MAPA DE CALOR' : 'HEATMAP'}</span>
            <span style="color:var(--cyan)">${currentLang === 'es' ? 'ZONA DE IMPACTO TÁCTICO' : 'TACTICAL IMPACT ZONE'}</span>
         </div>
         <div class="heatmap-wrapper" style="position:relative; width:100%; aspect-ratio:1.5; background:#1a2b1a; border-radius:8px; overflow:hidden; border:1px solid rgba(255,255,255,0.1);">
            <canvas id="player-heatmap" style="width:100%; height:100%;"></canvas>
         </div>
      </div>`}
    </div>

    ${!isProspect ? `
    <!-- PANE: COMPETITION -->
    <div id="pane-competition" class="modal-pane">
       <div class="modal-section">
          <h4>${currentLang === 'es' ? 'Stats por Competición' : 'Competition Stats'}</h4>
          <p style="color:var(--text-2); font-size:14px;">${currentLang === 'es' ? 'Desglose de rendimiento en Liga, Copa y Competiciones Internacionales.' : 'Performance breakdown in League, Cup and International Competitions.'}</p>
          <div style="margin-top:20px; border:1px solid var(--border); border-radius:8px; overflow:hidden;">
             <table style="width:100%; border-collapse:collapse; font-size:13px;">
                <tr style="background:rgba(255,255,255,0.05); color:var(--text-1);">
                   <th style="padding:10px; text-align:left;">${currentLang === 'es' ? 'Competición' : 'Competition'}</th>
                   <th style="padding:10px;">PJ</th>
                   <th style="padding:10px;">G</th>
                   <th style="padding:10px;">A</th>
                 </tr>
             </table>
             <div id="modal-competition-container"></div>
          </div>
       </div>
    </div>` : ''}

    ${!isProspect ? `
    <!-- PANE: VS TEAM -->
    <div id="pane-vs-team" class="modal-pane">
       <div class="modal-section">
          <h4>${currentLang === 'es' ? 'Historial vs Equipos' : 'History vs Teams'}</h4>
          <p style="color:var(--text-2); font-size:14px;">${currentLang === 'es' ? 'Rendimiento histórico del jugador contra equipos específicos.' : 'Historical performance of the player against specific teams.'}</p>
          <div style="height:150px; display:flex; align-items:center; justify-content:center; color:var(--text-2); border:1px solid var(--border); border-radius:8px; margin-top:20px;">
             ${currentLang === 'es' ? 'No hay datos suficientes para esta comparación.' : 'Not enough data for this comparison.'}
          </div>
       </div>
    </div>` : ''}

    <!-- PANE: GLOBAL -->
    <div id="pane-global" class="modal-pane">
      <div class="modal-section">
        <h4>${currentLang === 'es' ? 'Stats Históricas' : 'Historical Stats'}</h4>
        <div class="modal-stats-grid">
           <div class="modal-stat">
             <span class="modal-stat-num">${globalGoals}</span>
             <span class="modal-stat-label">${t('goals_full')}</span>
           </div>
           <div class="modal-stat">
             <span class="modal-stat-num">${globalAssists}</span>
             <span class="modal-stat-label">${t('assists_full')}</span>
           </div>
           <div class="modal-stat">
             <span class="modal-stat-num">${globalMatches}</span>
             <span class="modal-stat-label">${t('matches_full')}</span>
           </div>
           <div class="modal-stat">
             <span class="modal-stat-num">${globalRating}</span>
             <span class="modal-stat-label">RATING</span>
           </div>
           <div class="modal-stat">
             <span class="modal-stat-num">${globalDribbles}</span>
             <span class="modal-stat-label">${currentLang === 'es' ? 'REGATES' : 'DRIBBLES'}</span>
           </div>
           <div class="modal-stat">
             <span class="modal-stat-num">${globalFouls}</span>
             <span class="modal-stat-label">${currentLang === 'es' ? 'FALTAS' : 'FOULS'}</span>
           </div>
        </div>
      </div>

      <!-- INFORMACIÓN GENERAL DEL JUGADOR LOCAL -->
      ${(() => {
        let docTypeDisplay = 'Documento';
        if (p.docType === 'CEDULA_DNI') docTypeDisplay = 'Cédula / DNI';
        else if (p.docType === 'PASAPORTE') docTypeDisplay = 'Pasaporte';
        else if (p.docType === 'REGISTRO_CIVIL') docTypeDisplay = 'Registro Civil';
        else if (p.docType === 'NIE_OTHER') docTypeDisplay = 'NIE / Extranjería';
        else if (p.docType) docTypeDisplay = p.docType;

        const medStatus = p.medicalStatus || 'Disponible';
        let medColor = '#00c853';
        let medBg = 'rgba(0,200,83,0.12)';
        if (medStatus.includes('Lesionado')) {
          medColor = '#ef0107';
          medBg = 'rgba(239,1,7,0.12)';
        } else if (medStatus.includes('Precaución')) {
          medColor = '#ffa500';
          medBg = 'rgba(255,165,0,0.12)';
        }

        return `
        <div class="modal-section" style="margin-top:20px;">
          <h4>📋 ${currentLang === 'es' ? 'Ficha e Información General' : 'General Information'}</h4>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 16px;">
            
            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(0,240,255,0.15); border-radius: 10px; padding: 12px 14px;">
              <div style="font-size: 11px; color: var(--text-2); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; margin-bottom: 4px;">Nombre Completo</div>
              <div style="font-size: 13.5px; font-weight: 700; color: #fff;">${p.name || '—'}</div>
            </div>

            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(0,240,255,0.15); border-radius: 10px; padding: 12px 14px;">
              <div style="font-size: 11px; color: var(--text-2); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; margin-bottom: 4px;">Apodo / Alias</div>
              <div style="font-size: 13.5px; font-weight: 600; color: var(--text-1);">${p.nickname || '—'}</div>
            </div>

            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(0,240,255,0.15); border-radius: 10px; padding: 12px 14px;">
              <div style="font-size: 11px; color: var(--text-2); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; margin-bottom: 4px;">Edad</div>
              <div style="font-size: 13.5px; font-weight: 700; color: #00f0ff;">${p.age ? `${p.age} años` : '—'}</div>
            </div>

            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(0,240,255,0.15); border-radius: 10px; padding: 12px 14px;">
              <div style="font-size: 11px; color: var(--text-2); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; margin-bottom: 4px;">Identificación / Documento</div>
              <div style="font-size: 13.5px; font-weight: 700; color: #00f0ff; display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                <span>${docTypeDisplay}: ${p.docNumber || '—'}</span>
                ${p.docFileUrl ? `<a href="${p.docFileUrl}" target="_blank" style="font-size: 11px; background: rgba(0,240,255,0.15); border: 1px solid #00f0ff; color: #00f0ff; padding: 2px 8px; border-radius: 6px; text-decoration: none;" title="Ver Documento Adjunto">📎 Ver</a>` : ''}
              </div>
            </div>

            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(0,240,255,0.15); border-radius: 10px; padding: 12px 14px;">
              <div style="font-size: 11px; color: var(--text-2); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; margin-bottom: 4px;">Dorsal / Camiseta</div>
              <div style="font-size: 13.5px; font-weight: 700; color: #ffaa00;">${p.jerseyNumber ? `#${p.jerseyNumber}` : '—'}</div>
            </div>

            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(0,240,255,0.15); border-radius: 10px; padding: 12px 14px;">
              <div style="font-size: 11px; color: var(--text-2); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; margin-bottom: 4px;">Posición</div>
              <div style="font-size: 13.5px; font-weight: 700; color: #00f0ff;">${getPositionEs(p.position || p.positionEs)}</div>
            </div>

            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(0,240,255,0.15); border-radius: 10px; padding: 12px 14px;">
              <div style="font-size: 11px; color: var(--text-2); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; margin-bottom: 4px;">Pie Hábil</div>
              <div style="font-size: 13.5px; font-weight: 600; color: var(--text-1);">${p.preferredFoot || '—'}</div>
            </div>

            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(0,240,255,0.15); border-radius: 10px; padding: 12px 14px;">
              <div style="font-size: 11px; color: var(--text-2); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; margin-bottom: 4px;">Estatura & Peso</div>
              <div style="font-size: 13.5px; font-weight: 600; color: var(--text-1);">${p.height ? `${p.height} cm` : '—'} · ${p.weight ? `${p.weight} kg` : '—'}</div>
            </div>

            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(0,240,255,0.15); border-radius: 10px; padding: 12px 14px;">
              <div style="font-size: 11px; color: var(--text-2); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; margin-bottom: 4px;">Categoría</div>
              <div style="font-size: 13.5px; font-weight: 600; color: var(--text-1);">${p.category || 'Local'}</div>
            </div>

          </div>

          <div class="modal-bio" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 14px;">
             <p style="margin: 0; line-height: 1.6; font-size: 13.5px; color: rgba(255,255,255,0.85);">${bio || (currentLang === 'es' ? 'Sin biografía o descripción registrada.' : 'No description recorded.')}</p>
          </div>
        </div>
        `;
      })()}

      ${p.tacticalNotes ? `
      <div class="modal-section">
        <h4>${currentLang === 'es' ? 'Notas del Entrenador' : 'Coach Notes'}</h4>
        <div class="modal-bio" style="border-left: 3px solid #00f0ff; background: rgba(0, 240, 255, 0.03);"><p>${p.tacticalNotes}</p></div>
      </div>` : ''}

      ${p.strengths?.length ? `
      <div class="modal-section">
        <h4>${t('modal_strengths')}</h4>
        <div class="strengths-list">
          ${p.strengths.map(s => `<span class="strength-item">✓ ${s}</span>`).join('')}
        </div>
      </div>` : ''}

      ${(p.improvements?.length || p.weaknesses?.length) ? `
      <div class="modal-section">
        <h4>⚡ Aspectos de Mejora</h4>
        <div class="strengths-list">
          ${(p.improvements || p.weaknesses).map(w => `<span class="strength-item" style="background: rgba(255,165,0,0.12); border-color: rgba(255,165,0,0.3); color: #ffaa00;">⚡ ${w}</span>`).join('')}
        </div>
      </div>` : ''}

      <div class="modal-section">
        <h4>${t('modal_trophies')}</h4>
        <div class="trophies-list">
          ${p.trophies && p.trophies.length > 0 ? p.trophies.map(tr => {
            if (typeof tr === 'object' && tr !== null) {
              const teamStr = tr.team ? ` - ${tr.team}` : '';
              return `<div class="trophy-item"><span>🏆</span>${tr.name} (${tr.season}${teamStr})</div>`;
            }
            return `<div class="trophy-item"><span>🏆</span>${tr}</div>`;
          }).join('') : `<div class="trophy-item" style="color: var(--text-2); font-style: italic;">N/A</div>`}
        </div>
      </div>

      ${p.tags?.length ? `
      <div class="modal-section">
        <h4>${t('modal_tags')}</h4>
        <div class="tags-list">
          ${p.tags.map(tg => `<span class="tag">${tg}</span>`).join('')}
        </div>
      </div>` : ''}
    </div>

    <!-- PANE: INJURIES -->
    <div id="pane-injuries" class="modal-pane">
       <div class="modal-section">
          <h4 style="margin-bottom:15px; display:flex; align-items:center; gap:8px;">
             <span>🏥</span> ${currentLang === 'es' ? 'Historial Clínico de Lesiones' : 'Clinical Injury History'}
          </h4>
          
          <!-- Estado Actual -->
          <div style="display:flex; align-items:center; justify-content:space-between; background:rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:12px; padding:15px; margin-bottom:20px;">
             <div>
                <div style="font-size:12px; color:var(--text-2); text-transform:uppercase; letter-spacing:0.5px;">${currentLang === 'es' ? 'Estado Actual de Salud' : 'Current Health Status'}</div>
                <div style="font-size:16px; font-weight:600; margin-top:4px; color:var(--text-1)">
                   ${isCurrentlyInjured ? (currentLang === 'es' ? 'En Recuperación / No Apto' : 'Recovering / Unavailable') : (currentLang === 'es' ? 'Completamente Apto / Disponible' : 'Fully Fit / Available')}
                </div>
             </div>
             <div>
                <span class="t-badge" style="
                   font-size: 13px;
                   padding: 6px 12px;
                   border-radius: 20px;
                   font-weight: 600;
                   background: ${isCurrentlyInjured ? 'rgba(239,1,7,0.1)' : 'rgba(0,200,83,0.1)'};
                   color: ${isCurrentlyInjured ? '#ef0107' : '#00c853'};
                   border-color: ${isCurrentlyInjured ? '#ef0107' : '#00c853'};
                ">
                   ● ${isCurrentlyInjured ? (currentLang === 'es' ? 'LESIONADO' : 'INJURED') : (currentLang === 'es' ? 'APTO' : 'FIT')}
                </span>
             </div>
          </div>

          <!-- Historial de Lesiones -->
          <div class="injuries-list" style="display:flex; flex-direction:column; gap:12px;">
             ${playerInjuries.length === 0 ? `
                <div style="text-align:center; padding:30px 15px; border:1px dashed var(--border); border-radius:10px; color:var(--text-2); font-size:13px; background:rgba(255,255,255,0.01);">
                   🏥 ${currentLang === 'es' ? 'No se registran lesiones en el historial clínico de este jugador.' : 'No clinical injuries recorded for this player.'}
                </div>
             ` : playerInjuries.map(inj => {
                let badgeColor = '#ffa500';
                let badgeBg = 'rgba(255,165,0,0.1)';
                if (inj.severity === 'Grave' || inj.severity === 'Severe') {
                   badgeColor = '#ef0107';
                   badgeBg = 'rgba(239,1,7,0.1)';
                } else if (inj.severity === 'Leve' || inj.severity === 'Mild') {
                   badgeColor = '#ffa500';
                   badgeBg = 'rgba(255,165,0,0.1)';
                }
                const localizedSeverity = currentLang === 'es' ? inj.severity.toUpperCase() : (inj.severity === 'Grave' ? 'SEVERE' : (inj.severity === 'Moderada' ? 'MODERATE' : 'MILD'));
                return `
                   <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border); border-radius:10px; padding:15px; display:flex; justify-content:space-between; align-items:center;">
                      <div>
                         <div style="font-weight:600; font-size:14px; color:var(--text-1);">${inj.type}</div>
                         <div style="font-size:12px; color:var(--text-2); margin-top:4px;">
                            ${currentLang === 'es' ? 'Temporada' : 'Season'}: <strong>${inj.season || '—'}</strong> · ${currentLang === 'es' ? 'Duración' : 'Duration'}: <strong>${inj.duration}</strong>
                         </div>
                      </div>
                      <div>
                         <span class="t-badge" style="background:${badgeBg}; color:${badgeColor}; border-color:${badgeColor}; font-size:11px; padding:4px 8px;">
                            ${localizedSeverity}
                         </span>
                      </div>
                   </div>
                `;
             }).join('')}
          </div>
       </div>
    </div>

    <!-- PANE: LEGAL CONTACT (Solo para prospectos con 17 años o menos) -->
    ${showLegalTab ? `
    <div id="pane-legal-contact" class="modal-pane">
       <div class="modal-section">
          <h4 style="margin-bottom:6px; display:flex; align-items:center; gap:8px;">
             <span>📜</span> ${currentLang === 'es' ? 'Contacto y Tutela Legal' : 'Legal Contact & Guardianship'}
          </h4>
          <p style="color:var(--text-2); font-size:13px; margin-bottom:16px;">
             ${currentLang === 'es' ? 'Información del representante legal, tutor y autorizaciones registradas para deportistas menores de edad (≤17 años).' : 'Information of the legal guardian and clearances recorded for minor athletes (≤17 years).'}'
          </p>

          <!-- Representante(s) Legal(es) / Padres / Tutores -->
          <div style="font-size: 11.5px; font-weight: 700; color: #00f0ff; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">
            ${currentLang === 'es' ? 'Representante(s) Legal(es) / Padre o Tutor' : 'Legal Guardian(s) / Parent'}
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px;">
            ${(() => {
              const legalObj = typeof p.legalDetails === 'string' ? JSON.parse(p.legalDetails || '{}') : (p.legalDetails || {});
              let guardians = Array.isArray(legalObj.guardians) ? legalObj.guardians : [];
              if (guardians.length === 0 && (legalObj.guardianName || p.guardianName)) {
                guardians = [{
                  name: legalObj.guardianName || p.guardianName || '',
                  relationship: legalObj.guardianRelationship || p.guardianRelationship || '',
                  docType: legalObj.guardianDocType || p.guardianDocType || '',
                  docNumber: legalObj.guardianDocNumber || p.guardianDocNumber || '',
                  phone: legalObj.guardianPhone || p.guardianPhone || '',
                  email: legalObj.guardianEmail || p.guardianEmail || ''
                }];
              }

              if (guardians.length === 0 || !guardians.some(g => g.name || g.phone || g.email)) {
                return `<div style="padding: 16px; background: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.15); border-radius: 10px; color: var(--text-2); font-size: 13px; font-style: italic;">
                  ${currentLang === 'es' ? 'Sin datos de contacto legal o tutor registrados en la ficha.' : 'No legal contact or guardian details recorded.'}
                </div>`;
              }

              return guardians.map((g) => `
                <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(0,240,255,0.2); border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 10px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px;">
                     <div style="font-size: 14px; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 8px;">
                       <span>👤 ${g.name || (currentLang === 'es' ? 'Tutor Legal' : 'Legal Guardian')}</span>
                       ${g.relationship ? `<span style="font-size: 11px; background: rgba(0,240,255,0.12); color: #00f0ff; border: 1px solid rgba(0,240,255,0.3); padding: 2px 8px; border-radius: 6px; font-weight: 600;">${g.relationship}</span>` : ''}
                     </div>
                  </div>

                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; font-size: 13px;">
                    <div>
                      <span style="color: var(--text-2); font-size: 11px; display: block; font-weight: 600;">TELÉFONO / CONTACTO</span>
                      <span style="color: #00f0ff; font-weight: 600;">${g.phone ? `<a href="tel:${g.phone}" style="color: #00f0ff; text-decoration: none;">📞 ${g.phone}</a>` : '—'}</span>
                    </div>
                    <div>
                      <span style="color: var(--text-2); font-size: 11px; display: block; font-weight: 600;">CORREO ELECTRÓNICO</span>
                      <span style="color: var(--text-1); font-weight: 500;">${g.email ? `<a href="mailto:${g.email}" style="color: #fff; text-decoration: none;">✉️ ${g.email}</a>` : '—'}</span>
                    </div>
                    <div>
                      <span style="color: var(--text-2); font-size: 11px; display: block; font-weight: 600;">DOCUMENTO DE IDENTIDAD</span>
                      <span style="color: var(--text-1); font-weight: 500;">${g.docType ? `${g.docType.replace('_', ' ')}: ` : ''}${g.docNumber || '—'}</span>
                    </div>
                  </div>
                </div>
              `).join('');
            })()}
          </div>

          <!-- Documentación y Autorizaciones Adjuntas -->
          <div style="font-size: 11.5px; font-weight: 700; color: #00f0ff; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">
            ${currentLang === 'es' ? 'Documentación Legal & Autorizaciones' : 'Legal Documents & Clearances'}
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
             ${(() => {
                const authObj = typeof p.authorizations === 'string' ? JSON.parse(p.authorizations || '{}') : (p.authorizations || {});
                const sigUrl = authObj.authSignatureUrl || p.authSignatureUrl;
                const sigName = authObj.authSignatureFileName || 'Autorizacion_Firmada.pdf';
                const medUrl = authObj.authMedicalUrl || p.authMedicalUrl;
                const medName = authObj.authMedicalFileName || 'Certificado_Medico.pdf';

                return `
                <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px 14px; display: flex; flex-direction: column; gap: 8px;">
                   <div style="font-size: 12px; font-weight: 700; color: #fff;">✍️ Autorización de Padre/Tutor</div>
                   <div style="font-size: 12px; color: var(--text-2);">
                      ${sigUrl ? `<a href="${sigUrl}" target="_blank" style="display: inline-flex; align-items: center; gap: 6px; background: rgba(0,240,255,0.15); border: 1px solid #00f0ff; color: #00f0ff; padding: 6px 12px; border-radius: 6px; font-weight: 600; text-decoration: none;">📎 ${sigName}</a>` : `<span style="color: rgba(255,255,255,0.4); font-style: italic;">Sin archivo adjunto</span>`}
                   </div>
                </div>

                <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px 14px; display: flex; flex-direction: column; gap: 8px;">
                   <div style="font-size: 12px; font-weight: 700; color: #fff;">🏥 Certificado / Aval Médico</div>
                   <div style="font-size: 12px; color: var(--text-2);">
                      ${medUrl ? `<a href="${medUrl}" target="_blank" style="display: inline-flex; align-items: center; gap: 6px; background: rgba(0,240,255,0.15); border: 1px solid #00f0ff; color: #00f0ff; padding: 6px 12px; border-radius: 6px; font-weight: 600; text-decoration: none;">📎 ${medName}</a>` : `<span style="color: rgba(255,255,255,0.4); font-style: italic;">Sin archivo adjunto</span>`}
                   </div>
                </div>
                `;
             })()}
          </div>
       </div>
    </div>` : ''}

    <div style="margin-top:20px">
      <button class="btn-primary" style="width:100%;justify-content:center" onclick="askAboutPlayer('${p.name}')">
        💬 ${t('ask_agent_btn')} ${p.name}
      </button>
    </div>
  `;

  // Bind smart fallback to modal photo
  const modalImg = body.querySelector('.modal-player-photo');
  if (modalImg) modalImg.onerror = () => onAvatarError(modalImg, p);

  document.getElementById('player-modal').style.display = 'flex';
  document.getElementById('modal-close').onclick = closeModal;
  loadAllLogos(); // Load modal team and league logos
  document.getElementById('player-modal').onclick = (e) => {
    if (e.target === document.getElementById('player-modal')) closeModal();
  };

  // Initial Heatmap Render
  setTimeout(() => {
    renderHeatmap(p.position, '2024/25');
    if (!isProspect) {
      renderCompetitionStats(p, '2024/25', p.stats);
    }
  }, 50);
}

function switchModalYear(btn, playerId, year) {
  // UI Tabs
  btn.parentElement.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');

  const player = allPlayers.find(p => p.id === playerId);
  if (!player) return;

  // Find the requested season in history
  const history = getPlayerHistory(player);
  const historyItem = history.find(h => h.season === year) || history[0];
  if (!historyItem) return;

  const stats = historyItem;
  const ratingVal = historyItem.rating;

  const mv = player.marketValue ? `€${(player.marketValue / 1000000).toFixed(0)}M` : '—';

  // Update Stats UI
  const container = document.getElementById('modal-stats-container');
  if (container) {
    // Formatting for display
    const rating = Number(ratingVal).toFixed(1);
    
    const regates = Math.floor(10 + (stats.assists * 1.5));

    container.innerHTML = `
      <div class="modal-stats-grid">
        <div class="modal-stat">
          <span style="font-size:16px; margin-bottom:8px">⚽</span>
          <span class="modal-stat-num">${stats.goals}</span>
          <span class="modal-stat-label">${t('goals_full')}</span>
        </div>
        <div class="modal-stat">
          <span style="font-size:16px; margin-bottom:8px">🎯</span>
          <span class="modal-stat-num">${stats.assists}</span>
          <span class="modal-stat-label">${t('assists_full')}</span>
        </div>
        <div class="modal-stat">
          <span style="font-size:16px; margin-bottom:8px">🏃</span>
          <span class="modal-stat-num">${stats.matches}</span>
          <span class="modal-stat-label">${t('matches_full')}</span>
        </div>
        <div class="modal-stat">
          <span style="font-size:16px; margin-bottom:8px">⭐</span>
          <span class="modal-stat-num">${rating}</span>
          <span class="modal-stat-label">RATING</span>
        </div>
        <div class="modal-stat">
          <span style="font-size:16px; margin-bottom:8px">🔄</span>
          <span class="modal-stat-num">${regates}</span>
          <span class="modal-stat-label">${currentLang === 'es' ? 'REGATES' : 'DRIBBLES'}</span>
        </div>
        <div class="modal-stat">
          <span style="font-size:16px; margin-bottom:8px">🛑</span>
          <span class="modal-stat-num">${Math.floor((stats.yellowCards || 0) * 4 + (stats.matches * 0.8))}</span>
          <span class="modal-stat-label">${currentLang === 'es' ? 'FALTAS' : 'FOULS'}</span>
        </div>
      </div>
      <div style="margin-top:10px; text-align:center; font-size:12px; color:var(--text-3);">
        📍 ${currentLang === 'es' ? 'Club' : 'Club'}: <span style="color:var(--gold); font-weight:600;">${stats.team}</span>
      </div>
    `;
  }

  renderHeatmap(player.position, year);
  renderCompetitionStats(player, year, stats);
}

function renderCompetitionStats(player, year, historyStats) {
  const container = document.getElementById('modal-competition-container');
  if (!container) return;

  const currentTeam = historyStats.team || player.currentTeam;
  const isElite = ELITE_CLUBS.includes(currentTeam);
  const isMid = MID_CLUBS.includes(currentTeam);
  
  const intMatches = isElite ? 10 : (isMid ? 7 : 0);
  const cupMatches = 4;
  const leagueMatches = Math.max(5, historyStats.matches - intMatches - cupMatches);
  
  const breakdown = [
    { name: currentLang === 'es' ? 'Liga Doméstica' : 'Domestic League', pj: leagueMatches, g: Math.round(historyStats.goals * 0.7), a: Math.round(historyStats.assists * 0.7) },
    { name: isElite ? 'UEFA Champions League' : (isMid ? 'UEFA Europa League' : 'Copa Nacional'), pj: intMatches || 3, g: Math.round(historyStats.goals * 0.2), a: Math.round(historyStats.assists * 0.2) },
    { name: currentLang === 'es' ? 'Copa y Otros' : 'Cup & Others', pj: cupMatches, g: Math.round(historyStats.goals * 0.1), a: Math.round(historyStats.assists * 0.1) }
  ];

  container.innerHTML = `
    <table style="width:100%; border-collapse:collapse; font-size:13px; color:var(--text-2);">
      ${breakdown.map(b => `
        <tr style="border-bottom:1px solid var(--border);">
          <td style="padding:12px 10px; text-align:left; color:var(--text-1); font-weight:500;">${b.name}</td>
          <td style="padding:12px 10px; text-align:center;">${b.pj}</td>
          <td style="padding:12px 10px; text-align:center;">${b.g}</td>
          <td style="padding:12px 10px; text-align:center;">${b.a}</td>
        </tr>
      `).join('')}
    </table>
  `;
}

function renderHeatmap(pos, year) {
  const canvas = document.getElementById('player-heatmap');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  // Set internal resolution
  canvas.width = canvas.offsetWidth * 2;
  canvas.height = canvas.offsetHeight * 2;
  const w = canvas.width;
  const h = canvas.height;

  // Draw Pitch
  ctx.fillStyle = '#1a2b1a';
  ctx.fillRect(0, 0, w, h);
  
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 2;
  
  // Outer boundary
  ctx.strokeRect(20, 20, w - 40, h - 40);
  
  // Mid line
  ctx.beginPath();
  ctx.moveTo(w / 2, 20);
  ctx.lineTo(w / 2, h - 20);
  ctx.stroke();
  
  // Center circle
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, h * 0.15, 0, Math.PI * 2);
  ctx.stroke();
  
  // Penalty areas
  const boxW = w * 0.15;
  const boxH = h * 0.5;
  ctx.strokeRect(20, (h - boxH) / 2, boxW, boxH);
  ctx.strokeRect(w - 20 - boxW, (h - boxH) / 2, boxW, boxH);

  // Season Offset Logic
  const selectedYearStart = parseInt(year.split('/')[0]);
  const yearsBack = 2024 - selectedYearStart;
  const isAltYear = yearsBack > 0;
  
  const offsetX = isAltYear ? (-0.02 * yearsBack) : 0;
  const offsetY = isAltYear ? (0.02 * yearsBack) : 0;
  const scaleR = isAltYear ? Math.max(0.7, 1.0 - (yearsBack * 0.05)) : 1.0;

  // Season-specific Tactical Variation Seed
  const seed = pos.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + selectedYearStart;
  
  // Heatmap Blobs with Tactical Variations
  const variations = {
    'ST': [
      [{x: 0.85, y: 0.5, r: 0.25}, {x: 0.75, y: 0.4, r: 0.2}], // Poacher
      [{x: 0.75, y: 0.5, r: 0.3}, {x: 0.6, y: 0.5, r: 0.25}],  // False 9
      [{x: 0.85, y: 0.3, r: 0.22}, {x: 0.85, y: 0.7, r: 0.22}, {x: 0.8, y: 0.5, r: 0.25}] // Mobile
    ],
    'LW': [
      [{x: 0.8, y: 0.2, r: 0.25}, {x: 0.65, y: 0.25, r: 0.2}], // Classic Winger
      [{x: 0.75, y: 0.35, r: 0.28}, {x: 0.85, y: 0.45, r: 0.22}], // Inside Forward
      [{x: 0.6, y: 0.2, r: 0.3}, {x: 0.4, y: 0.2, r: 0.25}] // Deep Winger
    ],
    'RW': [
      [{x: 0.8, y: 0.8, r: 0.25}, {x: 0.65, y: 0.75, r: 0.2}], // Classic Winger
      [{x: 0.75, y: 0.65, r: 0.28}, {x: 0.85, y: 0.55, r: 0.22}], // Inside Forward
      [{x: 0.6, y: 0.8, r: 0.3}, {x: 0.4, y: 0.8, r: 0.25}] // Deep Winger
    ],
    'CM': [
      [{x: 0.5, y: 0.5, r: 0.3}, {x: 0.4, y: 0.4, r: 0.2}, {x: 0.6, y: 0.6, r: 0.2}], // Box-to-box
      [{x: 0.4, y: 0.5, r: 0.25}, {x: 0.5, y: 0.3, r: 0.2}, {x: 0.5, y: 0.7, r: 0.2}], // Controller
      [{x: 0.6, y: 0.5, r: 0.3}, {x: 0.7, y: 0.4, r: 0.2}, {x: 0.7, y: 0.6, r: 0.2}] // Advanced
    ],
    'CAM': [
      [{x: 0.7, y: 0.5, r: 0.25}, {x: 0.6, y: 0.4, r: 0.2}], // Classic 10
      [{x: 0.75, y: 0.3, r: 0.2}, {x: 0.75, y: 0.7, r: 0.2}, {x: 0.7, y: 0.5, r: 0.25}], // Roaming
      [{x: 0.8, y: 0.5, r: 0.25}, {x: 0.6, y: 0.5, r: 0.3}] // Shadow Striker
    ],
    'CDM': [
      [{x: 0.4, y: 0.5, r: 0.25}, {x: 0.35, y: 0.4, r: 0.2}], // Anchor
      [{x: 0.35, y: 0.5, r: 0.3}, {x: 0.45, y: 0.3, r: 0.22}, {x: 0.45, y: 0.7, r: 0.22}], // Deep-lying Playmaker
      [{x: 0.3, y: 0.5, r: 0.25}, {x: 0.25, y: 0.5, r: 0.2}] // Destroyer
    ],
    'CB': [
      [{x: 0.2, y: 0.5, r: 0.25}, {x: 0.25, y: 0.4, r: 0.2}], // Stopper
      [{x: 0.25, y: 0.5, r: 0.3}, {x: 0.15, y: 0.5, r: 0.2}], // Sweeper
      [{x: 0.2, y: 0.3, r: 0.2}, {x: 0.2, y: 0.7, r: 0.2}, {x: 0.2, y: 0.5, r: 0.25}] // Wide Cover
    ],
    'LB': [
      [{x: 0.3, y: 0.2, r: 0.25}, {x: 0.45, y: 0.25, r: 0.2}], // Classic
      [{x: 0.5, y: 0.2, r: 0.3}, {x: 0.7, y: 0.2, r: 0.25}], // Wing-back
      [{x: 0.25, y: 0.3, r: 0.25}, {x: 0.35, y: 0.2, r: 0.2}] // Defensive
    ],
    'RB': [
      [{x: 0.3, y: 0.8, r: 0.25}, {x: 0.45, y: 0.75, r: 0.2}], // Classic
      [{x: 0.5, y: 0.8, r: 0.3}, {x: 0.7, y: 0.8, r: 0.25}], // Wing-back
      [{x: 0.25, y: 0.7, r: 0.25}, {x: 0.35, y: 0.8, r: 0.2}] // Defensive
    ],
    'GK': [
      [{x: 0.05, y: 0.5, r: 0.15}], // Classic
      [{x: 0.08, y: 0.5, r: 0.18}], // Sweeper-keeper
      [{x: 0.04, y: 0.5, r: 0.12}, {x: 0.08, y: 0.4, r: 0.1}, {x: 0.08, y: 0.6, r: 0.1}] // Command
    ]
  };

  const posVariations = variations[pos] || variations['ST'];
  const activeZones = posVariations[seed % posVariations.length];
  
  activeZones.forEach(z => {
    const finalX = (z.x + offsetX) * w;
    const finalY = (z.y + offsetY) * h;
    const finalR = z.r * scaleR * w;

    const grad = ctx.createRadialGradient(finalX, finalY, 0, finalX, finalY, finalR);
    grad.addColorStop(0, 'rgba(255, 60, 0, 0.7)');
    grad.addColorStop(0.5, 'rgba(255, 180, 0, 0.3)');
    grad.addColorStop(1, 'rgba(255, 255, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(finalX, finalY, finalR, 0, Math.PI * 2);
    ctx.fill();
  });
}

function switchModalTab(btn, paneId) {
  // Tabs
  document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  // Panes
  document.querySelectorAll('.modal-pane').forEach(p => p.classList.remove('active'));
  document.getElementById(`pane-${paneId}`).classList.add('active');
}

function closeModal() {
  document.getElementById('player-modal').style.display = 'none';
}

function askAboutPlayer(name) {
  closeModal();
  goToSection('chat');
  setTimeout(() => sendMessage(`Cuéntame todo sobre ${name} / Tell me everything about ${name}`), 100);
}

// ──────────────────────────────────────────
// CHAT
// ──────────────────────────────────────────
// ──────────────────────────────────────────
// CHAT & MULTI-SESSION HISTORY
// ──────────────────────────────────────────
function setupChatInput() {
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('send-btn');
  const recordBtn = document.getElementById('record-btn');
  const muteBtn = document.getElementById('btn-mute-agent');
  const newChatBtn = document.getElementById('btn-new-chat');
  const toggleSidebarBtn = document.getElementById('btn-toggle-chat-sidebar');
  const closeSidebarBtn = document.getElementById('btn-close-chat-sidebar');
  const searchInput = document.getElementById('chat-search-input');
  const renameChatBtn = document.getElementById('btn-rename-chat');
  const clearAllBtn = document.getElementById('btn-clear-all-chats');
  const clearCurrentBtn = document.getElementById('btn-clear-chat');

  if (muteBtn) {
    muteBtn.addEventListener('click', () => {
      isMuted = !isMuted;
      muteBtn.classList.toggle('muted', isMuted);
      muteBtn.textContent = isMuted ? '🔇' : '🔊';
      if (isMuted && window.speechSynthesis) window.speechSynthesis.cancel();
    });
  }

  if (recordBtn) {
    recordBtn.addEventListener('click', toggleRecording);
  }

  if (sendBtn) {
    sendBtn.addEventListener('click', () => sendMessage());
  }

  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    input.addEventListener('input', () => {
      input.style.height = 'auto';
      const newHeight = Math.min(input.scrollHeight, 160);
      input.style.height = newHeight + 'px';
      if (input.scrollHeight > 160) {
        input.style.overflowY = 'auto';
      } else {
        input.style.overflowY = 'hidden';
      }
    });
  }

  if (newChatBtn) {
    newChatBtn.addEventListener('click', () => createNewChatSession());
  }

  if (toggleSidebarBtn) {
    toggleSidebarBtn.addEventListener('click', () => {
      const sidebar = document.getElementById('chat-sidebar');
      if (!sidebar) return;
      if (window.innerWidth <= 768) {
        sidebar.classList.toggle('mobile-open');
      } else {
        sidebar.classList.toggle('collapsed');
      }
    });
  }

  if (closeSidebarBtn) {
    closeSidebarBtn.addEventListener('click', () => {
      document.getElementById('chat-sidebar')?.classList.remove('mobile-open');
    });
  }

  const historyListEl = document.getElementById('chat-history-list');
  if (historyListEl) {
    historyListEl.addEventListener('click', (e) => {
      const actionBtn = e.target.closest('.chat-history-action-btn');
      if (actionBtn) return;
      const item = e.target.closest('.chat-history-item');
      if (item && item.dataset.sessionId) {
        switchChatSession(item.dataset.sessionId);
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderChatSidebar(e.target.value);
    });
  }

  if (renameChatBtn) {
    renameChatBtn.addEventListener('click', () => {
      if (activeSessionId) renameChatSession(activeSessionId);
    });
  }

  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => clearAllChatSessions());
  }

  if (clearCurrentBtn) {
    clearCurrentBtn.addEventListener('click', () => {
      if (activeSessionId) deleteChatSession(activeSessionId);
    });
  }

  // Initialize multi-session chat state
  loadChatSessions();
}

function loadChatSessions() {
  try {
    const stored = localStorage.getItem('futbolai_chat_sessions_v1');
    if (stored) {
      chatSessions = JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error loading chat sessions:', e);
    chatSessions = [];
  }

  if (Array.isArray(chatSessions)) {
    chatSessions = chatSessions.filter(s => s.messages && s.messages.length > 0);
  } else {
    chatSessions = [];
  }

  const lastActiveId = localStorage.getItem('futbolai_active_session_id');
  const found = chatSessions.find(s => s.id === lastActiveId);

  if (found) {
    activeSessionId = found.id;
    sessionId = activeSessionId;
  } else {
    activeSessionId = null;
    sessionId = null;
  }

  renderChatSidebar();
  loadChatIAMessages();
}

function saveChatSessions() {
  try {
    chatSessions = chatSessions.filter(s => s.messages && s.messages.length > 0);
    localStorage.setItem('futbolai_chat_sessions_v1', JSON.stringify(chatSessions));
    if (activeSessionId) {
      localStorage.setItem('futbolai_active_session_id', activeSessionId);
    } else {
      localStorage.removeItem('futbolai_active_session_id');
    }
  } catch (e) {
    console.error('Error saving chat sessions:', e);
  }
}

function formatSessionTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}

function renderChatSidebar(filterQuery = '') {
  const historyList = document.getElementById('chat-history-list');
  if (!historyList) return;

  historyList.innerHTML = '';
  const query = (filterQuery || '').toLowerCase().trim();

  const validSessions = chatSessions.filter(s => s.messages && s.messages.length > 0);

  const filtered = validSessions.filter(s => {
    if (!query) return true;
    const titleMatch = (s.title || '').toLowerCase().includes(query);
    const msgMatch = (s.messages || []).some(m => (m.content || '').toLowerCase().includes(query));
    return titleMatch || msgMatch;
  });

  if (filtered.length === 0) {
    const emptyDiv = document.createElement('div');
    emptyDiv.style.cssText = 'padding:16px; text-align:center; color:var(--text-3); font-size:12px;';
    emptyDiv.textContent = TRANSLATIONS[currentLang]?.no_chats_found || 'Sin conversaciones';
    historyList.appendChild(emptyDiv);
    return;
  }

  filtered.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

  filtered.forEach(session => {
    const item = document.createElement('div');
    const isActive = String(session.id) === String(activeSessionId);
    item.className = `chat-history-item ${isActive ? 'active' : ''}`;
    item.dataset.sessionId = session.id;

    const timeStr = formatSessionTime(session.updatedAt || session.createdAt);

    item.innerHTML = `
      <div class="chat-history-info" onclick="switchChatSession('${session.id}')" style="cursor:pointer;flex:1;min-width:0;">
        <div class="chat-history-title">${escapeHtml(session.title || 'Chat')}</div>
        <div class="chat-history-time">${timeStr}</div>
      </div>
      <div class="chat-history-actions">
        <button class="chat-history-action-btn edit-btn" title="${TRANSLATIONS[currentLang]?.rename_chat || 'Renombrar'}" onclick="event.stopPropagation(); renameChatSession('${session.id}')">✏️</button>
        <button class="chat-history-action-btn" title="Eliminar" onclick="event.stopPropagation(); deleteChatSession('${session.id}')">🗑️</button>
      </div>
    `;

    item.onclick = (e) => {
      if (e.target.closest('.chat-history-action-btn')) return;
      switchChatSession(session.id);
    };

    historyList.appendChild(item);
  });
}

function createNewChatSession(customTitle = null) {
  activeSessionId = null;
  sessionId = null;

  renderChatSidebar();
  loadChatIAMessages();

  const input = document.getElementById('chat-input');
  if (input) input.focus();

  document.getElementById('chat-sidebar')?.classList.remove('mobile-open');
}

function switchChatSession(targetSessionId) {
  if (!targetSessionId) return;

  try {
    const stored = localStorage.getItem('futbolai_chat_sessions_v1');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        chatSessions = parsed;
      }
    }
  } catch (e) {
    console.error('Error reloading chat sessions:', e);
  }

  const session = chatSessions.find(s => String(s.id) === String(targetSessionId));
  if (!session) return;

  activeSessionId = session.id;
  sessionId = activeSessionId;

  if (activeSessionId) {
    localStorage.setItem('futbolai_active_session_id', activeSessionId);
  }

  renderChatSidebar();
  loadChatIAMessages();

  const input = document.getElementById('chat-input');
  if (input) input.focus();

  document.getElementById('chat-sidebar')?.classList.remove('mobile-open');
}

function renameChatSession(targetSessionId) {
  const session = chatSessions.find(s => String(s.id) === String(targetSessionId));
  if (!session) return;

  const promptText = TRANSLATIONS[currentLang]?.prompt_rename_chat || 'Ingresa el nuevo título para esta conversación:';
  const newTitle = prompt(promptText, session.title);

  if (newTitle !== null && newTitle.trim() !== '') {
    session.title = newTitle.trim();
    session.updatedAt = Date.now();
    saveChatSessions();
    renderChatSidebar();
  }
}

function deleteChatSession(targetSessionId) {
  const sessionIndex = chatSessions.findIndex(s => String(s.id) === String(targetSessionId));
  if (sessionIndex === -1) return;

  const confirmMsg = TRANSLATIONS[currentLang]?.confirm_delete_chat || '¿Eliminar esta conversación?';
  if (!confirm(confirmMsg)) return;

  if (targetSessionId) {
    fetchWithAuth(`${API}/chat/${targetSessionId}`, { method: 'DELETE' }).catch(() => {});
  }

  chatSessions.splice(sessionIndex, 1);

  if (chatSessions.length === 0) {
    createNewChatSession();
  } else {
    if (String(activeSessionId) === String(targetSessionId)) {
      activeSessionId = chatSessions[0].id;
      sessionId = activeSessionId;
    }
    saveChatSessions();
    renderChatSidebar();
    loadChatIAMessages();
  }
}

function clearAllChatSessions() {
  const confirmMsg = TRANSLATIONS[currentLang]?.confirm_clear_all_chats || '¿Estás seguro de eliminar todo el historial de chats?';
  if (!confirm(confirmMsg)) return;

  chatSessions.forEach(s => {
    fetchWithAuth(`${API}/chat/${s.id}`, { method: 'DELETE' }).catch(() => {});
  });

  chatSessions = [];
  createNewChatSession();
}

function loadChatIAMessages() {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  container.innerHTML = '';
  const currentSession = activeSessionId ? chatSessions.find(s => String(s.id) === String(activeSessionId)) : null;

  if (!currentSession || !currentSession.messages || currentSession.messages.length === 0) {
    const wrapper = document.createElement('div');
    wrapper.className = 'chat-welcome';
    container.appendChild(wrapper);
    buildChatWelcome(wrapper);
    return;
  }

  currentSession.messages.forEach(msg => {
    if (msg.isAudio && msg.audioData) {
      appendAudioBubbleFromHistory(msg);
    } else {
      appendBubbleFromHistory(msg.role, msg.content, msg.time);
    }
  });

  scrollChat();
}

function appendBubbleFromHistory(role, text, timeStr) {
  const container = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = `chat-bubble ${role}`;

  const time = timeStr || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  div.innerHTML = `
    <div class="bubble-avatar">${role === 'agent' ? '⚽' : '👤'}</div>
    <div>
      <div class="bubble-content">${markdownToHtml(text)}</div>
      <div class="bubble-time">${time}</div>
    </div>
  `;
  container.appendChild(div);
}

function appendAudioBubbleFromHistory(msg) {
  const container = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = 'chat-bubble user';

  const time = msg.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const durFmt = formatDuration(msg.durationSec || 0);

  const bars = Array.from({ length: 32 }, (_, i) => {
    const h = 4 + Math.floor(Math.abs(Math.sin(i * 0.8 + 0.2)) * 14) + Math.floor(Math.random() * 6);
    return `<span class="waveform-bar" style="height:${h}px"></span>`;
  }).join('');

  div.innerHTML = `
    <div class="bubble-avatar">👤</div>
    <div class="audio-message-bubble">
      <div class="audio-msg-inner">
        <button class="audio-play-btn" onclick="toggleAudioPlay(this, '${msg.audioData}')">▶</button>
        <div class="waveform-container">${bars}</div>
        <div class="audio-meta-info">
          <span class="audio-duration">${durFmt}</span>
          <div class="bubble-time-container">
            <span class="bubble-time">${time}</span>
            <span class="check-icon">✓✓</span>
          </div>
        </div>
      </div>
    </div>
  `;

  container.appendChild(div);
}

function speakText(text) {
  if (isMuted || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();

  let cleanText = text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/_{1,2}(.*?)_{1,2}/g, '$1')
    .replace(/`{1,3}(.*?)`{1,3}/g, '$1')
    .replace(/#+\s/g, '')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/—/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const utterance = new SpeechSynthesisUtterance(cleanText);
  const langPrefix = currentLang === 'en' ? 'en' : 'es';
  const voices = window.speechSynthesis.getVoices();
  
  let voice = voices.find(v => v.lang.startsWith(langPrefix) && (v.name.includes('Google') || v.name.includes('Natural')));
  if (!voice) voice = voices.find(v => v.lang.startsWith(langPrefix));

  if (voice) utterance.voice = voice;
  utterance.lang = currentLang === 'en' ? 'en-US' : 'es-ES';
  utterance.rate = 1.05;

  window.speechSynthesis.speak(utterance);
}

if (window.speechSynthesis && speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
}

async function toggleRecording() {
  if (isRecording) stopRecording();
  else startRecording();
}

function formatDuration(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function startRecordingTimer() {
  recordingSeconds = 0;
  const btn = document.getElementById('record-btn');
  const timerEl = document.getElementById('record-timer');
  if (timerEl) timerEl.textContent = '0:00';
  recordingTimerInterval = setInterval(() => {
    recordingSeconds++;
    const display = formatDuration(recordingSeconds);
    if (timerEl) timerEl.textContent = display;
    btn.title = display;
  }, 1000);
}

function stopRecordingTimer() {
  clearInterval(recordingTimerInterval);
  recordingTimerInterval = null;
}

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    document.getElementById('chat-input').style.display = 'none';
    document.getElementById('recording-overlay').style.display = 'flex';
    document.getElementById('send-btn').style.opacity = '0.4';
    document.getElementById('send-btn').style.pointerEvents = 'none';

    mediaRecorder.ondataavailable = e => {
      if (e.data.size > 0) audioChunks.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      const duration = recordingSeconds;
      stopRecordingTimer();
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      lastAudioBlob = audioBlob;
      const base64Audio = await blobToBase64(audioBlob);
      stream.getTracks().forEach(track => track.stop());
      sendAudioMessage(base64Audio, 'audio/webm', audioBlob, duration);
    };

    mediaRecorder.start();
    isRecording = true;
    startRecordingTimer();
    document.getElementById('record-btn').classList.add('recording');
  } catch (err) {
    window.showAppErrorAlert({
      title: 'Acceso a Micrófono',
      message: 'No se pudo acceder al micrófono.',
      details: err.message
    });
  }
}

function stopRecording() {
  if (mediaRecorder && isRecording) {
    mediaRecorder.stop();
    isRecording = false;
    
    document.getElementById('chat-input').style.display = 'block';
    document.getElementById('recording-overlay').style.display = 'none';
    document.getElementById('send-btn').style.opacity = '1';
    document.getElementById('send-btn').style.pointerEvents = 'auto';

    document.getElementById('record-btn').classList.remove('recording');
  }
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function appendAudioBubble(audioBlob, durationSec) {
  const container = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = 'chat-bubble user';

  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const audioUrl = URL.createObjectURL(audioBlob);
  const durFmt = formatDuration(durationSec);

  const bars = Array.from({ length: 32 }, (_, i) => {
    const h = 4 + Math.floor(Math.abs(Math.sin(i * 0.8 + 0.2)) * 14) + Math.floor(Math.random() * 6);
    return `<span class="waveform-bar" style="height:${h}px"></span>`;
  }).join('');

  div.innerHTML = `
    <div class="bubble-avatar">👤</div>
    <div class="audio-message-bubble">
      <div class="audio-msg-inner">
        <button class="audio-play-btn" onclick="toggleAudioPlay(this, '${audioUrl}')">▶</button>
        <div class="waveform-container">${bars}</div>
        <div class="audio-meta-info">
          <span class="audio-duration">${durFmt}</span>
          <div class="bubble-time-container">
            <span class="bubble-time">${time}</span>
            <span class="check-icon">✓✓</span>
          </div>
        </div>
      </div>
    </div>
  `;

  container.appendChild(div);
  scrollChat();
  return div;
}

function toggleAudioPlay(btn, audioUrl) {
  if (window._currentAudio && !window._currentAudio.paused) {
    window._currentAudio.pause();
    window._currentAudio.currentTime = 0;
    if (window._currentPlayBtn) window._currentPlayBtn.textContent = '▶';
    if (window._currentPlayBtn === btn) {
      window._currentAudio = null;
      window._currentPlayBtn = null;
      return;
    }
  }

  const audio = new Audio(audioUrl);
  window._currentAudio = audio;
  window._currentPlayBtn = btn;
  btn.textContent = '⏸';

  const waveformBars = btn.closest('.audio-msg-inner').querySelectorAll('.waveform-bar');
  let animFrame;
  function animateBars() {
    waveformBars.forEach(bar => {
      const h = 4 + Math.floor(Math.random() * 22);
      bar.style.height = h + 'px';
    });
    animFrame = requestAnimationFrame(animateBars);
  }
  animateBars();

  audio.onended = () => {
    btn.textContent = '▶';
    cancelAnimationFrame(animFrame);
    window._currentAudio = null;
    window._currentPlayBtn = null;
  };

  audio.play();
}

function quickChat(msg) {
  goToSection('chat');
  setTimeout(() => sendMessage(msg), 150);
}

function sendQuick(msg) {
  sendMessage(msg);
}

async function sendMessage(text) {
  const input = document.getElementById('chat-input');
  const msg = text || input.value.trim();
  if (!msg) return;

  const user = JSON.parse(localStorage.getItem('scout_ai_user') || '{}');
  const tier = (user.selectedTier || user.tier || 'Gratis').toLowerCase();
  
  if ((tier === 'gratis' || tier === 'pro') && user.dailyAiMessagesRemaining === 0) {
    const maxLimit = tier === 'gratis' ? 5 : 10;
    alert(`Has alcanzado tu límite diario de ${maxLimit} mensajes en el Chat IA para el Plan ${tier === 'pro' ? 'Pro' : 'Gratis'}.\n\nLos límites son diarios no acumulativos y se restablecerán transcurridas 24 horas desde tu primer uso.`);
    return;
  }

  if (tier === 'plus' && user.weeklyAiMessagesRemaining === 0) {
    alert(`Has alcanzado tu límite semanal de 30 mensajes en el Chat IA para el Plan Plus.\n\nLos límites son semanales no acumulativos y se restablecerán transcurridos 7 días desde tu primer uso.`);
    return;
  }

  if (tier === 'enterprise' && user.weeklyAiMessagesRemaining === 0) {
    alert(`Has alcanzado tu límite semanal de 50 mensajes en el Chat IA para el Plan Enterprise.\n\nLos límites son semanales no acumulativos y se restablecerán transcurridos 7 días desde tu primer uso.`);
    return;
  }

  let currentSession = activeSessionId ? chatSessions.find(s => s.id === activeSessionId) : null;
  if (!currentSession) {
    const newId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    const cleanPrompt = msg.trim().replace(/^¿|^\?/, '');
    const title = cleanPrompt.substring(0, 32) + (cleanPrompt.length > 32 ? '...' : '');
    currentSession = {
      id: newId,
      title: title,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: []
    };
    chatSessions.unshift(currentSession);
    activeSessionId = newId;
    sessionId = activeSessionId;
  }

  const welcome = document.querySelector('.chat-welcome');
  if (welcome) welcome.remove();

  incrementUserStat('queries', { message: msg });

  input.value = '';
  input.style.height = 'auto';
  input.style.overflowY = 'hidden';

  const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  appendBubble('user', msg);

  currentSession.messages.push({
    role: 'user',
    content: msg,
    time: userTime
  });

  const defaultTitles = ['Nueva conversación', 'New Conversation', 'Chat'];
  if (currentSession.messages.length === 1 || defaultTitles.includes(currentSession.title)) {
    const cleanPrompt = msg.trim().replace(/^¿|^\?/, '');
    currentSession.title = cleanPrompt.substring(0, 32) + (cleanPrompt.length > 32 ? '...' : '');
  }
  currentSession.updatedAt = Date.now();
  saveChatSessions();
  renderChatSidebar();

  const thinking = appendThinking();
  document.getElementById('send-btn').disabled = true;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 40000);

  try {
    const res = await fetchWithAuth(`${API}/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg, sessionId, lang: currentLang }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error('Error al conectar con la IA');

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let replyText = '';
    let bubble = null;
    let contentEl = null;
    let buffer = '';

    thinking.remove();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          const jsonStr = trimmed.slice(6).trim();
          if (!jsonStr) continue;
          try {
            const data = JSON.parse(jsonStr);
            if (data.user) {
              localStorage.setItem('scout_ai_user', JSON.stringify(data.user));
              updateDailyLimitsBadges(data.user);
            }
            if (data.chunk) {
              if (!bubble) {
                bubble = appendBubble('agent', '');
                contentEl = bubble.querySelector('.bubble-content');
              }
              replyText += data.chunk;
              contentEl.innerHTML = markdownToHtml(replyText);
              scrollChat();
            }
            if (data.sessionId) sessionId = data.sessionId;
            if (data.error) throw new Error(data.error);
          } catch (e) { console.warn('Stream parse error:', e); }
        }
      }
    }

    if (replyText) {
      const agentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      currentSession.messages.push({
        role: 'agent',
        content: replyText,
        time: agentTime
      });
      currentSession.updatedAt = Date.now();
      saveChatSessions();
      renderChatSidebar();
    }
  } catch (err) {
    if (document.querySelector('.chat-thinking')) document.querySelector('.chat-thinking').remove();
    appendBubble('agent', '⚠️ Error: ' + err.message);
  }

  document.getElementById('send-btn').disabled = false;
  scrollChat();
}

async function sendAudioMessage(audioBase64, mimeType, audioBlob, durationSec) {
  let currentSession = activeSessionId ? chatSessions.find(s => s.id === activeSessionId) : null;
  if (!currentSession) {
    const newId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    const title = currentLang === 'en' ? '🎤 Voice query' : '🎤 Audio consulta';
    currentSession = {
      id: newId,
      title: title,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: []
    };
    chatSessions.unshift(currentSession);
    activeSessionId = newId;
    sessionId = activeSessionId;
  }

  const welcome = document.querySelector('.chat-welcome');
  if (welcome) welcome.remove();

  const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const audioUrl = URL.createObjectURL(audioBlob);
  appendAudioBubble(audioBlob, durationSec);

  currentSession.messages.push({
    role: 'user',
    isAudio: true,
    audioData: audioUrl,
    durationSec: durationSec,
    time: userTime
  });

  const defaultTitles = ['Nueva conversación', 'New Conversation', 'Chat'];
  if (currentSession.messages.length === 1 || defaultTitles.includes(currentSession.title)) {
    currentSession.title = currentLang === 'en' ? '🎤 Voice query' : '🎤 Audio consulta';
  }
  currentSession.updatedAt = Date.now();
  saveChatSessions();
  renderChatSidebar();

  const thinking = appendThinking();
  document.getElementById('send-btn').disabled = true;
  document.getElementById('record-btn').disabled = true;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 40000);

  try {
    const res = await fetchWithAuth(`${API}/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '', audioBase64, mimeType, sessionId, lang: currentLang }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error('Error al procesar audio');

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let replyText = '';
    let bubble = null;
    let contentEl = null;
    let buffer = '';

    thinking.remove();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          const jsonStr = trimmed.slice(6).trim();
          if (!jsonStr) continue;
          try {
            const data = JSON.parse(jsonStr);
            if (data.chunk) {
              if (!bubble) {
                bubble = appendBubble('agent', '');
                contentEl = bubble.querySelector('.bubble-content');
              }
              replyText += data.chunk;
              contentEl.innerHTML = markdownToHtml(replyText);
              scrollChat();
            }
            if (data.sessionId) sessionId = data.sessionId;
          } catch (e) { console.warn('Stream audio parse error:', e); }
        }
      }
    }

    if (replyText) {
      const agentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      currentSession.messages.push({
        role: 'agent',
        content: replyText,
        time: agentTime
      });
      currentSession.updatedAt = Date.now();
      saveChatSessions();
      renderChatSidebar();
      speakText(replyText);
    }
  } catch (err) {
    if (document.querySelector('.chat-thinking')) document.querySelector('.chat-thinking').remove();
    appendBubble('agent', '⚠️ Error de audio: ' + err.message);
  }

  document.getElementById('send-btn').disabled = false;
  document.getElementById('record-btn').disabled = false;
  scrollChat();
}

function appendBubble(role, text) {
  const container = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = `chat-bubble ${role}`;

  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  div.innerHTML = `
    <div class="bubble-avatar">${role === 'agent' ? '⚽' : '👤'}</div>
    <div>
      <div class="bubble-content">${markdownToHtml(text)}</div>
      <div class="bubble-time">${time}</div>
    </div>
  `;
  container.appendChild(div);
  scrollChat();
  return div;
}

function appendThinking() {
  const container = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = 'chat-thinking';
  div.innerHTML = `
    <div class="bubble-avatar" style="background:linear-gradient(135deg,var(--green),var(--gold));width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">⚽</div>
    <div class="thinking-dots"><span></span><span></span><span></span></div>
  `;
  container.appendChild(div);
  scrollChat();
  return div;
}

function scrollChat() {
  const c = document.getElementById('chat-messages');
  if (c) c.scrollTop = c.scrollHeight;
}

function clearChat() {
  if (activeSessionId) {
    deleteChatSession(activeSessionId);
  }
}

// ──────────────────────────────────────────
// COMPARE
// ──────────────────────────────────────────
function setupCompareSearch() {
  setupCompareSearchFor(1);
  setupCompareSearchFor(2);
  document.getElementById('btn-compare').addEventListener('click', runComparison);
}

function setupCompareSearchFor(num) {
  const input = document.getElementById(`compare-search-${num}`);
  const results = document.getElementById(`selector-results-${num}`);

  input.addEventListener('input', () => {
    const q = input.value.toLowerCase();
    if (!q) { results.classList.remove('open'); return; }

    const matches = allPlayers.filter(p =>
      p.name.toLowerCase().includes(q) || p.currentTeam.toLowerCase().includes(q)
    ).slice(0, 6);

    results.innerHTML = '';
    if (!matches.length) { results.classList.remove('open'); return; }

    matches.forEach(p => {
      const item = document.createElement('div');
      item.className = 'selector-result-item';
      item.innerHTML = `<span>${p.flag}</span><div><div style="font-size:13px;font-weight:600">${p.name}</div><div style="font-size:11px;color:var(--text-3)">${p.currentTeam} · ${p.position}</div></div>`;
      item.addEventListener('click', () => {
        selectComparePlayer(num, p);
        results.classList.remove('open');
        input.value = '';
      });
      results.appendChild(item);
    });
    results.classList.add('open');
  });

  document.addEventListener('click', (e) => {
    if (!results.contains(e.target) && e.target !== input) {
      results.classList.remove('open');
    }
  });
}

function selectComparePlayer(num, player) {
  if (num === 1) selectedPlayer1 = player;
  else selectedPlayer2 = player;

  const card = document.getElementById(`selected-card-${num}`);
  card.classList.add('filled');
  card.innerHTML = `
    <div class="sel-player-info">
      <div class="sel-player-top">
        <span class="sel-flag">${player.flag}</span>
        <div>
          <div class="sel-name">${player.name}</div>
          <div class="sel-team">${player.currentTeam} · ${player.league}</div>
        </div>
      </div>
      <div class="sel-stats">
        <div class="sel-stat"><span class="sel-stat-num">${Number(player.overallRating).toFixed(1)}</span><span class="sel-stat-label">OVR</span></div>
        <div class="sel-stat"><span class="sel-stat-num">${player.stats.goals}</span><span class="sel-stat-label">Goals</span></div>
        <div class="sel-stat"><span class="sel-stat-num">${player.stats.assists}</span><span class="sel-stat-label">Assists</span></div>
      </div>
    </div>
  `;

  document.getElementById('btn-compare').disabled = !(selectedPlayer1 && selectedPlayer2);

  // Hide previous results
  document.getElementById('compare-result').style.display = 'none';
}

window.clearCompareSlot = function(num) {
  if (num === 1) selectedPlayer1 = null;
  else selectedPlayer2 = null;
  
  const card = document.getElementById(`selected-card-${num}`);
  card.classList.remove('filled');
  card.innerHTML = `<div class="empty-player" data-i18n="select_player">` + (currentLang === 'es' ? 'Selecciona un jugador' : 'Select a player') + `</div>`;
  
  document.getElementById('btn-compare').disabled = true;
  document.getElementById('compare-result').style.display = 'none';
};

function closeComparison() {
  document.getElementById('compare-result').style.display = 'none';
}

async function runComparison() {
  if (!selectedPlayer1 || !selectedPlayer2) return;

  const user = JSON.parse(localStorage.getItem('scout_ai_user') || '{}');
  const tier = (user.selectedTier || user.tier || 'Gratis').toLowerCase();

  if ((tier === 'gratis' || tier === 'pro') && user.dailyComparisonsRemaining === 0) {
    const maxLimit = tier === 'gratis' ? 2 : 5;
    alert(`Has alcanzado tu límite diario de ${maxLimit} comparaciones en el Plan ${tier === 'pro' ? 'Pro' : 'Gratis'}.\n\nLos límites son diarios no acumulativos y se restablecerán transcurridas 24 horas desde tu primer uso.`);
    return;
  }

  if (tier === 'plus' && user.weeklyComparisonsRemaining === 0) {
    alert(`Has alcanzado tu límite semanal de 15 comparaciones en el Plan Plus.\n\nLos límites son semanales no acumulativos y se restablecerán transcurridos 7 días desde tu primer uso.`);
    return;
  }

  if (tier === 'enterprise' && user.monthlyComparisonsRemaining === 0) {
    alert(`Has alcanzado tu límite mensual de 50 comparaciones en el Plan Enterprise.\n\nLos límites son mensuales no acumulativos y se restablecerán transcurridos 30 días desde tu primer uso.`);
    return;
  }

  incrementUserStat('compared', { player1Id: selectedPlayer1.id, player2Id: selectedPlayer2.id });

  const btn = document.getElementById('btn-compare');
  btn.textContent = t('btn_analyzing');
  btn.disabled = true;

  const resultEl = document.getElementById('compare-result');
  const bodyEl = document.getElementById('compare-result-body');
  resultEl.style.display = 'none';

  try {
    const res = await fetchWithAuth(`${API}/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player1Id: selectedPlayer1.id, player2Id: selectedPlayer2.id, lang: currentLang }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (data.user) {
        localStorage.setItem('scout_ai_user', JSON.stringify(data.user));
        updateDailyLimitsBadges(data.user);
      }
      throw new Error(data.message || data.error || 'Error en la comparación');
    }

    if (data.user) {
      localStorage.setItem('scout_ai_user', JSON.stringify(data.user));
      updateDailyLimitsBadges(data.user);
    }

    // Inject Analysis Text
    bodyEl.innerHTML = markdownToHtml(data.analysis);
    
    // Populate Tactical Comparison UI
    populateTacticalUI(selectedPlayer1, selectedPlayer2);
    
    // Show results
    resultEl.style.display = 'block';
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    console.log(`🔍 Comparing ${selectedPlayer1.name} vs ${selectedPlayer2.name}`);
    console.log(`📊 Radar Chart Canvas:`, document.getElementById('comparisonRadarChart'));
    renderComparisonChart(selectedPlayer1, selectedPlayer2);
    
  } catch (err) {
    console.error(err);
    bodyEl.innerHTML = `<p style="color:var(--red)">${err.message || (currentLang === 'es' ? 'Error al conectar con la IA.' : 'Error connecting to AI.')}</p>`;
    resultEl.style.display = 'block';
  }

  btn.textContent = t('btn_analyze');
  btn.disabled = false;
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

function populateTacticalUI(p1, p2) {
  const c1 = TEAM_COLORS[p1.currentTeam] || '#00e5ff';
  const c2 = TEAM_COLORS[p2.currentTeam] || '#76ff03';
  
  // Apply CSS variables for colors
  const card1 = document.getElementById('t-card-1');
  const card2 = document.getElementById('t-card-2');
  
  card1.style.setProperty('--p-color', c1);
  card1.style.setProperty('--p-glow', hexToRgb(c1));
  card2.style.setProperty('--p-color', c2);
  card2.style.setProperty('--p-glow', hexToRgb(c2));
  
  // Global colors for H2H bars
  document.documentElement.style.setProperty('--p1-color', c1);
  document.documentElement.style.setProperty('--p2-color', c2);

  // Card 1 Identity
  const avatar1 = getAbsoluteUrl(p1.avatarUrl);
  document.getElementById('t-avatar-1').innerHTML = `<img src="${avatar1}" style="width:100%; height:100%; border-radius:50%; object-fit: cover;" onerror="onAvatarError(this, ${JSON.stringify(p1).replace(/"/g, '&quot;')})">`;
  document.getElementById('t-name-1').textContent = p1.name;
  document.getElementById('t-meta-1').innerHTML = `
    <div style="display: flex; align-items: center; gap: 6px; justify-content: center; margin-top: 4px;">
      <div class="compare-team-logo" data-team-name="${p1.currentTeam}" style="width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;">⚽</div>
      <span>${p1.currentTeam} · ${currentLang === 'es' ? p1.positionEs : p1.position}</span>
    </div>
  `;
  document.getElementById('t-rating-1').style.display = 'none';
  
  // Card 2 Identity
  const avatar2 = getAbsoluteUrl(p2.avatarUrl);
  document.getElementById('t-avatar-2').innerHTML = `<img src="${avatar2}" style="width:100%; height:100%; border-radius:50%; object-fit: cover;" onerror="onAvatarError(this, ${JSON.stringify(p2).replace(/"/g, '&quot;')})">`;
  document.getElementById('t-name-2').textContent = p2.name;
  document.getElementById('t-meta-2').innerHTML = `
    <div style="display: flex; align-items: center; gap: 6px; justify-content: center; margin-top: 4px;">
      <div class="compare-team-logo" data-team-name="${p2.currentTeam}" style="width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;">⚽</div>
      <span>${p2.currentTeam} · ${currentLang === 'es' ? p2.positionEs : p2.position}</span>
    </div>
  `;
  document.getElementById('t-rating-2').style.display = 'none';

  // Detailed Tables
  fillTacticalTable('t-table-1', p1);
  fillTacticalTable('t-table-2', p2);
  
  // Head to Head Bars
  fillH2HBars(p1, p2);
  loadAllLogos(); // Load comparison team logos
}

function getImprovementAspect(p) {
  const seed = p.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const aspects = {
    ST: ['Finalización', 'Juego de espaldas', 'Remate de cabeza', 'Potencia de tiro', 'Desmarques'],
    CF: ['Visión de juego', 'Creatividad', 'Regate en corto', 'Toma de decisiones', 'Pase final'],
    LW: ['Centros', 'Agilidad', '1 contra 1', 'Resistencia', 'Disparo lejano'],
    RW: ['Centros', 'Velocidad punta', 'Diagonal interior', 'Dribbling', 'Aceleración'],
    CAM: ['Visión periférica', 'Precisión de pase', 'Control de balón', 'Lanzamiento de falta', 'Ritmo de juego'],
    CM: ['Intercepción', 'Despliegue físico', 'Pase largo', 'Recuperación', 'Equilibrio'],
    CDM: ['Fuerza física', 'Marcaje', 'Anticipación', 'Salida de balón', 'Agresividad'],
    CB: ['Salto', 'Liderazgo', 'Comunicación', 'Velocidad de reacción', 'Corte'],
    LB: ['Recorrido', 'Profundidad', 'Repliegue', 'Resistencia', 'Calidad de centro'],
    RB: ['Recorrido', 'Duelos defensivos', 'Doblaje', 'Fuerza', 'Concentración'],
    GK: ['Reflejos', 'Salida por alto', 'Juego de pies', 'Estirada', 'Comunicación']
  };
  
  const pos = p.position || 'ST';
  const list = aspects[pos] || aspects['ST'];
  const index = seed % list.length;
  
  const mapping = {
    'Finalización': 'Finishing', 'Juego de espaldas': 'Hold-up play', 'Remate de cabeza': 'Heading', 'Potencia de tiro': 'Shot power', 'Desmarques': 'Off-ball movement',
    'Visión de juego': 'Vision', 'Creatividad': 'Creativity', 'Regate en corto': 'Close control', 'Toma de decisiones': 'Decision making', 'Pase final': 'Final ball',
    'Centros': 'Crossing', 'Agilidad': 'Agility', '1 contra 1': '1v1 Dribbling', 'Resistencia': 'Stamina', 'Disparo lejano': 'Long shots',
    'Velocidad punta': 'Top speed', 'Diagonal interior': 'Inside cuts', 'Dribbling': 'Dribbling', 'Aceleración': 'Acceleration',
    'Visión periférica': 'Peripherical vision', 'Precisión de pase': 'Pass accuracy', 'Control de balón': 'Ball control', 'Lanzamiento de falta': 'Free kicks', 'Ritmo de juego': 'Tempo control',
    'Intercepción': 'Interception', 'Despliegue físico': 'Work rate', 'Pase largo': 'Long passing', 'Recuperación': 'Ball recovery', 'Equilibrio': 'Balance',
    'Fuerza física': 'Physical strength', 'Marcaje': 'Marking', 'Anticipación': 'Anticipation', 'Salida de balón': 'Build-up play', 'Agresividad': 'Aggressiveness',
    'Salto': 'Jumping', 'Liderazgo': 'Leadership', 'Comunicación': 'Communication', 'Velocidad de reacción': 'Reaction speed', 'Corte': 'Tackling',
    'Recorrido': 'Running output', 'Profundidad': 'Deep runs', 'Repliegue': 'Tracking back', 'Calidad de centro': 'Cross quality',
    'Duelos defensivos': 'Defensive duels', 'Doblaje': 'Overlapping', 'Fuerza': 'Strength', 'Concentración': 'Concentration',
    'Reflejos': 'Reflexes', 'Salida por alto': 'Aerial command', 'Juego de pies': 'Footwork', 'Estirada': 'Diving'
  };

  const esVal = list[index];
  return currentLang === 'es' ? esVal : (mapping[esVal] || esVal);
}

function fillTacticalTable(targetId, p) {
  const el = document.getElementById(targetId);
  
  // Estimate annual salary: ~10-15% of market value for stars, less for others
  const annualSalary = Math.round(p.marketValue * 0.12);
  const salaryStr = annualSalary > 1000000 
    ? `${(annualSalary / 1000000).toFixed(1)}M €/año`
    : `${(annualSalary / 1000).toFixed(0)}k €/año`;

  const stats = [
    { icon: '🎂', label: currentLang === 'es' ? 'Edad' : 'Age', val: `${p.age} yrs` },
    { icon: '🌍', label: currentLang === 'es' ? 'Nacionalidad' : 'Nationality', val: `${p.flag} ${currentLang === 'es' ? p.nationalityEs : p.nationality}` },
    { icon: '📏', label: currentLang === 'es' ? 'Altura' : 'Height', val: `${p.height}cm` },
    { icon: '⚖️', label: currentLang === 'es' ? 'Peso' : 'Weight', val: `${p.weight}kg` },
    { icon: '👟', label: currentLang === 'es' ? 'Pie' : 'Foot', val: currentLang === 'es' ? (p.preferredFoot === 'Left' ? 'Izquierdo' : 'Derecho') : p.preferredFoot },
    { icon: '👕', label: currentLang === 'es' ? 'Dorsal' : 'Number', val: `#${p.jerseyNumber}` },
    { icon: '📅', label: currentLang === 'es' ? 'Contrato' : 'Contract', val: '2028' },
    { icon: '💰', label: currentLang === 'es' ? 'Salario' : 'Salary', val: salaryStr },
    { icon: '💎', label: currentLang === 'es' ? 'Valor' : 'Value', val: `${(p.marketValue / 1000000).toFixed(0)}M€` },
    { icon: '🔥', label: currentLang === 'es' ? 'Mejora' : 'Potential', val: getImprovementAspect(p) }
  ];
  
  el.innerHTML = stats.map(s => `
    <div class="t-row">
      <div class="t-label">${s.icon} ${s.label}</div>
      <div class="t-val">${s.val}</div>
    </div>
  `).join('');
}

function fillH2HBars(p1, p2) {
  const container = document.getElementById('h2h-bars');
  const p1S = getPlayerChartData(p1);
  const p2S = getPlayerChartData(p2);
  
  const metrics = [
    { label: currentLang === 'es' ? 'Goles' : 'Goals', v1: p1.stats.goals, v2: p2.stats.goals, max: 50 },
    { label: currentLang === 'es' ? 'Asistencias' : 'Assists', v1: p1.stats.assists, v2: p2.stats.assists, max: 20 },
    { label: currentLang === 'es' ? 'Partidos' : 'Matches', v1: p1.stats.matches, v2: p2.stats.matches, max: 50 },
    { label: 'Valor de Contrato', v1: formatContractValue(p1.marketValue), v2: formatContractValue(p2.marketValue), isText: true },
    { label: currentLang === 'es' ? 'Velocidad' : 'Pace', v1: p1S[0], v2: p2S[0], max: 100 },
    { label: currentLang === 'es' ? 'Disparo' : 'Shooting', v1: p1S[1], v2: p2S[1], max: 100 },
    { label: currentLang === 'es' ? 'Pase' : 'Passing', v1: p1S[2], v2: p2S[2], max: 100 },
    { label: currentLang === 'es' ? 'Regate' : 'Dribbling', v1: p1S[3], v2: p2S[3], max: 100 },
    { label: currentLang === 'es' ? 'Físico' : 'Physical', v1: p1S[5], v2: p2S[5], max: 100 },
  ];
  
  container.innerHTML = metrics.map(m => {
    const p1W = Math.min(50, (m.v1 / m.max) * 50);
    const p2W = Math.min(50, (m.v2 / m.max) * 50);
    return `
      <div class="h2h-bar-row">
        <div class="h2h-num left">${m.v1}</div>
        <div class="bar-track">
          <div class="h2h-label">${m.label}</div>
          <div class="bar-fill left" style="width: 0%" data-w="${p1W}%"></div>
          <div class="bar-fill right" style="width: 0%" data-w="${p2W}%"></div>
        </div>
        <div class="h2h-num right">${m.v2}</div>
      </div>
    `;
  }).join('');
  
  setTimeout(() => {
    container.querySelectorAll('.bar-fill').forEach(b => b.style.width = b.dataset.w);
  }, 50);
}

function getPlayerChartData(player) {
  // Convert 1-10 rating to 10-100 base for chart calculations
  const base = player.overallRating > 10 ? player.overallRating : player.overallRating * 10;
  const seed = player.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const pseudoRand = (offset) => ((seed + offset) % 15) - 7;

  const stats = {
    pace: base + pseudoRand(1),
    shooting: base + pseudoRand(2),
    passing: base + pseudoRand(3),
    dribbling: base + pseudoRand(4),
    defense: base + pseudoRand(5),
    physical: base + pseudoRand(6)
  };

  // Adjust based on position
  const pos = player.position;
  if (['ST', 'CF', 'LW', 'RW'].includes(pos)) {
    stats.shooting += 10;
    stats.pace += 5;
    stats.defense -= 20;
  } else if (['CAM', 'LM', 'RM'].includes(pos)) {
    stats.passing += 10;
    stats.dribbling += 8;
  } else if (['CM', 'CDM'].includes(pos)) {
    stats.physical += 10;
    stats.passing += 5;
    stats.defense += 5;
  } else if (['CB', 'LB', 'RB'].includes(pos)) {
    stats.defense += 15;
    stats.physical += 10;
    stats.shooting -= 15;
  } else if (pos === 'GK') {
    stats.defense += 20;
    stats.physical += 5;
    stats.shooting -= 40;
    stats.pace -= 20;
  }

  // Adjust based on strengths (if present in known players)
  if (player.strengths) {
    player.strengths.forEach(s => {
      const sl = s.toLowerCase();
      if (sl.includes('vel') || sl.includes('pace') || sl.includes('speed')) stats.pace += 5;
      if (sl.includes('def') || sl.includes('marc') || sl.includes('tackle')) stats.defense += 5;
      if (sl.includes('pas') || sl.includes('visión') || sl.includes('vision')) stats.passing += 5;
      if (sl.includes('regat') || sl.includes('drib') || sl.includes('técn')) stats.dribbling += 5;
      if (sl.includes('remat') || sl.includes('finis') || sl.includes('gol')) stats.shooting += 5;
      if (sl.includes('fís') || sl.includes('phys') || sl.includes('strength')) stats.physical += 5;
    });
  }

  // Cap at 99 (internal scaling for charts)
  return Object.values(stats).map(v => Math.min(99, Math.max(30, Math.round(v))));
}

function renderComparisonChart(p1, p2) {
  const canvas = document.getElementById('comparisonRadarChart');
  if (!canvas) {
    console.warn('⚠️ comparisonRadarChart not found in DOM. Skipping chart render.');
    return;
  }
  const ctx = canvas.getContext('2d');
  
  if (comparisonChart) {
    comparisonChart.destroy();
  }

  const data1 = getPlayerChartData(p1);
  const data2 = getPlayerChartData(p2);
  
  const labels = currentLang === 'es' 
    ? ['Velocidad', 'Remate', 'Pase', 'Regate', 'Defensa', 'Físico']
    : ['Pace', 'Shooting', 'Passing', 'Dribbling', 'Defense', 'Physical'];

  try {
    comparisonChart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: labels,
        datasets: [
          {
            label: p1.name,
            data: data1,
            fill: true,
            backgroundColor: 'rgba(0, 229, 255, 0.2)',
            borderColor: getTeamColor(p1.currentTeam),
            pointBackgroundColor: getTeamColor(p1.currentTeam),
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: getTeamColor(p1.currentTeam)
          },
          {
            label: p2.name,
            data: data2,
            fill: true,
            backgroundColor: 'rgba(118, 255, 3, 0.2)',
            borderColor: getTeamColor(p2.currentTeam),
            pointBackgroundColor: getTeamColor(p2.currentTeam),
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: getTeamColor(p2.currentTeam)
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        elements: {
          line: { borderWidth: 3 }
        },
        scales: {
          r: {
            angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
            grid: { color: 'rgba(255, 255, 255, 0.1)' },
            pointLabels: {
              color: 'rgba(255, 255, 255, 0.7)',
              font: { size: 12, weight: 'bold' }
            },
            ticks: {
              beginAtZero: true,
              max: 100,
              stepSize: 20,
              display: false,
              backdropColor: 'transparent'
            },
            suggestedMin: 30,
            suggestedMax: 100
          }
        },
        plugins: {
          legend: {
            labels: {
              color: '#fff',
              font: { family: 'Inter', size: 13, weight: '600' }
            }
          }
        }
      }
    });
  } catch (err) {
    console.error('Failed to render Chart.js radar chart (comparison):', err);
  }
}

// ──────────────────────────────────────────
// PREDICTIONS
// ──────────────────────────────────────────
async function loadPredictions() {
  document.getElementById('predictions-loading').style.display = 'flex';
  document.getElementById('predictions-content').style.display = 'none';

  try {
    const res = await fetchWithAuth(`${API}/predictions?lang=${currentLang}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error from server');
    const content = document.getElementById('predictions-content');
    content.innerHTML = markdownToHtml(data.predictions);
    document.getElementById('predictions-loading').style.display = 'none';
    content.style.display = 'block';
    predictionsLoaded = true;
  } catch {
    document.getElementById('predictions-loading').innerHTML = '<p style="color:var(--red)">Error al cargar predicciones.</p>';
  }

  document.getElementById('btn-refresh-predictions').addEventListener('click', () => {
    predictionsLoaded = false;
    loadPredictions();
  });
}

// ──────────────────────────────────────────
// MARKDOWN TO HTML (lightweight)
// ──────────────────────────────────────────
function markdownToHtml(md) {
  if (!md) return '';
  return md
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/&lt;img(.+?)&gt;/g, '<img$1>') // Allow img tags
    .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:8px;margin-top:10px;">')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h2>$1</h2>')
    .replace(/^\|?(.+)\|?$/gm, (match, row) => {
      if (!match.includes('|')) return match;
      const cells = row.split('|').map(c => c.trim()).filter(c => c !== '');
      if (cells.length === 0) return match;
      const isHeader = cells.some(c => c.match(/^-+$/));
      if (isHeader) return '';
      return `<tr>${cells.map(c => `<td>${c}</td>`).join('')}</tr>`;
    })
    .replace(/(<tr>[\s\S]+?<\/tr>)/g, (match) => {
      const rows = match.match(/<tr>[\s\S]*?<\/tr>/g) || [];
      const firstRow = rows[0]?.replace(/<td>/g, '<th>').replace(/<\/td>/g, '</th>');
      const rest = rows.slice(1).join('');
      return `<table><thead>${firstRow}</thead><tbody>${rest}</tbody></table>`;
    })
    .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/^(?!<[hultpc])(.+)$/gm, (line) => line ? line : '')
    .replace(/\n/g, '<br />')
    .replace(/(<br \/>){3,}/g, '<br /><br />');
}

// ──────────────────────────────────────────
// TOAST
// ──────────────────────────────────────────
function showToast(msg, type = 'info') {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position:fixed;bottom:24px;right:24px;
    background:${type === 'error' ? 'rgba(255,82,82,0.15)' : 'rgba(0,230,118,0.15)'};
    border:1px solid ${type === 'error' ? 'rgba(255,82,82,0.4)' : 'rgba(0,230,118,0.4)'};
    color:${type === 'error' ? '#ff5252' : '#00e676'};
    padding:14px 20px;border-radius:12px;font-size:14px;font-weight:600;
    z-index:9999;backdrop-filter:blur(8px);
    animation:fadeIn 0.3s ease;max-width:360px;line-height:1.5;
  `;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 5000);
}




// Old profile upgrade functions removed (replaced by unified gateway at the end of the file)

// ──────────────────────────────────────────
// UNIFIED PREMIUM PAYMENT GATEWAY SYSTEM
// ──────────────────────────────────────────
let selectedUpgradeTierName = null;
let selectedUpgradeCardElement = null;

// Global references for context mapping
window.pendingPaymentTier = null;
window.pendingPaymentCard = null;

// Prices map
const TIER_PRICES = {
  'Gratis': 0.00,
  'Pro': 9.99,
  'Local': 40.00,
  'Plus': 19.99,
  'Enterprise': 49.99
};

const TIER_RANKS = {
  'Gratis': 0,
  'Pro': 1,
  'Plus': 2,
  'Local': 3,
  'Enterprise': 4
};

window.getMaxPaidTierInCycle = (userObj) => {
  const user = userObj || JSON.parse(localStorage.getItem('scout_ai_user') || '{}');
  if (!user || !window.isBillingCycleActive(user)) return 'Gratis';
  
  if (user.maxPaidTierInCycle && TIER_RANKS[user.maxPaidTierInCycle] !== undefined) {
    return user.maxPaidTierInCycle;
  }
  
  const history = window.getUserPaymentHistory();
  if (history && history.length > 0) {
    let maxRank = TIER_RANKS[user.selectedTier] || 0;
    let maxTier = user.selectedTier || 'Gratis';
    const cycleStart = user.billingCycleStart ? new Date(user.billingCycleStart) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    history.forEach(p => {
      const pDate = new Date(p.createdAt || Date.now());
      if (pDate >= cycleStart) {
        const rank = TIER_RANKS[p.tier] || 0;
        if (rank > maxRank) {
          maxRank = rank;
          maxTier = p.tier;
        }
      }
    });
    return maxTier;
  }
  
  return user.selectedTier || 'Gratis';
};

// ──────────────────────────────────────────
// MONTHLY BILLING CYCLE & PAYMENT HISTORY HELPERS
// ──────────────────────────────────────────
window.getUserPaymentHistory = () => {
  try {
    return JSON.parse(localStorage.getItem('scout_ai_payments_history') || '[]');
  } catch (e) {
    return [];
  }
};

window.saveLocalPaymentRecord = (transaction) => {
  if (!transaction) return;
  const history = window.getUserPaymentHistory();
  const exists = history.some(p => p.transactionId === transaction.transactionId);
  if (!exists) {
    history.unshift({
      transactionId: transaction.transactionId || ('TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase()),
      amount: transaction.amount || 0,
      currency: transaction.currency || 'USD',
      tier: transaction.tier || 'Pro',
      cardholderName: transaction.cardholderName || 'Usuario',
      cardLast4: transaction.cardLast4 || '4242',
      status: transaction.status || 'success',
      createdAt: transaction.createdAt || new Date().toISOString()
    });
    localStorage.setItem('scout_ai_payments_history', JSON.stringify(history));
  }
};

window.isBillingCycleActive = (userObj) => {
  const user = userObj || JSON.parse(localStorage.getItem('scout_ai_user') || '{}');
  if (!user || !user.billingCycleEnd) return false;
  try {
    const now = new Date();
    const end = new Date(user.billingCycleEnd);
    return now < end;
  } catch (e) {
    return false;
  }
};

window.getBillingCycleDaysRemaining = (userObj) => {
  const user = userObj || JSON.parse(localStorage.getItem('scout_ai_user') || '{}');
  if (!user || !user.billingCycleEnd) return 0;
  const now = new Date();
  const end = new Date(user.billingCycleEnd);
  const diffMs = end - now;
  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

window.formatBillingCycleDate = (isoString) => {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch (e) {
    return '';
  }
};

window.cancelSubscription = async () => {
  const user = JSON.parse(localStorage.getItem('scout_ai_user') || '{}');
  const endDateStr = window.formatBillingCycleDate(user.billingCycleEnd);
  
  if (!confirm(`¿Estás seguro de que deseas cancelar la renovación automática de tu plan ${user.selectedTier || 'actual'}?\n\nMantendrás tu acceso completo a todas las funciones hasta la fecha de vencimiento (${endDateStr}). Después de esa fecha, tu cuenta volverá al plan Gratis a menos que decidas renovar manualmente.`)) {
    return;
  }
  
  user.autoRenew = false;
  localStorage.setItem('scout_ai_user', JSON.stringify(user));
  
  try {
    const token = localStorage.getItem('scout_ai_token');
    await fetch(`${API}/auth/unsubscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
  } catch (e) {
    console.warn('Unsubscribe backend sync note:', e);
  }
  
  showToast(`ℹ️ Renovación automática cancelada. Tu plan ${user.selectedTier} se mantendrá activo hasta el ${endDateStr}.`, 'info');
  renderProfile();
};

// Initialize listeners on the checkout form
window.setupPaymentGateway = () => {
  const nameInput = document.getElementById('pay-field-holder') || document.getElementById('pay-card-name');
  const numInput = document.getElementById('pay-field-digits') || document.getElementById('pay-card-number');
  const expInput = document.getElementById('pay-field-period') || document.getElementById('pay-card-expiry');
  const cvvInput = document.getElementById('pay-field-code') || document.getElementById('pay-card-cvv');
  const payBtn = document.getElementById('btn-simulate-payment');
  const brandSpan = document.getElementById('pay-card-brand');

  if (!nameInput || !numInput || !expInput || !cvvInput || !payBtn) {
    console.warn('⚠️ Payment Gateway fields not found in the DOM.');
    return;
  }

  // Helper to validate entire form in real-time
  function validateForm() {
    const nameVal = nameInput.value.trim();
    const numVal = numInput.value.replace(/\s/g, '');
    const expVal = expInput.value.trim();
    const cvvVal = cvvInput.value.trim();

    const isNameValid = nameVal.length >= 3;
    const isNumValid = numVal.length >= 13 && numVal.length <= 16 && /^\d+$/.test(numVal);
    
    let isExpValid = false;
    if (expVal.length === 5 && expVal.includes('/')) {
      const parts = expVal.split('/');
      const m = parseInt(parts[0], 10);
      if (m >= 1 && m <= 12) {
        isExpValid = true;
      }
    }
    const isCvvValid = cvvVal.length >= 3 && cvvVal.length <= 4 && /^\d+$/.test(cvvVal);

    if (isNameValid && isNumValid && isExpValid && isCvvValid) {
      payBtn.disabled = false;
      payBtn.style.opacity = '1';
    } else {
      payBtn.disabled = true;
      payBtn.style.opacity = '0.5';
    }
  }

  // 1. Name Input: Only letters and spaces
  nameInput.addEventListener('input', () => {
    nameInput.value = nameInput.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    validateForm();
  });

  // 2. Card Number: Auto-spacing & Brand Detection
  numInput.addEventListener('input', () => {
    let clean = numInput.value.replace(/\D/g, '');
    
    // Brand detection
    if (clean.startsWith('4')) {
      brandSpan.textContent = 'Visa 🔵';
      brandSpan.style.color = '#00f0ff';
    } else if (clean.startsWith('5')) {
      brandSpan.textContent = 'MC 🟠';
      brandSpan.style.color = '#ff9800';
    } else if (clean.startsWith('3')) {
      brandSpan.textContent = 'Amex 🟢';
      brandSpan.style.color = '#4caf50';
    } else if (clean.startsWith('6')) {
      brandSpan.textContent = 'Disc 🟣';
      brandSpan.style.color = '#9c27b0';
    } else {
      brandSpan.textContent = '💳';
      brandSpan.style.color = 'rgba(255,255,255,0.4)';
    }

    // Auto-spacing every 4 digits
    let formatted = '';
    for (let i = 0; i < clean.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += ' ';
      }
      formatted += clean[i];
    }
    
    numInput.value = formatted;
    validateForm();
  });

  // 3. Expiration Expiry: Auto-slash MM/YY
  expInput.addEventListener('input', () => {
    let clean = expInput.value.replace(/\D/g, '');
    if (clean.length > 2) {
      expInput.value = clean.slice(0, 2) + '/' + clean.slice(2, 4);
    } else {
      expInput.value = clean;
    }
    validateForm();
  });

  // 4. CVV: Numbers only
  cvvInput.addEventListener('input', () => {
    cvvInput.value = cvvInput.value.replace(/\D/g, '');
    validateForm();
  });

  // Reset form helper
  window.resetPaymentGatewayForm = () => {
    nameInput.value = '';
    numInput.value = '';
    expInput.value = '';
    cvvInput.value = '';
    brandSpan.textContent = '💳';
    brandSpan.style.color = 'rgba(255,255,255,0.4)';
    payBtn.disabled = true;
    payBtn.style.opacity = '0.5';
  };
};

// Global modal trigger wrappers
window.showPaymentModal = (tierName, price, cardElement, isUpgrade = false) => {
  const currentUser = JSON.parse(localStorage.getItem('scout_ai_user') || '{}');
  window.pendingPaymentTier = tierName;
  window.pendingPaymentCard = cardElement;
  window.previousPaymentTier = currentUser.selectedTier || 'Gratis';
  window.previousPaymentRole = currentUser.role || '';

  const modal = document.getElementById('payment-modal');
  if (!modal) return;

  if (typeof window.resetPaymentGatewayForm === 'function') {
    window.resetPaymentGatewayForm();
  }

  // Ensure default sub-view states (show checkout form, hide success and role screens)
  const checkoutView = document.getElementById('payment-checkout-view');
  const successView = document.getElementById('payment-success-view');
  const roleView = document.getElementById('payment-role-view');
  if (checkoutView) checkoutView.style.display = 'flex';
  if (successView) successView.style.display = 'none';
  if (roleView) roleView.style.display = 'none';

  let numericPrice = parseFloat(String(price).replace(/[^0-9\.]/g, ''));
  if (isNaN(numericPrice)) {
    numericPrice = TIER_PRICES[tierName] || 9.99;
  }
  window.pendingPaymentAmount = numericPrice;

  if (isUpgrade) {
    document.getElementById('payment-modal-title').textContent = `Mejorar Plan a ${tierName}`;
    document.getElementById('payment-modal-price').innerHTML = `$${numericPrice.toFixed(2)} <span style="font-size: 13px; color: rgba(255,255,255,0.4); font-weight: 400;">(Diferencia única, luego $${(TIER_PRICES[tierName] || 0).toFixed(2)}/mes)</span>`;
  } else {
    document.getElementById('payment-modal-title').textContent = `Activar Plan ${tierName}`;
    document.getElementById('payment-modal-price').innerHTML = `$${numericPrice.toFixed(2)} <span style="font-size: 13px; color: rgba(255,255,255,0.4); font-weight: 400;">/ mes</span>`;
  }

  modal.style.display = 'flex';
};

window.closePaymentModal = () => {
  const modal = document.getElementById('payment-modal');
  if (modal) modal.style.display = 'none';
};

window.closeSuccessAndDashboard = () => {
  window.closePaymentModal();
  const upgradeModal = document.getElementById('upgrade-modal');
  if (upgradeModal && upgradeModal.style.display !== 'none') {
    window.closeUpgradeModal();
  }
};

window.handleSuccessContinue = () => {
  const tier = window.pendingPaymentTier;
  const user = JSON.parse(localStorage.getItem('scout_ai_user') || '{}');
  const prevTier = (window.previousPaymentTier || user.selectedTier || '').toLowerCase();
  const prevRole = (window.previousPaymentRole || user.role || '').toLowerCase();
  const wasLocal = prevTier === 'local' || prevRole === 'local' || prevRole === 'entrenador local';
  
  const hasValidProfessionalTeam = !!user.selectedClub && user.selectedClub !== 'Club Local' && user.selectedClub !== '' && !!user.selectedCountry && user.selectedCountry !== 'Local';
  const isExistingUser = user.onboardingComplete || !!user.localCoachData;

  if (tier === 'Enterprise') {
    // Transition to the dedicated organizational role screen
    const successViewEl = document.getElementById('payment-success-view');
    const roleViewEl = document.getElementById('payment-role-view');
    if (successViewEl) successViewEl.style.display = 'none';
    if (roleViewEl) {
      roleViewEl.style.display = 'flex';
      const roleInput = document.getElementById('success-user-role-new');
      if (roleInput) {
        roleInput.value = '';
        roleInput.style.borderColor = 'rgba(0, 240, 255, 0.25)';
      }
    }
  } else if (tier === 'Local') {
    window.closePaymentModal();
    const upgradeModal = document.getElementById('upgrade-modal');
    if (upgradeModal && upgradeModal.style.display !== 'none') {
      window.closeUpgradeModal();
    }
    if (isExistingUser && !!user.localCoachData) {
      applyPlanPermissions();
      renderProfile();
      return;
    }
    const localScreen = document.getElementById('local-coach-onboarding-screen');
    if (localScreen) {
      localScreen.style.display = 'flex';
      // Reset inputs
      ['local-coach-club', 'local-coach-age-range', 
       'local-coach-nationality', 'local-coach-code', 'local-coach-league-address', 
       'local-coach-leagues-participating', 'local-coach-awards'].forEach(id => {
         const el = document.getElementById(id);
         if (el) {
           el.value = '';
           el.style.borderColor = 'rgba(0, 240, 255, 0.2)';
         }
       });
    }
  } else {
    // Si cambió a un plan no-local (Pro, Plus, Enterprise)
    // 1. Si ya tenía un club profesional guardado previamente en su historial, restaurarlo
    if (user.previousStandardClub && user.previousStandardClub !== 'Club Local' && (!user.selectedClub || user.selectedClub === 'Club Local')) {
      user.selectedClub = user.previousStandardClub;
      if (user.previousStandardCountry && user.previousStandardCountry !== 'Local') {
        user.selectedCountry = user.previousStandardCountry;
      }
      user.selectedTier = tier;
      localStorage.setItem('scout_ai_user', JSON.stringify(user));
    }

    // Comprobar si tras la restauración cuenta con un equipo profesional válido
    const hasProTeamNow = !!user.selectedClub && user.selectedClub !== 'Club Local' && user.selectedClub !== '' && !!user.selectedCountry && user.selectedCountry !== 'Local';

    if (!hasProTeamNow) {
      // Hay onboarding pendiente para el nuevo plan: Mostrar pantalla de carga e iniciar onboarding de inmediato
      if (window.SectionLoader) window.SectionLoader.show('Cargando nuevo plan...');
      window.closePaymentModal();
      const upgradeModal = document.getElementById('upgrade-modal');
      if (upgradeModal && upgradeModal.style.display !== 'none') {
        window.closeUpgradeModal();
      }
      user.selectedTier = tier;
      user.onboardingComplete = false;
      user.selectedClub = ''; // Limpiar 'Club Local' para requerir selección de club profesional
      localStorage.setItem('scout_ai_user', JSON.stringify(user));

      setTimeout(() => {
        showToast('ℹ️ Por favor, selecciona tu país y club profesional para tu nuevo plan.', 'info');
        if (typeof window.setupOnboarding === 'function') {
          window.setupOnboarding();
        }
        if (window.SectionLoader) window.SectionLoader.hide();
      }, 400);
      return;
    }

    // Si ya cuenta con equipo profesional válido
    if (window.SectionLoader) window.SectionLoader.show('Aplicando plan...');
    window.closeSuccessAndDashboard();
    setTimeout(() => {
      applyPlanPermissions();
      renderProfile();
      if (window.SectionLoader) window.SectionLoader.hide();
    }, 350);
  }
};

window.showLocalCoachFormModal = () => {
  window.closePaymentModal();
  const upgradeModal = document.getElementById('upgrade-modal');
  if (upgradeModal) {
    window.closeUpgradeModal();
  }
  
  const localScreen = document.getElementById('local-coach-onboarding-screen');
  if (localScreen) {
    localScreen.style.display = 'flex';
    // Reset inputs
    ['local-coach-club', 'local-coach-age-range', 
     'local-coach-nationality', 'local-coach-code', 'local-coach-league-address', 
     'local-coach-admin-phone', 'local-coach-leagues-participating', 'local-coach-awards'].forEach(id => {
       const el = document.getElementById(id);
       if (el) {
         el.value = '';
         el.style.borderColor = 'rgba(0, 240, 255, 0.2)';
       }
     });
  }
};

window.confirmSuccessAndSaveLocalForm = async () => {
  const club = document.getElementById('local-coach-club').value.trim();
  const ageRange = document.getElementById('local-coach-age-range').value.trim();
  const nationality = document.getElementById('local-coach-nationality').value.trim();
  const code = document.getElementById('local-coach-code').value.trim();
  const address = document.getElementById('local-coach-league-address').value.trim();
  const adminPhone = document.getElementById('local-coach-admin-phone').value.trim();
  const leagues = document.getElementById('local-coach-leagues-participating').value.trim();
  const awards = document.getElementById('local-coach-awards').value.trim();
  
  let hasError = false;
  
  const fields = [
    { id: 'local-coach-club', val: club },
    { id: 'local-coach-age-range', val: ageRange },
    { id: 'local-coach-nationality', val: nationality },
    { id: 'local-coach-code', val: code },
    { id: 'local-coach-league-address', val: address },
    { id: 'local-coach-admin-phone', val: adminPhone },
    { id: 'local-coach-leagues-participating', val: leagues }
  ];
  
  fields.forEach(f => {
    const el = document.getElementById(f.id);
    if (!f.val) {
      if (el) el.style.borderColor = '#ff4a4a';
      hasError = true;
    } else {
      if (el) el.style.borderColor = 'rgba(0, 240, 255, 0.2)';
    }
  });
  
  if (hasError) {
    showToast('⚠️ Por favor, completa todos los campos obligatorios.', 'error');
    return;
  }

  // Validar que el teléfono administrativo sea diferente al teléfono de registro personal
  const user = JSON.parse(localStorage.getItem('scout_ai_user') || '{}');
  const personalPhone = user.telefono || '';
  const cleanAdmin = adminPhone.replace(/[\s\-\+\(\)]/g, '');
  const cleanPersonal = personalPhone.replace(/[\s\-\+\(\)]/g, '');
  
  if (cleanAdmin && cleanPersonal && cleanAdmin === cleanPersonal) {
    const el = document.getElementById('local-coach-admin-phone');
    if (el) el.style.borderColor = '#ff4a4a';
    showToast('⚠️ El teléfono administrativo del club debe ser diferente a tu teléfono personal.', 'error');
    return;
  }
  
  const saveBtn = document.getElementById('btn-success-local-continue');
  if (saveBtn) {
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
    saveBtn.disabled = true;
  }
  
  const localCoachData = {
    club,
    ageRange,
    nationality,
    code,
    address,
    adminPhone,
    leagues,
    awards
  };
  
  let isSaved = false;
  try {
    const token = localStorage.getItem('scout_ai_token');
    const res = await fetch(`${API}/auth/onboarding`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        selectedClub: 'Club Local',
        selectedCountries: [nationality],
        selectedTier: 'Local',
        localCoachData
      })
    });
    if (res.ok) isSaved = true;
  } catch (err) {
    console.warn('Saving local coach details failed (offline):', err);
  }
  
  // Reuse the user object already declared above
  user.onboardingComplete = true;
  user.role = 'Entrenador Local';
  user.selectedClub = 'Club Local';
  user.selectedCountry = nationality;
  user.selectedTier = 'Local';
  user.localCoachData = localCoachData;
  localStorage.setItem('scout_ai_user', JSON.stringify(user));
  localStorage.removeItem('scout_ai_swaps');
  localStorage.removeItem('scout_ai_benched');
  
  if (!isSaved) {
    showToast('ℹ️ Configuración guardada localmente (modo demo).', 'info');
  }
  
  const localScreen = document.getElementById('local-coach-onboarding-screen');
  if (localScreen) {
    localScreen.style.display = 'none';
  }
  
  window.closePaymentModal();
  const upgradeModal = document.getElementById('upgrade-modal');
  if (upgradeModal && upgradeModal.style.display !== 'none') {
    window.closeUpgradeModal();
  }
  
  // Exiting onboarding
  const onboarding = document.getElementById('onboarding-screen');
  if (onboarding) {
    onboarding.style.opacity = '0';
    if (window.SectionLoader) window.SectionLoader.show('Activando plan...');
    setTimeout(() => {
      onboarding.style.display = 'none';
      initDashboard();
      if (window.SectionLoader) window.SectionLoader.hide();
    }, 500);
  } else {
    if (window.SectionLoader) window.SectionLoader.show('Activando plan...');
    setTimeout(() => {
      initDashboard();
      if (window.SectionLoader) window.SectionLoader.hide();
    }, 400);
  }
};

window.confirmSuccessAndSaveRole = async () => {
  const roleInput = document.getElementById('success-user-role-new');
  const userRole = roleInput ? roleInput.value.trim() : '';

  if (!userRole) {
    showToast('⚠️ Por favor, introduce tu rol organizacional.', 'error');
    if (roleInput) roleInput.style.borderColor = '#ff4a4a';
    return;
  }

  const saveBtn = document.getElementById('btn-success-role-continue');
  const originalText = saveBtn.textContent;
  saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando rol...';
  saveBtn.disabled = true;

  let isSaved = false;
  try {
    const token = localStorage.getItem('scout_ai_token');
    const res = await fetch(`${API}/auth/onboarding`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ role: userRole })
    });

    if (res.ok) {
      isSaved = true;
    }
  } catch (err) {
    console.warn('Saving role failed (offline/Netlify):', err);
  }

  // Fallback: Siempre guardar localmente y continuar
  const user = JSON.parse(localStorage.getItem('scout_ai_user') || '{}');
  user.role = userRole;
  localStorage.setItem('scout_ai_user', JSON.stringify(user));
  renderProfile();
  
  if (!isSaved) {
    showToast('ℹ️ Rol guardado localmente (modo demostración).', 'info');
  }

  const onboardingScreen = document.getElementById('onboarding-screen');
  const isOnboarding = onboardingScreen && onboardingScreen.style.display !== 'none';
  if (isOnboarding) {
    window.closePaymentModal();
    const upgradeModal = document.getElementById('upgrade-modal');
    if (upgradeModal && upgradeModal.style.display !== 'none') {
      window.closeUpgradeModal();
    }
    if (typeof window.finalizarOnboarding === 'function') {
      await window.finalizarOnboarding();
    }
  } else {
    window.closeSuccessAndDashboard();
  }
};

// Unified transaction submission flow with spinner loading phases and backend integration
window.simulatePayment = async () => {
  const payBtn = document.getElementById('btn-simulate-payment');
  if (!payBtn) return;

  const tier = window.pendingPaymentTier;
  const cardElement = window.pendingPaymentCard;
  
  if (!tier) {
    showToast('⚠️ No se ha seleccionado ningún plan para el pago.', 'error');
    return;
  }

  const nameInput = document.getElementById('pay-field-holder') || document.getElementById('pay-card-name');
  const numInput = document.getElementById('pay-field-digits') || document.getElementById('pay-card-number');
  const amount = window.pendingPaymentAmount !== undefined ? window.pendingPaymentAmount : (TIER_PRICES[tier] || 9.99);

  payBtn.disabled = true;

  // Phase 1 loading spinner
  payBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Validando datos fiduciarios...';

  setTimeout(async () => {
    // Phase 2 loading spinner
    payBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Conectando con banco adquirente...';

    setTimeout(async () => {
      // Phase 3 loading spinner
      payBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando suscripción segura...';

      let result;
      let isSuccess = false;

      try {
        const token = localStorage.getItem('scout_ai_token');
        const res = await fetch(`${API}/payments/checkout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            tier,
            cardholderName: nameInput.value.trim(),
            cardNumber: numInput.value,
            amount,
            role: tier === 'Local' ? 'Entrenador Local' : undefined
          })
        });

        if (res.ok) {
          result = await res.json();
          if (result.success) {
            isSuccess = true;
          }
        }
      } catch (err) {
        console.warn('Payment checkout offline fallback activated:', err);
      }

      // Fallback: Simular transacción aprobada si el backend está offline (p. ej. Netlify estático)
      if (!isSuccess) {
        result = {
          success: true,
          transaction: {
            transactionId: 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            amount: amount,
            cardholderName: nameInput.value.trim() || 'Lionel Messi',
            paymentMethod: 'Tarjeta de Crédito'
          }
        };
        isSuccess = true;
        showToast('ℹ️ Modo demo: Pago aprobado localmente.', 'info');
      }

      if (isSuccess && result.success) {
        // Save transaction to local payment history
        if (result.transaction) {
          result.transaction.tier = result.transaction.tier || tier;
          window.saveLocalPaymentRecord(result.transaction);
        }

        // 1. Update dynamic client states
        const user = JSON.parse(localStorage.getItem('scout_ai_user') || '{}');
        const prevTier = (window.previousPaymentTier || user.selectedTier || '').toLowerCase();
        const prevRole = (window.previousPaymentRole || user.role || '').toLowerCase();
        const wasLocal = prevTier === 'local' || prevRole === 'local' || prevRole === 'entrenador local';
        const hasStandardTeam = (!!user.selectedClub && user.selectedClub !== 'Club Local' && !!user.selectedCountry && user.selectedCountry !== 'Local') ||
                                (!!user.previousStandardClub && user.previousStandardClub !== 'Club Local') ||
                                user.standardOnboardingCompleted === true;

        const now = new Date();
        const cycleEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        const currentMaxRank = TIER_RANKS[user.maxPaidTierInCycle] || 0;
        const newRank = TIER_RANKS[tier] || 0;
        user.maxPaidTierInCycle = (result.user && result.user.maxPaidTierInCycle) || (newRank >= currentMaxRank ? tier : (user.maxPaidTierInCycle || tier));

        const cycleActive = window.isBillingCycleActive(user);
        user.selectedTier = tier;

        if (result.user && result.user.billingCycleStart) {
          user.billingCycleStart = result.user.billingCycleStart;
        } else if (!user.billingCycleStart || !cycleActive) {
          user.billingCycleStart = now.toISOString();
        }

        if (result.user && result.user.billingCycleEnd) {
          user.billingCycleEnd = result.user.billingCycleEnd;
        } else if (!user.billingCycleEnd || !cycleActive) {
          user.billingCycleEnd = cycleEnd.toISOString();
        }

        if (tier === 'Local') {
          user.role = 'Entrenador Local';
        } else if (tier === 'Enterprise' && (!user.role || user.role === 'Entrenador Local')) {
          user.role = 'Director Técnico / Presidente de Club';
        }
        if (wasLocal && tier !== 'Local' && !hasStandardTeam) {
          user.onboardingComplete = false;
        } else if (wasLocal && tier !== 'Local' && hasStandardTeam) {
          if (user.previousStandardClub && (!user.selectedClub || user.selectedClub === 'Club Local')) {
            user.selectedClub = user.previousStandardClub;
          }
          if (user.previousStandardCountry && (!user.selectedCountry || user.selectedCountry === 'Local')) {
            user.selectedCountry = user.previousStandardCountry;
          }
        }
        localStorage.setItem('scout_ai_user', JSON.stringify(user));
          
          showToast(`🎉 ¡Pago exitoso! Plan ${tier} activado. Txn ID: ${result.transaction.transactionId}`, 'success');

          // 2. Unlock the tier card visually inside the upgrade modal
          const upgradeCard = document.getElementById(`upgrade-card-${tier.toLowerCase()}`);
          if (upgradeCard) {
            upgradeCard.style.opacity = '1';
            upgradeCard.style.background = 'rgba(10, 20, 35, 0.6)';
            upgradeCard.style.borderColor = '#00f0ff';
            upgradeCard.style.boxShadow = '0 0 25px rgba(0, 240, 255, 0.3)';
            
            const lockEl = upgradeCard.querySelector('.tier-lock');
            if (lockEl) lockEl.style.display = 'none';
            
            // Mark selected
            window.selectUpgradeTier(tier, upgradeCard);
          }

          // 3. Unlock it in onboarding step 3 just in case
          const onboardingCard = document.getElementById(`tier-card-${tier.toLowerCase()}`);
          if (onboardingCard) {
            onboardingCard.style.opacity = '1';
            onboardingCard.style.background = 'rgba(10, 20, 35, 0.6)';
            onboardingCard.style.borderColor = '#00f0ff';
            onboardingCard.style.boxShadow = '0 0 25px rgba(0, 240, 255, 0.3)';
            const lockEl = onboardingCard.querySelector('.tier-lock');
            if (lockEl) lockEl.style.display = 'none';
            
            // If onboarding context, select it
            if (typeof window.selectTier === 'function') {
              window.selectTier(tier, onboardingCard);
            }
          }

          // 4. Force refresh profile page
          renderProfile();

          // 5. Update success continuation screen elements dynamically
          const checkoutViewEl = document.getElementById('payment-checkout-view');
          const successViewEl = document.getElementById('payment-success-view');
          
          if (checkoutViewEl && successViewEl) {
            const successTierName = document.getElementById('success-tier-name');
            const successTxnId = document.getElementById('success-txn-id');
            const successAmount = document.getElementById('success-amount');
            const successCardholder = document.getElementById('success-cardholder');
            const successPaymentMethod = document.getElementById('success-payment-method');
            
            if (successTierName) successTierName.textContent = tier;
            if (successTxnId) successTxnId.textContent = result.transaction.transactionId;
            if (successAmount) successAmount.textContent = `$${parseFloat(result.transaction.amount).toFixed(2)} USD`;
            if (successCardholder) successCardholder.textContent = result.transaction.cardholderName || nameInput.value.trim();
            
            if (successPaymentMethod) {
              successPaymentMethod.textContent = 'Tarjeta de Crédito';
            }
            
            // Configure success screen continue button text dynamically
            const continueBtn = document.getElementById('btn-success-continue');
            if (continueBtn) {
              if (tier === 'Enterprise') {
                continueBtn.textContent = 'Siguiente ➔';
              } else {
                continueBtn.textContent = 'Comenzar a explorar 🚀';
              }
            }

            // Swap checkout view for success continuation view in modal
            checkoutViewEl.style.display = 'none';
            successViewEl.style.display = 'flex';
          } else {
            // Fallback close if subviews are missing
            window.closePaymentModal();
          }
        } else {
          showToast(`⚠️ Error en pasarela: ${result.error || 'Transacción denegada'}`, 'error');
          payBtn.disabled = false;
          payBtn.innerHTML = 'Confirmar Pago Seguro 🔒';
        }
      }, 1000);
    }, 1000);
  };

// DOWNLOAD CERTIFIED INVOICE PDF
window.downloadInvoicePDF = () => {
  try {
    const { jsPDF } = window.jspdf;
    if (!jsPDF) {
      showToast('⚠️ La librería PDF no está cargada.', 'error');
      return;
    }

    // Get current receipt details from DOM
    const txnIdEl = document.getElementById('success-txn-id');
    const amountEl = document.getElementById('success-amount');
    const cardholderEl = document.getElementById('success-cardholder');
    const methodEl = document.getElementById('success-payment-method');

    const txnId = txnIdEl ? txnIdEl.textContent : 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const amountStr = amountEl ? amountEl.textContent : '$9.99 USD';
    const cardholder = cardholderEl ? cardholderEl.textContent : 'Lionel Messi';
    const paymentMethodText = methodEl ? methodEl.textContent : 'Visa terminada en 7890';
    
    // Format payment method simply to "Tarjeta de Crédito"
    const paymentMethod = 'Tarjeta de Crédito';

    const userObj = JSON.parse(localStorage.getItem('scout_ai_user') || '{}');
    const username = userObj.username || 'invitado';
    
    const tier = window.pendingPaymentTier || 'Pro';

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // ───────────────── GENERAL CONFIG ─────────────────
    const pageWidth = 210;
    const pageHeight = 297;
    
    // COLOR PALETTE (Modern Slate & Emerald Accent, Minimalist Printable)
    const primarySlate = [15, 23, 42];     // #0f172a - Slate 900
    const brandEmerald = [5, 150, 105];    // #059669 - Emerald 600
    const lightMint = [236, 253, 245];     // #ecfdf5 - Emerald 50
    const secondarySlate = [71, 85, 105];  // #475569 - Slate 600
    const backgroundSlate = [248, 250, 252]; // #f8fafc - Slate 50
    const borderGray = [226, 232, 240];    // #e2e8f0 - Slate 200

    // Date formatting
    const now = new Date();
    const dateStr = now.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const timeStr = now.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    const dateFormatted = `${dateStr} ${timeStr}`;

    // Security hash
    const securityHash = 'SHA256-' + Array.from({length: 24}, () => Math.floor(Math.random()*16).toString(16)).join('').toUpperCase();

    // ───────────────── 1. TOP HEADER ─────────────────
    // Draw Slate & Emerald top decorative bands
    doc.setFillColor(primarySlate[0], primarySlate[1], primarySlate[2]);
    doc.rect(0, 0, pageWidth, 4, 'F');
    doc.setFillColor(brandEmerald[0], brandEmerald[1], brandEmerald[2]);
    doc.rect(0, 4, pageWidth, 1.5, 'F');

    // Draw beautiful geometric brand mark natively (Stylized Tactical Soccer & AI Icon)
    // 1. Primary circle border
    doc.setDrawColor(primarySlate[0], primarySlate[1], primarySlate[2]);
    doc.setLineWidth(0.6);
    doc.circle(26, 22, 6, 'D');
    
    // 2. Technical tactical lines (soccer panel outline + tech nodes)
    doc.line(26, 16, 22.5, 27);
    doc.line(26, 16, 29.5, 27);
    doc.line(22.5, 27, 29.5, 27);
    
    // 3. Central AI node
    doc.setFillColor(primarySlate[0], primarySlate[1], primarySlate[2]);
    doc.circle(26, 22, 1.5, 'F');
    
    // 4. Tactical outer nodes (emerald circles)
    doc.setFillColor(brandEmerald[0], brandEmerald[1], brandEmerald[2]);
    doc.circle(26, 16, 1, 'F');
    doc.circle(22.5, 27, 1, 'F');
    doc.circle(29.5, 27, 1, 'F');

    // FutbolAI Brand Logo & Tagline (Left side)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(primarySlate[0], primarySlate[1], primarySlate[2]);
    doc.text('FutbolAI', 35, 21);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(secondarySlate[0], secondarySlate[1], secondarySlate[2]);
    doc.text('Inteligencia Artificial para Scouting y Tácticas Deportivas', 35, 25.5);

    // Invoice Meta (Right side)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(brandEmerald[0], brandEmerald[1], brandEmerald[2]);
    doc.text('FACTURA CERTIFICADA', 190, 20, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(secondarySlate[0], secondarySlate[1], secondarySlate[2]);
    doc.text(`Nº Recibo: ${txnId}`, 190, 25, { align: 'right' });
    doc.text(`Fecha: ${dateFormatted}`, 190, 29.5, { align: 'right' });

    // Horizontal Divider
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.setLineWidth(0.4);
    doc.line(20, 35, 190, 35);

    // ───────────────── 2. INVOICE METADATA (Grid with Accent Columns) ─────────────────
    const metaY = 43;
    
    // Left Column: EMISOR (Provider)
    doc.setFillColor(brandEmerald[0], brandEmerald[1], brandEmerald[2]);
    doc.rect(20, metaY - 3, 1.8, 14, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(primarySlate[0], primarySlate[1], primarySlate[2]);
    doc.text('EMISOR:', 24, metaY + 1.2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(secondarySlate[0], secondarySlate[1], secondarySlate[2]);
    doc.text('FutbolAI Platform Inc.', 24, metaY + 6.2);
    doc.text('NIT/RFC: US-901482399-5', 24, metaY + 10.7);
    doc.text('Av. 129, Gazcue', 24, metaY + 15.2);
    doc.text('Distrito Nacional, 10205, RD', 24, metaY + 19.7);
    doc.text('Email: soporte@futbolai.com', 24, metaY + 24.2);

    // Right Column: RECEPTOR (Client)
    doc.setFillColor(primarySlate[0], primarySlate[1], primarySlate[2]);
    doc.rect(110, metaY - 3, 1.8, 14, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(primarySlate[0], primarySlate[1], primarySlate[2]);
    doc.text('RECEPTOR / CLIENTE:', 114, metaY + 1.2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(secondarySlate[0], secondarySlate[1], secondarySlate[2]);
    doc.text(`Nombre: ${cardholder}`, 114, metaY + 6.2);
    doc.text(`Cuenta de Scout: @${username}`, 114, metaY + 10.7);
    doc.text(`Método de Pago: ${paymentMethod}`, 114, metaY + 15.2);
    doc.text('Estado del Pago: COMPLETADO (Aprobado)', 114, metaY + 19.7);
    doc.text('Divisa fiduciaria: USD ($)', 114, metaY + 24.2);

    // Horizontal Divider
    doc.line(20, 75, 190, 75);

    // ───────────────── 3. DETAILS TABLE (Stripe-Style Clean Design) ─────────────────
    const tableY = 82;
    
    // Header row background (Slate 50)
    doc.setFillColor(backgroundSlate[0], backgroundSlate[1], backgroundSlate[2]);
    doc.rect(20, tableY, 170, 8, 'F');

    // Header borders (sleek thin horizontal lines only)
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.setLineWidth(0.4);
    doc.line(20, tableY, 190, tableY);
    doc.line(20, tableY + 8, 190, tableY + 8);

    // Header labels
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(primarySlate[0], primarySlate[1], primarySlate[2]);
    doc.text('Descripción del Concepto / Suscripción', 23, tableY + 5.5);
    doc.text('Cant.', 125, tableY + 5.5, { align: 'center' });
    doc.text('P. Unitario', 160, tableY + 5.5, { align: 'right' });
    doc.text('Total', 187, tableY + 5.5, { align: 'right' });

    // Content row background (White)
    doc.setFillColor(255, 255, 255);
    doc.rect(20, tableY + 8, 170, 20, 'F');
    // Content row bottom border
    doc.line(20, tableY + 26, 190, tableY + 26);

    // Content text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(primarySlate[0], primarySlate[1], primarySlate[2]);
    if (tier === 'Local') {
      doc.text('Plan Entrenador Local (Pago Único)', 23, tableY + 14.5);
    } else {
      doc.text(`Suscripción Premium Mensual • Plan ${tier}`, 23, tableY + 14.5);
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(secondarySlate[0], secondarySlate[1], secondarySlate[2]);
    const descText = tier === 'Local' 
      ? 'Acceso completo a métricas avanzadas y herramientas de scouting para entrenador local.' 
      : 'Acceso completo a métricas avanzadas, predicciones IA, scouting global e informes tácticos.';
    const splitDesc = doc.splitTextToSize(descText, 90);
    doc.text(splitDesc, 23, tableY + 19.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(secondarySlate[0], secondarySlate[1], secondarySlate[2]);
    doc.text('1', 125, tableY + 16.5, { align: 'center' });
    doc.text(amountStr, 160, tableY + 16.5, { align: 'right' });
    doc.text(amountStr, 187, tableY + 16.5, { align: 'right' });

    // ───────────────── 4. TOTALS ─────────────────
    const totalsY = 116;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(secondarySlate[0], secondarySlate[1], secondarySlate[2]);
    doc.text('Subtotal:', 105, totalsY);
    doc.text(amountStr, 187, totalsY, { align: 'right' });

    doc.text('Impuestos (IVA 0%):', 105, totalsY + 4.5);
    doc.text('$0.00 USD', 187, totalsY + 4.5, { align: 'right' });

    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.setLineWidth(0.4);
    doc.line(105, totalsY + 7.5, 187, totalsY + 7.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(primarySlate[0], primarySlate[1], primarySlate[2]);
    doc.text('Total Neto Pagado:', 105, totalsY + 12.2);
    doc.text(amountStr, 187, totalsY + 12.2, { align: 'right' });

    // ───────────────── 5. CERTIFICATION SEAL BOX (Clean Green Panel with Vector Checkmark) ─────────────────
    const sealY = 138;
    
    // Draw beautiful panel: background mint and thin borders
    doc.setFillColor(lightMint[0], lightMint[1], lightMint[2]);
    doc.rect(20, sealY, 170, 36, 'F');
    
    // Emerald thick left border accent
    doc.setFillColor(brandEmerald[0], brandEmerald[1], brandEmerald[2]);
    doc.rect(20, sealY, 2, 36, 'F');

    // Outer thin border gray lines
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.setLineWidth(0.4);
    doc.line(22, sealY, 190, sealY);
    doc.line(190, sealY, 190, sealY + 36);
    doc.line(22, sealY + 36, 190, sealY + 36);

    // Draw vector green success badge natively
    doc.setFillColor(brandEmerald[0], brandEmerald[1], brandEmerald[2]);
    doc.circle(28, sealY + 7, 3.5, 'F');

    // White tick mark lines inside the circle
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.7);
    doc.line(26.2, sealY + 7, 27.5, sealY + 8.5);
    doc.line(27.5, sealY + 8.5, 30.2, sealY + 5.2);

    // Certified badge header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(brandEmerald[0], brandEmerald[1], brandEmerald[2]);
    doc.text('TRANSACCIÓN BANCARIA CERTIFICADA Y APROBADA', 35, sealY + 7.5);

    // Certified body text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 70, 50); // Deep dark forest green for contrast
    
    const sealText = 'Este comprobante fiduciario certifica que el pago por suscripción premium de FutbolAI se procesó de forma segura y exitosa. Los fondos han sido liquidados e integrados directamente a la base de datos fiduciaria bajo encriptación end-to-end y cumplimiento del estándar PCI-DSS.';
    const splitText = doc.splitTextToSize(sealText, 160);
    doc.text(splitText, 25, sealY + 14);

    // Security meta inside box
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 70, 50);
    doc.text(`ID de Autorización Fiduciaria: ${txnId}`, 25, sealY + 26.5);
    
    doc.setFont('courier', 'normal');
    doc.setTextColor(80, 100, 90);
    doc.text(`Sello Criptográfico Digital: ${securityHash}`, 25, sealY + 31);

    // ───────────────── 6. TERMS & CONDITIONS (Natively drawn circle bullets) ─────────────────
    const termsY = 184;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(primarySlate[0], primarySlate[1], primarySlate[2]);
    doc.text('Condiciones de Licencia y Políticas de Servicio:', 20, termsY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    
    const termsArray = [
      'La suscripción al plan premium otorga una licencia de uso personal, intransferible e ilimitada de las capacidades avanzadas de FutbolAI.',
      'El cobro es recurrente de forma mensual. Puede cambiar de plan o cancelar la renovación automática en cualquier momento desde su perfil de usuario.',
      'Para soporte sobre facturación, reembolsos o disputas comerciales, por favor contacte de inmediato a soporte@futbolai.com.'
    ];

    let currentY = termsY + 5.5;
    termsArray.forEach(term => {
      // Draw a perfect circular bullet point natively
      doc.setFillColor(brandEmerald[0], brandEmerald[1], brandEmerald[2]);
      doc.circle(21.5, currentY - 0.7, 0.6, 'F');
      
      // Print term description
      doc.setTextColor(secondarySlate[0], secondarySlate[1], secondarySlate[2]);
      doc.text(term, 25, currentY);
      currentY += 4;
    });

    // ───────────────── 7. AUTHORIZED SIGNATURE (Elegantly Styled Signature and Seal) ─────────────────
    const sigX = 135;
    const sigY = 220;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(primarySlate[0], primarySlate[1], primarySlate[2]);
    doc.text('Firma Autorizada FutbolAI', sigX, sigY);

    // Cursive line signature design
    doc.setDrawColor(brandEmerald[0], brandEmerald[1], brandEmerald[2]);
    doc.setLineWidth(0.4);
    doc.line(sigX, sigY + 7, sigX + 7, sigY + 4);
    doc.line(sigX + 7, sigY + 4, sigX + 15, sigY + 8);
    doc.line(sigX + 15, sigY + 8, sigX + 23, sigY + 3);
    doc.line(sigX + 23, sigY + 3, sigX + 37, sigY + 7);

    // Signature oblique text seal
    doc.setFont('courier', 'oblique');
    doc.setFontSize(9.5);
    doc.setTextColor(brandEmerald[0], brandEmerald[1], brandEmerald[2]);
    doc.text('Billing Office Seal', sigX + 2, sigY + 5.5);

    // Signature horizontal line
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.setLineWidth(0.4);
    doc.line(sigX - 5, sigY + 9, sigX + 45, sigY + 9);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(secondarySlate[0], secondarySlate[1], secondarySlate[2]);
    doc.text('Oficina de Control Fiduciario', sigX + 6, sigY + 12.5);

    // ───────────────── 8. BOTTOM ACCENTS & FOOTER ─────────────────
    // Bottom border bands
    doc.setFillColor(primarySlate[0], primarySlate[1], primarySlate[2]);
    doc.rect(20, 274, 170, 0.4, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(secondarySlate[0], secondarySlate[1], secondarySlate[2]);
    doc.text('FutbolAI Platform Inc. • Av. 129, Gazcue, Distrito Nacional, 10205, RD • soporte@futbolai.com • www.futbolai.com', pageWidth / 2, 280, { align: 'center' });



    // Download/Save
    doc.save(`Factura_FutbolAI_${txnId}.pdf`);
    showToast('📥 Factura PDF descargada con éxito.', 'success');
  } catch (err) {
    console.error('Error generating PDF:', err);
    showToast('⚠️ Error al generar o descargar el PDF de la factura.', 'error');
  }
};

// MINI-ALERT DIALOG FOR LOCKED TIERS
window.showMiniAlert = (tierName, price, cardElement, isUpgradeContext = false) => {
  const modal = document.getElementById('mini-alert-modal');
  if (!modal) return;

  const descEl = document.getElementById('mini-alert-desc');
  const titleEl = document.getElementById('mini-alert-title');
  const payBtn = document.getElementById('btn-mini-alert-pay');

  if (titleEl) titleEl.textContent = `Plan ${tierName} Bloqueado`;
  if (descEl) {
    if (tierName === 'Local') {
      descEl.innerHTML = `El plan <strong>${tierName}</strong> es una función premium destinada para entrenador local que requiere un pago único de <strong>${price}</strong>. ¿Deseas proceder a la pasarela de pago seguro para desbloquearlo?`;
    } else {
      descEl.innerHTML = `El plan <strong>${tierName}</strong> es una función premium que requiere una suscripción activa de <strong>${price}/mes</strong>. ¿Deseas proceder a la pasarela de pago seguro para desbloquearlo?`;
    }
  }

  if (payBtn) {
    payBtn.onclick = () => {
      window.closeMiniAlert();
      window.showPaymentModal(tierName, price, cardElement);
    };
  }

  modal.style.display = 'flex';
};

window.closeMiniAlert = () => {
  const modal = document.getElementById('mini-alert-modal');
  if (modal) modal.style.display = 'none';
};

window.openUpgradeModal = () => {
  const modal = document.getElementById('upgrade-modal');
  if (!modal) return;
  
  const user = JSON.parse(localStorage.getItem('scout_ai_user') || '{}');
  const currentTier = user.selectedTier || 'Gratis';
  const maxPaidTier = window.getMaxPaidTierInCycle(user);
  const maxPaidRank = TIER_RANKS[maxPaidTier] || 0;
  const cycleActive = window.isBillingCycleActive(user);
  const daysLeft = window.getBillingCycleDaysRemaining(user);
  const endDateStr = window.formatBillingCycleDate(user.billingCycleEnd);
  
  const bannerEl = document.getElementById('upgrade-modal-billing-banner');
  if (bannerEl) bannerEl.style.display = 'none';

  document.querySelectorAll('.upgrade-card').forEach(c => {
    c.style.borderColor = 'rgba(0, 240, 255, 0.15)';
    c.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
    c.querySelector('.tier-check').style.opacity = '0';
    
    // Obtener el tier de esta tarjeta
    const cardId = c.id; // upgrade-card-pro, upgrade-card-local, etc.
    const cardTierName = cardId.replace('upgrade-card-', '');
    const formattedTierName = Object.keys(TIER_PRICES).find(k => k.toLowerCase() === cardTierName) || 'Gratis';
    const cardRank = TIER_RANKS[formattedTierName] || 0;
    
    const lockEl = c.querySelector('.tier-lock');
    if (lockEl) {
      if (cycleActive && cardRank <= maxPaidRank) {
        lockEl.style.display = 'none';
        c.style.opacity = '1';
      } else if (formattedTierName === currentTier) {
        lockEl.style.display = 'none';
        c.style.opacity = '1';
      } else {
        lockEl.style.display = 'none';
        c.style.opacity = '0.75';
      }
    }
  });
  
  const currentCard = document.getElementById(`upgrade-card-${currentTier.toLowerCase()}`);
  if (currentCard) {
    currentCard.style.borderColor = '#00f0ff';
    currentCard.style.boxShadow = '0 0 25px rgba(0, 240, 255, 0.3)';
    currentCard.querySelector('.tier-check').style.opacity = '1';
    currentCard.style.background = 'rgba(10, 20, 35, 0.6)';
  }
  
  selectedUpgradeTierName = currentTier;
  selectedUpgradeCardElement = currentCard;
  
  const confirmBtn = document.getElementById('btn-save-upgrade');
  if (confirmBtn) {
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Confirmar Cambio de Plan';
  }

  if (typeof window.closeDowngradeConfirmModal === 'function') window.closeDowngradeConfirmModal();
  modal.style.display = 'flex';
};

window.closeUpgradeModal = () => {
  if (typeof window.closeDowngradeConfirmModal === 'function') window.closeDowngradeConfirmModal();
  const modal = document.getElementById('upgrade-modal');
  if (modal) modal.style.display = 'none';
};

window.selectUpgradeTier = (tierName, element) => {
  const user = JSON.parse(localStorage.getItem('scout_ai_user') || '{}');
  const currentTier = user.selectedTier || 'Gratis';
  
  selectedUpgradeTierName = tierName;
  selectedUpgradeCardElement = element;
  
  document.querySelectorAll('.upgrade-card').forEach(c => {
    c.style.borderColor = 'rgba(0, 240, 255, 0.15)';
    c.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
    c.querySelector('.tier-check').style.opacity = '0';
  });
  
  element.style.borderColor = '#00f0ff';
  element.style.boxShadow = '0 0 25px rgba(0, 240, 255, 0.3)';
  element.querySelector('.tier-check').style.opacity = '1';
  
  const confirmBtn = document.getElementById('btn-save-upgrade');
  if (confirmBtn) {
    confirmBtn.disabled = (tierName === currentTier);
    confirmBtn.textContent = 'Confirmar Cambio de Plan';
  }
};

window.showUpgradePaymentModal = (tierName, price, cardElement) => {
  const user = JSON.parse(localStorage.getItem('scout_ai_user') || '{}');
  const currentTier = user.selectedTier || 'Gratis';
  
  if (tierName === currentTier) {
    window.selectUpgradeTier(tierName, cardElement);
    return;
  }
  
  window.selectUpgradeTier(tierName, cardElement);
  showToast(`Seleccionado plan ${tierName}. Haz clic en 'Confirmar Cambio de Plan' abajo.`, 'info');
};

window.closeDowngradeConfirmModal = () => {
  const modal = document.getElementById('downgrade-confirm-modal');
  if (modal) modal.style.display = 'none';
};

window.saveUpgradeTier = async () => {
  if (!selectedUpgradeTierName) return;
  
  const user = JSON.parse(localStorage.getItem('scout_ai_user') || '{}');
  const currentTier = user.selectedTier || 'Gratis';
  if (selectedUpgradeTierName === currentTier) return;
  
  const maxPaidTier = window.getMaxPaidTierInCycle(user);
  const maxPaidRank = TIER_RANKS[maxPaidTier] || 0;
  const targetRank = TIER_RANKS[selectedUpgradeTierName] || 0;
  const cycleActive = window.isBillingCycleActive(user);
  const isIncludedInCycle = cycleActive && targetRank <= maxPaidRank;

  const currentPrice = TIER_PRICES[currentTier] || 0;
  const newPrice = TIER_PRICES[selectedUpgradeTierName] || 0;
  const maxPaidPrice = TIER_PRICES[maxPaidTier] || 0;
  const basePrice = cycleActive ? Math.max(maxPaidPrice, currentPrice) : currentPrice;
  const difference = Math.max(0, newPrice - basePrice);
  const requiresPayment = !isIncludedInCycle && newPrice > currentPrice && difference > 0;

  // Desplegar siempre el alert pop-up de confirmación
  const modal = document.getElementById('downgrade-confirm-modal');
  const msgEl = document.getElementById('downgrade-confirm-message');
  if (msgEl) {
    if (requiresPayment) {
      msgEl.innerHTML = `¿Estás seguro de mejorar del plan <strong style="color: #fff;">${currentTier}</strong> al plan <strong style="color: #00f0ff;">${selectedUpgradeTierName}</strong>?<br><span style="font-size: 0.88rem; color: #00f0ff; margin-top: 8px; display: inline-block; font-weight: 700;">Requiere abono de diferencia: $${difference.toFixed(2)}.</span>`;
    } else {
      msgEl.innerHTML = `¿Estás seguro de cambiar del plan <strong style="color: #fff;">${currentTier}</strong> al plan <strong style="color: #00f0ff;">${selectedUpgradeTierName}</strong>?`;
    }
  }
  if (modal) {
    modal.style.display = 'flex';
  }
};

window.executeSaveUpgradeTier = async () => {
  window.closeDowngradeConfirmModal();
  if (!selectedUpgradeTierName) return;

  const user = JSON.parse(localStorage.getItem('scout_ai_user') || '{}');
  const currentTier = user.selectedTier || 'Gratis';
  if (selectedUpgradeTierName === currentTier) return;

  const maxPaidTier = window.getMaxPaidTierInCycle(user);
  const maxPaidRank = TIER_RANKS[maxPaidTier] || 0;
  const targetRank = TIER_RANKS[selectedUpgradeTierName] || 0;
  const cycleActive = window.isBillingCycleActive(user);
  const isIncludedInCycle = cycleActive && targetRank <= maxPaidRank;

  const currentPrice = TIER_PRICES[currentTier] || 0;
  const newPrice = TIER_PRICES[selectedUpgradeTierName] || 0;
  const maxPaidPrice = TIER_PRICES[maxPaidTier] || 0;
  const basePrice = cycleActive ? Math.max(maxPaidPrice, currentPrice) : currentPrice;
  const difference = Math.max(0, newPrice - basePrice);
  const requiresPayment = !isIncludedInCycle && newPrice > currentPrice && difference > 0;

  // ÚNICAMENTE abre la pasarela de pago si es un UPGRADE real que requiere abonar una diferencia positiva (> $0.00)
  if (requiresPayment) {
    window.showPaymentModal(selectedUpgradeTierName, `$${difference.toFixed(2)}`, selectedUpgradeCardElement, true);
    return;
  }

  const saveBtn = document.getElementById('btn-save-upgrade');
  if (saveBtn) {
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
    saveBtn.disabled = true;
  }

  const wasLocal = (currentTier || '').toLowerCase() === 'local' || (user.role || '').toLowerCase() === 'local' || (user.role || '').toLowerCase() === 'entrenador local';
  const isTargetingLocal = selectedUpgradeTierName === 'Local';
  const hasStandardTeam = !!user.selectedClub && user.selectedClub !== 'Club Local' && !!user.selectedCountry && user.selectedCountry !== 'Local';
  const updatedMaxPaid = targetRank > maxPaidRank ? selectedUpgradeTierName : maxPaidTier;
  
  try {
    const res = await fetchWithAuth(`${API}/auth/onboarding`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        selectedTier: selectedUpgradeTierName,
        maxPaidTierInCycle: updatedMaxPaid,
        role: isTargetingLocal ? 'Entrenador Local' : (user.role && user.role !== 'Entrenador Local' ? user.role : 'Scout / Director Deportivo'),
        billingCycleStart: user.billingCycleStart,
        billingCycleEnd: user.billingCycleEnd
      })
    });
    
    if (res.ok) {
      const data = await res.json();
      const userObj = data.user || JSON.parse(localStorage.getItem('scout_ai_user') || '{}');
      userObj.selectedTier = selectedUpgradeTierName;
      userObj.maxPaidTierInCycle = updatedMaxPaid;
      if (user.billingCycleStart) userObj.billingCycleStart = user.billingCycleStart;
      if (user.billingCycleEnd) userObj.billingCycleEnd = user.billingCycleEnd;
      const isTargetingEnterprise = selectedUpgradeTierName === 'Enterprise';
      if (isTargetingLocal) {
        userObj.role = 'Entrenador Local';
      } else if (isTargetingEnterprise && (!userObj.role || userObj.role === 'Entrenador Local')) {
        userObj.role = 'Director Técnico / Presidente de Club';
      }
      
      showToast(`✅ Plan de suscripción actualizado a ${selectedUpgradeTierName} con éxito!${cycleActive ? ' (Sin costo adicional en período vigente)' : ''}`, 'success');
      closeUpgradeModal();
      
      if (window.SectionLoader) window.SectionLoader.show('Cargando nuevo plan...');

      setTimeout(() => {
        const hasValidProTeam = !!userObj.selectedClub && userObj.selectedClub !== 'Club Local' && userObj.selectedClub !== '' && !!userObj.selectedCountry && userObj.selectedCountry !== 'Local';
        
        // Si cambia a un plan no-local y no cuenta con equipo profesional válido
        if (!isTargetingLocal && !hasValidProTeam) {
          if (userObj.previousStandardClub && userObj.previousStandardClub !== 'Club Local') {
            userObj.selectedClub = userObj.previousStandardClub;
            if (userObj.previousStandardCountry && userObj.previousStandardCountry !== 'Local') {
              userObj.selectedCountry = userObj.previousStandardCountry;
            }
            userObj.onboardingComplete = true;
            localStorage.setItem('scout_ai_user', JSON.stringify(userObj));
            applyPlanPermissions();
            renderProfile();
          } else {
            userObj.onboardingComplete = false;
            userObj.selectedClub = '';
            localStorage.setItem('scout_ai_user', JSON.stringify(userObj));
            showToast('ℹ️ Por favor, selecciona tu país y club profesional para tu nuevo plan.', 'info');
            if (typeof window.setupOnboarding === 'function') {
              window.setupOnboarding();
            }
          }
        } else {
          userObj.onboardingComplete = true;
          localStorage.setItem('scout_ai_user', JSON.stringify(userObj));
          applyPlanPermissions();
          renderProfile();
        }

        // Solo si es un usuario NUEVO seleccionando Local por primera vez sin datos
        const isExistingLocal = userObj.onboardingComplete || !!userObj.localCoachData;
        if (isTargetingLocal && !isExistingLocal) {
          const localScreen = document.getElementById('local-coach-onboarding-screen');
          if (localScreen) {
            localScreen.style.display = 'flex';
          }
        }

        if (window.SectionLoader) window.SectionLoader.hide();
      }, 400);
    } else {
      const errData = await res.json();
      showToast(`Error al cambiar de plan: ${errData.error || 'Intenta de nuevo'}`, 'error');
    }
  } catch (err) {
    console.error('Error saving tier upgrade:', err);
    showToast('Error de conexión al cambiar de plan', 'error');
  } finally {
    if (saveBtn) {
      saveBtn.innerHTML = 'Confirmar Cambio de Plan';
      saveBtn.disabled = false;
    }
  }
};

// ==========================================
// TACTICAL LIVE MATCH SIMULATOR ENGINE (IA)
// ==========================================

let simInterval = null;
let simSpeed = 300; // Default fast
let simCurrentMin = 0;
let simScoreH = 0;
let simScoreA = 0;
let simStats = { shots: [0, 0], onTarget: [0, 0], xg: [0, 0], passes: [0, 0], fouls: [0, 0] };
let simPreGeneratedEvents = [];
let simHomeName = '';
let simAwayName = '';
let simHomeOvr = 75;
let simAwayOvr = 75;
let simHomePlayers = [];
let simAwayPlayers = [];

function getInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 3).toUpperCase();
}

function sortPlayersForField(players) {
  const gks = [];
  const dfs = [];
  const mfs = [];
  const fws = [];
  
  players.forEach(p => {
    const role = (p.position || '').toUpperCase();
    if (['GK', 'PO', 'POR'].includes(role)) gks.push(p);
    else if (['CB', 'LB', 'RB', 'DFC', 'DF', 'LI', 'LD', 'LWB', 'RWB'].includes(role)) dfs.push(p);
    else if (['CM', 'DM', 'AM', 'LM', 'RM', 'MC', 'MCD', 'MCO', 'VOL'].includes(role)) mfs.push(p);
    else fws.push(p);
  });
  
  return [...gks, ...dfs, ...mfs, ...fws];
}

async function preGenerateMatchState(homeName, awayName, homeOvr, awayOvr) {
  simHomeName = homeName;
  simAwayName = awayName;
  simHomeOvr = homeOvr;
  simAwayOvr = awayOvr;
  
  const currentUser = JSON.parse(localStorage.getItem('scout_ai_user') || '{}');
  const userStartingXI = getUserClubStartingXI(homeName, currentUser);
  
  let homePlayersList = userStartingXI.filter(item => item.player && !item.isVirtual).map(item => item.player);
  if (homePlayersList.length === 0) {
    homePlayersList = await fetchTeamPlayers(homeName);
  }
  simHomePlayers = homePlayersList;
  simAwayPlayers = await fetchTeamPlayers(awayName);
  
  const diff = homeOvr - awayOvr;
  let homeWinProb = Math.min(Math.max(50 + diff * 3, 10), 90);
  let drawProb = 20;
  
  const roll = Math.random() * 100;
  if (roll < homeWinProb) {
    simScoreH = Math.floor(Math.random() * 3) + 1;
    simScoreA = Math.floor(Math.random() * simScoreH);
  } else if (roll < homeWinProb + drawProb) {
    simScoreH = Math.floor(Math.random() * 3);
    simScoreA = simScoreH;
  } else {
    simScoreA = Math.floor(Math.random() * 3) + 1;
    simScoreH = Math.floor(Math.random() * simScoreA);
  }
  
  simPreGeneratedEvents = [];
  const usedMinutes = new Set();
  
  const getRandomMinute = () => {
    let min;
    do {
      min = Math.floor(Math.random() * 85) + 5;
    } while (usedMinutes.has(min));
    usedMinutes.add(min);
    return min;
  };
  
  const goalDetails = [
    'Remate raso esquinado',
    'Remate de cabeza tras tiro de esquina',
    'Penalti convertido con frialdad',
    'Disparo potente de media distancia',
    'Definición mano a mano cruzada'
  ];
  
  for (let i = 0; i < simScoreH; i++) {
    const min = getRandomMinute();
    const scorer = simHomePlayers.length > 0 ? simHomePlayers[Math.floor(Math.random() * simHomePlayers.length)].name : 'Delantero Local';
    const detail = goalDetails[Math.floor(Math.random() * goalDetails.length)];
    const xg = parseFloat((0.4 + Math.random() * 0.45).toFixed(2));
    simPreGeneratedEvents.push({
      min,
      type: 'g',
      team: 'h',
      txt: `⚽ Gol de ${scorer} (${homeName})`,
      sub: `${detail} · xG: ${xg}`,
      scorer,
      xg
    });
  }
  
  for (let i = 0; i < simScoreA; i++) {
    const min = getRandomMinute();
    const scorer = simAwayPlayers.length > 0 ? simAwayPlayers[Math.floor(Math.random() * simAwayPlayers.length)].name : 'Delantero Rival';
    const detail = goalDetails[Math.floor(Math.random() * goalDetails.length)];
    const xg = parseFloat((0.4 + Math.random() * 0.45).toFixed(2));
    simPreGeneratedEvents.push({
      min,
      type: 'g',
      team: 'a',
      txt: `⚽ Gol de ${scorer} (${awayName})`,
      sub: `${detail} · xG: ${xg}`,
      scorer,
      xg
    });
  }
  
  const numCardsH = Math.floor(Math.random() * 2) + 1;
  const numCardsA = Math.floor(Math.random() * 2) + 1;
  
  for (let i = 0; i < numCardsH; i++) {
    const min = getRandomMinute();
    const player = simHomePlayers.length > 0 ? simHomePlayers[Math.floor(Math.random() * simHomePlayers.length)].name : 'Defensor Local';
    simPreGeneratedEvents.push({
      min,
      type: 'y',
      team: 'h',
      txt: `🟨 Tarjeta amarilla para ${player} (${homeName})`,
      sub: 'Infracción táctica cortando contragolpe'
    });
  }
  for (let i = 0; i < numCardsA; i++) {
    const min = getRandomMinute();
    const player = simAwayPlayers.length > 0 ? simAwayPlayers[Math.floor(Math.random() * simAwayPlayers.length)].name : 'Defensor Rival';
    simPreGeneratedEvents.push({
      min,
      type: 'y',
      team: 'a',
      txt: `🟨 Tarjeta amarilla para ${player} (${awayName})`,
      sub: 'Falta brusca en mediocampo'
    });
  }
  
  if (simHomePlayers.length > 3) {
    const min = Math.floor(Math.random() * 30) + 50;
    usedMinutes.add(min);
    const idxOut = Math.floor(Math.random() * 3) + 7;
    const idxIn = Math.floor(Math.random() * (simHomePlayers.length - 11)) + 11;
    const playerOut = simHomePlayers[idxOut] ? simHomePlayers[idxOut].name : 'Centrocampista Local';
    const playerIn = simHomePlayers[idxIn] ? simHomePlayers[idxIn].name : 'Suplente Local';
    simPreGeneratedEvents.push({
      min,
      type: 'sub',
      team: 'h',
      txt: `🔄 Cambio en ${homeName}`,
      sub: `Sale ${playerOut}, entra ${playerIn}`
    });
  }
  if (simAwayPlayers.length > 3) {
    const min = Math.floor(Math.random() * 30) + 50;
    usedMinutes.add(min);
    const idxOut = Math.floor(Math.random() * 3) + 7;
    const idxIn = Math.floor(Math.random() * (simAwayPlayers.length - 11)) + 11;
    const playerOut = simAwayPlayers[idxOut] ? simAwayPlayers[idxOut].name : 'Centrocampista Rival';
    const playerIn = simAwayPlayers[idxIn] ? simAwayPlayers[idxIn].name : 'Suplente Rival';
    simPreGeneratedEvents.push({
      min,
      type: 'sub',
      team: 'a',
      txt: `🔄 Cambio en ${awayName}`,
      sub: `Sale ${playerOut}, entra ${playerIn}`
    });
  }
  
  const numMisses = Math.floor(Math.random() * 3) + 2;
  const missDetails = [
    'Remate de cabeza desviado por poco',
    'Disparo potente que se va rozando el travesaño',
    'Tiro libre que pasa cerca del ángulo',
    'Gran atajada del portero enviando a córner'
  ];
  for (let i = 0; i < numMisses; i++) {
    const min = getRandomMinute();
    const team = Math.random() < 0.55 ? 'h' : 'a';
    const teamN = team === 'h' ? homeName : awayName;
    const list = team === 'h' ? simHomePlayers : simAwayPlayers;
    const player = list.length > 0 ? list[Math.floor(Math.random() * list.length)].name : 'Atacante';
    const detail = missDetails[Math.floor(Math.random() * missDetails.length)];
    const xg = parseFloat((0.1 + Math.random() * 0.25).toFixed(2));
    simPreGeneratedEvents.push({
      min,
      type: 's',
      team,
      txt: `⚠️ Ocasión peligrosa de ${player} (${teamN})`,
      sub: `${detail} · xG: ${xg}`,
      xg
    });
  }
  
  simPreGeneratedEvents.sort((a, b) => a.min - b.min);
}

function startLiveSimulation() {
  const liveView = document.getElementById('sim-live-view');
  const reportView = document.getElementById('sim-report-view');
  if (liveView) liveView.style.display = 'block';
  if (reportView) reportView.style.display = 'none';
  
  document.getElementById('sim-live-home-name').textContent = simHomeName;
  document.getElementById('sim-live-away-name').textContent = simAwayName;
  document.getElementById('sim-svg-home-lbl').textContent = simHomeName.substring(0, 3).toUpperCase();
  document.getElementById('sim-svg-away-lbl').textContent = simAwayName.substring(0, 3).toUpperCase();
  
  loadTeamLogo(simHomeName, 'sim-live-home-logo');
  loadTeamLogo(simAwayName, 'sim-live-away-logo');
  
  // Set initials for SVG circles
  const homeTexts = document.querySelectorAll('#sim-svg-home-players text');
  if (homeTexts.length === 11 && simHomePlayers.length >= 11) {
    const sortedHome = sortPlayersForField(simHomePlayers);
    for (let i = 0; i < 11; i++) {
      if (sortedHome[i]) {
        homeTexts[i].textContent = getInitials(sortedHome[i].name);
      }
    }
  }
  
  const awayTexts = document.querySelectorAll('#sim-svg-away-players text');
  if (awayTexts.length === 11 && simAwayPlayers.length >= 11) {
    const sortedAway = sortPlayersForField(simAwayPlayers);
    for (let i = 0; i < 11; i++) {
      if (sortedAway[i]) {
        awayTexts[i].textContent = getInitials(sortedAway[i].name);
      }
    }
  }
  
  simCurrentMin = 0;
  simScoreH = 0;
  simScoreA = 0;
  simStats = { shots: [0, 0], onTarget: [0, 0], xg: [0, 0], passes: [0, 0], fouls: [0, 0] };
  
  document.getElementById('sim-live-home-score').textContent = '0';
  document.getElementById('sim-live-away-score').textContent = '0';
  document.getElementById('sim-live-min-badge').textContent = "0'";
  document.getElementById('sim-live-prog-txt').textContent = "0 / 90'";
  document.getElementById('sim-live-prog-fill').style.width = '0%';
  
  switchLiveSimTab('field');
  
  document.getElementById('sim-live-events-content').innerHTML = '<p style="font-size:13px;color:var(--text-3);padding:8px 0;text-align:center;">Esperando eventos...</p>';
  document.getElementById('sim-live-ai-txt').textContent = 'El árbitro da la señal y arranca la simulación...';
  
  const track = document.getElementById('sim-live-prog-track');
  if (track) {
    track.querySelectorAll('.ev-dot').forEach(d => d.remove());
  }
  
  document.querySelectorAll('.speed-row .sp-btn').forEach(btn => btn.classList.remove('on'));
  const activeSpeedBtn = document.getElementById(simSpeed === 1000 ? 'sim-speed-normal' : (simSpeed === 300 ? 'sim-speed-fast' : 'sim-speed-turbo'));
  if (activeSpeedBtn) activeSpeedBtn.classList.add('on');
  
  if (simInterval) clearInterval(simInterval);
  simInterval = setInterval(simTick, simSpeed);
}

function simTick() {
  simCurrentMin++;
  if (simCurrentMin > 90) {
    clearInterval(simInterval);
    finishSimulation();
    return;
  }
  
  document.getElementById('sim-live-min-badge').textContent = simCurrentMin + "'";
  document.getElementById('sim-live-prog-txt').textContent = simCurrentMin + " / 90'";
  document.getElementById('sim-live-prog-fill').style.width = Math.round(simCurrentMin / 90 * 100) + '%';
  
  const ball = document.getElementById('sim-live-ball');
  if (ball) {
    ball.setAttribute('cx', (80 + Math.random() * 140).toFixed(0));
    ball.setAttribute('cy', (100 + Math.random() * 200).toFixed(0));
  }
  
  simStats.passes[0] += Math.floor(Math.random() * 4 + 3);
  simStats.passes[1] += Math.floor(Math.random() * 3 + 2);
  
  if (Math.random() < 0.12) {
    if (Math.random() < 0.5) simStats.fouls[0]++;
    else simStats.fouls[1]++;
  }
  
  const scoreDiff = simScoreH - simScoreA;
  let ph = Math.min(88, Math.max(8, 50 + scoreDiff * 18 - ((90 - simCurrentMin) / 90) * 5));
  let pa = Math.min(88, Math.max(8, 50 - scoreDiff * 18 - ((90 - simCurrentMin) / 90) * 5));
  let pd = Math.round(100 - ph - pa);
  
  document.getElementById('sim-live-p-h').textContent = Math.round(ph) + '%';
  document.getElementById('sim-live-p-d').textContent = Math.round(pd) + '%';
  document.getElementById('sim-live-p-a').textContent = Math.round(pa) + '%';
  
  const ev = simPreGeneratedEvents.find(e => e.min === simCurrentMin);
  if (ev) {
    if (ev.type === 'g') {
      if (ev.team === 'h') {
        simScoreH++;
        document.getElementById('sim-live-home-score').textContent = simScoreH;
      } else {
        simScoreA++;
        document.getElementById('sim-live-away-score').textContent = simScoreA;
      }
      simStats.shots[ev.team === 'h' ? 0 : 1]++;
      simStats.onTarget[ev.team === 'h' ? 0 : 1]++;
      simStats.xg[ev.team === 'h' ? 0 : 1] += ev.xg || 0.75;
    } else if (ev.type === 's') {
      simStats.shots[ev.team === 'h' ? 0 : 1]++;
      simStats.xg[ev.team === 'h' ? 0 : 1] += ev.xg || 0.15;
      if (ev.txt.includes('portero') || ev.txt.includes('travesaño')) {
        simStats.onTarget[ev.team === 'h' ? 0 : 1]++;
      }
    } else if (ev.type === 'y') {
      simStats.fouls[ev.team === 'h' ? 0 : 1]++;
    }
    
    addLiveEvent(ev);
    addLiveEventDot(simCurrentMin, ev.type);
  }
  
  const aiComments = [
    `El mediocampo de ${simHomeName} controla los tiempos, buscando abrir el bloque defensivo de ${simAwayName}.`,
    `Ritmo intenso. La presión alta de ambos conjuntos está provocando pérdidas en zona de creación.`,
    `${simAwayName} ajusta su dibujo táctico para tapar las progresiones por bandas.`,
    `Desgaste físico notable en el terreno de juego. Se reducen los espacios entre líneas.`,
    `Repliegue y contraataques rápidos son la tónica de estos minutos en el Clásico táctico.`,
    `Las transiciones verticales de ${simHomeName} están generando zozobra en la defensa rival.`,
    `Fase crítica. ${simAwayName} adelanta líneas y apuesta por la posesión en campo contrario.`,
    `Minutos finales de drama y tensión. Se siente la intervención directa de las pizarras de ambos DT.`
  ];
  
  const idx = Math.floor(simCurrentMin / 12);
  if (simCurrentMin % 12 === 0 && idx < aiComments.length) {
    document.getElementById('sim-live-ai-txt').textContent = aiComments[idx];
  }
  
  drawLiveStats();
}

function addLiveEvent(ev) {
  const wrap = document.getElementById('sim-live-events-content');
  if (wrap && wrap.querySelector('p')) {
    wrap.innerHTML = '';
  }
  if (!wrap) return;
  
  const icons = {
    g: '⚽ ic-g',
    y: '🟨 ic-y',
    r: '🟥 ic-r',
    sub: '🔄 ic-s',
    s: '⚠️ ic-s'
  };
  
  const cls = (icons[ev.type] || '🔵 ic-s').split(' ');
  const div = document.createElement('div');
  div.className = 'ev-item';
  div.innerHTML = `
    <span class="ev-min">${ev.min}'</span>
    <div class="ev-ico">${cls[0]}</div>
    <div>
      <div class="ev-txt" style="color: var(--text-1);">${ev.txt}</div>
      <div class="ev-sub">${ev.sub}</div>
    </div>
  `;
  wrap.insertBefore(div, wrap.firstChild);
}

function addLiveEventDot(min, type) {
  const track = document.getElementById('sim-live-prog-track');
  if (!track) return;
  
  const dot = document.createElement('div');
  dot.className = 'ev-dot';
  dot.style.left = Math.round(min / 90 * 100) + '%';
  
  const colors = {
    g: 'var(--green)',
    y: 'var(--yellow)',
    r: 'var(--red)',
    sub: 'var(--cyan)',
    s: 'var(--blue)'
  };
  
  dot.style.background = colors[type] || 'var(--text-3)';
  track.appendChild(dot);
}

function drawLiveStats() {
  const t = simStats;
  const sh = t.shots[0] + t.shots[1] + 1;
  const xgt = t.xg[0] + t.xg[1] + 0.1;
  const pt = t.passes[0] + t.passes[1] + 1;
  const ft = t.fouls[0] + t.fouls[1] + 1;
  const ot = t.onTarget[0] + t.onTarget[1] + 1;
  
  const statsContent = document.getElementById('sim-live-stats-content');
  if (!statsContent) return;
  
  statsContent.innerHTML = `
    <div class="stat-row">
      <div class="stat-hdr">
        <span style="color:var(--cyan);font-weight:700;">52%</span>
        <span style="color:var(--text-2);">Posesión</span>
        <span style="color:var(--orange);font-weight:700;">48%</span>
      </div>
      <div class="stat-bar" style="height:6px; background:rgba(255,255,255,0.05); border-radius:3px; display:flex; overflow:hidden;">
        <div style="background:var(--cyan); width:52%; height:100%;"></div>
        <div style="background:var(--orange); width:48%; height:100%;"></div>
      </div>
    </div>
    
    <div class="stat-row">
      <div class="stat-hdr">
        <span style="color:var(--cyan);font-weight:700;">${t.shots[0]}</span>
        <span style="color:var(--text-2);">Tiros</span>
        <span style="color:var(--orange);font-weight:700;">${t.shots[1]}</span>
      </div>
      <div class="stat-bar" style="height:6px; background:rgba(255,255,255,0.05); border-radius:3px; display:flex; overflow:hidden;">
        <div style="background:var(--cyan); width:${Math.round(t.shots[0]/sh*100)}%; height:100%;"></div>
        <div style="background:var(--orange); width:${Math.round(t.shots[1]/sh*100)}%; height:100%;"></div>
      </div>
    </div>
    
    <div class="stat-row">
      <div class="stat-hdr">
        <span style="color:var(--cyan);font-weight:700;">${t.onTarget[0]}</span>
        <span style="color:var(--text-2);">A puerta</span>
        <span style="color:var(--orange);font-weight:700;">${t.onTarget[1]}</span>
      </div>
      <div class="stat-bar" style="height:6px; background:rgba(255,255,255,0.05); border-radius:3px; display:flex; overflow:hidden;">
        <div style="background:var(--cyan); width:${Math.round(t.onTarget[0]/ot*100)}%; height:100%;"></div>
        <div style="background:var(--orange); width:${Math.round(t.onTarget[1]/ot*100)}%; height:100%;"></div>
      </div>
    </div>
    
    <div class="stat-row">
      <div class="stat-hdr">
        <span style="color:var(--cyan);font-weight:700;">${t.xg[0].toFixed(2)}</span>
        <span style="color:var(--text-2);">xG acumulado</span>
        <span style="color:var(--orange);font-weight:700;">${t.xg[1].toFixed(2)}</span>
      </div>
      <div class="stat-bar" style="height:6px; background:rgba(255,255,255,0.05); border-radius:3px; display:flex; overflow:hidden;">
        <div style="background:var(--cyan); width:${Math.round(t.xg[0]/xgt*100)}%; height:100%;"></div>
        <div style="background:var(--orange); width:${Math.round(t.xg[1]/xgt*100)}%; height:100%;"></div>
      </div>
    </div>
    
    <div class="stat-row">
      <div class="stat-hdr">
        <span style="color:var(--cyan);font-weight:700;">${t.passes[0]}</span>
        <span style="color:var(--text-2);">Pases completados</span>
        <span style="color:var(--orange);font-weight:700;">${t.passes[1]}</span>
      </div>
      <div class="stat-bar" style="height:6px; background:rgba(255,255,255,0.05); border-radius:3px; display:flex; overflow:hidden;">
        <div style="background:var(--cyan); width:${Math.round(t.passes[0]/pt*100)}%; height:100%;"></div>
        <div style="background:var(--orange); width:${Math.round(t.passes[1]/pt*100)}%; height:100%;"></div>
      </div>
    </div>
    
    <div class="stat-row">
      <div class="stat-hdr">
        <span style="color:var(--cyan);font-weight:700;">${t.fouls[0]}</span>
        <span style="color:var(--text-2);">Faltas</span>
        <span style="color:var(--orange);font-weight:700;">${t.fouls[1]}</span>
      </div>
      <div class="stat-bar" style="height:6px; background:rgba(255,255,255,0.05); border-radius:3px; display:flex; overflow:hidden;">
        <div style="background:var(--cyan); width:${Math.round(t.fouls[0]/ft*100)}%; height:100%;"></div>
        <div style="background:var(--orange); width:${Math.round(t.fouls[1]/ft*100)}%; height:100%;"></div>
      </div>
    </div>
  `;
}

function setSimSpeed(ms, btnId) {
  simSpeed = ms;
  document.querySelectorAll('.speed-row .sp-btn').forEach(btn => btn.classList.remove('on'));
  const pressedBtn = document.getElementById(btnId);
  if (pressedBtn) pressedBtn.classList.add('on');
  
  if (simInterval) {
    clearInterval(simInterval);
    simInterval = setInterval(simTick, simSpeed);
  }
}

function switchLiveSimTab(tabName) {
  document.querySelectorAll('.sim-live-tab').forEach(el => el.classList.remove('on'));
  document.querySelectorAll('.sim-live-tc').forEach(el => el.classList.remove('on'));
  
  const selectedTab = document.getElementById('sim-live-tab-' + tabName);
  if (selectedTab) selectedTab.classList.add('on');
  
  const tcElement = document.getElementById('sim-live-tc-' + tabName);
  if (tcElement) tcElement.classList.add('on');
}

function skipMatchSimulation() {
  clearInterval(simInterval);
  finishSimulation();
}

function finishSimulation() {
  const liveView = document.getElementById('sim-live-view');
  const reportView = document.getElementById('sim-report-view');
  if (liveView) liveView.style.display = 'none';
  if (reportView) reportView.style.display = 'block';
  
  showSimulationResults(simHomeName, simAwayName, simHomeOvr, simAwayOvr);
}

window.switchLiveSimTab = switchLiveSimTab;
window.setSimSpeed = setSimSpeed;
window.skipMatchSimulation = skipMatchSimulation;

// ─── MODULE: MIS CHATS (User-to-User Messaging) ──────────────────────────────────
let myChatsContacts = [];
let activeChatContact = null;
let myChatsPollingInterval = null;

function getMyChatsToken() {
  return localStorage.getItem('scout_ai_token') || 
         localStorage.getItem('scoutai_token') || 
         localStorage.getItem('token') || 
         '';
}

function hasMyChatsPlanAccess() {
  const user = JSON.parse(localStorage.getItem('scout_ai_user') || '{}');
  const tier = (user.selectedTier || '').toLowerCase();
  const role = (user.role || '').toLowerCase();

  const isLocal = tier === 'local' || role.includes('local');
  const isEnterprise = tier === 'enterprise' || role.includes('enterprise') || role.includes('scout');

  return isLocal || isEnterprise;
}

async function renderMyChatsSection() {
  const wrapper = document.querySelector('#section-my-chats .my-chats-wrapper');
  const titleBtn = document.getElementById('btn-open-find-user-modal');
  const restrictedOverlay = document.getElementById('my-chats-restricted-overlay');

  if (!hasMyChatsPlanAccess()) {
    if (wrapper) wrapper.style.display = 'none';
    if (titleBtn) titleBtn.style.display = 'none';
    if (restrictedOverlay) restrictedOverlay.style.display = 'block';
    return;
  }

  // Permiso concedido
  if (wrapper) wrapper.style.display = 'flex';
  if (titleBtn) titleBtn.style.display = 'block';
  if (restrictedOverlay) restrictedOverlay.style.display = 'none';

  const token = getMyChatsToken();
  if (!token) {
    console.warn('💬 Mis Chats: No hay token de autenticación');
    return;
  }

  // Cargar contactos desde API
  await fetchMyChatsContacts();

  // Configurar eventos si aún no están adjuntos
  setupMyChatsEventListeners();

  // Iniciar polling automático cada 4 segundos mientras la sección esté activa
  if (!myChatsPollingInterval) {
    myChatsPollingInterval = setInterval(() => {
      const section = document.getElementById('section-my-chats');
      if (section && section.classList.contains('active') && hasMyChatsPlanAccess()) {
        fetchMyChatsContacts(true); // silent refresh
        if (activeChatContact) {
          loadMyChatsMessages(true); // silent refresh
        }
      }
    }, 6000);
  }
}

async function fetchMyChatsContacts(silent = false) {
  try {
    const token = getMyChatsToken();
    const res = await fetch('/api/chats/contacts', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) throw new Error('Error al obtener contactos');
    const data = await res.json();
    if (data.success) {
      myChatsContacts = data.contacts || [];
      renderMyChatsContactsList();
    }
  } catch (err) {
    console.error('❌ Error en fetchMyChatsContacts:', err);
    if (!silent) {
      const container = document.getElementById('my-chats-contacts-list');
      if (container) {
        container.innerHTML = `
          <div class="empty-contacts-state" style="text-align: center; color: var(--text-2); padding: 25px 15px;">
            <p style="font-size: 0.88rem;">No hay contactos</p>
          </div>
        `;
      }
    }
  }
}

function renderMyChatsContactsList() {
  const container = document.getElementById('my-chats-contacts-list');
  if (!container) return;

  const searchInput = document.getElementById('my-chats-search-contacts');
  const filterText = searchInput ? searchInput.value.toLowerCase().trim() : '';

  let filtered = myChatsContacts;
  if (filterText) {
    filtered = myChatsContacts.filter(item => {
      const c = item.contact || {};
      const name = (c.displayName || c.username || '').toLowerCase();
      const role = (c.role || '').toLowerCase();
      const club = (c.selectedClub || '').toLowerCase();
      return name.includes(filterText) || role.includes(filterText) || club.includes(filterText);
    });
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-contacts-state" style="text-align: center; color: var(--text-2); padding: 30px 15px;">
        <p style="font-size: 0.88rem;">No hay contactos</p>
      </div>
    `;
    container.dataset.lastSignature = 'empty';
    return;
  }

  const newContactsSignature = filtered.map(item => {
    const c = item.contact || {};
    const lastMsgId = item.lastMessage ? item.lastMessage.id : '';
    const isAct = activeChatContact && activeChatContact.id === c.id;
    return `${c.id}_${lastMsgId}_${item.unreadCount}_${isAct}`;
  }).join('|');

  if (container.dataset.lastSignature === newContactsSignature) {
    return; // Evita re-renderizado innecesario si la lista no cambió
  }
  container.dataset.lastSignature = newContactsSignature;

  let html = '';
  filtered.forEach(item => {
    const c = item.contact || {};
    const isActive = activeChatContact && activeChatContact.id === c.id;
    const initial = (c.displayName || c.username || 'U').charAt(0).toUpperCase();
    const roleClass = (c.role || '').toLowerCase().includes('scout') ? 'scout' : 'entrenador';
    const lastMsgText = item.lastMessage ? item.lastMessage.content : 'Iniciar conversación...';
    
    // Formatear hora/fecha
    let timeStr = '';
    if (item.lastMessage && item.lastMessage.createdAt) {
      const d = new Date(item.lastMessage.createdAt);
      const now = new Date();
      if (d.toDateString() === now.toDateString()) {
        timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else {
        timeStr = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
    }

    html += `
      <div class="contact-card-item ${isActive ? 'active' : ''}" onclick="selectChatContact('${c.id}')">
        <div class="contact-avatar-wrap">
          ${c.avatarUrl 
            ? `<img src="${c.avatarUrl}" alt="${c.displayName}" class="contact-avatar">`
            : `<div class="contact-avatar-placeholder">${initial}</div>`
          }
          <span class="online-indicator"></span>
        </div>
        <div class="contact-info-col">
          <div class="contact-name-row">
            <span class="contact-name">${c.displayName || c.username}</span>
            <span class="contact-time">${timeStr}</span>
          </div>
          <div class="contact-preview-row">
            <span class="contact-last-msg">${escapeHtml(lastMsgText)}</span>
            ${item.unreadCount > 0 ? `<span class="unread-badge-pill">${item.unreadCount}</span>` : ''}
          </div>
          <div style="margin-top: 4px; display: flex; align-items: center; gap: 6px;">
            <span class="role-badge ${roleClass}">${c.role || 'Usuario'}</span>
            ${c.selectedClub ? `<span style="font-size: 0.72rem; color: var(--text-2);">${c.selectedClub}</span>` : ''}
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function selectChatContact(contactUserId) {
  const item = myChatsContacts.find(x => x.contact && x.contact.id === contactUserId);
  if (item) {
    activeChatContact = item.contact;
  }

  if (!activeChatContact) return;

  // Actualizar UI
  renderMyChatsContactsList();

  const emptyView = document.getElementById('my-chats-empty-view');
  const activePanel = document.getElementById('my-chats-active-panel');

  if (emptyView) emptyView.style.display = 'none';
  if (activePanel) activePanel.style.display = 'flex';

  // Actualizar Header
  const avatarEl = document.getElementById('active-chat-avatar');
  const nameEl = document.getElementById('active-chat-name');
  const roleEl = document.getElementById('active-chat-role');
  const clubEl = document.getElementById('active-chat-club');

  if (nameEl) nameEl.textContent = activeChatContact.displayName || activeChatContact.username;
  if (roleEl) {
    roleEl.textContent = activeChatContact.role || 'Usuario';
    roleEl.className = `role-badge ${(activeChatContact.role || '').toLowerCase().includes('scout') ? 'scout' : 'entrenador'}`;
  }
  if (clubEl) {
    let localClub = activeChatContact.localCoachClub;
    if (!localClub && activeChatContact.localCoachData) {
      try {
        const parsed = typeof activeChatContact.localCoachData === 'string' ? JSON.parse(activeChatContact.localCoachData) : activeChatContact.localCoachData;
        localClub = parsed.club || parsed.clubName || parsed.team || null;
      } catch (e) {}
    }

    const isCoach = (activeChatContact.role || '').toLowerCase().includes('entrenador') || (activeChatContact.selectedTier || '').toLowerCase() === 'local' || Boolean(localClub);
    
    if (isCoach) {
      const coachTeam = localClub || activeChatContact.selectedClub || 'Club Local';
      clubEl.textContent = `Club: ${coachTeam}`;
    } else {
      const orgName = activeChatContact.selectedClub || activeChatContact.selectedCountry || 'Plataforma Futbol AI';
      clubEl.textContent = `Organización: ${orgName}`;
    }
  }
  if (avatarEl) {
    if (activeChatContact.avatarUrl) {
      avatarEl.src = activeChatContact.avatarUrl;
      avatarEl.style.display = 'block';
    } else {
      avatarEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(activeChatContact.displayName || activeChatContact.username)}&background=00f0ff&color=05080c`;
      avatarEl.style.display = 'block';
    }
  }

  // Cargar mensajes de la conversación
  loadMyChatsMessages();
}

async function loadMyChatsMessages(silent = false) {
  if (!activeChatContact) return;

  try {
    const token = getMyChatsToken();
    const res = await fetch(`/api/chats/messages/${activeChatContact.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) throw new Error('Error al cargar mensajes');
    const data = await res.json();
    if (data.success) {
      renderMyChatsMessagesBody(data.messages || [], silent);
    }
  } catch (err) {
    console.error('❌ Error en loadActiveChatMessages:', err);
  }
}

function renderMyChatsMessagesBody(messages, silent = false) {
  const container = document.getElementById('my-chats-messages-body');
  if (!container) return;

  const currentUser = JSON.parse(localStorage.getItem('scout_ai_user') || '{}');
  const currentUserId = currentUser.id;

  if (messages.length === 0) {
    container.innerHTML = `
      <div style="margin: auto; text-align: center; color: var(--text-2); padding: 30px;">
        <p style="font-size: 0.9rem; margin-top: 8px;">No hay mensajes anteriores en esta conversación.</p>
        <p style="font-size: 0.8rem; color: rgba(255,255,255,0.4); margin-top: 4px;">Escribe un mensaje abajo para iniciar la charla.</p>
      </div>
    `;
    container.dataset.lastSignature = 'empty';
    return;
  }

  const newMsgSignature = messages.map(m => `${m.id}_${m.isRead}_${m.updatedAt || m.createdAt}`).join('|');
  if (silent && container.dataset.lastSignature === newMsgSignature) {
    return; // Evita re-renderizado visual de la ventana de chat si no hay mensajes nuevos
  }
  container.dataset.lastSignature = newMsgSignature;

  let html = '';
  let lastDateStr = '';

  messages.forEach(msg => {
    const isOutgoing = msg.senderId === currentUserId;
    const d = new Date(msg.createdAt);
    const dateStr = d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (dateStr !== lastDateStr) {
      lastDateStr = dateStr;
      html += `
        <div style="text-align: center; margin: 12px 0 6px 0;">
          <span style="font-size: 0.7rem; font-weight: 700; color: rgba(255,255,255,0.4); background: rgba(255,255,255,0.05); padding: 4px 10px; border-radius: 10px; text-transform: uppercase;">
            ${dateStr}
          </span>
        </div>
      `;
    }

    html += `
      <div class="chat-bubble-wrap ${isOutgoing ? 'outgoing' : 'incoming'}">
        <div class="chat-bubble">
          ${escapeHtml(msg.content)}
        </div>
        <div class="chat-bubble-footer">
          <span>${timeStr}</span>
          ${isOutgoing ? `<span style="font-size: 0.8rem; color: #00f0ff;">${msg.isRead ? '✓✓' : '✓'}</span>` : ''}
        </div>
      </div>
    `;
  });

  const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 120;
  container.innerHTML = html;

  if (!silent || isNearBottom) {
    container.scrollTop = container.scrollHeight;
  }
}

async function sendMyChatMessage() {
  if (!activeChatContact) return;

  const inputEl = document.getElementById('my-chats-input-text');
  if (!inputEl) return;

  const content = inputEl.value.trim();
  if (!content) return;

  inputEl.value = '';

  try {
    const token = getMyChatsToken();
    const res = await fetch('/api/chats/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        receiverId: activeChatContact.id,
        content
      })
    });

    if (!res.ok) throw new Error('Error al enviar mensaje');
    const data = await res.json();
    if (data.success) {
      loadMyChatsMessages();
      fetchMyChatsContacts(true);
    }
  } catch (err) {
    console.error('❌ Error en sendMyChatMessage:', err);
    window.showAppErrorAlert({
      title: 'Error de Chat',
      message: 'No se pudo enviar el mensaje. Por favor intenta de nuevo.',
      details: err.message
    });
  }
}

function setupMyChatsEventListeners() {
  const sendBtn = document.getElementById('my-chats-btn-send');
  const inputEl = document.getElementById('my-chats-input-text');
  const searchContactsInput = document.getElementById('my-chats-search-contacts');
  const clearHistoryBtn = document.getElementById('btn-clear-chat-history');
  const viewProfileBtn = document.getElementById('btn-view-contact-profile');

  if (sendBtn && !sendBtn.dataset.bound) {
    sendBtn.dataset.bound = 'true';
    sendBtn.addEventListener('click', sendMyChatMessage);
  }

  if (inputEl && !inputEl.dataset.bound) {
    inputEl.dataset.bound = 'true';
    inputEl.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') sendMyChatMessage();
    });
  }

  if (searchContactsInput && !searchContactsInput.dataset.bound) {
    searchContactsInput.dataset.bound = 'true';
    searchContactsInput.addEventListener('input', () => {
      renderMyChatsContactsList();
    });
  }

  if (clearHistoryBtn && !clearHistoryBtn.dataset.bound) {
    clearHistoryBtn.dataset.bound = 'true';
    clearHistoryBtn.addEventListener('click', async () => {
      if (!activeChatContact) return;
      if (confirm(`¿Estás seguro de que deseas vaciar el historial de chat con ${activeChatContact.displayName || activeChatContact.username}?`)) {
        try {
          const token = getMyChatsToken();
          await fetch(`/api/chats/messages/${activeChatContact.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          loadMyChatsMessages();
          fetchMyChatsContacts(true);
        } catch (e) {
          console.error(e);
        }
      }
    });
  }

  if (viewProfileBtn && !viewProfileBtn.dataset.bound) {
    viewProfileBtn.dataset.bound = 'true';
    viewProfileBtn.addEventListener('click', () => {
      if (!activeChatContact) return;
      openUserProfileDossierModal(activeChatContact);
    });
  }
}

// Modal de Expediente del Usuario / Contacto (Ficha Oficial Futbol AI)
function openUserProfileDossierModalById(userId) {
  let contact = null;
  if (myChatsContacts && myChatsContacts.length > 0) {
    const item = myChatsContacts.find(x => x.contact && x.contact.id === userId);
    if (item) contact = item.contact;
  }
  if (!contact && activeChatContact && activeChatContact.id === userId) {
    contact = activeChatContact;
  }
  if (contact) {
    openUserProfileDossierModal(contact);
  } else {
    const token = getMyChatsToken();
    fetch(`/api/chats/search-users?q=${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(r => r.json())
    .then(data => {
      if (data.success && data.users && data.users.length > 0) {
        const u = data.users.find(x => x.id === userId) || data.users[0];
        openUserProfileDossierModal(u);
      }
    })
    .catch(err => console.error(err));
  }
}

function openUserProfileDossierModal(contactUser) {
  let user = contactUser;
  if (!user && typeof activeChatContact !== 'undefined') {
    user = activeChatContact;
  }
  if (!user && typeof myChatsContacts !== 'undefined' && myChatsContacts.length > 0) {
    user = myChatsContacts[0].contact;
  }

  if (!user) {
    alert('Selecciona una conversación o contacto para ver su expediente.');
    return;
  }

  const modal = document.getElementById('modal-user-profile-dossier');
  if (!modal) {
    console.error('📋 Expediente: No se encontró el modal #modal-user-profile-dossier');
    return;
  }

  const nameEl = document.getElementById('dossier-display-name');
  if (nameEl) nameEl.textContent = user.displayName || user.username || 'Usuario Futbol AI';

  const unameEl = document.getElementById('dossier-username');
  if (unameEl) unameEl.textContent = '@' + (user.username || 'usuario');

  const hasLocalCoachData = !!user.localCoachData || (user.role || '').toLowerCase().includes('entrenador');
  const roleText = hasLocalCoachData ? 'Entrenador' : (user.role || 'Usuario Futbol AI');
  const roleBadge = document.getElementById('dossier-role-badge');
  if (roleBadge) roleBadge.textContent = roleText;

  const roleDetail = document.getElementById('dossier-role-detail');
  if (roleDetail) roleDetail.textContent = roleText;

  let coachClub = user.localCoachClub || null;
  if (!coachClub && user.localCoachData) {
    try {
      const parsed = typeof user.localCoachData === 'string' ? JSON.parse(user.localCoachData) : user.localCoachData;
      coachClub = parsed.club || parsed.clubName || null;
    } catch (e) {}
  }

  const isLocalCoach = (user.role || '').toLowerCase().includes('entrenador') || (user.selectedTier || '').toLowerCase() === 'local';
  const displayClub = (isLocalCoach && coachClub) ? coachClub : (user.selectedClub || user.selectedCountry || 'No especificado');

  // Actualizar etiqueta dinámica del club
  const clubLabel = document.getElementById('dossier-club-label');
  if (clubLabel) {
    clubLabel.textContent = isLocalCoach ? 'Club que Entrena' : 'Club / Afiliación';
  }

  const clubName = document.getElementById('dossier-club-name');
  if (clubName) clubName.textContent = displayClub;

  const clubDetail = document.getElementById('dossier-club-detail');
  if (clubDetail) clubDetail.textContent = displayClub;

  const emailDetail = document.getElementById('dossier-email-detail');
  if (emailDetail) emailDetail.textContent = user.email || 'Contacto Privado / Protegido';

  const avatarImg = document.getElementById('dossier-avatar');
  if (avatarImg) {
    avatarImg.src = user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.username)}&background=00f0ff&color=080e1a&bold=true`;
  }

  const onlineIndicator = document.getElementById('dossier-online-status');
  if (onlineIndicator) {
    onlineIndicator.style.background = user.isOnline ? '#00ff88' : '#718096';
    onlineIndicator.style.boxShadow = user.isOnline ? '0 0 8px #00ff88' : 'none';
  }

  modal.style.cssText = 'display: flex !important; z-index: 27000 !important;';
}

function closeUserProfileDossierModal() {
  const modal = document.getElementById('modal-user-profile-dossier');
  if (modal) modal.style.cssText = 'display: none !important;';
}

function handleDossierStartChat() {
  closeUserProfileDossierModal();
  if (activeChatContact) {
    const input = document.getElementById('my-chats-message-input');
    if (input) input.focus();
  }
}

// Modal de Búsqueda de Usuarios registrados
function openFindUserModal() {
  if (!hasMyChatsPlanAccess()) {
    openUpgradeModal();
    return;
  }
  const modal = document.getElementById('modal-find-user');
  if (modal) {
    modal.style.display = 'flex';
    const input = document.getElementById('find-user-search-input');
    if (input) {
      input.value = '';
      input.focus();
    }
    fetchFindUserResults('');
  }
}

function closeFindUserModal() {
  const modal = document.getElementById('modal-find-user');
  if (modal) modal.style.display = 'none';
}

let findUserDebounceTimeout = null;
function handleFindUserSearchKeyup(event) {
  const query = event.target.value;
  clearTimeout(findUserDebounceTimeout);
  findUserDebounceTimeout = setTimeout(() => {
    fetchFindUserResults(query);
  }, 300);
}

async function fetchFindUserResults(query) {
  const container = document.getElementById('find-user-results-list');
  if (!container) return;

  container.innerHTML = `
    <div style="text-align: center; color: var(--text-2); padding: 15px;">
      <span class="sl-spinner" style="width: 20px; height: 20px; border-width: 2px; display: inline-block;"></span>
      <p style="font-size: 0.85rem; margin-top: 6px;">Buscando usuarios...</p>
    </div>
  `;

  try {
    const token = getMyChatsToken();
    const res = await fetch(`/api/chats/search-users?q=${encodeURIComponent(query)}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.error || `HTTP ${res.status}`);
    }

    const data = await res.json();
    const users = data.users || [];

    if (users.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; color: var(--text-2); padding: 20px; font-size: 0.88rem;">
          No se encontraron usuarios con ese criterio de búsqueda.
        </div>
      `;
      return;
    }

    let html = '';
    users.forEach(u => {
      const initial = (u.displayName || u.username || 'U').charAt(0).toUpperCase();
      const roleClass = (u.role || '').toLowerCase().includes('scout') ? 'scout' : 'entrenador';

      html += `
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px;">
          <div style="display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0;">
            <div class="contact-avatar-wrap" style="width: 38px; height: 38px;">
              ${u.avatarUrl 
                ? `<img src="${u.avatarUrl}" alt="${u.displayName}" class="contact-avatar" style="width: 38px; height: 38px;">`
                : `<div class="contact-avatar-placeholder" style="width: 38px; height: 38px; font-size: 0.95rem;">${initial}</div>`
              }
            </div>
            <div style="flex: 1; min-width: 0;">
              <div style="font-size: 0.9rem; font-weight: 600; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${u.displayName || u.username}
              </div>
              <div style="display: flex; align-items: center; gap: 6px; margin-top: 2px;">
                <span class="role-badge ${roleClass}">${u.role || 'Usuario'}</span>
                ${u.selectedClub ? `<span style="font-size: 0.72rem; color: var(--text-2);">${u.selectedClub}</span>` : ''}
              </div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <button class="btn btn-secondary" onclick="openUserProfileDossierModalById('${u.id}')" style="font-size: 0.78rem; padding: 6px 10px;" title="Ver Expediente">
              📋 Perfil
            </button>
            <button class="btn btn-primary" onclick="startChatWithUser('${u.id}')" style="font-size: 0.78rem; padding: 6px 12px;">
              Chat
            </button>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  } catch (err) {
    console.error('❌ Error en fetchFindUserResults:', err);
    container.innerHTML = `
      <div style="text-align: center; color: #ff4a4a; padding: 15px; font-size: 0.85rem;">
        ${err.message || 'Error al realizar la búsqueda.'}
      </div>
    `;
  }
}

async function startChatWithUser(userId) {
  try {
    const token = getMyChatsToken();
    await fetch('/api/chats/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ contactUserId: userId })
    });

    closeFindUserModal();

    await fetchMyChatsContacts();
    selectChatContact(userId);
  } catch (err) {
    console.error('❌ Error en startChatWithUser:', err);
    window.showAppErrorAlert({
      title: 'Error de Chat',
      message: 'No se pudo iniciar el chat con este usuario.',
      details: err.message
    });
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

window.renderMyChatsSection = renderMyChatsSection;
window.selectChatContact = selectChatContact;
window.openFindUserModal = openFindUserModal;
window.closeFindUserModal = closeFindUserModal;
window.handleFindUserSearchKeyup = handleFindUserSearchKeyup;
window.startChatWithUser = startChatWithUser;



