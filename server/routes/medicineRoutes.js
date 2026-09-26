import express from 'express';
import {
  getMedicines,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  getVaccinations,
  createVaccination,
  updateVaccination,
  getHealthRecords,
  createHealthRecord
} from '../controllers/medicineController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getMedicines);
router.post('/', authorize('Farm Owner/Admin', 'Farm Manager'), createMedicine);
router.put('/:id', authorize('Farm Owner/Admin', 'Farm Manager'), updateMedicine);
router.delete('/:id', authorize('Farm Owner/Admin'), deleteMedicine);

// Vaccinations
router.get('/vaccinations/list', getVaccinations);
router.post('/vaccinations/list', authorize('Farm Owner/Admin', 'Farm Manager'), createVaccination);
router.put('/vaccinations/list/:id', authorize('Farm Owner/Admin', 'Farm Manager'), updateVaccination);

// Health Records
router.get('/health/records', getHealthRecords);
router.post('/health/records', authorize('Farm Owner/Admin', 'Farm Manager'), createHealthRecord);

export default router;
