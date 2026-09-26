import express from 'express';
import { getBatches, getBatchById, createBatch, updateBatch, deleteBatch, recordMortality } from '../controllers/poultryController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getBatches);
router.get('/:id', getBatchById);
router.post('/', authorize('Farm Owner/Admin', 'Farm Manager'), createBatch);
router.put('/:id', authorize('Farm Owner/Admin', 'Farm Manager'), updateBatch);
router.post('/:id/mortality', recordMortality);
router.delete('/:id', authorize('Farm Owner/Admin'), deleteBatch);

export default router;
