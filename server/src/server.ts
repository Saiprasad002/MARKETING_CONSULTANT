import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';

import { initDatabase } from './db/init';
import authRoutes from './routes/auth';
import companyRoutes from './routes/company';
import profileRoutes from './routes/profile';
import chatRoutes from './routes/chat';
import documentRoutes from './routes/documents';
import analyticsRoutes from './routes/analytics';
import conflictRoutes from './routes/conflicts';

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads folder
app.use('/uploads', express.static(path.resolve(__dirname, '../../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/conflicts', conflictRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global Server Error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// Initialize DB and start server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`AI Marketing Consultant Backend Server listening on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to start server due to DB initialization error:', err);
});
