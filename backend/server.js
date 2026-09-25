const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Initialize MongoDB connection
connectDB();

const app = express();

// Configure CORS
app.use(cors({
  origin: '*', // Local development friendly
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'BlogSphere API',
    timestamp: new Date().toISOString()
  });
});

// Mount API routes
app.use('/users', userRoutes);
app.use('/posts', postRoutes);

// 404 Handler for undefined API routes
app.use(notFoundHandler);

// Centralized error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[BlogSphere] Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`[BlogSphere] API Base: http://localhost:${PORT}`);
});

module.exports = { app, server };

