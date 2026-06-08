# 🎨 SURANG — हर कला की पहचान

**India's first direct art marketplace** — connecting local Indian artists from every corner of the country directly with buyers. No middlemen. Full artist credit. Fair prices.

---

## 🌟 What is SURANG?

SURANG is a full-stack web platform where:
- **Artists** upload their artwork (Madhubani, Warli, Kalamkari, Pottery, Pattachitra, Weaving, Sculpture, Folk Art, Photography) with their own price, story and description
- **Buyers** browse authentic Indian art and purchase directly via Razorpay (UPI, Cards, Net Banking)
- **Admin** (hidden panel) manages artists, verifies credentials, and monitors orders
- Every transaction is **direct** — artist ships to buyer personally

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Animations | Framer Motion + CSS Keyframes |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas (cloud) |
| Auth | JWT + bcrypt |
| Images | Cloudinary |
| Payments | Razorpay (₹ INR) |
| Deployment | Vercel (frontend) + Render (backend) |

## 📁 Project Structure

```
surang/
├── client/                 # React frontend
│   ├── public/
│   │   └── favicon.svg
│   └── src/
│       ├── components/     # Navbar, Footer, ArtCard, ProtectedRoute
│       ├── context/        # AuthContext, CartContext
│       ├── pages/
│       │   ├── Landing.jsx         # Home page with animations
│       │   ├── Explore.jsx         # Browse all artworks
│       │   ├── ArtDetail.jsx       # Single artwork page
│       │   ├── Login.jsx / Register.jsx
│       │   ├── Cart.jsx / OrderSuccess.jsx
│       │   ├── artist/
│       │   │   ├── Dashboard.jsx   # Artist panel
│       │   │   └── UploadArt.jsx   # Upload form
│       │   └── admin/              # Hidden admin panel
│       │       ├── AdminLogin.jsx
│       │       └── AdminDashboard.jsx
│       └── services/api.js         # Axios API client
└── server/                 # Node.js backend
    ├── config/             # DB + Cloudinary
    ├── controllers/        # Business logic
    ├── middleware/         # JWT auth
    ├── models/             # Mongoose schemas
    └── routes/             # API routes
```

## 🚀 Quick Start (Local Development)

See **DEPLOYMENT.md** for complete setup and deployment guide.

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/surang.git
cd surang

# 2. Setup backend
cd server && npm install
cp .env.example .env
# → Fill in your .env values (see DEPLOYMENT.md)
npm run dev

# 3. Setup frontend (new terminal)
cd client && npm install
# Create client/.env with VITE_API_URL=http://localhost:5000/api
npm run dev
```

## 🔑 User Roles

| Role | Access |
|------|--------|
| **Buyer** | Browse art, cart, checkout, order tracking |
| **Artist** | All buyer features + upload art + dashboard + manage orders |
| **Admin** | Hidden at `/admin/login` — not linked anywhere in the UI |

## 📄 License

MIT — Built with ❤️ for Indian artists and culture
