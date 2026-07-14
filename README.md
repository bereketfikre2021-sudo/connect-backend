# Connect Digitals — Backend API

Secure, scalable CMS backend for the Connect Digitals website.

## Tech Stack
- **Runtime:** Node.js + Express.js + TypeScript
- **Database:** PostgreSQL (Neon) via Prisma ORM
- **Auth:** JWT + Refresh Tokens + bcrypt
- **Images:** Cloudinary
- **Security:** Helmet, CORS, Rate Limiting, XSS, Input Validation

## Quick Start

```bash
# 1. Install
npm install

# 2. Copy env and fill in values
cp .env.example .env

# 3. Generate Prisma client
npm run db:generate

# 4. Run migrations (production)
npm run db:migrate

# 5. Seed database with existing frontend data
npm run db:seed

# 6. Create admin account
ADMIN_EMAIL=you@email.com ADMIN_PASSWORD=strong_pass ADMIN_NAME="Your Name" npm run db:create-admin

# 7. Start dev server
npm run dev
```

## Architecture

```
src/
├── config/        # env, cloudinary
├── controllers/   # request handlers
├── database/      # Prisma client, seed, createAdmin
├── middlewares/   # auth, error, validate, upload
├── routes/        # Express routers
├── services/      # business logic
├── types/         # TypeScript interfaces
├── utils/         # logger, apiResponse, slugify, pagination
├── validators/    # express-validator rules
├── constants/     # shared constants
├── app.ts         # Express app setup
└── server.ts      # entry point
```

See `DEPLOYMENT.md` for full deployment instructions.
