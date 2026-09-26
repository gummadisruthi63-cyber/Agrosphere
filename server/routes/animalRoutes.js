import express from 'express';
import { getAnimals, getAnimalById, createAnimal, updateAnimal, deleteAnimal, getAnimalStats } from '../controllers/animalController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getAnimals);
router.get('/stats', getAnimalStats);
router.get('/:id', getAnimalById);
router.post('/', authorize('Farm Owner/Admin', 'Farm Manager'), createAnimal);
router.put('/:id', authorize('Farm Owner/Admin', 'Farm Manager'), updateAnimal);
router.delete('/:id', authorize('Farm Owner/Admin'), deleteAnimal);

export default router;
