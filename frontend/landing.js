document.addEventListener('DOMContentLoaded', () => {
  let currentTempToken = null;
  const loginModal = document.getElementById('login-modal');
  const registerModal = document.getElementById('register-modal');
  const otpModal = document.getElementById('otp-modal');
  const btnOpenLogin = document.getElementById('btn-open-login');
  const btnOpenRegister = document.getElementById('btn-open-register');
  const closeLogin = document.getElementById('close-login');
  const closeRegister = document.getElementById('close-register');
  const closeOtp = document.getElementById('close-otp');

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
  closeOtp?.addEventListener('click', () => closeModal(otpModal));

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

  // Show Premium Server Error Modal (500/504)
  const showErrorModal = (message) => {
    const modal = document.getElementById('server-error-modal');
    const msgEl = document.getElementById('server-error-msg');
    const titleEl = document.getElementById('server-error-title');
    const descEl = document.getElementById('server-error-desc');
    const symbolEl = document.getElementById('server-error-icon-symbol');

    if (modal && msgEl) {
      msgEl.textContent = message || 'Fallo de conexión en el backend.';
      
      const is504 = message && (message.includes('504') || message.toLowerCase().includes('timeout'));
      if (is504) {
        if (titleEl) {
          titleEl.textContent = 'Tiempo de Espera Agotado (504)';
          titleEl.style.background = 'linear-gradient(135deg, #ff8a00, #ffb800)';
          titleEl.style.webkitBackgroundClip = 'text';
          titleEl.style.webkitTextFillColor = 'transparent';
        }
        if (descEl) {
          descEl.textContent = 'El servidor proxy excedió el tiempo de respuesta del backend en Render. Esto suele ocurrir si la instancia gratuita de Render se encuentra en reposo y tarda en reactivarse o hay sobrecarga.';
        }
        if (symbolEl) {
          symbolEl.textContent = '⏳';
        }
      } else {
        if (titleEl) {
          titleEl.textContent = 'Error de Infraestructura 500';
          titleEl.style.background = 'linear-gradient(135deg, #ff4a4a, #ff8a00)';
          titleEl.style.webkitBackgroundClip = 'text';
          titleEl.style.webkitTextFillColor = 'transparent';
        }
        if (descEl) {
          descEl.textContent = 'El servidor de Render no pudo procesar tu solicitud. Esto ocurre habitualmente cuando las variables de envío de correo SMTP no están configuradas en el panel de Render.';
        }
        if (symbolEl) {
          symbolEl.textContent = '⚠️';
        }
      }

      modal.style.display = 'flex';
      
      // Cerrar modales que pudieran estar abiertos para no empalmar
      const loginModal = document.getElementById('login-modal');
      const registerModal = document.getElementById('register-modal');
      const otpModal = document.getElementById('otp-modal');
      if (loginModal) loginModal.style.display = 'none';
      if (registerModal) registerModal.style.display = 'none';
      if (otpModal) otpModal.style.display = 'none';
    }
  };

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
      
      let result;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        result = await res.json();
      } else {
        const errorText = await res.text();
        throw new Error(errorText.substring(0, 120) || `El servidor de Render devolvió un error ${res.status} sin formato JSON.`);
      }

      if (!res.ok) {
        if (result.error === 'needs_verification') {
          // Close login modal
          closeModal(loginModal);
          
          // Open pending-verification-modal
          const pendingModal = document.getElementById('pending-verification-modal');
          if (pendingModal) {
            pendingModal.style.display = 'flex';
            
            // Configure the "Autenticar cuenta" button
            const authBtn = document.getElementById('btn-pending-verify-auth');
            if (authBtn) {
              authBtn.onclick = async () => {
                authBtn.disabled = true;
                authBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando código...';
                
                try {
                  // Trigger resend-otp API call
                  const resendRes = await fetch(`${API_URL}/resend-otp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username })
                  });
                  const resendResult = await resendRes.json();
                  
                  if (!resendRes.ok) throw new Error(resendResult.error || 'Error al enviar OTP');
                  
                  // Hide pending modal
                  pendingModal.style.display = 'none';
                  
                  // Open OTP verification modal
                  openModal(otpModal);
                  document.getElementById('otp-username').value = username;
                  document.getElementById('otp-code').value = '';
                  document.getElementById('otp-error').textContent = '';
                  
                  const otpSuccessEl = document.getElementById('otp-success');
                  if (otpSuccessEl) {
                    otpSuccessEl.textContent = 'Código enviado con éxito. Revisa tu correo.';
                    otpSuccessEl.style.display = 'block';
                  }
                  
                  // Start countdown timer if function exists
                  if (typeof startResendCountdown === 'function') {
                    startResendCountdown();
                  }
                } catch (resendErr) {
                  alert(`Error: ${resendErr.message}`);
                } finally {
                  authBtn.disabled = false;
                  authBtn.textContent = 'Autenticar cuenta';
                }
              };
            }
          }
          return;
        } else if (result.error === 'user_expired') {
          closeModal(loginModal);
          const expiredModal = document.getElementById('expired-registration-modal');
          if (expiredModal) expiredModal.style.display = 'flex';
          return;
        } else if (result.error === 'user_not_found') {
          closeModal(loginModal);
          const nonexistentModal = document.getElementById('nonexistent-user-modal');
          if (nonexistentModal) nonexistentModal.style.display = 'flex';
          return;
        }
        throw new Error((result.details ? `${result.error} (${result.details})` : null) || result.error || 'Error al iniciar sesión');
      }

      if (result.requiresPasskey) {
        currentTempToken = result.tempToken;
        closeModal(loginModal);
        if (result.passkeyStep === 'create') {
          const passkeyCreateModal = document.getElementById('passkey-create-modal');
          if (passkeyCreateModal) passkeyCreateModal.style.display = 'flex';
        } else {
          const passkeyVerifyModal = document.getElementById('passkey-verify-modal');
          if (passkeyVerifyModal) passkeyVerifyModal.style.display = 'flex';
        }
        return;
      }

      localStorage.setItem('scout_ai_token', result.token);
      localStorage.setItem('scout_ai_user', JSON.stringify(result.user));
      window.location.href = 'index.html';
    } catch (err) {
      console.error('Login error detail:', err);
      errorEl.textContent = `Error: ${err.message}`;
      if (err.message.includes('500') || err.message.includes('502') || err.message.includes('504') || err.message.includes('sin formato JSON')) {
        showErrorModal(err.message);
      }
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

    const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com)$/;
    if (!emailRegex.test(email.toLowerCase().trim())) {
      errorEl.textContent = 'El correo electrónico debe ser una cuenta válida de gmail.com o yahoo.com';
      return;
    }

    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    if (password.length < 8 || !hasLetter || !hasNumber) {
      errorEl.textContent = 'La contraseña debe tener al menos 8 caracteres, incluyendo letras y números';
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
      
      let result;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        result = await res.json();
      } else {
        const errorText = await res.text();
        throw new Error(errorText.substring(0, 120) || `El servidor de Render devolvió un error ${res.status} sin formato JSON.`);
      }

      if (!res.ok) throw new Error((result.details ? `${result.error} (${result.details})` : null) || result.error || 'Error al registrarse');

      // SHOW SUCCESS AND SWITCH TO OTP MODAL
      successEl.style.display = 'block';
      setTimeout(() => {
        closeModal(registerModal);
        openModal(otpModal);
         document.getElementById('otp-username').value = username;
         document.getElementById('otp-code').value = '';
         document.getElementById('otp-error').textContent = '';
         const otpSuccessEl = document.getElementById('otp-success');
         if (otpSuccessEl) {
           otpSuccessEl.textContent = 'Código enviado con éxito. Revisa tu correo.';
           otpSuccessEl.style.display = 'block';
         }
         successEl.style.display = 'none';
      }, 1500);
      
    } catch (err) {
      console.error('Register error detail:', err);
      errorEl.textContent = `Error: ${err.message}`;
      if (err.message.includes('500') || err.message.includes('502') || err.message.includes('504') || err.message.includes('sin formato JSON')) {
        showErrorModal(err.message);
      }
    } finally {
      spinner.style.display = 'none';
      btnText.style.display = 'inline-block';
    }
  });

  // PREVENT PASTE ON OTP INPUT
  document.getElementById('otp-code')?.addEventListener('paste', (e) => {
    e.preventDefault();
  });

  // OTP FORM SUBMIT
  document.getElementById('otp-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('otp-username').value;
    const otp = document.getElementById('otp-code').value.trim();
    const errorEl = document.getElementById('otp-error');
    const successEl = document.getElementById('otp-success');
    const spinner = document.getElementById('otp-spinner');
    const btnText = document.getElementById('otp-btn-text');

    if (!otp) {
      errorEl.textContent = 'Ingresa el código OTP';
      return;
    }

    errorEl.textContent = '';
    successEl.style.display = 'none';
    spinner.style.display = 'inline-block';
    btnText.style.display = 'none';

    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, otp })
      });
      const result = await res.json();

      if (!res.ok) throw new Error(result.error || 'Error al verificar el código');

      if (result.requiresPasskey) {
        currentTempToken = result.tempToken;
        successEl.textContent = '¡Cuenta verificada con éxito! Configura tu Passkey obligatoria.';
        successEl.style.display = 'block';
        setTimeout(() => {
          closeModal(otpModal);
          const passkeyCreateModal = document.getElementById('passkey-create-modal');
          if (passkeyCreateModal) passkeyCreateModal.style.display = 'flex';
        }, 1200);
        return;
      }

      successEl.textContent = '¡Cuenta verificada con éxito! Iniciando sesión...';
      successEl.style.display = 'block';

      localStorage.setItem('scout_ai_token', result.token);
      localStorage.setItem('scout_ai_user', JSON.stringify(result.user));

      setTimeout(() => {
        closeModal(otpModal);
        window.location.href = 'index.html';
      }, 1500);
    } catch (err) {
      console.error('OTP verification error:', err);
      errorEl.textContent = err.message;
      if (err.message.includes('500') || err.message.includes('502') || err.message.includes('504') || err.message.includes('sin formato JSON')) {
        showErrorModal(err.message);
      }
    } finally {
      spinner.style.display = 'none';
      btnText.style.display = 'inline-block';
    }
  });

  // RESEND OTP
  let resendCooldown = false;
  let resendTimer = null;

  const startResendCountdown = () => {
    const btn = document.getElementById('resend-otp-btn');
    if (!btn) return;
    
    resendCooldown = true;
    btn.style.pointerEvents = 'none';
    btn.style.opacity = '0.5';
    
    let secondsLeft = 60;
    btn.textContent = `Reenviar código (${secondsLeft}s)`;

    resendTimer = setInterval(() => {
      secondsLeft--;
      if (secondsLeft <= 0) {
        clearInterval(resendTimer);
        resendCooldown = false;
        btn.style.pointerEvents = 'auto';
        btn.style.opacity = '1';
        btn.textContent = 'Reenviar código';
      } else {
        btn.textContent = `Reenviar código (${secondsLeft}s)`;
      }
    }, 1000);
  };

  document.getElementById('resend-otp-btn')?.addEventListener('click', async (e) => {
    e.preventDefault();
    if (resendCooldown) return;

    const username = document.getElementById('otp-username').value;
    const errorEl = document.getElementById('otp-error');
    const successEl = document.getElementById('otp-success');

    if (!username) {
      errorEl.textContent = 'Error: no se detectó el usuario';
      return;
    }

    errorEl.textContent = '';
    successEl.style.display = 'none';

    try {
      startResendCountdown();

      const res = await fetch(`${API_BASE}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      const result = await res.json();

      if (!res.ok) throw new Error(result.error || 'Error al reenviar el código');

      successEl.textContent = result.message || 'Código reenviado con éxito';
      successEl.style.display = 'block';
    } catch (err) {
      console.error('Resend OTP error:', err);
      errorEl.textContent = err.message;
      if (err.message.includes('500') || err.message.includes('502') || err.message.includes('504') || err.message.includes('sin formato JSON')) {
        showErrorModal(err.message);
      }
      
      if (resendTimer) clearInterval(resendTimer);
      resendCooldown = false;
      const btn = document.getElementById('resend-otp-btn');
      if (btn) {
        btn.style.pointerEvents = 'auto';
        btn.style.opacity = '1';
        btn.textContent = 'Reenviar código';
      }
    }
  });

  // ─── PASSKEY WEBAUTHN & PIN HELPERS ────────────────────────────
  const bufferToBase64Url = (buffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  };

  const base64UrlToBuffer = (base64url) => {
    let padding = '='.repeat((4 - base64url.length % 4) % 4);
    let base64 = (base64url + padding).replace(/-/g, '+').replace(/_/g, '/');
    let rawData = window.atob(base64);
    let outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray.buffer;
  };

  const btnPasskeyCreateWebAuthn = document.getElementById('btn-passkey-create-webauthn');
  const btnPasskeyVerifyWebAuthn = document.getElementById('btn-passkey-verify-webauthn');
  const passkeyPinCreateForm = document.getElementById('passkey-pin-create-form');
  const passkeyPinVerifyForm = document.getElementById('passkey-pin-verify-form');

  // 1. Create Passkey via WebAuthn
  btnPasskeyCreateWebAuthn?.addEventListener('click', async () => {
    const errorEl = document.getElementById('passkey-create-error');
    const successEl = document.getElementById('passkey-create-success');
    if (errorEl) errorEl.textContent = '';
    if (successEl) successEl.style.display = 'none';

    if (!currentTempToken) {
      if (errorEl) errorEl.textContent = 'Sesión expirada. Por favor vuelve a iniciar sesión.';
      return;
    }

    try {
      btnPasskeyCreateWebAuthn.disabled = true;
      btnPasskeyCreateWebAuthn.innerHTML = '<span>Configurando Passkey...</span>';

      const optRes = await fetch(`${API_BASE}/auth/passkey/register-options`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentTempToken}`
        }
      });
      const options = await optRes.json();
      if (!optRes.ok) throw new Error(options.error || 'Error al obtener opciones del servidor');

      if (!window.PublicKeyCredential || !window.isSecureContext) {
        throw new Error('WebAuthn (Passkey) requiere conexión HTTPS o acceder mediante http://localhost:3001');
      }

      options.challenge = base64UrlToBuffer(options.challenge);
      options.user.id = base64UrlToBuffer(options.user.id);

      const credential = await navigator.credentials.create({ publicKey: options });
      
      const credentialPayload = {
        id: credential.id,
        rawId: bufferToBase64Url(credential.rawId),
        type: credential.type,
        response: {
          clientDataJSON: bufferToBase64Url(credential.response.clientDataJSON),
          attestationObject: bufferToBase64Url(credential.response.attestationObject)
        }
      };

      const verifyRes = await fetch(`${API_BASE}/auth/passkey/register-verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentTempToken}`
        },
        body: JSON.stringify({ credential: credentialPayload })
      });
      const verifyResult = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(verifyResult.error || 'Error al verificar Passkey creada');

      if (successEl) {
        successEl.textContent = '¡Passkey registrada con éxito! Redirigiendo...';
        successEl.style.display = 'block';
      }

      localStorage.setItem('scout_ai_token', verifyResult.token);
      localStorage.setItem('scout_ai_user', JSON.stringify(verifyResult.user));

      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1200);

    } catch (err) {
      console.error('Passkey creation error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'AbortError') {
        const cancelledModal = document.getElementById('passkey-cancelled-modal');
        if (cancelledModal) cancelledModal.style.display = 'flex';
      } else {
        if (errorEl) {
          errorEl.textContent = err.message || 'Error al configurar Passkey';
          errorEl.style.display = 'block';
        }
      }
    } finally {
      if (btnPasskeyCreateWebAuthn) {
        btnPasskeyCreateWebAuthn.disabled = false;
        btnPasskeyCreateWebAuthn.innerHTML = '<span>CONFIGURAR PASSKEY</span>';
      }
    }
  });

  // 2. Create Passkey via PIN Fallback
  passkeyPinCreateForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pinInput = document.getElementById('passkey-pin-create-input');
    const errorEl = document.getElementById('passkey-create-error');
    const successEl = document.getElementById('passkey-create-success');
    const pin = pinInput?.value.trim();

    if (!pin || !/^\d{6}$/.test(pin)) {
      if (errorEl) errorEl.textContent = 'El PIN debe ser exactamente de 6 dígitos numéricos';
      return;
    }

    if (!currentTempToken) {
      if (errorEl) errorEl.textContent = 'Sesión expirada. Vuelve a iniciar sesión.';
      return;
    }

    if (errorEl) errorEl.textContent = '';
    if (successEl) successEl.style.display = 'none';

    try {
      const verifyRes = await fetch(`${API_BASE}/auth/passkey/register-verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentTempToken}`
        },
        body: JSON.stringify({ pin })
      });
      const verifyResult = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(verifyResult.error || 'Error al guardar PIN Passkey');

      if (successEl) {
        successEl.textContent = '¡PIN Passkey guardado con éxito! Redirigiendo...';
        successEl.style.display = 'block';
      }

      localStorage.setItem('scout_ai_token', verifyResult.token);
      localStorage.setItem('scout_ai_user', JSON.stringify(verifyResult.user));

      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1200);
    } catch (err) {
      console.error('PIN Passkey create error:', err);
      if (errorEl) errorEl.textContent = err.message;
    }
  });

  // 3. Verify Passkey via WebAuthn
  btnPasskeyVerifyWebAuthn?.addEventListener('click', async () => {
    const errorEl = document.getElementById('passkey-verify-error');
    const successEl = document.getElementById('passkey-verify-success');
    if (errorEl) errorEl.textContent = '';
    if (successEl) successEl.style.display = 'none';

    if (!currentTempToken) {
      if (errorEl) errorEl.textContent = 'Sesión expirada. Por favor vuelve a iniciar sesión.';
      return;
    }

    try {
      btnPasskeyVerifyWebAuthn.disabled = true;
      btnPasskeyVerifyWebAuthn.innerHTML = '<span>Verificando Passkey...</span>';

      const optRes = await fetch(`${API_BASE}/auth/passkey/login-options`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentTempToken}`
        }
      });
      const options = await optRes.json();
      if (!optRes.ok) throw new Error(options.error || 'Error al obtener desafío del servidor');

      if (!window.PublicKeyCredential || !window.isSecureContext) {
        throw new Error('WebAuthn (Passkey) requiere conexión HTTPS o acceder mediante http://localhost:3001');
      }

      options.challenge = base64UrlToBuffer(options.challenge);
      if (options.allowCredentials && options.allowCredentials.length > 0) {
        options.allowCredentials = options.allowCredentials.map(c => ({
          ...c,
          id: base64UrlToBuffer(c.id)
        }));
      } else {
        delete options.allowCredentials;
      }

      const assertion = await navigator.credentials.get({ publicKey: options });

      const assertionPayload = {
        id: assertion.id,
        rawId: bufferToBase64Url(assertion.rawId),
        type: assertion.type,
        response: {
          clientDataJSON: bufferToBase64Url(assertion.response.clientDataJSON),
          authenticatorData: bufferToBase64Url(assertion.response.authenticatorData),
          signature: bufferToBase64Url(assertion.response.signature)
        }
      };

      const verifyRes = await fetch(`${API_BASE}/auth/passkey/login-verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentTempToken}`
        },
        body: JSON.stringify({ credential: assertionPayload })
      });
      const verifyResult = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(verifyResult.error || 'Error al autenticar Passkey');

      if (successEl) {
        successEl.textContent = '¡Autenticación Passkey exitosa! Redirigiendo...';
        successEl.style.display = 'block';
      }

      localStorage.setItem('scout_ai_token', verifyResult.token);
      localStorage.setItem('scout_ai_user', JSON.stringify(verifyResult.user));

      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1200);

    } catch (err) {
      console.error('Passkey verify error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'AbortError') {
        const cancelledModal = document.getElementById('passkey-cancelled-modal');
        if (cancelledModal) cancelledModal.style.display = 'flex';
      } else {
        if (errorEl) {
          errorEl.textContent = err.message || 'Error al autenticar Passkey';
          errorEl.style.display = 'block';
        }
      }
    } finally {
      if (btnPasskeyVerifyWebAuthn) {
        btnPasskeyVerifyWebAuthn.disabled = false;
        btnPasskeyVerifyWebAuthn.innerHTML = '<span>AUTENTICAR CON PASSKEY</span>';
      }
    }
  });

  // 4. Verify Passkey via PIN
  passkeyPinVerifyForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pinInput = document.getElementById('passkey-pin-verify-input');
    const errorEl = document.getElementById('passkey-verify-error');
    const successEl = document.getElementById('passkey-verify-success');
    const pin = pinInput?.value.trim();

    if (!pin || !/^\d{6}$/.test(pin)) {
      if (errorEl) errorEl.textContent = 'Ingresa los 6 dígitos numéricos de tu PIN Passkey';
      return;
    }

    if (!currentTempToken) {
      if (errorEl) errorEl.textContent = 'Sesión expirada. Vuelve a iniciar sesión.';
      return;
    }

    if (errorEl) errorEl.textContent = '';
    if (successEl) successEl.style.display = 'none';

    try {
      const verifyRes = await fetch(`${API_BASE}/auth/passkey/login-verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentTempToken}`
        },
        body: JSON.stringify({ pin })
      });
      const verifyResult = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(verifyResult.error || 'Error al verificar PIN Passkey');

      if (successEl) {
        successEl.textContent = '¡PIN verificado con éxito! Accediendo a Futbol AI Local...';
        successEl.style.display = 'block';
      }

      localStorage.setItem('scout_ai_token', verifyResult.token);
      localStorage.setItem('scout_ai_user', JSON.stringify(verifyResult.user));

      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1200);
    } catch (err) {
      console.error('PIN Passkey verify error:', err);
      if (errorEl) errorEl.textContent = err.message;
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
