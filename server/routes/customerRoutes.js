import express from 'express';
import { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer } from '../controllers/customerController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getCustomers);
router.get('/:id', getCustomerById);
router.post('/', authorize('Farm Owner/Admin', 'Farm Manager'), createCustomer);
router.put('/:id', authorize('Farm Owner/Admin', 'Farm Manager'), updateCustomer);
router.delete('/:id', authorize('Farm Owner/Admin'), deleteCustomer);

export default router;
