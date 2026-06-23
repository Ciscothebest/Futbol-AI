import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import '../../providers/auth_provider.dart';
import '../../providers/players_provider.dart';
import '../../providers/compare_provider.dart';
import '../../widgets/glass_card.dart';
import '../../widgets/radar_chart_widget.dart';
import '../../models/player.dart';

class CompareTab extends StatefulWidget {
  const CompareTab({Key? key}) : super(key: key);

  @override
  State<CompareTab> createState() => _CompareTabState();
}

class _CompareTabState extends State<CompareTab> {
  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final compProv = Provider.of<CompareProvider>(context);

    final p1 = compProv.player1;
    final p2 = compProv.player2;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // ─── PART 1: DOUBLE SLOTS SELECTOR ───
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Player 1 Slot
              Expanded(
                child: _buildSelectorSlot(
                  player: p1,
                  label: auth.translate('player1_label'),
                  onSelect: () => _openPlayerSelectorDialog(1),
                  onClear: () => compProv.deselectPlayer1(),
                ),
              ),
              // VS Divider
              Container(
                height: 120,
                width: 40,
                alignment: Alignment.center,
                child: const Text(
                  'VS',
                  style: TextStyle(
                    color: Color(0xFFFEBE10), // Gold
                    fontSize: 16,
                    fontWeight: FontWeight.black,
                    letterSpacing: 1.0,
                  ),
                ),
              ),
              // Player 2 Slot
              Expanded(
                child: _buildSelectorSlot(
                  player: p2,
                  label: auth.translate('player2_label'),
                  onSelect: () => _openPlayerSelectorDialog(2),
                  onClear: () => compProv.deselectPlayer2(),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // ─── PART 2: TRIGGER COMPARE BUTTON ───
          if (compProv.tacticalReport == null)
            Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                boxShadow: compProv.canCompare
                    ? [
                        BoxShadow(
                          color: const Color(0xFF00F0FF).withOpacity(0.15),
                          blurRadius: 15,
                          spreadRadius: 1,
                        )
                      ]
                    : [],
              ),
              child: ElevatedButton(
                onPressed: compProv.canCompare && !compProv.isLoading
                    ? () => compProv.compare(lang: auth.lang)
                    : null,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF00F0FF),
                  foregroundColor: Colors.black,
                  disabledBackgroundColor: const Color(0x1F00F0FF),
                  disabledForegroundColor: Colors.white24,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: compProv.isLoading
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black))
                    : Text(
                        auth.translate('btn_analyze'),
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, letterSpacing: 0.5),
                      ),
              ),
            ),

          // ─── PART 3: RESULTS PANEL ───
          if (compProv.isLoading)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 60),
              child: Center(
                child: Column(
                  children: [
                    CircularProgressIndicator(color: Color(0xFF00F0FF)),
                    SizedBox(height: 16),
                    Text(
                      '⏳ Analizando perfiles con IA...',
                      style: TextStyle(color: Color(0xFF00F0FF), fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
            ),

          if (compProv.tacticalReport != null && !compProv.isLoading) ...[
            const SizedBox(height: 16),
            GlassCard(
              borderColor: const Color(0xFFFEBE10).withOpacity(0.3), // Gold border for results
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // H2H statistics bars
                  const Text(
                    'ESTADÍSTICAS CARA A CARA',
                    style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                  ),
                  const SizedBox(height: 16),
                  _buildH2HBar('Valoración Global', p1!.overallRating, p2!.overallRating, compProv),
                  _buildH2HBar('Goles de Club', p1.stats['goals'] ?? 0.0, p2.stats['goals'] ?? 0.0, compProv),
                  _buildH2HBar('Asistencias de Club', p1.stats['assists'] ?? 0.0, p2.stats['assists'] ?? 0.0, compProv),
                  _buildH2HBar('Valor de Mercado (€)', p1.marketValue, p2.marketValue, compProv),
                  _buildH2HBar('Edad', p1.age, p2.age, compProv, invertFavor: true), // Lower age is better in scouting
                  
                  const SizedBox(height: 24),
                  const Divider(color: Color(0x1Fffffff)),
                  const SizedBox(height: 16),

                  // Dynamic Radar Chart Vector Painter
                  const Text(
                    'COMPARATIVA DE RADAR TÁCTICO',
                    style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    height: 260,
                    child: RadarChartWidget(
                      labels: const ['Ritmo', 'Tiro', 'Pase', 'Regate', 'Defensa', 'Físico'],
                      dataset1: _extractRadarData(p1),
                      dataset2: _extractRadarData(p2),
                      name1: p1.name,
                      name2: p2.name,
                      color1: const Color(0xFFFEBE10), // Gold
                      color2: const Color(0xFF00F0FF), // Cyan
                    ),
                  ),

                  const SizedBox(height: 24),
                  const Divider(color: Color(0x1Fffffff)),
                  const SizedBox(height: 16),

                  // Gemini Markdown Report render
                  const Text(
                    'INFORME TÁCTICO INTELIGENTE',
                    style: TextStyle(color: Color(0xFF00F0FF), fontSize: 13, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                  ),
                  const SizedBox(height: 12),
                  MarkdownBody(
                    data: compProv.tacticalReport!,
                    styleSheet: MarkdownStyleSheet(
                      p: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12, height: 1.45),
                      h1: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold, height: 1.6),
                      h2: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold, height: 1.5),
                      h3: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold, height: 1.4),
                      strong: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                      listBullet: const TextStyle(color: Color(0xFF00F0FF)),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Reset comparatives button
                  OutlinedButton(
                    onPressed: () => compProv.clearComparison(),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFFEF4444),
                      side: const BorderSide(color: Color(0x3BEF4444)),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    child: const Text('Limpiar Comparativa', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ),
          ],
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildSelectorSlot({
    required Player? player,
    required String label,
    required VoidCallback onSelect,
    required VoidCallback onClear,
  }) {
    final hasPlayer = player != null;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          label.toUpperCase(),
          textAlign: TextAlign.center,
          style: const TextStyle(color: Colors.white30, fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 1.0),
        ),
        const SizedBox(height: 8),
        GestureDetector(
          onTap: hasPlayer ? null : onSelect,
          child: GlassCard(
            borderColor: hasPlayer ? const Color(0x3BFEBE10) : const Color(0x1Fffffff),
            opacity: 0.05,
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 16),
            child: hasPlayer
                ? Column(
                    children: [
                      // Clear player button
                      Align(
                        alignment: Alignment.topRight,
                        child: GestureDetector(
                          onTap: onClear,
                          child: const Icon(Icons.close, color: Colors.white38, size: 14),
                        ),
                      ),
                      // Avatar
                      ClipOval(
                        child: Image.network(player.avatarUrl, width: 48, height: 48, fit: BoxFit.cover),
                      ),
                      const SizedBox(height: 10),
                      // Name
                      Text(
                        player.name,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        textAlign: TextAlign.center,
                        style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 2),
                      // Rating & Club
                      Text(
                        'OVR ${player.overallRating.toInt()} · ${player.currentTeam}',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        textAlign: TextAlign.center,
                        style: const TextStyle(color: Color(0xFF00F0FF), fontSize: 9, fontWeight: FontWeight.bold),
                      ),
                    ],
                  )
                : Container(
                    height: 100,
                    alignment: Alignment.center,
                    child: const Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.add, color: Color(0x7F00F0FF), size: 24),
                        SizedBox(height: 8),
                        Text(
                          'Añadir jugador',
                          style: TextStyle(color: Color(0x7F00F0FF), fontSize: 11, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
          ),
        ),
      ],
    );
  }

  Widget _buildH2HBar(String label, dynamic val1, dynamic val2, CompareProvider provider, {bool invertFavor = false}) {
    final double pct = provider.getRelativePercentage(val1, val2);
    // If invertFavor, lower stats is better (e.g. lower age)
    final double adjustedPct = invertFavor ? 1.0 - pct : pct;

    String formatVal(dynamic v) {
      if (v is double) return v.toStringAsFixed(1);
      if (v is int && v >= 1000000) return '${(v / 1000000).toStringAsFixed(0)}M';
      return v.toString();
    }

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(formatVal(val1), style: const TextStyle(color: Color(0xFFFEBE10), fontSize: 12, fontWeight: FontWeight.bold)),
              Text(label, style: const TextStyle(color: Colors.white60, fontSize: 10)),
              Text(formatVal(val2), style: const TextStyle(color: Color(0xFF00F0FF), fontSize: 12, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 6),
          // Progress dual slider
          Container(
            height: 6,
            decoration: BoxDecoration(
              color: const Color(0x1Fffffff),
              borderRadius: BorderRadius.circular(3),
            ),
            child: Row(
              children: [
                Expanded(
                  flex: (adjustedPct * 100).toInt(),
                  child: Container(
                    decoration: const BoxDecoration(
                      color: Color(0xFFFEBE10),
                      borderRadius: BorderRadius.only(topLeft: Radius.circular(3), bottomLeft: Radius.circular(3)),
                    ),
                  ),
                ),
                Expanded(
                  flex: ((1.0 - adjustedPct) * 100).toInt(),
                  child: Container(
                    decoration: const BoxDecoration(
                      color: Color(0xFF00F0FF),
                      borderRadius: BorderRadius.only(topRight: Radius.circular(3), bottomRight: Radius.circular(3)),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  List<double> _extractRadarData(Player p) {
    // Standard tactical ratings extracted dynamically or defaulted
    // We map stats keys: speed, shooting, passing, dribbling, defending, physical
    final speed = p.stats['speed'] is num ? (p.stats['speed'] as num).toDouble() : 80.0;
    final shoot = p.stats['shooting'] is num ? (p.stats['shooting'] as num).toDouble() : 75.0;
    final pass = p.stats['passing'] is num ? (p.stats['passing'] as num).toDouble() : 82.0;
    final dribble = p.stats['dribbling'] is num ? (p.stats['dribbling'] as num).toDouble() : 85.0;
    final defend = p.stats['defending'] is num ? (p.stats['defending'] as num).toDouble() : 50.0;
    final physical = p.stats['physical'] is num ? (p.stats['physical'] as num).toDouble() : 70.0;

    return [speed, shoot, pass, dribble, defend, physical];
  }

  // ─── PLAYER SELECTION SEARCH POPUP DIALOG ───
  void _openPlayerSelectorDialog(int slotIndex) {
    final playersProv = Provider.of<PlayersProvider>(context, listen: false);
    final compProv = Provider.of<CompareProvider>(context, listen: false);

    showDialog(
      context: context,
      builder: (context) {
        String query = '';
        return StatefulBuilder(
          builder: (context, setState) {
            // Filter all loaded players locally for rapid searches inside comparison
            final List<Player> matches = playersProv.players.where((p) {
              final lower = p.name.toLowerCase();
              final teamLower = p.currentTeam.toLowerCase();
              final qLower = query.toLowerCase();
              return lower.contains(qLower) || teamLower.contains(qLower);
            }).toList();

            return AlertDialog(
              backgroundColor: const Color(0xFF0B1426),
              title: Text('Seleccionar Jugador $slotIndex', style: const TextStyle(color: Colors.white, fontSize: 16)),
              content: SizedBox(
                width: double.maxFinite,
                height: 380,
                child: Column(
                  children: [
                    TextField(
                      style: const TextStyle(color: Colors.white, fontSize: 12),
                      decoration: InputDecoration(
                        hintText: 'Buscar jugador o club...',
                        hintStyle: const TextStyle(color: Colors.white24, fontSize: 12),
                        filled: true,
                        fillColor: Colors.black.withOpacity(0.2),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 12),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      onChanged: (val) {
                        setState(() {
                          query = val;
                        });
                      },
                    ),
                    const SizedBox(height: 12),
                    Expanded(
                      child: matches.isEmpty
                          ? const Center(child: Text('No hay resultados / No results.', style: TextStyle(color: Colors.white24, fontSize: 11)))
                          : ListView.builder(
                              itemCount: matches.length,
                              itemBuilder: (context, idx) {
                                final p = matches[idx];
                                return ListTile(
                                  dense: true,
                                  leading: ClipOval(
                                    child: Image.network(p.avatarUrl, width: 28, height: 28, fit: BoxFit.cover),
                                  ),
                                  title: Text(p.name, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                                  subtitle: Text('${p.currentTeam} · OVR ${p.overallRating.toInt()}', style: const TextStyle(color: Color(0xFF00F0FF), fontSize: 10)),
                                  onTap: () {
                                    if (slotIndex == 1) {
                                      compProv.selectPlayer1(p);
                                    } else {
                                      compProv.selectPlayer2(p);
                                    }
                                    Navigator.of(context).pop();
                                  },
                                );
                              },
                            ),
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: const Text('Cerrar', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
                )
              ],
            );
          },
        );
      },
    );
  }
}
