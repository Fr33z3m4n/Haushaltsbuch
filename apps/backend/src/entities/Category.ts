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
import { Transaction } from './Transaction';

export enum CategoryType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 150 })
  name!: string;

  @Column({ type: 'enum', enum: CategoryType })
  type!: CategoryType;

  @Column({ length: 7, default: '#6c757d' })
  color!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  icon!: string | null;

  @Column({ type: 'varchar', length: 36 })
  userId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.categories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @OneToMany(() => Transaction, (transaction) => transaction.category)
  transactions!: Transaction[];
}
