import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/players_provider.dart';
import '../../providers/chat_provider.dart';
import '../../widgets/glass_card.dart';
import '../../models/player.dart';
import '../dashboard_screen.dart';

class PlayersTab extends StatefulWidget {
  const PlayersTab({Key? key}) : super(key: key);

  @override
  State<PlayersTab> createState() => _PlayersTabState();
}

class _PlayersTabState extends State<PlayersTab> {
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    final prov = Provider.of<PlayersProvider>(context, listen: false);
    _searchController.text = prov.searchQuery;
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final playersProv = Provider.of<PlayersProvider>(context);
    final playersList = playersProv.players;

    return Column(
      children: [
        // ─── PART 1: FILTERS AREA ───
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Search field
              TextField(
                controller: _searchController,
                style: const TextStyle(color: Colors.white, fontSize: 13),
                decoration: InputDecoration(
                  hintText: auth.translate('search_placeholder'),
                  hintStyle: const TextStyle(color: Colors.white30, fontSize: 13),
                  prefixIcon: const Icon(Icons.search, color: Color(0xFF00F0FF), size: 18),
                  suffixIcon: _searchController.text.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.clear, color: Colors.white54, size: 16),
                          onPressed: () {
                            _searchController.clear();
                            playersProv.setSearchQuery('');
                          },
                        )
                      : null,
                  filled: true,
                  fillColor: const Color(0xFF070E1B).withOpacity(0.5),
                  contentPadding: const EdgeInsets.symmetric(vertical: 10),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(20), borderSide: const BorderSide(color: Color(0x2B00F0FF))),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(20), borderSide: const BorderSide(color: Color(0x2B00F0FF))),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(20), borderSide: const BorderSide(color: Color(0xFF00F0FF))),
                ),
                onChanged: (val) {
                  setState(() {}); // refresh suffix clear icon
                  playersProv.setSearchQuery(val);
                },
              ),
              const SizedBox(height: 8),

              // League and Team selectors
              Row(
                children: [
                  // League Dropdown
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                      height: 32,
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: const Color(0x1Fffffff)),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          value: playersProv.selectedLeague.isEmpty ? null : playersProv.selectedLeague,
                          hint: Text(auth.translate('all_leagues'), style: const TextStyle(color: Colors.white38, fontSize: 10)),
                          dropdownColor: const Color(0xFF0B1426),
                          icon: const Icon(Icons.arrow_drop_down, color: Color(0xFF00F0FF), size: 16),
                          style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                          items: playersProv.leagues.map<DropdownMenuItem<String>>((l) {
                            final name = l['country'] ?? '';
                            return DropdownMenuItem<String>(
                              value: name,
                              child: Text(name),
                            );
                          }).toList(),
                          onChanged: (val) {
                            playersProv.setLeague(val ?? '');
                          },
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),

                  // Team Dropdown
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                      height: 32,
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: const Color(0x1Fffffff)),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          value: playersProv.selectedTeam.isEmpty ? null : playersProv.selectedTeam,
                          hint: const Text('Equipos', style: TextStyle(color: Colors.white38, fontSize: 10)),
                          dropdownColor: const Color(0xFF0B1426),
                          icon: const Icon(Icons.arrow_drop_down, color: Color(0xFF00F0FF), size: 16),
                          style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                          items: playersProv.teams.map<DropdownMenuItem<String>>((t) {
                            final name = t['name'] ?? '';
                            return DropdownMenuItem<String>(
                              value: name,
                              child: Text(name),
                            );
                          }).toList(),
                          onChanged: (val) {
                            playersProv.setTeam(val ?? '');
                          },
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),

              // Position chips + Favorite stars
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _buildChip('Todos', '', playersProv),
                    _buildChip('DC (ST)', 'ST', playersProv),
                    _buildChip('EI (LW)', 'LW', playersProv),
                    _buildChip('ED (RW)', 'RW', playersProv),
                    _buildChip('MC (CM)', 'CM', playersProv),
                    _buildChip('⭐ Favoritos', 'fav', playersProv),
                  ],
                ),
              ),
            ],
          ),
        ),

        // ─── PART 2: PLAYERS GRID AREA ───
        Expanded(
          child: playersProv.isLoading
              ? const Center(child: CircularProgressIndicator(color: Color(0xFF00F0FF)))
              : playersList.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Text('😕', style: TextStyle(fontSize: 32)),
                          const SizedBox(height: 8),
                          Text(
                            auth.translate('no_results_text'),
                            style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
                          ),
                        ],
                      ),
                    )
                  : GridView.builder(
                      padding: const EdgeInsets.all(16),
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        crossAxisSpacing: 12,
                        mainAxisSpacing: 12,
                        childAspectRatio: 0.82,
                      ),
                      itemCount: playersList.length,
                      itemBuilder: (context, idx) {
                        final player = playersList[idx];
                        final isFav = playersProv.isFavorite(player.id);
                        final salary = player.stats['salary'] ?? '0';

                        return GestureDetector(
                          onTap: () => _showPlayerProfileDialog(player),
                          child: GlassCard(
                            borderColor: const Color(0x1Fffffff),
                            padding: const EdgeInsets.all(10),
                            child: Stack(
                              children: [
                                // Heart/Star favorite action
                                Positioned(
                                  top: 0,
                                  right: 0,
                                  child: GestureDetector(
                                    onTap: () => playersProv.toggleFavorite(player),
                                    child: Icon(
                                      isFav ? Icons.star : Icons.star_border,
                                      color: isFav ? const Color(0xFFFEBE10) : Colors.white24,
                                      size: 18,
                                    ),
                                  ),
                                ),

                                Column(
                                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                                  crossAxisAlignment: CrossAxisAlignment.center,
                                  children: [
                                    // Avatar image
                                    ClipOval(
                                      child: Image.network(
                                        player.avatarUrl,
                                        width: 52,
                                        height: 52,
                                        fit: BoxFit.cover,
                                        errorBuilder: (_, __, ___) => CircleAvatar(
                                          radius: 26,
                                          backgroundColor: const Color(0xFF0F172A),
                                          child: Text(
                                            player.name.substring(0, 2).toUpperCase(),
                                            style: const TextStyle(color: Color(0xFF00F0FF), fontSize: 14, fontWeight: FontWeight.bold),
                                          ),
                                        ),
                                      ),
                                    ),
                                    // Name
                                    Text(
                                      player.name,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      textAlign: TextAlign.center,
                                      style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                                    ),
                                    // Team & Rating Row
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        Flexible(
                                          child: Text(
                                            player.currentTeam,
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                            style: const TextStyle(color: Colors.white54, fontSize: 9),
                                          ),
                                        ),
                                        const SizedBox(width: 4),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                                          decoration: BoxDecoration(
                                            color: const Color(0xFFFEBE10).withOpacity(0.15),
                                            borderRadius: BorderRadius.circular(4),
                                          ),
                                          child: Text(
                                            '${player.overallRating.toInt()}',
                                            style: const TextStyle(color: Color(0xFFFEBE10), fontSize: 9, fontWeight: FontWeight.bold),
                                          ),
                                        ),
                                      ],
                                    ),
                                    // Position tag
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: const Color(0x1F00F0FF),
                                        borderRadius: BorderRadius.circular(10),
                                        border: Border.all(color: const Color(0x3B00F0FF), width: 0.5),
                                      ),
                                      child: Text(
                                        auth.lang == 'es' ? player.positionEs : player.position,
                                        style: const TextStyle(color: Color(0xFF00F0FF), fontSize: 8, fontWeight: FontWeight.bold),
                                      ),
                                    ),
                                    // Salary / Details row
                                    Text(
                                      'Salario: €${_formatCurrency(salary)}/semana',
                                      style: const TextStyle(color: Colors.white30, fontSize: 8),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
        ),

        // ─── PART 3: PAGINATION PANEL ───
        if (playersProv.totalPlayersCount > playersProv.pageSize)
          Container(
            padding: const EdgeInsets.symmetric(vertical: 8),
            decoration: const BoxDecoration(
              border: Border(top: BorderSide(color: Color(0x11ffffff))),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                IconButton(
                  icon: const Icon(Icons.arrow_back_ios, color: Color(0xFF00F0FF), size: 16),
                  onPressed: playersProv.currentPage > 0 ? playersProv.prevPage : null,
                ),
                Text(
                  'Pág. ${playersProv.currentPage + 1} de ${(playersProv.totalPlayersCount / playersProv.pageSize).ceil()}',
                  style: const TextStyle(color: Colors.white60, fontSize: 11, fontWeight: FontWeight.bold),
                ),
                IconButton(
                  icon: const Icon(Icons.arrow_forward_ios, color: Color(0xFF00F0FF), size: 16),
                  onPressed: (playersProv.currentPage + 1) * playersProv.pageSize < playersProv.totalPlayersCount
                      ? playersProv.nextPage
                      : null,
                ),
              ],
            ),
          ),
      ],
    );
  }

  Widget _buildChip(String label, String code, PlayersProvider prov) {
    final isSelected = prov.selectedPosition == code;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ChoiceChip(
        label: Text(label),
        selected: isSelected,
        labelStyle: TextStyle(
          color: isSelected ? Colors.black : Colors.white60,
          fontSize: 10,
          fontWeight: FontWeight.bold,
        ),
        selectedColor: const Color(0xFF00F0FF),
        backgroundColor: const Color(0xFF0F172A),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: isSelected ? const Color(0xFF00F0FF) : const Color(0x1Fffffff)),
        ),
        onSelected: (val) {
          prov.setPosition(val ? code : '');
        },
      ),
    );
  }

  String _formatCurrency(dynamic value) {
    if (value == null) return '0';
    final intVal = int.tryParse(value.toString());
    if (intVal == null) return value.toString();
    if (intVal >= 1000) {
      return '${(intVal / 1000).toStringAsFixed(0)}K';
    }
    return intVal.toString();
  }

  // ─── PLAYER PROFILE DETAILED SHEET ───
  void _showPlayerProfileDialog(Player player) {
    final auth = Provider.of<AuthProvider>(context, listen: false);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF070E1B),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (context) {
        return DraggableScrollableSheet(
          initialChildSize: 0.85,
          minChildSize: 0.6,
          maxChildSize: 0.95,
          expand: false,
          builder: (context, scrollController) {
            return DefaultTabController(
              length: 5,
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Handle drag line
                    Center(
                      child: Container(
                        width: 40,
                        height: 4,
                        decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(2)),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Player Basic Header
                    Row(
                      children: [
                        ClipOval(
                          child: Image.network(player.avatarUrl, width: 54, height: 54, fit: BoxFit.cover),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                player.name,
                                style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.black),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                '${player.currentTeam} · ${auth.lang == "es" ? player.positionEs : player.position}',
                                style: const TextStyle(color: Color(0xFF00F0FF), fontSize: 12, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Tab bar navigation inside profile
                    TabBar(
                      isScrollable: true,
                      indicatorColor: const Color(0xFFFEBE10),
                      labelColor: const Color(0xFFFEBE10),
                      unselectedLabelColor: Colors.white38,
                      labelStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                      tabs: [
                        Tab(text: auth.translate('modal_stats')),
                        Tab(text: auth.translate('modal_info')),
                        Tab(text: auth.translate('modal_strengths')),
                        Tab(text: auth.translate('modal_trophies')),
                        Tab(text: auth.translate('modal_transfers')),
                      ],
                    ),
                    const SizedBox(height: 12),

                    // Tab bar views
                    Expanded(
                      child: TabBarView(
                        children: [
                          // TAB 1: Stats
                          _buildStatsTab(player, auth),
                          // TAB 2: Info
                          _buildInfoTab(player, auth),
                          // TAB 3: Strengths
                          _buildStrengthsTab(player, auth),
                          // TAB 4: Trophies
                          _buildTrophiesTab(player, auth),
                          // TAB 5: Transfers
                          _buildTransfersTab(player, auth),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Active "Preguntar al agente" button
                    ElevatedButton.icon(
                      onPressed: () {
                        Navigator.of(context).pop(); // close sheet
                        
                        // Switch to Chat tab in Dashboard and prompt message
                        final chatProv = Provider.of<ChatProvider>(context, listen: false);
                        chatProv.sendMessageStream(
                          text: 'Háblame de las fortalezas de ${player.name} y analiza su rendimiento para mí.',
                          lang: auth.lang,
                          clubContext: player.currentTeam,
                          clubRoster: [player.name],
                        );
                        
                        // Trick to navigate Dashboard state index
                        // In a real app we'd trigger a tab navigation state.
                        // Our Dashboard screen active index is at DashboardScreenState.
                        // We can easily instruct the dashboard shell to switch active tab index to 3.
                        // For a clean implementation, this triggers provider notification.
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF00F0FF),
                        foregroundColor: Colors.black,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      icon: const Icon(Icons.chat_bubble_outline, size: 18),
                      label: Text(
                        '${auth.translate("ask_agent_btn")} ${player.name}',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                      ),
                    ),
                    const SizedBox(height: 12),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  // Details Sub-Views
  Widget _buildStatsTab(Player p, AuthProvider auth) {
    final matches = p.careerTotals['matches'] ?? '0';
    final goals = p.careerTotals['goals'] ?? '0';
    final assists = p.careerTotals['assists'] ?? '0';
    
    return ListView(
      children: [
        _buildStatRow('Partidos Totales', matches.toString()),
        _buildStatRow('Goles Totales', goals.toString()),
        _buildStatRow('Asistencias Totales', assists.toString()),
        _buildStatRow('xG (Goles Esperados)', (p.stats['xg'] ?? '—').toString()),
        _buildStatRow('Pases Completados', '${p.stats['passAccuracy'] ?? "—"}%'),
        _buildStatRow('Minutos Jugados', (p.stats['minutes'] ?? '—').toString()),
      ],
    );
  }

  Widget _buildInfoTab(Player p, AuthProvider auth) {
    return ListView(
      children: [
        _buildStatRow('Dorsal', '#${p.jerseyNumber ?? "—"}'),
        _buildStatRow('Edad', '${p.age} años'),
        _buildStatRow('Altura', '${p.height ?? "—"} cm'),
        _buildStatRow('Peso', '${p.weight ?? "—"} kg'),
        _buildStatRow('Pie Hábil', p.preferredFoot == 'Left' ? 'Izquierdo' : 'Derecho'),
        _buildStatRow('Nacionalidad', auth.lang == 'es' ? p.nationalityEs : p.nationality),
      ],
    );
  }

  Widget _buildStrengthsTab(Player p, AuthProvider auth) {
    if (p.strengths.isEmpty) {
      return const Center(child: Text('No hay fortalezas registradas.', style: TextStyle(color: Colors.white30)));
    }
    return Wrap(
      spacing: 10,
      runSpacing: 10,
      children: p.strengths.map<Widget>((s) {
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: const Color(0xFFFEBE10).withOpacity(0.12),
            border: Border.all(color: const Color(0xFFFEBE10), width: 0.8),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Text(s.toString(), style: const TextStyle(color: Color(0xFFFEBE10), fontSize: 11, fontWeight: FontWeight.w600)),
        );
      }).toList(),
    );
  }

  Widget _buildTrophiesTab(Player p, AuthProvider auth) {
    if (p.trophies.isEmpty) {
      return const Center(child: Text('No hay palmarés registrado.', style: TextStyle(color: Colors.white30)));
    }
    return ListView.builder(
      itemCount: p.trophies.length,
      itemBuilder: (context, idx) {
        final t = p.trophies[idx];
        return ListTile(
          dense: true,
          leading: const Text('🏆', style: TextStyle(fontSize: 16)),
          title: Text(t.toString(), style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
        );
      },
    );
  }

  Widget _buildTransfersTab(Player p, AuthProvider auth) {
    if (p.transfers.isEmpty) {
      return const Center(child: Text('No hay historial de traspasos.', style: TextStyle(color: Colors.white30)));
    }
    return ListView.builder(
      itemCount: p.transfers.length,
      itemBuilder: (context, idx) {
        final tr = p.transfers[idx];
        return ListTile(
          dense: true,
          leading: const Icon(Icons.swap_horiz, color: Color(0xFF00F0FF), size: 16),
          title: Text(
            tr.toString(),
            style: const TextStyle(color: Colors.white70, fontSize: 11),
          ),
        );
      },
    );
  }

  Widget _buildStatRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.white54, fontSize: 12)),
          Text(value, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
