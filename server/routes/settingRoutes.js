import express from 'express';
import { getSettings, updateSettings, changePassword } from '../controllers/settingController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getSettings);
router.put('/', authorize('Farm Owner/Admin'), updateSettings);
router.post('/change-password', changePassword);

export default router;
