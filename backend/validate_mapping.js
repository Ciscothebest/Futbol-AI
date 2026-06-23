const { League } = require('./database');

const DB_TO_FILE_MAP = {"1":31,"2":55,"3":7,"4":44,"5":67,"6":58,"7":17,"8":6,"9":42,"10":39,"11":36,"12":59,"13":60,"14":47,"15":25,"16":27,"17":66,"18":73,"19":56,"20":19,"21":69,"22":1,"23":5,"24":14,"25":65,"26":70,"27":24,"28":43,"29":35,"30":37,"31":13,"32":12,"33":61,"34":40,"35":2,"36":74,"37":16,"38":71,"39":8,"40":54,"41":38,"42":75,"43":76,"44":23,"45":20,"46":21,"47":15,"48":78,"49":57,"50":63,"51":28,"52":64,"53":80,"54":29,"55":79,"56":34,"57":68,"58":18,"59":11,"60":72,"61":22,"62":46,"63":48,"64":10,"65":62,"66":41,"67":32,"68":45,"69":77,"70":26,"71":33,"72":30,"73":3,"74":51,"75":81,"76":52,"77":4,"78":50,"79":53,"80":9,"81":49};

async function run() {
  try {
    const leagues = await League.findAll();
    
    // Sort leagues alphabetically by name to find the corresponding file ID (1-based index)
    const sortedLeagues = [...leagues].sort((a, b) => a.name.localeCompare(b.name));
    
    console.log("DB ID -> Country -> DB League Name -> Mapped File ID -> Mapped League File Name");
    console.log("--------------------------------------------------------------------------------");
    
    leagues.forEach(l => {
      const fileId = DB_TO_FILE_MAP[l.id.toString()];
      const mappedLeague = fileId ? sortedLeagues[fileId - 1] : null;
      const mappedName = mappedLeague ? `${mappedLeague.name} (${mappedLeague.country})` : "NONE";
      console.log(`${l.id} -> ${l.country} -> ${l.name} -> mapped to file liga_${fileId}.png which is actually "${mappedName}"`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
