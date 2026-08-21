const fs = require('fs');

const filePath = 'C:/Users/franc/OneDrive/Escritorio/Futbol AI Local/frontend/app.js';
let content = fs.readFileSync(filePath, 'utf8');

const normalized = content.replace(/\r\n/g, '\n');

const targetStr = `function setupLanguageToggle() {`;

const mobileMenuFunctions = `function setupMobileMenu() {
  const toggleBtn = document.getElementById('btn-mobile-menu') || document.getElementById('mobile-toggle') || document.querySelector('.hamburger-btn');
  const menu = document.getElementById('mobile-menu') || document.querySelector('.mobile-menu-drawer');
  const overlay = document.getElementById('mobile-menu-overlay') || document.querySelector('.mobile-menu-overlay');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (menu) menu.classList.toggle('active');
      if (overlay) overlay.classList.toggle('active');
    });
  }

  if (overlay) {
    overlay.addEventListener('click', () => {
      closeMobileMenu();
    });
  }

  const mobileNavButtons = document.querySelectorAll('.mobile-nav-links .nav-item');
  mobileNavButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      closeMobileMenu();
    });
  });
}

function closeMobileMenu() {
  const menu = document.getElementById('mobile-menu') || document.querySelector('.mobile-menu-drawer');
  const overlay = document.getElementById('mobile-menu-overlay') || document.querySelector('.mobile-menu-overlay');
  if (menu) menu.classList.remove('active');
  if (overlay) overlay.classList.remove('active');
}

window.setupMobileMenu = setupMobileMenu;
window.closeMobileMenu = closeMobileMenu;

function setupLanguageToggle() {`;

if (normalized.includes(targetStr)) {
  const fixed = normalized.replace(targetStr, mobileMenuFunctions);
  fs.writeFileSync(filePath, fixed, 'utf8');
  console.log('SUCCESSFULLY INSERTED SETUPMOBILEMENU IN APP.JS!');
} else {
  console.log('TARGET STR NOT FOUND');
}
