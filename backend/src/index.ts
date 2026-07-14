import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import flightRoutes from './routes/flights';
import bookingRoutes from './routes/bookings';
import employeeRoutes from './routes/employees';
import facilityRoutes from './routes/facilities';
import incidentRoutes from './routes/incidents';
import revenueRoutes from './routes/revenue';
import staffScheduleRoutes from './routes/staffSchedule';
import userRoutes from './routes/users';
import feedbackRoutes from './routes/feedback';
import customerRoutes from './routes/customers';
import inventoryRoutes from './routes/inventory';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/flights', flightRoutes);
app.use('/bookings', bookingRoutes);
app.use('/employees', employeeRoutes);
app.use('/facilities', facilityRoutes);
app.use('/incidents', incidentRoutes);
app.use('/revenue', revenueRoutes);
app.use('/staff_schedule', staffScheduleRoutes);
app.use('/staff', staffScheduleRoutes);
app.use('/users', userRoutes);
app.use('/feedback', feedbackRoutes);
app.use('/customers', customerRoutes);
app.use('/inventory', inventoryRoutes);

app.get('/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
