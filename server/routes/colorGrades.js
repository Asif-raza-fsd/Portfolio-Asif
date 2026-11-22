const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const dataStore = require('../dataStore');

// GET /api/color-grades - Public
router.get('/', async (req, res) => {
  try {
    const comparisons = await dataStore.getColorGrades();
    res.json({
      success: true,
      count: comparisons.length,
      data: comparisons,
    });
  } catch (error) {
    console.error('Error fetching color grades:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve color grades' });
  }
});

// GET /api/color-grades/:id - Public
router.get('/:id', async (req, res) => {
  try {
    const item = await dataStore.getColorGradeById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Comparison not found' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving comparison' });
  }
});

// POST /api/color-grades - Protected
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, beforeImageUrl, afterImageUrl, camera, colorSpace, notes, featured, order } = req.body;
    if (!title || !beforeImageUrl || !afterImageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Title, Before Image URL, and After Image URL are required.',
      });
    }

    const newItem = await dataStore.createColorGrade({
      title,
      description: description || '',
      beforeImageUrl,
      afterImageUrl,
      camera: camera || 'DaVinci Resolve Studio',
      colorSpace: colorSpace || 'ACEScc / Rec.709',
      notes: notes || 'Film emulation and shot matching',
      featured: featured !== undefined ? Boolean(featured) : true,
      order: Number(order) || 0,
    });

    res.status(201).json({
      success: true,
      message: 'Color grade comparison created successfully',
      data: newItem,
    });
  } catch (error) {
    console.error('Error creating color grade:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create color grade' });
  }
});

// PUT /api/color-grades/:id - Protected
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const updated = await dataStore.updateColorGrade(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Comparison not found' });
    }
    res.json({
      success: true,
      message: 'Color grade comparison updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating color grade:', error);
    res.status(500).json({ success: false, message: 'Failed to update comparison' });
  }
});

// DELETE /api/color-grades/:id - Protected
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await dataStore.deleteColorGrade(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Comparison not found' });
    }
    res.json({
      success: true,
      message: 'Color grade comparison deleted successfully',
      data: deleted,
    });
  } catch (error) {
    console.error('Error deleting color grade:', error);
    res.status(500).json({ success: false, message: 'Failed to delete comparison' });
  }
});

module.exports = router;
