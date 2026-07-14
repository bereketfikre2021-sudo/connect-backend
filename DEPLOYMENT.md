# Connect Digitals Backend — Deployment Guide

## Stack
- **Backend** → Render (Node.js)
- **Database** → Neon PostgreSQL
- **Images** → Cloudinary
- **Frontend** → Netlify
- **Dashboard** → Netlify (separate deploy)

---

## 1. Neon Database Setup

1. Go to [neon.tech](https://neon.tech) → create a project named `connect-digitals`
2. Copy the connection string (enable **SSL**)
3. It looks like: `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`

---

## 2. Cloudinary Setup

1. Go to [cloudinary.com](https://cloudinary.com) → create account
2. From Dashboard note: **Cloud name**, **API Key**, **API Secret**
3. (Optional) Create a folder `connect-digitals` in Media Library

---

## 3. Backend — Deploy on Render

### A. Create `.env` from `.env.example`
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://...?sslmode=require
JWT_SECRET=<random 64-char string>
JWT_REFRESH_SECRET=<different random 64-char string>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=connect-digitals
ALLOWED_ORIGINS=https://connect-digitals.bereketfikre.et
DASHBOARD_ORIGIN=https://your-admin-dashboard.netlify.app
```

### B. Run migrations
```bash
npm install
npm run db:generate
npm run db:migrate
```

### C. Seed data (optional — populates from frontend hardcoded data)
```bash
npm run db:seed
```

### D. Create admin account
```bash
ADMIN_EMAIL=your@email.com ADMIN_PASSWORD=StrongPass123 ADMIN_NAME="Bereket" npm run db:create-admin
```

### E. Render settings
- **Build command:** `npm install && npm run db:generate && npm run build`
- **Start command:** `node dist/server.js`
- **Environment:** Add all env vars above
- **Health check path:** `/health`

---

## 4. Frontend — Deploy on Netlify

Add to Netlify environment variables:
```env
VITE_API_URL=https://your-backend.onrender.com/api/v1
```

Deploy as usual. `netlify.toml` is already configured.

---

## 5. Admin Dashboard — Deploy on Netlify

1. `cd connect-dashboard`
2. Create `.env`:
   ```env
   VITE_API_URL=https://your-backend.onrender.com/api/v1
   ```
3. Build: `npm run build`
4. Deploy `dist/` to Netlify (separate site)
5. Add the dashboard URL to backend's `DASHBOARD_ORIGIN` env var

---

## 6. Production Checklist

- [ ] `NODE_ENV=production` set on Render
- [ ] `JWT_SECRET` and `JWT_REFRESH_SECRET` are strong random strings (min 32 chars)
- [ ] `ALLOWED_ORIGINS` only lists your exact frontend domains
- [ ] `DASHBOARD_ORIGIN` only lists your exact dashboard domain
- [ ] Database migrations ran successfully
- [ ] Admin account created via `npm run db:create-admin`
- [ ] Cloudinary credentials correct — test an image upload
- [ ] Health check passes: `GET /health` returns `{"status":"ok"}`
- [ ] All 6 public API endpoints return data
- [ ] Frontend loads hero slides, portfolio, case studies, blog, brands, testimonials from API
- [ ] Dashboard login works
- [ ] Image upload/delete works in dashboard
- [ ] Rate limiting active (verify 10-attempt auth limit)
- [ ] CORS blocks requests from unexpected origins
- [ ] SSL/HTTPS enforced on all services

---

## 7. API Endpoints Reference

### Public (no auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/hero` | Published hero slides |
| GET | `/api/v1/portfolio` | Published portfolio projects |
| GET | `/api/v1/portfolio/slug/:slug` | Project by slug |
| GET | `/api/v1/case-studies` | Published case studies |
| GET | `/api/v1/case-studies/slug/:slug` | Case study by slug |
| GET | `/api/v1/blog` | Published blog posts |
| GET | `/api/v1/blog/slug/:slug` | Blog post by slug |
| GET | `/api/v1/trusted-brands` | Published brands |
| GET | `/api/v1/testimonials` | Published testimonials |
| GET | `/api/v1/settings` | Site settings |
| GET | `/health` | Health check |

### Protected (Bearer token required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | Admin login |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/logout` | Logout |
| GET | `/api/v1/auth/profile` | Get admin profile |
| PUT | `/api/v1/auth/profile` | Update admin profile |
| GET | `/api/v1/dashboard/stats` | Dashboard statistics |
| POST/PUT/DELETE | `/api/v1/hero/:id` | Manage hero slides |
| POST/PUT/DELETE | `/api/v1/portfolio/:id` | Manage portfolio |
| POST/PUT/DELETE | `/api/v1/case-studies/:id` | Manage case studies |
| POST/PUT/DELETE | `/api/v1/blog/:id` | Manage blog posts |
| POST/PUT/DELETE | `/api/v1/trusted-brands/:id` | Manage brands |
| POST/PUT/DELETE | `/api/v1/testimonials/:id` | Manage testimonials |
| PUT | `/api/v1/settings` | Update settings |
