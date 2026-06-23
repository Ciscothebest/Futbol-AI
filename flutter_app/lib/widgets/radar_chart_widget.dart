import 'dart:math' as math;
import 'package:flutter/material.dart';

class RadarChartWidget extends StatelessWidget {
  final List<String> labels;
  final List<double> dataset1;
  final List<double> dataset2;
  final String name1;
  final String name2;
  final Color color1;
  final Color color2;

  const RadarChartWidget({
    Key? key,
    required this.labels,
    required this.dataset1,
    required this.dataset2,
    required this.name1,
    required this.name2,
    this.color1 = const Color(0xFFFEBE10), // Real Madrid Gold
    this.color2 = const Color(0xFF00F0FF), // Cyan
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Legend
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _LegendItem(color: color1, name: name1),
            const SizedBox(width: 24),
            _LegendItem(color: color2, name: name2),
          ],
        ),
        const SizedBox(height: 20),
        // Radar Plot
        Expanded(
          child: CustomPaint(
            size: Size.infinite,
            painter: RadarChartPainter(
              labels: labels,
              dataset1: dataset1,
              dataset2: dataset2,
              color1: color1,
              color2: color2,
            ),
          ),
        ),
      ],
    );
  }
}

class _LegendItem extends StatelessWidget {
  final Color color;
  final String name;

  const _LegendItem({required this.color, required this.name});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 14,
          height: 14,
          decoration: BoxDecoration(
            color: color.withOpacity(0.3),
            border: Border.all(color: color, width: 2),
            borderRadius: BorderRadius.circular(4),
          ),
        ),
        const SizedBox(width: 8),
        Text(
          name,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 12,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }
}

class RadarChartPainter extends CustomPainter {
  final List<String> labels;
  final List<double> dataset1;
  final List<double> dataset2;
  final Color color1;
  final Color color2;

  RadarChartPainter({
    required this.labels,
    required this.dataset1,
    required this.dataset2,
    required this.color1,
    required this.color2,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final maxRadius = math.min(size.width, size.height) / 2.3;
    final int vertices = labels.length;
    if (vertices < 3) return;

    final gridPaint = Paint()
      ..color = const Color(0x1B00F0FF)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;

    final axisPaint = Paint()
      ..color = const Color(0x1Fffffff)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 0.8;

    final textPainter = TextPainter(
      textDirection: TextDirection.ltr,
      textAlign: TextAlign.center,
    );

    // 1. Draw Concentric Grid Polygons (levels 20%, 40%, 60%, 80%, 100%)
    final gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];
    for (var level in gridLevels) {
      final path = Path();
      final radius = maxRadius * level;

      for (int i = 0; i < vertices; i++) {
        final angle = -math.pi / 2 + (2 * math.pi / vertices) * i;
        final x = center.dx + radius * math.cos(angle);
        final y = center.dy + radius * math.sin(angle);

        if (i == 0) {
          path.moveTo(x, y);
        } else {
          path.lineTo(x, y);
        }
      }
      path.close();
      canvas.drawPath(path, gridPaint);
    }

    // 2. Draw Spokes and Labels
    for (int i = 0; i < vertices; i++) {
      final angle = -math.pi / 2 + (2 * math.pi / vertices) * i;
      final outerX = center.dx + maxRadius * math.cos(angle);
      final outerY = center.dy + maxRadius * math.sin(angle);

      // Spoke line
      canvas.drawLine(center, Offset(outerX, outerY), axisPaint);

      // Text labels
      final textSpan = TextSpan(
        text: labels[i],
        style: const TextStyle(
          color: Color(0xFF94A3B8), // slate
          fontSize: 10,
          fontWeight: FontWeight.bold,
          letterSpacing: 0.5,
        ),
      );
      textPainter.text = textSpan;
      textPainter.layout();

      // Position label slightly outside the spoke vertex
      final labelOffsetRadius = maxRadius + 14.0;
      final labelX = center.dx + labelOffsetRadius * math.cos(angle) - (textPainter.width / 2);
      final labelY = center.dy + labelOffsetRadius * math.sin(angle) - (textPainter.height / 2);

      textPainter.paint(canvas, Offset(labelX, labelY));
    }

    // 3. Draw Dataset 1 (Player 1 Polygon)
    _drawDataset(canvas, center, maxRadius, dataset1, color1);

    // 4. Draw Dataset 2 (Player 2 Polygon)
    _drawDataset(canvas, center, maxRadius, dataset2, color2);
  }

  void _drawDataset(Canvas canvas, Offset center, double maxRadius, List<double> data, Color color) {
    final int vertices = labels.length;
    final path = Path();
    final points = <Offset>[];

    for (int i = 0; i < vertices; i++) {
      final val = i < data.length ? data[i] : 50.0;
      // Cap at 100, min at 0
      final cappedVal = math.max(0.0, math.min(100.0, val));
      final radius = maxRadius * (cappedVal / 100.0);
      final angle = -math.pi / 2 + (2 * math.pi / vertices) * i;

      final x = center.dx + radius * math.cos(angle);
      final y = center.dy + radius * math.sin(angle);
      points.add(Offset(x, y));

      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }
    path.close();

    // Fill paint
    final fillPaint = Paint()
      ..color = color.withOpacity(0.18)
      ..style = PaintingStyle.fill;
    canvas.drawPath(path, fillPaint);

    // Stroke paint
    final strokePaint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;
    canvas.drawPath(path, strokePaint);

    // Vertices dots
    final dotPaint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;
    for (var point in points) {
      canvas.drawCircle(point, 3.5, dotPaint);
      canvas.drawCircle(point, 5.0, Paint()..color = Colors.white.withOpacity(0.4)..style = PaintingStyle.stroke..strokeWidth = 1.0);
    }
  }

  @override
  bool shouldRepaint(covariant RadarChartPainter oldDelegate) {
    return oldDelegate.dataset1 != dataset1 || oldDelegate.dataset2 != dataset2;
  }
}
