import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/player.dart';
import '../services/api_service.dart';

class PlayersProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  List<Player> _players = [];
  bool _isLoading = false;
  String _searchQuery = '';
  String _selectedLeague = '';
  String _selectedTeam = '';
  String _selectedPosition = ''; // LW, RW, CM, ST, fav, etc.
  String _sortBy = 'name_asc'; // name_asc, name_desc, salary_desc, salary_asc, contract_asc, contract_desc
  
  // Pagination
  int _currentPage = 0;
  final int _pageSize = 30;
  int _totalPlayersCount = 0;
  
  // Favorites Cache
  Set<String> _favoriteIds = {};
  
  // Dropdown options
  List<dynamic> _leagues = [];
  List<dynamic> _teams = [];

  List<Player> get players => _players;
  bool get isLoading => _isLoading;
  String get searchQuery => _searchQuery;
  String get selectedLeague => _selectedLeague;
  String get selectedTeam => _selectedTeam;
  String get selectedPosition => _selectedPosition;
  String get sortBy => _sortBy;
  int get currentPage => _currentPage;
  int get pageSize => _pageSize;
  int get totalPlayersCount => _totalPlayersCount;
  Set<String> get favoriteIds => _favoriteIds;
  List<dynamic> get leagues => _leagues;
  List<dynamic> get teams => _teams;

  // Filtered lists for simple localized computations (e.g. Featured players)
  List<Player> get featuredPlayers {
    final elite = _players.where((p) => p.overallRating >= 88).toList();
    if (elite.isNotEmpty) return elite.take(6).toList();
    return _players.take(6).toList();
  }

  PlayersProvider() {
    _loadFavorites();
  }

  // Load favorite player IDs from local storage
  Future<void> _loadFavorites() async {
    final prefs = await SharedPreferences.getInstance();
    final favList = prefs.getStringList('scout_ai_favorites') ?? [];
    _favoriteIds = favList.toSet();
    notifyListeners();
  }

  // Toggle favorite status of a player
  Future<void> toggleFavorite(Player player) async {
    final id = player.id;
    final isFav = _favoriteIds.contains(id);
    
    if (isFav) {
      _favoriteIds.remove(id);
      await _apiService.logFavorite(id, 'remove');
    } else {
      _favoriteIds.add(id);
      await _apiService.logFavorite(id, 'add');
    }
    
    final prefs = await SharedPreferences.getInstance();
    await prefs.setStringList('scout_ai_favorites', _favoriteIds.toList());
    
    // If we are on the "Favorites" tab, refresh the view
    if (_selectedPosition == 'fav') {
      loadPlayers();
    } else {
      notifyListeners();
    }
  }

  // Check if player is favorited
  bool isFavorite(String id) => _favoriteIds.contains(id);

  // Set Search Query
  void setSearchQuery(String query) {
    _searchQuery = query;
    _currentPage = 0;
    loadPlayers();
  }

  // Set filters
  void setLeague(String league) {
    _selectedLeague = league;
    _selectedTeam = ''; // Clear team when changing league
    _currentPage = 0;
    loadPlayers();
    loadLeagueTeams(league);
  }

  void setTeam(String team) {
    _selectedTeam = team;
    _currentPage = 0;
    loadPlayers();
  }

  void setPosition(String position) {
    _selectedPosition = position;
    _currentPage = 0;
    loadPlayers();
  }

  void setSorting(String sort) {
    _sortBy = sort;
    _currentPage = 0;
    loadPlayers();
  }

  void clearFilters() {
    _searchQuery = '';
    _selectedLeague = '';
    _selectedTeam = '';
    _selectedPosition = '';
    _sortBy = 'name_asc';
    _currentPage = 0;
    loadPlayers();
  }

  // Pagination navigation
  void nextPage() {
    if ((_currentPage + 1) * _pageSize < _totalPlayersCount) {
      _currentPage++;
      loadPlayers();
    }
  }

  void prevPage() {
    if (_currentPage > 0) {
      _currentPage--;
      loadPlayers();
    }
  }

  // Fetch lists of leagues for filtering dropdown
  Future<void> loadLeaguesFilter() async {
    try {
      final res = await _apiService.getOnboardingLeagues();
      _leagues = res;
      notifyListeners();
    } catch (_) {}
  }

  // Fetch teams of a selected league
  Future<void> loadLeagueTeams(String leagueCountry) async {
    if (leagueCountry.isEmpty) {
      _teams = [];
      notifyListeners();
      return;
    }
    try {
      final res = await _apiService.getOnboardingTeams(country: leagueCountry);
      _teams = res;
      notifyListeners();
    } catch (_) {}
  }

  // ─── LOAD PLAYERS ───────────────────────────────────────────────
  Future<void> loadPlayers() async {
    _isLoading = true;
    notifyListeners();
    
    try {
      // If position filter is "fav" (Favorites), load favorites locally and mock a filtered fetch or pass specific IDs
      if (_selectedPosition == 'fav') {
        final allRes = await _apiService.getPlayers(
          search: _searchQuery,
          league: _selectedLeague,
          team: _selectedTeam,
        );
        
        final List<dynamic> playersJson = allRes['players'] ?? [];
        List<Player> temp = playersJson.map((p) => Player.fromJson(p)).toList();
        
        // Filter by favorites only
        temp = temp.where((p) => _favoriteIds.contains(p.id)).toList();
        
        // Local sorting since we filter locally
        _sortLocalList(temp);
        
        _totalPlayersCount = temp.length;
        
        // Paginate locally
        final startIdx = _currentPage * _pageSize;
        if (startIdx >= temp.length) {
          _players = [];
        } else {
          _players = temp.skip(startIdx).take(_pageSize).toList();
        }
      } else {
        // Standard remote fetch with parameters
        final res = await _apiService.getPlayers(
          search: _searchQuery,
          league: _selectedLeague,
          position: _selectedPosition.isNotEmpty ? _selectedPosition : null,
          team: _selectedTeam.isNotEmpty ? _selectedTeam : null,
        );

        final List<dynamic> playersJson = res['players'] ?? [];
        List<Player> temp = playersJson.map((p) => Player.fromJson(p)).toList();

        // Remote overall sort or local sort
        _sortLocalList(temp);

        _totalPlayersCount = temp.length;
        
        // Paginate locally
        final startIdx = _currentPage * _pageSize;
        if (startIdx >= temp.length) {
          _players = [];
        } else {
          _players = temp.skip(startIdx).take(_pageSize).toList();
        }
      }
    } catch (_) {
      _players = [];
      _totalPlayersCount = 0;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Apply chosen sorting layout
  void _sortLocalList(List<Player> list) {
    if (_sortBy == 'name_asc') {
      list.sort((a, b) => a.name.toLowerCase().compareTo(b.name.toLowerCase()));
    } else if (_sortBy == 'name_desc') {
      list.sort((a, b) => b.name.toLowerCase().compareTo(a.name.toLowerCase()));
    } else if (_sortBy == 'salary_desc') {
      list.sort((a, b) {
        final aVal = a.stats['salary'] is num ? (a.stats['salary'] as num).toInt() : 0;
        final bVal = b.stats['salary'] is num ? (b.stats['salary'] as num).toInt() : 0;
        return bVal.compareTo(aVal);
      });
    } else if (_sortBy == 'salary_asc') {
      list.sort((a, b) {
        final aVal = a.stats['salary'] is num ? (a.stats['salary'] as num).toInt() : 0;
        final bVal = b.stats['salary'] is num ? (b.stats['salary'] as num).toInt() : 0;
        return aVal.compareTo(bVal);
      });
    } else if (_sortBy == 'contract_asc') {
      list.sort((a, b) {
        final aVal = a.stats['contractEnd'] is num ? (a.stats['contractEnd'] as num).toInt() : 9999;
        final bVal = b.stats['contractEnd'] is num ? (b.stats['contractEnd'] as num).toInt() : 9999;
        return aVal.compareTo(bVal);
      });
    } else if (_sortBy == 'contract_desc') {
      list.sort((a, b) {
        final aVal = a.stats['contractEnd'] is num ? (a.stats['contractEnd'] as num).toInt() : 0;
        final bVal = b.stats['contractEnd'] is num ? (b.stats['contractEnd'] as num).toInt() : 0;
        return bVal.compareTo(aVal);
      });
    }
  }
}
