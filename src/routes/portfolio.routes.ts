import { Router } from 'express';
import * as portfolioController from '../controllers/portfolio.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { uploadSingle } from '../middlewares/upload.middleware';
import { createPortfolioValidators, updatePortfolioValidators } from '../validators/portfolio.validators';

const router = Router();

// Public
router.get('/', portfolioController.getAll);
router.get('/slug/:slug', portfolioController.getBySlug);

// Admin
router.get('/:id', authenticate, portfolioController.getById);
router.post('/', authenticate, uploadSingle, createPortfolioValidators, validate, portfolioController.create);
router.put('/:id', authenticate, uploadSingle, updatePortfolioValidators, validate, portfolioController.update);
router.delete('/:id', authenticate, portfolioController.remove);

export default router;
