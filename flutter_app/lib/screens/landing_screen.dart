import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../widgets/glass_card.dart';
import 'onboarding_screen.dart';
import 'dashboard_screen.dart';

class LandingScreen extends StatefulWidget {
  const LandingScreen({Key? key}) : super(key: key);

  @override
  State<LandingScreen> createState() => _LandingScreenState();
}

class _LandingScreenState extends State<LandingScreen> {
  bool _showLoginForm = false;
  bool _showRegisterForm = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF020816), // Dark tactical background
      body: Stack(
        children: [
          // Background Grid & Orbs
          Positioned.fill(
            child: Opacity(
              opacity: 0.04,
              child: GridPaper(
                color: const Color(0xFF00F0FF),
                divisions: 1,
                subdivisions: 1,
                interval: 30,
              ),
            ),
          ),
          Positioned(
            left: -150,
            top: -150,
            child: Container(
              width: 400,
              height: 400,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFF00F0FF).withOpacity(0.08),
              ),
            ),
          ),
          Positioned(
            right: -100,
            bottom: -50,
            child: Container(
              width: 350,
              height: 350,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFFC8102E).withOpacity(0.04), // Red glow
              ),
            ),
          ),

          // Main Hero Inner Layout
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // App Brand Nav
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.language_outlined, color: Color(0xFF00F0FF), size: 20),
                      const SizedBox(width: 8),
                      Text(
                        'SCOUT AI · SISTEMA TÁCTICO',
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.9),
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 2,
                        ),
                      ),
                    ],
                  ),
                  const Spacer(),

                  // Hero Headers
                  const Text(
                    'EL NUEVO ESTÁNDAR\nDEL SCOUTING\nTÁCTICO',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 34,
                      height: 1.15,
                      fontWeight: FontWeight.black,
                      letterSpacing: 1,
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Analiza jugadores, compara perfiles y consulta decisiones tácticas con inteligencia artificial.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: Color(0xFF94A3B8),
                      fontSize: 14,
                      height: 1.4,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 40),

                  // Interactive Dashboard Mock HUD
                  Expanded(
                    flex: 2,
                    child: Center(
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0x1F00F0FF),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0x3B00F0FF), width: 1.0),
                        ),
                        child: Opacity(
                          opacity: 0.8,
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    'VALORACIÓN TÁCTICA',
                                    style: TextStyle(color: Color(0xFF00F0FF), fontSize: 8, fontWeight: FontWeight.bold),
                                  ),
                                  Text(
                                    'GEMINI ACTIVE',
                                    style: TextStyle(color: Color(0xFFFEBE10), fontSize: 8, fontWeight: FontWeight.bold),
                                  ),
                                ],
                              ),
                              const Divider(color: Color(0x1Affffff)),
                              Expanded(
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                                  children: [
                                    _buildMiniBar('DEF', 0.4, const Color(0xFF00F0FF)),
                                    _buildMiniBar('ATA', 0.8, const Color(0xFFFEBE10)),
                                    _buildMiniBar('FIS', 0.6, const Color(0xFF00F0FF)),
                                    _buildMiniBar('TEC', 0.9, const Color(0xFFFEBE10)),
                                    _buildMiniBar('MEN', 0.7, const Color(0xFF00F0FF)),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                  const Spacer(),

                  // Bottom Buttons triggers
                  Row(
                    children: [
                      Expanded(
                        child: Container(
                          height: 52,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(26),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFF00F0FF).withOpacity(0.15),
                                blurRadius: 10,
                                spreadRadius: 1,
                              )
                            ],
                          ),
                          child: ElevatedButton(
                            onPressed: () {
                              setState(() {
                                _showRegisterForm = true;
                              });
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF00F0FF),
                              foregroundColor: Colors.black,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(26)),
                              elevation: 0,
                            ),
                            child: const Text(
                              'Registrarse ↗',
                              style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () {
                            setState(() {
                              _showLoginForm = true;
                            });
                          },
                          style: OutlinedButton.styleFrom(
                            foregroundColor: Colors.white,
                            side: const BorderSide(color: Color(0x3B00F0FF), width: 1.5),
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(26)),
                          ),
                          child: const Text(
                            'Iniciar sesión ▶',
                            style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),

          // Modal Forms Overlays
          if (_showLoginForm)
            _LoginFormOverlay(
              onClose: () => setState(() => _showLoginForm = false),
              onSwitch: () {
                setState(() {
                  _showLoginForm = false;
                  _showRegisterForm = true;
                });
              },
            ),

          if (_showRegisterForm)
            _RegisterFormOverlay(
              onClose: () => setState(() => _showRegisterForm = false),
              onSwitch: () {
                setState(() {
                  _showRegisterForm = false;
                  _showLoginForm = true;
                });
              },
            ),
        ],
      ),
    );
  }

  Widget _buildMiniBar(String label, double val, Color color) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Expanded(
          child: Container(
            width: 8,
            decoration: BoxDecoration(color: const Color(0x1Fffffff), borderRadius: BorderRadius.circular(4)),
            child: Align(
              alignment: Alignment.bottomCenter,
              child: FractionallySizedBox(
                heightFactor: val,
                child: Container(
                  decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(4)),
                ),
              ),
            ),
          ),
        ),
        const SizedBox(height: 4),
        Text(label, style: const TextStyle(color: Colors.white54, fontSize: 8, fontWeight: FontWeight.bold)),
      ],
    );
  }
}

// ─── LOGIN MODAL OVERLAY ───
class _LoginFormOverlay extends StatefulWidget {
  final VoidCallback onClose;
  final VoidCallback onSwitch;

  const _LoginFormOverlay({required this.onClose, required this.onSwitch});

  @override
  State<_LoginFormOverlay> createState() => _LoginFormOverlayState();
}

class _LoginFormOverlayState extends State<_LoginFormOverlay> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  String _errorText = '';
  bool _isLoading = false;

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _isLoading = true;
      _errorText = '';
    });

    final auth = Provider.of<AuthProvider>(context, listen: false);
    try {
      await auth.login(_usernameController.text, _passwordController.text);
      if (mounted) {
        final user = auth.user!;
        if (user.onboardingComplete) {
          Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (_) => const DashboardScreen()));
        } else {
          Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (_) => const OnboardingScreen()));
        }
      }
    } catch (e) {
      setState(() {
        _errorText = e.toString().replaceAll('Exception:', '').trim();
      });
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Positioned.fill(
      child: Container(
        color: Colors.black.withOpacity(0.7),
        padding: const EdgeInsets.symmetric(horizontal: 24),
        child: Center(
          child: SingleChildScrollView(
            child: GlassCard(
              borderColor: const Color(0x4D00F0FF),
              padding: const EdgeInsets.all(24),
              child: Form(
                key: _formKey,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Iniciar Sesión',
                          style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                        IconButton(
                          onPressed: widget.onClose,
                          icon: const Icon(Icons.close, color: Colors.white54),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    // Username input
                    TextFormField(
                      controller: _usernameController,
                      style: const TextStyle(color: Colors.white),
                      decoration: _inputDecoration('Nombre de usuario', 'Ej: scout_pro'),
                      validator: (value) => value == null || value.trim().isEmpty ? 'Ingresa tu usuario' : null,
                    ),
                    const SizedBox(height: 16),
                    // Password input
                    TextFormField(
                      controller: _passwordController,
                      obscureText: true,
                      style: const TextStyle(color: Colors.white),
                      decoration: _inputDecoration('Contraseña', 'Tu contraseña'),
                      validator: (value) => value == null || value.trim().isEmpty ? 'Ingresa tu contraseña' : null,
                    ),
                    const SizedBox(height: 16),
                    if (_errorText.isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: Text(
                          _errorText,
                          textAlign: TextAlign.center,
                          style: const TextStyle(color: Color(0xFFEF4444), fontSize: 12, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ElevatedButton(
                      onPressed: _isLoading ? null : _submit,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF00F0FF),
                        foregroundColor: Colors.black,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      child: _isLoading
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black))
                          : const Text('Entrar al Sistema', style: TextStyle(fontWeight: FontWeight.bold)),
                    ),
                    const SizedBox(height: 16),
                    GestureDetector(
                      onTap: widget.onSwitch,
                      child: const Text(
                        '¿No tienes cuenta? Regístrate gratis',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: Color(0xFF00F0FF), fontSize: 12, decoration: TextDecoration.underline),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  InputDecoration _inputDecoration(String label, String hint) {
    return InputDecoration(
      labelText: label,
      labelStyle: const TextStyle(color: Colors.white60),
      hintText: hint,
      hintStyle: const TextStyle(color: Colors.white24, fontSize: 13),
      filled: true,
      fillColor: Colors.black.withOpacity(0.3),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0x1Fffffff))),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0x1Fffffff))),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFF00F0FF))),
    );
  }
}

// ─── REGISTER MODAL OVERLAY ───
class _RegisterFormOverlay extends StatefulWidget {
  final VoidCallback onClose;
  final VoidCallback onSwitch;

  const _RegisterFormOverlay({required this.onClose, required this.onSwitch});

  @override
  State<_RegisterFormOverlay> createState() => _RegisterFormOverlayState();
}

class _RegisterFormOverlayState extends State<_RegisterFormOverlay> {
  final _formKey = GlobalKey<FormState>();
  final _nombresController = TextEditingController();
  final _apellidosController = TextEditingController();
  final _telefonoController = TextEditingController();
  final _emailController = TextEditingController();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  
  String _errorText = '';
  String _phoneHelper = '';
  bool _isLoading = false;

  // Prefixes matching Node.js server.js exactly
  static const Map<String, Map<String, dynamic>> _phonePrefixes = {
    '+34': {'country': 'España', 'lengths': [9], 'template': 'XXX XXX XXX'},
    '+54': {'country': 'Argentina', 'lengths': [10, 11]},
    '+56': {'country': 'Chile', 'lengths': [9], 'template': 'X XXXX XXXX'},
    '+57': {'country': 'Colombia', 'lengths': [10], 'template': 'XXX XXX XXXX'},
    '+52': {'country': 'México', 'lengths': [10], 'template': 'XXX XXX XXXX'},
    '+58': {'country': 'Venezuela', 'lengths': [10], 'template': 'XXX XXX XXXX'},
    '+51': {'country': 'Perú', 'lengths': [9], 'template': 'XXX XXX XXX'},
    '+593': {'country': 'Ecuador', 'lengths': [9], 'template': 'X XXXX XXXX'},
    '+598': {'country': 'Uruguay', 'lengths': [8, 9]},
    '+591': {'country': 'Bolivia', 'lengths': [8], 'template': 'XXX XXX XX'},
    '+595': {'country': 'Paraguay', 'lengths': [9], 'template': 'XXX XXX XXX'},
    '+507': {'country': 'Panamá', 'lengths': [7, 8]},
    '+506': {'country': 'Costa Rica', 'lengths': [8], 'template': 'XXXX XXXX'},
    '+55': {'country': 'Brasil', 'lengths': [10, 11]},
    '+1': {'country': 'EE.UU. / Canadá', 'lengths': [10], 'template': 'XXX XXX XXXX'},
    '+44': {'country': 'Reino Unido', 'lengths': [10], 'template': 'XXX XXX XXXX'},
    '+33': {'country': 'Francia', 'lengths': [9], 'template': 'X XX XX XX XX'},
    '+39': {'country': 'Italia', 'lengths': [9, 10]},
    '+49': {'country': 'Alemania', 'lengths': [10, 11]},
    '+351': {'country': 'Portugal', 'lengths': [9], 'template': 'XXX XXX XXX'},
  };

  @override
  void initState() {
    super.initState();
    _telefonoController.addListener(_onPhoneChanged);
  }

  @override
  void dispose() {
    _telefonoController.removeListener(_onPhoneChanged);
    _nombresController.dispose();
    _apellidosController.dispose();
    _telefonoController.dispose();
    _emailController.dispose();
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  // Suggests structures dynamically as the user types
  void _onPhoneChanged() {
    final rawVal = _telefonoController.text.trim();
    if (rawVal.isEmpty) {
      setState(() => _phoneHelper = '');
      return;
    }
    if (!rawVal.startsWith('+')) {
      setState(() => _phoneHelper = 'Debe iniciar con "+" (ej: +34)');
      return;
    }

    final sortedKeys = _phonePrefixes.keys.toList()..sort((a, b) => b.length.compareTo(a.length));
    String? matchedPrefix;
    for (var prefix in sortedKeys) {
      if (rawVal.startsWith(prefix)) {
        matchedPrefix = prefix;
        break;
      }
    }

    if (matchedPrefix != null) {
      final config = _phonePrefixes[matchedPrefix]!;
      final lengths = config['lengths'] as List<int>;
      final country = config['country'] as String;

      final rest = rawVal.substring(matchedPrefix.length).replaceAll(' ', '');
      final digits = rest.replaceAll(RegExp(r'\D'), '');

      final bool isValidLength = lengths.contains(digits.length);
      if (!isValidLength) {
        setState(() {
          _phoneHelper = '[$country] Requiere ${lengths.join(" o ")} dígitos después de $matchedPrefix';
        });
        return;
      }

      // Generate suggested format matching backend's template expectation
      String template = '';
      if (config['template'] != null) {
        template = config['template'];
      } else {
        // Fallback for multi-length configurations
        template = digits.length == 10 ? 'XX XXXX XXXX' : 'XX XXXXX XXXX';
      }

      String suggested = '';
      int dIdx = 0;
      for (int i = 0; i < template.length; i++) {
        if (dIdx >= digits.length) break;
        if (template[i] == 'X') {
          suggested += digits[dIdx];
          dIdx++;
        } else {
          suggested += template[i];
        }
      }
      final perfectFormat = '$matchedPrefix $suggested';
      if (rawVal == perfectFormat) {
        setState(() => _phoneHelper = '✅ [$country] Estructura válida');
      } else {
        setState(() {
          _phoneHelper = '💡 Formato sugerido: $perfectFormat';
        });
      }
    } else {
      final digits = rawVal.replaceAll(RegExp(r'\D'), '');
      if (digits.length < 7 || digits.length > 15) {
        setState(() => _phoneHelper = 'Dígitos inválidos (requiere entre 7 y 15)');
      } else {
        setState(() => _phoneHelper = 'Estructura internacional genérica');
      }
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    
    setState(() {
      _isLoading = true;
      _errorText = '';
    });

    final auth = Provider.of<AuthProvider>(context, listen: false);
    try {
      await auth.register(
        username: _usernameController.text,
        password: _passwordController.text,
        nombres: _nombresController.text,
        apellidos: _apellidosController.text,
        telefono: _telefonoController.text,
        email: _emailController.text,
      );

      // Auto login on successful register
      await auth.login(_usernameController.text, _passwordController.text);

      if (mounted) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const OnboardingScreen()),
        );
      }
    } catch (e) {
      setState(() {
        _errorText = e.toString().replaceAll('Exception:', '').trim();
      });
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Positioned.fill(
      child: Container(
        color: Colors.black.withOpacity(0.7),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        child: Center(
          child: SingleChildScrollView(
            child: GlassCard(
              borderColor: const Color(0x4D00F0FF),
              padding: const EdgeInsets.all(24),
              child: Form(
                key: _formKey,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Crear Cuenta',
                          style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                        IconButton(
                          onPressed: widget.onClose,
                          icon: const Icon(Icons.close, color: Colors.white54),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    // Nombres & Apellidos side-by-side
                    Row(
                      children: [
                        Expanded(
                          child: TextFormField(
                            controller: _nombresController,
                            style: const TextStyle(color: Colors.white, fontSize: 13),
                            decoration: _inputDecoration('Nombre(s)', 'Juan'),
                            validator: (value) => value == null || value.trim().isEmpty ? 'Requerido' : null,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: TextFormField(
                            controller: _apellidosController,
                            style: const TextStyle(color: Colors.white, fontSize: 13),
                            decoration: _inputDecoration('Apellidos', 'Pérez'),
                            validator: (value) => value == null || value.trim().isEmpty ? 'Requerido' : null,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    // Telefono input
                    TextFormField(
                      controller: _telefonoController,
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                      keyboardType: TextInputType.phone,
                      decoration: _inputDecoration('Teléfono', 'Ej: +34 600 000 000'),
                      validator: (value) => value == null || value.trim().isEmpty ? 'Ingresa tu teléfono' : null,
                    ),
                    if (_phoneHelper.isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.only(top: 4, left: 4),
                        child: Text(
                          _phoneHelper,
                          style: TextStyle(
                            color: _phoneHelper.contains('✅') ? const Color(0xFF00F0FF) : const Color(0xFF94A3B8),
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    const SizedBox(height: 12),
                    // Email
                    TextFormField(
                      controller: _emailController,
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                      keyboardType: TextInputType.emailAddress,
                      decoration: _inputDecoration('Correo Electrónico', 'juan@example.com'),
                      validator: (value) => value == null || value.trim().isEmpty ? 'Ingresa tu correo' : null,
                    ),
                    const SizedBox(height: 12),
                    // Username
                    TextFormField(
                      controller: _usernameController,
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                      decoration: _inputDecoration('Nombre de usuario', 'scout_pro'),
                      validator: (value) => value == null || value.trim().isEmpty ? 'Ingresa un usuario' : null,
                    ),
                    const SizedBox(height: 12),
                    // Password
                    TextFormField(
                      controller: _passwordController,
                      obscureText: true,
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                      decoration: _inputDecoration('Contraseña (mín 8 chars)', 'Min. 8 caracteres'),
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) return 'Ingresa una contraseña';
                        if (value.length < 8) return 'Debe tener al menos 8 caracteres';
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    if (_errorText.isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: Text(
                          _errorText,
                          textAlign: TextAlign.center,
                          style: const TextStyle(color: Color(0xFFEF4444), fontSize: 12, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ElevatedButton(
                      onPressed: _isLoading ? null : _submit,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF00F0FF),
                        foregroundColor: Colors.black,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      child: _isLoading
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black))
                          : const Text('Registrarse Ahora', style: TextStyle(fontWeight: FontWeight.bold)),
                    ),
                    const SizedBox(height: 16),
                    GestureDetector(
                      onTap: widget.onSwitch,
                      child: const Text(
                        '¿Ya tienes cuenta? Inicia sesión',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: Color(0xFF00F0FF), fontSize: 12, decoration: TextDecoration.underline),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  InputDecoration _inputDecoration(String label, String hint) {
    return InputDecoration(
      labelText: label,
      labelStyle: const TextStyle(color: Colors.white60, fontSize: 12),
      hintText: hint,
      hintStyle: const TextStyle(color: Colors.white24, fontSize: 11),
      filled: true,
      fillColor: Colors.black.withOpacity(0.3),
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0x1Fffffff))),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0x1Fffffff))),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFF00F0FF))),
    );
  }
}
