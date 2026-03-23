export type AccountType = 'bank' | 'paypal' | 'credit_card' | 'cash' | 'other';
export type CategoryType = 'income' | 'expense';
export type TransactionType = 'income' | 'expense';
export type TransactionFrequency = 'monthly' | 'quarterly' | 'semi_annual' | 'annual';

export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  isActive: boolean;
  createdAt?: string;
}

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AccountDto {
  id: string;
  name: string;
  type: AccountType;
  description?: string;
  color: string;
  isActive: boolean;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryDto {
  id: string;
  name: string;
  type: CategoryType;
  color: string;
  icon?: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TransactionDto {
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
  account?: Pick<AccountDto, 'id' | 'name' | 'color' | 'type'>;
  category?: Pick<CategoryDto, 'id' | 'name' | 'color' | 'icon'>;
  createdAt?: string;
  updatedAt?: string;
}

export interface MonthlyStatusDto {
  id?: string;
  transactionId: string;
  year: number;
  month: number;
  isCompleted: boolean;
  completedAt?: string;
}

export const FREQUENCY_LABELS: Record<TransactionFrequency, string> = {
  monthly: 'Monatlich',
  quarterly: 'Vierteljährlich',
  semi_annual: 'Halbjährlich',
  annual: 'Jährlich',
};

export const FREQUENCY_DIVISORS: Record<TransactionFrequency, number> = {
  monthly: 1,
  quarterly: 3,
  semi_annual: 6,
  annual: 12,
};

export function getMonthlyAmount(amount: number, frequency: TransactionFrequency): number {
  return amount / FREQUENCY_DIVISORS[frequency];
}

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  bank: 'Bankkonto',
  paypal: 'PayPal',
  credit_card: 'Kreditkarte',
  cash: 'Barvermögen',
  other: 'Sonstiges',
};

export const ACCOUNT_TYPE_ICONS: Record<AccountType, string> = {
  bank: 'bank',
  paypal: 'paypal',
  credit_card: 'credit-card',
  cash: 'cash-coin',
  other: 'wallet2',
};
