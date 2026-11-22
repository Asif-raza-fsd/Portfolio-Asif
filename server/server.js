require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { connectDB } = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const colorGradeRoutes = require('./routes/colorGrades');
const settingsRoutes = require('./routes/settings');
const inquiryRoutes = require('./routes/inquiries');
const uploadRoutes = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middlewares
app.use(compression());
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows inline onclick/onchange handlers, iframes (YouTube/Vimeo), and external fonts
    crossOriginResourcePolicy: false, // Allows serving assets/images cross-origin
  })
);

// CORS configuration (Permissive for localhost, file://, and Netlify)
app.use(
  cors({
    origin: (origin, callback) => {
      // Always allow requests with no origin, null (file://), localhost, or any domain
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsing with 50MB limit to handle high-res color grading images, RAW frame grabs, & video thumbnails
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded assets
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Serve static client files
const clientDir = path.join(__dirname, '../client');
if (fs.existsSync(clientDir)) {
  app.use(express.static(clientDir));
}

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

// Disable caching on all API responses so updates are instant
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// API Routes
app.use('/api', (req, res, next) => next()); // pass-through
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/color-grades', colorGradeRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/upload', uploadRoutes);

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
