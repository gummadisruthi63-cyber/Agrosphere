import express from 'express';
import { getUnifiedDashboard } from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getUnifiedDashboard);

export default router;
