const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');

const prisma = new PrismaClient();

// Get family members
router.get('/members', auth, async (req, res) => {
  try {
    const members = await prisma.user.findMany({
      where: { familyId: req.user.familyId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    res.json(members);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Add family member
router.post('/members', auth, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: 'member', familyId: req.user.familyId },
      select: { id: true, name: true, email: true, role: true },
    });
    res.json(user);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Update family budget
router.put('/budget', auth, async (req, res) => {
  try {
    const { monthlyBudget } = req.body;
    const family = await prisma.family.update({
      where: { id: req.user.familyId },
      data: { monthlyBudget: parseFloat(monthlyBudget) },
    });
    res.json(family);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
