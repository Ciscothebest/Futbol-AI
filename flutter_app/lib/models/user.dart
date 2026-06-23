class User {
  final String id;
  final String username;
  final String nombres;
  final String apellidos;
  final String email;
  final String telefono;
  final String role;
  final String avatarUrl;
  final bool onboardingComplete;
  final String? selectedCountry;
  final String? selectedClub;
  final String? preferredFormation;
  final String? preferredStyle;
  final String selectedTier;

  User({
    required this.id,
    required this.username,
    required this.nombres,
    required this.apellidos,
    required this.email,
    required this.telefono,
    required this.role,
    required this.avatarUrl,
    required this.onboardingComplete,
    this.selectedCountry,
    this.selectedClub,
    this.preferredFormation,
    this.preferredStyle,
    required this.selectedTier,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id']?.toString() ?? '',
      username: json['username'] ?? '',
      nombres: json['nombres'] ?? '',
      apellidos: json['apellidos'] ?? '',
      email: json['email'] ?? '',
      telefono: json['telefono'] ?? '',
      role: json['role'] ?? 'user',
      avatarUrl: json['avatarUrl'] ?? '',
      onboardingComplete: json['onboardingComplete'] == true || json['onboardingComplete'] == 1,
      selectedCountry: json['selectedCountry']?.toString(),
      selectedClub: json['selectedClub']?.toString(),
      preferredFormation: json['preferredFormation']?.toString(),
      preferredStyle: json['preferredStyle']?.toString(),
      selectedTier: json['selectedTier'] ?? 'Gratis',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'nombres': nombres,
      'apellidos': apellidos,
      'email': email,
      'telefono': telefono,
      'role': role,
      'avatarUrl': avatarUrl,
      'onboardingComplete': onboardingComplete,
      'selectedCountry': selectedCountry,
      'selectedClub': selectedClub,
      'preferredFormation': preferredFormation,
      'preferredStyle': preferredStyle,
      'selectedTier': selectedTier,
    };
  }

  User copyWith({
    String? nombres,
    String? apellidos,
    String? email,
    String? telefono,
    String? avatarUrl,
    bool? onboardingComplete,
    String? selectedCountry,
    String? selectedClub,
    String? preferredFormation,
    String? preferredStyle,
    String? selectedTier,
  }) {
    return User(
      id: id,
      username: username,
      nombres: nombres ?? this.nombres,
      apellidos: apellidos ?? this.apellidos,
      email: email ?? this.email,
      telefono: telefono ?? this.telefono,
      role: role,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      onboardingComplete: onboardingComplete ?? this.onboardingComplete,
      selectedCountry: selectedCountry ?? this.selectedCountry,
      selectedClub: selectedClub ?? this.selectedClub,
      preferredFormation: preferredFormation ?? this.preferredFormation,
      preferredStyle: preferredStyle ?? this.preferredStyle,
      selectedTier: selectedTier ?? this.selectedTier,
    );
  }
}
