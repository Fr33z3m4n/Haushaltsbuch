import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Transaction, TransactionFrequency } from '../entities/Transaction';

const repo = () => AppDataSource.getRepository(Transaction);

export const getMonthlyAmount = (transaction: Transaction): number => {
  const amount = Number(transaction.amount);
  switch (transaction.frequency) {
    case TransactionFrequency.MONTHLY:
      return amount;
    case TransactionFrequency.QUARTERLY:
      return amount / 3;
    case TransactionFrequency.SEMI_ANNUAL:
      return amount / 6;
    case TransactionFrequency.ANNUAL:
      return amount / 12;
    default:
      return amount;
  }
};

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const transactions = await repo().find({
      where: { userId: req.user!.id },
      relations: ['account', 'category'],
      order: { name: 'ASC' },
    });
    res.json(transactions);
  } catch (error) {
    console.error('getAll transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const transaction = await repo().findOne({
      where: { id: req.params.id, userId: req.user!.id },
      relations: ['account', 'category'],
    });
    if (!transaction) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }
    res.json(transaction);
  } catch (error) {
    console.error('getById transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, amount, type, frequency, dayOfMonth, startDate, endDate, accountId, categoryId, notes } = req.body;
    const transaction = repo().create({
      name,
      amount,
      type,
      frequency,
      dayOfMonth,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      accountId,
      categoryId,
      userId: req.user!.id,
      notes: notes || null,
    });
    await repo().save(transaction);

    const saved = await repo().findOne({
      where: { id: transaction.id },
      relations: ['account', 'category'],
    });
    res.status(201).json(saved);
  } catch (error) {
    console.error('create transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const transaction = await repo().findOne({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!transaction) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }
    const { name, amount, type, frequency, dayOfMonth, startDate, endDate, accountId, categoryId, notes } = req.body;
    if (name !== undefined) transaction.name = name;
    if (amount !== undefined) transaction.amount = amount;
    if (type !== undefined) transaction.type = type;
    if (frequency !== undefined) transaction.frequency = frequency;
    if (dayOfMonth !== undefined) transaction.dayOfMonth = dayOfMonth;
    if (startDate !== undefined) transaction.startDate = new Date(startDate);
    if (endDate !== undefined) transaction.endDate = endDate ? new Date(endDate) : null;
    if (accountId !== undefined) transaction.accountId = accountId;
    if (categoryId !== undefined) transaction.categoryId = categoryId;
    if (notes !== undefined) transaction.notes = notes;

    await repo().save(transaction);

    const updated = await repo().findOne({
      where: { id: transaction.id },
      relations: ['account', 'category'],
    });
    res.json(updated);
  } catch (error) {
    console.error('update transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  try {
    const transaction = await repo().findOne({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!transaction) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }
    await repo().remove(transaction);
    res.status(204).send();
  } catch (error) {
    console.error('remove transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
