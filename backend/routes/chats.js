const express = require('express');
const { Op } = require('sequelize');

module.exports = ({ User, DirectMessage, UserContact }) => {
  const router = express.Router();

  // Helper to format user for public chat contacts
  const formatChatUser = (u) => {
    if (!u) return null;
    const json = u.toPublicJSON ? u.toPublicJSON() : u;

    let localClub = null;
    if (json.localCoachData) {
      try {
        const parsed = typeof json.localCoachData === 'string' ? JSON.parse(json.localCoachData) : json.localCoachData;
        localClub = parsed.club || parsed.clubName || null;
      } catch (e) {}
    }

    const hasLocalCoachData = Boolean(json.localCoachData);
    const isCoach = hasLocalCoachData || (json.role || '').toLowerCase().includes('entrenador') || (json.selectedTier || '').toLowerCase() === 'local';
    const effectiveRole = isCoach ? 'Entrenador' : (json.role || 'Usuario');
    const effectiveClub = (isCoach && localClub) ? localClub : (json.selectedClub || json.selectedCountry || '');

    return {
      id: json.id,
      username: json.username,
      nombres: json.nombres || '',
      apellidos: json.apellidos || '',
      displayName: (json.nombres || json.apellidos) ? `${json.nombres || ''} ${json.apellidos || ''}`.trim() : json.username,
      role: effectiveRole,
      selectedClub: effectiveClub,
      localCoachClub: localClub,
      avatarUrl: json.avatarUrl || null,
      email: json.email || '',
      selectedTier: json.selectedTier || ''
    };
  };

  const getUserTierCategory = (u) => {
    if (!u) return 'other';
    const json = u.toPublicJSON ? u.toPublicJSON() : u;
    const tier = (json.selectedTier || json.tier || '').toLowerCase();
    const role = (json.role || '').toLowerCase();

    // 1. REGLA DE ARQUITECTURA: El rol de Plan Local PREVALECE SIEMPRE sobre Enterprise.
    // Si un usuario ha tenido o tiene plan Local, datos de entrenador local o rol de entrenador,
    // su clasificación en Mis Chats es prioritariamente 'local'.
    const isLocal = tier.includes('local') || role.includes('local') || role.includes('entrenador') || Boolean(json.localCoachData);
    if (isLocal) return 'local';

    // 2. Únicamente si no tiene ningún componente Local, se evalúa si es Enterprise.
    const isEnterprise = tier.includes('enterprise') || role.includes('enterprise') || role.includes('scout') || role.includes('gerente') || role.includes('director') || role.includes('presidente') || role.includes('ceo');
    if (isEnterprise) return 'enterprise';

    return 'other';
  };

  const isValidChatPair = (userA, userB) => {
    const catA = getUserTierCategory(userA);
    const catB = getUserTierCategory(userB);

    return (catA === 'local' && catB === 'enterprise') || (catA === 'enterprise' && catB === 'local');
  };

  // Middleware para verificar que el usuario tenga plan Local o Enterprise
  const checkChatsPlanAccess = async (req, res, next) => {
    try {
      if (!req.user || (!req.user.id && !req.user.username)) {
        return res.status(401).json({ error: 'Sesión no válida' });
      }

      let user = null;
      if (req.user.id) {
        user = await User.findByPk(req.user.id).catch(() => null);
      }
      if (!user && req.user.username) {
        user = await User.findOne({ where: { username: req.user.username } });
      }

      const tier = user ? (user.selectedTier || '').toLowerCase() : (req.user.selectedTier || '').toLowerCase();
      const role = user ? (user.role || '').toLowerCase() : (req.user.role || '').toLowerCase();

      const isLocal = tier.includes('local') || role.includes('local') || role.includes('entrenador local');
      const isEnterprise = tier.includes('enterprise') || role.includes('enterprise') || role.includes('scout');

      // Permitir acceso a todos los usuarios autenticados
      // if (!isLocal && !isEnterprise) { ... }

      // Asegurar que req.user.id apunte al ID correcto de la base de datos
      if (user) {
        req.user.id = user.id;
      }

      next();
    } catch (err) {
      console.error('❌ Error en checkChatsPlanAccess:', err);
      return res.status(500).json({ error: 'Error al verificar permisos del plan' });
    }
  };

  router.use(checkChatsPlanAccess);

  // 1. Obtener lista de contactos / chats activos del usuario
  router.get('/contacts', async (req, res) => {
    try {
      const currentUserId = req.user.id;

      // Obtener contactos explícitos guardados por el usuario
      const contactsEntries = await UserContact.findAll({
        where: { userId: currentUserId },
        include: [{ model: User, as: 'contactUser' }]
      });

      const explicitContactUserIds = contactsEntries.map(c => c.contactUserId);

      // Obtener también todos los IDs de usuarios con los que haya intercambiado mensajes
      const messages = await DirectMessage.findAll({
        where: {
          [Op.or]: [
            { senderId: currentUserId },
            { receiverId: currentUserId }
          ]
        },
        order: [['createdAt', 'DESC']]
      });

      const messageUserIds = new Set();
      messages.forEach(m => {
        if (m.senderId !== currentUserId) messageUserIds.add(m.senderId);
        if (m.receiverId !== currentUserId) messageUserIds.add(m.receiverId);
      });

      const allContactIds = Array.from(new Set([...explicitContactUserIds, ...messageUserIds]));

      if (allContactIds.length === 0) {
        return res.json({ success: true, contacts: [] });
      }

      const currentUser = await User.findByPk(currentUserId).catch(() => null);
      const usersList = await User.findAll({
        where: { id: { [Op.in]: allContactIds } }
      });

      const userMap = {};
      usersList.forEach(u => {
        if (currentUser && isValidChatPair(currentUser, u)) {
          userMap[u.id] = formatChatUser(u);
        }
      });

      // Para cada contacto, obtener el último mensaje y el conteo de no leídos
      const result = [];
      for (const contactId of allContactIds) {
        const contactUser = userMap[contactId];
        if (!contactUser) continue;

        // Último mensaje entre los dos
        const lastMsg = await DirectMessage.findOne({
          where: {
            [Op.or]: [
              { senderId: currentUserId, receiverId: contactId },
              { senderId: contactId, receiverId: currentUserId }
            ]
          },
          order: [['createdAt', 'DESC']]
        });

        // Mensajes no leídos enviados por el contacto hacia mí
        const unreadCount = await DirectMessage.count({
          where: {
            senderId: contactId,
            receiverId: currentUserId,
            isRead: false
          }
        });

        result.push({
          contact: contactUser,
          isExplicitContact: explicitContactUserIds.includes(contactId),
          lastMessage: lastMsg ? {
            id: lastMsg.id,
            content: lastMsg.content,
            senderId: lastMsg.senderId,
            createdAt: lastMsg.createdAt,
            isRead: lastMsg.isRead
          } : null,
          unreadCount,
          lastActivity: lastMsg ? lastMsg.createdAt : new Date(0)
        });
      }

      // Ordenar contactos por fecha del último mensaje o actividad más reciente
      result.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));

      return res.json({ success: true, contacts: result });
    } catch (err) {
      console.error('❌ Error en GET /api/chats/contacts:', err);
      return res.status(500).json({ error: 'Error al obtener contactos de chat' });
    }
  });

  // 2. Buscar usuarios registrados en la plataforma para iniciar chat (Filtrado para planes Local y Enterprise)
  router.get('/search-users', async (req, res) => {
    try {
      const currentUserId = req.user ? req.user.id : null;
      const { q } = req.query;

      const isPostgres = User.sequelize && User.sequelize.options.dialect === 'postgres';
      const likeOp = isPostgres ? Op.iLike : Op.like;

      const conditions = [];

      if (currentUserId && currentUserId !== 'undefined') {
        conditions.push({ id: { [Op.ne]: currentUserId } });
      }

      const currentUser = currentUserId ? await User.findByPk(currentUserId).catch(() => null) : null;
      const currentCat = getUserTierCategory(currentUser);

      if (currentCat === 'local') {
        // Usuario Local: SOLO puede buscar usuarios del plan Enterprise
        conditions.push({
          [Op.or]: [
            { selectedTier: { [likeOp]: '%enterprise%' } },
            { role: { [likeOp]: '%enterprise%' } },
            { role: { [likeOp]: '%scout%' } },
            { role: { [likeOp]: '%gerente%' } },
            { role: { [likeOp]: '%director%' } },
            { role: { [likeOp]: '%presidente%' } },
            { role: { [likeOp]: '%ceo%' } }
          ]
        });
      } else if (currentCat === 'enterprise') {
        // Usuario Enterprise: SOLO puede buscar usuarios del Plan Local (entrenadores)
        conditions.push({
          [Op.or]: [
            { selectedTier: { [likeOp]: '%local%' } },
            { role: { [likeOp]: '%local%' } },
            { role: { [likeOp]: '%entrenador%' } }
          ]
        });
      } else {
        return res.json({ success: true, users: [] });
      }

      if (q && q.trim()) {
        const term = `%${q.trim()}%`;
        conditions.push({
          [Op.or]: [
            { username: { [likeOp]: term } },
            { nombres: { [likeOp]: term } },
            { apellidos: { [likeOp]: term } },
            { role: { [likeOp]: term } },
            { selectedClub: { [likeOp]: term } },
            { email: { [likeOp]: term } }
          ]
        });
      }

      const whereClause = { [Op.and]: conditions };

      const users = await User.findAll({
        where: whereClause,
        limit: 100
      });

      const formatted = users.filter(u => isValidChatPair(currentUser, u)).map(formatChatUser).filter(Boolean);
      return res.json({ success: true, users: formatted });
    } catch (err) {
      console.error('❌ Error en GET /api/chats/search-users:', err);
      return res.status(500).json({ error: 'Error al buscar usuarios: ' + err.message });
    }
  });

  // 3. Guardar un usuario como contacto
  router.post('/contacts', async (req, res) => {
    try {
      const currentUserId = req.user.id;
      const { contactUserId, nickname } = req.body;

      if (!contactUserId) {
        return res.status(400).json({ error: 'Falta contactUserId' });
      }

      if (contactUserId === currentUserId) {
        return res.status(400).json({ error: 'No puedes agregarte a ti mismo como contacto' });
      }

      const currentUser = await User.findByPk(currentUserId).catch(() => null);
      const targetUser = await User.findByPk(contactUserId).catch(() => null);
      if (!targetUser) {
        return res.status(404).json({ error: 'Usuario objetivo no encontrado' });
      }

      if (!isValidChatPair(currentUser, targetUser)) {
        return res.status(403).json({
          error: 'La comunicación en Mis Chats es exclusivamente directa entre usuarios del Plan Local y el Plan Enterprise.'
        });
      }

      let [contact, created] = await UserContact.findOrCreate({
        where: { userId: currentUserId, contactUserId },
        defaults: { nickname: nickname || null }
      });

      if (!created && nickname !== undefined) {
        contact.nickname = nickname;
        await contact.save();
      }

      return res.json({
        success: true,
        contact: {
          id: contact.id,
          user: formatChatUser(targetUser),
          created
        }
      });
    } catch (err) {
      console.error('❌ Error en POST /api/chats/contacts:', err);
      return res.status(500).json({ error: 'Error al guardar contacto' });
    }
  });

  // 4. Eliminar un usuario de la lista de contactos explícita
  router.delete('/contacts/:contactUserId', async (req, res) => {
    try {
      const currentUserId = req.user.id;
      const { contactUserId } = req.params;

      await UserContact.destroy({
        where: { userId: currentUserId, contactUserId }
      });

      return res.json({ success: true, message: 'Contacto eliminado de la agenda' });
    } catch (err) {
      console.error('❌ Error en DELETE /api/chats/contacts/:contactUserId:', err);
      return res.status(500).json({ error: 'Error al eliminar contacto' });
    }
  });

  // 5. Obtener historial de mensajes con un contacto
  router.get('/messages/:contactUserId', async (req, res) => {
    try {
      const currentUserId = req.user.id;
      const { contactUserId } = req.params;

      const contactUser = await User.findByPk(contactUserId).catch(() => null);
      if (!contactUser) {
        return res.status(404).json({ error: 'Contacto no encontrado' });
      }

      const messages = await DirectMessage.findAll({
        where: {
          [Op.or]: [
            { senderId: currentUserId, receiverId: contactUserId },
            { senderId: contactUserId, receiverId: currentUserId }
          ]
        },
        order: [['createdAt', 'ASC']]
      });

      // Marcar automáticamente como leídos los mensajes del contacto hacia mí
      await DirectMessage.update(
        { isRead: true },
        {
          where: {
            senderId: contactUserId,
            receiverId: currentUserId,
            isRead: false
          }
        }
      );

      return res.json({
        success: true,
        contact: formatChatUser(contactUser),
        messages
      });
    } catch (err) {
      console.error('❌ Error en GET /api/chats/messages/:contactUserId:', err);
      return res.status(500).json({ error: 'Error al cargar mensajes' });
    }
  });

  // 6. Enviar mensaje a un contacto
  router.post('/messages', async (req, res) => {
    try {
      const currentUserId = req.user.id;
      const { receiverId, content } = req.body;

      if (!receiverId || !content || !content.trim()) {
        return res.status(400).json({ error: 'El destinatario y el mensaje son requeridos' });
      }

      const currentUser = await User.findByPk(currentUserId).catch(() => null);
      const receiver = await User.findByPk(receiverId).catch(() => null);
      if (!receiver) {
        return res.status(404).json({ error: 'El destinatario no existe' });
      }

      if (!isValidChatPair(currentUser, receiver)) {
        return res.status(403).json({
          error: 'La comunicación en Mis Chats solo está permitida entre usuarios de Plan Local y Plan Enterprise.'
        });
      }

      const message = await DirectMessage.create({
        senderId: currentUserId,
        receiverId,
        content: content.trim(),
        isRead: false
      });

      // Asegurar que el destinatario sea contacto implícito o se pueda listar
      await UserContact.findOrCreate({
        where: { userId: currentUserId, contactUserId: receiverId }
      });

      return res.json({
        success: true,
        message
      });
    } catch (err) {
      console.error('❌ Error en POST /api/chats/messages:', err);
      return res.status(500).json({ error: 'Error al enviar mensaje' });
    }
  });

  // 7. Marcar conversación como leída
  router.put('/messages/read/:contactUserId', async (req, res) => {
    try {
      const currentUserId = req.user.id;
      const { contactUserId } = req.params;

      await DirectMessage.update(
        { isRead: true },
        {
          where: {
            senderId: contactUserId,
            receiverId: currentUserId,
            isRead: false
          }
        }
      );

      return res.json({ success: true, message: 'Mensajes marcados como leídos' });
    } catch (err) {
      console.error('❌ Error en PUT /api/chats/messages/read/:contactUserId:', err);
      return res.status(500).json({ error: 'Error al actualizar mensajes' });
    }
  });

  // 8. Vaciar historial de chat con un contacto
  router.delete('/messages/:contactUserId', async (req, res) => {
    try {
      const currentUserId = req.user.id;
      const { contactUserId } = req.params;

      await DirectMessage.destroy({
        where: {
          [Op.or]: [
            { senderId: currentUserId, receiverId: contactUserId },
            { senderId: contactUserId, receiverId: currentUserId }
          ]
        }
      });

      return res.json({ success: true, message: 'Historial de conversación eliminado' });
    } catch (err) {
      console.error('❌ Error en DELETE /api/chats/messages/:contactUserId:', err);
      return res.status(500).json({ error: 'Error al vaciar chat' });
    }
  });

  return router;
};
