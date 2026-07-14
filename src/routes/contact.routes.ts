import { Router } from 'express';
import * as contactController from '../controllers/contact.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createLeadValidators, updateStatusValidators } from '../validators/contact.validators';

const router = Router();

// Public — frontend contact form submission
router.post('/', createLeadValidators, validate, contactController.create);

// Admin only
router.get('/stats', authenticate, contactController.getStats);
router.get('/', authenticate, contactController.getAll);
router.get('/:id', authenticate, contactController.getById);
router.patch('/:id/status', authenticate, updateStatusValidators, validate, contactController.updateStatus);
router.delete('/:id', authenticate, contactController.remove);

export default router;
