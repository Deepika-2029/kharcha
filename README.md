# 💰 GharKharcha — Family Budget Tracker

React + Node.js se bana ek complete family budget tracking app.

---

## Features

- ✅ Family members ke saath shared budget
- ✅ Income & Expense tracking
- ✅ Category-wise budget limits
- ✅ Dashboard with charts (Bar + Pie)
- ✅ 6-month spending trend
- ✅ Savings Goals tracker
- ✅ Monthly PDF reports (extend kar sakte ho)
- ✅ PWA — phone pe install ho sakta hai
- ✅ Search, filter, edit, delete transactions

---

## Tech Stack

| Layer      | Technology              |
|------------|------------------------|
| Frontend   | React 18 + React Router |
| Styling    | Custom CSS             |
| Charts     | Recharts               |
| Backend    | Node.js + Express      |
| Database   | PostgreSQL + Prisma ORM |
| Auth       | JWT + bcryptjs         |
| Deploy     | Vercel (client) + Railway (server) |

---

## Setup karo (Step by Step)

### Step 1: PostgreSQL install karo

**Windows:** https://www.postgresql.org/download/windows/  
**Mac:** `brew install postgresql`  
**Linux:** `sudo apt install postgresql`

PostgreSQL mein ek database banao:
```sql
CREATE DATABASE gharkharcha;
```

### Step 2: Project clone/download karo

```bash
git clone <your-repo-url>
cd gharKharcha
```

### Step 3: Server setup

```bash
cd server
npm install
```

`.env` file banao (`.env.example` copy karo):
```bash
cp .env.example .env
```

`.env` mein apni database URL daalo:
```
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/gharkharcha"
JWT_SECRET="koi-bhi-random-secret-string-yahan"
PORT=5000
```

Database tables banao + demo data:
```bash
npx prisma db push
node prisma/seed.js
```

### Step 4: Client setup

```bash
cd ../client
npm install
```

### Step 5: Dono start karo

**Terminal 1 — Server:**
```bash
cd server
npm run dev
```

**Terminal 2 — Client:**
```bash
cd client
npm start
```

Browser mein kholo: **http://localhost:3000**

---

## Demo Login

```
Email:    demo@gharkharcha.com
Password: demo1234
```

---

## Project Structure

```
gharKharcha/
├── client/                     ← React Frontend
│   └── src/
│       ├── App.js              ← Router setup
│       ├── index.css           ← Global styles
│       ├── api/index.js        ← Axios instance
│       ├── context/AuthContext.js
│       ├── components/
│       │   ├── Layout.js       ← Sidebar + nav
│       │   └── AddTransactionModal.js
│       └── pages/
│           ├── Login.js
│           ├── Register.js
│           ├── Dashboard.js    ← Charts + summary
│           ├── Transactions.js ← Full list + filters
│           ├── Categories.js
│           ├── Goals.js
│           └── Family.js
│
└── server/                     ← Node.js Backend
    ├── index.js                ← Express server
    ├── middleware/auth.js      ← JWT verify
    ├── routes/
    │   ├── auth.js             ← Login/Register
    │   ├── transactions.js     ← CRUD
    │   ├── dashboard.js        ← Summary + charts
    │   ├── categories.js
    │   ├── goals.js
    │   └── family.js
    └── prisma/
        ├── schema.prisma       ← DB models
        └── seed.js             ← Demo data
```

---

## Free Deploy kaise karein

### Backend — Railway.app

1. https://railway.app par account banao
2. "New Project" → "Deploy from GitHub"
3. `server` folder select karo
4. Environment variables add karo (DATABASE_URL, JWT_SECRET)
5. Railway khud PostgreSQL bhi deta hai free mein!

### Frontend — Vercel

1. https://vercel.com par account banao
2. GitHub repo connect karo
3. Root directory: `client`
4. Build command: `npm run build`
5. `.env` mein `REACT_APP_API_URL=https://your-railway-url.up.railway.app` add karo

---

## Aage kya add kar sakte ho

- [ ] WhatsApp alerts (Twilio API)
- [ ] UPI transaction import (SMS parse)
- [ ] AI spending tips (Claude API)
- [ ] Monthly PDF export
- [ ] Excel/CSV import
- [ ] Dark mode
- [ ] Hindi language toggle

---

## License

MIT — free hai, apna samjho!
