export type AccountType = 'bank' | 'paypal' | 'credit_card' | 'cash' | 'other';

export interface Account {
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

export interface CreateAccountRequest {
  name: string;
  type: AccountType;
  description?: string;
  color: string;
}

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  bank: 'Bank',
  paypal: 'PayPal',
  credit_card: 'Kreditkarte',
  cash: 'Barvermögen',
  other: 'Sonstiges'
};

export const ACCOUNT_TYPE_ICONS: Record<AccountType, string> = {
  bank: 'building-columns',
  paypal: 'wallet',
  credit_card: 'credit-card',
  cash: 'money-bill',
  other: 'wallet'
};
