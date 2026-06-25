let _onboardingMap = null;

function setupOnboarding() {
  const onboarding = document.getElementById('onboarding-screen');
  if (!onboarding) return;
  
  // Bloqueo total de scroll en el body
  document.body.style.overflow = 'hidden';
  document.body.style.height = '100vh';
  
  onboarding.style.display = 'flex';
  
  if (_onboardingMap) {
    _onboardingMap.remove();
    _onboardingMap = null;
  }
  
  const leagueData = {
    "Spain":                          { name: "España",           league: "La Liga",                          teams: 20 },
    "United Kingdom":                 { name: "Reino Unido",      league: "Premier League / Championship",    teams: 20 },
    "Germany":                        { name: "Alemania",         league: "Bundesliga",                       teams: 18 },
    "France":                         { name: "Francia",          league: "Ligue 1",                          teams: 18 },
    "Italy":                          { name: "Italia",           league: "Serie A",                          teams: 20 },
    "Portugal":                       { name: "Portugal",         league: "Primeira Liga",                    teams: 18 },
    "Netherlands":                    { name: "Países Bajos",     league: "Eredivisie",                       teams: 18 },
    "Brazil":                         { name: "Brasil",           league: "Brasileirão",                      teams: 20 },
    "Argentina":                      { name: "Argentina",        league: "Liga Profesional",                 teams: 28 },
    "Mexico":                         { name: "México",           league: "Liga MX",                          teams: 18 },
    "Colombia":                       { name: "Colombia",         league: "Liga BetPlay",                     teams: 20 },
    "Chile":                          { name: "Chile",            league: "Primera División",                 teams: 16 },
    "Uruguay":                        { name: "Uruguay",          league: "Primera División",                 teams: 16 },
    "United States of America":       { name: "EE.UU.",           league: "MLS",                              teams: 29 },
    "Japan":                          { name: "Japón",            league: "J1 League",                        teams: 18 },
    "South Korea":                    { name: "Corea del Sur",    league: "K League 1",                       teams: 12 },
    "Saudi Arabia":                   { name: "Arabia Saudí",     league: "Saudi Pro League",                 teams: 16 },
    "Turkey":                         { name: "Turquía",          league: "Süper Lig",                        teams: 19 },
    "Russia":                         { name: "Rusia",            league: "Premier Liga",                     teams: 16 },
    "Belgium":                        { name: "Bélgica",          league: "First Division A",                 teams: 16 },
    "Greece":                         { name: "Grecia",           league: "Super League",                     teams: 16 },
    "Australia":                      { name: "Australia",        league: "A-League",                         teams: 12 },
    "Morocco":                        { name: "Marruecos",        league: "Botola Pro",                       teams: 16 },
    "Egypt":                          { name: "Egipto",           league: "Egyptian Premier League",          teams: 18 },
    "South Africa":                   { name: "Sudáfrica",        league: "PSL",                              teams: 16 },
    "China":                          { name: "China",            league: "Super League",                     teams: 16 },
    "India":                          { name: "India",            league: "ISL",                              teams: 12 },
    "Ecuador":                        { name: "Ecuador",          league: "LigaPro",                          teams: 16 },
    "Peru":                           { name: "Perú",             league: "Liga 1",                           teams: 18 },
    "Venezuela":                      { name: "Venezuela",        league: "Liga FUTVE",                       teams: 18 },
    "Bolivia":                        { name: "Bolivia",          league: "División Profesional",             teams: 14 },
    "Paraguay":                       { name: "Paraguay",         league: "División de Honor",                teams: 12 },
    "Costa Rica":                     { name: "Costa Rica",       league: "Primera División",                 teams: 12 },
    "Honduras":                       { name: "Honduras",         league: "Liga Nacional",                    teams: 10 },
    "Sweden":                         { name: "Suecia",           league: "Allsvenskan",                      teams: 16 },
    "Denmark":                        { name: "Dinamarca",        league: "Superliga",                        teams: 14 },
    "Norway":                         { name: "Noruega",          league: "Eliteserien",                      teams: 16 },
    "Switzerland":                    { name: "Suiza",            league: "Super League",                     teams: 10 },
    "Austria":                        { name: "Austria",          league: "Bundesliga",                       teams: 12 },
    "Ukraine":                        { name: "Ucrania",          league: "Premier League",                   teams: 16 },
    "Romania":                        { name: "Rumanía",          league: "Liga I",                           teams: 16 },
    "Serbia":                         { name: "Serbia",           league: "SuperLiga",                        teams: 16 },
    "Republic of Serbia":             { name: "Serbia",           league: "SuperLiga",                        teams: 16 },
    "Croatia":                        { name: "Croacia",          league: "HNL",                              teams: 10 },
    "Czechia":                        { name: "Rep. Checa",       league: "Fortuna Liga",                     teams: 16 },
    "Czech Republic":                 { name: "Rep. Checa",       league: "Fortuna Liga",                     teams: 16 },
    "Poland":                         { name: "Polonia",          league: "Ekstraklasa",                      teams: 18 },
    "Trinidad and Tobago":            { name: "Trinidad y Tobago",league: "TT Pro League",                    teams: 8  },
    "Bosnia and Herzegovina":         { name: "Bosnia y Herz.",   league: "Premier Liga BiH",                 teams: 12 },
    "North Macedonia":                { name: "Macedonia del N.", league: "Prva Liga",                        teams: 10 },
    "Albania":                        { name: "Albania",          league: "Kategoria Superiore",              teams: 10 },
    "Slovenia":                       { name: "Eslovenia",        league: "PrvaLiga",                         teams: 10 },
    "Belarus":                        { name: "Bielorrusia",      league: "Vysheyshaya Liga",                 teams: 16 },
    "Kazakhstan":                     { name: "Kazajistán",       league: "Kazakhstan Premier League",        teams: 12 },
    "Uzbekistan":                     { name: "Uzbekistán",       league: "Uzbekistan Super League",          teams: 16 },
    "Libya":                          { name: "Libia",            league: "Libyan Premier League",            teams: 16 },
    "Sudan":                          { name: "Sudán",            league: "Sudan Premier League",             teams: 18 },
    "Ethiopia":                       { name: "Etiopía",          league: "Ethiopian Premier League",         teams: 16 },
    "Zimbabwe":                       { name: "Zimbabue",         league: "Castle Lager Premier Soccer League", teams: 16 },
    "Zambia":                         { name: "Zambia",           league: "Super League of Zambia",           teams: 16 },
    "Angola":                         { name: "Angola",           league: "Girabola",                         teams: 16 },
    "Democratic Republic of the Congo":{ name: "R.D. Congo",      league: "Linafoot",                         teams: 16 },
    "Mozambique":                     { name: "Mozambique",       league: "Moçambola",                        teams: 14 },
    "Cuba":                           { name: "Cuba",             league: "Campeonato Nacional",              teams: 12 },
    "El Salvador":                    { name: "El Salvador",      league: "Primera División",                 teams: 10 },
    "Nicaragua":                      { name: "Nicaragua",        league: "Liga Primera",                     teams: 10 },
    "Dominican Republic":             { name: "Rep. Dominicana",  league: "LDF",                              teams: 8  },
    "Haiti":                          { name: "Haití",            league: "Ligue Haïtienne",                  teams: 8  },
    "Syria":                          { name: "Siria",            league: "Syrian Premier League",            teams: 14 },
    "Jordan":                         { name: "Jordania",         league: "Jordan Pro League",                teams: 12 },
    "Lebanon":                        { name: "Líbano",           league: "Lebanese Premier League",          teams: 8  },
    "Kuwait":                         { name: "Kuwait",           league: "Kuwait Premier League",            teams: 10 },
    "Bahrain":                        { name: "Baréin",           league: "Bahrain Premier League",           teams: 8  },
    "Oman":                           { name: "Omán",             league: "Oman Professional League",         teams: 12 },
    "Yemen":                          { name: "Yemen",            league: "Yemen League",                     teams: 12 },
    "Pakistan":                       { name: "Pakistán",         league: "Pakistan Premier Football League", teams: 8  },
    "Bangladesh":                     { name: "Bangladés",        league: "Bangladesh Premier League",        teams: 13 },
    "Myanmar":                        { name: "Myanmar",          league: "Myanmar National League",          teams: 8  },
    "Philippines":                    { name: "Filipinas",        league: "Philippines Football League",      teams: 8  },
    "Cambodia":                       { name: "Camboya",          league: "Cambodian League",                 teams: 10 },
    "Mongolia":                       { name: "Mongolia",         league: "Mongolian Premier League",         teams: 8  },
  };

  function getCountryName(props) {
    return props.ADMIN || props.NAME_LONG || props.NAME || props.name || '';
  }

  const tooltip = document.getElementById('tooltip');
  const ttName = document.getElementById('tt-name');
  const ttInfo = document.getElementById('tt-info');
  const continueBtn = document.getElementById('btn-onboarding-continue');
  const chipsContainer = document.getElementById('chips-container');
  const emptyHint = document.getElementById('chip-empty');
  const footerHint = document.getElementById('footer-hint');

  let selectedCountries = [];
  let tooltipCountryKey = null;
  let geoJsonLayer = null;
  let tooltipHideTimer = null;

  const isMobileDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0 && window.innerWidth <= 1024);

  const map = L.map('map', {
    center: [20, 0],
    zoom: isMobileDevice ? 1.5 : 2,
    minZoom: isMobileDevice ? 1 : 2,   // Allow zoom-in/out on mobile only
    maxZoom: isMobileDevice ? 4 : 2,
    dragging: false,                   // Disable dragging on both to avoid conflicts
    scrollWheelZoom: false,
    doubleClickZoom: false,
    boxZoom: false,
    keyboard: false,
    touchZoom: isMobileDevice,
    zoomControl: false,                // We use custom zoom controls fixed to the container on mobile
    attributionControl: false,
    worldCopyJump: false,
  });
  _onboardingMap = map;

  if (isMobileDevice) {
    const wrapper = document.getElementById('map-scroll-wrapper');
    if (wrapper) {
      wrapper.classList.add('mobile-scroll-active');
    }
    const container = document.getElementById('onboarding-step1-container');
    if (container) {
      container.classList.add('has-custom-zoom');
    }
  }

  // Configurar listeners de botones de zoom personalizados para móvil
  const btnZoomIn = document.getElementById('btn-custom-zoom-in');
  const btnZoomOut = document.getElementById('btn-custom-zoom-out');
  if (btnZoomIn && btnZoomOut) {
    btnZoomIn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      map.zoomIn();
    });
    btnZoomOut.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      map.zoomOut();
    });
  }

  // Forzar redibujado cuando el contenedor ya tiene sus dimensiones CSS definitivas
  setTimeout(() => { map.invalidateSize({ animate: false }); }, 200);

  function getStyle(feature) {
    const name = getCountryName(feature.properties);
    const hasLeague = !!leagueData[name];
    const isSelected = selectedCountries.includes(name);

    if (isSelected) {
      return { fillColor: '#00f0ff', fillOpacity: 0.6, color: '#00f0ff', weight: 2, opacity: 1 };
    } else if (hasLeague) {
      return { fillColor: '#00f0ff', fillOpacity: 0.2, color: '#00f0ff', weight: 1, opacity: 0.6 };
    } else {
      return { fillColor: '#1e293b', fillOpacity: 0.5, color: 'rgba(255,255,255,0.1)', weight: 0.5, opacity: 0.3 };
    }
  }

  function showTooltip(e, countryKey) {
    const data = leagueData[countryKey];
    tooltipCountryKey = countryKey;
    ttName.textContent = data.name;
    ttInfo.textContent = `${data.league} · ${data.teams} equipos`;

    const mapContainer = document.getElementById('map');
    const rect = mapContainer.getBoundingClientRect();
    let x, y;
    if (e.latlng && _onboardingMap) {
      const containerPoint = _onboardingMap.latLngToContainerPoint(e.latlng);
      x = containerPoint.x + 14;
      y = containerPoint.y - 80;
    } else {
      const orig = e.originalEvent;
      let clientX = orig.clientX;
      let clientY = orig.clientY;
      if (orig && orig.touches && orig.touches.length > 0) {
        clientX = orig.touches[0].clientX;
        clientY = orig.touches[0].clientY;
      }
      x = (clientX || 0) - rect.left + 14;
      y = (clientY || 0) - rect.top - 80;
    }

    if (x + 230 > rect.width) x = x - 244;
    if (y < 0) y = y + 94;

    tooltip.style.left = x + 'px';
    tooltip.style.top = y + 'px';
    tooltip.classList.add('visible');
  }

  function updateUI() {
    const footer = document.querySelector('.onboarding-footer-hud.floating');
    chipsContainer.innerHTML = '';

    if (selectedCountries.length > 0) {
      selectedCountries.forEach(name => {
        const data = leagueData[name];
        const chip = document.createElement('div');
        chip.className = 'chip';
        chip.innerHTML = `${data.name} <span class="remove" onclick="removeCountry('${name}')">×</span>`;
        chipsContainer.appendChild(chip);
      });
      footerHint.textContent = `${selectedCountries.length} ligas seleccionadas`;
      continueBtn.disabled = false;
      if (footer) footer.classList.add('visible');
    } else {
      chipsContainer.innerHTML = '<span id="chip-empty" class="chip-empty">Ningún país seleccionado</span>';
      footerHint.textContent = 'Toca un país con liga profesional';
      continueBtn.disabled = true;
      if (footer) footer.classList.remove('visible');
    }
  }

  window.removeCountry = (name) => {
    selectedCountries = selectedCountries.filter(c => c !== name);
    updateUI();
    if (geoJsonLayer) geoJsonLayer.eachLayer(l => geoJsonLayer.resetStyle(l));
  };

  window.selectCountry = () => {
    if (!tooltipCountryKey) return;
    if (!selectedCountries.includes(tooltipCountryKey)) {
      selectedCountries.push(tooltipCountryKey);
    }
    tooltip.classList.remove('visible');
    updateUI();
    if (geoJsonLayer) geoJsonLayer.eachLayer(l => geoJsonLayer.resetStyle(l));
  };

  // ── MULTI-STEP FLOW HANDLERS ────────────────────────────────────────────────
  let currentStep = 1;
  let selectedClub = null;
  let selectedTier = null;

  const step1Container = document.getElementById('onboarding-step1-container');
  const step2Container = document.getElementById('onboarding-step2-container');
  const step3Container = document.getElementById('onboarding-step3-container');
  
  const stepText = document.getElementById('onboarding-step-text');
  const stepTitle = document.getElementById('onboarding-header-title');
  const stepSubtitle = document.getElementById('onboarding-header-subtitle');
  
  const dotStep1 = document.getElementById('dot-step-1');
  const dotStep2 = document.getElementById('dot-step-2');
  const dotStep3 = document.getElementById('dot-step-3');

  const clubThemes = {
    // La Liga
    "Real Madrid": { short: "RMA", colors: ["#ffffff", "#e5c158"] },
    "FC Barcelona": { short: "FCB", colors: ["#004d98", "#a50044"] },
    "Atlético de Madrid": { short: "ATM", colors: ["#cb3524", "#ffffff"] },
    "Sevilla FC": { short: "SFC", colors: ["#d11b24", "#ffffff"] },
    "Valencia CF": { short: "VCF", colors: ["#ff7b00", "#111111"] },
    "Villarreal CF": { short: "VLF", colors: ["#ffe600", "#00529f"] },
    "Athletic Club": { short: "ATH", colors: ["#ee2524", "#ffffff"] },
    "Real Sociedad": { short: "RSO", colors: ["#005ca4", "#ffffff"] },
    "Real Betis": { short: "RBT", colors: ["#00954c", "#ffffff"] },
    "Celta Vigo": { short: "CEL", colors: ["#87bde9", "#ffffff"] },
    "Rayo Vallecano": { short: "RVM", colors: ["#ee2524", "#ffffff"] },
    "Girona FC": { short: "GIR", colors: ["#ee2524", "#ffffff"] },
    "UD Las Palmas": { short: "LPA", colors: ["#ffe600", "#005ca4"] },
    "RCD Mallorca": { short: "MAL", colors: ["#ee2524", "#111111"] },
    "Getafe CF": { short: "GET", colors: ["#005ca4", "#ffffff"] },
    "CD Leganés": { short: "LEG", colors: ["#005ca4", "#ffffff"] },
    "RCD Espanyol": { short: "ESP", colors: ["#007bc4", "#ffffff"] },
    "Deportivo Alavés": { short: "ALA", colors: ["#005ca4", "#ffffff"] },
    "Real Valladolid": { short: "VLD", colors: ["#6f287e", "#ffffff"] },
    "Osasuna": { short: "OSA", colors: ["#9c1221", "#004d98"] },

    // Premier League
    "Manchester City": { short: "MCI", colors: ["#6cabdd", "#ffffff"] },
    "Arsenal": { short: "ARS", colors: ["#ef0107", "#ffffff"] },
    "Liverpool": { short: "LIV", colors: ["#c8102e", "#f6eb61"] },
    "Chelsea": { short: "CHE", colors: ["#034694", "#ee242c"] },
    "Manchester United": { short: "MUN", colors: ["#da291c", "#ffe500"] },
    "Tottenham Hotspur": { short: "TOT", colors: ["#132257", "#ffffff"] },
    "Newcastle United": { short: "NEW", colors: ["#111111", "#ffffff"] },
    "Aston Villa": { short: "AVL", colors: ["#95bfe5", "#670e36"] },

    // Serie A
    "Inter Milan": { short: "INT", colors: ["#001489", "#111111"] },
    "AC Milan": { short: "ACM", colors: ["#e32221", "#111111"] },
    "Juventus": { short: "JUV", colors: ["#111111", "#ffffff"] },
    "Napoli": { short: "NAP", colors: ["#12a0d7", "#ffffff"] },
    "Atalanta": { short: "ATA", colors: ["#007bc4", "#111111"] },
    "AS Roma": { short: "ROM", colors: ["#8e1f2f", "#f0bc42"] },

    // Bundesliga
    "Bayern München": { short: "FCB", colors: ["#dc052d", "#0066b2"] },
    "Bayer 04 Leverkusen": { short: "B04", colors: ["#e32221", "#111111"] },
    "Borussia Dortmund": { short: "BVB", colors: ["#fde100", "#111111"] },
    "RB Leipzig": { short: "RBL", colors: ["#dd013f", "#0c2340"] },
  };

  const countryFlags = {
    "Spain": "es",
    "United Kingdom": "gb",
    "Germany": "de",
    "France": "fr",
    "Italy": "it",
    "Portugal": "pt",
    "Netherlands": "nl",
    "Brazil": "br",
    "Argentina": "ar",
    "Mexico": "mx",
    "Colombia": "co",
    "Chile": "cl",
    "Uruguay": "uy",
    "United States of America": "us",
    "Japan": "jp",
    "South Korea": "kr",
    "Saudi Arabia": "sa",
    "Turkey": "tr",
    "Russia": "ru",
    "Belgium": "be",
    "Greece": "gr",
    "Australia": "au",
    "Morocco": "ma",
    "Egypt": "eg",
    "South Africa": "za",
    "China": "cn",
    "India": "in",
    "Ecuador": "ec",
    "Peru": "pe",
    "Venezuela": "ve",
    "Bolivia": "bo",
    "Paraguay": "py",
    "Costa Rica": "cr",
    "Honduras": "hn",
    "Sweden": "se",
    "Denmark": "dk",
    "Norway": "no",
    "Switzerland": "ch",
    "Austria": "at",
    "Ukraine": "ua",
    "Romania": "ro",
    "Serbia": "rs",
    "Republic of Serbia": "rs",
    "Croatia": "hr",
    "Czechia": "cz",
    "Czech Republic": "cz",
    "Poland": "pl",
    "Trinidad and Tobago": "tt",
    "Bosnia and Herzegovina": "ba",
    "North Macedonia": "mk",
    "Albania": "al",
    "Slovenia": "si",
    "Belarus": "by",
    "Kazakhstan": "kz",
    "Uzbekistan": "uz",
    "Libya": "ly",
    "Sudan": "sd",
    "Ethiopia": "et",
    "Zimbabwe": "zw",
    "Zambia": "zm",
    "Angola": "ao",
    "Democratic Republic of the Congo": "cd",
    "Mozambique": "mz",
    "Cuba": "cu",
    "El Salvador": "sv",
    "Nicaragua": "ni",
    "Dominican Republic": "do",
    "Haiti": "ht",
    "Syria": "sy",
    "Jordan": "jo",
    "Lebanon": "lb",
    "Kuwait": "kw",
    "Bahrain": "bh",
    "Oman": "om",
    "Yemen": "ye",
    "Pakistan": "pk",
    "Bangladesh": "bd",
    "Myanmar": "mm",
    "Philippines": "ph",
    "Cambodia": "kh",
    "Mongolia": "mn"
  };

  const staticLeagues = {
    "Spain": ["Real Madrid","FC Barcelona","Atlético de Madrid","Sevilla FC","Valencia CF","Villarreal CF","Athletic Club","Real Sociedad","Real Betis","Celta Vigo","Rayo Vallecano","Girona FC","UD Las Palmas","RCD Mallorca","Getafe CF","CD Leganés","RCD Espanyol","Deportivo Alavés","Real Valladolid","Osasuna"],
    "United Kingdom": ["Manchester City","Arsenal","Liverpool","Chelsea","Manchester United","Tottenham Hotspur","Newcastle United","West Ham United","Aston Villa","Brighton & Hove Albion","Brentford","Crystal Palace","Everton","Wolverhampton Wanderers","Fulham","AFC Bournemouth","Nottingham Forest","Leicester City","Ipswich Town","Southampton"],
    "Germany": ["Bayern München","Bayer 04 Leverkusen","Borussia Dortmund","RB Leipzig","Eintracht Frankfurt","VfB Stuttgart","1. FC Union Berlin","Werder Bremen","SC Freiburg","VfL Wolfsburg","TSG Hoffenheim","1. FSV Mainz 05","FC Augsburg","Borussia Mönchengladbach","VfL Bochum","1. FC Heidenheim","FC St. Pauli","Holstein Kiel"],
    "France": ["Paris Saint-Germain","AS Monaco","Olympique Lyonnais","Olympique de Marseille","LOSC Lille","OGC Nice","Stade Rennais","RC Lens","FC Nantes","RC Strasbourg","Montpellier HSC","Stade de Reims","Toulouse FC","AJ Auxerre","Le Havre AC","Stade Brestois 29","Angers SCO","AS Saint-Étienne"],
    "Italy": ["Inter Milan","AC Milan","Juventus","Napoli","Atalanta","AS Roma","SS Lazio","Fiorentina","Torino","Bologna","Genoa","Monza","Lecce","Udinese","Empoli","Como 1907","Venezia","Hellas Verona","Cagliari","Parma"],
    "Brazil": ["CR Flamengo","SE Palmeiras","Santos FC","São Paulo FC","Grêmio","SC Internacional","SC Corinthians","Atlético Mineiro","Fluminense","Botafogo","Vasco da Gama","Cruzeiro","RB Bragantino","Fortaleza","Ceará","Sport Recife","Cuiabá","Goiás","América MG","Juventude"],
    "Argentina": ["Boca Juniors","River Plate","San Lorenzo","Racing Club","Independiente","Vélez Sársfield","Huracán","Lanús","Talleres","Estudiantes","Banfield","Colón","Defensa y Justicia","Godoy Cruz","Platense","Argentinos Juniors","Rosario Central","Newell's Old Boys","Sarmiento","Instituto"],
    "Mexico": ["Club América","CD Guadalajara","Cruz Azul","Pumas UNAM","Tigres UANL","CF Monterrey","Club León","Club Pachuca","Atlas FC","Club Tijuana","Santos Laguna","Toluca","Querétaro","FC Juárez","Mazatlán FC","Puebla FC","Necaxa","San Luis"],
    "Saudi Arabia": ["Al-Nassr FC","Al-Hilal SFC","Al-Ittihad Club","Al-Ahli SFC","Al-Qadsiah","Al-Shabab FC","Al-Fateh SC","Al-Wehda FC","Al-Feiha","Al-Khaleej","Damac FC","Al-Okhdood"],
    "United States of America": ["Inter Miami CF","LA Galaxy","New York City FC","Seattle Sounders FC","Portland Timbers","Atlanta United","Columbus Crew","Philadelphia Union","New England Revolution","FC Cincinnati","Toronto FC","Vancouver Whitecaps","Austin FC","Nashville SC","Charlotte FC"]
  };

  const sofifaTeamIds = {
    // Spain
    "Real Madrid": "243",
    "FC Barcelona": "241",
    "Atlético de Madrid": "240",
    "Sevilla FC": "481",
    "Valencia CF": "461",
    "Villarreal CF": "483",
    "Athletic Club": "448",
    "Real Sociedad": "457",
    "Real Betis": "449",
    "Celta Vigo": "450",
    "Rayo Vallecano": "480",
    "Girona FC": "110549",
    "UD Las Palmas": "472",
    "RCD Mallorca": "453",
    "Getafe CF": "1860",
    "CD Leganés": "100888",
    "RCD Espanyol": "452",
    "Deportivo Alavés": "463",
    "Real Valladolid": "462",
    "Osasuna": "455",

    // United Kingdom
    "Manchester City": "10",
    "Arsenal": "1",
    "Liverpool": "9",
    "Chelsea": "5",
    "Manchester United": "11",
    "Tottenham Hotspur": "18",
    "Newcastle United": "13",
    "West Ham United": "19",
    "Aston Villa": "2",
    "Brighton & Hove Albion": "1808",
    "Brentford": "1898",
    "Crystal Palace": "1799",
    "Everton": "7",
    "Wolverhampton Wanderers": "110",
    "Fulham": "144",
    "AFC Bournemouth": "1943",
    "Nottingham Forest": "14",
    "Leicester City": "95",
    "Ipswich Town": "94",
    "Southampton": "17",

    // Germany
    "Bayern München": "21",
    "Bayer 04 Leverkusen": "32",
    "Borussia Dortmund": "22",
    "RB Leipzig": "112172",
    "Eintracht Frankfurt": "1824",
    "VfB Stuttgart": "36",
    "1. FC Union Berlin": "1831",
    "Werder Bremen": "38",
    "SC Freiburg": "25",
    "VfL Wolfsburg": "175",
    "TSG Hoffenheim": "10029",
    "1. FSV Mainz 05": "169",
    "FC Augsburg": "10040",
    "Borussia Mönchengladbach": "23",
    "VfL Bochum": "160",
    "1. FC Heidenheim": "111235",
    "FC St. Pauli": "110329",
    "Holstein Kiel": "112411",

    // France
    "Paris Saint-Germain": "73",
    "AS Monaco": "69",
    "Olympique Lyonnais": "66",
    "Olympique de Marseille": "219",
    "LOSC Lille": "65",
    "OGC Nice": "71",
    "Stade Rennais": "74",
    "RC Lens": "224",
    "FC Nantes": "70",
    "RC Strasbourg": "76",
    "Montpellier HSC": "72",
    "Stade de Reims": "379",
    "Toulouse FC": "180",
    "AJ Auxerre": "57",
    "Le Havre AC": "1811",
    "Stade Brestois 29": "378",
    "Angers SCO": "1530",
    "AS Saint-Étienne": "1819",

    // Italy
    "Inter Milan": "44",
    "AC Milan": "47",
    "Juventus": "45",
    "Napoli": "48",
    "Atalanta": "39",
    "AS Roma": "52",
    "SS Lazio": "46",
    "Fiorentina": "110374",
    "Torino": "54",
    "Bologna": "189",
    "Genoa": "110556",
    "Monza": "112117",
    "Lecce": "347",
    "Udinese": "55",
    "Empoli": "1746",
    "Como 1907": "112423",
    "Venezia": "205",
    "Hellas Verona": "206",
    "Cagliari": "376",
    "Parma": "50",

    // Brazil
    "CR Flamengo": "1043",
    "SE Palmeiras": "383",
    "Santos FC": "1053",
    "São Paulo FC": "598",
    "Grêmio": "1044",
    "SC Internacional": "1048",
    "SC Corinthians": "1041",
    "Atlético Mineiro": "1035",
    "Fluminense": "1042",
    "Botafogo": "517",
    "Vasco da Gama": "1058",
    "Cruzeiro": "568",
    "RB Bragantino": "113056",
    "Fortaleza": "112119",
    
    // Argentina
    "Boca Juniors": "1877",
    "River Plate": "1876",
    "San Lorenzo": "1013",
    "Racing Club": "1012",
    "Independiente": "110093",
    
    // USA
    "Inter Miami CF": "112885",
    "LA Galaxy": "697",
    "New York City FC": "112828",
    "Seattle Sounders FC": "111144",
    "Atlanta United": "112885",
    
    // Saudi Arabia
    "Al-Nassr FC": "112139",
    "Al-Hilal SFC": "112140",
    "Al-Ittihad Club": "112099",
    "Al-Ahli SFC": "112140"
  };

  function getDynamicClubLogoSvg(clubName, theme) {
    const short = theme.short || clubName.substring(0, 3).toUpperCase();
    const c1 = theme.colors[0];
    const c2 = theme.colors[1] || theme.colors[0];
    
    return `data:image/svg+xml;utf8,` + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <defs>
          <linearGradient id="shield-grad-${short}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${c1}" />
            <stop offset="100%" stop-color="${c2}" />
          </linearGradient>
          <filter id="glow-${short}" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        <circle cx="50" cy="50" r="42" fill="none" stroke="${c1}" stroke-width="1.5" opacity="0.3" filter="url(#glow-${short})" />
        
        <path d="M 50 8 C 75 8, 85 18, 85 45 C 85 68, 65 88, 50 92 C 35 88, 15 68, 15 45 C 15 18, 25 8, 50 8 Z" 
              fill="url(#shield-grad-${short})" 
              stroke="rgba(255,255,255,0.8)" 
              stroke-width="2" />
              
        <path d="M 50 14 C 70 14, 78 22, 78 45 C 78 64, 62 81, 50 85 C 38 81, 22 64, 22 45 C 22 22, 30 14, 50 14 Z" 
              fill="none" 
              stroke="rgba(255,255,255,0.15)" 
              stroke-width="1.5" 
              stroke-dasharray="4 2" />
        
        <line x1="50" y1="14" x2="50" y2="85" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
        <line x1="22" y1="45" x2="78" y2="45" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
        
        <circle cx="50" cy="50" r="18" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
        
        <text x="50" y="56" 
              font-family="system-ui, -apple-system, sans-serif" 
              font-size="20" 
              font-weight="900" 
              fill="#ffffff" 
              text-anchor="middle" 
              style="text-shadow: 0px 2px 4px rgba(0,0,0,0.6);"
              letter-spacing="0.5">
          ${short}
        </text>
        
        <polygon points="50,18 52,23 57,23 53,26 55,31 50,28 45,31 47,26 43,23 48,23" fill="#ffffff" opacity="0.9" />
      </svg>
    `);
  }

  function getTeamLogoUrl(clubName, theme) {
    const id = sofifaTeamIds[clubName];
    if (id) {
      return `https://cdn.sofifa.net/teams/${id}/120.png`;
    }
    return getDynamicClubLogoSvg(clubName, theme);
  }

  function getClubTheme(clubName) {
    if (clubThemes[clubName]) return clubThemes[clubName];
    
    // Procedural generation
    const clean = clubName.replace(/^(FC|RCD|UD|CD|SL|AS|AC|SS|BK|IFK|IF|IFK|IF)\s+/i, "").trim();
    const parts = clean.split(" ");
    let short = "";
    if (parts.length >= 2) {
      short = (parts[0][0] + parts[1][0]).toUpperCase();
    } else if (clean.length >= 3) {
      short = clean.substring(0, 3).toUpperCase();
    } else {
      short = clean.toUpperCase();
    }
    
    // Hash colors
    let hash = 0;
    for (let i = 0; i < clubName.length; i++) {
      hash = clubName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue1 = Math.abs(hash % 360);
    const hue2 = (hue1 + 120) % 360;
    const color1 = `hsl(${hue1}, 75%, 45%)`;
    const color2 = `hsl(${hue2}, 75%, 35%)`;
    
    return { short, colors: [color1, color2] };
  }

  window.goToStep1 = () => {
    currentStep = 1;
    step1Container.style.display = 'block';
    step2Container.style.display = 'none';
    step3Container.style.display = 'none';
    
    stepText.textContent = "Paso 1 de 2";
    stepTitle.innerHTML = "¿Qué ligas quieres explorar?";
    stepSubtitle.textContent = "Selecciona los países con ligas profesionales que más te interesan.";
    
    dotStep1.className = 'step-dot active';
    dotStep2.className = 'step-dot';
    if (dotStep3) dotStep3.className = 'step-dot';
  };

  window.selectCountryDirectly = (name) => {
    selectedCountries = [name];
    updateUI();
  };

  window.goToStep2 = async () => {
    if (selectedCountries.length === 0) return;
    
    currentStep = 2;
    step1Container.style.display = 'none';
    step2Container.style.display = 'flex';
    step3Container.style.display = 'none';
    
    const countryKey = selectedCountries[0];
    const data = leagueData[countryKey] || { name: countryKey, league: "Liga Profesional" };
    
    stepText.textContent = "Paso 2 de 2";
    stepTitle.innerHTML = `¿A qué club de <span style="color: #00f0ff; text-shadow: 0 0 10px rgba(0, 240, 255, 0.4);">${data.name}</span> perteneces?`;
    stepSubtitle.textContent = `Mostrando clubes de ${data.league} seleccionada anteriormente.`;
    
    dotStep1.className = 'step-dot';
    dotStep2.className = 'step-dot active';
    if (dotStep3) dotStep3.className = 'step-dot';
    
    // Set flag and labels in left panel
    const flagImg = document.getElementById('step2-country-flag');
    const nameEl = document.getElementById('step2-country-name');
    const leagueEl = document.getElementById('step2-league-name');
    
    nameEl.textContent = data.name;
    leagueEl.textContent = data.league;
    
    const countryKeys = Object.keys(leagueData);
    const countryIndex = countryKeys.indexOf(countryKey);
    const leagueId = countryIndex !== -1 ? (countryIndex + 1) : null;
    const DB_TO_FILE_MAP = {"1":31,"2":55,"3":7,"4":44,"5":67,"7":17,"8":6,"10":39,"11":36,"12":59,"13":60,"14":47,"15":25,"17":66,"18":73,"19":56,"20":19,"21":69,"22":1,"24":14,"26":70,"27":24,"28":43,"29":35,"30":37,"32":12,"33":61,"35":2,"36":74,"37":16,"38":71,"39":8,"40":54,"41":38,"44":23,"47":15,"48":78,"50":63,"51":28,"52":64,"55":79,"56":34,"59":11,"60":72,"61":22,"62":46,"63":48,"64":10,"65":62,"68":45,"69":77,"74":51,"76":52,"77":4,"78":50,"79":53,"80":9,"81":49};
    const mappedFileId = leagueId ? DB_TO_FILE_MAP[leagueId.toString()] : null;
    if (mappedFileId) {
      flagImg.src = `assets/leagues/liga_${mappedFileId}.png`;
      flagImg.style.objectFit = 'contain';
      flagImg.style.padding = '10px';
    } else {
      const flagIso = countryFlags[countryKey] || "es";
      flagImg.src = `https://flagcdn.com/w160/${flagIso}.png`;
      flagImg.style.objectFit = 'cover';
      flagImg.style.padding = '0';
    }
    
    // Populate clubs grid with loading spinner
    const clubsGrid = document.getElementById('clubs-grid');
    clubsGrid.innerHTML = '<div style="color: rgba(0, 240, 255, 0.7); font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; height: 100px;"><i class="fas fa-spinner fa-spin"></i> Descubriendo equipos reales...</div>';
    
    let teams = [];
    
    // Dynamically fetch teams belonging to this country directly from the database table 'teams'!
    try {
      const response = await fetchWithAuth(`${API}/onboarding/teams?country=${encodeURIComponent(countryKey)}`);
      if (response.ok) {
        const json = await response.json();
        if (json.teams && json.teams.length > 0) {
          teams = json.teams.map(t => t.name);
        }
      }
    } catch (err) {
      console.error("Error fetching teams from database table:", err);
    }
    
    // Fallback 1: Extract teams from players database
    if (teams.length === 0) {
      if (!window.allPlayers || window.allPlayers.length === 0) {
        try {
          const response = await fetchWithAuth(`${API}/players`);
          if (response.ok) {
            const json = await response.json();
            window.allPlayers = json.players || [];
          }
        } catch (err) {
          console.error("Error dynamically fetching player list:", err);
        }
      }
      
      if (window.allPlayers && window.allPlayers.length > 0) {
        const targetLeagueLower = data.league.toLowerCase();
        teams = [...new Set(window.allPlayers
          .filter(p => {
            if (!p.league) return false;
            const playerLeagueLower = p.league.toLowerCase();
            return playerLeagueLower === targetLeagueLower || 
                   playerLeagueLower.includes(targetLeagueLower) || 
                   targetLeagueLower.includes(playerLeagueLower) ||
                   p.country === countryKey ||
                   p.nationality === countryKey;
          })
          .map(p => p.currentTeam)
          .filter(Boolean)
        )].sort();
      }
    }
    
    // Fallback 2: Real static leagues definition
    if (teams.length === 0) {
      teams = staticLeagues[countryKey] || [];
    }
    
    // Fallback 3: Generic ultimate fallback
    if (teams.length === 0) {
      if (typeof generateProceduralTeams === 'function') {
        teams = generateProceduralTeams(countryKey);
      } else {
        teams = [
          "Madrid FC", "Barcelona SC", "Sevilla At.", "Valencia CF", "Bilbao Team", "Real Zaragoza",
          "Atlético de Madrid", "Espanyol", "Real Betis", "Real Sociedad", "Villarreal", "Celta de Vigo"
        ];
      }
    }
    
    clubsGrid.innerHTML = '';
    teams.forEach(clubName => {
      const theme = getClubTheme(clubName);
      const isSelected = selectedClub === clubName;
      
      const card = document.createElement('div');
      card.className = `club-card ${isSelected ? 'selected' : ''}`;
      card.onclick = () => selectClub(clubName, card);
      
      const imgId = "logo-" + clubName.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
      const fallbackSvg = getDynamicClubLogoSvg(clubName, theme);
      
      card.innerHTML = `
        <div class="club-shield-container">
          <img class="club-logo-img" id="${imgId}" src="${fallbackSvg}" alt="${clubName}">
        </div>
        <div class="club-name-text" title="${clubName}">${clubName}</div>
      `;
      clubsGrid.appendChild(card);
      
      // Asynchronously fetch the actual logo in the background!
      // This is a premium progressive enhancement technique.
      fetchWithAuth(`${API}/team-logo?name=${encodeURIComponent(clubName)}`)
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('Logo fetch error');
        })
        .then(json => {
          if (json.logoUrl) {
            const imgEl = document.getElementById(imgId);
            if (imgEl) {
              // Smooth transition fade out and in
              imgEl.style.transition = 'opacity 0.2s ease-in-out';
              imgEl.style.opacity = '0';
              setTimeout(() => {
                imgEl.src = json.logoUrl;
                imgEl.style.opacity = '1';
                imgEl.onerror = () => {
                  imgEl.src = fallbackSvg; // fallback if image load fails
                };
              }, 200);
            }
          }
        })
        .catch(err => {
          console.warn(`Could not load real logo for ${clubName}:`, err);
        });
    });
    
    updateStep2Footer();
  };

  window.selectClub = (clubName, cardEl) => {
    const isAlreadySelected = selectedClub === clubName;
    
    // Deselect all
    document.querySelectorAll('.club-card').forEach(c => c.classList.remove('selected'));
    
    if (isAlreadySelected) {
      selectedClub = null;
    } else {
      selectedClub = clubName;
      cardEl.classList.add('selected');
    }
    
    updateStep2Footer();
  };
  
  window.deselectClub = () => {
    selectedClub = null;
    document.querySelectorAll('.club-card').forEach(c => c.classList.remove('selected'));
    updateStep2Footer();
  };
  
  function updateStep2Footer() {
    const chip = document.getElementById('step2-selected-club-chip');
    const hint = document.getElementById('step2-no-club-hint');
    const confirmBtn = document.getElementById('btn-confirmar-club');
    
    if (selectedClub) {
      document.getElementById('step2-selected-club-name').textContent = selectedClub;
      chip.style.display = 'flex';
      hint.style.display = 'none';
      confirmBtn.disabled = false;
    } else {
      chip.style.display = 'none';
      hint.style.display = 'block';
      confirmBtn.disabled = true;
    }
  }

  window.goToStep3 = () => {
    if (!selectedClub) return;
    
    currentStep = 3;
    step1Container.style.display = 'none';
    step2Container.style.display = 'none';
    step3Container.style.display = 'flex';
    
    stepText.textContent = "Paso 3 de 3";
    stepTitle.innerHTML = "¿Cuál es tu plan?";
    stepSubtitle.textContent = "Tu experiencia se adaptará según tu suscripción elegida.";
    
    dotStep1.className = 'step-dot';
    dotStep2.className = 'step-dot';
    if (dotStep3) dotStep3.className = 'step-dot active';
  };

  window.selectTier = (tierName, element) => {
    selectedTier = tierName;
    
    // Remove selected state from all cards
    document.querySelectorAll('.tier-card').forEach(c => {
      c.style.borderColor = 'rgba(0, 240, 255, 0.15)';
      c.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
      c.querySelector('.tier-check').style.opacity = '0';
    });
    
    // Add selected state to clicked element
    element.style.borderColor = '#00f0ff';
    element.style.boxShadow = '0 0 25px rgba(0, 240, 255, 0.3)';
    element.querySelector('.tier-check').style.opacity = '1';
    
    updateStep3UI();
  };
  
  function updateStep3UI() {
    const chip = document.getElementById('step3-selected-tier-chip');
    const nameSpan = document.getElementById('step3-selected-tier-name');
    const hint = document.getElementById('step3-config-summary');
    const finalBtn = document.getElementById('btn-onboarding-final');
    
    if (selectedTier) {
      nameSpan.textContent = selectedTier;
      chip.style.display = 'flex';
      hint.style.display = 'none';
      finalBtn.disabled = false;
    } else {
      chip.style.display = 'none';
      hint.style.display = 'block';
      finalBtn.disabled = true;
    }
  }

  window.finalizarOnboarding = async () => {
    if (!selectedCountries.length || !selectedClub || !selectedTier) return;
    
    const finalBtn = document.getElementById('btn-onboarding-final');
    const originalText = finalBtn ? finalBtn.textContent : '';
    if (finalBtn) {
      finalBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
      finalBtn.disabled = true;
    }
    
    let isSuccess = false;
    try {
      const res = await fetchWithAuth(`${API}/auth/onboarding`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          selectedCountries,
          selectedClub,
          selectedTier
        })
      });
      
      if (res.ok) {
        isSuccess = true;
        const data = await res.json();
        console.log("✅ Onboarding complete:", data);
      }
    } catch (err) {
      console.warn("❌ Onboarding network error (using local fallback):", err);
    }

    // Fallback: Siempre completar exitosamente a nivel de cliente para despliegues estáticos
    const user = JSON.parse(localStorage.getItem('scout_ai_user') || '{}');
    user.onboardingComplete = true;
    user.selectedCountry = selectedCountries.join(', ');
    user.selectedClub = selectedClub;
    user.selectedTier = selectedTier;
    localStorage.setItem('scout_ai_user', JSON.stringify(user));
    localStorage.removeItem('scout_ai_swaps'); // Clear custom swaps on club change!
    localStorage.removeItem('scout_ai_benched'); // Clear benched players list on club change!
    
    if (!isSuccess) {
      showToast('ℹ️ Configuración guardada localmente (modo demo).', 'info');
    }
    
    // Success animation and exit
    const onboarding = document.getElementById('onboarding-screen');
    if (onboarding) {
      onboarding.style.opacity = '0';
      setTimeout(() => { 
        onboarding.style.display = 'none'; 
        initDashboard(); 
      }, 500);
    } else {
      initDashboard();
    }
  };

  function onEachFeature(feature, layer) {
    const name = getCountryName(feature.properties);
    const hasLeague = !!leagueData[name];

    if (hasLeague) {
      layer.on({
        mouseover: (e) => {
          clearTimeout(tooltipHideTimer);
          if (!selectedCountries.includes(name)) {
            layer.setStyle({ fillOpacity: 0.4, weight: 2 });
          }
          showTooltip(e, name);
        },
        mouseout: () => {
          if (!selectedCountries.includes(name)) geoJsonLayer.resetStyle(layer);
          tooltipHideTimer = setTimeout(() => { tooltip.classList.remove('visible'); }, 300);
        },
        click: (e) => {
          L.DomEvent.stopPropagation(e);
          if (isMobileDevice) {
            // En mobile: un tap selecciona/deselecciona el país directamente
            // No usamos el tooltip intermedio porque está dentro de overflow:hidden
            if (selectedCountries.includes(name)) {
              selectedCountries = selectedCountries.filter(c => c !== name);
            } else {
              // Solo un país a la vez en mobile para simplificar
              selectedCountries = [name];
            }
            updateUI();
            geoJsonLayer.eachLayer(l => geoJsonLayer.resetStyle(l));
          } else {
            // En desktop: click alterna selección
            if (selectedCountries.includes(name)) {
              selectedCountries = selectedCountries.filter(c => c !== name);
            } else {
              selectedCountries.push(name);
            }
            updateUI();
            geoJsonLayer.eachLayer(l => geoJsonLayer.resetStyle(l));
          }
        }
      });
    }
  }

  // --- PREMIUM SUBSCRIPTION TIERS LOCK & PAYMENT MODAL LOGIC ---
  const tierDetails = {
    'Pro': {
      price: '$9.99',
      desc: 'Accede a capacidades avanzadas de descubrimiento y evaluación de talentos locales e internacionales con nuestra IA en tiempo real. Analiza fichajes potenciales con total precisión.',
      icon: '🔍',
      color: '#00f0ff'
    },
    'Plus': {
      price: '$19.99',
      desc: 'Métricas avanzadas de scouting, mapas de calor (heatmaps) dinámicos de rendimiento y reportes tácticos ejecutivos automatizados de Gemini IA en formato profesional.',
      icon: '📊',
      color: '#f0bc42'
    },
    'Enterprise': {
      price: '$49.99',
      desc: 'Gestión completa de plantillas federadas, integración API en tiempo real con mercados de fichajes internacionales, y soporte técnico de scout prioritario 24/7.',
      icon: '🤝',
      color: '#c8102e'
    }
  };

  // Unified payment gateway will handle showPaymentModal, closePaymentModal, and simulatePayment.

  // GeoJSON fetch — carga el mapa mundial
  fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson')
    .then(r => r.json())
    .then(data => {
      geoJsonLayer = L.geoJSON(data, { 
        style: getStyle, 
        onEachFeature: onEachFeature,
        filter: (f) => getCountryName(f.properties) !== 'Antarctica'
      }).addTo(map);

      // Invalidar primero para que Leaflet conozca el tamaño real del contenedor
      map.invalidateSize({ animate: false });

      if (isMobileDevice) {
        // En mobile: encuadre centrado a nivel 1.5 para poder desplazarse horizontalmente
        map.setView([20, 0], 1.5, { animate: false });
      } else {
        map.fitBounds(geoJsonLayer.getBounds(), { padding: [0, 0] });
      }
    });
}

window.showOnboardingTierAlert = (tierName, price, cardElement) => {
  // If the user already bought/unlocked this tier, just select it
  if (cardElement.style.opacity === '1') {
    if (typeof window.selectTier === 'function') {
      window.selectTier(tierName, cardElement);
    }
    return;
  }
  
  // Show the mini-alert!
  if (typeof window.showMiniAlert === 'function') {
    window.showMiniAlert(tierName, price, cardElement, false);
  }
};
