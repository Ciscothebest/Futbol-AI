class ChatMessage {
  final String text;
  final bool isUser;
  final bool isAudio;
  final String? audioBase64;
  final bool isStreaming;
  final DateTime timestamp;

  ChatMessage({
    required this.text,
    required this.isUser,
    this.isAudio = false,
    this.audioBase64,
    this.isStreaming = false,
    required this.timestamp,
  });

  factory ChatMessage.user(String text) {
    return ChatMessage(
      text: text,
      isUser: true,
      timestamp: DateTime.now(),
    );
  }

  factory ChatMessage.userAudio(String audioBase64, {String text = "🎤 Mensaje de Voz / Voice Message"}) {
    return ChatMessage(
      text: text,
      isUser: true,
      isAudio: true,
      audioBase64: audioBase64,
      timestamp: DateTime.now(),
    );
  }

  factory ChatMessage.model(String text, {bool isStreaming = false}) {
    return ChatMessage(
      text: text,
      isUser: false,
      isStreaming: isStreaming,
      timestamp: DateTime.now(),
    );
  }
}
