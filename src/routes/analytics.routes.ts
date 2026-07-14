import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Public — frontend calls this to record a view
router.post('/track', analyticsController.track);

// Admin only — get aggregated stats
router.get('/stats', authenticate, analyticsController.getStats);

export default router;
