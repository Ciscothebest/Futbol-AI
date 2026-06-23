import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';
import '../../widgets/glass_card.dart';

class PredictionsTab extends StatefulWidget {
  const PredictionsTab({Key? key}) : super(key: key);

  @override
  State<PredictionsTab> createState() => _PredictionsTabState();
}

class _PredictionsTabState extends State<PredictionsTab> {
  final ApiService _apiService = ApiService();
  String _predictionsText = '';
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadPredictions();
  }

  Future<void> _loadPredictions() async {
    setState(() => _isLoading = true);
    final auth = Provider.of<AuthProvider>(context, listen: false);
    try {
      final text = await _apiService.getPredictions(lang: auth.lang);
      setState(() {
        _predictionsText = text;
      });
    } catch (e) {
      setState(() {
        _predictionsText = '❌ Error al generar predicciones / Predictions Error: ${e.toString()}';
      });
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);

    return Column(
      children: [
        // ─── PART 1: INTRO BANNER AREA ───
        Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      auth.translate('section_predictions'),
                      style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.black),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Pronósticos generados por IA basados en estadísticas reales y rendimiento 2024-25.',
                      style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              // Refresh button
              GestureDetector(
                onTap: _isLoading ? null : _loadPredictions,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: const Color(0x1F00F0FF),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0x3B00F0FF), width: 0.8),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.refresh, color: Color(0xFF00F0FF), size: 14),
                      const SizedBox(width: 6),
                      Text(
                        auth.translate('btn_refresh'),
                        style: const TextStyle(color: Color(0xFF00F0FF), fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),

        // ─── PART 2: MAIN PREDICTIONS DISPLAY CONTENT ───
        Expanded(
          child: _isLoading
              ? const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      CircularProgressIndicator(color: Color(0xFF00F0FF)),
                      SizedBox(height: 16),
                      Text(
                        '🤖 Generando predicciones de la élite...',
                        style: TextStyle(color: Color(0xFF00F0FF), fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                )
              : SingleChildScrollView(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                  child: GlassCard(
                    borderColor: const Color(0x1A00F0FF),
                    padding: const EdgeInsets.all(20),
                    child: MarkdownBody(
                      data: _predictionsText.isEmpty
                          ? 'No hay predicciones disponibles en este momento.'
                          : _predictionsText,
                      styleSheet: MarkdownStyleSheet(
                        p: const TextStyle(color: Color(0xFFE2E8F0), fontSize: 12, height: 1.45),
                        h1: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold, height: 1.6),
                        h2: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold, height: 1.5),
                        h3: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold, height: 1.4),
                        strong: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                        listBullet: const TextStyle(color: Color(0xFF00F0FF)),
                      ),
                    ),
                  ),
                ),
        ),
      ],
    );
  }
}
