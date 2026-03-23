import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Account } from './Account';
import { Category } from './Category';
import { Transaction } from './Transaction';
import { MonthlyStatus } from './MonthlyStatus';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, length: 255 })
  email!: string;

  @Column({ length: 255 })
  password!: string;

  @Column({ length: 100 })
  firstName!: string;

  @Column({ length: 100 })
  lastName!: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: false })
  isAdmin!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Account, (account) => account.user)
  accounts!: Account[];

  @OneToMany(() => Category, (category) => category.user)
  categories!: Category[];

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions!: Transaction[];

  @OneToMany(() => MonthlyStatus, (status) => status.user)
  monthlyStatuses!: MonthlyStatus[];
}
