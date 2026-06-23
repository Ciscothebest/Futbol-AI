import 'dart:async';
import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';
import '../models/chat_message.dart';
import '../services/api_service.dart';

class ChatProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  final List<ChatMessage> _messages = [];
  String _sessionId = const Uuid().v4();
  bool _isLoading = false;
  bool _isRecording = false;
  int _recordingSeconds = 0;
  bool _isMuted = false;
  Timer? _recordingTimer;

  List<ChatMessage> get messages => _messages;
  String get sessionId => _sessionId;
  bool get isLoading => _isLoading;
  bool get isRecording => _isRecording;
  int get recordingSeconds => _recordingSeconds;
  bool get isMuted => _isMuted;

  ChatProvider() {
    // Generate a fresh session ID on startup
    _sessionId = const Uuid().v4();
  }

  void toggleMute() {
    _isMuted = !_isMuted;
    notifyListeners();
  }

  // ─── AUDIO RECORDING METRICS ────────────────────────────────────
  void startRecordingState() {
    _isRecording = true;
    _recordingSeconds = 0;
    notifyListeners();
    
    _recordingTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      _recordingSeconds++;
      notifyListeners();
    });
  }

  void stopRecordingState() {
    _recordingTimer?.cancel();
    _isRecording = false;
    notifyListeners();
  }

  // ─── STREAM-LIKE REALTIME CHAT SENDS ─────────────────────────────
  Future<void> sendMessageStream({
    required String text,
    required String lang,
    required String clubContext,
    required List<String> clubRoster,
  }) async {
    if (text.trim().isEmpty) return;

    final userMsg = ChatMessage.user(text);
    _messages.add(userMsg);
    
    // Add a streaming placeholder bubble for model's response
    final placeholderMsg = ChatMessage.model('', isStreaming: true);
    _messages.add(placeholderMsg);
    
    _isLoading = true;
    notifyListeners();

    // Track response text buffer
    String fullReply = '';
    final placeholderIndex = _messages.length - 1;

    await _apiService.sendChatStream(
      message: text,
      sessionId: _sessionId,
      lang: lang,
      clubContext: clubContext,
      clubRoster: clubRoster,
      onChunk: (chunk) {
        fullReply += chunk;
        // Update the streaming message with current buffer
        _messages[placeholderIndex] = ChatMessage(
          text: fullReply,
          isUser: false,
          isStreaming: true,
          timestamp: DateTime.now(),
        );
        notifyListeners();
      },
      onDone: () {
        // Finish streaming, lock message in place
        _messages[placeholderIndex] = ChatMessage(
          text: fullReply.isNotEmpty ? fullReply : '¡Listo! / Ready!',
          isUser: false,
          isStreaming: false,
          timestamp: DateTime.now(),
        );
        _isLoading = false;
        notifyListeners();
        _apiService.logQuery(text);
      },
      onError: (err) {
        // Render error bubble
        _messages[placeholderIndex] = ChatMessage(
          text: '❌ Error: $err',
          isUser: false,
          isStreaming: false,
          timestamp: DateTime.now(),
        );
        _isLoading = false;
        notifyListeners();
      },
    );
  }

  // ─── BASE64 VOICE MESSAGES SENDS ────────────────────────────────
  Future<void> sendAudioMessage({
    required String base64Data,
    required String lang,
  }) async {
    final userMsg = ChatMessage.userAudio(base64Data);
    _messages.add(userMsg);
    _isLoading = true;
    notifyListeners();

    try {
      final res = await _apiService.sendChatMessage(
        audioBase64: base64Data,
        mimeType: 'audio/wav',
        sessionId: _sessionId,
        lang: lang,
      );

      final reply = res['reply'] ?? '';
      _messages.add(ChatMessage.model(reply));
      _apiService.logQuery('🎤 [Mensaje de voz / Voice Message]');
    } catch (e) {
      _messages.add(ChatMessage.model('❌ Error de Audio: ${e.toString()}'));
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // ─── CLEAR CHAT & SESSIONS ──────────────────────────────────────
  Future<void> clearConversation() async {
    _messages.clear();
    _isLoading = true;
    notifyListeners();

    try {
      await _apiService.sendChatMessage(
        message: 'WIPE_HISTORY_CLEAN',
        sessionId: _sessionId,
      );
    } catch (_) {}

    _sessionId = const Uuid().v4();
    _isLoading = false;
    notifyListeners();
  }
}
