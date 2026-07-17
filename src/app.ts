import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

import { config } from './config/env';
import logger from './utils/logger';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import prisma from './database/prisma';

import authRoutes from './routes/auth.routes';
import heroRoutes from './routes/hero.routes';
import portfolioRoutes from './routes/portfolio.routes';
import caseStudyRoutes from './routes/caseStudy.routes';
import blogRoutes from './routes/blog.routes';
import trustedBrandRoutes from './routes/trustedBrand.routes';
import testimonialRoutes from './routes/testimonial.routes';
import settingsRoutes from './routes/settings.routes';
import dashboardRoutes from './routes/dashboard.routes';
import contactRoutes from './routes/contact.routes';
import analyticsRoutes from './routes/analytics.routes';

const app = express();

// ── Security ──────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ── CORS ──────────────────────────────────────────────────────────
const allowedOrigins = [...config.cors.allowedOrigins, ...config.cors.dashboardOrigin];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Rate Limiting ─────────────────────────────────────────────────
// In development, skip rate limiting entirely — no point throttling localhost
const globalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.isProd ? config.rateLimit.max : 0, // 0 = unlimited in dev
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => !config.isProd, // bypass entirely in dev
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.isProd ? config.rateLimit.authMax : 0,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => !config.isProd, // bypass entirely in dev
  message: { success: false, message: 'Too many login attempts, please try again later.' },
});

app.use(globalLimiter);
app.use('/api/v1/auth/login', authLimiter);

// ── Body Parsing ──────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ── Compression ───────────────────────────────────────────────────
app.use(compression());

// ── Logging ───────────────────────────────────────────────────────
app.use(morgan(config.isProd ? 'combined' : 'dev', {
  stream: { write: (msg) => logger.info(msg.trim()) },
}));

// ── Health Check ──────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: config.nodeEnv });
});

// ── DB Health / Neon Wakeup ping ──────────────────────────────────
app.get('/health/db', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() });
  } catch (err: any) {
    res.status(503).json({ status: 'error', db: 'unavailable', message: err?.message });
  }
});

// ── API Routes ────────────────────────────────────────────────────
const API = '/api/v1';

app.use(`${API}/auth`, authRoutes);
app.use(`${API}/hero`, heroRoutes);
app.use(`${API}/portfolio`, portfolioRoutes);
app.use(`${API}/case-studies`, caseStudyRoutes);
app.use(`${API}/blog`, blogRoutes);
app.use(`${API}/trusted-brands`, trustedBrandRoutes);
app.use(`${API}/testimonials`, testimonialRoutes);
app.use(`${API}/settings`, settingsRoutes);
app.use(`${API}/dashboard`, dashboardRoutes);
app.use(`${API}/contact`, contactRoutes);
app.use(`${API}/analytics`, analyticsRoutes);

// ── 404 & Error Handlers ──────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
