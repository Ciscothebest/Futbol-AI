Created At: 2026-05-22T03:47:20Z
Completed At: 2026-05-22T03:47:20Z
File Path: `file:///c:/Users/franc/.gemini/antigravity/scratch/football-ai-platform/frontend/app.js`
Total Lines: 2193
Total Bytes: 86893
Showing lines 600 to 800
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
600:   }
601:   controls.style.display = 'flex';
602:   const prevBtn = document.getElementById('prev-page-btn');
603:   const nextBtn = document.getElementById('next-page-btn');
604:   const info = document.getElementById('page-info');
605:   
606:   if (prevBtn) {
607:     prevBtn.disabled = currentPage === 0;
608:     prevBtn.innerHTML = currentLang === 'en' ? '⬅️ Previous' : '⬅️ Anterior';
609:   }
610:   if (nextBtn) {
611:     nextBtn.disabled = currentPage >= totalPages - 1;
612:     nextBtn.innerHTML = currentLang === 'en' ? 'Next ➡️' : 'Siguiente ➡️';
613:   }
614:   if (info) {
615:     const pageWord = currentLang === 'en' ? 'Page' : 'Página';
616:     const ofWord = currentLang === 'en' ? 'of' : 'de';
617:     info.textContent = `${pageWord} ${currentPage + 1} ${ofWord} ${totalPages}`;
618:   }
619: }
620: 
621: function createPlayerCard(p) {
622:   const card = document.createElement('div');
623:   card.className = 'player-card';
624:   const color = getTeamColor(p.currentTeam);
625:   const avatarUrl = p.avatarUrl;
626: 
627:   const names = p.name.trim().split(' ');
628:   const firstName = names[0];
629:   const lastName = names.length > 1 ? names.slice(1).join(' ') : p.currentTeam;
630: 
631:   card.style.setProperty('--team-color', color);
632: 
633:   card.innerHTML = `
634:     <div class="player-avatar-tactical">
635:       <div class="neon-ring"></div>
636:       <div class="tactical-corners"></div>
637:       <img src="${avatarUrl}" class="player-photo" alt="${p.name}">
638:     </div>
639:     
640:     <div 
<truncated 4570 bytes>
wns if needed
746:   window.applyAppFilters = applyFilters;
747: }
748: 
749: function getEstimatedContract(p) {
750:   const seed = p.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
751:   return 2025 + (seed % 6); // 2025-2030
752: }
753: 
754: function populateLeagueFilter() {
755:   const leagueSelect = document.getElementById('filter-league');
756:   if (!leagueSelect) return;
757: 
758:   const flags = {
759:     'Premier League': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
760:     'La Liga': '🇪🇸',
761:     'Bundesliga': '🇩🇪',
762:     'Serie A': '🇮🇹',
763:     'Ligue 1': '🇫🇷',
764:     'MLS': '🇺🇸',
765:     'Saudi Pro League': '🇸🇦'
766:   };
767: 
768:   const leagues = [...new Set(allPlayers.map(p => p.league).filter(Boolean))].sort();
769:   
770:   leagueSelect.innerHTML = '<option value="">🌐 Todas las ligas</option>';
771:   leagues.forEach(l => {
772:     const opt = document.createElement('option');
773:     opt.value = l;
774:     const flag = flags[l] || '⚽';
775:     opt.textContent = `${flag} ${l}`;
776:     leagueSelect.appendChild(opt);
777:   });
778: 
779:   updateTeamDropdown(''); // Populate all teams initially
780: }
781: 
782: function updateTeamDropdown(leagueFilter) {
783:   const teamSelect = document.getElementById('filter-team');
784:   if (!teamSelect) return;
785: 
786:   const teams = [...new Set(allPlayers
787:     .filter(p => !leagueFilter || p.league === leagueFilter)
788:     .map(p => p.currentTeam)
789:     .filter(Boolean))].sort();
790: 
791:   teamSelect.innerHTML = '<option value="">Todos los equipos</option>';
792:   teams.forEach(t => {
793:     const opt = document.createElement('option');
794:     opt.value = t;
795:     opt.textContent = t;
796:     teamSelect.appendChild(opt);
797:   });
798: }
799: 
800: function openPlayerModal(p) {
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
