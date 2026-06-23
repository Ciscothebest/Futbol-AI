import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';
import '../services/api_service.dart';

class AuthProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  User? _user;
  String? _token;
  bool _isLoading = false;
  String _lang = 'es';
  bool _isBackendOnline = false;

  User? get user => _user;
  String? get token => _token;
  bool get isLoading => _isLoading;
  String get lang => _lang;
  bool get isBackendOnline => _isBackendOnline;
  bool get isAuthenticated => _token != null && _user != null;

  AuthProvider() {
    _loadLocalSession();
    checkBackendStatus();
  }

  // Check if the Node Express backend is running
  Future<void> checkBackendStatus() async {
    try {
      final health = await _apiService.checkHealth();
      _isBackendOnline = health['status'] == 'ok';
    } catch (_) {
      _isBackendOnline = false;
    }
    notifyListeners();
  }

  // Load persistent session from local device storage
  Future<void> _loadLocalSession() async {
    _isLoading = true;
    notifyListeners();
    try {
      final prefs = await SharedPreferences.getInstance();
      _token = prefs.getString('scout_ai_token');
      _lang = prefs.getString('futbolai-lang') ?? 'es';

      final userStr = prefs.getString('scout_ai_user');
      if (userStr != null) {
        _user = User.fromJson(jsonDecode(userStr));
      }
    } catch (_) {
      _token = null;
      _user = null;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Toggle app languages (ES vs EN)
  Future<void> toggleLanguage(String newLang) async {
    if (newLang == _lang) return;
    _lang = newLang;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('futbolai-lang', newLang);
    notifyListeners();
  }

  // ─── LOGIN ──────────────────────────────────────────────────────
  Future<void> login(String username, String password) async {
    _isLoading = true;
    notifyListeners();
    try {
      final res = await _apiService.login(username: username, password: password);
      _token = res['token'];
      _user = User.fromJson(res['user']);

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('scout_ai_token', _token!);
      await prefs.setString('scout_ai_user', jsonEncode(_user!.toJson()));
      
      await checkBackendStatus();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // ─── REGISTER ───────────────────────────────────────────────────
  Future<void> register({
    required String username,
    required String password,
    required String nombres,
    required String apellidos,
    required String telefono,
    required String email,
  }) async {
    _isLoading = true;
    notifyListeners();
    try {
      await _apiService.register(
        username: username,
        password: password,
        nombres: nombres,
        apellidos: apellidos,
        telefono: telefono,
        email: email,
      );
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // ─── ONBOARDING SUBMISSION ──────────────────────────────────────
  Future<void> completeOnboarding({
    required String selectedCountry,
    required String selectedClub,
    required String preferredFormation,
    required String preferredStyle,
    required String selectedTier,
  }) async {
    _isLoading = true;
    notifyListeners();
    try {
      final res = await _apiService.submitOnboarding(
        selectedCountry: selectedCountry,
        selectedClub: selectedClub,
        preferredFormation: preferredFormation,
        preferredStyle: preferredStyle,
        selectedTier: selectedTier,
      );
      
      _user = User.fromJson(res['user']);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('scout_ai_user', jsonEncode(_user!.toJson()));
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // ─── PROFILE UPDATE ─────────────────────────────────────────────
  Future<void> updateLocalUser(User updatedUser) async {
    _user = updatedUser;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('scout_ai_user', jsonEncode(_user!.toJson()));
    notifyListeners();
  }

  // ─── LOGOUT ─────────────────────────────────────────────────────
  Future<void> logout() async {
    _token = null;
    _user = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('scout_ai_token');
    await prefs.remove('scout_ai_user');
    notifyListeners();
  }

  // ─── DICTIONARY TRASLATOR ───────────────────────────────────────
  String translate(String key) {
    if (_lang == 'es') {
      return _esDict[key] ?? key;
    } else {
      return _enDict[key] ?? key;
    }
  }

  static const Map<String, String> _esDict = {
    'nav_home': 'Inicio', 'nav_my_club': 'Mi Club', 'nav_players': 'Jugadores', 'nav_chat': 'Chat IA',
    'nav_compare': 'Comparar', 'nav_predictions': 'Predicciones',
    'db_my_club': 'Mi Club', 'db_position': 'Posición', 'db_goals': 'Goles', 'db_xg': 'xG',
    'db_matches': 'Partidos', 'db_next_matches': 'Próximos partidos', 'db_title_formation': 'Alineación Titular',
    'db_btn_edit_formation': 'Editar alineación', 'db_alerts_title': 'Alertas IA',
    'db_performance_title': 'Rendimiento reciente', 'db_chat_title': 'Chat IA',
    'db_chat_placeholder': 'Pregunta algo sobre tu equipo...',
    'chat_agent_name': 'Agente FutbolAI',
    'hero_badge': '🤖 Impulsado por Gemini AI',
    'hero_title': 'Inteligencia Artificial del Fútbol Mundial',
    'hero_subtitle': 'Consulta estadísticas, compara jugadores y obtén análisis profundos con IA.',
    'btn_talk_agent': '💬 Hablar con el Agente',
    'btn_see_players': '👥 Ver Jugadores',
    'stat_players': 'Jugadores', 'stat_leagues': 'Ligas',
    'stat_questions': 'Preguntas', 'stat_available': 'Disponible',
    'featured_title': '⭐ Destacados', 'see_all': 'Ver todos →',
    'quick_chat_title': '💬 Pregunta lo que quieras',
    'section_players': '👥 Jugadores',
    'search_placeholder': 'Buscar jugador, equipo...',
    'all_leagues': 'Todas las ligas', 'all_positions': 'Todas las posiciones',
    'btn_clear': '✕ Limpiar',
    'section_compare': '⚖️ Comparar Jugadores',
    'player1_label': 'Jugador 1', 'player2_label': 'Jugador 2',
    'search_player': 'Buscar jugador...', 'select_player': 'Selecciona un jugador',
    'btn_compare_label': '⚖️ Comparar',
    'btn_analyze': '🤖 Analizar con IA', 'btn_analyzing': '⏳ Analizando...',
    'compare_result_title': '🤖 Análisis IA',
    'compare_chart_title': '📊 Gráfico de Rendimiento',
    'section_predictions': '🔮 Predicciones IA', 'btn_refresh': '🔄 Actualizar',
    'predictions_desc': 'Predicciones generadas por inteligencia artificial basadas en estadísticas reales y tendencias actuales de la temporada 2024-25.',
    'loading_predictions': 'Generando predicciones...',
    'sort_name_asc': 'Nombre (A-Z)', 'sort_name_desc': 'Nombre (Z-A)',
    'sort_value_desc': 'Valor (Mayor a Menor)', 'sort_value_asc': 'Valor (Menor a Mayor)',
    'sort_salary_desc': 'Salario (Mayor a Menor)', 'sort_salary_asc': 'Salario (Menor a Mayor)',
    'sort_contract_near': 'Contrato (Próximo a Expirar)', 'sort_contract_far': 'Contrato (Lejano a Expirar)',
    'chat_placeholder': 'Escribe tu pregunta...',
    'welcome_title': '¡Bienvenido a FutbolAI!',
    'welcome_text': 'Soy tu experto en fútbol mundial. Puedo responder cualquier pregunta sobre jugadores, estadísticas, carreras y más.',
    'status_online': 'Gemini IA Online', 'status_demo': 'Modo Demo', 'status_offline': 'Backend offline',
    'status_connecting': 'Conectando...',
    'goals': 'GOLES', 'assists': 'ASIST.', 'matches': 'PART.',
    'goals_full': 'Goles', 'assists_full': 'Asistencias', 'matches_full': 'Partidos',
    'modal_stats': '⚽ Stats 2024-25', 'modal_info': '📋 Info',
    'modal_strengths': '💪 Fortalezas', 'modal_trophies': '🏆 Palmarés',
    'modal_transfers': '💸 Traspasos', 'modal_tags': '🏷️ Tags',
    'ask_agent_btn': 'Preguntar al agente sobre',
    'market_value': 'Valor', 'age': 'Edad',
    'career_goals': 'Goles Carrera', 'new_chat_msg': 'Nueva conversación iniciada. ¡Pregúntame!',
    'count_tag': 'jugadores',
    'prompt1_label': '⚽ Máximo goleador Europa', 'prompt1': '¿Quién mete más goles actualmente en Europa?',
    'prompt2_label': '🇳🇴 Perfil Haaland', 'prompt2': 'Cuéntame todo sobre Erling Haaland',
    'prompt3_label': '🏆 Mejor liga', 'prompt3': '¿Cuál es la mejor liga del mundo y por qué?',
    'prompt4_label': '⚖️ Vini vs Mbappé', 'prompt4': 'Compara a Vinicius Jr y Kylian Mbappé',
  };

  static const Map<String, String> _enDict = {
    'nav_home': 'Home', 'nav_my_club': 'My Club', 'nav_players': 'Players', 'nav_chat': 'AI Chat',
    'nav_compare': 'Compare', 'nav_predictions': 'Predictions',
    'db_my_club': 'My Club', 'db_position': 'Position', 'db_goals': 'Goals', 'db_xg': 'xG',
    'db_matches': 'Matches', 'db_next_matches': 'Upcoming Matches', 'db_title_formation': 'Starting XI',
    'db_btn_edit_formation': 'Edit Formation', 'db_alerts_title': 'AI Alerts',
    'db_performance_title': 'Recent Performance', 'db_chat_title': 'AI Chat',
    'db_chat_placeholder': 'Ask something about your team...',
    'chat_agent_name': 'FutbolAI Agent',
    'hero_badge': '🤖 Powered by Gemini AI',
    'hero_title': 'Artificial Intelligence for World Football',
    'hero_subtitle': 'Query stats, compare players and get deep AI-powered insights.',
    'btn_talk_agent': '💬 Talk to the Agent',
    'btn_see_players': '👥 See Players',
    'stat_players': 'Players', 'stat_leagues': 'Leagues',
    'stat_questions': 'Questions', 'stat_available': 'Available',
    'featured_title': '⭐ Featured', 'see_all': 'See all →',
    'quick_chat_title': '💬 Ask anything',
    'section_players': '👥 Players',
    'search_placeholder': 'Search player, team...',
    'all_leagues': 'All leagues', 'all_positions': 'All positions',
    'btn_clear': '✕ Clear',
    'section_compare': '⚖️ Compare Players',
    'player1_label': 'Player 1', 'player2_label': 'Player 2',
    'search_player': 'Search player...', 'select_player': 'Select a player',
    'btn_compare_label': '⚖️ Compare',
    'btn_analyze': '🤖 Analyze with AI', 'btn_analyzing': '⏳ Analyzing...',
    'compare_result_title': '🤖 AI Analysis',
    'compare_chart_title': '📊 Performance Chart',
    'section_predictions': '🔮 AI Predictions', 'btn_refresh': '🔄 Refresh',
    'predictions_desc': 'AI-generated predictions based on real statistics and current trends for the 2024-25 season.',
    'loading_predictions': 'Generating predictions...',
    'sort_name_asc': 'Name (A-Z)', 'sort_name_desc': 'Name (Z-A)',
    'sort_value_desc': 'Value (High to Low)', 'sort_value_asc': 'Value (Low to High)',
    'sort_salary_desc': 'Salary (High to Low)', 'sort_salary_asc': 'Salary (Low to High)',
    'sort_contract_near': 'Contract (Near)', 'sort_contract_far': 'Contract (Far)',
    'chat_placeholder': 'Type your question...',
    'welcome_title': 'Welcome to FutbolAI!',
    'welcome_text': "I'm your global football expert. I can answer any question about players, stats, careers and more.",
    'status_online': 'Gemini AI Online', 'status_demo': 'Demo Mode', 'status_offline': 'Backend offline',
    'status_connecting': 'Connecting...',
    'goals': 'GOALS', 'assists': 'ASSISTS', 'matches': 'MATCHES',
    'goals_full': 'Goals', 'assists_full': 'Assists', 'matches_full': 'Club Matches',
    'modal_stats': '⚽ Stats 2024-25', 'modal_info': '📋 Info',
    'modal_strengths': '💪 Strengths', 'modal_trophies': '🏆 Trophies',
    'modal_transfers': '💸 Transfers', 'modal_tags': '🏷️ Tags',
    'ask_agent_btn': 'Ask the agent about',
    'market_value': 'Value', 'age': 'Age',
    'career_goals': 'Career Goals', 'new_chat_msg': 'New conversation started. Ask me!',
    'count_tag': 'players',
    'prompt1_label': '⚽ Top scorer Europe', 'prompt1': 'Who is scoring the most goals in Europe right now?',
    'prompt2_label': '🇳🇴 Haaland profile', 'prompt2': 'Tell me everything about Erling Haaland',
    'prompt3_label': '🏆 Best league', 'prompt3': 'What is the best league in the world and why?',
    'prompt4_label': '⚖️ Vini vs Mbappé', 'prompt4': 'Compare Vinicius Jr and Kylian Mbappé',
  };
}
