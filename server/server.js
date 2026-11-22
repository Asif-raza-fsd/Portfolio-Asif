require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { connectDB } = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const colorGradeRoutes = require('./routes/colorGrades');
const settingsRoutes = require('./routes/settings');
const inquiryRoutes = require('./routes/inquiries');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: false, // allows serving assets/images cross-origin
  })
);

// Dynamic CORS configuration
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((url) => url.trim())
  : ['http://localhost:3000', 'http://127.0.0.1:5500', 'http://localhost:5000', 'http://localhost:8080'];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.netlify.app') ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1')
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev/staging to avoid CORS frustration
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static client files
const clientDir = path.join(__dirname, '../client');
app.use(express.static(clientDir));

// Clean route for admin panel
app.get('/admin', (req, res) => {
  res.sendFile(path.join(clientDir, 'admin.html'));
});

// Health check endpoint (for Render / uptime monitoring)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Asif Raza Portfolio Backend API',
    version: '1.0.0',
    database: require('mongoose').connection.readyState === 1 ? 'MongoDB Atlas Connected' : 'Local Standalone Store',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/color-grades', colorGradeRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/inquiries', inquiryRoutes);

// API Documentation / root directory
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to the Asif Raza Portfolio API.',
    health: '/api/health',
    endpoints: {
      projects: '/api/projects',
      colorGrades: '/api/color-grades',
      settings: '/api/settings',
      inquiries: '/api/inquiries',
      auth: '/api/auth/login',
    },
  });
});

// Root fallback (serves index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(clientDir, 'index.html'));
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Start Server & Connect to DB when run directly
async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🎬 Asif Raza Portfolio Server Running!`);
    console.log(`🌐 Local URL: http://localhost:${PORT}`);
    console.log(`🩺 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`======================================================\n`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = { app, connectDB };
