import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Account } from '../entities/Account';
import { Category } from '../entities/Category';
import { Transaction } from '../entities/Transaction';
import { MonthlyStatus } from '../entities/MonthlyStatus';
import path from 'path';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'haushaltsbuch',
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Account, Category, Transaction, MonthlyStatus],
  migrations: [path.join(__dirname, '../database/migrations/**/*.ts')],
  subscribers: [],
});
