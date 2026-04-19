const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Create a demo family
  const family = await prisma.family.create({
    data: {
      name: 'Sharma Family',
      monthlyBudget: 50000,
    },
  });

  // Create admin user
  const hashedPassword = await bcrypt.hash('demo1234', 10);
  const user = await prisma.user.create({
    data: {
      name: 'Rahul Sharma',
      email: 'demo@gharkharcha.com',
      password: hashedPassword,
      role: 'admin',
      familyId: family.id,
    },
  });

  // Create default categories
  const categories = [
    { name: 'Roti & Sabzi', icon: '🛒', color: '#10b981', budgetLimit: 8000 },
    { name: 'Bijli & Paani', icon: '💡', color: '#f59e0b', budgetLimit: 3000 },
    { name: 'School Fees', icon: '📚', color: '#6366f1', budgetLimit: 5000 },
    { name: 'Dawai & Doctor', icon: '💊', color: '#ef4444', budgetLimit: 2000 },
    { name: 'Transport', icon: '🚗', color: '#3b82f6', budgetLimit: 3000 },
    { name: 'Entertainment', icon: '🎬', color: '#8b5cf6', budgetLimit: 2000 },
    { name: 'Kapda', icon: '👕', color: '#ec4899', budgetLimit: 3000 },
    { name: 'Other', icon: '📦', color: '#6b7280', budgetLimit: 5000 },
  ];

  for (const cat of categories) {
    await prisma.category.create({
      data: { ...cat, familyId: family.id },
    });
  }

  // Get categories back
  const createdCats = await prisma.category.findMany({ where: { familyId: family.id } });

  // Create sample transactions for current month
  const now = new Date();
  const sampleTx = [
    { amount: 45000, type: 'income', note: 'Monthly salary', date: new Date(now.getFullYear(), now.getMonth(), 1) },
    { amount: 6500, type: 'expense', note: 'Big Bazaar', categoryId: createdCats[0].id, date: new Date(now.getFullYear(), now.getMonth(), 3) },
    { amount: 1800, type: 'expense', note: 'Electricity bill', categoryId: createdCats[1].id, date: new Date(now.getFullYear(), now.getMonth(), 5) },
    { amount: 4500, type: 'expense', note: 'School fees April', categoryId: createdCats[2].id, date: new Date(now.getFullYear(), now.getMonth(), 7) },
    { amount: 850, type: 'expense', note: 'Medicine', categoryId: createdCats[3].id, date: new Date(now.getFullYear(), now.getMonth(), 10) },
    { amount: 2200, type: 'expense', note: 'Petrol', categoryId: createdCats[4].id, date: new Date(now.getFullYear(), now.getMonth(), 12) },
    { amount: 1500, type: 'expense', note: 'Movie + dinner', categoryId: createdCats[5].id, date: new Date(now.getFullYear(), now.getMonth(), 15) },
    { amount: 3200, type: 'expense', note: 'Grocery + veggies', categoryId: createdCats[0].id, date: new Date(now.getFullYear(), now.getMonth(), 18) },
  ];

  for (const tx of sampleTx) {
    await prisma.transaction.create({
      data: { ...tx, userId: user.id },
    });
  }

  // Create a savings goal
  await prisma.goal.create({
    data: {
      title: 'New Phone',
      targetAmount: 25000,
      savedAmount: 8000,
      deadline: new Date(now.getFullYear(), now.getMonth() + 4, 1),
      familyId: family.id,
    },
  });

  console.log('✅ Seed data created!');
  console.log('📧 Login: demo@gharkharcha.com | Password: demo1234');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
