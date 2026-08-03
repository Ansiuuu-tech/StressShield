import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { ZodError } from 'zod';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.js';
import wellnessRoutes from './routes/wellness.routes.js';
import appointmentRoutes from './routes/appointment.routes.js';
import aiRoutes from './routes/ai.routes.js';
import adminRoutes from './routes/admin.routes.js';
import supportRoutes from './routes/support.routes.js';

dotenv.config();

const app = express();
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(morgan('dev'));

// Rate limiters
const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 15, message: { message: 'Too many authentication attempts. Please try again later.' } });
const aiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 60, message: { message: 'AI request limit reached. Please wait a few minutes.' } });

app.use('/api', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/ai/chat', aiLimiter);

app.get('/api/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.use('/api/auth', authRoutes);
app.use('/api/wellness', wellnessRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/support', supportRoutes);

app.use((error, req, res, next) => {
  if (error instanceof ZodError) {
    return res.status(400).json({ message: 'Please check the submitted information.', issues: error.flatten() });
  }
  if (error.code === 'P2002') {
    return res.status(409).json({ message: 'That value is already in use.' });
  }
  console.error(error);
  res.status(error.status || 500).json({ message: error.message || 'Something went wrong.' });
});

export default app;