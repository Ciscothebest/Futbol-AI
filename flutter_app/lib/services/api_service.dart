import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  final http.Client _client = http.Client();

  // Smart base URL detection depending on OS/Platform
  String get baseUrl {
    if (kIsWeb) {
      return '/api';
    }
    // Android emulator loopback address is 10.0.2.2
    if (!kIsWeb && Platform.isAndroid) {
      return 'http://10.0.2.2:3001/api';
    }
    // iOS simulator / Desktop loopback is localhost
    return 'http://localhost:3001/api';
  }

  // Prepares authentication headers
  Future<Map<String, String>> _getHeaders({bool jsonContent = true}) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('scout_ai_token');
    
    final Map<String, String> headers = {};
    if (jsonContent) {
      headers['Content-Type'] = 'application/json';
    }
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  // Handles 401 Unauthorized globally
  void _checkAuthFailure(int statusCode) {
    if (statusCode == 401) {
      SharedPreferences.getInstance().then((prefs) {
        prefs.remove('scout_ai_token');
        prefs.remove('scout_ai_user');
      });
      // In a real production app, we would emit a state to force navigation to login.
      // The AuthProvider will automatically intercept this in its local calls.
    }
  }

  // ─── POST /api/auth/register ────────────────────────────────────
  Future<Map<String, dynamic>> register({
    required String username,
    required String password,
    required String nombres,
    required String apellidos,
    required String telefono,
    required String email,
  }) async {
    final url = Uri.parse('$baseUrl/auth/register');
    final response = await _client.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'username': username,
        'password': password,
        'nombres': nombres,
        'apellidos': apellidos,
        'telefono': telefono,
        'email': email,
      }),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 201) {
      return {'success': true, 'message': data['message']};
    } else {
      throw Exception(data['error'] ?? 'Error al crear cuenta');
    }
  }

  // ─── POST /api/auth/login ───────────────────────────────────────
  Future<Map<String, dynamic>> login({
    required String username,
    required String password,
  }) async {
    final url = Uri.parse('$baseUrl/auth/login');
    final response = await _client.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'username': username,
        'password': password,
      }),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 200) {
      return {'success': true, 'token': data['token'], 'user': data['user']};
    } else {
      throw Exception(data['error'] ?? 'Credenciales incorrectas');
    }
  }

  // ─── PATCH /api/auth/onboarding ──────────────────────────────────
  Future<Map<String, dynamic>> submitOnboarding({
    required String selectedCountry,
    required String selectedClub,
    required String preferredFormation,
    required String preferredStyle,
    required String selectedTier,
  }) async {
    final url = Uri.parse('$baseUrl/auth/onboarding');
    final headers = await _getHeaders();
    final response = await _client.patch(
      url,
      headers: headers,
      body: jsonEncode({
        'selectedCountry': selectedCountry,
        'selectedClub': selectedClub,
        'preferredFormation': preferredFormation,
        'preferredStyle': preferredStyle,
        'selectedTier': selectedTier,
      }),
    );

    _checkAuthFailure(response.statusCode);
    final data = jsonDecode(response.body);
    if (response.statusCode == 200) {
      return {'success': true, 'user': data['user']};
    } else {
      throw Exception(data['error'] ?? 'Error al actualizar onboarding');
    }
  }

  // ─── GET /api/players ───────────────────────────────────────────
  Future<Map<String, dynamic>> getPlayers({
    String? search,
    String? league,
    String? position,
    String? team,
    int? limit,
  }) async {
    final queryParams = <String, String>{};
    if (search != null && search.isNotEmpty) queryParams['search'] = search;
    if (league != null && league.isNotEmpty) queryParams['league'] = league;
    if (position != null && position.isNotEmpty) queryParams['position'] = position;
    if (team != null && team.isNotEmpty) queryParams['team'] = team;
    if (limit != null) queryParams['limit'] = limit.toString();

    final uri = Uri.parse('$baseUrl/players').replace(queryParameters: queryParams);
    final headers = await _getHeaders();
    final response = await _client.get(uri, headers: headers);

    _checkAuthFailure(response.statusCode);
    final data = jsonDecode(response.body);
    if (response.statusCode == 200) {
      return {'players': data['players'], 'total': data['total'] ?? 0};
    } else {
      throw Exception(data['error'] ?? 'Error al cargar jugadores');
    }
  }

  // ─── GET /api/players/:id ────────────────────────────────────────
  Future<Map<String, dynamic>> getPlayerById(String id) async {
    final url = Uri.parse('$baseUrl/players/$id');
    final headers = await _getHeaders();
    final response = await _client.get(url, headers: headers);

    _checkAuthFailure(response.statusCode);
    final data = jsonDecode(response.body);
    if (response.statusCode == 200) {
      return data;
    } else {
      throw Exception(data['error'] ?? 'Jugador no encontrado');
    }
  }

  // ─── POST /api/chat ─────────────────────────────────────────────
  Future<Map<String, dynamic>> sendChatMessage({
    String? message,
    String? audioBase64,
    String? mimeType,
    String? sessionId,
    String? lang,
  }) async {
    final url = Uri.parse('$baseUrl/chat');
    final headers = await _getHeaders();
    
    final body = <String, dynamic>{};
    if (message != null) body['message'] = message;
    if (audioBase64 != null) body['audioBase64'] = audioBase64;
    if (mimeType != null) body['mimeType'] = mimeType;
    if (sessionId != null) body['sessionId'] = sessionId;
    if (lang != null) body['lang'] = lang;

    final response = await _client.post(
      url,
      headers: headers,
      body: jsonEncode(body),
    );

    _checkAuthFailure(response.statusCode);
    final data = jsonDecode(response.body);
    if (response.statusCode == 200) {
      return {'reply': data['reply'], 'sessionId': data['sessionId']};
    } else if (response.statusCode == 429) {
      throw Exception(data['reply'] ?? 'Gemini API limit exceeded');
    } else {
      throw Exception(data['error'] ?? 'Error en el chat');
    }
  }

  // ─── POST /api/chat/stream (SERVER-SENT EVENTS IMPLEMENTATION) ───
  Future<void> sendChatStream({
    required String message,
    String? sessionId,
    required String lang,
    required String clubContext,
    required List<String> clubRoster,
    required void Function(String chunk) onChunk,
    required void Function() onDone,
    required void Function(String error) onError,
  }) async {
    final url = Uri.parse('$baseUrl/chat/stream');
    final authHeaders = await _getHeaders();

    final body = jsonEncode({
      'message': message,
      'sessionId': sessionId,
      'lang': lang,
      'clubContext': clubContext,
      'clubRoster': clubRoster,
    });

    try {
      final request = http.Request('POST', url);
      request.headers.addAll(authHeaders);
      request.body = body;

      final streamedResponse = await _client.send(request);

      if (streamedResponse.statusCode != 200) {
        _checkAuthFailure(streamedResponse.statusCode);
        onError('Error de conexión: ${streamedResponse.statusCode}');
        return;
      }

      // Convert streamed response bytes to lines and parse SSE
      streamedResponse.stream
          .transform(utf8.decoder)
          .transform(const LineSplitter())
          .listen(
        (line) {
          if (line.startsWith('data: ')) {
            final dataStr = line.substring(6).trim();
            if (dataStr.isEmpty) return;
            try {
              final json = jsonDecode(dataStr);
              if (json['chunk'] != null) {
                onChunk(json['chunk']);
              } else if (json['done'] == true) {
                onDone();
              } else if (json['error'] != null) {
                onError(json['error']);
              }
            } catch (_) {
              // Ignore single bad chunks
            }
          }
        },
        onError: (err) {
          onError(err.toString());
        },
        cancelOnError: true,
      );
    } catch (e) {
      onError(e.toString());
    }
  }

  // ─── POST /api/alert/expand ──────────────────────────────────────
  Future<String> expandAlert({
    required String alertType,
    required Map<String, dynamic> contextData,
    required String lang,
  }) async {
    final url = Uri.parse('$baseUrl/alert/expand');
    final headers = await _getHeaders();
    final response = await _client.post(
      url,
      headers: headers,
      body: jsonEncode({
        'alertType': alertType,
        'contextData': contextData,
        'lang': lang,
      }),
    );

    _checkAuthFailure(response.statusCode);
    final data = jsonDecode(response.body);
    if (response.statusCode == 200) {
      return data['report'] ?? '';
    } else {
      throw Exception(data['error'] ?? 'Error al expandir alerta');
    }
  }

  // ─── POST /api/compare ──────────────────────────────────────────
  Future<Map<String, dynamic>> comparePlayers({
    required String player1Id,
    required String player2Id,
    required String lang,
  }) async {
    final url = Uri.parse('$baseUrl/compare');
    final headers = await _getHeaders();
    final response = await _client.post(
      url,
      headers: headers,
      body: jsonEncode({
        'player1Id': player1Id,
        'player2Id': player2Id,
        'lang': lang,
      }),
    );

    _checkAuthFailure(response.statusCode);
    final data = jsonDecode(response.body);
    if (response.statusCode == 200) {
      return {
        'analysis': data['analysis'],
        'player1': data['player1'],
        'player2': data['player2']
      };
    } else {
      throw Exception(data['error'] ?? 'Error al comparar jugadores');
    }
  }

  // ─── GET /api/predictions ───────────────────────────────────────
  Future<String> getPredictions({required String lang}) async {
    final url = Uri.parse('$baseUrl/predictions?lang=$lang');
    final headers = await _getHeaders();
    final response = await _client.get(url, headers: headers);

    _checkAuthFailure(response.statusCode);
    final data = jsonDecode(response.body);
    if (response.statusCode == 200) {
      return data['predictions'] ?? '';
    } else {
      throw Exception(data['error'] ?? 'Error al cargar predicciones');
    }
  }

  // ─── GET /api/onboarding/leagues ────────────────────────────────
  Future<List<dynamic>> getOnboardingLeagues() async {
    final url = Uri.parse('$baseUrl/onboarding/leagues');
    final headers = await _getHeaders();
    final response = await _client.get(url, headers: headers);

    _checkAuthFailure(response.statusCode);
    final data = jsonDecode(response.body);
    if (response.statusCode == 200) {
      return data['leagues'] ?? [];
    } else {
      throw Exception(data['error'] ?? 'Error al obtener ligas');
    }
  }

  // ─── GET /api/onboarding/teams ─────────────────────────────────
  Future<List<dynamic>> getOnboardingTeams({String? country, String? league}) async {
    final queryParams = <String, String>{};
    if (country != null) queryParams['country'] = country;
    if (league != null) queryParams['league'] = league;

    final uri = Uri.parse('$baseUrl/onboarding/teams').replace(queryParameters: queryParams);
    final headers = await _getHeaders();
    final response = await _client.get(uri, headers: headers);

    _checkAuthFailure(response.statusCode);
    final data = jsonDecode(response.body);
    if (response.statusCode == 200) {
      return data['teams'] ?? [];
    } else {
      throw Exception(data['error'] ?? 'Error al obtener equipos');
    }
  }

  // ─── GET /api/team-logo ─────────────────────────────────────────
  Future<String?> getTeamLogo(String name) async {
    final url = Uri.parse('$baseUrl/team-logo?name=${Uri.encodeComponent(name)}');
    final headers = await _getHeaders();
    final response = await _client.get(url, headers: headers);

    _checkAuthFailure(response.statusCode);
    final data = jsonDecode(response.body);
    if (response.statusCode == 200) {
      return data['logoUrl'];
    }
    return null;
  }

  // ─── GET /api/profile/stats ─────────────────────────────────────
  Future<Map<String, dynamic>> getProfileStats() async {
    final url = Uri.parse('$baseUrl/profile/stats');
    final headers = await _getHeaders();
    final response = await _client.get(url, headers: headers);

    _checkAuthFailure(response.statusCode);
    final data = jsonDecode(response.body);
    if (response.statusCode == 200) {
      return data;
    } else {
      return {'queries': 0, 'compared': 0, 'favorites': 0};
    }
  }

  // ─── GET /api/health ────────────────────────────────────────────
  Future<Map<String, dynamic>> checkHealth() async {
    try {
      final url = Uri.parse('$baseUrl/health');
      final response = await _client.get(url).timeout(const Duration(seconds: 4));
      return jsonDecode(response.body);
    } catch (_) {
      return {'status': 'offline'};
    }
  }

  // ─── LOGGING ENDPOINTS ──────────────────────────────────────────
  Future<void> logQuery(String? message) async {
    try {
      final url = Uri.parse('$baseUrl/logs/query');
      final headers = await _getHeaders();
      await _client.post(url, headers: headers, body: jsonEncode({'message': message}));
    } catch (_) {}
  }

  Future<void> logComparison(String p1, String p2) async {
    try {
      final url = Uri.parse('$baseUrl/logs/comparison');
      final headers = await _getHeaders();
      await _client.post(url, headers: headers, body: jsonEncode({'player1Id': p1, 'player2Id': p2}));
    } catch (_) {}
  }

  Future<void> logFavorite(String pId, String action) async {
    try {
      final url = Uri.parse('$baseUrl/logs/favorite');
      final headers = await _getHeaders();
      await _client.post(url, headers: headers, body: jsonEncode({'playerId': pId, 'action': action}));
    } catch (_) {}
  }
}
