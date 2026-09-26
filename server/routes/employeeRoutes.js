import express from 'express';
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getAttendance,
  markAttendance,
  addTaskToEmployee,
  toggleTaskStatus
} from '../controllers/employeeController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getEmployees);
router.post('/', authorize('Farm Owner/Admin', 'Farm Manager'), createEmployee);
router.put('/:id', authorize('Farm Owner/Admin', 'Farm Manager'), updateEmployee);
router.delete('/:id', authorize('Farm Owner/Admin'), deleteEmployee);

// Attendance
router.get('/attendance/records', getAttendance);
router.post('/attendance/records', markAttendance);

// Tasks
router.post('/:id/tasks', authorize('Farm Owner/Admin', 'Farm Manager'), addTaskToEmployee);
router.patch('/:employeeId/tasks/:taskId/toggle', toggleTaskStatus);

export default router;
