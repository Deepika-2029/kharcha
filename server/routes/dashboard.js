const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const prisma = new PrismaClient();

router.get('/summary', auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    const m = parseInt(month) || new Date().getMonth() + 1;
    const y = parseInt(year) || new Date().getFullYear();

    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59);

    const transactions = await prisma.transaction.findMany({
      where: { user: { familyId: req.user.familyId }, date: { gte: start, lte: end } },
      include: { category: true },
    });

    const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const balance = income - expense;

    // By category
    const byCategory = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      const name = t.category?.name || 'Other';
      const color = t.category?.color || '#6b7280';
      if (!byCategory[name]) byCategory[name] = { name, amount: 0, color, budgetLimit: t.category?.budgetLimit || 0 };
      byCategory[name].amount += t.amount;
    });

    // Last 6 months trend
    const trend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(y, m - 1 - i, 1);
      const dEnd = new Date(y, m - i, 0, 23, 59, 59);
      const txs = await prisma.transaction.findMany({
        where: { user: { familyId: req.user.familyId }, date: { gte: d, lte: dEnd } },
      });
      trend.push({
        month: d.toLocaleString('hi-IN', { month: 'short' }),
        income: txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        expense: txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      });
    }

    const family = await prisma.family.findUnique({ where: { id: req.user.familyId } });

    res.json({
      income,
      expense,
      balance,
      monthlyBudget: family?.monthlyBudget || 0,
      byCategory: Object.values(byCategory),
      trend,
      recentTransactions: transactions.slice(0, 5),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
