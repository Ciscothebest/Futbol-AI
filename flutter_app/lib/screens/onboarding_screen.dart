import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../widgets/glass_card.dart';
import '../services/api_service.dart';
import 'dashboard_screen.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({Key? key}) : super(key: key);

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final ApiService _apiService = ApiService();
  int _currentStep = 1; // Step 1: Leagues/Countries, Step 2: Club, Step 3: Subscription Tier

  // Selection states
  String _selectedCountry = '';
  String _selectedClub = '';
  String _selectedTier = 'Gratis';
  String _selectedFormation = '4-3-3';
  String _selectedStyle = 'tikitaka';

  // API loaded lists
  List<dynamic> _countries = [];
  List<dynamic> _clubs = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadStep1Data();
  }

  Future<void> _loadStep1Data() async {
    setState(() => _isLoading = true);
    try {
      final list = await _apiService.getOnboardingLeagues();
      setState(() {
        _countries = list;
      });
    } catch (_) {
      // Offline fallback
      setState(() {
        _countries = [
          {'id': 1, 'country': 'España', 'name': 'La Liga', 'flagIso': 'es'},
          {'id': 2, 'country': 'Reino Unido', 'name': 'Premier League', 'flagIso': 'gb'},
          {'id': 3, 'country': 'Alemania', 'name': 'Bundesliga', 'flagIso': 'de'},
          {'id': 5, 'country': 'Italia', 'name': 'Serie A', 'flagIso': 'it'},
          {'id': 4, 'country': 'Francia', 'name': 'Ligue 1', 'flagIso': 'fr'},
          {'id': 14, 'country': 'EE.UU. / Canadá', 'name': 'MLS', 'flagIso': 'us'},
          {'id': 17, 'country': 'Arabia Saudita', 'name': 'Saudi Pro League', 'flagIso': 'sa'},
        ];
      });
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _loadStep2Clubs(String country) async {
    setState(() => _isLoading = true);
    try {
      final list = await _apiService.getOnboardingTeams(country: country);
      setState(() {
        _clubs = list;
      });
    } catch (_) {
      // Mock data if server is offline or doesn't resolve
      setState(() {
        if (country == 'España') {
          _clubs = [
            {'name': 'Real Madrid'}, {'name': 'FC Barcelona'}, {'name': 'Atlético de Madrid'},
            {'name': 'Sevilla FC'}, {'name': 'Valencia CF'}, {'name': 'Real Sociedad'},
            {'name': 'Athletic Club'}, {'name': 'Real Betis'}, {'name': 'Girona FC'}
          ];
        } else if (country == 'Reino Unido') {
          _clubs = [
            {'name': 'Manchester City'}, {'name': 'Arsenal'}, {'name': 'Liverpool'},
            {'name': 'Chelsea'}, {'name': 'Manchester United'}, {'name': 'Tottenham Hotspur'},
            {'name': 'Aston Villa'}, {'name': 'Newcastle United'}
          ];
        } else {
          _clubs = [
            {'name': 'Bayern München'}, {'name': 'Borussia Dortmund'}, {'name': 'Bayer 04 Leverkusen'},
            {'name': 'Paris Saint-Germain'}, {'name': 'Juventus'}, {'name': 'AC Milan'}, {'name': 'Inter Milan'}
          ];
        }
      });
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _finishOnboarding() async {
    setState(() => _isLoading = true);
    final auth = Provider.of<AuthProvider>(context, listen: false);
    try {
      await auth.completeOnboarding(
        selectedCountry: _selectedCountry,
        selectedClub: _selectedClub,
        preferredFormation: _selectedFormation,
        preferredStyle: _selectedStyle,
        selectedTier: _selectedTier,
      );
      if (mounted) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const DashboardScreen()),
        );
      }
    } catch (_) {
      // If error, force local routing for smoothness
      final mockUser = auth.user?.copyWith(
        onboardingComplete: true,
        selectedCountry: _selectedCountry,
        selectedClub: _selectedClub,
        preferredFormation: _selectedFormation,
        preferredStyle: _selectedStyle,
        selectedTier: _selectedTier,
      );
      if (mockUser != null) {
        await auth.updateLocalUser(mockUser);
        if (mounted) {
          Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (_) => const DashboardScreen()));
        }
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF020816),
      body: Stack(
        children: [
          // Tactical grids
          Positioned.fill(
            child: Opacity(
              opacity: 0.04,
              child: GridPaper(
                color: const Color(0xFF00F0FF),
                divisions: 1,
                subdivisions: 1,
                interval: 40,
              ),
            ),
          ),
          Positioned(
            left: -150,
            top: -150,
            child: Container(
              width: 350,
              height: 350,
              decoration: BoxDecoration(shape: BoxShape.circle, color: const Color(0xFF00F0FF).withOpacity(0.06)),
            ),
          ),

          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Onboarding custom header HUD
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'SCOUT AI · ONBOARDING',
                        style: TextStyle(
                          color: Color(0xFF00F0FF),
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1,
                        ),
                      ),
                      Text(
                        'Paso $_currentStep de 3',
                        style: const TextStyle(
                          color: Color(0xFF94A3B8),
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  // Progress indicator steps
                  Row(
                    children: [
                      Expanded(child: Container(height: 3, color: _currentStep >= 1 ? const Color(0xFF00F0FF) : const Color(0x3Bffffff))),
                      const SizedBox(width: 8),
                      Expanded(child: Container(height: 3, color: _currentStep >= 2 ? const Color(0xFF00F0FF) : const Color(0x3Bffffff))),
                      const SizedBox(width: 8),
                      Expanded(child: Container(height: 3, color: _currentStep >= 3 ? const Color(0xFF00F0FF) : const Color(0x3Bffffff))),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Main Steps Renders
                  Expanded(
                    child: _isLoading
                        ? const Center(child: CircularProgressIndicator(color: Color(0xFF00F0FF)))
                        : _buildStepView(),
                  ),

                  // Bottom Controls HUD bar
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      if (_currentStep > 1)
                        OutlinedButton(
                          onPressed: () {
                            setState(() {
                              _currentStep--;
                            });
                          },
                          style: OutlinedButton.styleFrom(
                            foregroundColor: Colors.white,
                            side: const BorderSide(color: Color(0x3Bffffff)),
                            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                          ),
                          child: const Text('← Atrás'),
                        )
                      else
                        const SizedBox(),
                      ElevatedButton(
                        onPressed: _canContinue() ? _handleContinue : null,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF00F0FF),
                          foregroundColor: Colors.black,
                          disabledBackgroundColor: const Color(0x1F00F0FF),
                          disabledForegroundColor: Colors.white24,
                          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                        ),
                        child: Text(
                          _currentStep == 3 ? 'Comenzar →' : 'Continuar →',
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStepView() {
    switch (_currentStep) {
      case 1:
        return _buildStep1();
      case 2:
        return _buildStep2();
      case 3:
        return _buildStep3();
      default:
        return const SizedBox();
    }
  }

  bool _canContinue() {
    if (_currentStep == 1) return _selectedCountry.isNotEmpty;
    if (_currentStep == 2) return _selectedClub.isNotEmpty;
    return true; // Step 3 tier selection always default to Gratis
  }

  void _handleContinue() {
    if (_currentStep == 1) {
      _loadStep2Clubs(_selectedCountry);
      setState(() {
        _currentStep = 2;
      });
    } else if (_currentStep == 2) {
      setState(() {
        _currentStep = 3;
      });
    } else {
      _finishOnboarding();
    }
  }

  // ─── STEP 1: COUNTRY/LEAGUE SELECTOR ───
  Widget _buildStep1() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Text(
          '¿Qué país quieres explorar?',
          style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.black),
        ),
        const SizedBox(height: 4),
        const Text(
          'Selecciona el país con la liga profesional que más te interesa auditar.',
          style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
        ),
        const SizedBox(height: 20),
        Expanded(
          child: ListView.builder(
            itemCount: _countries.length,
            itemBuilder: (context, idx) {
              final country = _countries[idx];
              final name = country['country'] ?? '';
              final leagueName = country['name'] ?? '';
              final flagIso = country['flagIso'] ?? 'es';
              final isSelected = _selectedCountry == name;

              final dbToFileMap = {
                1: 31, 2: 55, 3: 7, 4: 44, 5: 67, 7: 17, 8: 6, 10: 39,
                11: 36, 12: 59, 13: 60, 14: 47, 15: 25, 17: 66, 18: 73, 19: 56,
                20: 19, 21: 69, 22: 1, 24: 14, 26: 70, 27: 24, 28: 43, 29: 35,
                30: 37, 32: 12, 33: 61, 35: 2, 36: 74, 37: 16, 38: 71, 39: 8,
                40: 54, 41: 38, 44: 23, 47: 15, 48: 78, 50: 63, 51: 28, 52: 64,
                55: 79, 56: 34, 59: 11, 60: 72, 61: 22, 62: 46, 63: 48, 64: 10,
                65: 62, 68: 45, 69: 77, 74: 51, 76: 52, 77: 4, 78: 50, 79: 53,
                80: 9, 81: 49
              };
              final dbId = country['id'] ?? 1;
              final fileId = dbToFileMap[dbId];

              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: GestureDetector(
                  onTap: () {
                    setState(() {
                      _selectedCountry = name;
                    });
                  },
                  child: GlassCard(
                    borderColor: isSelected ? const Color(0xFF00F0FF) : const Color(0x1A00F0FF),
                    borderWidth: isSelected ? 2.0 : 1.0,
                    opacity: isSelected ? 0.16 : 0.06,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    child: Row(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(4),
                          child: fileId != null
                              ? Image.network(
                                  '${_apiService.baseUrl.replaceAll('/api', '')}/assets/leagues/liga_$fileId.png',
                                  width: 34,
                                  height: 24,
                                  fit: BoxFit.contain,
                                  errorBuilder: (_, __, ___) => Image.network(
                                    'https://flagcdn.com/w40/$flagIso.png',
                                    width: 34,
                                    height: 24,
                                    fit: BoxFit.cover,
                                    errorBuilder: (_, __, ___) => const Icon(Icons.flag, color: Colors.white24),
                                  ),
                                )
                              : Image.network(
                                  'https://flagcdn.com/w40/$flagIso.png',
                                  width: 34,
                                  height: 24,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) => const Icon(Icons.flag, color: Colors.white24),
                                ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(name, style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold)),
                              const SizedBox(height: 2),
                              Text(leagueName, style: const TextStyle(color: Color(0xFF00F0FF), fontSize: 11, fontWeight: FontWeight.w600)),
                            ],
                          ),
                        ),
                        if (isSelected)
                          const Icon(Icons.check_circle, color: Color(0xFF00F0FF), size: 20),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  // ─── STEP 2: CLUB SELECTOR ───
  Widget _buildStep2() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          '¿Cuál es tu club en $_selectedCountry?',
          style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.black),
        ),
        const SizedBox(height: 4),
        const Text(
          'Selecciona tu equipo predilecto para cargar la alineación táctica inicial.',
          style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
        ),
        const SizedBox(height: 20),
        Expanded(
          child: GridView.builder(
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 1.4,
            ),
            itemCount: _clubs.length,
            itemBuilder: (context, idx) {
              final club = _clubs[idx];
              final name = club['name'] ?? '';
              final isSelected = _selectedClub == name;

              return GestureDetector(
                onTap: () {
                  setState(() {
                    _selectedClub = name;
                  });
                },
                child: GlassCard(
                  borderColor: isSelected ? const Color(0xFFFEBE10) : const Color(0x1Fffffff), // Gold selection borders
                  borderWidth: isSelected ? 2.0 : 1.0,
                  opacity: isSelected ? 0.16 : 0.06,
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Procedural letters shield icon
                      Container(
                        width: 32,
                        height: 32,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: isSelected ? const Color(0x26FEBE10) : const Color(0x1Fffffff),
                        ),
                        child: Center(
                          child: Text(
                            name.substring(0, 2).toUpperCase(),
                            style: TextStyle(
                              color: isSelected ? const Color(0xFFFEBE10) : Colors.white60,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        name,
                        textAlign: TextAlign.center,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  // ─── STEP 3: SUBSCRIPTION TIERS ───
  Widget _buildStep3() {
    final List<Map<String, String>> tiers = [
      {'name': 'Gratis', 'icon': '🎯', 'desc': 'Acceso básico a tácticas, alineaciones y análisis de rendimiento.'},
      {'name': 'Pro', 'icon': '🔍', 'desc': 'Descubre y evalúa talento local e internacional con IA.'},
      {'name': 'Plus', 'icon': '📊', 'desc': 'Métricas avanzadas, heatmaps y estadísticas comparativas.'},
      {'name': 'Enterprise', 'icon': '🤝', 'desc': 'Gestiona perfiles de jugadores y oportunidades de mercado.'},
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Text(
          '¿Cuál es tu plan de Scout?',
          style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.black),
        ),
        const SizedBox(height: 4),
        const Text(
          'Tu experiencia de scouting táctico se adaptará según tu suscripción elegida.',
          style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
        ),
        const SizedBox(height: 20),
        Expanded(
          child: ListView.builder(
            itemCount: tiers.length,
            itemBuilder: (context, idx) {
              final tier = tiers[idx];
              final name = tier['name']!;
              final icon = tier['icon']!;
              final desc = tier['desc']!;
              final isSelected = _selectedTier == name;
              final isPremium = name != 'Gratis';

              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: GestureDetector(
                  onTap: () {
                    if (isPremium) {
                      // Prompt warning modal exactly like frontend premium tier locked alerts
                      _showPremiumLockAlert(name);
                    } else {
                      setState(() {
                        _selectedTier = name;
                      });
                    }
                  },
                  child: GlassCard(
                    borderColor: isSelected ? const Color(0xFF00F0FF) : const Color(0x1Fffffff),
                    borderWidth: isSelected ? 2.0 : 1.0,
                    opacity: isSelected ? 0.16 : 0.05,
                    padding: const EdgeInsets.all(16),
                    child: Opacity(
                      opacity: isPremium ? 0.7 : 1.0,
                      child: Row(
                        children: [
                          Text(icon, style: const TextStyle(fontSize: 32)),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Text(
                                      name,
                                      style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                                    ),
                                    if (isPremium) ...[
                                      const SizedBox(width: 8),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: name == 'Plus' ? const Color(0x3BFEBE10) : const Color(0x3B00F0FF),
                                          borderRadius: BorderRadius.circular(10),
                                        ),
                                        child: Text(
                                          name == 'Plus' ? 'ELITE' : 'PREMIUM',
                                          style: TextStyle(
                                            color: name == 'Plus' ? const Color(0xFFFEBE10) : const Color(0xFF00F0FF),
                                            fontSize: 8,
                                            fontWeight: FontWeight.black,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Text(desc, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11, height: 1.3)),
                              ],
                            ),
                          ),
                          if (isPremium)
                            const Icon(Icons.lock_outline, color: Colors.white38, size: 18)
                          else if (isSelected)
                            const Icon(Icons.check_circle, color: Color(0xFF00F0FF), size: 20),
                        ],
                      ),
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  void _showPremiumLockAlert(String tierName) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          backgroundColor: const Color(0xFF0F172A),
          title: Row(
            children: [
              const Text('🔒 ', style: TextStyle(fontSize: 20)),
              Text('Plan $tierName bloqueado', style: const TextStyle(color: Colors.white)),
            ],
          ),
          content: Text(
            'El acceso al nivel $tierName está bloqueado temporalmente hasta que se confirme tu pasarela de pago o suscripción.\n\nPor ahora, continuaremos con el plan básico "Gratis".',
            style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13, height: 1.4),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Entendido', style: TextStyle(color: Color(0xFF00F0FF), fontWeight: FontWeight.bold)),
            ),
          ],
        );
      },
    );
  }
}
