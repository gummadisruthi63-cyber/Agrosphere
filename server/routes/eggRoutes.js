import express from 'express';
import { getEggRecords, recordEggs, getEggStats, deleteEggRecord } from '../controllers/eggController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getEggRecords);
router.get('/stats', getEggStats);
router.post('/', recordEggs);
router.delete('/:id', authorize('Farm Owner/Admin', 'Farm Manager'), deleteEggRecord);

export default router;
