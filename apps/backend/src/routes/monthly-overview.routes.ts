import { Router } from 'express';
import { body, query } from 'express-validator';
import * as monthlyOverviewController from '../controllers/monthly-overview.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { handleValidationErrors } from '../middleware/validation.middleware';

export const monthlyOverviewRouter = Router();

monthlyOverviewRouter.use(authMiddleware);

monthlyOverviewRouter.get(
  '/',
  [
    query('year').isInt({ min: 2000, max: 2100 }).withMessage('Valid year is required'),
    query('month').isInt({ min: 1, max: 12 }).withMessage('Valid month (1-12) is required'),
  ],
  handleValidationErrors,
  monthlyOverviewController.getMonthlyOverview,
);

monthlyOverviewRouter.post(
  '/toggle-status',
  [
    body('transactionId').isUUID().withMessage('Valid transactionId is required'),
    body('year').isInt({ min: 2000, max: 2100 }).withMessage('Valid year is required'),
    body('month').isInt({ min: 1, max: 12 }).withMessage('Valid month (1-12) is required'),
  ],
  handleValidationErrors,
  monthlyOverviewController.toggleStatus,
);
