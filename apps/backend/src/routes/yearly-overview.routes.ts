import { Router } from 'express';
import { query } from 'express-validator';
import * as yearlyOverviewController from '../controllers/yearly-overview.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { handleValidationErrors } from '../middleware/validation.middleware';

export const yearlyOverviewRouter = Router();

yearlyOverviewRouter.use(authMiddleware);

yearlyOverviewRouter.get(
  '/',
  [query('year').isInt({ min: 2000, max: 2100 }).withMessage('Valid year is required')],
  handleValidationErrors,
  yearlyOverviewController.getYearlyOverview,
);
