import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { loginValidators, refreshValidators, updateProfileValidators } from '../validators/auth.validators';

const router = Router();

router.post('/login', loginValidators, validate, authController.login);
router.post('/refresh', refreshValidators, validate, authController.refresh);
router.post('/logout', authController.logout);
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, updateProfileValidators, validate, authController.updateProfile);

export default router;
