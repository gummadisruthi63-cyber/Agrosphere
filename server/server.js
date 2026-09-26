import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import User from './models/User.js';
import { seedDatabase } from './seed/seedData.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import farmRoutes from './routes/farmRoutes.js';
import animalRoutes from './routes/animalRoutes.js';
import poultryRoutes from './routes/poultryRoutes.js';
import milkRoutes from './routes/milkRoutes.js';
import eggRoutes from './routes/eggRoutes.js';
import feedRoutes from './routes/feedRoutes.js';
import medicineRoutes from './routes/medicineRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import saleRoutes from './routes/saleRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import financeRoutes from './routes/financeRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import settingRoutes from './routes/settingRoutes.js';

dotenv.config();

const app = express();

// Connect to Database
await connectDB();

// Auto-seed if database is empty
try {
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    console.log('[AgroSphere] First run detected: Seeding realistic farm demo data...');
    await seedDatabase();
  }
} catch (seedErr) {
  console.error('[AgroSphere] Auto-seed check failed:', seedErr.message);
}

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'AgroSphere Unified Farm Business Platform',
    timestamp: new Date().toISOString()
  });
});

// Seed API endpoint (useful for demo button or testing reset)
app.post('/api/seed/reset', async (req, res) => {
  try {
    await seedDatabase();
    res.json({ success: true, message: 'Database reset and re-seeded with demo data successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/farm', farmRoutes);
app.use('/api/animals', animalRoutes);
app.use('/api/poultry', poultryRoutes);
app.use('/api/milk-production', milkRoutes);
app.use('/api/egg-production', eggRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingRoutes);

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[AgroSphere Server] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
