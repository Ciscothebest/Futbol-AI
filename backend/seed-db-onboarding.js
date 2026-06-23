const { sequelize, League, Team } = require('./database');

const leagueData = {
  "Spain":                          { name: "España",           league: "La Liga",                          teamsCount: 20, flagIso: "es" },
  "United Kingdom":                 { name: "Reino Unido",      league: "Premier League / Championship",    teamsCount: 20, flagIso: "gb" },
  "Germany":                        { name: "Alemania",         league: "Bundesliga",                       teamsCount: 18, flagIso: "de" },
  "France":                         { name: "Francia",          league: "Ligue 1",                          teamsCount: 18, flagIso: "fr" },
  "Italy":                          { name: "Italia",           league: "Serie A",                          teamsCount: 20, flagIso: "it" },
  "Portugal":                       { name: "Portugal",         league: "Primeira Liga",                    teamsCount: 18, flagIso: "pt" },
  "Netherlands":                    { name: "Países Bajos",     league: "Eredivisie",                       teamsCount: 18, flagIso: "nl" },
  "Brazil":                         { name: "Brasil",           league: "Brasileirão",                      teamsCount: 20, flagIso: "br" },
  "Argentina":                      { name: "Argentina",        league: "Liga Profesional",                 teamsCount: 28, flagIso: "ar" },
  "Mexico":                         { name: "México",           league: "Liga MX",                          teamsCount: 18, flagIso: "mx" },
  "Colombia":                       { name: "Colombia",         league: "Liga BetPlay",                     teamsCount: 20, flagIso: "co" },
  "Chile":                          { name: "Chile",            league: "Primera División",                 teamsCount: 16, flagIso: "cl" },
  "Uruguay":                        { name: "Uruguay",          league: "Primera División",                 teamsCount: 16, flagIso: "uy" },
  "United States of America":       { name: "EE.UU.",           league: "MLS",                              teamsCount: 29, flagIso: "us" },
  "Japan":                          { name: "Japón",            league: "J1 League",                        teamsCount: 18, flagIso: "jp" },
  "South Korea":                    { name: "Corea del Sur",    league: "K League 1",                       teamsCount: 12, flagIso: "kr" },
  "Saudi Arabia":                   { name: "Arabia Saudí",     league: "Saudi Pro League",                 teamsCount: 16, flagIso: "sa" },
  "Turkey":                         { name: "Turquía",          league: "Süper Lig",                        teamsCount: 19, flagIso: "tr" },
  "Russia":                         { name: "Rusia",            league: "Premier Liga",                     teamsCount: 16, flagIso: "ru" },
  "Belgium":                        { name: "Bélgica",          league: "First Division A",                 teamsCount: 16, flagIso: "be" },
  "Greece":                         { name: "Grecia",           league: "Super League",                     teamsCount: 16, flagIso: "gr" },
  "Australia":                      { name: "Australia",        league: "A-League",                         teamsCount: 12, flagIso: "au" },
  "Morocco":                        { name: "Marruecos",        league: "Botola Pro",                       teamsCount: 16, flagIso: "ma" },
  "Egypt":                          { name: "Egipto",           league: "Egyptian Premier League",          teamsCount: 18, flagIso: "eg" },
  "South Africa":                   { name: "Sudáfrica",        league: "PSL",                              teamsCount: 16, flagIso: "za" },
  "China":                          { name: "China",            league: "Super League",                     teamsCount: 16, flagIso: "cn" },
  "India":                          { name: "India",            league: "ISL",                              teamsCount: 12, flagIso: "in" },
  "Ecuador":                        { name: "Ecuador",          league: "LigaPro",                          teamsCount: 16, flagIso: "ec" },
  "Peru":                           { name: "Perú",             league: "Liga 1",                           teamsCount: 18, flagIso: "pe" },
  "Venezuela":                      { name: "Venezuela",        league: "Liga FUTVE",                       teamsCount: 18, flagIso: "ve" },
  "Bolivia":                        { name: "Bolivia",          league: "División Profesional",             teamsCount: 14, flagIso: "bo" },
  "Paraguay":                       { name: "Paraguay",         league: "División de Honor",                teamsCount: 12, flagIso: "py" },
  "Costa Rica":                     { name: "Costa Rica",       league: "Primera División",                 teamsCount: 12, flagIso: "cr" },
  "Honduras":                       { name: "Honduras",         league: "Liga Nacional",                    teamsCount: 10, flagIso: "hn" },
  "Sweden":                         { name: "Suecia",           league: "Allsvenskan",                      teamsCount: 16, flagIso: "se" },
  "Denmark":                        { name: "Dinamarca",        league: "Superliga",                        teamsCount: 14, flagIso: "dk" },
  "Norway":                         { name: "Noruega",          league: "Eliteserien",                      teamsCount: 16, flagIso: "no" },
  "Switzerland":                    { name: "Suiza",            league: "Super League",                     teamsCount: 10, flagIso: "ch" },
  "Austria":                        { name: "Austria",          league: "Bundesliga",                       teamsCount: 12, flagIso: "at" },
  "Ukraine":                        { name: "Ucrania",          league: "Premier League",                   teamsCount: 16, flagIso: "ua" },
  "Romania":                        { name: "Rumanía",          league: "Liga I",                           teamsCount: 16, flagIso: "ro" },
  "Serbia":                         { name: "Serbia",           league: "SuperLiga",                        teamsCount: 16, flagIso: "rs" },
  "Republic of Serbia":             { name: "Serbia",           league: "SuperLiga",                        teamsCount: 16, flagIso: "rs" },
  "Croatia":                        { name: "Croacia",          league: "HNL",                              teamsCount: 10, flagIso: "hr" },
  "Czechia":                        { name: "Rep. Checa",       league: "Fortuna Liga",                     teamsCount: 16, flagIso: "cz" },
  "Czech Republic":                 { name: "Rep. Checa",       league: "Fortuna Liga",                     teamsCount: 16, flagIso: "cz" },
  "Poland":                         { name: "Polonia",          league: "Ekstraklasa",                      teamsCount: 18, flagIso: "pl" },
  "Trinidad and Tobago":            { name: "Trinidad y Tobago",league: "TT Pro League",                    teamsCount: 8,  flagIso: "tt" },
  "Bosnia and Herzegovina":         { name: "Bosnia y Herz.",   league: "Premier Liga BiH",                 teamsCount: 12, flagIso: "ba" },
  "North Macedonia":                { name: "Macedonia del N.", league: "Prva Liga",                        teamsCount: 10, flagIso: "mk" },
  "Albania":                        { name: "Albania",          league: "Kategoria Superiore",              teamsCount: 10, flagIso: "al" },
  "Slovenia":                       { name: "Eslovenia",        league: "PrvaLiga",                         teamsCount: 10, flagIso: "si" },
  "Belarus":                        { name: "Bielorrusia",      league: "Vysheyshaya Liga",                 teamsCount: 16, flagIso: "by" },
  "Kazakhstan":                     { name: "Kazajistán",       league: "Kazakhstan Premier League",        teamsCount: 12, flagIso: "kz" },
  "Uzbekistan":                     { name: "Uzbekistán",       league: "Uzbekistan Super League",          teamsCount: 16, flagIso: "uz" },
  "Libya":                          { name: "Libia",            league: "Libyan Premier League",            teamsCount: 16, flagIso: "ly" },
  "Sudan":                          { name: "Sudán",            league: "Sudan Premier League",             teamsCount: 18, flagIso: "sd" },
  "Ethiopia":                       { name: "Etiopía",          league: "Ethiopian Premier League",         teamsCount: 16, flagIso: "et" },
  "Zimbabwe":                       { name: "Zimbabue",         league: "Castle Lager Premier Soccer League", teamsCount: 16, flagIso: "zw" },
  "Zambia":                         { name: "Zambia",           league: "Super League of Zambia",           teamsCount: 16, flagIso: "zm" },
  "Angola":                         { name: "Angola",           league: "Girabola",                         teamsCount: 16, flagIso: "ao" },
  "Democratic Republic of the Congo":{ name: "R.D. Congo",      league: "Linafoot",                         teamsCount: 16, flagIso: "cd" },
  "Mozambique":                     { name: "Mozambique",       league: "Moçambola",                        teamsCount: 14, flagIso: "mz" },
  "Cuba":                           { name: "Cuba",             league: "Campeonato Nacional",              teamsCount: 12, flagIso: "cu" },
  "El Salvador":                    { name: "El Salvador",      league: "Primera División",                 teamsCount: 10, flagIso: "sv" },
  "Nicaragua":                      { name: "Nicaragua",        league: "Liga Primera",                     teamsCount: 10, flagIso: "ni" },
  "Dominican Republic":             { name: "Rep. Dominicana",  league: "LDF",                              teamsCount: 8,  flagIso: "do" },
  "Haiti":                          { name: "Haití",            league: "Ligue Haïtienne",                  teamsCount: 8,  flagIso: "ht" },
  "Syria":                          { name: "Siria",            league: "Syrian Premier League",            teamsCount: 14, flagIso: "sy" },
  "Jordan":                         { name: "Jordania",         league: "Jordan Pro League",                teamsCount: 12, flagIso: "jo" },
  "Lebanon":                        { name: "Líbano",           league: "Lebanese Premier League",          teamsCount: 8,  flagIso: "lb" },
  "Kuwait":                         { name: "Kuwait",           league: "Kuwait Premier League",            teamsCount: 10, flagIso: "kw" },
  "Bahrain":                        { name: "Baréin",           league: "Bahrain Premier League",           teamsCount: 8,  flagIso: "bh" },
  "Oman":                           { name: "Omán",             league: "Oman Professional League",         teamsCount: 12, flagIso: "om" },
  "Yemen":                          { name: "Yemen",            league: "Yemen League",                     teamsCount: 12, flagIso: "ye" },
  "Pakistan":                       { name: "Pakistán",         league: "Pakistan Premier Football League", teamsCount: 8,  flagIso: "pk" },
  "Bangladesh":                     { name: "Bangladés",        league: "Bangladesh Premier League",        teamsCount: 13, flagIso: "bd" },
  "Myanmar":                        { name: "Myanmar",          league: "Myanmar National League",          teamsCount: 8,  flagIso: "mm" },
  "Philippines":                    { name: "Filipinas",        league: "Philippines Football League",      teamsCount: 8,  flagIso: "ph" },
  "Cambodia":                       { name: "Camboya",          league: "Cambodian League",                 teamsCount: 10, flagIso: "kh" },
  "Mongolia":                       { name: "Mongolia",         league: "Mongolian Premier League",         teamsCount: 8,  flagIso: "mn" }
};

const customTeams = {
  "Spain": ["Real Madrid","FC Barcelona","Atlético de Madrid","Sevilla FC","Valencia CF","Villarreal CF","Athletic Club","Real Sociedad","Real Betis","Celta Vigo","Rayo Vallecano","Girona FC","UD Las Palmas","RCD Mallorca","Getafe CF","CD Leganés","RCD Espanyol","Deportivo Alavés","Real Valladolid","Osasuna"],
  "United Kingdom": ["Manchester City","Arsenal","Liverpool","Chelsea","Manchester United","Tottenham Hotspur","Newcastle United","West Ham United","Aston Villa","Brighton & Hove Albion","Brentford","Crystal Palace","Everton","Wolverhampton Wanderers","Fulham","AFC Bournemouth","Nottingham Forest","Leicester City","Ipswich Town","Southampton"],
  "Germany": ["Bayern München","Bayer 04 Leverkusen","Borussia Dortmund","RB Leipzig","Eintracht Frankfurt","VfB Stuttgart","1. FC Union Berlin","Werder Bremen","SC Freiburg","VfL Wolfsburg","TSG Hoffenheim","1. FSV Mainz 05","FC Augsburg","Borussia Mönchengladbach","VfL Bochum","1. FC Heidenheim","FC St. Pauli","Holstein Kiel"],
  "France": ["Paris Saint-Germain","AS Monaco","Olympique Lyonnais","Olympique de Marseille","LOSC Lille","OGC Nice","Stade Rennais","RC Lens","FC Nantes","RC Strasbourg","Montpellier HSC","Stade de Reims","Toulouse FC","AJ Auxerre","Le Havre AC","Stade Brestois 29","Angers SCO","AS Saint-Étienne"],
  "Italy": ["Inter Milan","AC Milan","Juventus","Napoli","Atalanta","AS Roma","SS Lazio","Fiorentina","Torino","Bologna","Genoa","Monza","Lecce","Udinese","Empoli","Como 1907","Venezia","Hellas Verona","Cagliari","Parma"],
  "Brazil": ["CR Flamengo","SE Palmeiras","Santos FC","São Paulo FC","Grêmio","SC Internacional","SC Corinthians","Atlético Mineiro","Fluminense","Botafogo","Vasco da Gama","Cruzeiro","RB Bragantino","Fortaleza","Ceará","Sport Recife","Cuiabá","Goiás","América MG","Juventude"],
  "Argentina": ["Boca Juniors","River Plate","San Lorenzo","Racing Club","Independiente","Vélez Sársfield","Huracán","Lanús","Talleres","Estudiantes","Banfield","Colón","Defensa y Justicia","Godoy Cruz","Platense","Argentinos Juniors","Rosario Central","Newell's Old Boys","Sarmiento","Instituto"],
  "Mexico": ["Club América","CD Guadalajara","Cruz Azul","Pumas UNAM","Tigres UANL","CF Monterrey","Club León","Club Pachuca","Atlas FC","Club Tijuana","Santos Laguna","Toluca","Querétaro","FC Juárez","Mazatlán FC","Puebla FC","Necaxa","San Luis"],
  "Saudi Arabia": ["Al-Nassr FC","Al-Hilal SFC","Al-Ittihad Club","Al-Ahli SFC","Al-Qadsiah","Al-Shabab FC","Al-Fateh SC","Al-Wehda FC","Al-Feiha","Al-Khaleej","Damac FC","Al-Okhdood"],
  "United States of America": ["Inter Miami CF","LA Galaxy","New York City FC","Seattle Sounders FC","Portland Timbers","Atlanta United","Columbus Crew","Philadelphia Union","New England Revolution","FC Cincinnati","Toronto FC","Vancouver Whitecaps","Austin FC","Nashville SC","Charlotte FC"],
  "Portugal": ["FC Porto", "SL Benfica", "Sporting CP", "SC Braga", "Vitória de Guimarães", "Moreirense FC", "FC Arouca", "Rio Ave FC", "Gil Vicente FC", "Boavista FC", "Estoril Praia", "Farense"],
  "Netherlands": ["Ajax Amsterdam", "PSV Eindhoven", "Feyenoord Rotterdam", "AZ Alkmaar", "FC Twente", "FC Utrecht", "SC Heerenveen", "Sparta Rotterdam", "FC Groningen", "PEC Zwolle", "Heracles Almelo", "Fortuna Sittard"],
  "Colombia": ["Atlético Nacional", "Millonarios FC", "América de Cali", "Junior de Barranquilla", "Independiente Santa Fe", "Deportivo Cali", "Independiente Medellín", "Deportes Tolima", "Once Caldas", "La Equidad", "Atlético Bucaramanga", "Águilas Doradas"],
  "Uruguay": ["Peñarol", "Nacional de Montevideo", "Danubio FC", "Defensor Sporting", "Liverpool FC", "Montevideo Wanderers", "River Plate (URU)", "Cerro Largo", "Centro Atlético Fénix", "Progreso", "Boston River", "Deportivo Maldonado"],
  "Chile": ["Colo-Colo", "Universidad de Chile", "Universidad Católica", "Unión Española", "Palestino", "Coquimbo Unido", "Everton de Viña", "Huachipato", "Cobreloa", "Audax Italiano", "O'Higgins", "Cobresal"],
  "Turkey": ["Galatasaray", "Fenerbahçe", "Beşiktaş", "Trabzonspor", "Başakşehir", "Kasımpaşa", "Alanyaspor", "Sivasspor", "Antalyaspor", "Adana Demirspor", "Gaziantep FK", "Konyaspor"],
  "Russia": ["Zenit Saint Petersburg", "Spartak Moscow", "CSKA Moscow", "Krasnodar", "Lokomotiv Moscow", "Dynamo Moscow", "Rostov", "Rubin Kazan", "Krylia Sovetov", "Ural", "Akhmat Grozny", "Sochi"],
  "Belgium": ["Club Brugge", "RSC Anderlecht", "KRC Genk", "Royal Antwerp", "KAA Gent", "Union Saint-Gilloise", "Cercle Brugge", "Standard Liège", "KV Mechelen", "Sint-Truiden", "Westerlo", "Charleroi"],
  "Sweden": ["Malmö FF", "Djurgårdens IF", "Hammarby IF", "AIK Solna", "IF Elfsborg", "BK Häcken", "IFK Göteborg", "IFK Norrköping", "Kalmar FF", "IK Sirius", "Mjällby AIF", "Halmstads BK"],
  "Denmark": ["FC Copenhagen", "Brøndby IF", "FC Midtjylland", "FC Nordsjælland", "AGF Aarhus", "Silkeborg IF", "Viborg FF", "Randers FC", "Lyngby BK", "Vejle Boldklub", "Hvidovre IF", "Odense Boldklub"],
  "Norway": ["Bodø/Glimt", "Molde FK", "Rosenborg BK", "Brann", "Viking FK", "Lillestrøm SK", "Tromsø IL", "Sarpsborg 08", "Strømsgodset", "Odd BK", "HamKam", "Sandefjord Fotball"],
  "Japan": ["Vissel Kobe", "Yokohama F. Marinos", "Kawasaki Frontale", "Sanfrecce Hiroshima", "Urawa Red Diamonds", "Kashima Antlers", "Nagoya Grampus", "Cerezo Osaka", "FC Tokyo", "Gamba Osaka", "Consadole Sapporo", "Sagan Tosu", "Kyoto Sanga", "Shonan Bellmare", "Albirex Niigata", "Avispa Fukuoka", "Tokyo Verdy", "Machida Zelvia"],
  "South Korea": ["Ulsan HD", "Pohang Steelers", "Gwangju FC", "Jeonbuk Hyundai Motors", "Daegu FC", "Incheon United", "FC Seoul", "Daejeon Hana Citizen", "Jeju United", "Gangwon FC", "Suwon FC", "Gimcheon Sangmu"],
  "Greece": ["Olympiacos", "PAOK Thessaloniki", "AEK Athens", "Panathinaikos", "Aris Thessaloniki", "Asteras Tripolis", "OFI Crete", "Atromitos", "PAS Giannina", "Lamia", "Panetolikos", "Volos NFC", "Panserraikos", "Kifisia"],
  "Australia": ["Sydney FC", "Melbourne Victory", "Melbourne City", "Western Sydney Wanderers", "Brisbane Roar", "Adelaide United", "Perth Glory", "Central Coast Mariners", "Wellington Phoenix", "Newcastle Jets", "Macarthur FC", "Western United"],
  "Morocco": ["Raja Casablanca", "Wydad Casablanca", "AS FAR Rabat", "RS Berkane", "FUS Rabat", "MAS Fès", "Ittihad Tanger", "Hassania Agadir", "Olympic Safi", "Moghreb Tétouan", "Jeunesse Soualem", "Renaissance Zemamra", "Union Touarga", "Chabab Mohammedia", "Youssoufia Berrechid", "Mouloudia Oujda"],
  "Egypt": ["Al Ahly SC", "Zamalek SC", "Pyramids FC", "Al Masry", "Ismaily SC", "Smouha SC", "Ceramica Cleopatra", "Modern Future FC", "National Bank of Egypt", "Ittihad Alexandria", "ENPPI", "Al Mokawloon Al Arab", "Pharco FC", "El Dakhleya", "Tala'ea El Gaish", "Baladeyet El Mahalla", "ZED FC", "El Gouna"],
  "South Africa": ["Mamelodi Sundowns", "Orlando Pirates", "Kaizer Chiefs", "SuperSport United", "Cape Town City", "Stellenbosch FC", "TS Galaxy", "Sekhukhune United", "AmaZulu FC", "Golden Arrows", "Chippa United", "Moroka Swallows", "Polokwane City", "Richards Bay", "Royal AM", "Cape Town Spurs"],
  "China": ["Shanghai Port", "Shanghai Shenhua", "Chengdu Rongcheng", "Beijing Guoan", "Shandong Taishan", "Tianjin Jinmen Tiger", "Zhejiang FC", "Wuhan Three Towns", "Henan FC", "Meizhou Hakka", "Cangzhou Mighty Lions", "Qingdao Hainiu", "Nantong Zhiyun", "Shenzhen Peng City", "Qingdao West Coast", "Sichuan Jiuniu"],
  "India": ["Mohun Bagan SG", "Mumbai City FC", "FC Goa", "Kerala Blasters", "Bengaluru FC", "Odisha FC", "East Bengal", "Chennaiyin FC", "Jamshedpur FC", "NorthEast United", "Hyderabad FC", "Punjab FC"],
  "Ecuador": ["LDU Quito", "Barcelona SC", "CS Emelec", "Independiente del Valle", "Aucas", "El Nacional", "Universidad Católica", "Delfín SC", "Deportivo Cuenca", "Orense SC", "Mushuc Runa", "Macará", "Técnico Universitario", "Imbabura SC", "Libertad FC", "Cumbayá FC"],
  "Peru": ["Universitario de Deportes", "Alianza Lima", "Sporting Cristal", "FBC Melgar", "Cusco FC", "Cienciano", "Sport Boys", "Universidad César Vallejo", "UTC Cajamarca", "ADT Tarma", "Deportivo Garcilaso", "Carlos A. Mannucci", "Atlético Grau", "Unión Comercio", "Comerciantes Unidos", "Los Chankas CYC"],
  "Venezuela": ["Deportivo Táchira", "Caracas FC", "Academia Puerto Cabello", "Portuguesa FC", "Metropolitanos FC", "Deportivo La Guaira", "Monagas SC", "Estudiantes de Mérida", "Carabobo FC", "Zamora FC", "Rayo Zuliano", "Angostura FC", "Universidad Central", "Inter de Barinas"],
  "Bolivia": ["Club Bolívar", "The Strongest", "Always Ready", "Jorge Wilstermann", "Blooming", "Oriente Petrolero", "Royal Pari", "Nacional Potosí", "Aurora", "Real Tomayapo", "Guabirá", "Universitario de Vinto", "Real Santa Cruz", "San Antonio Bulo Bulo"],
  "Paraguay": ["Club Olimpia", "Cerro Porteño", "Club Libertad", "Club Guaraní", "Club Nacional", "Sportivo Luqueño", "Sportivo Ameliano", "Tacuary FBC", "General Caballero JLM", "Sol de América", "Sportivo Trinidense", "2 de Mayo"],
  "Costa Rica": ["Deportivo Saprissa", "LD Alajuelense", "CS Herediano", "CS Cartaginés", "AD Guanacasteca", "AD San Carlos", "Santos de Guápiles", "Sporting San José", "Pérez Zeledón", "Liberia", "Puntarenas FC", "Grecia"],
  "Honduras": ["CD Olimpia", "Motagua", "Real España", "CD Marathón", "Olancho FC", "UPNFM", "CD Génesis", "CD Real Sociedad", "CD Victoria", "Vida"],
  "Switzerland": ["BSC Young Boys", "FC Basel", "FC Zürich", "Servette FC", "FC St. Gallen", "FC Lugano", "Grasshopper Club Zürich", "FC Winterthur", "FC Lausanne-Sport", "Yverdon Sport"],
  "Austria": ["Red Bull Salzburg", "Sturm Graz", "LASK Linz", "Rapid Wien", "Austria Wien", "Wolfsberger AC", "TSV Hartberg", "Austria Klagenfurt", "WSG Tirol", "SCR Altach", "Blau-Weiß Linz", "Lustenau"],
  "Ukraine": ["Shakhtar Donetsk", "Dynamo Kyiv", "Kryvbas Kryvyi Rih", "FC Dnipro-1", "Polissya Zhytomyr", "Rukh Lviv", "Vorskla Poltava", "Zorya Luhansk", "Kolos Kovalivka", "Chornomorets Odesa", "LNZ Cherkasy", "FC Oleksandriya", "Veres Rivne", "Obolon Kyiv", "Metalist 1925", "FC Minaj"],
  "Romania": ["FCSB", "CFR Cluj", "Universitatea Craiova", "Rapid București", "Farul Constanța", "Sepsi OSK", "FC Hermannstadt", "UTA Arad", "Oțelul Galați", "Petrolul Ploiești", "FC U Craiova 1948", "Dinamo București", "FC Voluntari", "Politehnica Iași", "FC Botoșani", "FC Universitatea Cluj"],
  "Serbia": ["Red Star Belgrade", "FK Partizan", "TSC Bačka Topola", "Čukarički", "Vojvodina", "Novi Pazar", "Radnički 1923", "Voždovac", "Spartak Subotica", "Javor Ivanjica", "IMT Belgrade", "Napredak Kruševac", "Radnik Surdulica", "Železničar Pančevo", "Radnički Niš", "Mladost Lučani"],
  "Republic of Serbia": ["Red Star Belgrade", "FK Partizan", "TSC Bačka Topola", "Čukarički", "Vojvodina", "Novi Pazar", "Radnički 1923", "Voždovac", "Spartak Subotica", "Javor Ivanjica", "IMT Belgrade", "Napredak Kruševac", "Radnik Surdulica", "Železničar Pančevo", "Radnički Niš", "Mladost Lučani"],
  "Croatia": ["Dinamo Zagreb", "Hajduk Split", "HNK Rijeka", "NK Osijek", "Lokomotiva Zagreb", "HNK Gorica", "Slaven Belupo", "NK Varaždin", "Istra 1961", "NK Rudeš"],
  "Czechia": ["Sparta Prague", "Slavia Prague", "Viktoria Plzeň", "Baník Ostrava", "Mladá Boleslav", "Slovácko", "Sigma Olomouc", "Slovan Liberec", "Hradec Králové", "Teplice", "Bohemians 1905", "Jablonec", "Pardubice", "Karviná", "České Budějovice", "Zlín"],
  "Czech Republic": ["Sparta Prague", "Slavia Prague", "Viktoria Plzeň", "Baník Ostrava", "Mladá Boleslav", "Slovácko", "Sigma Olomouc", "Slovan Liberec", "Hradec Králové", "Teplice", "Bohemians 1905", "Jablonec", "Pardubice", "Karviná", "České Budějovice", "Zlín"],
  "Poland": ["Jagiellonia Białystok", "Śląsk Wrocław", "Legia Warsaw", "Lech Poznań", "Górnik Zabrze", "Raków Częstochowa", "Pogoń Szczecin", "Zagłębie Lubin", "Widzew Łódź", "Piast Gliwice", "Stal Mielec", "Radomiak Radom", "Warta Poznań", "Cracovia", "Korona Kielce", "Puszcza Niepołomice", "Ruch Chorzów", "ŁKS Łódź"],
  "Trinidad and Tobago": ["Defence Force", "AC Port of Spain", "Club Sando", "Central FC", "W Connection", "Point Fortin Civic", "Police FC", "Caledonia AIA"],
  "Bosnia and Herzegovina": ["Zrinjski Mostar", "Borac Banja Luka", "FK Sarajevo", "Velež Mostar", "Željezničar", "Široki Brijeg", "Posušje", "Sloga Meridian", "Tuzla City", "Igman Konjic", "GOŠK Gabela", "Zvijezda 09"],
  "North Macedonia": ["KF Shkupi", "Struga Trim-Lum", "Shkëndija", "Sileks Kratovo", "Tikvesh Kavadarci", "KF Gostivar", "Bregalnica Štip", "Voska Sport", "FK Vardar", "Makedonija GP"],
  "Albania": ["KF Egnatia", "Partizani Tirana", "Vllaznia Shkodër", "KF Tirana", "Dinamo City", "KF Skënderbeu", "KF Laçi", "KF Teuta", "KF Erzeni", "FK Kukësi"],
  "Slovenia": ["NK Celje", "Olimpija Ljubljana", "NK Maribor", "FC Koper", "NK Bravo", "Mura", "Domžale", "Radomlje", "Rogaška", "Aluminij"],
  "Belarus": ["Dinamo Minsk", "Neman Grodno", "Torpedo-BelAZ Zhodino", "Isloch Minsk", "BATE Borisov", "FC Gomel", "FC Slutsk", "Dinamo Brest", "FC Smorgon", "Shakhtyor Soligorsk", "Belshina Bobruisk", "Naftan Novopolotsk", "Energetik-BGU", "Slavia Mozyr", "FC Minsk", "Arsenal Dzerzhinsk"],
  "Kazakhstan": ["Ordabasy Shymkent", "FC Astana", "Kairat Almaty", "FC Aktobe", "Kyzylzhar Petropavlovsk", "Shakhter Karagandy", "Tobol Kostanay", "Kaisar Kyzylorda", "FC Atyrau", "Zhetysu Taldykorgan", "FC Turan", "Elimai Semey"],
  "Uzbekistan": ["Pakhtakor Tashkent", "Nasaf Qarshi", "Navbahor Namangan", "Neftchi Fergana", "FC Bunyodkor", "Olympic Tashkent", "FC Andijan", "Sogdiana Jizzakh", "Surkhon Termez", "Metallurg Bekabad", "AGMK Olmaliq", "Qizilqum Zarafshon", "Turon Yaypan", "Buxoro FC", "Kokand 1912", "Mash'al Mubarek"],
  "Libya": ["Al-Ahli Tripoli", "Al-Ahli Benghazi", "Al-Ittihad Tripoli", "Al-Nasr Benghazi", "Al-Hilal Benghazi", "Al-Madina", "Asaria Club", "Abu Salim SC", "Al-Khums SC", "Asswehly SC", "Olympic Azzaweya", "Al-Sadaqa", "Al-Akhdar", "Al-Murooj", "Anwar", "Al-Tahaddy"],
  "Sudan": ["Al-Hilal Omdurman", "Al-Merrikh SC", "Al-Ahli Shendi", "Hay Al-Arab", "Al-Hilal Obayyid", "Al-Ahly Merowe", "Kober Khartoum", "Alamal Atbara", "Al-Ahli Khartoum", "Khartoum NC", "Tuti SC", "Haiderob Kanama", "Wad Nobawi", "Falah Atbara", "Zoma Khartoum", "Ahli Beit", "Rabta Kosti", "Police Kobar"],
  "Ethiopia": ["Saint George SC", "Bahir Dar Kenema", "Ethiopian Coffee", "Fasil Kenema", "Adama City FC", "Hadiya Hossana", "Hawassa City", "Wolkite City", "Sidama Coffee", "Dire Dawa City", "Mekelakeya", "Arba Minch City", "Wolaitta Dicha", "Shashemene City", "Hambericho Durame", "Ethiopia Insurance"],
  "Zimbabwe": ["Ngezi Platinum Stars", "Manica Diamonds", "Dynamos FC", "Highlanders FC", "FC Platinum", "Chicken Inn", "CAPS United", "Herentals FC", "Yadah FC", "Simba Bhora", "Hwange FC", "Bulawayo Chiefs", "ZPC Kariba", "Green Fuel", "Sheasham FC", "Triangle United"],
  "Zambia": ["Red Arrows FC", "ZESCO United", "Power Dynamos", "FC MUZA", "Kabwe Warriors", "Nkana FC", "Green Buffaloes", "Zanaco FC", "Green Eagles", "Mufulira Wanderers", "Forest Rangers", "NAPSA Stars", "Konkola Blades", "Mutondo Stars", "Trident FC", "Prison Leopards"],
  "Angola": ["Petro de Luanda", "Sagrada Esperança", "Primeiro de Agosto", "Wiliete de Benguela", "Interclube", "Académica do Lobito", "Santa Rita de Cássia", "Desportivo da Huíla", "Bravos do Maquis", "Sporting de Cabinda", "Kabuscorp S.C.", "Desportivo da Lunda Sul", "Sporting de Benguela", "Cuando Cubango FC", "Recreativo do Libolo", "ASK Dragão"],
  "Democratic Republic of the Congo": ["TP Mazembe", "AS Vita Club", "FC Saint-Éloi Lupopo", "DC Motema Pembe", "AS Maniema Union", "SM Sanga Balende", "JS Groupe Bazano", "FC Renaissance", "AC Kuya Sport", "Blessing FC", "US Tshinkunku", "AS Dauphins Noirs", "FC Simba", "Lubumbashi Sport", "AS Rangers", "US Panda"],
  "Mozambique": ["Ferroviário da Beira", "Associação Black Bulls", "Costa do Sol", "União Desportiva do Songo", "Ferroviário de Nampula", "Ferroviário de Maputo", "Ferroviário de Lichinga", "AD Vilankulo", "Baía de Pemba FC", "Textáfrica de Chimoio", "Desportivo de Nacala", "Matchedje de Maputo", "Ferroviário de Quelimane", "Ferroviário de Nacala"],
  "Cuba": ["FC Ciego de Ávila", "FC Santiago de Cuba", "FC Guantánamo", "FC Villa Clara", "FC Camagüey", "FC La Habana", "FC Las Tunas", "FC Cienfuegos", "FC Artemisa", "FC Pinar del Río", "FC Sancti Spíritus", "FC Holguín"],
  "El Salvador": ["Alianza FC", "CD FAS", "CD Águila", "Santa Tecla FC", "AD Isidro Metapán", "CD Municipal Limeño", "CD Luis Ángel Firpo", "CD Platense", "11 Deportivo", "CD Fuerte San Francisco"],
  "Nicaragua": ["Real Estelí FC", "Diriangén FC", "CD Walter Ferretti", "Managua FC", "ART Municipal Jalapa", "H&H Export Sébaco", "UNAN Managua", "Matagalpa FC", "Deportivo Ocotal", "Masachapa FC"],
  "Dominican Republic": ["Cibao FC", "Club Atlético Pantoja", "Moca FC", "Universidad O&M FC", "Atlético Vega Real", "Delfines del Este", "Atlético San Cristóbal", "Atlético San Francisco"],
  "Haiti": ["Violette AC", "Arcahaie FC", "Don Bosco FC", "Baltimore SC", "AS Capoise", "FICA", "Cavaly AS", "Tempête FC"],
  "Syria": ["Al-Futowa SC", "Al-Ittihad Ahli Aleppo", "Al-Jableh SC", "Al-Wathbah SC", "Al-Jaish SC", "Al-Karamah SC", "Tishreen SC", "Al-Taliya SC", "Al-Horiya", "Al-Sahel SC", "Al-Wahda SC", "Al-Wathba", "Al-Shorta", "Al-Jihad"],
  "Jordan": ["Al-Wehdat SC", "Al-Faisaly SC", "Al-Hussein Irbid", "Shabab Al-Ordon", "Al-Ramtha SC", "FC Ma'an", "Shabab Al-Aqaba", "Moghayer Al-SarhanSC", "Sahab SC", "Al-Jalil", "Salt SC", "Al-Ahli Amman"],
  "Lebanon": ["Al-Ansar FC", "Nejmeh SC", "Al-Ahed FC", "Shabab Al-Sahel", "Safa SC", "Racing Beirut", "Tripoli SC", "Tadamon Sour"],
  "Kuwait": ["Al-Kuwait SC", "Al-Qadsia SC", "Al-Arabi SC", "Kazma SC", "Salmiya SC", "Fahaheel FC", "Al-Jahra SC", "Khaitan SC", "Al-Nasr SC", "Al-Shabab SC"],
  "Bahrain": ["Riffa SC", "Al-Khaldiya", "Al-Muharraq SC", "Manama Club", "Al-Ahli Club", "East Riffa Club", "Hidd SCC", "Busaiteen Club"],
  "Oman": ["Al-Seeb Club", "Al-Nahda Club", "Dhofar Club", "Sohar SC", "Oman Club", "Al-Rustaq", "Bahla Club", "Sur SC", "Al-Nasr Salalah", "Al-Shabab", "Ibri Club", "Al-Wahda"],
  "Yemen": ["Al-Ahli Sana'a", "Al-Wehda Sana'a", "Al-Tilal SC", "Shaab Hadramaut", "Al-Saqr SC", "Shaab Ibb", "Al-Shula", "Yarmuk Al-Sana'a", "Al-Hilal Al-Hudaydah", "Al-Ittihad Ibb", "Samarra SC", "Al-Oruba"],
  "Pakistan": ["KRL FC", "Pakistan Army FC", "WAPDA FC", "Pakistan Air Force FC", "Karachi Port Trust", "Civil Aviation Authority FC", "Sui Southern Gas Company FC", "Lyallpur FC"],
  "Bangladesh": ["Bashundhara Kings", "Abahani Limited Dhaka", "Mohammedan SC", "Sheikh Russel KC", "Sheikh Jamal DC", "Bangladesh Police FC", "Rahmatganj MFS", "Brothers Union", "Fortis FC", "Chittagong Abahani FC", "Sheikh Russel", "Sheikh Jamal", "Uttara FC"],
  "Myanmar": ["Shan United FC", "Yangon United FC", "Hantharwady United", "Mahar United", "Yadanarbon FC", "Myawady FC", "ISPE FC", "Dagon Star United FC"],
  "Philippines": ["United City FC", "Kaya FC-Iloilo", "Stallion Laguna FC", "Dynamic Herb Cebu FC", "Mendiola FC 1991", "Maharlika Manila FC", "Philippine Army FC", "Philippine Air Force FC"],
  "Cambodia": ["Phnom Penh Crown FC", "Preah Khan Reach Svay Rieng FC", "Visakha FC", "Boeung Ket FC", "Nagaworld FC", "Angkor Tiger FC", "Kirivong Sok Sen Chey FC", "ISI Dangkor Senchey FC", "Tiffy Army FC", "Prey Veng FC"],
  "Mongolia": ["SP Falcons", "Ulaanbaatar City FC", "FC Ulaanbaatar", "Deren FC", "Khangarid FC", "Tuv Buganuud FC", "Khaan Khuns-Erchim FC", "Khoromkhon FC"]
};

// Procedural realistic suffixes to generate names if custom list is absent
const prefixes = ["FC", "Club", "Deportivo", "Real", "Atlético", "Sporting", "United", "Rovers", "City", "Athletic", "Independiente"];

async function seedLeaguesAndTeams() {
  console.log("🌱 Database Seeding: Syncing leagues and teams tables...");
  
  // Guarantee tables exist
  await League.sync();
  await Team.sync();

  const existingLeaguesCount = await League.count();
  if (existingLeaguesCount > 0) {
    console.log(`✅ Leagues and teams already seeded (${existingLeaguesCount} leagues). Skipping.`);
    return;
  }

  console.log("🚀 Seeding 81 leagues and their respective teams...");

  for (const [countryKey, details] of Object.entries(leagueData)) {
    try {
      // Create League record
      const leagueRecord = await League.create({
        name: details.league,
        country: countryKey,
        flagIso: details.flagIso
      });

      // Fetch or generate teams list
      let teamsList = customTeams[countryKey] || [];
      
      if (teamsList.length === 0) {
        // Procedurally generate realistic teams
        const cleanName = details.name.replace(/[^a-zA-ZáéíóúñÁÉÍÓÚÑ ]/g, '').trim();
        const generated = new Set();
        
        // Always generate at least 8 realistic looking clubs
        while (generated.size < 8) {
          const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
          let name = "";
          if (Math.random() > 0.5) {
            name = `${prefix} ${cleanName}`;
          } else {
            name = `${cleanName} ${prefix}`;
          }
          // Avoid exactly identical names
          if (generated.size === 0) {
            name = `${cleanName} FC`;
          } else if (generated.size === 1) {
            name = `Atlético ${cleanName}`;
          } else if (generated.size === 2) {
            name = `${cleanName} United`;
          } else if (generated.size === 3) {
            name = `Real ${cleanName}`;
          } else if (generated.size === 4) {
            name = `Deportivo ${cleanName}`;
          } else if (generated.size === 5) {
            name = `${cleanName} City`;
          } else if (generated.size === 6) {
            name = `${cleanName} Wanderers`;
          } else if (generated.size === 7) {
            name = `Sporting ${cleanName}`;
          }
          generated.add(name);
        }
        teamsList = Array.from(generated);
      }

      // Add all teams in bulk
      const teamRecords = teamsList.map(teamName => ({
        name: teamName,
        leagueName: details.league,
        country: countryKey
      }));

      await Team.bulkCreate(teamRecords);
      console.log(`  - Seeded ${countryKey} (${details.league}) with ${teamsList.length} teams.`);
    } catch (err) {
      console.error(`  ❌ Error seeding ${countryKey}:`, err.message);
    }
  }

  console.log("🏁 League and Team database seeding completed successfully!");
}

module.exports = seedLeaguesAndTeams;
