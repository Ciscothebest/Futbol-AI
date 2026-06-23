const fs = require('fs');

// ── DATA POOLS ──────────────────────────────────────────────────────────────

const LEAGUES = [
  { name: 'La Liga', teams: ['Real Madrid','FC Barcelona','Atlético de Madrid','Sevilla FC','Valencia CF','Villarreal CF','Athletic Club','Real Sociedad','Real Betis','Celta Vigo','Rayo Vallecano','Girona FC','UD Las Palmas','RCD Mallorca','Getafe CF','CD Leganés','RCD Espanyol','Deportivo Alavés','Real Valladolid','Osasuna'] },
  { name: 'Premier League', teams: ['Manchester City','Arsenal','Liverpool','Chelsea','Manchester United','Tottenham Hotspur','Newcastle United','West Ham United','Aston Villa','Brighton & Hove Albion','Brentford','Crystal Palace','Everton','Wolverhampton Wanderers','Fulham','AFC Bournemouth','Nottingham Forest','Leicester City','Ipswich Town','Southampton'] },
  { name: 'Bundesliga', teams: ['Bayern München','Bayer 04 Leverkusen','Borussia Dortmund','RB Leipzig','Eintracht Frankfurt','VfB Stuttgart','1. FC Union Berlin','Werder Bremen','SC Freiburg','VfL Wolfsburg','TSG Hoffenheim','1. FSV Mainz 05','FC Augsburg','Borussia Mönchengladbach','VfL Bochum','1. FC Heidenheim','FC St. Pauli','Holstein Kiel'] },
  { name: 'Serie A', teams: ['Inter Milan','AC Milan','Juventus','Napoli','Atalanta','AS Roma','SS Lazio','Fiorentina','Torino','Bologna','Genoa','Monza','Lecce','Udinese','Empoli','Como 1907','Venezia','Hellas Verona','Cagliari','Parma'] },
  { name: 'Ligue 1', teams: ['Paris Saint-Germain','AS Monaco','Olympique Lyonnais','Olympique de Marseille','LOSC Lille','OGC Nice','Stade Rennais','RC Lens','FC Nantes','RC Strasbourg','Montpellier HSC','Stade de Reims','Toulouse FC','AJ Auxerre','Le Havre AC','Stade Brestois 29','Angers SCO','AS Saint-Étienne'] },
  { name: 'Eredivisie', teams: ['Ajax','PSV Eindhoven','Feyenoord','AZ Alkmaar','FC Utrecht','FC Twente','NEC Nijmegen','SC Heerenveen','Sparta Rotterdam','Go Ahead Eagles','RKC Waalwijk','PEC Zwolle'] },
  { name: 'Primeira Liga', teams: ['SL Benfica','FC Porto','Sporting CP','SC Braga','Vitória SC','Rio Ave FC','Moreirense FC','Santa Clara','Boavista FC','Casa Pia AC','FC Famalicão','GD Chaves'] },
  { name: 'Super Lig', teams: ['Galatasaray','Fenerbahçe','Beşiktaş JK','Trabzonspor','Başakşehir FK','Sivasspor','Gaziantep FK','Konyaspor','Kasımpaşa','Kayserispor','Hatayspor','Ankaragücü'] },
  { name: 'Brasileirão', teams: ['CR Flamengo','SE Palmeiras','Santos FC','São Paulo FC','Grêmio','SC Internacional','SC Corinthians','Atlético Mineiro','Fluminense','Botafogo','Vasco da Gama','Cruzeiro','RB Bragantino','Fortaleza','Ceará','Sport Recife','Cuiabá','Goiás','América MG','Juventude'] },
  { name: 'Liga MX', teams: ['Club América','CD Guadalajara','Cruz Azul','Pumas UNAM','Tigres UANL','CF Monterrey','Club León','Club Pachuca','Atlas FC','Club Tijuana','Santos Laguna','Toluca','Querétaro','FC Juárez','Mazatlán FC','Puebla FC','Necaxa','San Luis'] },
  { name: 'Argentine Primera', teams: ['Boca Juniors','River Plate','San Lorenzo','Racing Club','Independiente','Vélez Sársfield','Huracán','Lanús','Talleres','Estudiantes','Banfield','Colón','Defensa y Justicia','Godoy Cruz','Platense','Argentinos Juniors','Rosario Central','Newell\'s Old Boys','Sarmiento','Instituto'] },
  { name: 'Saudi Pro League', teams: ['Al-Nassr FC','Al-Hilal SFC','Al-Ittihad Club','Al-Ahli SFC','Al-Qadsiah','Al-Shabab FC','Al-Fateh SC','Al-Wehda FC','Al-Feiha','Al-Khaleej','Damac FC','Al-Okhdood'] },
  { name: 'MLS', teams: ['Inter Miami CF','LA Galaxy','New York City FC','Seattle Sounders FC','Portland Timbers','Atlanta United','Columbus Crew','Philadelphia Union','New England Revolution','FC Cincinnati','Toronto FC','Vancouver Whitecaps','Austin FC','Nashville SC','Charlotte FC'] },
  { name: 'Scottish Premiership', teams: ['Celtic FC','Rangers FC','Heart of Midlothian','Hibernian FC','Aberdeen FC','Dundee United','St Mirren','Motherwell','Livingston','Kilmarnock'] },
  { name: 'Belgian Pro League', teams: ['Club Brugge','RSC Anderlecht','KAA Gent','Royale Union SG','KV Mechelen','Standard Liège','KRC Genk','Beerschot','Cercle Brugge','Westerlo'] },
  { name: 'J1 League', teams: ['Vissel Kobe','Gamba Osaka','FC Tokyo','Urawa Red Diamonds','Kawasaki Frontale','Yokohama F. Marinos','Nagoya Grampus','Kashima Antlers','Cerezo Osaka','Sagan Tosu','Shimizu S-Pulse','Albirex Niigata'] },
  { name: 'Eliteserien', teams: ['Rosenborg BK','Molde FK','Brann','Viking FK','Bodø/Glimt','Stabæk','HamKam','Lillestrøm','Strømsgodset','Odd'] },
  { name: 'Allsvenskan', teams: ['Malmö FF','IFK Göteborg','Djurgårdens IF','AIK','Hammarby IF','IF Elfsborg','Helsingborg IF','Kalmar FF','IFK Norrköping','BK Häcken'] },
  { name: 'Süper Lig (Austria)', teams: ['FC Red Bull Salzburg','SK Rapid Wien','FK Austria Wien','LASK','Wolfsberger AC','SCR Altach','WSG Tirol','SV Ried','Rheindorf Altach'] },
  { name: 'Chinese Super League', teams: ['Shanghai Port','Shandong Taishan','Beijing Guoan','Guangzhou FC','Wuhan Three Towns','Tianjin Jinmen Tiger','Chengdu Rongcheng','Dalian Professional'] },
];

const NATIONALITIES = [
  { nat:'Spanish', flag:'🇪🇸', fn:['Alejandro','Carlos','Diego','Fernando','Gonzalo','Iván','Javier','Luis','Marco','Pablo','Rodrigo','Sergio','Tomás','Víctor','Álvaro','Borja','Dani','Iker','Mikel','Pedro','Raúl','Rubén','Saúl','Álex','Edu','Ferran','Gavi','Hugo','Kike','Marc','Oscar','Rafa','Santi','Toni','Xavi','Yago','Aymeric','Ceballos','Merino','Laporte'], ln:['García','Rodríguez','Martínez','López','González','Pérez','Sánchez','Torres','Ruiz','Romero','Díaz','Morales','Jiménez','Álvarez','Ramos','Villa','Navas','Morata','Asensio','Busquets','Canales','Laporte','Sarabia','Azpilicueta','Jordi','Carvajal','Albiol','Bartra','Reguilón','Oyarzabal','Merino','Pedri','Gavi','Yamal','Ferran','Alonso','Iraola','Valverde','Domínguez','Olmo'] },
  { nat:'English', flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', fn:['Aaron','Ben','Callum','Danny','Ethan','George','Harry','Jack','James','Jordan','Kieran','Lewis','Marcus','Nathan','Oliver','Phil','Raheem','Sam','Theo','Alex','Bradley','Chris','Dean','Freddie','Gary','Harvey','Josh','Kyle','Liam','Mason','Ollie','Patrick','Ryan','Scott','Trent','Cole','Noni','Curtis','Angel','Levi'], ln:['Smith','Jones','Williams','Taylor','Brown','Davies','Evans','Wilson','Thomas','Roberts','Johnson','Walker','Wright','Thompson','Robinson','White','Hughes','Sterling','Saka','Mount','Alexander-Arnold','Trippier','Stones','Shaw','Grealish','Rashford','Palmer','Madueke','Gallagher','Gordon','Guehi','Konsa','Quansah','Kelly','Mainoo','Wharton','Bowen','Calvert-Lewin'] },
  { nat:'French', flag:'🇫🇷', fn:['Antoine','Benjamin','Christopher','Dimitri','Emmanuel','Florian','Hugo','Jonathan','Kevin','Loïc','Mathieu','Nicolas','Ousmane','Paul','Raphaël','Sébastien','Théo','Wissam','Adrien','Bruno','Clément','Dayot','Edouard','Gael','Hector','Ibrahima','Jules','Kingsley','Lucas','Moussa','Nabil','Olivier','William','Rayan','Amine','Michael','Randal','Chrislain'], ln:['Dupont','Martin','Bernard','Dubois','Thomas','Robert','Pavard','Koundé','Upamecano','Saliba','Camavinga','Tchouaméni','Rabiot','Dembélé','Giroud','Thuram','Kanté','Coman','Hernández','Varane','Maignan','Konaté','Clauss','Guendouzi','Terrier','Olise','Cherki','Lukeba','Koné','Barcola','Nzola','Semedo','Diallo','Kalimuendo','Zaire-Emery'] },
  { nat:'German', flag:'🇩🇪', fn:['Alexander','Benjamin','Christian','David','Erik','Florian','Jonas','Kai','Leroy','Marco','Niklas','Oliver','Paul','Robert','Sebastian','Thomas','Andre','Bernd','Dario','Emre','Felix','Gregor','Ilkay','Jonathan','Kevin','Leon','Matthias','Philipp','Jamal','Xabi','Mergim'], ln:['Müller','Schmidt','Schneider','Fischer','Weber','Meyer','Wagner','Kroos','Neuer','Süle','Kimmich','Goretzka','Gnabry','Sané','Havertz','Werner','Rüdiger','Hummels','Brandt','Can','Gündogan','Ter Stegen','Koch','Klostermann','Kehrer','Musiala','Wirtz','Nmecha','Mittelstädt','Tah','Anton','Undav','Beier','Burkardt'] },
  { nat:'Brazilian', flag:'🇧🇷', fn:['Gabriel','Lucas','Matheus','Raphael','Bruno','Felipe','Anderson','Douglas','Marcelo','Rodrigo','Thiago','Willian','Everton','Fabinho','Gerson','Jorge','Patrick','Alexandre','Carlos','Danilo','Eder','Firmino','Guilherme','João','Kaio','Leonardo','Pedro','Endrick','Savinho','Estevão','Luiz','Gleison','Weverton','Ederson'], ln:['da Silva','Santos','Oliveira','Souza','Lima','Pereira','Costa','Alves','Rocha','Richarlison','Casemiro','Rodrygo','Militão','Antony','Cavalcanti','Fernandes','Aguiar','Araújo','Moreira','Gomes','Carvalho','Barbosa','Bremer','Renan','Cunha','Paquetá','Martinelli','Marcelino','Guimarães','Vitor Roque'] },
  { nat:'Argentine', flag:'🇦🇷', fn:['Lionel','Sergio','Ángel','Paulo','Rodrigo','Federico','Gonzalo','Marcos','Juan','Carlos','Diego','Ezequiel','Franco','Gabriel','Leandro','Matías','Óscar','Sebastián','Tomás','Valentín','Alexis','Bautista','Claudio','Damián','Emiliano','Fernando','Lautaro','Julián','Enzo','Alejandro','Thiago','Nicolás','Nahuel'], ln:['García','González','Rodríguez','Fernández','López','Martínez','Sánchez','Romero','Torres','Díaz','Otamendi','Dybala','Lautaro','De Paul','Mac Allister','Acuña','Molina','Tagliafico','Almada','Buonanotte','Carboni','Gaich','Ibáñez','Kranevitter','Funes Mori','Scaloni','Correa','Pezzella','Guido','Musso','Montiel','Ocampos','Lo Celso','Alario'] },
  { nat:'Portuguese', flag:'🇵🇹', fn:['Cristiano','Bruno','João','Rúben','Rafael','Diogo','Bernardo','Pedro','Luís','André','Álvaro','Carlos','Eduardo','Francisco','Gonçalo','Hélder','Ivo','Kelvin','Nani','Ricardo','Sérgio','Tiago','Vítor','Renato','João Félix','Vitinha','Florentino','Mateus','Gedson','Chiquinho'], ln:['Silva','Santos','Ferreira','Pereira','Costa','Rodrigues','Martins','Sousa','Lopes','Gonçalves','Fernandes','Dias','Neves','Jota','Leão','Guedes','Dalot','Semedo','Guerreiro','Cancelo','Moutinho','Carvalho','Palinha','Horta','Trincão','Ramos','Borges','Inácio','Araújo','Moura'] },
  { nat:'Italian', flag:'🇮🇹', fn:['Alessandro','Andrea','Carlo','Davide','Emanuele','Federico','Giorgio','Lorenzo','Marco','Nicolò','Roberto','Tommaso','Antonio','Cristian','Daniele','Edoardo','Filippo','Giacomo','Ivan','Leonardo','Matteo','Nicola','Salvatore','Giovanni','Francesco','Gianluca','Sandro','Stephan','Wilfred'], ln:['Ferrari','Russo','Esposito','Bianchi','Colombo','Ricci','Marino','Greco','Bruno','Conti','Donnarumma','Barella','Immobile','Pellegrini','Locatelli','Cristante','Vicario','Scalvini','Frattesi','Retegui','Raspadori','Scamacca','Zaccagni','Bastoni','Dimarco','Acerbi','Gatti','Fagioli','Nicolussi','Calabria','Tonali','Miretti'] },
  { nat:'Dutch', flag:'🇳🇱', fn:['Virgil','Memphis','Daley','Frenkie','Matthijs','Cody','Donyell','Georginio','Kenny','Luuk','Ryan','Steven','Arjen','Bas','Calvin','Donny','Jeremie','Jurriën','Lars','Marten','Noussair','Quilindschy','Tijjani','Wout','Xavi','Sven','Brian','Devyne','Miles','Djessy'], ln:['van Dijk','Depay','Blind','de Jong','de Ligt','Gakpo','Malen','Wijnaldum','Ake','Bergwijn','Dumfries','Gravenberch','Frimpong','Timber','Sugawara','van de Ven','Veerman','Xavi Simons','Zirkzee','Weghorst','Brobbey','Reijnders','de Vrij','Hartman','Hateboer','Teze','Boscagli','van den Berg','Koopmeiners','Stengs'] },
  { nat:'Colombian', flag:'🇨🇴', fn:['James','Radamel','Luis','Yerry','Jhon','Duván','Carlos','Freddy','Arturo','Camilo','David','Edwin','Fernando','Hernán','Iván','Javier','Kevin','Lerma','Miguel','Nicolás','Oscar','Pabló','Rolan','Cucho','Jhon','Richard','Johan','Jefferson','Déiver','Gustavo'], ln:['Rodríguez','Falcao','Díaz','Mina','Córdoba','Zapata','Bacca','Sánchez','Barrios','Cuesta','Dávila','Escobar','Figueroa','García','Hinestroza','Ibargüen','Arias','Borja','Cataño','Durán','Echeverri','Fernández','Gómez','Herrera','Jiménez','Loaiza','Hernández','Lerma','Palacios','Mojica'] },
  { nat:'Mexican', flag:'🇲🇽', fn:['Hirving','Javier','Miguel','Raúl','Guillermo','Hugo','Andrés','Diego','Edson','Héctor','Julio','Óscar','Carlos','Marco','Arturo','Eduardo','Henry','Orbelín','Roberto','Chucky'], ln:['Lozano','Hernández','Layún','Jiménez','Ochoa','Araujo','Moreno','Guardado','Corona','Piñeda','Antuna','Rodríguez','Álvarez','Sánchez','Sánchez Meza','Pineda','Ugarte','Huerta','Alvarado','Sánchez'] },
  { nat:'Senegalese', flag:'🇸🇳', fn:['Sadio','Kalidou','Cheikhou','Idrissa','Ismaila','Mbaye','Pape','Abdou','Badou','Cheikh','El Hadji','Famara','Habib','Iliman','Nicolas','Boulaye'], ln:['Mané','Koulibaly','Kouyaté','Gueye','Sarr','Niang','Diédhiou','Sow','Ba','Diallo','Ndoye','Diouf','Diop','Cissé','Mbaye','Dia','Jakobs','Jackson'] },
  { nat:'Moroccan', flag:'🇲🇦', fn:['Hakim','Achraf','Youssef','Sofyan','Noussair','Zakaria','Ilias','Amine','Brahim','Azar','Badr','Jawad','Azzedine','Anass','Munir','Abde'], ln:['Ziyech','Hakimi','En-Nesyri','Amrabat','Mazraoui','Ounahi','Chair','Harit','Saiss','Diaz','Cheddira','El Rhazi','Benhammou','Benrahma','El Khannouss','Ezzalzouli'] },
  { nat:'Nigerian', flag:'🇳🇬', fn:['Victor','Wilfred','Samuel','Alex','Joe','Kelechi','Taiwo','Cyriel','Ebere','Folarin','Gbenga','Hakeem','Ike','John','Kenneth','Simy','Ola'], ln:['Osimhen','Ndidi','Chukwueze','Iwobi','Aribo','Simon','Iheanacho','Awoniyi','Dessers','Eze','Balogun','Ejuke','Lookman','Troost-Ekong','Obi','Ugarte','Olayinka'] },
  { nat:'Japanese', flag:'🇯🇵', fn:['Takumi','Wataru','Junya','Daichi','Kaoru','Reo','Yuya','Ao','Hiroki','Keito','Koki','Kyogo','Ritsu','Takefusa','Shoya','Hidemasa','Koji','Yuki','Kota','Mao'], ln:['Minamino','Endo','Ito','Kamada','Mitoma','Ueda','Osako','Tanaka','Hatate','Furuhashi','Doan','Asano','Tomiyasu','Kubo','Nakamura','Morita','Machino','Suzuki','Sakai','Maehashi'] },
  { nat:'South Korean', flag:'🇰🇷', fn:['Heung-min','Hwang','Kang-in','Min-jae','Woo-yeong','Seung-ho','Cho','Kwon','Oh','Han','Choi','Yoon','Min','Seung','Chang','Lee','Park'], ln:['Son','In-beom','Lee','Kim','Hee-chan','Chang-ryong','Gue-sung','Hyeon-gyu','Jae-won','Tae-hwan','Jae-sung','Sung-ryong','Ji-hoon','Hyun-jun','Jae-sung','Bo-seong','Ui-jo'] },
  { nat:'Croatian', flag:'🇭🇷', fn:['Luka','Ivan','Mateo','Marcelo','Domagoj','Nikola','Ante','Mario','Marko','Josip','Borna','Bruno','Andrej','Lovro','Petar'], ln:['Modrić','Perišić','Kovačić','Brozović','Vida','Vlašić','Budimir','Pašalić','Rebić','Sutalo','Sosa','Petković','Kramarić','Majer','Fali'] },
  { nat:'Polish', flag:'🇵🇱', fn:['Robert','Wojciech','Piotr','Kamil','Bartosz','Marek','Jakub','Arkadiusz','Sebastian','Krzysztof','Michał','Damian','Karol','Szymon','Rafał'], ln:['Lewandowski','Szczęsny','Zieliński','Glik','Bereszyński','Frankowski','Moder','Milik','Szymański','Piątek','Bielik','Klich','Świderski','Żurkowski','Kałuziński'] },
  { nat:'Serbian', flag:'🇷🇸', fn:['Aleksandar','Nemanja','Dušan','Filip','Luka','Strahinja','Andrija','Branislav','Dejan','Ivan','Nikola','Sergej','Sasa','Lazar','Stefan'], ln:['Mitrović','Vidić','Vlahović','Kostić','Jović','Pavlović','Ivanović','Stanković','Gudelj','Maksimović','Milinković-Savić','Eraković','Terzić','Lazović','Tadić'] },
  { nat:'Uruguayan', flag:'🇺🇾', fn:['Luis','Diego','Edinson','Rodrigo','Darwin','Federico','Nahitan','Matías','Ronald','José','Agustín','Brian','Fernando','Giorgian','Maxi'], ln:['Suárez','Godín','Cavani','Betancur','Núñez','Valverde','Nández','Vecino','Araújo','Giménez','Cantera','Rodríguez','Muslera','De Arrascaeta','Olivera'] },
  { nat:'Belgian', flag:'🇧🇪', fn:['Kevin','Eden','Romelu','Dries','Toby','Jan','Axel','Yannick','Leandro','Timothy','Charles','Orel','Thomas','Youri','Lois','Aster'], ln:['De Bruyne','Hazard','Lukaku','Mertens','Alderweireld','Vertonghen','Witsel','Carrasco','Trossard','Castagne','De Ketelaere','Mangala','Meunier','Tielemans','Openda','Vranckx'] },
  { nat:'Swiss', flag:'🇨🇭', fn:['Granit','Xherdan','Haris','Breel','Ricardo','Fabian','Silvan','Nico','Noah','Remo','Michel','Renato','Dan','Ardon','Kwadwo'], ln:['Xhaka','Shaqiri','Seferović','Embolo','Rodríguez','Schär','Widmer','Elvedi','Okafor','Freuler','Aebischer','Steffen','Ndoye','Jashari','Akanji'] },
  { nat:'Ukrainian', flag:'🇺🇦', fn:['Andriy','Oleksandr','Roman','Mykhailo','Viktor','Artem','Serhiy','Vitaliy','Denys','Taras','Georgiy','Oleksiy','Vladyslav'], ln:['Zinchenko','Yaremchuk','Mudryk','Tsygankov','Dovbyk','Yarmolenko','Mikolenko','Bezus','Stepanenko','Malinovsky','Trubin','Mykhaylichenko','Vanat'] },
  { nat:'Austrian', flag:'🇦🇹', fn:['Marcel','David','Marko','Florian','Stefan','Christoph','Andreas','Kevin','Lukas','Nicolas','Patrick','Valentino'], ln:['Sabitzer','Alaba','Arnautovic','Kainz','Lainer','Trimmel','Wimmer','Danso','Seiwald','Grillitsch','Wimmer','Laimer'] },
  { nat:'Egyptian', flag:'🇪🇬', fn:['Mohamed','Omar','Mostafa','Ramadan','Ahmed','Karim','Trezeguet','Tarek','Zizo','Marwan','Mahmoud'], ln:['Salah','Marmoush','Mohamed','Sobhi','Elsaid','Hafez','Hamdy','Hamed','Ibrahim','Ashraf','Gabaski'] },
  { nat:'American', flag:'🇺🇸', fn:['Weston','Christian','Giovanni','Tyler','Yunus','Matt','Tim','Aaron','Brenden','Cameron','DeAndre','Folarin','Josh','Miles','Malik'], ln:['McKennie','Pulisic','Reyna','Adams','Musah','Turner','Ream','Long','Aaronson','Carter-Vickers','Yedlin','Balogun','Sargent','Robinson','Tillman'] },
  { nat:'Ivorian', flag:'🇨🇮', fn:['Didier','Wilfried','Franck','Max','Nicolas','Serge','Christian','Gervinho','Cheick','Sébastien','Hamed','Simon'], ln:['Drogba','Zaha','Kessié','Gradel','Pépé','Aurier','Diallo','Doumbia','Dao','Koné','Traoré','Adingra'] },
  { nat:'Cameroonian', flag:'🇨🇲', fn:['Eric','Nicolas','Andre-Frank','Clinton','Karl','Georges','Vincent','Jean','Gaëtan','Martin','Harold'], ln:['Choupo-Moting','Nkoulou','Zambo Anguissa','Njie','Toko Ekambi','Aboubakar','Mabiala','Castelletto','Hongla','Ondoa','Mbing'] },
  { nat:'Ghanaian', flag:'🇬🇭', fn:['Thomas','Jordan','Mohammed','Abdul','Antoine','Benjamin','Daniel','Emmanuel','Frank','Kudus','Inaki','Edmund'], ln:['Partey','Ayew','Salisu','Semenyo','Mensah','Amartey','Kyeremateng','Kudus','Mohammed','Williams','Korsah','Paintsil'] },
  { nat:'Turkish', flag:'🇹🇷', fn:['Hakan','Arda','Kenan','Ferdi','Samet','Orkun','Zeki','Cengiz','Merih','Kaan','Yusuf','Okay'], ln:['Çalhanoğlu','Güler','Yıldız','Kadıoğlu','Bayındır','Kökçü','Çelik','Ünder','Demiral','Ayhan','Yazıcı','Kabak'] },
  { nat:'Danish', flag:'🇩🇰', fn:['Christian','Pierre-Emile','Kasper','Simon','Joachim','Mikkel','Andreas','Daniel','Victor','Joakim','Jonas','Rasmus'], ln:['Eriksen','Højbjerg','Schmeichel','Kjær','Andersen','Damsgaard','Cornelius','Wass','Nelsson','Mæhle','Wind','Hojlund'] },
  { nat:'Czech', flag:'🇨🇿', fn:['Tomáš','Petr','Pavel','Jan','Vladimír','Ondřej','Lukáš','Marek','Aleš','Patrik','Antonín'], ln:['Souček','Čech','Nedvěd','Koller','Rosický','Hlozek','Kuchta','Provod','Barák','Schick','Jurásek'] },
  { nat:'Chilean', flag:'🇨🇱', fn:['Alexis','Arturo','Gary','Charles','Claudio','Erick','Felipe','Jean','Ben','Marcelino'], ln:['Sánchez','Vidal','Medel','Aránguiz','Bravo','Pulgar','Orellana','Beausejour','Brereton','Díaz'] },
  { nat:'Peruvian', flag:'🇵🇪', fn:['Paolo','Jefferson','Aldo','André','Bryan','Gianluca','Luis','Edison','Christian','Raúl'], ln:['Guerrero','Farfán','Corzo','Carrillo','Reyna','Lapadula','Abram','Flores','Cueva','Ruidiaz'] },
  { nat:'Ecuadorian', flag:'🇪🇨', fn:['Enner','Antonio','Gonzalo','Pervis','Xavier','Moisés','Roberto','Djorkaeff','Piero','Byron'], ln:['Valencia','Valencia','Plata','Estupiñan','Arreaga','Caicedo','Arboleda','Minda','Hincapié','Castillo'] },
  { nat:'Paraguayan', flag:'🇵🇾', fn:['Roque','Óscar','Gastón','Junior','Ángel','Jorge','Fabrizio','Iván','Mathías','Santiago'], ln:['Santa Cruz','Cardozo','Giménez','Alcaraz','Romero','Enciso','Bengoa','González','Villasanti','Gómez'] },
  { nat:'Bolivian', flag:'🇧🇴', fn:['Marcelo','Roberto','Álvaro','Juan Carlos','Erwin','Raúl','Jaume','Leonel','Henry','Gilbert'], ln:['Martins','Fernández','Justiniano','Arce','Flores','Castro','Cuéllar','Chumacero','Vaca','Álvarez'] },
  { nat:'Iranian', flag:'🇮🇷', fn:['Sardar','Mehdi','Ali','Ramin','Saman','Alireza','Omid','Masoud','Mehdi','Ramtin'], ln:['Azmoun','Taremi','Beiranvand','Rezaeian','Ghoddos','Jahanbakhsh','Ebrahimi','Salehi','Hosseini','Amiri'] },
  { nat:'Saudi', flag:'🇸🇦', fn:['Saleh','Salem','Faris','Yasser','Sami','Riyadh','Hassan','Abdullah','Mohammed','Saad'], ln:['Al-Dawsari','Al-Dawsari','Al-Buraikan','Al-Shahrani','Al-Owais','Khib','Al-Ghannam','Al-Khaibri','Kanno','Alburaikan'] },
  { nat:'Algerian', flag:'🇩🇿', fn:['Riyad','Islam','Said','Sofiane','Andy','Billal','Mohamed','Haris','Djamel','Youcef'], ln:['Mahrez','Slimani','Benguit','Feghouli','Delort','Brahimi','Rafik','Belaïli','Bensebaïni','Atal'] },
  { nat:'Tunisian', flag:'🇹🇳', fn:['Wahbi','Youssef','Hamza','Naïm','Dylan','Hannibal','Ellyes','Aissa','Mortadha','Ali'], ln:['Khazri','Msakni','Mengouchi','Sliti','Bronn','Mejbri','Skhiri','Laïdouni','Ben Romdhane','Mathlouthi'] },
  { nat:'Scottish', flag:'🏴󠁧󠁢󠁳󠁣󠁴󠁿', fn:['Andrew','John','Scott','Craig','James','David','Ryan','Kevin','Kieran','Liam'], ln:['Tierney','McGinn','McTominay','Robertson','Cooper','Gilmour','Christie','Dykes','Porteous','Gauld'] },
  { nat:'Welsh', flag:'🏴󠁧󠁢󠁷󠁬󠁳󠁿', fn:['Gareth','Aaron','Neco','Connor','Joe','Ben','Tyler','Sorba','Kieffer','Matthew'], ln:['Bale','Ramsey','Williams','Roberts','Allen','Davies','Roberts','Thomas','Moore','Smith'] },
  { nat:'Irish', flag:'🇮🇪', fn:['Seamus','James','Robbie','Shane','Kevin','Daryl','Troy','Caoimhín','Gavin','Nathan'], ln:['Coleman','McClean','Brady','Duffy','Doyle','Horgan','Horan','Kelleher','Bazunu','Collins'] },
];

const POSITIONS = ['GK','CB','LB','RB','CDM','CM','CAM','LM','RM','LW','RW','CF','ST'];

const STATS_RANGES = {
  GK:  {g:[0,1],  a:[0,2],  m:[25,40]},
  CB:  {g:[0,5],  a:[0,5],  m:[25,40]},
  LB:  {g:[0,7],  a:[2,12], m:[25,38]},
  RB:  {g:[0,7],  a:[2,12], m:[25,38]},
  CDM: {g:[0,8],  a:[2,10], m:[25,40]},
  CM:  {g:[3,15], a:[3,15], m:[25,40]},
  CAM: {g:[5,20], a:[5,20], m:[22,38]},
  LM:  {g:[3,18], a:[3,15], m:[22,38]},
  RM:  {g:[3,18], a:[3,15], m:[22,38]},
  LW:  {g:[5,25], a:[5,18], m:[22,38]},
  RW:  {g:[5,25], a:[5,18], m:[22,38]},
  CF:  {g:[8,25], a:[5,15], m:[22,38]},
  ST:  {g:[10,35],a:[2,12], m:[22,38]},
};

const STRENGTHS = {
  GK:  ['Reflejos','Posicionamiento','Distribución','Atajadas','Liderazgo defensivo','Salidas al cruce'],
  CB:  ['Juego aéreo','Anticipación','Liderazgo','Duelos físicos','Visión de juego','Marcaje'],
  LB:  ['Velocidad','Centros','Llegada al área','Pressing','Resistencia','Desborde'],
  RB:  ['Velocidad','Centros','Llegada al área','Pressing','Resistencia','Recuperación'],
  CDM: ['Intercepciones','Lectura del juego','Pases largos','Recuperación','Físico','Cobertura'],
  CM:  ['Visión de juego','Pases','Llegada al área','Box-to-box','Trabajo en equipo','Técnica'],
  CAM: ['Creatividad','Último pase','Visión','Definición','Habilidad técnica','Desborde'],
  LM:  ['Velocidad','Desborde','Centros','Regate','Trabajo defensivo','Resistencia'],
  RM:  ['Velocidad','Desborde','Centros','Regate','Trabajo defensivo','Resistencia'],
  LW:  ['Velocidad','Regate','Definición','Desborde','Habilidad técnica','Dribling'],
  RW:  ['Velocidad','Regate','Definición','Desborde','Habilidad técnica','Juego en el área'],
  CF:  ['Movimiento','Asociación','Definición','Pases entre líneas','Creatividad','Técnica'],
  ST:  ['Definición','Potencia','Remate de cabeza','Movimiento sin balón','Físico','Instinto goleador'],
};

const TROPHIES = ['Liga Nacional','Copa Nacional','Champions League','Supercopa Nacional','Supercopa Europea','Copa del Mundo','Copa América','Copa Africana','Copa Libertadores','Copa Sudamericana','Eurocopa','Liga de Naciones','Bota de Oro','Premio al Mejor de la Liga','Mejor Joven del Año'];

const TAGS_BY_POS = {
  GK:  ['#portero','#reflejos','#goleroseguro','#shot-stopper'],
  CB:  ['#defensa','#aéreo','#líder','#central'],
  LB:  ['#lateral','#subida','#centros','#lateralizquierdo'],
  RB:  ['#lateral','#subida','#centros','#lateralderecho'],
  CDM: ['#recuperador','#organizador','#pivote','#ancla'],
  CM:  ['#centrocampista','#box2box','#motor','#dinamo'],
  CAM: ['#mediapunta','#creativo','#asistente','#número10'],
  LM:  ['#extremo','#velocidad','#desborde','#amplitud'],
  RM:  ['#extremo','#velocidad','#desborde','#amplitud'],
  LW:  ['#extremo','#goleador','#habilidad','#driblador'],
  RW:  ['#extremo','#goleador','#habilidad','#driblador'],
  CF:  ['#delantero','#movimiento','#gol','#segundopunta'],
  ST:  ['#goleador','#rematador','#delanterocentro','#9clásico'],
};

const BIO_ES = (name,pos,team,league,age,nat) => {
  const t = [
    `${name} es un futbolista ${nat} de ${age} años que actualmente defiende los colores de ${team} en la ${league}. Como ${pos}, ha demostrado una calidad extraordinaria y se ha ganado un lugar entre los mejores de su posición.`,
    `Con ${age} años, ${name} (${nat}) es uno de los referentes del ${team} en la ${league}. Su rendimiento como ${pos} ha llamado la atención de los mejores clubes de Europa.`,
    `${name} llegó a ${team} para convertirse en una pieza clave de su sistema de juego como ${pos}. Este talentoso futbolista ${nat} de ${age} años brilla en la ${league}.`,
    `Nacido hace ${age} años, ${name} es un ${pos} ${nat} que milita en ${team} de la ${league}. Su dedicación y talento lo han convertido en uno de los jugadores más destacados de su equipo.`,
    `El ${pos} ${nat} ${name} (${age} años) es una figura consolidada en ${team}. En la ${league}, su nombre resuena como sinónimo de calidad y compromiso.`,
  ];
  return t[Math.floor(Math.random()*t.length)];
};

const BIO_EN = (name,pos,team,league,age,nat) => {
  const t = [
    `${name} is a ${nat} footballer aged ${age} who currently plays for ${team} in the ${league}. As a ${pos}, he has shown extraordinary quality and earned a place among the best in his position.`,
    `At ${age}, ${name} (${nat}) is one of ${team}'s key players in the ${league}. His performances as a ${pos} have attracted attention from top European clubs.`,
    `${name} joined ${team} to become a pivotal piece of their system as a ${pos}. This talented ${nat} footballer, aged ${age}, shines in the ${league}.`,
    `Born ${age} years ago, ${name} is a ${nat} ${pos} who plays for ${team} in the ${league}. His dedication and talent have made him one of the most outstanding players at his club.`,
    `${nat} ${pos} ${name} (aged ${age}) is an established figure at ${team}. In the ${league}, his name has become synonymous with quality and commitment.`,
  ];
  return t[Math.floor(Math.random()*t.length)];
};

// ── HELPERS ─────────────────────────────────────────────────────────────────

const rand = (a,b) => Math.floor(Math.random()*(b-a+1))+a;
const pick = arr => arr[Math.floor(Math.random()*arr.length)];
const slug = name => name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s]/g,'').trim().replace(/\s+/g,'-');

function genTrophies(rating) {
  const count = rating>=90?rand(3,8):rating>=80?rand(1,5):rand(0,3);
  return [...TROPHIES].sort(()=>Math.random()-0.5).slice(0,count);
}

function genTransfers(age) {
  const count = age>=30?rand(2,4):age>=24?rand(1,3):rand(0,2);
  if(!count) return [];
  const clubs=['Club Atlético','Sporting Club','FC United','City FC','Real SC','Athletic FC','Wanderers FC','Town FC','United SC'];
  const transfers=[];
  let yr=2026-rand(2,Math.min(12,age-17));
  for(let i=0;i<count;i++){
    transfers.push({
      year:yr,
      from:i===0?pick(clubs):pick(clubs),
      to:i===count-1?'Equipo actual':pick(clubs),
      fee:rand(0,1)?`€${rand(1,80)}M`:null,
    });
    yr+=rand(1,3);
  }
  return transfers;
}

function genTags(pos,rating){
  const base=TAGS_BY_POS[pos]||[];
  const extra=rating>=88?['#estrella','#élite']:rating>=77?['#referente','#titular']:['#promesa','#potencial'];
  return [...base,...extra].sort(()=>Math.random()-0.5).slice(0,rand(3,5));
}

// ── GENERATE ─────────────────────────────────────────────────────────────────

const existing = JSON.parse(fs.readFileSync('./knowledge/players.json','utf8'));
const usedIds   = new Set(existing.players.map(p=>p.id));
const usedNames = new Set(existing.players.map(p=>p.name));

const newPlayers=[];
let attempts=0;

while(newPlayers.length < 970 && attempts < 50000){
  attempts++;
  const natData = pick(NATIONALITIES);
  const firstName = pick(natData.fn);
  const lastName  = pick(natData.ln);
  const name = `${firstName} ${lastName}`;
  if(usedNames.has(name)) continue;

  const leagueData = pick(LEAGUES);
  const team       = pick(leagueData.teams);
  const pos        = pick(POSITIONS);
  const age        = rand(17,38);
  const rating     = Number((rand(60,91) / 10).toFixed(1));
  const sr         = STATS_RANGES[pos];

  const goals   = rand(sr.g[0],sr.g[1]);
  const assists = rand(sr.a[0],sr.a[1]);
  const matches = rand(sr.m[0],sr.m[1]);
  const cg = ['ST','CF','LW','RW','CAM'].includes(pos)?rand(goals*2,goals*7):rand(goals,goals*4);
  const mv = rating>=85?rand(20,150)*1e6:rating>=75?rand(5,40)*1e6:rand(1,10)*1e6;

  const str=[...STRENGTHS[pos]].sort(()=>Math.random()-0.5).slice(0,rand(2,4));

  let id=slug(name);
  if(usedIds.has(id)) id=`${id}-${newPlayers.length}`;
  usedIds.add(id);
  usedNames.add(name);

  newPlayers.push({
    id, name,
    flag: natData.flag,
    nationality: natData.nat,
    position: pos,
    currentTeam: team,
    league: leagueData.name,
    overallRating: rating,
    age,
    marketValue: mv,
    stats:{ goals, assists, matches },
    careerTotals:{ goals: cg },
    nickname: null,
    bioEs: BIO_ES(name,pos,team,leagueData.name,age,natData.nat),
    bio:   BIO_EN(name,pos,team,leagueData.name,age,natData.nat),
    strengths: str,
    trophies: genTrophies(rating),
    transfers: genTransfers(age),
    tags: genTags(pos,rating),
  });
}

const all={ players:[...existing.players,...newPlayers] };
fs.writeFileSync('./knowledge/players.json', JSON.stringify(all, null, 2));
console.log(`✅ Total players: ${all.players.length}  |  New: ${newPlayers.length}  |  Attempts: ${attempts}`);
