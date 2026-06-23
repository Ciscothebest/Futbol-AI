import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../providers/auth_provider.dart';
import '../../providers/players_provider.dart';
import '../../widgets/glass_card.dart';
import '../../widgets/tactical_pitch.dart';
import '../../models/player.dart';
import '../../services/api_service.dart';

class MyClubTab extends StatefulWidget {
  const MyClubTab({Key? key}) : super(key: key);

  @override
  State<MyClubTab> createState() => _MyClubTabState();
}

class _MyClubTabState extends State<MyClubTab> {
  final ApiService _apiService = ApiService();
  
  static const Map<String, int> _countryToLogoId = {
    "Spain": 31, "España": 31, "United Kingdom": 55, "Reino Unido": 55, "Germany": 7, "Alemania": 7,
    "France": 44, "Francia": 44, "Italy": 67, "Italia": 67, "Netherlands": 17, "Países Bajos": 17,
    "Brazil": 6, "Brasil": 6, "Mexico": 39, "México": 39, "Colombia": 36, "Chile": 59,
    "Uruguay": 60, "United States of America": 47, "EE.UU.": 47, "Japan": 25, "Japón": 25,
    "Saudi Arabia": 66, "Arabia Saudí": 66, "Turkey": 73, "Turquía": 73, "Russia": 56,
    "Rusia": 56, "Belgium": 19, "Bélgica": 19, "Greece": 69, "Grecia": 69, "Australia": 1,
    "Egypt": 14, "Egipto": 14, "China": 70, "India": 24,
    "Ecuador": 43, "Peru": 35, "Perú": 35, "Venezuela": 37, "Paraguay": 12, "Costa Rica": 61,
    "Sweden": 2, "Suecia": 2, "Denmark": 74, "Dinamarca": 74, "Norway": 16, "Noruega": 16,
    "Switzerland": 71, "Suiza": 71, "Austria": 8, "Ukraine": 54, "Ucrania": 54, "Romania": 38, "Rumanía": 38,
    "Croatia": 23, "Croacia": 23, "Poland": 15, "Polonia": 15, "Trinidad and Tobago": 78, "Trinidad y Tobago": 78,
    "North Macedonia": 63, "Macedonia del N.": 63, "Albania": 28, "Slovenia": 64, "Eslovenia": 64,
    "Uzbekistan": 79, "Uzbekistán": 79, "Libya": 34, "Libia": 34,
    "Zimbabwe": 11, "Zimbabue": 11, "Zambia": 72, "Angola": 22,
    "Democratic Republic of the Congo": 46, "R.D. Congo": 46, "Mozambique": 48, "Cuba": 10, "El Salvador": 62,
    "Haiti": 45, "Haití": 45, "Syria": 77, "Siria": 77,
    "Oman": 51, "Omán": 51, "Pakistan": 52, "Pakistán": 52, "Bangladesh": 4,
    "Bangladés": 4, "Myanmar": 50, "Philippines": 53, "Filipinas": 53, "Cambodia": 9, "Camboya": 9, "Mongolia": 49
  };
  
  String _formation = '4-3-3';
  String _style = 'tikitaka';
  bool _isEditingLineup = false;
  List<Player> _teamRoster = [];
  bool _isRosterLoading = false;
  
  // Quick chat states
  final _chatInputController = TextEditingController();
  final List<Map<String, dynamic>> _quickChatMessages = [
    {'text': 'Asistente táctico listo para auditar tu club. ¿Qué deseas consultar?', 'isUser': false}
  ];
  bool _isChatLoading = false;

  @override
  void initState() {
    super.initState();
    _loadRosterData();
  }

  @override
  void dispose() {
    _chatInputController.dispose();
    super.dispose();
  }

  Future<void> _loadRosterData() async {
    setState(() => _isRosterLoading = true);
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final clubName = auth.user?.selectedClub ?? '';

    try {
      final res = await _apiService.getPlayers(team: clubName);
      final List<dynamic> list = res['players'] ?? [];
      setState(() {
        _teamRoster = list.map((p) => Player.fromJson(p)).toList();
      });
    } catch (_) {
      // Mock roster if offline or empty
      setState(() {
        _teamRoster = [];
      });
    } finally {
      setState(() => _isRosterLoading = false);
    }
  }

  Future<void> _sendQuickChatMessage() async {
    final text = _chatInputController.text.trim();
    if (text.isEmpty) return;

    _chatInputController.clear();
    setState(() {
      _quickChatMessages.add({'text': text, 'isUser': true});
      _isChatLoading = true;
    });

    final auth = Provider.of<AuthProvider>(context, listen: false);
    try {
      final rosterNames = _teamRoster.map((p) => p.name).toList();
      final res = await _apiService.sendChatMessage(
        message: 'Pregunta rápida sobre mi club (${auth.user?.selectedClub}): $text',
        lang: auth.lang,
      );
      setState(() {
        _quickChatMessages.add({'text': res['reply'] ?? '', 'isUser': false});
      });
    } catch (e) {
      setState(() {
        _quickChatMessages.add({'text': '⚠️ Error: No se pudo conectar con el agente IA.', 'isUser': false});
      });
    } finally {
      setState(() => _isChatLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final user = auth.user!;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // ─── PART 1: CLUB SUMMARY CARD ───
          GlassCard(
            borderColor: const Color(0x3B00F0FF),
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                // Procedural crest
                Container(
                  width: 54,
                  height: 54,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: const LinearGradient(
                      colors: [Color(0xFFFEBE10), Color(0xFF070E1B)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    border: Border.all(color: const Color(0xFFFEBE10), width: 1.5),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFFFEBE10).withOpacity(0.2),
                        blurRadius: 8,
                        spreadRadius: 1,
                      )
                    ],
                  ),
                  child: Center(
                    child: Text(
                      (user.selectedClub ?? 'FC').substring(0, 2).toUpperCase(),
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        user.selectedClub ?? 'Mi Club',
                        style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.black),
                      ),
                      const SizedBox(height: 2),
                      Builder(
                        builder: (context) {
                          final country = user.selectedCountry ?? "España";
                          final logoId = _countryToLogoId[country];
                          final logoUrl = logoId != null
                              ? '${_apiService.baseUrl.replaceAll('/api', '')}/assets/leagues/liga_$logoId.png'
                              : null;
                          return Row(
                            children: [
                              if (logoUrl != null)
                                Padding(
                                  padding: const EdgeInsets.only(right: 6),
                                  child: ClipRRect(
                                    borderRadius: BorderRadius.circular(2),
                                    child: Image.network(
                                      logoUrl,
                                      width: 16,
                                      height: 12,
                                      fit: BoxFit.contain,
                                      errorBuilder: (_, __, ___) => const SizedBox.shrink(),
                                    ),
                                  ),
                                ),
                              Text(
                                '$country · Temporada 2024/25',
                                style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11, fontWeight: FontWeight.w500),
                              ),
                            ],
                          );
                        }
                      ),
                    ],
                  ),
                ),
                // Compact position tag
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: const Color(0x1A00F0FF),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0x3B00F0FF), width: 1.0),
                  ),
                  child: const Text(
                    'Posición: 3º',
                    style: TextStyle(color: Color(0xFF00F0FF), fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // ─── PART 2: STARTING XI FIELD & CONTROLS ───
          GlassCard(
            borderColor: const Color(0x2600F0FF),
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Dropdown layout controls
                Row(
                  children: [
                    const Icon(Icons.settings_input_component, color: Color(0xFF00F0FF), size: 16),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        auth.translate('db_title_formation'),
                        style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                      ),
                    ),
                    // Formation Dropdown
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                      height: 32,
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.3),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: const Color(0x1Fffffff)),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          value: _formation,
                          dropdownColor: const Color(0xFF0B1426),
                          style: const TextStyle(color: Color(0xFF00F0FF), fontSize: 10, fontWeight: FontWeight.bold),
                          items: const [
                            DropdownMenuItem(value: '4-3-3', child: Text('4-3-3')),
                            DropdownMenuItem(value: '4-4-2', child: Text('4-4-2')),
                            DropdownMenuItem(value: '3-5-2', child: Text('3-5-2')),
                            DropdownMenuItem(value: '4-2-3-1', child: Text('4-2-3-1')),
                            DropdownMenuItem(value: '4-1-2-1-2', child: Text('4-1-2-1-2')),
                            DropdownMenuItem(value: '3-4-3', child: Text('3-4-3')),
                          ],
                          onChanged: (val) {
                            if (val != null) setState(() => _formation = val);
                          },
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                
                // Tactical Pitch Canvas representation
                _isRosterLoading
                    ? const AspectRatio(
                        aspectRatio: 0.74,
                        child: Center(child: CircularProgressIndicator(color: Color(0xFF00F0FF))),
                      )
                    : TacticalPitch(
                        formation: _formation,
                        style: _style,
                        roster: _teamRoster,
                        onPlayerTap: (player, role) {
                          _showPlayerDetailSheet(player);
                        },
                        onEmptySlotTap: (role) {
                          _showAddPlayerDialog(role);
                        },
                      ),
                const SizedBox(height: 12),
                
                // Toggle edit mode
                ElevatedButton(
                  onPressed: () {
                    setState(() {
                      _isEditingLineup = !_isEditingLineup;
                    });
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                      backgroundColor: const Color(0xFF070E1B),
                      content: Text(
                        _isEditingLineup ? '🛠️ Modo de edición activo. Haz clic en las posiciones.' : '💾 Alineación guardada en local.',
                        style: const TextStyle(color: Color(0xFF00F0FF), fontSize: 12, fontWeight: FontWeight.bold),
                      ),
                    ));
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _isEditingLineup ? const Color(0xFFFEBE10) : const Color(0x1F00F0FF),
                    foregroundColor: _isEditingLineup ? Colors.black : Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                      side: BorderSide(color: _isEditingLineup ? const Color(0xFFFEBE10) : const Color(0x3B00F0FF)),
                    ),
                  ),
                  child: Text(
                    _isEditingLineup ? 'Guardar Cambios' : 'Editar Alineación',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // ─── PART 3: AI ALERTS HUD ───
          GlassCard(
            borderColor: const Color(0xFFEF4444).withOpacity(0.2), // Red alert glow
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.notification_important, color: Color(0xFFEF4444), size: 18),
                    const SizedBox(width: 8),
                    Text(
                      auth.translate('db_alerts_title'),
                      style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                _buildAlertItem(
                  'Físico',
                  'Baja de rendimiento físico en bloque defensivo central (-12%).',
                  const Color(0xFFEF4444),
                ),
                const SizedBox(height: 8),
                _buildAlertItem(
                  'Lesión',
                  'Fatiga acumulada detectada en carrilero izquierdo de alta intensidad.',
                  const Color(0xFFFEBE10),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // ─── PART 4: RECENT PERFORMANCE LINE CHART ───
          GlassCard(
            borderColor: const Color(0x2600F0FF),
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  auth.translate('db_performance_title'),
                  style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  height: 160,
                  child: LineChart(
                    LineChartData(
                      gridData: const FlGridData(show: false),
                      titlesData: const FlTitlesData(show: false),
                      borderData: FlBorderData(show: false),
                      lineBarsData: [
                        LineChartBarData(
                          spots: const [
                            FlSpot(0, 2),
                            FlSpot(1, 4),
                            FlSpot(2, 3),
                            FlSpot(3, 5),
                            FlSpot(4, 4.5),
                            FlSpot(5, 5),
                          ],
                          isCurved: true,
                          color: const Color(0xFF00F0FF),
                          barWidth: 3,
                          dotData: const FlDotData(show: true),
                          belowBarData: BarAreaData(
                            show: true,
                            color: const Color(0xFF00F0FF).withOpacity(0.1),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                const Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('J18', style: TextStyle(color: Colors.white24, fontSize: 10)),
                    Text('J19', style: TextStyle(color: Colors.white24, fontSize: 10)),
                    Text('J20', style: TextStyle(color: Colors.white24, fontSize: 10)),
                    Text('J21', style: TextStyle(color: Colors.white24, fontSize: 10)),
                    Text('J22', style: TextStyle(color: Colors.white24, fontSize: 10)),
                    Text('J23 (Reciente)', style: TextStyle(color: Color(0xFF00F0FF), fontSize: 10, fontWeight: FontWeight.bold)),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // ─── PART 5: QUICK AI TEAM MESSENGER ───
          GlassCard(
            borderColor: const Color(0x3B00F0FF),
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  auth.translate('db_chat_title'),
                  style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),
                Container(
                  height: 140,
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.3),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0x1Fffffff)),
                  ),
                  child: ListView.builder(
                    padding: const EdgeInsets.all(8),
                    itemCount: _quickChatMessages.length,
                    itemBuilder: (context, idx) {
                      final msg = _quickChatMessages[idx];
                      final isUser = msg['isUser'] == true;
                      return Align(
                        alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 6),
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: isUser ? const Color(0xFF00F0FF).withOpacity(0.15) : const Color(0x1Affffff),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: isUser ? const Color(0x4D00F0FF) : const Color(0x1Affffff),
                              width: 0.8,
                            ),
                          ),
                          child: Text(
                            msg['text'] ?? '',
                            style: TextStyle(
                              color: isUser ? const Color(0xFF00F0FF) : Colors.white,
                              fontSize: 11,
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _chatInputController,
                        style: const TextStyle(color: Colors.white, fontSize: 11),
                        decoration: InputDecoration(
                          hintText: auth.translate('db_chat_placeholder'),
                          hintStyle: const TextStyle(color: Colors.white24, fontSize: 11),
                          filled: true,
                          fillColor: Colors.black.withOpacity(0.2),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
                        ),
                        onSubmitted: (_) => _sendQuickChatMessage(),
                      ),
                    ),
                    const SizedBox(width: 8),
                    GestureDetector(
                      onTap: _isChatLoading ? null : _sendQuickChatMessage,
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: const Color(0xFF00F0FF),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: _isChatLoading
                            ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black))
                            : const Icon(Icons.send, color: Colors.black, size: 14),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildAlertItem(String label, String message, Color color) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
          decoration: BoxDecoration(
            color: color.withOpacity(0.15),
            borderRadius: BorderRadius.circular(4),
            border: Border.all(color: color, width: 0.8),
          ),
          child: Text(
            label,
            style: TextStyle(color: color, fontSize: 8, fontWeight: FontWeight.black),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            message,
            style: const TextStyle(color: Colors.white80, fontSize: 11, height: 1.25),
          ),
        ),
      ],
    );
  }

  void _showPlayerDetailSheet(Player player) {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF0B1426),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                children: [
                  ClipOval(
                    child: Image.network(player.avatarUrl, width: 44, height: 44, fit: BoxFit.cover),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(player.name, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                        Text('${player.positionEs} · OVR ${player.overallRating.toInt()}', style: const TextStyle(color: Color(0xFF00F0FF), fontSize: 12)),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              const Divider(color: Color(0x1Fffffff)),
              const SizedBox(height: 8),
              Text(
                player.bioEs ?? player.bio ?? 'Sin biografía disponible / No bio available.',
                style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12, height: 1.35),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () => Navigator.of(context).pop(),
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00F0FF), foregroundColor: Colors.black),
                child: const Text('Cerrar', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        );
      },
    );
  }

  void _showAddPlayerDialog(String role) {
    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          backgroundColor: const Color(0xFF0B1426),
          title: Text('Añadir Jugador para $role', style: const TextStyle(color: Colors.white)),
          content: const Text('Para añadir un jugador nuevo, ve a la pestaña "Jugadores", busca el scouting ideal y fíchalo para tu plantilla.', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12, height: 1.35)),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('Entendido', style: TextStyle(color: Color(0xFF00F0FF), fontWeight: FontWeight.bold)),
            ),
          ],
        );
      },
    );
  }
}
