import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';

// State Providers
import 'providers/auth_provider.dart';
import 'providers/players_provider.dart';
import 'providers/chat_provider.dart';
import 'providers/compare_provider.dart';

// Initial Screen
import 'screens/splash_screen.dart';

void main() {
  // Ensure framework services are initialized before configuring native channels
  WidgetsFlutterBinding.ensureInitialized();

  // Force portrait orientation and transparent dark overlay status bars
  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
  ]);
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light,
    systemNavigationBarColor: Color(0xFF020816),
    systemNavigationBarIconBrightness: Brightness.light,
  ));

  runApp(const FutbolAIApp());
}

class FutbolAIApp extends StatelessWidget {
  const FutbolAIApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => PlayersProvider()),
        ChangeNotifierProvider(create: (_) => ChatProvider()),
        ChangeNotifierProvider(create: (_) => CompareProvider()),
      ],
      child: MaterialApp(
        title: 'FutbolAI',
        debugShowCheckedModeBanner: false,
        themeMode: ThemeMode.dark,
        darkTheme: ThemeData(
          useMaterial3: true,
          brightness: Brightness.dark,
          scaffoldBackgroundColor: const Color(0xFF020816), // Curated deep space black
          primaryColor: const Color(0xFF00F0FF),            // Neon Cyan
          colorScheme: const ColorScheme.dark(
            primary: Color(0xFF00F0FF),
            secondary: Color(0xFFFEBE10),                   // Gold highlight
            background: Color(0xFF020816),
            surface: Color(0xFF070E1B),                     // Deep dark slate
            error: Color(0xFFEF4444),                       // Alert red
          ),
          
          // Google Fonts Inter
          textTheme: GoogleFonts.interTextTheme(
            ThemeData.dark().textTheme,
          ).copyWith(
            titleLarge: GoogleFonts.inter(fontSize: 22, fontWeight: FontWeight.black, color: Colors.white),
            bodyMedium: GoogleFonts.inter(fontSize: 13, color: Colors.white.withOpacity(0.85)),
          ),

          // Custom Input decors
          inputDecorationTheme: InputDecorationTheme(
            filled: true,
            fillColor: const Color(0xFF070E1B).withOpacity(0.5),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: Color(0x1Fffffff)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: Color(0x1Fffffff)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: Color(0xFF00F0FF), width: 1.5),
            ),
          ),

          // Dropdown / Popups theme
          dropdownMenuTheme: DropdownMenuThemeData(
            menuStyle: MenuStyle(
              backgroundColor: MaterialStateProperty.all(const Color(0xFF0B1426)),
            ),
          ),
        ),
        home: const SplashScreen(),
      ),
    );
  }
}
