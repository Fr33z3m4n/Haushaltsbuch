export interface YearlyMonth {
  month: number;
  monthName: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  items: YearlyItem[];
}

export interface YearlyItem {
  transactionId: string;
  transactionName: string;
  amount: number;
  monthlyAmount: number;
  type: 'income' | 'expense';
  accountName: string;
  categoryName: string;
}

export interface YearlyOverview {
  year: number;
  months: YearlyMonth[];
  annualIncome: number;
  annualExpense: number;
  annualBalance: number;
}
