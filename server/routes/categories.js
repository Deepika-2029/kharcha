const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const prisma = new PrismaClient();

router.get('/', auth, async (req, res) => {
  try {
    const cats = await prisma.category.findMany({ where: { familyId: req.user.familyId } });
    res.json(cats);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { name, icon, color, budgetLimit } = req.body;
    const cat = await prisma.category.create({
      data: { name, icon: icon || '📦', color: color || '#6b7280', budgetLimit: parseFloat(budgetLimit) || 0, familyId: req.user.familyId },
    });
    res.json(cat);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { name, icon, color, budgetLimit } = req.body;
    const cat = await prisma.category.update({
      where: { id: req.params.id },
      data: { name, icon, color, budgetLimit: parseFloat(budgetLimit) },
    });
    res.json(cat);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
