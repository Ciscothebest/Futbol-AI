import 'package:flutter/material.dart';
import '../models/player.dart';
import '../services/api_service.dart';

class CompareProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  Player? _player1;
  Player? _player2;
  bool _isLoading = false;
  String? _tacticalReport;

  Player? get player1 => _player1;
  Player? get player2 => _player2;
  bool get isLoading => _isLoading;
  String? get tacticalReport => _tacticalReport;
  bool get canCompare => _player1 != null && _player2 != null;

  void selectPlayer1(Player player) {
    _player1 = player;
    _tacticalReport = null; // Clear previous report on selection change
    notifyListeners();
  }

  void selectPlayer2(Player player) {
    _player2 = player;
    _tacticalReport = null;
    notifyListeners();
  }

  void deselectPlayer1() {
    _player1 = null;
    _tacticalReport = null;
    notifyListeners();
  }

  void deselectPlayer2() {
    _player2 = null;
    _tacticalReport = null;
    notifyListeners();
  }

  void clearComparison() {
    _player1 = null;
    _player2 = null;
    _tacticalReport = null;
    notifyListeners();
  }

  // ─── EXECUTE COMPARISON REPORT ──────────────────────────────────
  Future<void> compare({required String lang}) async {
    if (!canCompare) return;

    _isLoading = true;
    _tacticalReport = null;
    notifyListeners();

    try {
      final res = await _apiService.comparePlayers(
        player1Id: _player1!.id,
        player2Id: _player2!.id,
        lang: lang,
      );

      _tacticalReport = res['analysis'];
      
      // Update players with full statistics returned if any, or keep current
      if (res['player1'] != null) {
        _player1 = Player.fromJson(res['player1']);
      }
      if (res['player2'] != null) {
        _player2 = Player.fromJson(res['player2']);
      }

      await _apiService.logComparison(_player1!.id, _player2!.id);
    } catch (e) {
      _tacticalReport = '❌ Error de comparación táctica / Comparison Error: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // ─── HELPER FOR H2H STATS ───
  // Returns relative percentages of stats (e.g. for comparison bars)
  double getRelativePercentage(dynamic val1, dynamic val2) {
    final double v1 = val1 is num ? val1.toDouble() : 0.0;
    final double v2 = val2 is num ? val2.toDouble() : 0.0;
    final double total = v1 + v2;
    if (total == 0.0) return 0.5;
    return v1 / total;
  }
}
