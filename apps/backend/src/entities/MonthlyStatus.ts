import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './User';
import { Transaction } from './Transaction';

@Entity('monthly_statuses')
@Index(['transactionId', 'year', 'month'], { unique: true })
export class MonthlyStatus {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 36 })
  transactionId!: string;

  @Column({ type: 'smallint', unsigned: true })
  year!: number;

  @Column({ type: 'tinyint', unsigned: true })
  month!: number;

  @Column({ default: false })
  isCompleted!: boolean;

  @Column({ type: 'datetime', nullable: true })
  completedAt!: Date | null;

  @Column({ type: 'varchar', length: 36 })
  userId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => Transaction, (transaction) => transaction.monthlyStatuses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'transactionId' })
  transaction!: Transaction;

  @ManyToOne(() => User, (user) => user.monthlyStatuses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;
}
