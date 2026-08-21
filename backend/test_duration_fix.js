function translateInjuryToSpanish(raw) {
  if (!raw || typeof raw !== 'string') return 'Lesión no especificada';
  const str = raw.trim();
  const lower = str.toLowerCase();

  if (lower === 'ill' || lower === 'illness' || lower === 'sick') return 'Enfermo';
  return str;
}

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
        days = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1; // +1 for inclusive day count
      }
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

console.log('Ill ->', translateInjuryToSpanish('Ill'));
console.log('6 days ->', formatDurationHumanReadable('03/02/2025', '08/02/2025', '6 days'));
console.log('19 days ->', formatDurationHumanReadable('01/10/2024', '19/10/2024', '19 days'));
console.log('316 days ->', formatDurationHumanReadable('20/11/2023', '30/09/2024', '316 days'));
