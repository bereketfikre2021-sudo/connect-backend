import { Router } from 'express';
import * as brandController from '../controllers/trustedBrand.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { uploadSingle } from '../middlewares/upload.middleware';
import { reorderValidators } from '../validators/hero.validators';
import { createTrustedBrandValidators, updateTrustedBrandValidators } from '../validators/trustedBrand.validators';

const router = Router();

// Public
router.get('/', brandController.getAll);

// Admin
router.get('/:id', authenticate, brandController.getById);
router.post('/', authenticate, uploadSingle, createTrustedBrandValidators, validate, brandController.create);
router.put('/reorder', authenticate, reorderValidators, validate, brandController.reorder);
router.put('/:id', authenticate, uploadSingle, updateTrustedBrandValidators, validate, brandController.update);
router.delete('/:id', authenticate, brandController.remove);

export default router;
