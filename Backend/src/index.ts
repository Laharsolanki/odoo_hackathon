import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import authRoutes from './routes/auth';
import vehicleRoutes from './routes/vehicles';
import driverRoutes from './routes/drivers';
import tripRoutes from './routes/trips';
import maintenanceRoutes from './routes/maintenance';
import expenseRoutes from './routes/expenses';
import analyticsRoutes from './routes/analytics';
import reportRoutes from './routes/reports';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Base Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to TransitOps API' });
});

// API Routes
app.use('/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportRoutes);

// Global Error Handler
app.use(errorHandler);

app.listen(port, () => {
  console.log(`TransitOps API is running on port ${port}`);
});
