import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Transaction } from '../entities/Transaction';
import { MonthlyStatus } from '../entities/MonthlyStatus';
import { getMonthlyAmount } from './transactions.controller';

const transactionRepo = () => AppDataSource.getRepository(Transaction);
const statusRepo = () => AppDataSource.getRepository(MonthlyStatus);

export const getMonthlyOverview = async (req: Request, res: Response): Promise<void> => {
  try {
    const year = parseInt(req.query.year as string, 10);
    const month = parseInt(req.query.month as string, 10);

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      res.status(400).json({ error: 'Valid year and month (1-12) are required' });
      return;
    }

    const userId = req.user!.id;
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    const transactions = await transactionRepo()
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.account', 'account')
      .leftJoinAndSelect('t.category', 'category')
      .where('t.userId = :userId', { userId })
      .andWhere('t.startDate <= :endOfMonth', { endOfMonth: endOfMonth.toISOString().split('T')[0] })
      .andWhere('(t.endDate IS NULL OR t.endDate >= :startOfMonth)', {
        startOfMonth: startOfMonth.toISOString().split('T')[0],
      })
      .getMany();

    // All transactions in the active date range are relevant every month.
    // getMonthlyAmount() prorates quarterly/semi-annual/annual amounts to their monthly equivalent.
    const applicable = transactions;

    const statuses = await statusRepo().find({ where: { userId, year, month } });
    const statusMap = new Map(statuses.map((s) => [s.transactionId, s]));

    // Group by category - shape matching frontend MonthlyOverviewCategory model
    const categoryMap = new Map<string, {
      categoryId: string;
      categoryName: string;
      categoryColor: string;
      categoryIcon: string | null;
      categoryType: string;
      items: Array<{ transaction: Transaction; monthlyAmount: number; status: MonthlyStatus | null }>;
      totalAmount: number;
      openAmount: number;
    }>();

    for (const transaction of applicable) {
      const catId = transaction.categoryId;
      const mapKey = `${catId}-${transaction.type}`;   // unique per category+type
      const monthlyAmt = getMonthlyAmount(transaction);
      const status = statusMap.get(transaction.id) || null;
      const isCompleted = status?.isCompleted ?? false;

      if (!categoryMap.has(mapKey)) {
        categoryMap.set(mapKey, {
          categoryId: catId,
          categoryName: transaction.category?.name ?? 'Unbekannt',
          categoryColor: transaction.category?.color ?? '#6c757d',
          categoryIcon: transaction.category?.icon ?? null,
          categoryType: transaction.type,
          items: [],
          totalAmount: 0,
          openAmount: 0,
        });
      }

      const group = categoryMap.get(mapKey)!;
      group.items.push({ transaction, monthlyAmount: Math.round(monthlyAmt * 100) / 100, status });
      group.totalAmount = Math.round((group.totalAmount + monthlyAmt) * 100) / 100;
      if (!isCompleted) group.openAmount = Math.round((group.openAmount + monthlyAmt) * 100) / 100;
    }

    let totalIncome = 0, totalExpense = 0, openIncome = 0, openExpense = 0;
    for (const transaction of applicable) {
      const monthly = getMonthlyAmount(transaction);
      const isCompleted = statusMap.get(transaction.id)?.isCompleted ?? false;
      if (transaction.type === 'income') {
        totalIncome += monthly;
        if (!isCompleted) openIncome += monthly;
      } else {
        totalExpense += monthly;
        if (!isCompleted) openExpense += monthly;
      }
    }

    const incomeCategories = Array.from(categoryMap.values()).filter(g => g.categoryType === 'income');
    const expenseCategories = Array.from(categoryMap.values()).filter(g => g.categoryType === 'expense');

    res.json({
      year,
      month,
      incomeCategories,
      expenseCategories,
      totalIncome:  Math.round(totalIncome  * 100) / 100,
      totalExpense: Math.round(totalExpense * 100) / 100,
      openIncome:   Math.round(openIncome   * 100) / 100,
      openExpense:  Math.round(openExpense  * 100) / 100,
      balance:      Math.round((totalIncome - totalExpense) * 100) / 100,
      openBalance:  Math.round((openIncome  - openExpense)  * 100) / 100,
    });
  } catch (error) {
    console.error('getMonthlyOverview error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const toggleStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { transactionId, year, month } = req.body;
    const userId = req.user!.id;

    if (!transactionId || !year || !month) {
      res.status(400).json({ error: 'transactionId, year and month are required' });
      return;
    }

    const transaction = await transactionRepo().findOne({ where: { id: transactionId, userId } });
    if (!transaction) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }

    let status = await statusRepo().findOne({ where: { transactionId, year, month, userId } });

    if (!status) {
      status = statusRepo().create({ transactionId, year, month, userId, isCompleted: true, completedAt: new Date() });
    } else {
      status.isCompleted = !status.isCompleted;
      status.completedAt = status.isCompleted ? new Date() : null;
    }

    await statusRepo().save(status);
    res.json(status);
  } catch (error) {
    console.error('toggleStatus error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
