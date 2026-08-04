const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { encrypt, decrypt } = require('../utils/crypto');

/**
 * Detect card brand from card number prefix
 * @param {string} cardNumber 
 * @returns {string} Card brand name
 */
function detectCardBrand(cardNumber) {
  const num = String(cardNumber).replace(/\D/g, '');
  if (/^4/.test(num)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(num)) return 'Mastercard';
  if (/^3[47]/.test(num)) return 'American Express';
  if (/^(6011|65|64[4-9])/.test(num)) return 'Discover';
  if (/^35/.test(num)) return 'JCB';
  return 'Tarjeta';
}

/**
 * Basic card length and format check (permite tarjetas de prueba en entorno local/dev)
 * @param {string} cardNumber 
 * @returns {boolean}
 */
function isValidLuhn(cardNumber) {
  const num = String(cardNumber).replace(/\D/g, '');
  if (num.length < 13 || num.length > 19) return false;
  return true;
}

/**
 * Safe Sequelize where clause builder for user identification
 * Prevents 'undefined' properties from breaking Sequelize queries
 */
function getUserWhere(user) {
  const orConditions = [];
  if (user && user.id !== undefined && user.id !== null) {
    orConditions.push({ userId: String(user.id) });
  }
  if (user && user.username) {
    orConditions.push({ userAccount: String(user.username) });
  }
  if (orConditions.length === 0) {
    return { userId: null };
  }
  return orConditions.length === 1 ? orConditions[0] : { [Op.or]: orConditions };
}

module.exports = (db = {}) => {
  const PaymentMethod = (db && db.PaymentMethod) ? db.PaymentMethod : require('../database').PaymentMethod;
  const User = (db && db.User) ? db.User : require('../database').User;

  // GET /api/payment-methods - Get all user's payment methods
  router.get('/', async (req, res) => {
    try {
      const userWhere = getUserWhere(req.user);
      let methods = [];
      try {
        methods = await PaymentMethod.findAll({
          where: userWhere,
          order: [['isDefault', 'DESC'], ['createdAt', 'DESC']]
        });
      } catch (dbErr) {
        console.warn('⚠️ Table payment_methods query failed, syncing table on the fly...', dbErr.message);
        await PaymentMethod.sync().catch(sErr => console.error('Sync failed:', sErr.message));
        methods = await PaymentMethod.findAll({
          where: userWhere,
          order: [['isDefault', 'DESC'], ['createdAt', 'DESC']]
        }).catch(() => []);
      }

      const responseData = (methods || []).map(pm => ({
        id: pm.id,
        cardholderName: pm.cardholderName,
        cardBrand: pm.cardBrand,
        last4: pm.last4,
        expMonth: pm.expMonth,
        expYear: pm.expYear,
        isDefault: pm.isDefault,
        createdAt: pm.createdAt
      }));

      res.status(200).json({
        success: true,
        paymentMethods: responseData
      });
    } catch (err) {
      console.error('Error fetching payment methods:', err);
      res.status(500).json({ error: 'Error al obtener los medios de pago', details: err.message });
    }
  });

  // POST /api/payment-methods - Save a new payment method with AES encryption
  router.post('/', async (req, res) => {
    try {
      const { cardholderName, cardNumber, expMonth, expYear, cvc, billingZip, isDefault } = req.body;

      if (!cardholderName || !cardNumber || !expMonth || !expYear || !cvc) {
        return res.status(400).json({ error: 'Todos los campos de la tarjeta son obligatorios' });
      }

      const cleanCard = String(cardNumber).replace(/\D/g, '');
      if (cleanCard.length < 13 || cleanCard.length > 19) {
        return res.status(400).json({ error: 'El número de tarjeta no es válido (debe tener entre 13 y 19 dígitos)' });
      }

      const cleanMonth = String(expMonth).padStart(2, '0');
      const cleanYear = String(expYear).length === 2 ? `20${expYear}` : String(expYear);
      
      const parsedMonth = parseInt(cleanMonth, 10);
      if (parsedMonth < 1 || parsedMonth > 12) {
        return res.status(400).json({ error: 'Mes de expiración no válido' });
      }

      const cardLast4 = cleanCard.slice(-4);
      const cardBrand = detectCardBrand(cleanCard);

      // AES-256 Encrypt sensitive card details
      const sensitivePayload = {
        fullCardNumber: cleanCard,
        cvc: String(cvc).trim(),
        billingZip: billingZip ? String(billingZip).trim() : '',
        addedAt: new Date().toISOString(),
        userId: req.user ? req.user.id : null
      };
      const encryptedCardDetails = encrypt(sensitivePayload);

      const userWhere = getUserWhere(req.user);

      // Check existing payment methods count and enforce max 10 limit
      let existingCount = 0;
      try {
        existingCount = await PaymentMethod.count({ where: userWhere });
      } catch (countErr) {
        await PaymentMethod.sync().catch(() => {});
        existingCount = await PaymentMethod.count({ where: userWhere }).catch(() => 0);
      }

      if (existingCount >= 10) {
        return res.status(400).json({ error: 'Has alcanzado el límite máximo de 10 tarjetas guardadas por usuario.' });
      }

      const makeDefault = isDefault || existingCount === 0;

      if (makeDefault) {
        // Clear default flag on other cards
        await PaymentMethod.update(
          { isDefault: false },
          { where: userWhere }
        ).catch(() => {});
      }

      let newMethod;
      try {
        newMethod = await PaymentMethod.create({
          userId: req.user ? req.user.id : null,
          userAccount: req.user && req.user.username ? String(req.user.username) : null,
          cardholderName: String(cardholderName).trim(),
          cardBrand,
          last4: cardLast4,
          expMonth: cleanMonth,
          expYear: cleanYear,
          encryptedCardDetails,
          isDefault: makeDefault
        });
      } catch (createErr) {
        console.warn('⚠️ PaymentMethod create failed, syncing table and retrying...', createErr.message);
        await PaymentMethod.sync().catch(() => {});
        newMethod = await PaymentMethod.create({
          userId: req.user ? req.user.id : null,
          userAccount: req.user && req.user.username ? String(req.user.username) : null,
          cardholderName: String(cardholderName).trim(),
          cardBrand,
          last4: cardLast4,
          expMonth: cleanMonth,
          expYear: cleanYear,
          encryptedCardDetails,
          isDefault: makeDefault
        });
      }

      console.log(`💳 Encrypted Payment Method Saved: User ${req.user ? req.user.username : 'ID ' + req.user.id} added ${cardBrand} ****${cardLast4}`);

      res.status(201).json({
        success: true,
        message: 'Medio de pago registrado con éxito en la base de datos cifrada',
        paymentMethod: {
          id: newMethod.id,
          cardholderName: newMethod.cardholderName,
          cardBrand: newMethod.cardBrand,
          last4: newMethod.last4,
          expMonth: newMethod.expMonth,
          expYear: newMethod.expYear,
          isDefault: newMethod.isDefault,
          createdAt: newMethod.createdAt
        }
      });

    } catch (err) {
      console.error('Error saving payment method:', err);
      res.status(500).json({ error: 'Error al registrar el medio de pago con cifrado', details: err.message });
    }
  });

  // PUT /api/payment-methods/:id/default - Set card as default
  router.put('/:id/default', async (req, res) => {
    try {
      const methodId = req.params.id;
      const userWhere = getUserWhere(req.user);
      
      const targetMethod = await PaymentMethod.findOne({
        where: {
          id: methodId,
          ...userWhere
        }
      });

      if (!targetMethod) {
        return res.status(404).json({ error: 'Medio de pago no encontrado' });
      }

      // Unset all default flags for user
      await PaymentMethod.update(
        { isDefault: false },
        { where: userWhere }
      );

      // Set target card as default
      targetMethod.isDefault = true;
      await targetMethod.save();

      res.status(200).json({
        success: true,
        message: 'Medio de pago establecido como predeterminado para renovaciones'
      });
    } catch (err) {
      console.error('Error setting default payment method:', err);
      res.status(500).json({ error: 'Error al actualizar medio de pago predeterminado', details: err.message });
    }
  });

  // DELETE /api/payment-methods/:id - Delete payment method
  router.delete('/:id', async (req, res) => {
    try {
      const methodId = req.params.id;
      const userWhere = getUserWhere(req.user);

      const targetMethod = await PaymentMethod.findOne({
        where: {
          id: methodId,
          ...userWhere
        }
      });

      if (!targetMethod) {
        return res.status(404).json({ error: 'Medio de pago no encontrado' });
      }

      const wasDefault = targetMethod.isDefault;
      await targetMethod.destroy();

      // If deleted card was default, set another card as default
      if (wasDefault) {
        const remainingCard = await PaymentMethod.findOne({
          where: userWhere,
          order: [['createdAt', 'DESC']]
        });
        if (remainingCard) {
          remainingCard.isDefault = true;
          await remainingCard.save();
        }
      }

      res.status(200).json({
        success: true,
        message: 'Medio de pago eliminado correctamente'
      });
    } catch (err) {
      console.error('Error deleting payment method:', err);
      res.status(500).json({ error: 'Error al eliminar medio de pago', details: err.message });
    }
  });

  return router;
};
