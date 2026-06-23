import 'dart:math';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../widgets/glass_card.dart';
import '../models/user.dart';
import '../services/api_service.dart';
import 'landing_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final ApiService _apiService = ApiService();
  bool _isLoadingStats = false;
  
  // Activity stats counters from backend
  int _queriesCount = 0;
  final int _daysActive = 3;
  int _comparedCount = 0;

  @override
  void initState() {
    super.initState();
    _loadProfileStats();
  }

  Future<void> _loadProfileStats() async {
    setState(() => _isLoadingStats = true);
    try {
      final res = await _apiService.getProfileStats();
      setState(() {
        _queriesCount = res['queries'] ?? 0;
        _comparedCount = res['compared'] ?? 0;
      });
    } catch (_) {
      // Mock defaults
      setState(() {
        _queriesCount = 14;
        _comparedCount = 8;
      });
    } finally {
      setState(() => _isLoadingStats = false);
    }
  }

  // Wipes token and returns to landing page
  void _logout(BuildContext context, AuthProvider auth) {
    auth.logout();
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const LandingScreen()),
      (route) => false,
    );
  }

  // Procedural DiceBear avatar regenerator matching edit pencil in web app
  void _regenerateAvatarSeed(AuthProvider auth, User user) async {
    final randomSeed = 'User_${Random().nextInt(10000)}';
    final newAvatarUrl = 'https://api.dicebear.com/9.x/notionists/svg?seed=$randomSeed&backgroundColor=0d1117&radius=50';
    
    final updatedUser = user.copyWith(avatarUrl: newAvatarUrl);
    await auth.updateLocalUser(updatedUser);
    
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
      backgroundColor: Color(0xFF070E1B),
      content: Text('✨ Avatar actualizado con éxito.', style: TextStyle(color: Color(0xFF00F0FF), fontSize: 12)),
    ));
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final user = auth.user!;

    return Scaffold(
      backgroundColor: const Color(0xFF020816),
      appBar: AppBar(
        title: Text(auth.translate('nav_profile').toUpperCase(), style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, letterSpacing: 1.5)),
        backgroundColor: const Color(0xFF070E1B),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // ─── PART 1: AVATAR BANNER COCKPIT ───
            GlassCard(
              borderColor: const Color(0x3B00F0FF),
              padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
              child: Column(
                children: [
                  Stack(
                    children: [
                      // Avatar circular frame
                      Container(
                        width: 90,
                        height: 90,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: const Color(0xFF0F172A),
                          border: Border.all(color: const Color(0xFF00F0FF), width: 2.0),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF00F0FF).withOpacity(0.15),
                              blurRadius: 12,
                              spreadRadius: 2,
                            )
                          ],
                        ),
                        child: ClipOval(
                          child: Image.network(
                            user.avatarUrl,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => const Icon(Icons.person, size: 40, color: Colors.white60),
                          ),
                        ),
                      ),
                      // Pencil edit button
                      Positioned(
                        bottom: 0,
                        right: 0,
                        child: GestureDetector(
                          onTap: () => _regenerateAvatarSeed(auth, user),
                          child: Container(
                            padding: const EdgeInsets.all(6),
                            decoration: const BoxDecoration(
                              color: Color(0xFFFEBE10),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.edit, color: Colors.black, size: 14),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    '${user.nombres} ${user.apellidos}',
                    style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.black),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    auth.translate('profile_role').toUpperCase(),
                    style: const TextStyle(color: Color(0xFF00F0FF), fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.0),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // ─── PART 2: GENERAL ACTIVITY STATS HUD ───
            Text(
              auth.translate('profile_stats_title').toUpperCase(),
              style: const TextStyle(color: Colors.white30, fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 0.5),
            ),
            const SizedBox(height: 8),
            _isLoadingStats
                ? const Center(child: CircularProgressIndicator(color: Color(0xFF00F0FF)))
                : Row(
                    children: [
                      Expanded(
                        child: _buildMiniStat(
                          auth.translate('profile_stat_queries'),
                          '$_queriesCount',
                          Colors.white70,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: _buildMiniStat(
                          auth.translate('profile_stat_compared'),
                          '$_comparedCount',
                          const Color(0xFFFEBE10),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: _buildMiniStat(
                          auth.translate('profile_stat_plan'),
                          user.selectedTier.toUpperCase(),
                          const Color(0xFF00F0FF),
                        ),
                      ),
                    ],
                  ),
            const SizedBox(height: 16),

            // ─── PART 3: SCOUTING PREFERENCES ───
            Text(
              'PARAMETRIZACIÓN DE SCOUTING',
              style: const TextStyle(color: Colors.white30, fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 0.5),
            ),
            const SizedBox(height: 8),
            GlassCard(
              borderColor: const Color(0x1Fffffff),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Column(
                children: [
                  _buildProfileRow(auth.translate('profile_club_label'), user.selectedClub ?? 'Ninguno'),
                  _buildProfileRow(auth.translate('profile_country_label'), user.selectedCountry ?? 'Ninguno'),
                  _buildProfileRow(auth.translate('profile_tactic_label'), user.preferredStyle?.toUpperCase() ?? 'TIKITAKA (POSESIÓN)'),
                  _buildProfileRow('Alineación Favorita', user.preferredFormation ?? '4-3-3'),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // ─── PART 4: PERSONAL ACCOUNT SUMMARY ───
            Text(
              auth.translate('profile_info_title').toUpperCase(),
              style: const TextStyle(color: Colors.white30, fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 0.5),
            ),
            const SizedBox(height: 8),
            GlassCard(
              borderColor: const Color(0x1Fffffff),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Column(
                children: [
                  _buildProfileRow('Nombre de Usuario', user.username),
                  _buildProfileRow('Correo Electrónico', user.email),
                  _buildProfileRow('Número de Teléfono', user.telefono),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // ─── PART 5: SYSTEM LOGOUT TRIGGER ───
            ElevatedButton(
              onPressed: () => _logout(context, auth),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFEF4444),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              child: Text(
                auth.translate('profile_btn_logout'),
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildMiniStat(String label, String val, Color highlightColor) {
    return GlassCard(
      borderColor: highlightColor.withOpacity(0.2),
      padding: const EdgeInsets.all(12),
      child: Column(
        children: [
          Text(
            val,
            style: TextStyle(color: highlightColor, fontSize: 16, fontWeight: FontWeight.black),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            textAlign: TextAlign.center,
            style: const TextStyle(color: Colors.white38, fontSize: 8, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }

  Widget _buildProfileRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(color: Colors.white38, fontSize: 11),
          ),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.right,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }
}
