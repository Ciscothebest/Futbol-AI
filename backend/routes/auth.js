const express = require('express');
const jwt = require('jsonwebtoken');

module.exports = ({ User, JWT_SECRET }) => {
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
      const { username, password, nombres, apellidos, telefono, email } = req.body;

      if (!username || !password || !nombres || !apellidos || !telefono || !email) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
      }
      
      if (password.length < 8) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
      }

      const telValidation = validatePhoneNumber(telefono);
      if (!telValidation.isValid) {
        return res.status(400).json({ error: `Número de teléfono: ${telValidation.message}` });
      }

      const existing = await User.findOne({ where: { username: username.toLowerCase() } });
      if (existing) {
        return res.status(409).json({ error: 'Ese nombre de usuario ya está en uso' });
      }

      const user = await User.create({
        username: username.toLowerCase().trim(),
        passwordHash: password,
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        telefono: telefono.trim(),
        email: email.toLowerCase().trim(),
        avatarUrl: `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(username)}&backgroundColor=0d1117&radius=50`
      });

      console.log(`👤 New user registered: ${user.username} (ID: ${user.id})`);
      res.status(201).json({ success: true, message: 'Usuario registrado con éxito' });
    } catch (err) {
      console.error('Register error:', err);
      res.status(500).json({ error: 'Error al crear cuenta', details: err.message });
    }
  });

  // ─── POST /api/auth/login ───────────────────────────────────────
  router.post('/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
      }

      const user = await User.findOne({ where: { username: username.toLowerCase().trim() } });
      if (!user) {
        return res.status(401).json({ error: 'Credenciales incorrectas' });
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
      const { selectedCountries, selectedClub, preferredFormation, preferredStyle, selectedTier } = req.body;
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
