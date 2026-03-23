import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Category } from '../entities/Category';

const repo = () => AppDataSource.getRepository(Category);

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await repo().find({
      where: { userId: req.user!.id },
      order: { type: 'ASC', name: 'ASC' },
    });
    res.json(categories);
  } catch (error) {
    console.error('getAll categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await repo().findOne({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }
    res.json(category);
  } catch (error) {
    console.error('getById category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, type, color, icon } = req.body;
    const category = repo().create({
      name,
      type,
      color: color || '#6c757d',
      icon: icon || null,
      userId: req.user!.id,
    });
    await repo().save(category);
    res.status(201).json(category);
  } catch (error) {
    console.error('create category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await repo().findOne({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }
    const { name, type, color, icon } = req.body;
    if (name !== undefined) category.name = name;
    if (type !== undefined) category.type = type;
    if (color !== undefined) category.color = color;
    if (icon !== undefined) category.icon = icon;

    await repo().save(category);
    res.json(category);
  } catch (error) {
    console.error('update category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await repo().findOne({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }
    await repo().remove(category);
    res.status(204).send();
  } catch (error) {
    console.error('remove category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
