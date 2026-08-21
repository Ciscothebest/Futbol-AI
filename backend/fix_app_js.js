const fs = require('fs');

const filePath = 'C:/Users/franc/OneDrive/Escritorio/Futbol AI Local/frontend/app.js';
let content = fs.readFileSync(filePath, 'utf8');

// Replace CRLF with LF to do reliable multiline replacement, then write back
const normalized = content.replace(/\r\n/g, '\n');

const targetStr = `  if (payments.length === 0) {
    tbody.innerHTML = '';
    if (table) table.style.display = 'none';
      return (sum / validRatings.length).toFixed(1);
    }
  }
  const raw = parseFloat(p.overallRating);
  if (!isNaN(raw) && raw > 0) {
    const norm = raw > 10 ? raw / 10 : raw;
    return norm.toFixed(1);
  }
  return '7.0';
}`;

const replacementStr = `  if (payments.length === 0) {
    tbody.innerHTML = '';
    if (table) table.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (table) table.style.display = 'table';
  if (emptyState) emptyState.style.display = 'none';

  tbody.innerHTML = payments.map(pm => \`
    <tr>
      <td>\${pm.date || '—'}</td>
      <td>\${pm.description || pm.planName || 'Suscripción'}</td>
      <td>\${pm.amount || '—'}</td>
      <td><span class="status-badge \${pm.status === 'Completado' ? 'completed' : 'pending'}">\${pm.status || 'Completado'}</span></td>
    </tr>
  \`).join('');
};

function getPlayerCareerAverageRating(p) {
  if (!p) return '7.0';
  let historyArr = p.history;
  if (typeof historyArr === 'string') {
    try { historyArr = JSON.parse(historyArr); } catch(e) { historyArr = null; }
  }
  if (Array.isArray(historyArr) && historyArr.length > 0) {
    const validRatings = historyArr
      .map(h => parseFloat(h.rating))
      .filter(r => !isNaN(r) && r > 0)
      .map(r => r > 10 ? r / 10 : r);
    if (validRatings.length > 0) {
      const sum = validRatings.reduce((a, b) => a + b, 0);
      return (sum / validRatings.length).toFixed(1);
    }
  }
  const raw = parseFloat(p.overallRating);
  if (!isNaN(raw) && raw > 0) {
    const norm = raw > 10 ? raw / 10 : raw;
    return norm.toFixed(1);
  }
  return '7.0';
}`;

if (normalized.includes(targetStr)) {
  const fixed = normalized.replace(targetStr, replacementStr);
  fs.writeFileSync(filePath, fixed, 'utf8');
  console.log('SUCCESSFULLY REPLACED BROKEN BLOCK!');
} else {
  console.log('STILL NOT FOUND');
}
