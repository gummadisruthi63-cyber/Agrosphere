import express from 'express';
import { getSales, getSaleById, createSale, updateSale, deleteSale } from '../controllers/saleController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getSales);
router.get('/:id', getSaleById);
router.post('/', authorize('Farm Owner/Admin', 'Farm Manager'), createSale);
router.put('/:id', authorize('Farm Owner/Admin', 'Farm Manager'), updateSale);
router.delete('/:id', authorize('Farm Owner/Admin'), deleteSale);

export default router;
