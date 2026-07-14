import { Router } from 'express';
import * as settingsController from '../controllers/settings.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

// Public (settings are readable publicly for SEO/meta)
router.get('/', settingsController.get);

// Admin
router.put(
  '/',
  authenticate,
  upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'favicon', maxCount: 1 }]),
  settingsController.update
);

export default router;
