import { Router } from 'express';
import * as heroController from '../controllers/hero.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { uploadSingle } from '../middlewares/upload.middleware';
import { createHeroValidators, updateHeroValidators, reorderValidators } from '../validators/hero.validators';

const router = Router();

// Public
router.get('/', heroController.getAll);

// Admin protected
router.get('/:id', authenticate, heroController.getById);
router.post('/', authenticate, uploadSingle, createHeroValidators, validate, heroController.create);
router.put('/reorder', authenticate, reorderValidators, validate, heroController.reorder);
router.put('/:id', authenticate, uploadSingle, updateHeroValidators, validate, heroController.update);
router.delete('/:id', authenticate, heroController.remove);

export default router;
