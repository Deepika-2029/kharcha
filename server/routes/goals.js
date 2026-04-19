const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const prisma = new PrismaClient();

router.get('/', auth, async (req, res) => {
  try {
    const goals = await prisma.goal.findMany({ where: { familyId: req.user.familyId }, orderBy: { createdAt: 'desc' } });
    res.json(goals);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { title, targetAmount, savedAmount, deadline } = req.body;
    const goal = await prisma.goal.create({
      data: { title, targetAmount: parseFloat(targetAmount), savedAmount: parseFloat(savedAmount) || 0, deadline: deadline ? new Date(deadline) : null, familyId: req.user.familyId },
    });
    res.json(goal);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { title, targetAmount, savedAmount, deadline } = req.body;
    const goal = await prisma.goal.update({
      where: { id: req.params.id },
      data: { title, targetAmount: parseFloat(targetAmount), savedAmount: parseFloat(savedAmount), deadline: deadline ? new Date(deadline) : null },
    });
    res.json(goal);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.goal.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
