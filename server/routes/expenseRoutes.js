import express from 'express';
import { getExpenses, createExpense, updateExpense, deleteExpense } from '../controllers/expenseController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getExpenses);
router.post('/', authorize('Farm Owner/Admin', 'Farm Manager'), createExpense);
router.put('/:id', authorize('Farm Owner/Admin', 'Farm Manager'), updateExpense);
router.delete('/:id', authorize('Farm Owner/Admin'), deleteExpense);

export default router;
