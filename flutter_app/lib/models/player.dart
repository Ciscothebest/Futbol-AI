import 'dart:convert';

class Player {
  final String id;
  final String name;
  final String? photoId;
  final String? nickname;
  final int age;
  final String nationality;
  final String nationalityEs;
  final String? flag;
  final String position;
  final String positionEs;
  final String currentTeam;
  final String league;
  final String country;
  final int? jerseyNumber;
  final int? height;
  final int? weight;
  final String? preferredFoot;
  final int marketValue;
  final double overallRating;
  final Map<String, dynamic> stats;
  final Map<String, dynamic> careerTotals;
  final List<dynamic> trophies;
  final List<dynamic> transfers;
  final String? bio;
  final String? bioEs;
  final List<dynamic> strengths;
  final List<dynamic> tags;
  final List<dynamic> history;
  final String avatarUrl;

  Player({
    required this.id,
    required this.name,
    this.photoId,
    this.nickname,
    required this.age,
    required this.nationality,
    required this.nationalityEs,
    this.flag,
    required this.position,
    required this.positionEs,
    required this.currentTeam,
    required this.league,
    required this.country,
    this.jerseyNumber,
    this.height,
    this.weight,
    this.preferredFoot,
    required this.marketValue,
    required this.overallRating,
    required this.stats,
    required this.careerTotals,
    required this.trophies,
    required this.transfers,
    this.bio,
    this.bioEs,
    required this.strengths,
    required this.tags,
    required this.history,
    required this.avatarUrl,
  });

  factory Player.fromJson(Map<String, dynamic> json) {
    // Helper to safely parse JSON dynamic fields
    Map<String, dynamic> parseJsonMap(dynamic val) {
      if (val == null) return {};
      if (val is Map<String, dynamic>) return val;
      if (val is String) {
        try {
          return jsonDecode(val) as Map<String, dynamic>;
        } catch (_) {}
      }
      return {};
    }

    List<dynamic> parseJsonList(dynamic val) {
      if (val == null) return [];
      if (val is List) return val;
      if (val is String) {
        try {
          return jsonDecode(val) as List<dynamic>;
        } catch (_) {}
      }
      return [];
    }

    return Player(
      id: json['id']?.toString() ?? '',
      name: json['name'] ?? '',
      photoId: json['photoId']?.toString(),
      nickname: json['nickname'],
      age: json['age'] is int ? json['age'] : (int.tryParse(json['age']?.toString() ?? '') ?? 0),
      nationality: json['nationality'] ?? '',
      nationalityEs: json['nationalityEs'] ?? '',
      flag: json['flag'],
      position: json['position'] ?? '',
      positionEs: json['positionEs'] ?? '',
      currentTeam: json['currentTeam'] ?? '',
      league: json['league'] ?? '',
      country: json['country'] ?? '',
      jerseyNumber: json['jerseyNumber'] is int ? json['jerseyNumber'] : int.tryParse(json['jerseyNumber']?.toString() ?? ''),
      height: json['height'] is int ? json['height'] : int.tryParse(json['height']?.toString() ?? ''),
      weight: json['weight'] is int ? json['weight'] : int.tryParse(json['weight']?.toString() ?? ''),
      preferredFoot: json['preferredFoot'],
      marketValue: json['marketValue'] is int 
          ? json['marketValue'] 
          : (int.tryParse(json['marketValue']?.toString() ?? '') ?? 0),
      overallRating: json['overallRating'] is num 
          ? (json['overallRating'] as num).toDouble() 
          : (double.tryParse(json['overallRating']?.toString() ?? '') ?? 0.0),
      stats: parseJsonMap(json['stats']),
      careerTotals: parseJsonMap(json['careerTotals']),
      trophies: parseJsonList(json['trophies']),
      transfers: parseJsonList(json['transfers']),
      bio: json['bio'],
      bioEs: json['bioEs'],
      strengths: parseJsonList(json['strengths']),
      tags: parseJsonList(json['tags']),
      history: parseJsonList(json['history']),
      avatarUrl: json['avatarUrl'] ?? 'https://api.dicebear.com/9.x/notionists/svg?seed=${Uri.encodeComponent(json['name'] ?? 'Player')}&backgroundColor=0d1117&radius=50',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'photoId': photoId,
      'nickname': nickname,
      'age': age,
      'nationality': nationality,
      'nationalityEs': nationalityEs,
      'flag': flag,
      'position': position,
      'positionEs': positionEs,
      'currentTeam': currentTeam,
      'league': league,
      'country': country,
      'jerseyNumber': jerseyNumber,
      'height': height,
      'weight': weight,
      'preferredFoot': preferredFoot,
      'marketValue': marketValue,
      'overallRating': overallRating,
      'stats': stats,
      'careerTotals': careerTotals,
      'trophies': trophies,
      'transfers': transfers,
      'bio': bio,
      'bioEs': bioEs,
      'strengths': strengths,
      'tags': tags,
      'history': history,
      'avatarUrl': avatarUrl,
    };
  }
}
