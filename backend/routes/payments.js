const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');

module.exports = ({ Payment, User }) => {
  // POST /api/payments/checkout
  router.post('/checkout', async (req, res) => {
    try {
      const { tier, cardholderName, cardNumber, amount } = req.body;

      if (!tier || !cardholderName || !cardNumber || amount === undefined) {
        return res.status(400).json({ error: 'Todos los campos del pago son requeridos' });
      }

      // 1. Get last 4 digits of card safely
      const cleanCard = String(cardNumber).replace(/\s/g, '');
      if (cleanCard.length < 13 || cleanCard.length > 19) {
        return res.status(400).json({ error: 'Número de tarjeta no válido' });
      }
      const cardLast4 = cleanCard.slice(-4);

      // 2. Generate premium transaction ID
      const transactionId = 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase();

      // 3. Create the payment record associated with the user
      const payment = await Payment.create({
        transactionId,
        amount: parseFloat(amount),
        currency: 'USD',
        tier,
        cardholderName,
        cardLast4,
        status: 'success',
        userId: req.user.id,
        userAccount: req.user.username
      });

      // 4. Update the user plan tier in the database
      const user = await User.findByPk(req.user.id);
      if (user) {
        const wasLocal = (user.selectedTier || '').toLowerCase() === 'local' || (user.role || '').toLowerCase() === 'entrenador local' || (user.role || '').toLowerCase() === 'local';
        const hasStandardTeam = !!user.selectedClub && user.selectedClub !== 'Club Local' && !!user.selectedCountry && user.selectedCountry !== 'Local';

        const TIER_RANKS = { 'Gratis': 0, 'Pro': 1, 'Plus': 2, 'Local': 3, 'Enterprise': 4 };
        const currentMaxRank = TIER_RANKS[user.maxPaidTierInCycle] || 0;
        const newRank = TIER_RANKS[tier] || 0;
        const highestTier = newRank >= currentMaxRank ? tier : user.maxPaidTierInCycle;

        const now = new Date();
        const cycleEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const updateData = {
          selectedTier: tier,
          maxPaidTierInCycle: highestTier,
          billingCycleStart: user.billingCycleStart && now < new Date(user.billingCycleEnd || 0) ? user.billingCycleStart : now,
          billingCycleEnd: cycleEnd,
          autoRenew: true
        };
        if (req.body.role) {
          updateData.role = req.body.role;
        }
        if (wasLocal && tier !== 'Local' && !hasStandardTeam) {
          updateData.onboardingComplete = false;
        }
        await user.update(updateData);
      }

      console.log(`💳 Premium Payment Logged: User ${req.user.username} upgraded to ${tier}. Txn ID: ${transactionId}`);

      res.status(201).json({
        success: true,
        message: 'Pago procesado y registrado con éxito',
        transaction: {
          transactionId: payment.transactionId,
          amount: payment.amount,
          tier: payment.tier,
          cardholderName: payment.cardholderName,
          cardLast4: payment.cardLast4,
          createdAt: payment.createdAt
        },
        user: user ? user.toPublicJSON() : null
      });

    } catch (err) {
      console.error('Payment checkout error:', err);
      res.status(500).json({ error: 'Error al procesar el pago seguro', details: err.message });
    }
  });

  // GET /api/payments/history
  router.get('/history', async (req, res) => {
    try {
      const payments = await Payment.findAll({
        where: {
          [Op.or]: [
            { userId: req.user.id },
            { userAccount: req.user.username }
          ]
        },
        order: [['createdAt', 'DESC']]
      });

      res.status(200).json({
        success: true,
        payments: payments.map(p => ({
          transactionId: p.transactionId,
          amount: p.amount,
          currency: p.currency,
          tier: p.tier,
          cardholderName: p.cardholderName,
          cardLast4: p.cardLast4,
          status: p.status,
          createdAt: p.createdAt
        }))
      });
    } catch (err) {
      console.error('Payment history fetch error:', err);
      res.status(500).json({ error: 'Error al obtener el historial de pagos', details: err.message });
    }
  });

  return router;
};
