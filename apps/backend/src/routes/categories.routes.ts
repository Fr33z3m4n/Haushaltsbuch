import { Router } from 'express';
import { body } from 'express-validator';
import * as categoriesController from '../controllers/categories.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { handleValidationErrors } from '../middleware/validation.middleware';

export const categoriesRouter = Router();

categoriesRouter.use(authMiddleware);

categoriesRouter.get('/', categoriesController.getAll);

categoriesRouter.get('/:id', categoriesController.getById);

categoriesRouter.post(
  '/',
  [
    body('name').trim().isLength({ min: 1, max: 150 }).withMessage('Name is required'),
    body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
    body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Color must be a valid hex color'),
    body('icon').optional().trim().isLength({ max: 100 }).withMessage('Icon name too long'),
  ],
  handleValidationErrors,
  categoriesController.create,
);

categoriesRouter.put(
  '/:id',
  [
    body('name').optional().trim().isLength({ min: 1, max: 150 }).withMessage('Name must not be empty'),
    body('type').optional().isIn(['income', 'expense']).withMessage('Type must be income or expense'),
    body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Color must be a valid hex color'),
    body('icon').optional().trim().isLength({ max: 100 }).withMessage('Icon name too long'),
  ],
  handleValidationErrors,
  categoriesController.update,
);

categoriesRouter.delete('/:id', categoriesController.remove);
