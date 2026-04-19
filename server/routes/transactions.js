const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const prisma = new PrismaClient();

// Get all transactions for family
router.get('/', auth, async (req, res) => {
  try {
    const { month, year, type, categoryId } = req.query;
    const where = { user: { familyId: req.user.familyId } };

    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      where.date = { gte: start, lte: end };
    }
    if (type) where.type = type;
    if (categoryId) where.categoryId = categoryId;

    const transactions = await prisma.transaction.findMany({
      where,
      include: { category: true, user: { select: { id: true, name: true } } },
      orderBy: { date: 'desc' },
    });
    res.json(transactions);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Add transaction
router.post('/', auth, async (req, res) => {
  try {
    const { amount, type, note, date, categoryId } = req.body;
    if (!amount || !type) return res.status(400).json({ error: 'Amount and type required' });

    const tx = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        type,
        note,
        date: date ? new Date(date) : new Date(),
        categoryId: categoryId || null,
        userId: req.user.userId,
      },
      include: { category: true, user: { select: { id: true, name: true } } },
    });
    res.json(tx);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Update transaction
router.put('/:id', auth, async (req, res) => {
  try {
    const { amount, type, note, date, categoryId } = req.body;
    const tx = await prisma.transaction.update({
      where: { id: req.params.id },
      data: { amount: parseFloat(amount), type, note, date: date ? new Date(date) : undefined, categoryId: categoryId || null },
      include: { category: true, user: { select: { id: true, name: true } } },
    });
    res.json(tx);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Delete transaction
router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.transaction.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
