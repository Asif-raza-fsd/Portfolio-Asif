const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const dataStore = require('../dataStore');

// GET /api/settings - Public
router.get('/', async (req, res) => {
  try {
    const settings = await dataStore.getSettings();
    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve site settings' });
  }
});

// PUT /api/settings - Protected
router.put('/', authMiddleware, async (req, res) => {
  try {
    const updated = await dataStore.updateSettings(req.body);
    res.json({
      success: true,
      message: 'Site settings updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ success: false, message: 'Failed to update site settings' });
  }
});

module.exports = router;
