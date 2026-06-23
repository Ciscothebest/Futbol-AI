document.addEventListener('DOMContentLoaded', () => {
  const loginModal = document.getElementById('login-modal');
  const registerModal = document.getElementById('register-modal');
  const btnOpenLogin = document.getElementById('btn-open-login');
  const btnOpenRegister = document.getElementById('btn-open-register');
  const closeLogin = document.getElementById('close-login');
  const closeRegister = document.getElementById('close-register');

  // Hero section buttons
  const heroBtnRegister = document.getElementById('hero-btn-register');
  const heroBtnLogin = document.getElementById('hero-btn-login');
  const ctaRegisterBtn = document.getElementById('cta-register-btn');

  // Modal Toggles
  const openModal = (modal) => modal.style.display = 'flex';
  const closeModal = (modal) => modal.style.display = 'none';

  btnOpenLogin?.addEventListener('click', () => openModal(loginModal));
  btnOpenRegister?.addEventListener('click', () => openModal(registerModal));
  heroBtnLogin?.addEventListener('click', () => openModal(loginModal));
  heroBtnRegister?.addEventListener('click', () => openModal(registerModal));
  ctaRegisterBtn?.addEventListener('click', () => openModal(registerModal));

  closeLogin?.addEventListener('click', () => closeModal(loginModal));
  closeRegister?.addEventListener('click', () => closeModal(registerModal));

  // Switch between login/register
  document.getElementById('switch-to-register')?.addEventListener('click', () => {
    closeModal(loginModal);
    openModal(registerModal);
  });
  document.getElementById('switch-to-login')?.addEventListener('click', () => {
    closeModal(registerModal);
    openModal(loginModal);
  });

  // Validation
  const isAlphanumeric = (str) => /^[a-zA-Z0-9]+$/.test(str);

  // Handle Auth
  const API_BASE = (() => {
    if (window.location.protocol === 'file:') {
      return 'http://localhost:3001/api';
    }
    if (window.location.port && window.location.port !== '3001') {
      return `${window.location.protocol}//${window.location.hostname}:3001/api`;
    }
    return '/api';
  })();
  const API_URL = `${API_BASE}/auth`;

  // LOGIN FORM
  document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');
    const spinner = document.getElementById('login-spinner');
    const btnText = document.getElementById('login-btn-text');

    if (!username || !password) {
      errorEl.textContent = 'Usuario y contraseña requeridos';
      return;
    }

    errorEl.textContent = '';
    spinner.style.display = 'inline-block';
    btnText.style.display = 'none';

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const result = await res.json();

      if (!res.ok) throw new Error((result.details ? `${result.error} (${result.details})` : null) || result.error || 'Error al iniciar sesión');

      localStorage.setItem('scout_ai_token', result.token);
      localStorage.setItem('scout_ai_user', JSON.stringify(result.user));
      window.location.href = 'index.html';
    } catch (err) {
      console.error('Login error detail:', err);
      errorEl.textContent = `Error: ${err.message}`;
    } finally {
      spinner.style.display = 'none';
      btnText.style.display = 'inline-block';
    }
  });
  // ─── Tel Prefix & Country Spacing Validation ──────────────────
  const PREFIXES = {
    '+34': { country: 'España', flag: '🇪🇸', lengths: [9], template: 'XXX XXX XXX' },
    '+54': { country: 'Argentina', flag: '🇦🇷', lengths: [10, 11], templates: { 10: 'XX XXXX XXXX', 11: 'X XX XXXX XXXX' } },
    '+56': { country: 'Chile', flag: '🇨🇱', lengths: [9], template: 'X XXXX XXXX' },
    '+57': { country: 'Colombia', flag: '🇨🇴', lengths: [10], template: 'XXX XXX XXXX' },
    '+52': { country: 'México', flag: '🇲🇽', lengths: [10], template: 'XXX XXX XXXX' },
    '+58': { country: 'Venezuela', flag: '🇻🇪', lengths: [10], template: 'XXX XXX XXXX' },
    '+51': { country: 'Perú', flag: '🇵🇪', lengths: [9], template: 'XXX XXX XXX' },
    '+593': { country: 'Ecuador', flag: '🇪🇨', lengths: [9], template: 'X XXXX XXXX' },
    '+598': { country: 'Uruguay', flag: '🇺🇾', lengths: [8, 9], templates: { 8: 'XX XXX XXX', 9: 'XXX XXX XXX' } },
    '+591': { country: 'Bolivia', flag: '🇧🇴', lengths: [8], template: 'XXX XXX XX' },
    '+595': { country: 'Paraguay', flag: '🇵🇾', lengths: [9], template: 'XXX XXX XXX' },
    '+507': { country: 'Panamá', flag: '🇵🇦', lengths: [7, 8], templates: { 7: 'XXX XXXX', 8: 'XXXX XXXX' } },
    '+506': { country: 'Costa Rica', flag: '🇨🇷', lengths: [8], template: 'XXXX XXXX' },
    '+55': { country: 'Brasil', flag: '🇧🇷', lengths: [10, 11], templates: { 10: 'XX XXXX XXXX', 11: 'XX XXXXX XXXX' } },
    '+1': { country: 'EE.UU. / Canadá', flag: '🇺🇸', lengths: [10], template: 'XXX XXX XXXX' },
    '+44': { country: 'Reino Unido', flag: '🇬🇧', lengths: [10], template: 'XXX XXX XXXX' },
    '+33': { country: 'Francia', flag: '🇫🇷', lengths: [9], template: 'X XX XX XX XX' },
    '+39': { country: 'Italia', flag: '🇮🇹', lengths: [9, 10], templates: { 9: 'XXX XXX XXX', 10: 'XXX XXX XXXX' } },
    '+49': { country: 'Alemania', flag: '🇩🇪', lengths: [10, 11], templates: { 10: 'XXX XXX XXXX', 11: 'XXX XXXX XXXX' } },
    '+351': { country: 'Portugal', flag: '🇵🇹', lengths: [9], template: 'XXX XXX XXX' }
  };

  const validatePhoneNumber = (rawNumber) => {
    if (!rawNumber.startsWith('+')) {
      return { isValid: false, message: 'Debe iniciar con "+" y código de país (ej: +34)', country: null, flag: null };
    }

    const cleaned = rawNumber.replace(/\s/g, '');
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
        return { isValid: false, message: `Debe tener ${lengthMsg} dígitos después de ${matchedPrefix}`, country: config.country, flag: config.flag };
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
          message: `Estructura incorrecta. El formato sugerido es: ${perfectFormat}`, 
          country: config.country, 
          flag: config.flag 
        };
      }

      return { isValid: true, message: `Número y formato válidos para ${config.country}`, country: config.country, flag: config.flag };
    } else {
      const digitsOnly = cleaned.replace(/\D/g, '');
      if (digitsOnly.length < 7 || digitsOnly.length > 15) {
        return { isValid: false, message: 'Formato internacional inválido (entre 7 y 15 dígitos)', country: 'Internacional', flag: '🌐' };
      }
      return { isValid: true, message: 'Prefijo internacional genérico aceptado', country: 'Internacional', flag: '🌐' };
    }
  };

  const regTelefono = document.getElementById('reg-telefono');
  const regTelCountry = document.getElementById('reg-tel-country');
  const regTelHelper = document.getElementById('reg-tel-helper');

  const updateTelValidation = () => {
    if (!regTelefono) return;
    const value = regTelefono.value;
    if (!value.trim()) {
      regTelCountry.textContent = '';
      regTelHelper.textContent = '';
      regTelHelper.className = 'auth-input-helper';
      return;
    }
    const result = validatePhoneNumber(value);
    regTelCountry.textContent = result.flag && result.country ? `${result.flag} ${result.country}` : '';
    regTelHelper.textContent = result.message;
    regTelHelper.className = result.isValid ? 'auth-input-helper valid' : 'auth-input-helper invalid';
  };

  const formatInput = (e) => {
    let input = e.target.value;
    
    // Guard: enforce '+'
    if (input.length > 0 && !input.startsWith('+')) {
      input = '+' + input.replace(/\+/g, '');
    }
    
    // Clean characters that are not digits, + or spaces
    input = input.replace(/[^\d\+\s]/g, '');
    
    const cleaned = input.replace(/\s/g, '');
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
      const digits = cleaned.substring(matchedPrefix.length).replace(/\D/g, '');
      
      let template = '';
      if (config.template) {
        template = config.template;
      } else if (config.templates) {
        const keys = Object.keys(config.templates).map(Number).sort((a, b) => a - b);
        let chosenKey = keys[0];
        for (const key of keys) {
          if (digits.length <= key) {
            chosenKey = key;
            break;
          }
          chosenKey = key;
        }
        template = config.templates[chosenKey];
      }
      
      let formattedDigits = '';
      let digitIndex = 0;
      for (let i = 0; i < template.length; i++) {
        if (digitIndex >= digits.length) break;
        if (template[i] === 'X') {
          formattedDigits += digits[digitIndex];
          digitIndex++;
        } else {
          formattedDigits += template[i];
        }
      }
      if (digitIndex < digits.length) {
        formattedDigits += digits.substring(digitIndex);
      }
      
      const newValue = matchedPrefix + (formattedDigits ? ' ' + formattedDigits : '');
      
      // Save cursor position relative to the end
      const cursorOffset = e.target.selectionStart - e.target.value.length;
      e.target.value = newValue;
      e.target.setSelectionRange(newValue.length + cursorOffset, newValue.length + cursorOffset);
    } else {
      e.target.value = input;
    }
    
    updateTelValidation();
  };

  regTelefono?.addEventListener('input', formatInput);
  regTelefono?.addEventListener('blur', updateTelValidation);

  // REGISTER FORM
  document.getElementById('register-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombres = document.getElementById('reg-nombres').value.trim();
    const apellidos = document.getElementById('reg-apellidos').value.trim();
    const telefono = document.getElementById('reg-telefono').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value;
    const errorEl = document.getElementById('register-error');
    const successEl = document.getElementById('register-success');
    const spinner = document.getElementById('register-spinner');
    const btnText = document.getElementById('register-btn-text');

    if (!nombres || !apellidos || !telefono || !email || !username || !password) {
      errorEl.textContent = 'Todos los campos son obligatorios';
      return;
    }

    const telValidation = validatePhoneNumber(telefono);
    if (!telValidation.isValid) {
      errorEl.textContent = `Número de teléfono: ${telValidation.message}`;
      if (regTelHelper) {
        regTelHelper.textContent = telValidation.message;
        regTelHelper.className = 'auth-input-helper invalid';
      }
      regTelefono?.focus();
      return;
    }

    if (password.length < 8) {
      errorEl.textContent = 'La contraseña debe tener al menos 8 caracteres';
      return;
    }

    errorEl.textContent = '';
    successEl.style.display = 'none';
    spinner.style.display = 'inline-block';
    btnText.style.display = 'none';

    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, nombres, apellidos, telefono, email })
      });
      const result = await res.json();

      if (!res.ok) throw new Error((result.details ? `${result.error} (${result.details})` : null) || result.error || 'Error al registrarse');

      // SHOW SUCCESS AND SWITCH TO LOGIN
      successEl.style.display = 'block';
      setTimeout(() => {
        closeModal(registerModal);
        openModal(loginModal);
        document.getElementById('login-username').value = username;
        successEl.style.display = 'none';
      }, 1500);
      
    } catch (err) {
      console.error('Register error detail:', err);
      errorEl.textContent = `Error: ${err.message}`;
    } finally {
      spinner.style.display = 'none';
      btnText.style.display = 'inline-block';
    }
  });

  // Fetch Stats
  const loadStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/health`);
      const data = await res.json();
      if (data.players) {
        const statsNum = document.getElementById('c-players');
        const bigNum = document.getElementById('stat-num-players');
        if (statsNum) statsNum.textContent = data.players;
        if (bigNum) bigNum.textContent = data.players;
      }
    } catch (err) { console.error('Stats error:', err); }
  };
  loadStats();
});
