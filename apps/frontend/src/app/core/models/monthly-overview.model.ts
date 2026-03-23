import { Transaction } from './transaction.model';

export interface MonthlyStatus {
  id?: string;
  transactionId: string;
  year: number;
  month: number;
  isCompleted: boolean;
  completedAt?: string;
}

export interface MonthlyOverviewItem {
  transaction: Transaction;
  monthlyAmount: number;
  status: MonthlyStatus | null;
}

export interface MonthlyOverviewCategory {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon?: string;
  items: MonthlyOverviewItem[];
  totalAmount: number;
  openAmount: number;
}

export interface MonthlyOverview {
  year: number;
  month: number;
  incomeCategories: MonthlyOverviewCategory[];
  expenseCategories: MonthlyOverviewCategory[];
  totalIncome: number;
  totalExpense: number;
  openIncome: number;
  openExpense: number;
  balance: number;
  openBalance: number;
}
