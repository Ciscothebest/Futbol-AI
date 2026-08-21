const fs = require('fs');

const filePath = 'C:/Users/franc/OneDrive/Escritorio/Futbol AI Local/frontend/app.js';
let content = fs.readFileSync(filePath, 'utf8');

const normalized = content.replace(/\r\n/g, '\n');

// 1. Add getSilhouetteNoImageSvg right above isDefaultPlaceholderPhoto
const oldHelperHead = `function isDefaultPlaceholderPhoto(url) {`;

const newHelperHead = `function getSilhouetteNoImageSvg() {
  const svg = \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
    <rect width="128" height="128" rx="64" fill="#0d1117" />
    <ellipse cx="64" cy="56" rx="38" ry="46" fill="#1b2a4a" stroke="rgba(0,240,255,0.4)" stroke-width="1.5" />
    <path d="M64 26 C 54 26, 46 34, 46 45 C 46 56, 54 64, 64 64 C 74 64, 82 56, 82 45 C 82 34, 74 26, 64 26 Z" fill="#ffffff" opacity="0.92" />
    <path d="M38 92 C 38 74, 48 68, 64 68 C 80 68, 90 74, 90 92 Z" fill="#ffffff" opacity="0.92" />
    <rect x="16" y="94" width="96" height="22" rx="11" fill="#0d1117" stroke="#00f0ff" stroke-width="1.2" />
    <text x="64" y="109" fill="#00f0ff" font-size="10" font-weight="800" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" text-anchor="middle" letter-spacing="0.5">SIN IMAGEN</text>
  </svg>\`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function isDefaultPlaceholderPhoto(url) {`;

// 2. Update onAvatarError to use getSilhouetteNoImageSvg
const oldAvatarError = `function onAvatarError(img, p) {
  const id = p && p.id ? p.id : '';
  const name = p && p.name ? p.name : id;
  
  if (!img._fallback1) {
    img._fallback1 = true;
    img.src = \`https://api.dicebear.com/9.x/initials/svg?seed=\${encodeURIComponent(name)}&backgroundColor=0d1117&textColor=ffffff&radius=50\`;
    return;
  }
  img.onerror = null;
}`;

const newAvatarError = `function onAvatarError(img, p) {
  if (!img._fallback1) {
    img._fallback1 = true;
    img.src = getSilhouetteNoImageSvg();
    return;
  }
  img.onerror = null;
}`;

// 3. Update createPlayerCard
const oldCardAvatar = `  let avatarUrl = p.avatarUrl || p.photoUrl;
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

const newCardAvatar = `  let avatarUrl = p.avatarUrl || p.photoUrl;
  if (isDefaultPlaceholderPhoto(avatarUrl)) {
    if (p.photoId && p.photoId.trim() !== '' && !isDefaultPlaceholderPhoto(p.photoId)) {
      avatarUrl = (p.photoId.startsWith('http://') || p.photoId.startsWith('https://'))
        ? p.photoId
        : getAbsoluteUrl('/api/player-photo/' + p.photoId);
    } else {
      avatarUrl = getSilhouetteNoImageSvg();
    }
  }`;

// 4. Update openPlayerModal
const oldModalAvatar = `  let avatarUrl = p.avatarUrl || p.photoUrl;
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

const newModalAvatar = `  let avatarUrl = p.avatarUrl || p.photoUrl;
  if (isDefaultPlaceholderPhoto(avatarUrl)) {
    if (p.photoId && p.photoId.trim() !== '' && !isDefaultPlaceholderPhoto(p.photoId)) {
      avatarUrl = (p.photoId.startsWith('http://') || p.photoId.startsWith('https://'))
        ? p.photoId
        : getAbsoluteUrl('/api/player-photo/' + p.photoId);
    } else {
      avatarUrl = getSilhouetteNoImageSvg();
    }
  } else {
    avatarUrl = getAbsoluteUrl(avatarUrl);
  }`;

let updated = normalized;

if (updated.includes(oldHelperHead)) {
  updated = updated.replace(oldHelperHead, newHelperHead);
}

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
console.log('SUCCESSFULLY APPLIED SILHOUETTE "SIN IMAGEN" SVG IN APP.JS!');
