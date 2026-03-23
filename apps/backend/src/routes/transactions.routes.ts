import { Router } from 'express';
import { body } from 'express-validator';
import * as transactionsController from '../controllers/transactions.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { handleValidationErrors } from '../middleware/validation.middleware';

export const transactionsRouter = Router();

transactionsRouter.use(authMiddleware);

transactionsRouter.get('/', transactionsController.getAll);

transactionsRouter.get('/:id', transactionsController.getById);

transactionsRouter.post(
  '/',
  [
    body('name').trim().isLength({ min: 1, max: 200 }).withMessage('Name is required'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
    body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
    body('frequency')
      .isIn(['monthly', 'quarterly', 'semi_annual', 'annual'])
      .withMessage('Valid frequency is required'),
    body('dayOfMonth').isInt({ min: 1, max: 31 }).withMessage('dayOfMonth must be between 1 and 31'),
    body('startDate').isISO8601().withMessage('startDate must be a valid date'),
    body('endDate').optional({ nullable: true }).isISO8601().withMessage('endDate must be a valid date'),
    body('accountId').isUUID().withMessage('Valid accountId is required'),
    body('categoryId').isUUID().withMessage('Valid categoryId is required'),
  ],
  handleValidationErrors,
  transactionsController.create,
);

transactionsRouter.put(
  '/:id',
  [
    body('name').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Name must not be empty'),
    body('amount').optional().isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
    body('type').optional().isIn(['income', 'expense']).withMessage('Type must be income or expense'),
    body('frequency')
      .optional()
      .isIn(['monthly', 'quarterly', 'semi_annual', 'annual'])
      .withMessage('Valid frequency is required'),
    body('dayOfMonth').optional().isInt({ min: 1, max: 31 }).withMessage('dayOfMonth must be between 1 and 31'),
    body('startDate').optional().isISO8601().withMessage('startDate must be a valid date'),
    body('endDate').optional({ nullable: true }).isISO8601().withMessage('endDate must be a valid date'),
    body('accountId').optional().isUUID().withMessage('Valid accountId is required'),
    body('categoryId').optional().isUUID().withMessage('Valid categoryId is required'),
  ],
  handleValidationErrors,
  transactionsController.update,
);

transactionsRouter.delete('/:id', transactionsController.remove);
