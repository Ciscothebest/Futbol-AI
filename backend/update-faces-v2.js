const fs = require('fs');
let f = fs.readFileSync('player-faces.js', 'utf8');

const updates = {
  'schlotterbeck-nico': '247204',
  'simons-xavi': '245367',
  'abqar': '245628',
  'gorosabel': '239763',
  'antonio-blanco': '261987',
  'sivera': '222464',
  'rioja': '224415',
  'duarte': '226637',
  'araujo-ronald': '253163',
  'kolo-muani-randal': '237679',
  'zaire-emery-warren': '270673',
  'ben-white': '237692',
  'gabriel-magalhaes': '238062',
  'gabriel-martinelli': '251566',
  'boubacar-kamara': '236987',
  'diego-carlos': '219693',
  'douglas-luiz': '236499',
  'emiliano-martinez': '202811',
  'ezri-konsa': '227678',
  'lucas-digne': '200458',
  'watkins-ollie': '232411',
  'vlahovic-dusan': '246430',
  'dimarco-federico': '226268',
  'bremer-gleison': '239580',
  'zielinski-piotr': '210406',
  'martin-gabriel': '251566',
  'ollie-watkins': '232411'
};

Object.entries(updates).forEach(([k, v]) => {
  const regex = new RegExp(`'${k}'\\s*:\\s*'\\d+'`, 'g');
  if (f.match(regex)) {
    f = f.replace(regex, `'${k}': '${v}'`);
    console.log(`Updated ${k}`);
  } else {
    console.log(`Missing key: ${k}`);
  }
});

fs.writeFileSync('player-faces.js', f);
