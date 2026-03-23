import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { handleValidationErrors } from '../middleware/validation.middleware';

export const authRouter = Router();

authRouter.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/[A-Z]/)
      .withMessage('Password must contain at least one uppercase letter')
      .matches(/[0-9]/)
      .withMessage('Password must contain at least one number'),
    body('firstName').trim().isLength({ min: 1, max: 100 }).withMessage('First name is required'),
    body('lastName').trim().isLength({ min: 1, max: 100 }).withMessage('Last name is required'),
  ],
  handleValidationErrors,
  authController.register,
);

authRouter.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  handleValidationErrors,
  authController.login,
);

authRouter.post(
  '/refresh',
  [body('refreshToken').notEmpty().withMessage('Refresh token is required')],
  handleValidationErrors,
  authController.refreshToken,
);

authRouter.post('/logout', authMiddleware, authController.logout);

authRouter.get('/me', authMiddleware, authController.me);
