import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { bcryptRounds } from '../config/jwt.config';

const userRepo = () => AppDataSource.getRepository(User);

export const listUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await userRepo().find({
      select: ['id', 'email', 'firstName', 'lastName', 'isAdmin', 'isActive', 'createdAt', 'updatedAt'],
      order: { createdAt: 'ASC' },
    });
    res.json(users);
  } catch (error) {
    console.error('listUsers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, isAdmin = false } = req.body;

    const existing = await userRepo().findOne({ where: { email: email.toLowerCase() } });
    if (existing) {
      res.status(409).json({ error: 'Email bereits registriert' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, bcryptRounds);
    const user = userRepo().create({
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      isAdmin,
      isActive: true,
    });

    await userRepo().save(user);

    res.status(201).json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isAdmin: user.isAdmin,
      isActive: user.isActive,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('createUser error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, isAdmin, isActive, password } = req.body;

    const user = await userRepo().findOne({ where: { id } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Prevent removing admin from yourself
    if (id === req.user!.id && isAdmin === false) {
      res.status(400).json({ error: 'Du kannst dir selbst den Admin-Status nicht entziehen' });
      return;
    }

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (email !== undefined) user.email = email.toLowerCase();
    if (isAdmin !== undefined) user.isAdmin = isAdmin;
    if (isActive !== undefined) user.isActive = isActive;
    if (password) user.password = await bcrypt.hash(password, bcryptRounds);

    await userRepo().save(user);

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isAdmin: user.isAdmin,
      isActive: user.isActive,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error('updateUser error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (id === req.user!.id) {
      res.status(400).json({ error: 'Du kannst dein eigenes Konto nicht löschen' });
      return;
    }

    const user = await userRepo().findOne({ where: { id } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    await userRepo().remove(user);
    res.status(204).send();
  } catch (error) {
    console.error('deleteUser error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
