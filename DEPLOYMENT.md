# B2B Inventory – Deployment Guide

## Backend (Render) ✅ Already Done

- **URL:** `https://inventory-x6ck.onrender.com` (ya jo aapka URL ho)
- **API Base:** `https://inventory-x6ck.onrender.com/api/v1`

### Backend env vars (Render dashboard):

| Variable        | Value                                 |
|----------------|----------------------------------------|
| MONGODB_URI    | mongodb+srv://...                      |
| JWT_SECRET     | strong-random-string                   |
| JWT_EXPIRES    | 8h                                     |
| CORS_ORIGIN    | https://your-frontend.vercel.app       |
| PORT           | 3000                                   |
| CLOUDINARY_*   | (optional, for profile images)         |

---

## Frontend (Vercel / Netlify)

### Step 1: Deploy on Vercel

1. https://vercel.com → **Add New Project**
2. Import **Nayak-Anand/Inventory** from GitHub
3. **Root Directory:** `./` (project root)
4. **Framework Preset:** Vite
5. **Build Command:** `npm run build`
6. **Output Directory:** `dist`
7. **Environment Variable:**
   - Name: `VITE_API_URL`
   - Value: `https://inventory-x6ck.onrender.com/api/v1`
8. Deploy

### Step 2: Deploy on Netlify

1. https://netlify.com → **Add new site** → **Import from Git**
2. Connect GitHub repo **Nayak-Anand/Inventory**
3. **Build command:** `npm run build`
4. **Publish directory:** `dist`
5. **Environment variables:**
   - `VITE_API_URL` = `https://inventory-x6ck.onrender.com/api/v1`
6. Deploy

---

## CORS update (backend)

Jab frontend deploy ho jaye:

- Render project → **Environment**
- `CORS_ORIGIN` = frontend ka URL (e.g. `https://your-app.vercel.app`)

Agar CORS_ORIGIN set nahi kiya to backend `*` use karta hai (saare origins allow).

---

## Summary

| Part      | URL / Config                                         |
|----------|-------------------------------------------------------|
| Backend  | https://inventory-x6ck.onrender.com/api/v1            |
| Frontend | Vercel/Netlify par deploy, `VITE_API_URL` set karo    |
| CORS     | Backend pe `CORS_ORIGIN` = frontend URL               |
