import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// ── Public ────────────────────────────────────────────────────────
router.post('/track',       analyticsController.track);       // track event or page view
router.post('/visit',       analyticsController.startVisit);  // start a visit, returns visitorId + sessionId
router.post('/session/end', analyticsController.endSession);  // end session with duration

// ── Admin ─────────────────────────────────────────────────────────
router.get('/stats', authenticate, analyticsController.getStats);      // legacy
router.get('/full',  authenticate, analyticsController.getFullStats);  // full self-hosted analytics
router.get('/live',  authenticate, analyticsController.getLive);       // live visitor count
router.get('/ga4',   authenticate, analyticsController.getGA4Stats);   // GA4 proxy

export default router;
