import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/players_provider.dart';
import 'landing_screen.dart';
import 'profile_screen.dart';

// Import Tabs
import 'tabs/my_club_tab.dart';
import 'tabs/players_tab.dart';
import 'tabs/compare_tab.dart';
import 'tabs/chat_tab.dart';
import 'tabs/predictions_tab.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({Key? key}) : super(key: key);

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _activeTabIndex = 1; // Default active tab is 1 (Jugadores / Players) as defined in web window setup

  final List<Widget> _tabs = [
    const MyClubTab(),
    const PlayersTab(),
    const CompareTab(),
    const ChatTab(),
    const PredictionsTab(),
  ];

  @override
  void initState() {
    super.initState();
    // Proactively load database elements once dashboard mounts
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final playersProv = Provider.of<PlayersProvider>(context, listen: false);
      playersProv.loadPlayers();
      playersProv.loadLeaguesFilter();
    });
  }

  void _onLogout(BuildContext context) {
    showDialog(
      context: context,
      builder: (dialogCtx) {
        return AlertDialog(
          backgroundColor: const Color(0xFF0F172A),
          title: const Text('Cerrar Sesión', style: TextStyle(color: Colors.white)),
          content: const Text('¿Estás seguro de que deseas salir del sistema táctico?', style: TextStyle(color: Color(0xFF94A3B8))),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(dialogCtx).pop(),
              child: const Text('Cancelar', style: TextStyle(color: Color(0xFF94A3B8))),
            ),
            TextButton(
              onPressed: () {
                Navigator.of(dialogCtx).pop();
                Provider.of<AuthProvider>(context, listen: false).logout();
                Navigator.of(context).pushReplacement(
                  MaterialPageRoute(builder: (_) => const LandingScreen()),
                );
              },
              child: const Text('Cerrar Sesión', style: TextStyle(color: Color(0xFFEF4444), fontWeight: FontWeight.bold)),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final user = auth.user!;

    return Scaffold(
      backgroundColor: const Color(0xFF020816),
      // Glassmorphic Top App Bar
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(60),
        child: ClipRRect(
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
            child: AppBar(
              backgroundColor: const Color(0xFF070E1B).withOpacity(0.8),
              elevation: 0,
              centerTitle: false,
              bottom: PreferredSize(
                preferredSize: const Size.fromHeight(1),
                child: Container(color: const Color(0x1F00F0FF), height: 1), // Cyan bottom separator
              ),
              title: Row(
                children: [
                  const Icon(Icons.language, color: Color(0xFF00F0FF), size: 18),
                  const SizedBox(width: 8),
                  Text(
                    'SCOUT AI',
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.9),
                      fontSize: 13,
                      fontWeight: FontWeight.black,
                      letterSpacing: 1.5,
                    ),
                  ),
                ],
              ),
              actions: [
                // Translate toggle triggers
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    GestureDetector(
                      onTap: () => auth.toggleLanguage('es'),
                      child: Text(
                        'ES',
                        style: TextStyle(
                          color: auth.lang == 'es' ? const Color(0xFF00F0FF) : Colors.white24,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    const Text(' | ', style: TextStyle(color: Colors.white10, fontSize: 11)),
                    GestureDetector(
                      onTap: () => auth.toggleLanguage('en'),
                      child: Text(
                        'EN',
                        style: TextStyle(
                          color: auth.lang == 'en' ? const Color(0xFF00F0FF) : Colors.white24,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(width: 14),

                // Procedural User Profile trigger button
                GestureDetector(
                  onTap: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => const ProfileScreen()),
                    );
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0x1Fffffff),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0x1Affffff), width: 0.8),
                    ),
                    child: Row(
                      children: [
                        ClipOval(
                          child: Image.network(
                            user.avatarUrl,
                            width: 20,
                            height: 20,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => const Icon(Icons.person, size: 16, color: Colors.white60),
                          ),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          user.username,
                          style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 8),

                // Logout button
                IconButton(
                  icon: const Icon(Icons.logout, color: Color(0xFFEF4444), size: 18),
                  tooltip: auth.translate('profile_btn_logout'),
                  onPressed: () => _onLogout(context),
                ),
                const SizedBox(width: 8),
              ],
            ),
          ),
        ),
      ),
      body: _tabs[_activeTabIndex],

      // Glassmorphic responsive Bottom Navigation Bar
      bottomNavigationBar: ClipRRect(
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
          child: Container(
            decoration: BoxDecoration(
              color: const Color(0xFF070E1B).withOpacity(0.85),
              border: const Border(
                top: BorderSide(color: Color(0x1A00F0FF), width: 1.0),
              ),
            ),
            child: BottomNavigationBar(
              currentIndex: _activeTabIndex,
              onTap: (index) {
                setState(() {
                  _activeTabIndex = index;
                });
              },
              backgroundColor: Colors.transparent,
              type: BottomNavigationBarType.fixed,
              elevation: 0,
              selectedItemColor: const Color(0xFF00F0FF), // Neon cyan
              unselectedItemColor: const Color(0xFF64748B), // Slate gray
              selectedFontSize: 9,
              unselectedFontSize: 9,
              selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold, letterSpacing: 0.5),
              unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.w500),
              items: [
                BottomNavigationBarItem(
                  icon: const Icon(Icons.shield_outlined),
                  activeIcon: _buildGlowIcon(Icons.shield, const Color(0xFF00F0FF)),
                  label: auth.translate('nav_my_club').toUpperCase(),
                ),
                BottomNavigationBarItem(
                  icon: const Icon(Icons.people_outline),
                  activeIcon: _buildGlowIcon(Icons.people, const Color(0xFF00F0FF)),
                  label: auth.translate('nav_players').toUpperCase(),
                ),
                BottomNavigationBarItem(
                  icon: const Icon(Icons.compare_arrows_outlined),
                  activeIcon: _buildGlowIcon(Icons.compare_arrows, const Color(0xFF00F0FF)),
                  label: auth.translate('nav_compare').toUpperCase(),
                ),
                BottomNavigationBarItem(
                  icon: const Icon(Icons.chat_bubble_outline),
                  activeIcon: _buildGlowIcon(Icons.chat_bubble, const Color(0xFF00F0FF)),
                  label: auth.translate('nav_chat').toUpperCase(),
                ),
                BottomNavigationBarItem(
                  icon: const Icon(Icons.psychology_outlined),
                  activeIcon: _buildGlowIcon(Icons.psychology, const Color(0xFF00F0FF)),
                  label: auth.translate('nav_predictions').toUpperCase(),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildGlowIcon(IconData icon, Color color) {
    return Container(
      decoration: BoxDecoration(
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.2),
            blurRadius: 10,
            spreadRadius: 2,
          ),
        ],
      ),
      child: Icon(icon, color: color),
    );
  }
}
