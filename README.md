# JK MOTEL – Restaurant & Dining 🍽️

A full-stack restaurant management and online food ordering system built with **HTML/CSS/JavaScript** (frontend) and **Node.js + Express.js + MongoDB Atlas** (backend).

---

## 🗂️ Project Structure

```
JK Motel/
├── index.html              ← Main frontend page
├── CSS/                    ← Stylesheets
├── JS/
│   ├── api.js              ← Frontend API client (Fetch-based)
│   └── app.js              ← Main frontend logic
├── images/                 ← Food & UI images
├── api/
│   └── index.js            ← Vercel serverless entrypoint
├── vercel.json             ← Vercel deployment configuration
├── render.yaml             ← Render blueprint configuration
├── package.json            ← Root package.json for cloud deployments
├── .gitignore
│
└── backend/
    ├── config/
    │   └── db.js           ← MongoDB connection (Mongoose)
    ├── controllers/        ← Business logic (all Mongoose-based)
    ├── middleware/
    │   ├── authMiddleware.js
    │   └── errorMiddleware.js
    ├── models/             ← Mongoose schemas (User, Category, FoodItem, Cart, Order, Reservation)
    ├── routes/             ← Express routers
    ├── scripts/
    │   └── seed.js         ← Database seeder
    ├── .env                ← Environment variables (do NOT commit)
    ├── .env.example        ← Template for .env
    ├── server.js
    └── package.json
```

---

## 🚀 Cloud Deployment Guide

JK MOTEL is configured to deploy to either **Render** (recommended for persistent Node.js/Express servers) or **Vercel** (serverless).

### Option A: Deploy on Render (Recommended)

1. Push your repository to **GitHub** or **GitLab**.
2. Go to [render.com](https://render.com) and click **New +** → **Web Service**.
3. Connect your repository.
4. Set the following options:
   - **Name:** `jk-motel`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Under **Environment Variables**, add:
   - `MONGODB_URI`: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/jk_motel?retryWrites=true&w=majority`
   - `JWT_SECRET`: `your_secure_random_jwt_secret_key_here`
   - `NODE_ENV`: `production`
6. Click **Deploy Web Service**! Render will deploy your website with free automatic SSL (`https://jk-motel.onrender.com`).

---

### Option B: Deploy on Vercel

1. Push your repository to **GitHub**.
2. Go to [vercel.com](https://vercel.com) and click **Add New** → **Project**.
3. Import your repository.
4. Leave **Framework Preset** as **Other**.
5. Under **Environment Variables**, add:
   - `MONGODB_URI`: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/jk_motel?retryWrites=true&w=majority`
   - `JWT_SECRET`: `your_secure_random_jwt_secret_key_here`
   - `NODE_ENV`: `production`
6. Click **Deploy**! Vercel will automatically serve static frontend files on its global CDN and route `/api/*` to the Express backend.

> **MongoDB Atlas Network Access Tip:** In MongoDB Atlas, go to **Network Access** and ensure `0.0.0.0/0` (Allow Access from Anywhere) is whitelisted so Render or Vercel can connect.

---

## 💻 Local Development Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure `.env`
In `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/jk_motel?retryWrites=true&w=majority
JWT_SECRET=jk_motel_jwt_secret_key_restaurant_2026_9876543210
JWT_EXPIRES_IN=7d
```

### 3. Seed sample data
```bash
npm run seed
```

### 4. Start local server
```bash
npm start
```
Open **http://localhost:5000** in your browser.

---

## 🔑 Test Accounts
- **Admin:** `admin@jkmotel.com` / `Admin@123`
- **Customer:** `customer@jkmotel.com` / `Customer@123`
