import { Request, Response } from 'express';
import axios from 'axios';
import FormData from 'form-data';
import { AppDataSource } from '../config/database';
import { Category, CategoryType } from '../entities/Category';
import { Transaction, TransactionFrequency, TransactionType } from '../entities/Transaction';

const OCR_SERVICE_URL = process.env.OCR_SERVICE_URL || 'http://localhost:8001';

const RECEIPT_CATEGORY_NAME = 'Quittungen';
const RECEIPT_CATEGORY_COLOR = '#fd7e14';
const RECEIPT_CATEGORY_ICON = 'receipt';

/** Auto-creates the "Quittungen" category for the user if it doesn't exist. */
async function getOrCreateReceiptCategory(userId: string): Promise<Category> {
  const catRepo = AppDataSource.getRepository(Category);
  let category = await catRepo.findOne({
    where: { userId, name: RECEIPT_CATEGORY_NAME, type: CategoryType.EXPENSE },
  });
  if (!category) {
    category = catRepo.create({
      name: RECEIPT_CATEGORY_NAME,
      type: CategoryType.EXPENSE,
      color: RECEIPT_CATEGORY_COLOR,
      icon: RECEIPT_CATEGORY_ICON,
      userId,
    });
    await catRepo.save(category);
  }
  return category;
}

/**
 * GET /api/receipts
 * Returns all saved receipts (transactions in "Quittungen" category) newest first.
 */
export const getReceipts = async (req: Request, res: Response): Promise<void> => {
  try {
    const txRepo = AppDataSource.getRepository(Transaction);
    const receipts = await txRepo
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.account', 'account')
      .leftJoinAndSelect('t.category', 'category')
      .where('t.userId = :userId', { userId: req.user!.id })
      .andWhere('category.name = :name', { name: RECEIPT_CATEGORY_NAME })
      .orderBy('t.startDate', 'DESC')
      .addOrderBy('t.createdAt', 'DESC')
      .getMany();
    res.json(receipts);
  } catch (error) {
    console.error('getReceipts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * DELETE /api/receipts/:id
 * Deletes a single saved receipt.
 */
export const deleteReceipt = async (req: Request, res: Response): Promise<void> => {
  try {
    const txRepo = AppDataSource.getRepository(Transaction);
    const receipt = await txRepo
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.category', 'category')
      .where('t.id = :id AND t.userId = :userId', { id: req.params.id, userId: req.user!.id })
      .andWhere('category.name = :name', { name: RECEIPT_CATEGORY_NAME })
      .getOne();

    if (!receipt) {
      res.status(404).json({ error: 'Receipt not found' });
      return;
    }
    await txRepo.remove(receipt);
    res.status(204).send();
  } catch (error) {
    console.error('deleteReceipt error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * POST /api/receipts/extract
 * Proxies the uploaded file to the OCR service and returns extracted data.
 * Expects multipart/form-data with a single field "file".
 */
export const extractReceipt = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const form = new FormData();
    form.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const ocrResponse = await axios.post(`${OCR_SERVICE_URL}/ocr/extract`, form, {
      headers: form.getHeaders(),
      timeout: 60_000,
    });

    res.json(ocrResponse.data);
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 502;
      const detail = error.response?.data?.detail || 'OCR service unavailable';
      console.error('OCR service error:', detail);
      res.status(status).json({ error: detail });
    } else {
      console.error('extractReceipt error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

/**
 * POST /api/receipts/save
 * Saves the (OCR-corrected) receipt as a one-time Transaction.
 * The transaction uses startDate = endDate = receiptDate so it only appears
 * in the relevant month's overview.
 */
export const saveReceipt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount, date, merchant, accountId, categoryId, notes } = req.body;
    const userId = req.user!.id;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      res.status(400).json({ error: 'Valid amount is required' });
      return;
    }
    if (!accountId) {
      res.status(400).json({ error: 'accountId is required' });
      return;
    }

    const receiptDate = date ? new Date(date) : new Date();
    if (isNaN(receiptDate.getTime())) {
      res.status(400).json({ error: 'Invalid date format' });
      return;
    }

    // Resolve category — use provided categoryId or auto-create "Quittungen"
    let resolvedCategoryId = categoryId;
    if (!resolvedCategoryId) {
      const category = await getOrCreateReceiptCategory(userId);
      resolvedCategoryId = category.id;
    }

    const txRepo = AppDataSource.getRepository(Transaction);
    const transaction = txRepo.create({
      name: merchant || 'Quittung',
      amount: Number(amount),
      type: TransactionType.EXPENSE,
      frequency: TransactionFrequency.MONTHLY,
      dayOfMonth: receiptDate.getDate(),
      startDate: receiptDate,
      endDate: receiptDate,   // Same day → appears only in this month's overview
      accountId,
      categoryId: resolvedCategoryId,
      userId,
      notes: notes || null,
    });

    await txRepo.save(transaction);

    const saved = await txRepo.findOne({
      where: { id: transaction.id },
      relations: ['account', 'category'],
    });

    res.status(201).json(saved);
  } catch (error) {
    console.error('saveReceipt error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
