import express from 'express';
import { getInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem, adjustStock } from '../controllers/inventoryController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getInventory);
router.post('/', authorize('Farm Owner/Admin', 'Farm Manager'), createInventoryItem);
router.put('/:id', authorize('Farm Owner/Admin', 'Farm Manager'), updateInventoryItem);
router.post('/:id/adjust', authorize('Farm Owner/Admin', 'Farm Manager'), adjustStock);
router.delete('/:id', authorize('Farm Owner/Admin'), deleteInventoryItem);

export default router;
