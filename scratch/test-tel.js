const PREFIXES = {
  '+34': { country: 'España', lengths: [9], template: 'XXX XXX XXX' },
  '+54': { country: 'Argentina', lengths: [10, 11], templates: { 10: 'XX XXXX XXXX', 11: 'X XX XXXX XXXX' } },
  '+56': { country: 'Chile', lengths: [9], template: 'X XXXX XXXX' },
  '+57': { country: 'Colombia', lengths: [10], template: 'XXX XXX XXXX' },
  '+52': { country: 'México', lengths: [10], template: 'XXX XXX XXXX' },
  '+58': { country: 'Venezuela', lengths: [10], template: 'XXX XXX XXXX' },
  '+51': { country: 'Perú', lengths: [9], template: 'XXX XXX XXX' },
  '+593': { country: 'Ecuador', lengths: [9], template: 'X XXXX XXXX' },
  '+598': { country: 'Uruguay', lengths: [8, 9], templates: { 8: 'XX XXX XXX', 9: 'XXX XXX XXX' } },
  '+591': { country: 'Bolivia', lengths: [8], template: 'XXX XXX XX' },
  '+595': { country: 'Paraguay', lengths: [9], template: 'XXX XXX XXX' },
  '+507': { country: 'Panamá', lengths: [7, 8], templates: { 7: 'XXX XXXX', 8: 'XXXX XXXX' } },
  '+506': { country: 'Costa Rica', lengths: [8], template: 'XXXX XXXX' },
  '+55': { country: 'Brasil', lengths: [10, 11], templates: { 10: 'XX XXXX XXXX', 11: 'XX XXXXX XXXX' } },
  '+1': { country: 'EE.UU. / Canadá', lengths: [10], template: 'XXX XXX XXXX' },
  '+44': { country: 'Reino Unido', lengths: [10], template: 'XXX XXX XXXX' },
  '+33': { country: 'Francia', lengths: [9], template: 'X XX XX XX XX' },
  '+39': { country: 'Italia', lengths: [9, 10], templates: { 9: 'XXX XXX XXX', 10: 'XXX XXX XXXX' } },
  '+49': { country: 'Alemania', lengths: [10, 11], templates: { 10: 'XXX XXX XXXX', 11: 'XXX XXXX XXXX' } },
  '+351': { country: 'Portugal', lengths: [9], template: 'XXX XXX XXX' }
};

const validatePhoneNumber = (rawNumber) => {
  if (!rawNumber) return { isValid: false, message: 'Número de teléfono requerido' };
  const cleaned = rawNumber.replace(/\s/g, '');
  if (!cleaned.startsWith('+')) {
    return { isValid: false, message: 'Debe iniciar con "+" y código de país (ej: +34)' };
  }
  const sortedPrefixes = Object.keys(PREFIXES).sort((a, b) => b.length - a.length);
  let matchedPrefix = null;
  for (const prefix of sortedPrefixes) {
    if (cleaned.startsWith(prefix)) {
      matchedPrefix = prefix;
      break;
    }
  }
  if (matchedPrefix) {
    const config = PREFIXES[matchedPrefix];
    const restCleaned = cleaned.substring(matchedPrefix.length);
    const digitsOnly = restCleaned.replace(/\D/g, '');
    const isValidLength = config.lengths.includes(digitsOnly.length);
    if (!isValidLength) {
      const lengthMsg = config.lengths.join(' o ');
      return { isValid: false, message: `Debe tener ${lengthMsg} dígitos después de ${matchedPrefix}` };
    }

    // Pick template based on digit count
    let template = '';
    if (config.template) {
      template = config.template;
    } else if (config.templates) {
      template = config.templates[digitsOnly.length] || Object.values(config.templates)[0];
    }

    // Construct perfect format
    let formattedDigits = '';
    let digitIndex = 0;
    for (let i = 0; i < template.length; i++) {
      if (digitIndex >= digitsOnly.length) break;
      if (template[i] === 'X') {
        formattedDigits += digitsOnly[digitIndex];
        digitIndex++;
      } else {
        formattedDigits += template[i];
      }
    }
    const perfectFormat = matchedPrefix + ' ' + formattedDigits;

    // Validate exact spacing
    if (rawNumber !== perfectFormat) {
      return { 
        isValid: false, 
        message: `Estructura incorrecta. El formato sugerido es: ${perfectFormat}` 
      };
    }

    return { isValid: true };
  } else {
    const digitsOnly = cleaned.replace(/\D/g, '');
    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      return { isValid: false, message: 'Formato internacional inválido (entre 7 y 15 dígitos)' };
    }
    return { isValid: true };
  }
};

const testCases = [
  // Spain
  { num: '+34 600 000 000', expected: true },
  { num: '+34 600000000', expected: false },
  { num: '+34 600 000 00', expected: false },
  // Argentina 10 digits
  { num: '+54 11 1234 5678', expected: true },
  { num: '+54 1112345678', expected: false },
  // Argentina 11 digits
  { num: '+54 9 11 1234 5678', expected: true },
  // Chile
  { num: '+56 9 1234 1234', expected: true },
  { num: '+56 912341234', expected: false },
  // Colombia
  { num: '+57 300 123 4567', expected: true },
  { num: '+57 3001234567', expected: false },
  // Generic International
  { num: '+999 12345678', expected: true },
  { num: '+99912345678', expected: true }, // Generic doesn't enforce spaces
  { num: '+999 12', expected: false } // Too short
];

console.log('--- RUNNING PHONE VALIDATION TESTS ---');
let failed = 0;
for (const tc of testCases) {
  const result = validatePhoneNumber(tc.num);
  const passed = result.isValid === tc.expected;
  console.log(`[${passed ? 'PASS' : 'FAIL'}] Number: "${tc.num}" -> isValid: ${result.isValid} (expected: ${tc.expected}). Msg: "${result.message || 'Valid'}"`);
  if (!passed) failed++;
}

if (failed === 0) {
  console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY!');
} else {
  console.error(`\n❌ ${failed} TESTS FAILED.`);
  process.exit(1);
}
