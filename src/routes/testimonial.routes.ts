import { Router } from 'express';
import * as testimonialController from '../controllers/testimonial.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { uploadSingle } from '../middlewares/upload.middleware';
import { reorderValidators } from '../validators/hero.validators';
import { createTestimonialValidators, updateTestimonialValidators } from '../validators/testimonial.validators';

const router = Router();

// Public
router.get('/', testimonialController.getAll);

// Admin
router.get('/:id', authenticate, testimonialController.getById);
router.post('/', authenticate, uploadSingle, createTestimonialValidators, validate, testimonialController.create);
router.put('/reorder', authenticate, reorderValidators, validate, testimonialController.reorder);
router.put('/:id', authenticate, uploadSingle, updateTestimonialValidators, validate, testimonialController.update);
router.delete('/:id', authenticate, testimonialController.remove);

export default router;
