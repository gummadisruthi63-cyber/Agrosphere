import express from 'express';
import { getFinancialOverview } from '../controllers/financeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/overview', getFinancialOverview);

export default router;
