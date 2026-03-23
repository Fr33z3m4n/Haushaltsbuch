import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { jwtConfig, bcryptRounds } from '../config/jwt.config';
import { JwtPayload } from '../middleware/auth.middleware';

const userRepository = () => AppDataSource.getRepository(User);

const generateTokens = (user: User): { accessToken: string; refreshToken: string } => {
  const payload: JwtPayload = { id: user.id, email: user.email, isAdmin: user.isAdmin };

  const accessToken = jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn as jwt.SignOptions['expiresIn'],
  });

  const refreshToken = jwt.sign(payload, jwtConfig.refreshSecret, {
    expiresIn: jwtConfig.refreshExpiresIn as jwt.SignOptions['expiresIn'],
  });

  return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName } = req.body;

    const repo = userRepository();
    const existing = await repo.findOne({ where: { email: email.toLowerCase() } });
    if (existing) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, bcryptRounds);
    const user = repo.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
    });

    await repo.save(user);

    const { accessToken, refreshToken } = generateTokens(user);

    res.status(201).json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const repo = userRepository();
    const user = await repo.findOne({ where: { email: email.toLowerCase() } });

    if (!user || !user.isActive) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const { accessToken, refreshToken } = generateTokens(user);

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      res.status(400).json({ error: 'Refresh token required' });
      return;
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, jwtConfig.refreshSecret) as JwtPayload;
    } catch {
      res.status(401).json({ error: 'Invalid or expired refresh token' });
      return;
    }

    const user = await userRepository().findOne({ where: { id: decoded.id, isActive: true } });
    if (!user) {
      res.status(401).json({ error: 'User not found or inactive' });
      return;
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const logout = (_req: Request, res: Response): void => {
  res.json({ message: 'Logged out successfully' });
};

export const me = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await userRepository().findOne({
      where: { id: req.user!.id },
      select: ['id', 'email', 'firstName', 'lastName', 'isAdmin', 'isActive', 'createdAt'],
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
