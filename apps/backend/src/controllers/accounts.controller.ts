import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Account } from '../entities/Account';

const repo = () => AppDataSource.getRepository(Account);

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const accounts = await repo().find({
      where: { userId: req.user!.id },
      order: { name: 'ASC' },
    });
    res.json(accounts);
  } catch (error) {
    console.error('getAll accounts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const account = await repo().findOne({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!account) {
      res.status(404).json({ error: 'Account not found' });
      return;
    }
    res.json(account);
  } catch (error) {
    console.error('getById account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, type, description, color } = req.body;
    const account = repo().create({
      name,
      type,
      description: description || null,
      color: color || '#6c757d',
      userId: req.user!.id,
    });
    await repo().save(account);
    res.status(201).json(account);
  } catch (error) {
    console.error('create account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const account = await repo().findOne({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!account) {
      res.status(404).json({ error: 'Account not found' });
      return;
    }
    const { name, type, description, color, isActive } = req.body;
    if (name !== undefined) account.name = name;
    if (type !== undefined) account.type = type;
    if (description !== undefined) account.description = description;
    if (color !== undefined) account.color = color;
    if (isActive !== undefined) account.isActive = isActive;

    await repo().save(account);
    res.json(account);
  } catch (error) {
    console.error('update account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  try {
    const account = await repo().findOne({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!account) {
      res.status(404).json({ error: 'Account not found' });
      return;
    }
    await repo().remove(account);
    res.status(204).send();
  } catch (error) {
    console.error('remove account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
