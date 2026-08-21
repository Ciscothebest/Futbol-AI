const fs = require('fs');

const filePath = 'C:/Users/franc/OneDrive/Escritorio/Futbol AI Local/frontend/app.js';
let content = fs.readFileSync(filePath, 'utf8');

const normalized = content.replace(/\r\n/g, '\n');

const targetStr = `function setupMobileMenu() {`;

const checkBackendFunc = `async function checkBackendStatus() {
  try {
    const res = await fetch(\`\${API}/health\`).catch(() => null);
    const isOk = res && res.ok;
    const badge = document.getElementById('backend-status-badge');
    if (badge) {
      badge.textContent = isOk ? 'ONLINE' : 'OFFLINE';
      badge.className = \`status-badge \${isOk ? 'online' : 'offline'}\`;
    }
  } catch (e) {
    const badge = document.getElementById('backend-status-badge');
    if (badge) {
      badge.textContent = 'OFFLINE';
      badge.className = 'status-badge offline';
    }
  }
}
window.checkBackendStatus = checkBackendStatus;

function setupMobileMenu() {`;

if (normalized.includes(targetStr)) {
  const fixed = normalized.replace(targetStr, checkBackendFunc);
  fs.writeFileSync(filePath, fixed, 'utf8');
  console.log('SUCCESSFULLY INSERTED CHECKBACKENDSTATUS IN APP.JS!');
} else {
  console.log('TARGET STR NOT FOUND');
}
