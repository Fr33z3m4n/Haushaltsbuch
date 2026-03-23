import { Router } from 'express';
import { body } from 'express-validator';
import * as accountsController from '../controllers/accounts.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { handleValidationErrors } from '../middleware/validation.middleware';

export const accountsRouter = Router();

accountsRouter.use(authMiddleware);

accountsRouter.get('/', accountsController.getAll);

accountsRouter.get('/:id', accountsController.getById);

accountsRouter.post(
  '/',
  [
    body('name').trim().isLength({ min: 1, max: 150 }).withMessage('Name is required'),
    body('type')
      .isIn(['bank', 'paypal', 'credit_card', 'cash', 'other'])
      .withMessage('Valid account type is required'),
    body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Color must be a valid hex color'),
  ],
  handleValidationErrors,
  accountsController.create,
);

accountsRouter.put(
  '/:id',
  [
    body('name').optional().trim().isLength({ min: 1, max: 150 }).withMessage('Name must not be empty'),
    body('type')
      .optional()
      .isIn(['bank', 'paypal', 'credit_card', 'cash', 'other'])
      .withMessage('Valid account type is required'),
    body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Color must be a valid hex color'),
    body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
  ],
  handleValidationErrors,
  accountsController.update,
);

accountsRouter.delete('/:id', accountsController.remove);
