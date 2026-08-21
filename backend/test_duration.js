function test(fromDateStr, untilDateStr, rawDaysStr, lang = 'es') {
  let days = 0;
  
  if (fromDateStr && untilDateStr && fromDateStr.includes('/') && untilDateStr.includes('/')) {
    const p1 = fromDateStr.split('/');
    const p2 = untilDateStr.split('/');
    if (p1.length === 3 && p2.length === 3) {
      const d1 = new Date(parseInt(p1[2], 10), parseInt(p1[1], 10) - 1, parseInt(p1[0], 10));
      const d2 = new Date(parseInt(p2[2], 10), parseInt(p2[1], 10) - 1, parseInt(p2[0], 10));
      const diffMs = d2.getTime() - d1.getTime();
      if (!isNaN(diffMs) && diffMs > 0) {
        days = Math.round(diffMs / (1000 * 60 * 60 * 24));
      }
    }
  }

  if (days <= 0 && rawDaysStr) {
    const match = String(rawDaysStr).match(/([0-9]+)/);
    if (match) {
      days = parseInt(match[1], 10);
    }
  }

  if (days <= 0) return lang === 'es' ? 'Sin especificar' : 'Unspecified';

  const years = Math.floor(days / 365);
  const remAfterYears = days % 365;
  const months = Math.floor(remAfterYears / 30);
  const remDays = remAfterYears % 30;

  const parts = [];
  if (years > 0) {
    parts.push(lang === 'es' ? (years === 1 ? '1 año' : `${years} años`) : (years === 1 ? '1 year' : `${years} years`));
  }
  if (months > 0) {
    parts.push(lang === 'es' ? (months === 1 ? '1 mes' : `${months} meses`) : (months === 1 ? '1 month' : `${months} months`));
  }
  if (remDays > 0 || parts.length === 0) {
    parts.push(lang === 'es' ? (remDays === 1 ? '1 día' : `${remDays} días`) : (remDays === 1 ? '1 day' : `${remDays} days`));
  }

  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} ${lang === 'es' ? 'y' : 'and'} ${parts[1]}`;
  return `${parts[0]}, ${parts[1]} ${lang === 'es' ? 'y' : 'and'} ${parts[2]}`;
}

console.log('316 days (20/11/2023 - 30/09/2024):', test('20/11/2023', '30/09/2024', '316 days'));
console.log('180 days:', test('', '', '180 days'));
console.log('18 days:', test('', '', '18 days'));
console.log('43 days:', test('', '', '43 days'));
console.log('400 days:', test('', '', '400 days'));
