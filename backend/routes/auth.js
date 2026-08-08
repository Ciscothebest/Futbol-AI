const express = require('express');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');

module.exports = ({ User, JWT_SECRET }) => {
  const sequelize = User.sequelize;
  const { DataTypes } = require('sequelize');
  const ExpiredRegistration = sequelize.define('ExpiredRegistration', {
    username: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    expiredAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'expired_registrations',
    timestamps: false
  });

  ExpiredRegistration.sync().catch(err => console.error('Error syncing ExpiredRegistration:', err));
  const dns = require('dns');
  const getTransporter = async () => {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return null;
    }

    // Resolver host a IPv4 de forma dinámica para eludir bugs de IPv6/ENETUNREACH en Render
    let resolvedHost = process.env.SMTP_HOST;
    try {
      resolvedHost = await new Promise((resolve) => {
        dns.lookup(process.env.SMTP_HOST, { family: 4 }, (err, address) => {
          if (err) {
            console.error(`❌ [DNS] Error resolviendo host ${process.env.SMTP_HOST} a IPv4:`, err.message);
            resolve(process.env.SMTP_HOST);
          } else {
            console.log(`✅ [DNS] Host ${process.env.SMTP_HOST} resuelto a IPv4: ${address}`);
            resolve(address);
          }
        });
      });
    } catch (dnsErr) {
      console.error('❌ [DNS] Excepción durante la resolución:', dnsErr.message);
    }

    return nodemailer.createTransport({
      host: resolvedHost,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        rejectUnauthorized: false // Evita fallos de TLS / certificados autofirmados en hostings en la nube
      },
      connectionTimeout: 8000, // 8 segundos de timeout para conectar
      greetingTimeout: 5000,   // 5 segundos de espera para el saludo SMTP
      socketTimeout: 10000     // 10 segundos de inactividad de socket
    });
  };

  const sendOTPEmail = async (email, otp) => {
    const mailOptions = {
      from: process.env.SMTP_FROM || '"ScoutAI" <noreply@scoutai.com>',
      to: email,
      subject: 'Código de Verificación ScoutAI',
      text: `Tu código de verificación para ScoutAI es: ${otp}\n\nEste código expira en 15 minutos.`,
      html: `
        <div style="background-color: #05080c; padding: 40px 20px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff; text-align: center; border-radius: 12px; max-width: 500px; margin: 0 auto; border: 1px solid rgba(0, 240, 255, 0.15); box-shadow: 0 10px 30px rgba(0, 240, 255, 0.05);">
          <!-- Logo / Header -->
          <div style="margin-bottom: 30px;">
            <span style="font-size: 28px; font-weight: 900; letter-spacing: 2px; color: #ffffff; text-shadow: 0 0 10px rgba(0, 240, 255, 0.5);">
              SCOUT<span style="color: #00F0FF;">AI</span>
            </span>
          </div>

          <!-- Divider -->
          <div style="height: 1px; background: linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.4), transparent); margin-bottom: 30px;"></div>

          <!-- Main Content -->
          <h2 style="color: #ffffff; font-size: 22px; font-weight: 700; margin-bottom: 15px; letter-spacing: 0.5px;">Verifica tu Cuenta</h2>
          <p style="color: #a0aab8; font-size: 14px; line-height: 1.6; margin-bottom: 25px;">
            ¡Gracias por unirte a la plataforma de Inteligencia Artificial para fútbol más potente! Por favor ingresa el siguiente código de verificación de un solo uso (OTP) para completar tu onboarding:
          </p>

          <!-- OTP Box -->
          <div style="background: rgba(255, 255, 255, 0.02); border: 1.5px solid rgba(0, 240, 255, 0.3); padding: 15px 30px; border-radius: 8px; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #00F0FF; margin: 25px auto; width: fit-content; text-shadow: 0 0 15px rgba(0, 240, 255, 0.4); display: inline-block;">
            ${otp}
          </div>

          <!-- Info / Timer -->
          <p style="color: #a0aab8; font-size: 13px; margin-top: 25px;">
            Este código es válido por <strong style="color: #00F0FF;">15 minutos</strong>.
          </p>

          <!-- Footer Divider -->
          <div style="height: 1px; background: rgba(255, 255, 255, 0.05); margin: 30px 0 20px 0;"></div>

          <!-- Footer -->
          <p style="color: #52667d; font-size: 11px; line-height: 1.4; margin: 0;">
            Si no solicitaste este código, puedes ignorar este correo de forma segura.<br>
            &copy; 2026 ScoutAI Platform. Todos los derechos reservados.
          </p>
        </div>
      `
    };

    const transporter = await getTransporter();
    if (transporter) {
      try {
        await transporter.sendMail(mailOptions);
        console.log(`✉️ [SMTP] Correo de verificación enviado con éxito a ${email}`);
      } catch (error) {
        console.error(`❌ [SMTP] Error al enviar correo de verificación a ${email}:`, error);
        console.log(`✉️ [EMAIL MOCK FALLBACK] Código OTP para ${email}: ${otp}`);
      }
    } else {
      console.log(`✉️ [EMAIL MOCK] Código OTP para ${email}: ${otp}`);
    }
  };

  const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

  const cleanupUnverifiedUsers = async () => {
    try {
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
      const expiredUsers = await User.findAll({
        where: {
          isVerified: false,
          createdAt: {
            [Op.lt]: cutoff
          }
        }
      });

      for (const u of expiredUsers) {
        await ExpiredRegistration.findOrCreate({ where: { username: u.username } }).catch(() => {});
        await u.destroy().catch(() => {});
      }

      if (expiredUsers.length > 0) {
        console.log(`🧹 [CLEANUP] Deleted and logged ${expiredUsers.length} unverified users older than 24 hours.`);
      }
    } catch (error) {
      console.error('❌ [CLEANUP] Error deleting old unverified users:', error);
    }
  };

  // Run cleanup once on startup
  cleanupUnverifiedUsers();

  // Run cleanup every hour
  setInterval(cleanupUnverifiedUsers, 60 * 60 * 1000);

  const router = express.Router();

  const isAlphanumeric = (str) => /^[a-zA-Z0-0]+$/.test(str);

  const PREFIXES = {
    '+34': { country: 'España', lengths: [9], template: 'XXX XXX XXX' },
    '+54': { country: 'Argentina', lengths: [10, 11], templates: { 10: 'XX XXXX XXXX', 11: 'X XX XXXX XXXX' } },
    '+56': { country: 'Chile', lengths: [9], template: 'X XXXX XXXX' },
    '+57': { country: 'Colombia', lengths: [10], template: 'XXX XXX XXXX' },
    '+52': { country: 'México', lengths: [10], template: 'XXX XXX XXXX' },
    '+58': { country: 'Venezuela', lengths: [10], template: 'XXX XXX XXXX' },
    '+51': { country: 'Perú', lengths: [9], template: 'XXX XXX XXX' },
    '+593': { country: 'Ecuador', lengths: [9], template: 'X XXXX XXXX' },
    '+598': { country: 'Uruguay', lengths: [8, 9], templates: { 8: 'XX XXX XXX', 9: 'XXX XXX XXX' } },
    '+591': { country: 'Bolivia', lengths: [8], template: 'XXX XXX XX' },
    '+595': { country: 'Paraguay', lengths: [9], template: 'XXX XXX XXX' },
    '+507': { country: 'Panamá', lengths: [7, 8], templates: { 7: 'XXX XXXX', 8: 'XXXX XXXX' } },
    '+506': { country: 'Costa Rica', lengths: [8], template: 'XXXX XXXX' },
    '+55': { country: 'Brasil', lengths: [10, 11], templates: { 10: 'XX XXXX XXXX', 11: 'XX XXXXX XXXX' } },
    '+1': { country: 'EE.UU. / Canadá', lengths: [10], template: 'XXX XXX XXXX' },
    '+44': { country: 'Reino Unido', lengths: [10], template: 'XXX XXX XXXX' },
    '+33': { country: 'Francia', lengths: [9], template: 'X XX XX XX XX' },
    '+39': { country: 'Italia', lengths: [9, 10], templates: { 9: 'XXX XXX XXX', 10: 'XXX XXX XXXX' } },
    '+49': { country: 'Alemania', lengths: [10, 11], templates: { 10: 'XXX XXX XXXX', 11: 'XXX XXXX XXXX' } },
    '+351': { country: 'Portugal', lengths: [9], template: 'XXX XXX XXX' }
  };

  const validatePhoneNumber = (rawNumber) => {
    if (!rawNumber) return { isValid: false, message: 'Número de teléfono requerido' };
    const cleaned = rawNumber.replace(/\s/g, '');
    if (!cleaned.startsWith('+')) {
      return { isValid: false, message: 'Debe iniciar con "+" y código de país (ej: +34)' };
    }
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
        return { isValid: false, message: `Debe tener ${lengthMsg} dígitos después de ${matchedPrefix}` };
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
      return { isValid: true };
    } else {
      const digitsOnly = cleaned.replace(/\D/g, '');
      if (digitsOnly.length < 7 || digitsOnly.length > 15) {
        return { isValid: false, message: 'Formato internacional inválido (entre 7 y 15 dígitos)' };
      }
      return { isValid: true };
    }
  };

  // ─── Middleware: verify JWT ─────────────────────────────────────
  const authenticate = async (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token requerido' });
    }
    try {
      const token = header.split(' ')[1];
      req.user = jwt.verify(token, JWT_SECRET);

      if (req.user && req.user.id) {
        let dbUser = await User.findByPk(req.user.id);
        if (!dbUser && req.user.username) {
          dbUser = await User.findOne({ where: { username: req.user.username } });
        }
        if (dbUser) {
          req.user.id = dbUser.id;
        }
      }
      next();
    } catch {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }
  };

  // ─── POST /api/auth/register ────────────────────────────────────
  router.post('/register', async (req, res) => {
    console.log('📥 Registration request received:', req.body);
    try {
      await cleanupUnverifiedUsers();

      const { username, password, nombres, apellidos, telefono, email } = req.body;

      if (!username || !password || !nombres || !apellidos || !telefono || !email) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
      }
      
      const hasLetter = /[a-zA-Z]/.test(password);
      const hasNumber = /\d/.test(password);
      if (password.length < 8 || !hasLetter || !hasNumber) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres, incluyendo letras y números' });
      }

      const telValidation = validatePhoneNumber(telefono);
      if (!telValidation.isValid) {
        return res.status(400).json({ error: `Número de teléfono: ${telValidation.message}` });
      }

      const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com)$/;
      if (!emailRegex.test((email || '').toLowerCase().trim())) {
        return res.status(400).json({ error: 'El correo electrónico debe ser una cuenta válida de gmail.com o yahoo.com' });
      }

      const existing = await User.findOne({ where: { username: username.toLowerCase() } });
      if (existing) {
        return res.status(409).json({ error: 'Ese nombre de usuario ya está en uso' });
      }

      // Clean up previous expiration records if any
      await ExpiredRegistration.destroy({ where: { username: username.toLowerCase().trim() } }).catch(() => {});

      const otpCode = generateOTP();
      const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      const user = await User.create({
        username: username.toLowerCase().trim(),
        passwordHash: password,
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        telefono: telefono.trim(),
        email: email.toLowerCase().trim(),
        avatarUrl: `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(username)}&backgroundColor=0d1117&radius=50`,
        isVerified: false,
        otpCode: otpCode,
        otpExpires: otpExpires
      });

      console.log(`👤 New user registered: ${user.username} (ID: ${user.id}). OTP: ${otpCode}`);
      sendOTPEmail(user.email, otpCode).catch(err => {
        console.error('❌ [BACKGROUND-SMTP] Error al enviar correo OTP de registro:', err);
      });

      res.status(201).json({ 
        success: true, 
        message: 'Usuario registrado con éxito. Se ha enviado un código de verificación (OTP) a tu correo.',
        needsVerification: true,
        username: user.username
      });
    } catch (err) {
      console.error('Register error:', err);
      res.status(500).json({ error: 'Error al crear cuenta', details: err.message });
    }
  });

  // ─── POST /api/auth/login ───────────────────────────────────────
  router.post('/login', async (req, res) => {
    try {
      await cleanupUnverifiedUsers();

      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
      }

      const user = await User.findOne({ where: { username: username.toLowerCase().trim() } });
      if (!user) {
        // Check if they were deleted due to expiration
        const wasExpired = await ExpiredRegistration.findOne({ where: { username: username.toLowerCase().trim() } });
        if (wasExpired) {
          return res.status(404).json({ error: 'user_expired', message: 'Usuario expirado tras no haber finalizado el proceso de autenticación' });
        }
        return res.status(404).json({ error: 'user_not_found', message: 'Usuario inexistente' });
      }

      // Check if user is verified
      if (!user.isVerified) {
        // Double check if more than 24 hours have passed since creation
        const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
        if (user.createdAt < cutoff) {
          await ExpiredRegistration.findOrCreate({ where: { username: user.username } }).catch(() => {});
          await user.destroy().catch(() => {});
          return res.status(404).json({
            error: 'user_expired',
            message: 'Usuario expirado tras no haber finalizado el proceso de autenticación'
          });
        }

        const valid = await user.validatePassword(password);
        if (!valid) {
          return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        return res.status(403).json({ 
          error: 'needs_verification', 
          message: 'Cuenta no verificada. Por favor, verifica tu correo con el código OTP enviado.',
          username: user.username
        });
      }

      const valid = await user.validatePassword(password);
      if (!valid) {
        return res.status(401).json({ error: 'Credenciales incorrectas' });
      }

      // Generate a temporary passkey verification token (valid 10 minutes)
      const tempToken = jwt.sign({ id: user.id, username: user.username, isPasskeyPending: true }, JWT_SECRET, { expiresIn: '10m' });

      if (!user.hasPasskey) {
        return res.json({
          requiresPasskey: true,
          passkeyStep: 'create',
          tempToken,
          username: user.username,
          message: 'Se requiere crear una Passkey como complemento obligatorio al inicio de sesión en Futbol AI Local.'
        });
      } else {
        return res.json({
          requiresPasskey: true,
          passkeyStep: 'verify',
          tempToken,
          username: user.username,
          message: 'Por favor verifica tu Passkey para completar el inicio de sesión en Futbol AI Local.'
        });
      }
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Error al iniciar sesión', details: err.message });
    }
  });

  // ─── POST /api/auth/verify-otp ──────────────────────────────────
  router.post('/verify-otp', async (req, res) => {
    try {
      const { username, otp } = req.body;
      if (!username || !otp) {
        return res.status(400).json({ error: 'Usuario y código OTP requeridos' });
      }

      const user = await User.findOne({ where: { username: username.toLowerCase().trim() } });
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      if (user.isVerified) {
        return res.status(400).json({ error: 'La cuenta ya está verificada' });
      }

      if (user.otpCode !== otp.trim()) {
        return res.status(400).json({ error: 'Código de verificación incorrecto' });
      }

      if (new Date() > user.otpExpires) {
        return res.status(400).json({ error: 'El código de verificación ha expirado' });
      }

      // Verify user
      await user.update({
        isVerified: true,
        otpCode: null,
        otpExpires: null
      });

      console.log(`✅ User ${user.username} successfully verified email ${user.email}`);

      const tempToken = jwt.sign({ id: user.id, username: user.username, isPasskeyPending: true }, JWT_SECRET, { expiresIn: '10m' });

      res.json({ 
        success: true, 
        message: 'Cuenta verificada con éxito. Procede a configurar tu Passkey obligatoria.', 
        requiresPasskey: true,
        passkeyStep: 'create',
        tempToken, 
        user: user.toPublicJSON() 
      });
    } catch (err) {
      console.error('Verify OTP error:', err);
      res.status(500).json({ error: 'Error al verificar código OTP', details: err.message });
    }
  });

  // ─── PASSKEY ENDPOINTS ───────────────────────────────────────────
  const crypto = require('crypto');
  const bcrypt = require('bcryptjs');

  router.post('/passkey/register-options', authenticate, async (req, res) => {
    try {
      const user = await User.findByPk(req.user.id);
      if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

      const challenge = crypto.randomBytes(32).toString('base64url');
      await user.update({ passkeyChallenge: challenge });

      // Determine rpId: use the actual hostname so it always matches the current domain
      const isLocal = req.hostname === 'localhost' || req.hostname === '127.0.0.1';
      const rpId = isLocal ? 'localhost' : req.hostname;
      const rpName = isLocal ? 'Futbol AI (Local)' : 'Futbol AI';

      res.json({
        challenge,
        rp: { name: rpName, id: rpId },
        user: {
          id: Buffer.from(user.id).toString('base64url'),
          name: user.username,
          displayName: `${user.nombres || user.username}`
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' },
          { alg: -257, type: 'public-key' }
        ],
        authenticatorSelection: {
          userVerification: 'preferred',
          residentKey: 'preferred'
        },
        timeout: 60000
      });
    } catch (err) {
      console.error('Passkey register-options error:', err);
      res.status(500).json({ error: 'Error al generar opciones de Passkey', details: err.message });
    }
  });

  router.post('/passkey/register-verify', authenticate, async (req, res) => {
    try {
      const { credential, pin, deviceInfo } = req.body;
      const user = await User.findByPk(req.user.id);
      if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

      const userAgent = req.headers['user-agent'] || '';
      let detectedDevice = deviceInfo;
      if (!detectedDevice) {
        if (/android/i.test(userAgent)) detectedDevice = 'Dispositivo Móvil Android';
        else if (/iphone|ipad|ipod/i.test(userAgent)) detectedDevice = 'Dispositivo iOS (iPhone/iPad)';
        else if (/macintosh|mac os x/i.test(userAgent)) detectedDevice = 'Equipo Mac (macOS)';
        else if (/windows/i.test(userAgent)) detectedDevice = 'Equipo PC (Windows)';
        else detectedDevice = 'Dispositivo de Acceso Registrado';
      }

      const credId = (credential && (credential.id || credential.rawId)) ? (credential.id || credential.rawId) : null;

      if (credId) {
        await user.update({
          passkeyCredentialId: credId,
          passkeyPublicKey: JSON.stringify(credential),
          passkeyWebAuthnDevice: detectedDevice,
          passkeyDeviceInfo: detectedDevice,
          hasPasskey: true,
          passkeyChallenge: null,
          lastLogin: new Date()
        });
      } else if (pin) {
        if (!/^\d{6}$/.test(String(pin).trim())) {
          return res.status(400).json({ error: 'El PIN de Passkey debe ser exactamente de 6 dígitos numéricos' });
        }
        const pinHash = await bcrypt.hash(String(pin).trim(), 12);
        const mainDevice = user.passkeyWebAuthnDevice || detectedDevice;
        await user.update({
          passkeyPinHash: pinHash,
          passkeyPinDevice: detectedDevice,
          passkeyDeviceInfo: mainDevice,
          hasPasskey: true,
          passkeyChallenge: null,
          lastLogin: new Date()
        });
      } else {
        return res.status(400).json({ error: 'Se requiere una credencial WebAuthn o PIN Passkey' });
      }

      await user.reload();
      console.log(`🔐 Passkey successfully configured for user: ${user.username}, credId: ${!!user.passkeyCredentialId}, hasPin: ${!!user.passkeyPinHash}`);

      const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
      res.json({
        success: true,
        message: 'Passkey configurada con éxito',
        token,
        user: user.toPublicJSON()
      });
    } catch (err) {
      console.error('Passkey register-verify error:', err);
      res.status(500).json({ error: 'Error al registrar Passkey', details: err.message });
    }
  });

  router.post('/passkey/remove-method', authenticate, async (req, res) => {
    try {
      const { method } = req.body;
      const user = await User.findByPk(req.user.id);
      if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

      let newPasskeyCredentialId = user.passkeyCredentialId;
      let newPasskeyPinHash = user.passkeyPinHash;
      let newPasskeyPublicKey = user.passkeyPublicKey;
      let newPasskeyWebAuthnDevice = user.passkeyWebAuthnDevice;
      let newPasskeyPinDevice = user.passkeyPinDevice;

      if (method === 'webauthn') {
        newPasskeyCredentialId = null;
        newPasskeyPublicKey = null;
        newPasskeyWebAuthnDevice = null;
      } else if (method === 'pin') {
        newPasskeyPinHash = null;
        newPasskeyPinDevice = null;
      } else {
        return res.status(400).json({ error: 'Método no válido' });
      }

      const hasRemaining = !!(newPasskeyCredentialId || newPasskeyPinHash);
      const mainDeviceInfo = hasRemaining ? (newPasskeyWebAuthnDevice || newPasskeyPinDevice || user.passkeyDeviceInfo) : null;

      await user.update({
        passkeyCredentialId: newPasskeyCredentialId,
        passkeyPublicKey: newPasskeyPublicKey,
        passkeyPinHash: newPasskeyPinHash,
        passkeyWebAuthnDevice: newPasskeyWebAuthnDevice,
        passkeyPinDevice: newPasskeyPinDevice,
        passkeyDeviceInfo: mainDeviceInfo,
        hasPasskey: hasRemaining
      });

      await user.reload();
      res.json({
        success: true,
        message: `Método Passkey ${method} desvinculado exitosamente`,
        user: user.toPublicJSON()
      });
    } catch (err) {
      console.error('Remove passkey method error:', err);
      res.status(500).json({ error: 'Error al remover método Passkey', details: err.message });
    }
  });

  router.post('/passkey/update-device', authenticate, async (req, res) => {
    try {
      const { deviceInfo } = req.body;
      const user = await User.findByPk(req.user.id);
      if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

      if (!deviceInfo || !deviceInfo.trim()) {
        return res.status(400).json({ error: 'Debes proporcionar un nombre de dispositivo válido' });
      }

      const cleanDevice = deviceInfo.trim();

      await user.update({
        passkeyDeviceInfo: cleanDevice,
        passkeyWebAuthnDevice: user.passkeyCredentialId ? cleanDevice : user.passkeyWebAuthnDevice,
        passkeyPinDevice: user.passkeyPinHash ? cleanDevice : user.passkeyPinDevice
      });

      await user.reload();
      console.log(`📱 Passkey device info explicitly updated to "${cleanDevice}" for user ${user.username}`);

      res.json({
        success: true,
        message: 'Nombre de dispositivo actualizado con éxito',
        user: user.toPublicJSON()
      });
    } catch (err) {
      console.error('Update passkey device error:', err);
      res.status(500).json({ error: 'Error al actualizar dispositivo', details: err.message });
    }
  });

  router.post('/passkey/login-options', authenticate, async (req, res) => {
    try {
      const user = await User.findByPk(req.user.id);
      if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

      const challenge = crypto.randomBytes(32).toString('base64url');
      await user.update({ passkeyChallenge: challenge });

      // rpId must match the domain used during registration
      const isLocal = req.hostname === 'localhost' || req.hostname === '127.0.0.1';
      const rpId = isLocal ? 'localhost' : req.hostname;

      const allowCredentials = user.passkeyCredentialId ? [{ id: user.passkeyCredentialId, type: 'public-key' }] : [];
      res.json({
        challenge,
        rpId,
        allowCredentials,
        timeout: 60000,
        userVerification: 'preferred'
      });
    } catch (err) {
      console.error('Passkey login-options error:', err);
      res.status(500).json({ error: 'Error al generar desafío Passkey', details: err.message });
    }
  });

  router.post('/passkey/login-verify', authenticate, async (req, res) => {
    try {
      const { credential, pin } = req.body;
      const user = await User.findByPk(req.user.id);
      if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

      if (credential && credential.id) {
        const updateData = { lastLogin: new Date(), passkeyChallenge: null, hasPasskey: true };
        if (!user.passkeyCredentialId) {
          updateData.passkeyCredentialId = credential.id;
          updateData.passkeyPublicKey = JSON.stringify(credential);
        }
        await user.update(updateData);
      } else if (pin) {
        if (!user.passkeyPinHash) {
          return res.status(400).json({ error: 'No hay un PIN Passkey registrado para este usuario. Usa la opción biométrica o vuelve a crear una Passkey.' });
        }
        const validPin = await bcrypt.compare(String(pin).trim(), user.passkeyPinHash);
        if (!validPin) {
          return res.status(401).json({ error: 'PIN Passkey incorrecto' });
        }
        await user.update({ lastLogin: new Date(), passkeyChallenge: null, hasPasskey: true });
      } else {
        return res.status(400).json({ error: 'Se requiere autenticación por Passkey o PIN' });
      }

      console.log(`🔑 Passkey login successful for user: ${user.username}`);
      const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
      res.json({
        success: true,
        message: 'Autenticación Passkey exitosa',
        token,
        user: user.toPublicJSON()
      });
    } catch (err) {
      console.error('Passkey login-verify error:', err);
      res.status(500).json({ error: 'Error al verificar Passkey', details: err.message });
    }
  });

  // ─── POST /api/auth/resend-otp ──────────────────────────────────
  router.post('/resend-otp', async (req, res) => {
    try {
      const { username } = req.body;
      if (!username) {
        return res.status(400).json({ error: 'Usuario requerido' });
      }

      const user = await User.findOne({ where: { username: username.toLowerCase().trim() } });
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      if (user.isVerified) {
        return res.status(400).json({ error: 'La cuenta ya está verificada' });
      }

      const otpCode = generateOTP();
      const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      await user.update({
        otpCode,
        otpExpires
      });

      console.log(`✉️ Resending OTP to user ${user.username} (${user.email}). New OTP: ${otpCode}`);
      sendOTPEmail(user.email, otpCode).catch(err => {
        console.error('❌ [BACKGROUND-SMTP] Error al reenviar correo OTP:', err);
      });

      res.json({ success: true, message: 'Código de verificación reenviado con éxito.' });
    } catch (err) {
      console.error('Resend OTP error:', err);
      res.status(500).json({ error: 'Error al reenviar código OTP', details: err.message });
    }
  });

  // Endpoint de Diagnóstico para probar SMTP en Producción
  router.post('/test-smtp', async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: 'Email requerido' });

      const transporter = await getTransporter();
      if (!transporter) {
        return res.status(400).json({ 
          error: 'El transporter SMTP no está configurado en las variables de entorno de Render.',
          envDetected: {
            SMTP_HOST: !!process.env.SMTP_HOST,
            SMTP_USER: !!process.env.SMTP_USER,
            SMTP_PASS: !!process.env.SMTP_PASS ? 'Configurado' : 'Faltante',
            SMTP_PORT: process.env.SMTP_PORT
          }
        });
      }

      const mailOptions = {
        from: process.env.SMTP_FROM || '"ScoutAI Diagnostico" <noreply@scoutai.com>',
        to: email,
        subject: 'Prueba de Conexión SMTP - ScoutAI',
        text: 'Si estás leyendo esto, la comunicación entre el servidor de Render y Gmail funciona correctamente.'
      };

      await transporter.sendMail(mailOptions);
      res.json({ success: true, message: `Correo de prueba enviado con éxito a: ${email}` });
    } catch (err) {
      console.error('SMTP test failure:', err);
      res.status(500).json({ 
        error: 'Error de conexión SMTP', 
        message: err.message, 
        code: err.code, 
        command: err.command,
        connectionDetails: {
          SMTP_HOST: process.env.SMTP_HOST,
          SMTP_PORT: process.env.SMTP_PORT || '587 (Default)',
          SMTP_SECURE: process.env.SMTP_SECURE || 'false (Default)',
          SMTP_USER: process.env.SMTP_USER
        },
        stack: err.stack 
      });
    }
  });

  router.get('/me', authenticate, async (req, res) => {
    try {
      let user = await User.findByPk(req.user.id);
      if (!user && req.user.username) {
        user = await User.findOne({ where: { username: req.user.username } });
      }
      if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
      if (user.checkAndResetDailyLimits) {
        await user.checkAndResetDailyLimits();
      }
      res.json({ user: user.toPublicJSON() });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  router.patch('/onboarding', authenticate, async (req, res) => {
    try {
      const { selectedCountries, selectedClub, preferredFormation, preferredStyle, selectedTier, localCoachData } = req.body;
      const selectedCountry = req.body.selectedCountry !== undefined ? req.body.selectedCountry : selectedCountries;
      let user = await User.findByPk(req.user.id);
      if (!user && req.user.username) {
        user = await User.findOne({ where: { username: req.user.username } });
      }
      if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
      
      const updateData = {};
      if (selectedCountry !== undefined) {
        updateData.selectedCountry = String(selectedCountry || '');
      }
      if (selectedClub !== undefined) {
        updateData.selectedClub = selectedClub;
      }
      if (preferredFormation !== undefined) {
        updateData.preferredFormation = preferredFormation;
      }
      if (preferredStyle !== undefined) {
        updateData.preferredStyle = preferredStyle;
      }
      if (selectedTier !== undefined) {
        updateData.selectedTier = selectedTier;
      }
      if (req.body.role !== undefined) {
        updateData.role = req.body.role;
      }
      if (localCoachData !== undefined) {
        updateData.localCoachData = typeof localCoachData === 'object' ? JSON.stringify(localCoachData) : localCoachData;
      }
      if (req.body.billingCycleStart !== undefined) {
        updateData.billingCycleStart = req.body.billingCycleStart;
      }
      if (req.body.billingCycleEnd !== undefined) {
        updateData.billingCycleEnd = req.body.billingCycleEnd;
      }
      if (req.body.autoRenew !== undefined) {
        updateData.autoRenew = !!req.body.autoRenew;
      }
      if (req.body.maxPaidTierInCycle !== undefined) {
        updateData.maxPaidTierInCycle = req.body.maxPaidTierInCycle;
      }
      
      const wasLocal = (user.selectedTier || '').toLowerCase() === 'local' || (user.role || '').toLowerCase() === 'entrenador local';
      const isTargetingLocal = selectedTier === 'Local';
      const hasStandardTeam = (selectedClub && selectedClub !== 'Club Local') || (user.selectedClub && user.selectedClub !== 'Club Local' && user.selectedClub !== '');
      
      if (wasLocal && !isTargetingLocal && !hasStandardTeam && selectedClub === undefined) {
        updateData.onboardingComplete = false;
      } else {
        updateData.onboardingComplete = true;
      }
      
      await user.update(updateData);
      
      res.json({ success: true, user: user.toPublicJSON() });
    } catch (err) {
      console.error('Onboarding update error:', err);
      res.status(500).json({ error: 'Error al actualizar onboarding', details: err.message });
    }
  });

  router.post('/unsubscribe', authenticate, async (req, res) => {
    try {
      const user = await User.findByPk(req.user.id);
      if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

      await user.update({ autoRenew: false });
      res.json({ success: true, message: 'Renovación automática cancelada exitosamente', user: user.toPublicJSON() });
    } catch (err) {
      console.error('Unsubscribe error:', err);
      res.status(500).json({ error: 'Error al desuscribirse', details: err.message });
    }
  });

  router.get('/local-players', authenticate, async (req, res) => {
    try {
      const user = await User.findByPk(req.user.id);
      if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
      let data = {};
      if (user.localCoachData) {
        try {
          data = typeof user.localCoachData === 'string' ? JSON.parse(user.localCoachData) : user.localCoachData;
        } catch (e) {
          data = {};
        }
      }
      res.json({ success: true, players: Array.isArray(data.players) ? data.players : [] });
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener jugadores locales', details: err.message });
    }
  });

  router.post('/local-players', authenticate, async (req, res) => {
    try {
      const { players } = req.body;
      if (!Array.isArray(players)) {
        return res.status(400).json({ error: 'players debe ser un arreglo de jugadores' });
      }
      const user = await User.findByPk(req.user.id);
      if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
      
      let data = {};
      if (user.localCoachData) {
        try {
          data = typeof user.localCoachData === 'string' ? JSON.parse(user.localCoachData) : user.localCoachData;
        } catch (e) {
          data = {};
        }
      }
      data.players = players;
      await user.update({ localCoachData: JSON.stringify(data) });
      res.json({ success: true, players: data.players, user: user.toPublicJSON() });
    } catch (err) {
      res.status(500).json({ error: 'Error al actualizar jugadores locales', details: err.message });
    }
  });

  router.put('/update-profile', authenticate, async (req, res) => {
    try {
      const { nombres, apellidos, telefono, email, role } = req.body;
      
      if (!nombres || !apellidos || !telefono || !email) {
        return res.status(400).json({ error: 'Nombres, apellidos, teléfono y correo electrónico son obligatorios' });
      }

      const telValidation = validatePhoneNumber(telefono);
      if (!telValidation.isValid) {
        return res.status(400).json({ error: `Número de teléfono: ${telValidation.message}` });
      }

      const user = await User.findByPk(req.user.id);
      if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

      await user.update({
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        telefono: telefono.trim(),
        email: email.toLowerCase().trim(),
        role: role ? role.trim() : user.role
      });

      res.json({ success: true, user: user.toPublicJSON() });
    } catch (err) {
      console.error('Update profile error:', err);
      res.status(500).json({ error: 'Error al actualizar el perfil', details: err.message });
    }
  });

  router.post('/upload-avatar', authenticate, async (req, res) => {
    try {
      const { imageBase64 } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: 'No se recibió ninguna imagen' });
      }

      // Validate base64 image data
      const matches = imageBase64.match(/^data:image\/([A-Za-z\-+]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ error: 'Formato de imagen inválido' });
      }

      const imageBuffer = Buffer.from(matches[2], 'base64');
      const extension = matches[1] === 'jpeg' ? 'jpg' : matches[1];
      
      const fs = require('fs');
      const path = require('path');
      const uploadsDir = path.join(__dirname, '../../frontend/uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const fileName = `avatar-${req.user.id}-${Date.now()}.${extension}`;
      const filePath = path.join(uploadsDir, fileName);

      // Clean up old avatars for this user
      const files = fs.readdirSync(uploadsDir);
      for (const file of files) {
        if (file.startsWith(`avatar-${req.user.id}-`)) {
          try {
            fs.unlinkSync(path.join(uploadsDir, file));
          } catch (e) {
            console.error('Error deleting old avatar:', e);
          }
        }
      }

      fs.writeFileSync(filePath, imageBuffer);

      const avatarUrl = `/uploads/${fileName}`;

      const user = await User.findByPk(req.user.id);
      if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

      await user.update({ avatarUrl });

      res.json({ success: true, avatarUrl, user: user.toPublicJSON() });
    } catch (err) {
      console.error('Avatar upload error:', err);
      res.status(500).json({ error: 'Error al subir la imagen de perfil', details: err.message });
    }
  });

  // ─── SECURITY QUESTIONS ENDPOINTS ────────────────────────────────
  router.get('/security-questions', authenticate, async (req, res) => {
    try {
      const user = await User.findByPk(req.user.id);
      if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

      let questions = [];
      if (user.securityQuestions) {
        try {
          const parsed = typeof user.securityQuestions === 'string' ? JSON.parse(user.securityQuestions) : user.securityQuestions;
          if (Array.isArray(parsed)) {
            questions = parsed.map(q => ({ question: q.question }));
          }
        } catch (e) {
          questions = [];
        }
      }
      res.json({ success: true, questions, hasConfigured: questions.length === 3 });
    } catch (err) {
      console.error('Get security questions error:', err);
      res.status(500).json({ error: 'Error al obtener preguntas de seguridad', details: err.message });
    }
  });

  router.post('/security-questions', authenticate, async (req, res) => {
    try {
      const { items } = req.body;
      if (!Array.isArray(items) || items.length !== 3) {
        return res.status(400).json({ error: 'Debes proporcionar exactamente 3 preguntas de seguridad con sus respuestas' });
      }

      const bcrypt = require('bcryptjs');
      const processedItems = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (!item || !item.question || !item.answer) {
          return res.status(400).json({ error: `La pregunta y respuesta #${i + 1} son obligatorias` });
        }
        const qStr = String(item.question).trim();
        const aStr = String(item.answer).trim().toLowerCase();

        if (qStr.length < 5) {
          return res.status(400).json({ error: `La pregunta #${i + 1} debe tener al menos 5 caracteres` });
        }
        if (aStr.length < 2) {
          return res.status(400).json({ error: `La respuesta #${i + 1} debe tener al menos 2 caracteres` });
        }

        const answerHash = await bcrypt.hash(aStr, 10);
        processedItems.push({
          question: qStr,
          answerHash: answerHash
        });
      }

      const user = await User.findByPk(req.user.id);
      if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

      await user.update({
        securityQuestions: JSON.stringify(processedItems)
      });

      console.log(`❓ Security questions updated for user ${user.username}`);
      res.json({ success: true, message: '3 preguntas de seguridad guardadas exitosamente', user: user.toPublicJSON() });
    } catch (err) {
      console.error('Save security questions error:', err);
      res.status(500).json({ error: 'Error al guardar preguntas de seguridad', details: err.message });
    }
  });

  return router;
};
