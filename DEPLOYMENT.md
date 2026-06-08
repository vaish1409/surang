# 🚀 SURANG — Complete Deployment Guide
## From Zero to Live Website (Step by Step)

---

## PART 1 — ACCOUNTS TO CREATE (All Free)

Before writing any code, create accounts on these 5 platforms:

### 1. GitHub → github.com
- Create account → Verify email
- This is where your code lives and what you'll link on LinkedIn

### 2. MongoDB Atlas → mongodb.com/atlas
- Sign up free → Create Organisation → Create Project
- Build a FREE M0 cluster (512MB — enough for thousands of artworks)
- Choose region: **Mumbai (ap-south-1)** for best India performance
- **Get connection string:** Cluster → Connect → Drivers → Copy the URI
  ```
  mongodb+srv://username:password@cluster.mongodb.net/surang
  ```

### 3. Cloudinary → cloudinary.com
- Sign up free (25GB storage, 25GB bandwidth/month — free)
- Dashboard → Copy: Cloud Name, API Key, API Secret

### 4. Razorpay → razorpay.com
- Sign up → Dashboard → Settings → API Keys
- Generate Test Keys first (no real money)
- Copy: Key ID and Key Secret
- **Test UPI:** Use any UPI ID in test mode — payments are simulated

### 5. Vercel → vercel.com (connect with GitHub account)
- Sign up using GitHub (easier, auto-deploys on push)

---

## PART 2 — LOCAL SETUP

### Step 1: Install Required Tools

Download and install these on your laptop:

| Tool | Download | Check |
|------|----------|-------|
| **Node.js v18+** | nodejs.org | `node -v` |
| **Git** | git-scm.com | `git --version` |
| **VS Code** | code.visualstudio.com | — |

VS Code Extensions to install:
- ES7+ React Snippets
- Tailwind CSS IntelliSense
- ESLint
- Prettier

### Step 2: Push Project to GitHub

```bash
# Navigate to your surang folder
cd surang

# Initialize git (if not already)
git init
git add .
git commit -m "feat: initial SURANG website commit"

# Create repo on GitHub → github.com/new
# Name it: surang  |  Public  |  No README (we have one)
# Then connect and push:
git remote add origin https://github.com/YOUR_USERNAME/surang.git
git branch -M main
git push -u origin main
```

✅ Your code is now on GitHub!

### Step 3: Set Up Backend Environment

```bash
cd server
cp .env.example .env
```

Open `server/.env` in VS Code and fill in every value:

```env
PORT=5000
MONGO_URI=mongodb+srv://youruser:yourpass@cluster.mongodb.net/surang
JWT_SECRET=surang_make_this_very_long_random_string_123456
CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloud_name_from_dashboard
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz

RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 4: Run Backend Locally

```bash
cd server
npm install
npm run dev
```

You should see:
```
MongoDB connected ✓
SURANG server running on port 5000 ✓
```

Test it: Open browser → `http://localhost:5000`
You should see: `{"message":"SURANG API v1.0 — Indian Art Marketplace"}`

### Step 5: Set Up Frontend Environment

```bash
cd client
npm install
```

Create file `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
```

### Step 6: Run Frontend Locally

```bash
cd client
npm run dev
```

Open: `http://localhost:5173` — Your SURANG website should be live locally! 🎉

---

## PART 3 — CREATE ADMIN ACCOUNT

The admin account is created **directly in MongoDB** (never through the website):

### Option A: Via MongoDB Atlas UI
1. Go to Atlas → Browse Collections → `surang` database → `users` collection
2. Click **Insert Document**
3. Paste this (replace password hash):
```json
{
  "name": "SURANG Admin",
  "email": "admin@surang.in",
  "password": "$2a$12$Pf3lzBpBSSHWoNSGhvxjvOk8GTU7h8z7zH0rJq5mj3K3p7X2dVGAm",
  "role": "admin",
  "isVerified": true,
  "isBlocked": false,
  "createdAt": { "$date": "2025-01-01T00:00:00Z" }
}
```

> ⚠️ The hash above is for password: `Admin@SURANG123` — Change it after first login!

### Option B: Via Node.js Script (Recommended)
```bash
cd server
node -e "
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const admin = await User.create({
    name: 'SURANG Admin',
    email: 'admin@surang.in',
    password: 'YourStrongPassword123',
    role: 'admin',
    isVerified: true
  });
  console.log('Admin created:', admin.email);
  process.exit(0);
});
"
```

Admin login URL: `/admin/login` — **Never link this anywhere on the website!**

---

## PART 4 — DEPLOY BACKEND TO RENDER.COM (Free)

Render hosts Node.js apps for free. Your backend API will live here.

### Step 1: Go to render.com → Sign in with GitHub

### Step 2: New → Web Service → Connect your GitHub repo

### Step 3: Configure:
```
Name:           surang-api
Region:         Singapore (closest to India)
Branch:         main
Root Directory: server
Build Command:  npm install
Start Command:  node server.js
```

### Step 4: Add Environment Variables
Click **Environment** → Add all your `.env` variables one by one:

```
PORT                   = 5000
MONGO_URI              = mongodb+srv://...
JWT_SECRET             = your_long_secret
CLIENT_URL             = https://surang.vercel.app  ← (your Vercel URL, update after Step 5)
CLOUDINARY_CLOUD_NAME  = ...
CLOUDINARY_API_KEY     = ...
CLOUDINARY_API_SECRET  = ...
RAZORPAY_KEY_ID        = ...
RAZORPAY_KEY_SECRET    = ...
```

### Step 5: Click "Create Web Service"

Wait 3-5 minutes for deployment. Your backend URL will be:
```
https://surang-api.onrender.com
```

Test it in browser: `https://surang-api.onrender.com` → Should show the API message ✅

> ⚠️ Free tier "spins down" after 15 min inactivity. First request = 30 sec delay.
> Upgrade to Starter ($7/mo) to keep it always-on for real users.

---

## PART 5 — DEPLOY FRONTEND TO VERCEL (Free)

### Step 1: Go to vercel.com → New Project

### Step 2: Import your GitHub `surang` repository

### Step 3: Configure:
```
Framework Preset:  Vite
Root Directory:    client
Build Command:     npm run build
Output Directory:  dist
```

### Step 4: Add Environment Variables:
```
VITE_API_URL           = https://surang-api.onrender.com/api
VITE_RAZORPAY_KEY_ID   = rzp_test_xxxxxxxxxx
```

### Step 5: Click "Deploy"

Wait 2 minutes. Your live URL will be:
```
https://surang.vercel.app
```

### Step 6: Go back to Render → Update `CLIENT_URL`
In Render Environment Variables, update:
```
CLIENT_URL = https://surang.vercel.app
```
Then click **Manual Deploy** to redeploy backend.

---

## PART 6 — TEST YOUR LIVE WEBSITE

Open `https://surang.vercel.app` and test each flow:

### ✅ Checklist — Test Everything

**Landing Page:**
- [ ] Page loads with mandala animation
- [ ] Category cards visible
- [ ] "Explore Art" button works
- [ ] "Sell Your Art" button goes to register

**Buyer Flow:**
- [ ] Register as buyer → redirected to Explore
- [ ] Browse artworks with filters
- [ ] Click artwork → see detail page
- [ ] Add to cart → cart icon updates
- [ ] Checkout → enter address → Razorpay opens
- [ ] Complete test payment → Order Success page

**Artist Flow:**
- [ ] Register as artist → fill bio + specialties
- [ ] Dashboard visible with stats
- [ ] Upload artwork → form works → image uploads to Cloudinary
- [ ] Artwork appears in Explore page
- [ ] View incoming orders → update status

**Admin Flow:**
- [ ] Go to `/admin/login` → sign in with admin email
- [ ] View stats (users, artworks, orders, revenue)
- [ ] Click Users tab → verify an artist
- [ ] Click Artworks tab → feature/remove artwork
- [ ] Click Orders tab → see all orders

---

## PART 7 — GO LIVE WITH REAL PAYMENTS

When you're ready for real money (not test mode):

1. **Razorpay:** Dashboard → Settings → API Keys → Generate **Live Keys**
2. Update in Vercel env: `VITE_RAZORPAY_KEY_ID = rzp_live_xxxxxxxxxx`
3. Update in Render env: `RAZORPAY_KEY_ID = rzp_live_xxxxxxxxxx`, `RAZORPAY_KEY_SECRET = ...`
4. Redeploy both

---

## PART 8 — ADD TO LINKEDIN PORTFOLIO

1. **GitHub:** Make sure your README.md has screenshots
2. **LinkedIn → Profile → Add Profile Section → Projects:**
   - Project Name: SURANG — Indian Art Marketplace
   - URL: `https://surang.vercel.app`
   - Description: "Full-stack Indian art marketplace built with React, Node.js, MongoDB and Razorpay. Artists across India can upload and sell their art directly to buyers — no middlemen. Features include JWT authentication, Cloudinary image uploads, animated UI with Indian cultural design, and a hidden admin panel."

3. **LinkedIn Post (copy-paste this):**
```
🎨 Just launched SURANG — India's direct art marketplace!

The problem: Local artists (Madhubani painters, potters, weavers) often lose credit and income to middlemen.

The solution: SURANG lets artists upload their work, set their own price, and sell directly to buyers across India.

🔧 Built with:
→ React + Vite + Tailwind CSS
→ Node.js + Express + MongoDB Atlas
→ Cloudinary for image storage
→ Razorpay for ₹ payments (UPI, Cards, Net Banking)
→ JWT authentication + role-based access

🌐 Live: surang.vercel.app
💻 Code: github.com/YOUR_USERNAME/surang

#ReactJS #NodeJS #MongoDB #FullStack #IndianArt #OpenSource
```

---

## PART 9 — AUTO-DEPLOY SETUP (Optional but Recommended)

After this setup, every time you push to GitHub, your website auto-updates:

```bash
# Make a change to any file, then:
git add .
git commit -m "feat: your change description"
git push origin main
# → Vercel auto-deploys frontend in ~2 min
# → Render auto-deploys backend in ~3 min
```

---

## 🆘 Common Issues & Fixes

| Problem | Fix |
|---------|-----|
| "Network Error" on login | Check `VITE_API_URL` in Vercel env matches Render URL |
| Images not uploading | Verify all 3 Cloudinary env vars in Render |
| Payment not opening | Check `VITE_RAZORPAY_KEY_ID` in Vercel env |
| Admin can't login | Run the admin creation script again |
| Backend shows old code | Click "Manual Deploy" in Render dashboard |
| Slow first request | Normal for Render free tier — spin-up takes ~30s |
| MongoDB connection error | Check IP Whitelist in Atlas: Network Access → Add `0.0.0.0/0` |

---

## 📞 Architecture Summary

```
User Browser
    ↓ HTTPS
Vercel (surang.vercel.app)        ← React frontend
    ↓ API calls to
Render (surang-api.onrender.com)  ← Node.js + Express backend
    ↓ connects to
MongoDB Atlas                     ← Database (users, artworks, orders)
    ↓ images stored in
Cloudinary                        ← Art photos (CDN)
    ↓ payments via
Razorpay                          ← ₹ INR payments
```

---

*SURANG — Built for every artist in every corner of India 🇮🇳*
