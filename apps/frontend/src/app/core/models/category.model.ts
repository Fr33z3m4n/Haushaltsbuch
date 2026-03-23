export type CategoryType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  color: string;
  icon?: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryRequest {
  name: string;
  type: CategoryType;
  color: string;
  icon?: string;
}
