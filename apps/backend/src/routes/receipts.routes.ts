import { Router } from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/auth.middleware';
import { extractReceipt, saveReceipt, getReceipts, deleteReceipt } from '../controllers/receipts.controller';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'image/jpeg', 'image/png', 'image/webp', 'image/tiff',
      'application/pdf',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});

export const receiptsRouter = Router();

receiptsRouter.use(authMiddleware);

receiptsRouter.get('/', getReceipts);
receiptsRouter.post('/extract', upload.single('file'), extractReceipt);
receiptsRouter.post('/save', saveReceipt);
receiptsRouter.delete('/:id', deleteReceipt);
