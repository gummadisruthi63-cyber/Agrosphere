import express from 'express';
import { getMilkRecords, recordMilk, getMilkStats, deleteMilkRecord } from '../controllers/milkController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getMilkRecords);
router.get('/stats', getMilkStats);
router.post('/', recordMilk);
router.delete('/:id', authorize('Farm Owner/Admin', 'Farm Manager'), deleteMilkRecord);

export default router;
