import { Router } from 'express';
import * as caseStudyController from '../controllers/caseStudy.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { uploadSingle } from '../middlewares/upload.middleware';
import { createCaseStudyValidators, updateCaseStudyValidators } from '../validators/caseStudy.validators';

const router = Router();

// Public
router.get('/', caseStudyController.getAll);
router.get('/slug/:slug', caseStudyController.getBySlug);

// Admin
router.get('/:id', authenticate, caseStudyController.getById);
router.post('/', authenticate, uploadSingle, createCaseStudyValidators, validate, caseStudyController.create);
router.put('/:id', authenticate, uploadSingle, updateCaseStudyValidators, validate, caseStudyController.update);
router.delete('/:id', authenticate, caseStudyController.remove);

export default router;
