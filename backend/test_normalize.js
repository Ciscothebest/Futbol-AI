function normalizeString(str) {
  if (!str) return '';
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]/g, '').toLowerCase().trim();
}

const tests = [
  'Martin \u00D8degaard',
  'Phil Foden',
  'Declan Rice',
  'Bukayo Saka',
  'William Saliba'
];

console.log('=== Normalized names ===');
for (const name of tests) {
  const n = normalizeString(name);
  console.log(JSON.stringify(name) + ' => ' + JSON.stringify(n));
}

console.log('\n=== Search matches ===');
const queries = ['odegaard', 'degaard', 'odegard', 'foden', 'rice', 'saka', 'saliba'];
for (const q of queries) {
  const nq = normalizeString(q);
  for (const name of tests) {
    const nn = normalizeString(name);
    if (nn.includes(nq)) {
      console.log('MATCH: search ' + JSON.stringify(q) + ' => ' + name);
    }
  }
}
