import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import 'landing_screen.dart';
import 'onboarding_screen.dart';
import 'dashboard_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({Key? key}) : super(key: key);

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  double _progress = 0.0;
  String _loadingText = 'Iniciando sistema...';
  late Timer _timer;

  final List<Map<String, dynamic>> _steps = [
    {'pct': 0.15, 'msg': 'Iniciando sistema...'},
    {'pct': 0.35, 'msg': 'Conectando con el backend...'},
    {'pct': 0.55, 'msg': 'Cargando base de datos...'},
    {'pct': 0.75, 'msg': 'Preparando jugadores...'},
    {'pct': 0.92, 'msg': 'Aplicando análisis IA...'},
    {'pct': 1.00, 'msg': '¡Listo!'},
  ];

  @override
  void initState() {
    super.initState();
    _startBootSequence();
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  void _startBootSequence() {
    int currentStepIdx = 0;
    _timer = Timer.periodic(const Duration(milliseconds: 300), (timer) {
      if (currentStepIdx >= _steps.length) {
        timer.cancel();
        _checkSessionAndNavigate();
        return;
      }

      final step = _steps[currentStepIdx];
      setState(() {
        _progress = step['pct'];
        _loadingText = step['msg'];
      });

      currentStepIdx++;
    });
  }

  void _checkSessionAndNavigate() {
    final auth = Provider.of<AuthProvider>(context, listen: false);

    if (auth.isAuthenticated) {
      final user = auth.user!;
      if (user.onboardingComplete) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const DashboardScreen()),
        );
      } else {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const OnboardingScreen()),
        );
      }
    } else {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const LandingScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF020816), // Dark premium navy-black
      body: Stack(
        children: [
          // Background grids
          Positioned.fill(
            child: Opacity(
              opacity: 0.05,
              child: GridPaper(
                color: const Color(0xFF00F0FF),
                divisions: 1,
                subdivisions: 1,
                interval: 40,
              ),
            ),
          ),
          // Futuristic glow orbs
          Positioned(
            left: -100,
            top: -100,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFF00F0FF).withOpacity(0.08),
                physics: const NeverScrollableScrollPhysics(),
              ),
            ),
          ),
          Positioned(
            right: -100,
            bottom: -100,
            child: Container(
              width: 350,
              height: 350,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFFC8102E).withOpacity(0.05), // Red glow
              ),
            ),
          ),
          // Main content
          Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 40),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Logo
                  const Icon(
                    Icons.language_outlined,
                    size: 80,
                    color: Color(0xFF00F0FF),
                  ),
                  const SizedBox(height: 24),
                  // Title
                  const Text(
                    'SCOUT AI',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 32,
                      fontWeight: FontWeight.black,
                      letterSpacing: 3,
                    ),
                  ),
                  const Text(
                    'SISTEMA TÁCTICO INTELIGENTE',
                    style: TextStyle(
                      color: Color(0xFF94A3B8),
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 2,
                    ),
                  ),
                  const SizedBox(height: 60),
                  // Progress Fill Bar
                  Container(
                    height: 4,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: const Color(0x1F00F0FF),
                      borderRadius: BorderRadius.circular(2),
                    ),
                    child: Align(
                      alignment: Alignment.centerLeft,
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 250),
                        height: 4,
                        width: MediaQuery.of(context).size.width * 0.8 * _progress,
                        decoration: BoxDecoration(
                          color: const Color(0xFF00F0FF),
                          borderRadius: BorderRadius.circular(2),
                          boxShadow: const [
                            BoxShadow(
                              color: Color(0xFF00F0FF),
                              blurRadius: 8,
                              spreadRadius: 1,
                            )
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  // Status text
                  Text(
                    _loadingText.toUpperCase(),
                    style: const TextStyle(
                      color: Color(0xFF00F0FF),
                      fontSize: 10,
                      fontFamily: 'monospace',
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
