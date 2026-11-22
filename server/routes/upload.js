const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/auth');

const UPLOADS_DIR = path.join(__dirname, '../../client/assets/uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e6);
    cb(null, uniqueSuffix + '-' + cleanName);
  },
});

// File filter for images, videos, and PDFs
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'image/gif',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'application/pdf',
  ];

  if (allowedMimes.includes(file.mimetype) || file.originalname.match(/\.(jpg|jpeg|png|webp|svg|gif|mp4|webm|mov|pdf)$/i)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type. Please upload an image (JPG, PNG, WebP, SVG), video (MP4, WebM, MOV), or PDF document.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB max limit
  },
  fileFilter: fileFilter,
});

// POST /api/upload - Protected single file upload
router.post('/', authMiddleware, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file received. Please select an image or video to upload.',
      });
    }

    const relativeUrl = `assets/uploads/${req.file.filename}`;

    res.json({
      success: true,
      message: 'File uploaded successfully!',
      url: relativeUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'File upload failed',
    });
  }
});

module.exports = router;
