import 'package:flutter/material.dart';

class AudioRecorderHud extends StatefulWidget {
  final int durationSeconds;
  final VoidCallback onCancel;

  const AudioRecorderHud({
    Key? key,
    required this.durationSeconds,
    required this.onCancel,
  }) : super(key: key);

  @override
  State<AudioRecorderHud> createState() => _AudioRecorderHudState();
}

class _AudioRecorderHudState extends State<AudioRecorderHud>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    )..repeat(reverse: true);
    
    _pulseAnimation = Tween<double>(begin: 0.4, end: 1.0).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  String _formatDuration(int totalSecs) {
    final int mins = totalSecs ~/ 60;
    final int secs = totalSecs % 60;
    return '$mins:${secs.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A), // Dark slate matching background
        borderRadius: BorderRadius.circular(30),
        border: Border.all(color: const Color(0xFFEF4444), width: 1.0), // Red recording borders
        boxShadow: [
          BoxShadow(
            color: Colors.red.withOpacity(0.1),
            blurRadius: 15,
            spreadRadius: 2,
          ),
        ],
      ),
      child: Row(
        children: [
          // Pulsing recording red indicator
          AnimatedBuilder(
            animation: _pulseAnimation,
            builder: (context, child) {
              return Opacity(
                opacity: _pulseAnimation.value,
                child: Container(
                  width: 12,
                  height: 12,
                  decoration: const BoxDecoration(
                    color: Color(0xFFEF4444),
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: Color(0xFFEF4444),
                        blurRadius: 6,
                        spreadRadius: 1,
                      )
                    ],
                  ),
                ),
              );
            },
          ),
          const SizedBox(width: 12),
          // Timer Text
          Text(
            _formatDuration(widget.durationSeconds),
            style: const TextStyle(
              color: Colors.white,
              fontSize: 14,
              fontFamily: 'monospace',
              fontWeight: 'bold',
            ),
          ),
          const SizedBox(width: 16),
          // Guide text
          const Expanded(
            child: Text(
              'Grabando audio táctico...',
              style: TextStyle(
                color: Color(0xFF94A3B8),
                fontSize: 12,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          // Cancel trigger
          TextButton.icon(
            onPressed: widget.onCancel,
            icon: const Icon(Icons.delete_outline, color: Color(0xFFEF4444), size: 18),
            label: const Text(
              'Cancelar',
              style: TextStyle(color: Color(0xFFEF4444), fontSize: 12, fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }
}
