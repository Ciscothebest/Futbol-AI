const fs = require('fs');

const filePath = 'C:/Users/franc/OneDrive/Escritorio/Futbol AI Local/frontend/app.js';
let content = fs.readFileSync(filePath, 'utf8');

const normalized = content.replace(/\r\n/g, '\n');

// 1. Add isDefaultPlaceholderPhoto helper right above onAvatarError
const oldAvatarError = `// Smart onerror fallback chain: Real Photo -> DiceBear
function onAvatarError(img, p) {`;

const newAvatarError = `function isDefaultPlaceholderPhoto(url) {
  if (!url || typeof url !== 'string' || url.trim() === '' || url === 'null') return true;
  const lower = url.toLowerCase();
  return lower.includes('default.jpg') || 
         lower.includes('spieler/default') || 
         lower.includes('default_header') || 
         lower.includes('portrait_small.jpg') ||
         lower.includes('default_avatar');
}

// Smart onerror fallback chain: Real Photo -> DiceBear
function onAvatarError(img, p) {`;

// 2. Update createPlayerCard
const oldCardAvatar = `  let avatarUrl = p.avatarUrl || p.photoUrl;
  if (!avatarUrl || avatarUrl.trim() === '') {
    if (p.photoId && p.photoId.trim() !== '') {
      avatarUrl = (p.photoId.startsWith('http://') || p.photoId.startsWith('https://'))
        ? p.photoId
        : getAbsoluteUrl('/api/player-photo/' + p.photoId);
    } else {
      const pInitials = (p.name || 'J').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      avatarUrl = \`https://ui-avatars.com/api/?name=\${encodeURIComponent(pInitials)}&background=00f0ff&color=0d1117&size=128\`;
    }
  }`;

const newCardAvatar = `  let avatarUrl = p.avatarUrl || p.photoUrl;
  if (isDefaultPlaceholderPhoto(avatarUrl)) {
    if (p.photoId && p.photoId.trim() !== '' && !isDefaultPlaceholderPhoto(p.photoId)) {
      avatarUrl = (p.photoId.startsWith('http://') || p.photoId.startsWith('https://'))
        ? p.photoId
        : getAbsoluteUrl('/api/player-photo/' + p.photoId);
    } else {
      const pInitials = (p.name || 'J').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      avatarUrl = \`https://ui-avatars.com/api/?name=\${encodeURIComponent(pInitials)}&background=00f0ff&color=0d1117&size=128\`;
    }
  }`;

// 3. Update openPlayerModal
const oldModalAvatar = `  let avatarUrl = p.avatarUrl || p.photoUrl;
  if (!avatarUrl || avatarUrl.trim() === '' || avatarUrl === 'null') {
    if (p.photoId && p.photoId.trim() !== '' && p.photoId !== 'null') {
      avatarUrl = (p.photoId.startsWith('http://') || p.photoId.startsWith('https://'))
        ? p.photoId
        : getAbsoluteUrl('/api/player-photo/' + p.photoId);
    } else {
      const pInitials = (p.name || 'J').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      avatarUrl = \`https://ui-avatars.com/api/?name=\${encodeURIComponent(pInitials)}&background=000000&color=00f0ff&size=128\`;
    }
  } else {
    avatarUrl = getAbsoluteUrl(avatarUrl);
  }`;

const newModalAvatar = `  let avatarUrl = p.avatarUrl || p.photoUrl;
  if (isDefaultPlaceholderPhoto(avatarUrl)) {
    if (p.photoId && p.photoId.trim() !== '' && !isDefaultPlaceholderPhoto(p.photoId)) {
      avatarUrl = (p.photoId.startsWith('http://') || p.photoId.startsWith('https://'))
        ? p.photoId
        : getAbsoluteUrl('/api/player-photo/' + p.photoId);
    } else {
      const pInitials = (p.name || 'J').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      avatarUrl = \`https://ui-avatars.com/api/?name=\${encodeURIComponent(pInitials)}&background=000000&color=00f0ff&size=128\`;
    }
  } else {
    avatarUrl = getAbsoluteUrl(avatarUrl);
  }`;

let updated = normalized;

if (updated.includes(oldAvatarError)) {
  updated = updated.replace(oldAvatarError, newAvatarError);
}

if (updated.includes(oldCardAvatar)) {
  updated = updated.replace(oldCardAvatar, newCardAvatar);
}

if (updated.includes(oldModalAvatar)) {
  updated = updated.replace(oldModalAvatar, newModalAvatar);
}

fs.writeFileSync(filePath, updated, 'utf8');
console.log('SUCCESSFULLY APPLIED PLACEHOLDER AVATAR DETECTOR IN APP.JS!');
