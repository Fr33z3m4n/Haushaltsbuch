export type TransactionType = 'income' | 'expense';
export type TransactionFrequency = 'monthly' | 'quarterly' | 'semi_annual' | 'annual';

export interface Transaction {
  id: string;
  name: string;
  amount: number;
  type: TransactionType;
  frequency: TransactionFrequency;
  dayOfMonth: number;
  startDate: string;
  endDate?: string;
  accountId: string;
  categoryId: string;
  userId: string;
  notes?: string;
  account?: { id: string; name: string; color: string; type: string };
  category?: { id: string; name: string; color: string; icon?: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTransactionRequest {
  name: string;
  amount: number;
  type: TransactionType;
  frequency: TransactionFrequency;
  dayOfMonth: number;
  startDate: string;
  endDate?: string;
  accountId: string;
  categoryId: string;
  notes?: string;
}

export const FREQUENCY_LABELS: Record<TransactionFrequency, string> = {
  monthly: 'Monatlich',
  quarterly: 'Vierteljährlich',
  semi_annual: 'Halbjährlich',
  annual: 'Jährlich'
};

export const FREQUENCY_DIVISORS: Record<TransactionFrequency, number> = {
  monthly: 1,
  quarterly: 3,
  semi_annual: 6,
  annual: 12
};

export function getMonthlyAmount(amount: number, frequency: TransactionFrequency): number {
  return amount / FREQUENCY_DIVISORS[frequency];
}
