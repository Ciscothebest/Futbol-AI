import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import '../../providers/auth_provider.dart';
import '../../providers/chat_provider.dart';
import '../../widgets/audio_recorder_hud.dart';
import '../../widgets/glass_card.dart';

class ChatTab extends StatefulWidget {
  const ChatTab({Key? key}) : super(key: key);

  @override
  State<ChatTab> createState() => _ChatTabState();
}

class _ChatTabState extends State<ChatTab> {
  final _textController = TextEditingController();
  final _scrollController = ScrollController();

  @override
  void dispose() {
    _textController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _submitText(AuthProvider auth, ChatProvider chat) {
    final text = _textController.text.trim();
    if (text.isEmpty) return;

    _textController.clear();
    
    // Roster and context is matched procedurally from MyClub if needed
    chat.sendMessageStream(
      text: text,
      lang: auth.lang,
      clubContext: auth.user?.selectedClub ?? 'Global',
      clubRoster: [],
    );
    
    _scrollToBottom();
  }

  // Simulates or records local microphone voice queries
  void _submitMockAudio(AuthProvider auth, ChatProvider chat) {
    chat.stopRecordingState();
    
    // High-tech, valid base64 audio mock query payload
    final String mockAudioBase64 = 
        'UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAAAAAA=='; 

    chat.sendAudioMessage(
      base64Data: mockAudioBase64,
      lang: auth.lang,
    );
    
    _scrollToBottom();
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final chat = Provider.of<ChatProvider>(context);
    final list = chat.messages;

    return Column(
      children: [
        // ─── PART 1: COMPACT CHAT HUB CONTROL HEADER ───
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: const BoxDecoration(
            color: Color(0xFF070E1B),
            border: Border(bottom: BorderSide(color: Color(0x1F00F0FF))),
          ),
          child: Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  color: Color(0x1A00F0FF),
                ),
                child: const Center(child: Text('⚽', style: TextStyle(fontSize: 16))),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      auth.translate('chat_agent_name'),
                      style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                    ),
                    const Row(
                      children: [
                        Container(
                          width: 6,
                          height: 6,
                          decoration: BoxDecoration(color: Color(0xFF00F0FF), shape: BoxShape.circle),
                        ),
                        SizedBox(width: 4),
                        Text(
                          'Online — Gemini IA Active',
                          style: TextStyle(color: Colors.white30, fontSize: 9, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              // Sound volume switcher
              IconButton(
                icon: Icon(
                  chat.isMuted ? Icons.volume_off_outlined : Icons.volume_up_outlined,
                  color: const Color(0xFF00F0FF),
                  size: 18,
                ),
                onPressed: () => chat.toggleMute(),
              ),
              // Trash clear switcher
              IconButton(
                icon: const Icon(Icons.delete_outline, color: Color(0xFFEF4444), size: 18),
                onPressed: () {
                  chat.clearConversation();
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                    backgroundColor: Color(0xFF020816),
                    content: Text('🗑️ Historial de chat vaciado.', style: TextStyle(color: Color(0xFFEF4444), fontSize: 12)),
                  ));
                },
              ),
            ],
          ),
        ),

        // ─── PART 2: DIALOGUE CONTENT SCROLL ───
        Expanded(
          child: list.isEmpty
              ? _buildWelcomeOverlay(auth, chat)
              : ListView.builder(
                  controller: _scrollController,
                  padding: const EdgeInsets.all(16),
                  itemCount: list.length,
                  itemBuilder: (context, idx) {
                    final msg = list[idx];
                    return _buildBubble(msg);
                  },
                ),
        ),

        // ─── PART 3: AUDIO RECORDING FLOATING HUD ───
        if (chat.isRecording)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: AudioRecorderHud(
              durationSeconds: chat.recordingSeconds,
              onCancel: () => chat.stopRecordingState(),
            ),
          ),

        // ─── PART 4: BOTTOM MESSAGE CONTROLS INPUT ───
        if (!chat.isRecording)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: const BoxDecoration(
              color: Color(0xFF070E1B),
              border: Border(top: BorderSide(color: Color(0x1F00F0FF))),
            ),
            child: SafeArea(
              child: Row(
                children: [
                  // Microphone audio recording gestures
                  GestureDetector(
                    onLongPress: () {
                      chat.startRecordingState();
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                        backgroundColor: Color(0xFFEF4444),
                        duration: Duration(milliseconds: 900),
                        content: Text('🎤 Mantén presionado o suelta para enviar el audio.', style: TextStyle(color: Colors.white, fontSize: 12)),
                      ));
                    },
                    onLongPressEnd: (_) => _submitMockAudio(auth, chat),
                    onTap: () {
                      // Click fallback: toggles state and triggers mock send after 3 seconds
                      chat.startRecordingState();
                      Future.delayed(const Duration(seconds: 3), () {
                        if (chat.isRecording) {
                          _submitMockAudio(auth, chat);
                        }
                      });
                    },
                    child: Container(
                      padding: const EdgeInsets.all(10),
                      decoration: const BoxDecoration(
                        color: Color(0x1Affffff),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.mic, color: Color(0xFF00F0FF), size: 18),
                    ),
                  ),
                  const SizedBox(width: 10),
                  // Chat textfield
                  Expanded(
                    child: TextField(
                      controller: _textController,
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                      maxLines: 4,
                      minLines: 1,
                      decoration: InputDecoration(
                        hintText: auth.translate('chat_placeholder'),
                        hintStyle: const TextStyle(color: Colors.white24, fontSize: 13),
                        filled: true,
                        fillColor: Colors.black.withOpacity(0.3),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(20), borderSide: BorderSide.none),
                      ),
                      onSubmitted: (_) => _submitText(auth, chat),
                    ),
                  ),
                  const SizedBox(width: 10),
                  // Send button
                  GestureDetector(
                    onTap: chat.isLoading ? null : () => _submitText(auth, chat),
                    child: Container(
                      padding: const EdgeInsets.all(10),
                      decoration: const BoxDecoration(
                        color: Color(0xFF00F0FF),
                        shape: BoxShape.circle,
                      ),
                      child: chat.isLoading
                          ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black))
                          : const Icon(Icons.send, color: Colors.black, size: 18),
                    ),
                  ),
                ],
              ),
            ),
          ),
      ],
    );
  }

  // Welcoming board rendered when chat history list is empty
  Widget _buildWelcomeOverlay(AuthProvider auth, ChatProvider chat) {
    final List<Map<String, String>> prompts = [
      {'label': auth.translate('prompt1_label'), 'query': auth.translate('prompt1')},
      {'label': auth.translate('prompt2_label'), 'query': auth.translate('prompt2')},
      {'label': auth.translate('prompt3_label'), 'query': auth.translate('prompt3')},
      {'label': auth.translate('prompt4_label'), 'query': auth.translate('prompt4')},
    ];

    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 64,
              height: 64,
              decoration: const BoxDecoration(color: Color(0x1F00F0FF), shape: BoxShape.circle),
              child: const Center(child: Text('⚽', style: TextStyle(fontSize: 32))),
            ),
            const SizedBox(height: 16),
            Text(
              auth.translate('welcome_title'),
              style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.black),
            ),
            const SizedBox(height: 6),
            Text(
              auth.translate('welcome_text'),
              textAlign: TextAlign.center,
              style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13, height: 1.4),
            ),
            const SizedBox(height: 32),
            const Align(
              alignment: Alignment.centerLeft,
              child: Text(
                'PREGUNTAS SUGERIDAS:',
                style: TextStyle(color: Colors.white30, fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 0.5),
              ),
            ),
            const SizedBox(height: 12),
            ...prompts.map((p) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: GestureDetector(
                  onTap: () {
                    chat.sendMessageStream(
                      text: p['query']!,
                      lang: auth.lang,
                      clubContext: auth.user?.selectedClub ?? 'Global',
                      clubRoster: [],
                    );
                    _scrollToBottom();
                  },
                  child: GlassCard(
                    borderColor: const Color(0x1A00F0FF),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    child: Row(
                      children: [
                        const Icon(Icons.sports_soccer_outlined, color: Color(0xFF00F0FF), size: 14),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            p['label']!,
                            style: const TextStyle(color: Color(0xFF00F0FF), fontSize: 11, fontWeight: FontWeight.bold),
                          ),
                        ),
                        const Icon(Icons.arrow_forward_ios, color: Colors.white24, size: 10),
                      ],
                    ),
                  ),
                ),
              );
            }).toList(),
          ],
        ),
      ),
    );
  }

  // Dialogue bubble render
  Widget _buildBubble(ChatMessage msg) {
    final isUser = msg.isUser;
    
    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.8),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: isUser ? const Color(0xFF00F0FF).withOpacity(0.15) : const Color(0xFF0F172A),
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(16),
            topRight: const Radius.circular(16),
            bottomLeft: isUser ? const Radius.circular(16) : Radius.zero,
            bottomRight: isUser ? Radius.zero : const Radius.circular(16),
          ),
          border: Border.all(
            color: isUser ? const Color(0x4D00F0FF) : const Color(0x1A00F0FF),
            width: 0.8,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Voice message specific tag
            if (msg.isAudio) ...[
              const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.audiotrack, color: Color(0xFF00F0FF), size: 16),
                  SizedBox(width: 8),
                  Text(
                    'Mensaje de Voz',
                    style: TextStyle(color: Color(0xFF00F0FF), fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              const SizedBox(height: 6),
            ],
            
            // Standard Text / Markdown bot response
            msg.isUser
                ? Text(
                    msg.text,
                    style: const TextStyle(color: Colors.white, fontSize: 13, height: 1.35),
                  )
                : MarkdownBody(
                    data: msg.text.isEmpty && msg.isStreaming ? '✍️ Escribiendo...' : msg.text,
                    styleSheet: MarkdownStyleSheet(
                      p: const TextStyle(color: Color(0xFFE2E8F0), fontSize: 13, height: 1.45),
                      h1: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold, height: 1.6),
                      h2: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold, height: 1.5),
                      strong: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                      listBullet: const TextStyle(color: Color(0xFF00F0FF)),
                    ),
                  ),
          ],
        ),
      ),
    );
  }
}
