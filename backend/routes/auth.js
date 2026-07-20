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
  const transporter = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
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
      })
    : null;

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
  const authenticate = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token requerido' });
    }
    try {
      const token = header.split(' ')[1];
      req.user = jwt.verify(token, JWT_SECRET);
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

      await user.update({ lastLogin: new Date() });

      const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '30d' });

      res.json({ token, user: user.toPublicJSON() });
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

      // Auto-login upon verification: generate token and return it
      const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '30d' });

      res.json({ 
        success: true, 
        message: 'Cuenta verificada con éxito', 
        token, 
        user: user.toPublicJSON() 
      });
    } catch (err) {
      console.error('Verify OTP error:', err);
      res.status(500).json({ error: 'Error al verificar código OTP', details: err.message });
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
        stack: err.stack 
      });
    }
  });

  router.get('/me', authenticate, async (req, res) => {
    try {
      const user = await User.findByPk(req.user.id);
      if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
      res.json({ user: user.toPublicJSON() });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  router.patch('/onboarding', authenticate, async (req, res) => {
    try {
      const { selectedCountries, selectedClub, preferredFormation, preferredStyle, selectedTier, localCoachData } = req.body;
      const selectedCountry = req.body.selectedCountry !== undefined ? req.body.selectedCountry : selectedCountries;
      const user = await User.findByPk(req.user.id);
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
      
      updateData.onboardingComplete = true;
      
      await user.update(updateData);
      
      res.json({ success: true, user: user.toPublicJSON() });
    } catch (err) {
      console.error('Onboarding update error:', err);
      res.status(500).json({ error: 'Error al actualizar onboarding', details: err.message });
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

  return router;
};
