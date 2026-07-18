import { Router } from 'express';
import * as blogController from '../controllers/blog.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { uploadSingle } from '../middlewares/upload.middleware';
import { createBlogValidators, updateBlogValidators } from '../validators/blog.validators';

const router = Router();

// Public
router.get('/', blogController.getAll);
router.get('/slug/:slug', blogController.getBySlug);

// Admin
router.get('/:id', authenticate, blogController.getById);
router.post('/', authenticate, uploadSingle, createBlogValidators, validate, blogController.create);
router.put('/reorder', authenticate, blogController.reorder);
router.put('/:id', authenticate, uploadSingle, updateBlogValidators, validate, blogController.update);
router.delete('/:id', authenticate, blogController.remove);

export default router;
