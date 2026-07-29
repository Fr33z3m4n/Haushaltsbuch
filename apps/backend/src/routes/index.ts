import { Router } from 'express';
import { authRouter } from './auth.routes';
import { accountsRouter } from './accounts.routes';
import { categoriesRouter } from './categories.routes';
import { transactionsRouter } from './transactions.routes';
import { monthlyOverviewRouter } from './monthly-overview.routes';
import { yearlyOverviewRouter } from './yearly-overview.routes';
import { usersRouter } from './users.routes';
import { receiptsRouter } from './receipts.routes';

export const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/auth', authRouter);
router.use('/accounts', accountsRouter);
router.use('/categories', categoriesRouter);
router.use('/transactions', transactionsRouter);
router.use('/monthly-overview', monthlyOverviewRouter);
router.use('/yearly-overview', yearlyOverviewRouter);
router.use('/users', usersRouter);
router.use('/receipts', receiptsRouter);
