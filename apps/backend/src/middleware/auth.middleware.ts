import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.config';

export interface JwtPayload {
  id: string;
  email: string;
  isAdmin: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authorization token required' });
    return;
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, jwtConfig.secret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Token expired' });
      return;
    }
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const adminMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user?.isAdmin) {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
};
