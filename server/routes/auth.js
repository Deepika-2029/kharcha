const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const prisma = new PrismaClient();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, familyName } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);

    // Create family + user together
    const family = await prisma.family.create({
      data: { name: familyName || `${name}'s Family` },
    });

    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: 'admin', familyId: family.id },
    });

    // Create default categories
    const defaults = [
      { name: 'Roti & Sabzi', icon: '🛒', color: '#10b981', budgetLimit: 8000 },
      { name: 'Bijli & Paani', icon: '💡', color: '#f59e0b', budgetLimit: 3000 },
      { name: 'School Fees', icon: '📚', color: '#6366f1', budgetLimit: 5000 },
      { name: 'Dawai & Doctor', icon: '💊', color: '#ef4444', budgetLimit: 2000 },
      { name: 'Transport', icon: '🚗', color: '#3b82f6', budgetLimit: 3000 },
      { name: 'Entertainment', icon: '🎬', color: '#8b5cf6', budgetLimit: 2000 },
      { name: 'Other', icon: '📦', color: '#6b7280', budgetLimit: 5000 },
    ];
    for (const cat of defaults) {
      await prisma.category.create({ data: { ...cat, familyId: family.id } });
    }

    const token = jwt.sign({ userId: user.id, familyId: family.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, familyId: family.id } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email }, include: { family: true } });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id, familyId: user.familyId, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, familyId: user.familyId, family: user.family } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { family: true },
      select: { id: true, name: true, email: true, role: true, familyId: true, family: true },
    });
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
