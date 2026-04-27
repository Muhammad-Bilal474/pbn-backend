import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import authRoutes from './src/routes/authRoutes.js';
import sheetRoutes from './src/routes/sheetRoutes.js';
import postRoutes from './src/routes/postRoutes.js';
import { errorHandler, notFoundHandler } from './src/middleware/errorHandler.js';
import User from './src/models/User.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Connect to Database
connectDB();

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/sheets', sheetRoutes);
app.use('/api/v1/posts', postRoutes);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);


// Initialize Admin on Startup
const initializeAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'SUPER_ADMIN' });
    if (!adminExists) {
      console.log('⚡ Initializing Default Super Admin...');
      await User.create({
        name: 'Super Admin',
        email: 'admin@pbn.com',
        password: 'admin123',
        role: 'SUPER_ADMIN',
      });
      console.log('✅ Default Admin Created: admin@pbn.com / admin123');

    }
  } catch (error) {
    console.error('❌ Failed to initialize admin:', error.message);
  }
};

// Start Server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  await initializeAdmin();
});



export default app;
