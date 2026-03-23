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

export enum AccountType {
  BANK = 'bank',
  PAYPAL = 'paypal',
  CREDIT_CARD = 'credit_card',
  CASH = 'cash',
  OTHER = 'other',
}

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 150 })
  name!: string;

  @Column({ type: 'enum', enum: AccountType, default: AccountType.BANK })
  type!: AccountType;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ length: 7, default: '#6c757d' })
  color!: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: 'varchar', length: 36 })
  userId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.accounts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @OneToMany(() => Transaction, (transaction) => transaction.account)
  transactions!: Transaction[];
}
