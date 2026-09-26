import express from 'express';
import { getFeedItems, createFeedItem, updateFeedItem, deleteFeedItem, logFeedConsumption, restockFeed } from '../controllers/feedController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getFeedItems);
router.post('/', authorize('Farm Owner/Admin', 'Farm Manager'), createFeedItem);
router.put('/:id', authorize('Farm Owner/Admin', 'Farm Manager'), updateFeedItem);
router.post('/:id/consume', logFeedConsumption);
router.post('/:id/restock', authorize('Farm Owner/Admin', 'Farm Manager'), restockFeed);
router.delete('/:id', authorize('Farm Owner/Admin'), deleteFeedItem);

export default router;
