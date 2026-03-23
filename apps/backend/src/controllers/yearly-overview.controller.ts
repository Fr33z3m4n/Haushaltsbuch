import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Transaction } from '../entities/Transaction';
import { getMonthlyAmount } from './transactions.controller';

const transactionRepo = () => AppDataSource.getRepository(Transaction);

export const getYearlyOverview = async (req: Request, res: Response): Promise<void> => {
  try {
    const year = parseInt(req.query.year as string, 10);

    if (isNaN(year)) {
      res.status(400).json({ error: 'Valid year is required' });
      return;
    }

    const userId = req.user!.id;
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59);

    const transactions = await transactionRepo()
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.account', 'account')
      .leftJoinAndSelect('t.category', 'category')
      .where('t.userId = :userId', { userId })
      .andWhere('t.startDate <= :endOfYear', { endOfYear: endOfYear.toISOString().split('T')[0] })
      .andWhere('(t.endDate IS NULL OR t.endDate >= :startOfYear)', {
        startOfYear: startOfYear.toISOString().split('T')[0],
      })
      .getMany();

    const months: Array<{
      month: number;
      monthName: string;
      totalIncome: number;
      totalExpense: number;
      balance: number;
      items: Array<{
        id: string;
        name: string;
        type: string;
        frequency: string;
        monthlyAmount: number;
        category: Transaction['category'];
        account: Transaction['account'];
      }>;
    }> = [];

    const monthNames = [
      'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
      'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
    ];

    for (let m = 1; m <= 12; m++) {
      // Filter by active date range for this specific month
      const startOfMonth = new Date(year, m - 1, 1);
      const endOfMonth   = new Date(year, m, 0, 23, 59, 59);

      const applicable = transactions.filter((t) => {
        const start = new Date(t.startDate);
        const end   = t.endDate ? new Date(t.endDate) : null;
        return start <= endOfMonth && (end === null || end >= startOfMonth);
      });

      let income = 0;
      let expense = 0;

      const monthTransactions = applicable.map((t) => {
        // getMonthlyAmount already divides by frequency factor (quarterly÷3, semi_annual÷6, annual÷12)
        const monthlyAmount = getMonthlyAmount(t);
        if (t.type === 'income') income += monthlyAmount;
        else expense += monthlyAmount;
        return {
          id: t.id,
          name: t.name,
          type: t.type,
          frequency: t.frequency,
          monthlyAmount: Math.round(monthlyAmount * 100) / 100,
          category: t.category,
          account: t.account,
        };
      });

      months.push({
        month: m,
        monthName: monthNames[m - 1],
        totalIncome: Math.round(income * 100) / 100,
        totalExpense: Math.round(expense * 100) / 100,
        balance: Math.round((income - expense) * 100) / 100,
        items: monthTransactions,
      });
    }

    const yearlyIncome  = months.reduce((sum, m) => sum + m.totalIncome,  0);
    const yearlyExpense = months.reduce((sum, m) => sum + m.totalExpense, 0);

    res.json({
      year,
      months,
      annualIncome:  Math.round(yearlyIncome  * 100) / 100,
      annualExpense: Math.round(yearlyExpense * 100) / 100,
      annualBalance: Math.round((yearlyIncome - yearlyExpense) * 100) / 100,
    });
  } catch (error) {
    console.error('getYearlyOverview error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

