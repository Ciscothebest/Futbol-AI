Created At: 2026-05-22T05:30:31Z
Completed At: 2026-05-22T05:30:31Z
File Path: `file:///c:/Users/franc/.gemini/antigravity/scratch/football-ai-platform/frontend/app.js`
Total Lines: 3113
Total Bytes: 131094
Showing lines 801 to 1600
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
801:     "Myanmar": "Myanmar National League",
802:     "Philippines": "Philippines Football League",
803:     "Cambodia": "Cambodian League",
804:     "Mongolia": "Mongolian Premier League"
805:   };
806:   return leagueMap[resolvedCountry] || "Liga Profesional";
807: }
808: 
809: function generateProceduralTeams(countryName) {
810:   const translationMap = {
811:     "angola": "Angola", "bangladés": "Bangladesh", "bangladesh": "Bangladesh",
812:     "cuba": "Cuba", "el salvador": "El Salvador", "nicaragua": "Nicaragua",
813:     "rep. dominicana": "República Dominicana", "haití": "Haití",
814:     "siria": "Siria", "jordania": "Jordania", "líbano": "Líbano",
815:     "kuwait": "Kuwait", "baréin": "Baréin", "omán": "Omán",
816:     "yemen": "Yemen", "pakistán": "Pakistán", "myanmar": "Myanmar",
817:     "filipinas": "Filipinas", "camboya": "Camboya", "mongolia": "Mongolia"
818:   };
819:   const cleanName = countryName.replace(/[^a-zA-ZáéíóúñÁÉÍÓÚÑ ]/g, '').trim();
820:   const baseName = translationMap[countryName.toLowerCase().trim()] || cleanName;
821:   
822:   let seed = 0;
823:   for (let i = 0; i < countryName.length; i++) {
824:     seed = countryName.charCodeAt(i) + ((seed << 5) - seed);
825:   }
826:   
827:   const templates = [
828:     (base) => `${base} FC`,
829:     (base) => `Atlético ${base}`,
830:     (base) => `${base} United`,
831:     (base) => `Real ${base}`,
832:     (base) => `Deportivo ${base}`,
833:     (base) => `${base} City`,
834:     (base) => `${base} Wanderers`,
835:     (base) => `Sporting
<truncated 37818 bytes>
Url}" class="player-photo" alt="${p.name}">
1558:     </div>
1559:     
1560:     <div class="tactical-info-wrap">
1561:       <div class="player-main-name">
1562:         <span class="card-flag">${p.flag}</span>
1563:         ${firstName}
1564:       </div>
1565:       <div class="player-sub-name">${lastName}</div>
1566:       
1567:       <div class="tactical-badges">
1568:         <span class="t-badge">${currentLang === 'es' ? p.positionEs : p.position}</span>
1569:       </div>
1570: 
1571:       <div class="player-rating-star">
1572:         <span class="star">⭐</span>
1573:         <span>${Number(p.overallRating).toFixed(1)}</span>
1574:       </div>
1575:     </div>
1576:     
1577:     <button class="btn-expediente">EXPEDIENTE</button>
1578:   `;
1579: 
1580:   const img = card.querySelector('.player-photo');
1581:   if (img) img.onerror = () => onAvatarError(img, p);
1582: 
1583:   card.addEventListener('click', () => openPlayerModal(p));
1584:   return card;
1585: }
1586: 
1587: // ──────────────────────────────────────────
1588: // FILTERS
1589: // ──────────────────────────────────────────
1590: function normalizeString(str) {
1591:   if (!str) return '';
1592:   return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, "").toLowerCase().trim();
1593: }
1594: 
1595: function setupFilters() {
1596:   const search = document.getElementById('search-input');
1597:   const chips = document.querySelectorAll('.filter-chips .chip');
1598:   const sortSelect = document.getElementById('sort-players');
1599:   const leagueSelect = document.getElementById('filter-league');
1600:   const teamSelect = document.getElementById('filter-team');
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
