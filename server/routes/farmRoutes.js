import express from 'express';
import { getFarmProfile, updateFarmProfile, getSheds, createShed, updateShed, deleteShed } from '../controllers/farmController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/profile', getFarmProfile);
router.put('/profile', authorize('Farm Owner/Admin'), updateFarmProfile);

router.get('/sheds', getSheds);
router.post('/sheds', authorize('Farm Owner/Admin', 'Farm Manager'), createShed);
router.put('/sheds/:id', authorize('Farm Owner/Admin', 'Farm Manager'), updateShed);
router.delete('/sheds/:id', authorize('Farm Owner/Admin'), deleteShed);

export default router;
