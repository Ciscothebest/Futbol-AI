function formatDurationHumanReadable(fromDateStr, untilDateStr, rawDaysStr, lang = 'es') {
  let days = 0;
  
  if (rawDaysStr) {
    const match = String(rawDaysStr).match(/([0-9]+)/);
    if (match) {
      days = parseInt(match[1], 10);
    }
  }

  if (days <= 0 && fromDateStr && untilDateStr && fromDateStr.includes('/') && untilDateStr.includes('/')) {
    const p1 = fromDateStr.split('/');
    const p2 = untilDateStr.split('/');
    if (p1.length === 3 && p2.length === 3) {
      const d1 = new Date(parseInt(p1[2], 10), parseInt(p1[1], 10) - 1, parseInt(p1[0], 10));
      const d2 = new Date(parseInt(p2[2], 10), parseInt(p2[1], 10) - 1, parseInt(p2[0], 10));
      const diffMs = d2.getTime() - d1.getTime();
      if (!isNaN(diffMs) && diffMs >= 0) {
        days = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
      }
    }
  }

  if (days <= 0) return lang === 'es' ? 'Sin especificar' : 'Unspecified';

  // Desglose jerárquico estricto: Años -> Meses -> Semanas -> Días
  const years = Math.floor(days / 365);
  const remAfterYears = days % 365;

  const months = Math.floor(remAfterYears / 30);
  const remAfterMonths = remAfterYears % 30;

  const weeks = Math.floor(remAfterMonths / 7);
  const remDays = remAfterMonths % 7;

  const parts = [];
  if (years > 0) {
    parts.push(lang === 'es' ? (years === 1 ? '1 año' : `${years} años`) : (years === 1 ? '1 year' : `${years} years`));
  }
  if (months > 0) {
    parts.push(lang === 'es' ? (months === 1 ? '1 mes' : `${months} meses`) : (months === 1 ? '1 month' : `${months} months`));
  }
  if (weeks > 0) {
    parts.push(lang === 'es' ? (weeks === 1 ? '1 semana' : `${weeks} semanas`) : (weeks === 1 ? '1 week' : `${weeks} weeks`));
  }
  if (remDays > 0 || parts.length === 0) {
    parts.push(lang === 'es' ? (remDays === 1 ? '1 día' : `${remDays} días`) : (remDays === 1 ? '1 day' : `${remDays} days`));
  }

  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} ${lang === 'es' ? 'y' : 'and'} ${parts[1]}`;
  return `${parts.slice(0, -1).join(', ')} ${lang === 'es' ? 'y' : 'and'} ${parts[parts.length - 1]}`;
}

console.log('22 days ->', formatDurationHumanReadable('', '', '22 days'));
console.log('316 days ->', formatDurationHumanReadable('', '', '316 days'));
console.log('192 days ->', formatDurationHumanReadable('', '', '192 days'));
console.log('6 days ->', formatDurationHumanReadable('', '', '6 days'));
console.log('46 days ->', formatDurationHumanReadable('', '', '46 days'));
console.log('182 days ->', formatDurationHumanReadable('', '', '182 days'));
