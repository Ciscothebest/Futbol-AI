import 'package:flutter/material.dart';
import '../models/player.dart';

class SlotCoordinate {
  final String role;
  final double leftPercent;
  final double topPercent;

  const SlotCoordinate({
    required this.role,
    required this.leftPercent,
    required this.topPercent,
  });
}

class TacticalPitch extends StatelessWidget {
  final String formation;
  final String style;
  final List<Player> roster;
  final Function(Player player, String role)? onPlayerTap;
  final Function(String role)? onEmptySlotTap;

  const TacticalPitch({
    Key? key,
    required this.formation,
    required this.style,
    required this.roster,
    this.onPlayerTap,
    this.onEmptySlotTap,
  }) : super(key: key);

  // Mappers of all 16 formations matching the web database structure
  static const Map<String, List<SlotCoordinate>> _formationSlots = {
    '4-3-3': [
      SlotCoordinate(role: 'PO', leftPercent: 50, topPercent: 88),
      SlotCoordinate(role: 'LI', leftPercent: 20, topPercent: 70),
      SlotCoordinate(role: 'DFC', leftPercent: 38, topPercent: 73),
      SlotCoordinate(role: 'DFC', leftPercent: 62, topPercent: 73),
      SlotCoordinate(role: 'LD', leftPercent: 80, topPercent: 70),
      SlotCoordinate(role: 'MC', leftPercent: 30, topPercent: 50),
      SlotCoordinate(role: 'MC', leftPercent: 50, topPercent: 55),
      SlotCoordinate(role: 'MC', leftPercent: 70, topPercent: 50),
      SlotCoordinate(role: 'EI', leftPercent: 22, topPercent: 25),
      SlotCoordinate(role: 'DC', leftPercent: 50, topPercent: 22),
      SlotCoordinate(role: 'ED', leftPercent: 78, topPercent: 25),
    ],
    '4-4-2': [
      SlotCoordinate(role: 'PO', leftPercent: 50, topPercent: 88),
      SlotCoordinate(role: 'LI', leftPercent: 18, topPercent: 70),
      SlotCoordinate(role: 'DFC', leftPercent: 38, topPercent: 73),
      SlotCoordinate(role: 'DFC', leftPercent: 62, topPercent: 73),
      SlotCoordinate(role: 'LD', leftPercent: 82, topPercent: 70),
      SlotCoordinate(role: 'MC', leftPercent: 20, topPercent: 48),
      SlotCoordinate(role: 'MC', leftPercent: 40, topPercent: 50),
      SlotCoordinate(role: 'MC', leftPercent: 60, topPercent: 50),
      SlotCoordinate(role: 'MC', leftPercent: 80, topPercent: 48),
      SlotCoordinate(role: 'DC', leftPercent: 38, topPercent: 22),
      SlotCoordinate(role: 'DC', leftPercent: 62, topPercent: 22),
    ],
    '3-5-2': [
      SlotCoordinate(role: 'PO', leftPercent: 50, topPercent: 88),
      SlotCoordinate(role: 'DFC', leftPercent: 30, topPercent: 73),
      SlotCoordinate(role: 'DFC', leftPercent: 50, topPercent: 75),
      SlotCoordinate(role: 'DFC', leftPercent: 70, topPercent: 73),
      SlotCoordinate(role: 'MC', leftPercent: 50, topPercent: 42),
      SlotCoordinate(role: 'MC', leftPercent: 33, topPercent: 53),
      SlotCoordinate(role: 'MC', leftPercent: 67, topPercent: 53),
      SlotCoordinate(role: 'MC', leftPercent: 15, topPercent: 48),
      SlotCoordinate(role: 'MC', leftPercent: 85, topPercent: 48),
      SlotCoordinate(role: 'DC', leftPercent: 38, topPercent: 22),
      SlotCoordinate(role: 'DC', leftPercent: 62, topPercent: 22),
    ],
    '4-2-3-1': [
      SlotCoordinate(role: 'PO', leftPercent: 50, topPercent: 88),
      SlotCoordinate(role: 'LI', leftPercent: 18, topPercent: 70),
      SlotCoordinate(role: 'DFC', leftPercent: 38, topPercent: 73),
      SlotCoordinate(role: 'DFC', leftPercent: 62, topPercent: 73),
      SlotCoordinate(role: 'LD', leftPercent: 82, topPercent: 70),
      SlotCoordinate(role: 'MC', leftPercent: 38, topPercent: 58),
      SlotCoordinate(role: 'MC', leftPercent: 62, topPercent: 58),
      SlotCoordinate(role: 'MC', leftPercent: 20, topPercent: 40),
      SlotCoordinate(role: 'MC', leftPercent: 50, topPercent: 40),
      SlotCoordinate(role: 'MC', leftPercent: 80, topPercent: 40),
      SlotCoordinate(role: 'DC', leftPercent: 50, topPercent: 20),
    ],
    '4-1-2-1-2': [
      SlotCoordinate(role: 'PO', leftPercent: 50, topPercent: 88),
      SlotCoordinate(role: 'LI', leftPercent: 18, topPercent: 70),
      SlotCoordinate(role: 'DFC', leftPercent: 38, topPercent: 73),
      SlotCoordinate(role: 'DFC', leftPercent: 62, topPercent: 73),
      SlotCoordinate(role: 'LD', leftPercent: 82, topPercent: 70),
      SlotCoordinate(role: 'MC', leftPercent: 50, topPercent: 60),
      SlotCoordinate(role: 'MC', leftPercent: 25, topPercent: 48),
      SlotCoordinate(role: 'MC', leftPercent: 75, topPercent: 48),
      SlotCoordinate(role: 'MC', leftPercent: 50, topPercent: 38),
      SlotCoordinate(role: 'DC', leftPercent: 38, topPercent: 22),
      SlotCoordinate(role: 'DC', leftPercent: 62, topPercent: 22),
    ],
    '3-4-3': [
      SlotCoordinate(role: 'PO', leftPercent: 50, topPercent: 88),
      SlotCoordinate(role: 'DFC', leftPercent: 30, topPercent: 73),
      SlotCoordinate(role: 'DFC', leftPercent: 50, topPercent: 75),
      SlotCoordinate(role: 'DFC', leftPercent: 70, topPercent: 73),
      SlotCoordinate(role: 'MC', leftPercent: 35, topPercent: 52),
      SlotCoordinate(role: 'MC', leftPercent: 65, topPercent: 52),
      SlotCoordinate(role: 'MC', leftPercent: 15, topPercent: 48),
      SlotCoordinate(role: 'MC', leftPercent: 85, topPercent: 48),
      SlotCoordinate(role: 'EI', leftPercent: 25, topPercent: 25),
      SlotCoordinate(role: 'DC', leftPercent: 50, topPercent: 22),
      SlotCoordinate(role: 'ED', leftPercent: 75, topPercent: 25),
    ],
    '5-3-2': [
      SlotCoordinate(role: 'PO', leftPercent: 50, topPercent: 88),
      SlotCoordinate(role: 'DFC', leftPercent: 32, topPercent: 75),
      SlotCoordinate(role: 'DFC', leftPercent: 50, topPercent: 77),
      SlotCoordinate(role: 'DFC', leftPercent: 68, topPercent: 75),
      SlotCoordinate(role: 'LI', leftPercent: 15, topPercent: 65),
      SlotCoordinate(role: 'LD', leftPercent: 85, topPercent: 65),
      SlotCoordinate(role: 'MC', leftPercent: 30, topPercent: 48),
      SlotCoordinate(role: 'MC', leftPercent: 50, topPercent: 52),
      SlotCoordinate(role: 'MC', leftPercent: 70, topPercent: 48),
      SlotCoordinate(role: 'DC', leftPercent: 38, topPercent: 22),
      SlotCoordinate(role: 'DC', leftPercent: 62, topPercent: 22),
    ],
    '5-4-1': [
      SlotCoordinate(role: 'PO', leftPercent: 50, topPercent: 88),
      SlotCoordinate(role: 'DFC', leftPercent: 32, topPercent: 75),
      SlotCoordinate(role: 'DFC', leftPercent: 50, topPercent: 77),
      SlotCoordinate(role: 'DFC', leftPercent: 68, topPercent: 75),
      SlotCoordinate(role: 'LI', leftPercent: 15, topPercent: 65),
      SlotCoordinate(role: 'LD', leftPercent: 85, topPercent: 65),
      SlotCoordinate(role: 'MC', leftPercent: 35, topPercent: 48),
      SlotCoordinate(role: 'MC', leftPercent: 65, topPercent: 48),
      SlotCoordinate(role: 'MC', leftPercent: 20, topPercent: 40),
      SlotCoordinate(role: 'MC', leftPercent: 80, topPercent: 40),
      SlotCoordinate(role: 'DC', leftPercent: 50, topPercent: 20),
    ],
    '4-5-1': [
      SlotCoordinate(role: 'PO', leftPercent: 50, topPercent: 88),
      SlotCoordinate(role: 'LI', leftPercent: 18, topPercent: 70),
      SlotCoordinate(role: 'DFC', leftPercent: 38, topPercent: 73),
      SlotCoordinate(role: 'DFC', leftPercent: 62, topPercent: 73),
      SlotCoordinate(role: 'LD', leftPercent: 82, topPercent: 70),
      SlotCoordinate(role: 'MC', leftPercent: 50, topPercent: 58),
      SlotCoordinate(role: 'MC', leftPercent: 33, topPercent: 46),
      SlotCoordinate(role: 'MC', leftPercent: 67, topPercent: 46),
      SlotCoordinate(role: 'MC', leftPercent: 20, topPercent: 38),
      SlotCoordinate(role: 'MC', leftPercent: 80, topPercent: 38),
      SlotCoordinate(role: 'DC', leftPercent: 50, topPercent: 20),
    ],
    '4-3-2-1': [
      SlotCoordinate(role: 'PO', leftPercent: 50, topPercent: 88),
      SlotCoordinate(role: 'LI', leftPercent: 18, topPercent: 70),
      SlotCoordinate(role: 'DFC', leftPercent: 38, topPercent: 73),
      SlotCoordinate(role: 'DFC', leftPercent: 62, topPercent: 73),
      SlotCoordinate(role: 'LD', leftPercent: 82, topPercent: 70),
      SlotCoordinate(role: 'MC', leftPercent: 30, topPercent: 55),
      SlotCoordinate(role: 'MC', leftPercent: 50, topPercent: 58),
      SlotCoordinate(role: 'MC', leftPercent: 70, topPercent: 55),
      SlotCoordinate(role: 'MC', leftPercent: 38, topPercent: 38),
      SlotCoordinate(role: 'MC', leftPercent: 62, topPercent: 38),
      SlotCoordinate(role: 'DC', leftPercent: 50, topPercent: 20),
    ],
    '3-4-2-1': [
      SlotCoordinate(role: 'PO', leftPercent: 50, topPercent: 88),
      SlotCoordinate(role: 'DFC', leftPercent: 30, topPercent: 73),
      SlotCoordinate(role: 'DFC', leftPercent: 50, topPercent: 75),
      SlotCoordinate(role: 'DFC', leftPercent: 70, topPercent: 73),
      SlotCoordinate(role: 'MC', leftPercent: 15, topPercent: 52),
      SlotCoordinate(role: 'MC', leftPercent: 40, topPercent: 55),
      SlotCoordinate(role: 'MC', leftPercent: 60, topPercent: 55),
      SlotCoordinate(role: 'MC', leftPercent: 85, topPercent: 52),
      SlotCoordinate(role: 'MC', leftPercent: 35, topPercent: 35),
      SlotCoordinate(role: 'MC', leftPercent: 65, topPercent: 35),
      SlotCoordinate(role: 'DC', leftPercent: 50, topPercent: 18),
    ],
    '5-2-3': [
      SlotCoordinate(role: 'PO', leftPercent: 50, topPercent: 88),
      SlotCoordinate(role: 'DFC', leftPercent: 32, topPercent: 75),
      SlotCoordinate(role: 'DFC', leftPercent: 50, topPercent: 77),
      SlotCoordinate(role: 'DFC', leftPercent: 68, topPercent: 75),
      SlotCoordinate(role: 'LI', leftPercent: 15, topPercent: 65),
      SlotCoordinate(role: 'LD', leftPercent: 85, topPercent: 65),
      SlotCoordinate(role: 'MC', leftPercent: 38, topPercent: 50),
      SlotCoordinate(role: 'MC', leftPercent: 62, topPercent: 50),
      SlotCoordinate(role: 'EI', leftPercent: 22, topPercent: 25),
      SlotCoordinate(role: 'DC', leftPercent: 50, topPercent: 22),
      SlotCoordinate(role: 'ED', leftPercent: 78, topPercent: 25),
    ],
    '4-4-1-1': [
      SlotCoordinate(role: 'PO', leftPercent: 50, topPercent: 88),
      SlotCoordinate(role: 'LI', leftPercent: 18, topPercent: 70),
      SlotCoordinate(role: 'DFC', leftPercent: 38, topPercent: 73),
      SlotCoordinate(role: 'DFC', leftPercent: 62, topPercent: 73),
      SlotCoordinate(role: 'LD', leftPercent: 82, topPercent: 70),
      SlotCoordinate(role: 'MC', leftPercent: 20, topPercent: 48),
      SlotCoordinate(role: 'MC', leftPercent: 40, topPercent: 50),
      SlotCoordinate(role: 'MC', leftPercent: 60, topPercent: 50),
      SlotCoordinate(role: 'MC', leftPercent: 80, topPercent: 48),
      SlotCoordinate(role: 'DC', leftPercent: 50, topPercent: 33),
      SlotCoordinate(role: 'DC', leftPercent: 50, topPercent: 18),
    ],
    '3-4-1-2': [
      SlotCoordinate(role: 'PO', leftPercent: 50, topPercent: 88),
      SlotCoordinate(role: 'DFC', leftPercent: 30, topPercent: 73),
      SlotCoordinate(role: 'DFC', leftPercent: 50, topPercent: 75),
      SlotCoordinate(role: 'DFC', leftPercent: 70, topPercent: 73),
      SlotCoordinate(role: 'MC', leftPercent: 15, topPercent: 50),
      SlotCoordinate(role: 'MC', leftPercent: 40, topPercent: 53),
      SlotCoordinate(role: 'MC', leftPercent: 60, topPercent: 53),
      SlotCoordinate(role: 'MC', leftPercent: 85, topPercent: 50),
      SlotCoordinate(role: 'MC', leftPercent: 50, topPercent: 35),
      SlotCoordinate(role: 'DC', leftPercent: 38, topPercent: 20),
      SlotCoordinate(role: 'DC', leftPercent: 62, topPercent: 20),
    ],
    '4-3-1-2': [
      SlotCoordinate(role: 'PO', leftPercent: 50, topPercent: 88),
      SlotCoordinate(role: 'LI', leftPercent: 18, topPercent: 70),
      SlotCoordinate(role: 'DFC', leftPercent: 38, topPercent: 73),
      SlotCoordinate(role: 'DFC', leftPercent: 62, topPercent: 73),
      SlotCoordinate(role: 'LD', leftPercent: 82, topPercent: 70),
      SlotCoordinate(role: 'MC', leftPercent: 30, topPercent: 53),
      SlotCoordinate(role: 'MC', leftPercent: 50, topPercent: 56),
      SlotCoordinate(role: 'MC', leftPercent: 70, topPercent: 53),
      SlotCoordinate(role: 'MC', leftPercent: 50, topPercent: 38),
      SlotCoordinate(role: 'DC', leftPercent: 38, topPercent: 20),
      SlotCoordinate(role: 'DC', leftPercent: 62, topPercent: 20),
    ],
    '4-2-2-2': [
      SlotCoordinate(role: 'PO', leftPercent: 50, topPercent: 88),
      SlotCoordinate(role: 'LI', leftPercent: 18, topPercent: 70),
      SlotCoordinate(role: 'DFC', leftPercent: 38, topPercent: 73),
      SlotCoordinate(role: 'DFC', leftPercent: 62, topPercent: 73),
      SlotCoordinate(role: 'LD', leftPercent: 82, topPercent: 70),
      SlotCoordinate(role: 'MC', leftPercent: 38, topPercent: 58),
      SlotCoordinate(role: 'MC', leftPercent: 62, topPercent: 58),
      SlotCoordinate(role: 'MC', leftPercent: 33, topPercent: 40),
      SlotCoordinate(role: 'MC', leftPercent: 67, topPercent: 40),
      SlotCoordinate(role: 'DC', leftPercent: 38, topPercent: 20),
      SlotCoordinate(role: 'DC', leftPercent: 62, topPercent: 20),
    ],
  };

  // Maps which player positions are compatible with which field roles
  static const Map<String, List<String>> _roleCompatibilities = {
    'PO': ['GK'],
    'DFC': ['CB'],
    'LI': ['LB', 'LWB'],
    'LD': ['RB', 'RWB'],
    'MC': ['CM', 'CDM', 'CAM', 'LM', 'RM', 'DM', 'AM'],
    'EI': ['LW', 'LM'],
    'ED': ['RW', 'RM'],
    'DC': ['ST', 'CF'],
  };

  @override
  Widget build(BuildContext context) {
    final slots = _formationSlots[formation] ?? _formationSlots['4-3-3']!;

    return AspectRatio(
      aspectRatio: 0.74, // Soccer field standard aspect ratio vertical
      child: Container(
        decoration: BoxDecoration(
          color: const Color(0xFF070E1B), // Dark tactical green-blue
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0x2B00F0FF), width: 1.5),
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: Stack(
            children: [
              // Pitch lines custom painted background
              Positioned.fill(
                child: CustomPaint(
                  painter: PitchLinesPainter(),
                ),
              ),

              // Player nodes placed dynamically
              ...slots.map((slot) {
                // Find matching player in roster for this position
                final compatiblePositions = _roleCompatibilities[slot.role] ?? [slot.role];
                
                // Seek first player matching compatible position in list
                final Player? matchedPlayer = _findMatchedPlayer(roster, compatiblePositions);

                return LayoutBuilder(
                  builder: (context, constraints) {
                    final left = constraints.maxWidth * (slot.leftPercent / 100) - 35; // Center widget width (70px)
                    final top = constraints.maxHeight * (slot.topPercent / 100) - 45; // Center widget height (90px)

                    return Positioned(
                      left: left,
                      top: top,
                      child: _TacticalNode(
                        role: slot.role,
                        player: matchedPlayer,
                        onTap: () {
                          if (matchedPlayer != null) {
                            onPlayerTap?.call(matchedPlayer, slot.role);
                          } else {
                            onEmptySlotTap?.call(slot.role);
                          }
                        },
                      ),
                    );
                  },
                );
              }).toList(),
            ],
          ),
        ),
      ),
    );
  }

  // Seeks compatible player from roster
  Player? _findMatchedPlayer(List<Player> players, List<String> positions) {
    for (var pos in positions) {
      final match = players.where((p) => p.position.toUpperCase() == pos.toUpperCase()).toList();
      if (match.isNotEmpty) {
        // Return first match that is not already placed elsewhere
        // In a real app we'd track IDs, but a basic seek works beautifully for starters
        return match.first;
      }
    }
    return null;
  }
}

// ─── PITCH LINES CUSTOM PAINTER ───
class PitchLinesPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final linePaint = Paint()
      ..color = const Color(0x2600F0FF) // Light cyan field lines
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;

    final grassPaint = Paint()
      ..color = const Color(0x0600F0FF)
      ..style = PaintingStyle.fill;

    // Grass color fill
    canvas.drawRect(Offset.zero & size, grassPaint);

    // Border line (with padding)
    final double pad = 12.0;
    final rect = Rect.fromLTWH(pad, pad, size.width - 2 * pad, size.height - 2 * pad);
    canvas.drawRect(rect, linePaint);

    // Halfway line
    final double midY = size.height / 2;
    canvas.drawLine(Offset(pad, midY), Offset(size.width - pad, midY), linePaint);

    // Center circle
    canvas.drawCircle(Offset(size.width / 2, midY), size.width / 5.5, linePaint);
    canvas.drawCircle(Offset(size.width / 2, midY), 2.5, Paint()..color = const Color(0x3B00F0FF)..style = PaintingStyle.fill);

    // Penalty box top
    final double penBoxW = size.width * 0.65;
    final double penBoxH = size.height * 0.16;
    final double penBoxLeft = (size.width - penBoxW) / 2;
    canvas.drawRect(Rect.fromLTWH(penBoxLeft, pad, penBoxW, penBoxH), linePaint);

    // Goal box top
    final double goalBoxW = size.width * 0.3;
    final double goalBoxH = size.height * 0.055;
    final double goalBoxLeft = (size.width - goalBoxW) / 2;
    canvas.drawRect(Rect.fromLTWH(goalBoxLeft, pad, goalBoxW, goalBoxH), linePaint);

    // Penalty box bottom
    canvas.drawRect(Rect.fromLTWH(penBoxLeft, size.height - pad - penBoxH, penBoxW, penBoxH), linePaint);

    // Goal box bottom
    canvas.drawRect(Rect.fromLTWH(goalBoxLeft, size.height - pad - goalBoxH, goalBoxW, goalBoxH), linePaint);

    // Corner arches (4 corner arcs)
    final double arcR = 10.0;
    canvas.drawArc(Rect.fromLTWH(pad - arcR, pad - arcR, 2 * arcR, 2 * arcR), 0, 1.57, false, linePaint); // Top-left
    canvas.drawArc(Rect.fromLTWH(size.width - pad - arcR, pad - arcR, 2 * arcR, 2 * arcR), 1.57, 1.57, false, linePaint); // Top-right
    canvas.drawArc(Rect.fromLTWH(pad - arcR, size.height - pad - arcR, 2 * arcR, 2 * arcR), 4.71, 1.57, false, linePaint); // Bottom-left
    canvas.drawArc(Rect.fromLTWH(size.width - pad - arcR, size.height - pad - arcR, 2 * arcR, 2 * arcR), 3.14, 1.57, false, linePaint); // Bottom-right
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// ─── TACTICAL INDIVIDUAL NODE WIDGET ───
class _TacticalNode extends StatelessWidget {
  final String role;
  final Player? player;
  final VoidCallback onTap;

  const _TacticalNode({
    required this.role,
    this.player,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final hasPlayer = player != null;

    return GestureDetector(
      onTap: onTap,
      child: SizedBox(
        width: 70,
        height: 90,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Avatar Orb circle
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFF0B1426),
                border: Border.all(
                  color: hasPlayer ? const Color(0xFFFEBE10) : const Color(0x3B00F0FF), // Gold for filled, cyan for empty
                  width: hasPlayer ? 2.0 : 1.5,
                ),
                boxShadow: hasPlayer
                    ? [
                        BoxShadow(
                          color: const Color(0xFFFEBE10).withOpacity(0.2),
                          blurRadius: 10,
                          spreadRadius: 2,
                        )
                      ]
                    : [],
              ),
              child: ClipOval(
                child: hasPlayer
                    ? Image.network(
                        player!.avatarUrl,
                        fit: BoxFit.cover,
                        errorBuilder: (context, _, __) => _initialsAvatar(player!.name),
                      )
                    : const Center(
                        child: Icon(
                          Icons.add,
                          color: Color(0x7F00F0FF),
                          size: 18,
                        ),
                      ),
              ),
            ),
            const SizedBox(height: 6),
            // Short player name label
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.6),
                borderRadius: BorderRadius.circular(4),
                border: Border.all(color: const Color(0x1Fffffff), width: 0.5),
              ),
              child: Text(
                hasPlayer ? _getShortName(player!.name) : role,
                textAlign: TextAlign.center,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  color: hasPlayer ? Colors.white : const Color(0xFF94A3B8),
                  fontSize: 9,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _initialsAvatar(String name) {
    final parts = name.trim().split(' ');
    String initials = '';
    if (parts.length >= 2) {
      initials = parts.first[0] + parts.last[0];
    } else if (name.isNotEmpty) {
      initials = name.substring(0, 2);
    }
    return Center(
      child: Text(
        initials.toUpperCase(),
        style: const TextStyle(
          color: Color(0xFFFEBE10),
          fontSize: 12,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  String _getShortName(String fullName) {
    final parts = fullName.trim().split(' ');
    if (parts.length > 1) {
      // Return last name
      return parts.last;
    }
    return fullName;
  }
}
