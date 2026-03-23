import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './User';
import { Account } from './Account';
import { Category } from './Category';
import { MonthlyStatus } from './MonthlyStatus';

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export enum TransactionFrequency {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  SEMI_ANNUAL = 'semi_annual',
  ANNUAL = 'annual',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 200 })
  name!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @Column({ type: 'enum', enum: TransactionType })
  type!: TransactionType;

  @Column({ type: 'enum', enum: TransactionFrequency, default: TransactionFrequency.MONTHLY })
  frequency!: TransactionFrequency;

  @Column({ type: 'tinyint', unsigned: true })
  dayOfMonth!: number;

  @Column({ type: 'date' })
  startDate!: Date;

  @Column({ type: 'date', nullable: true })
  endDate!: Date | null;

  @Column({ type: 'varchar', length: 36 })
  accountId!: string;

  @Column({ type: 'varchar', length: 36 })
  categoryId!: string;

  @Column({ type: 'varchar', length: 36 })
  userId!: string;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ManyToOne(() => Account, (account) => account.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'accountId' })
  account!: Account;

  @ManyToOne(() => Category, (category) => category.transactions, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'categoryId' })
  category!: Category;

  @OneToMany(() => MonthlyStatus, (status) => status.transaction)
  monthlyStatuses!: MonthlyStatus[];
}
