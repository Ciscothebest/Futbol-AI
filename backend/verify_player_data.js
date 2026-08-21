const { Player } = require('./database');

async function verifyData() {
  console.log('🔍 Verificando integridad de datos en los expedientes conservados...');

  const sampleNames = [
    'Khvicha Kvaratskhelia',
    'Rafael Leão',
    'Marcus Rashford',
    'Vinicius Jr.',
    'Jude Bellingham',
    'Lamine Yamal',
    'Jean Carlos López',
    'Mike Maignan',
    'Manuel Neuer',
    'Nahuel Tenaglia'
  ];

  for (const name of sampleNames) {
    const p = await Player.findOne({ where: { name } });
    if (p) {
      let injCount = 0;
      if (Array.isArray(p.injuries)) injCount = p.injuries.length;
      else if (typeof p.injuries === 'string' && p.injuries.startsWith('[')) {
        try { injCount = JSON.parse(p.injuries).length; } catch(e){}
      }

      let histCount = 0;
      if (Array.isArray(p.history)) histCount = p.history.length;
      else if (typeof p.history === 'string' && p.history.startsWith('[')) {
        try { histCount = JSON.parse(p.history).length; } catch(e){}
      }

      const hasPhoto = p.photoId && !p.photoId.includes('default') && !p.photoId.includes('data:image');

      console.log(`✅ [${p.name}]`);
      console.log(`   • Equipo: ${p.currentTeam} (${p.league})`);
      console.log(`   • Foto Oficial: ${hasPhoto ? 'SÍ (Alta Res)' : 'NO (Silueta)'}`);
      console.log(`   • Historial: ${histCount} temporadas registradas`);
      console.log(`   • Lesiones: ${injCount} lesiones en expediente`);
      console.log(`   • Valor Mercado: €${((p.marketValue || 0)/1000000).toFixed(1)}M\n`);
    } else {
      console.log(`⚠️ No se encontró: ${name}\n`);
    }
  }

  process.exit(0);
}

verifyData();
