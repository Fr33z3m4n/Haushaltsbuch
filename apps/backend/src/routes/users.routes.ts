import { Router } from 'express';
import { body } from 'express-validator';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';
import { handleValidationErrors } from '../middleware/validation.middleware';
import * as usersController from '../controllers/users.controller';

export const usersRouter = Router();

usersRouter.use(authMiddleware, adminMiddleware);

usersRouter.get('/', usersController.listUsers);

usersRouter.post(
  '/',
  [
    body('email').isEmail().normalizeEmail().withMessage('Gültige E-Mail erforderlich'),
    body('password')
      .isLength({ min: 8 }).withMessage('Passwort mind. 8 Zeichen')
      .matches(/[A-Z]/).withMessage('Passwort muss einen Großbuchstaben enthalten')
      .matches(/[0-9]/).withMessage('Passwort muss eine Zahl enthalten'),
    body('firstName').trim().notEmpty().withMessage('Vorname erforderlich'),
    body('lastName').trim().notEmpty().withMessage('Nachname erforderlich'),
  ],
  handleValidationErrors,
  usersController.createUser,
);

usersRouter.put(
  '/:id',
  [
    body('email').optional().isEmail().normalizeEmail(),
    body('firstName').optional().trim().notEmpty(),
    body('lastName').optional().trim().notEmpty(),
    body('password').optional().isLength({ min: 8 }),
  ],
  handleValidationErrors,
  usersController.updateUser,
);

usersRouter.delete('/:id', usersController.deleteUser);
