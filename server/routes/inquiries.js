const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const dataStore = require('../dataStore');

// POST /api/inquiries - Public (Client inquiry form submission)
router.post('/', async (req, res) => {
  try {
    const { name, email, projectType, budget, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and project details are required.',
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    const newInquiry = await dataStore.createInquiry({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      projectType: projectType || 'Short-form Reels / Shorts',
      budget: budget || 'Flexible',
      message: message.trim(),
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your inquiry has been sent to Asif Raza. He will respond within 24 hours.',
      data: {
        id: newInquiry._id,
        createdAt: newInquiry.createdAt,
      },
    });
  } catch (error) {
    console.error('Error creating inquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Could not submit your inquiry at this moment. Please try again or reach out directly.',
    });
  }
});

// GET /api/inquiries - Protected
router.get('/', authMiddleware, async (req, res) => {
  try {
    const inquiries = await dataStore.getInquiries();
    res.json({
      success: true,
      count: inquiries.length,
      data: inquiries,
    });
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve inquiries' });
  }
});

// PUT /api/inquiries/:id - Protected (Update status)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['new', 'read', 'replied'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const updated = await dataStore.updateInquiry(req.params.id, { status });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    res.json({
      success: true,
      message: 'Inquiry status updated',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating inquiry:', error);
    res.status(500).json({ success: false, message: 'Failed to update inquiry' });
  }
});

// DELETE /api/inquiries/:id - Protected
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await dataStore.deleteInquiry(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }
    res.json({
      success: true,
      message: 'Inquiry deleted successfully',
      data: deleted,
    });
  } catch (error) {
    console.error('Error deleting inquiry:', error);
    res.status(500).json({ success: false, message: 'Failed to delete inquiry' });
  }
});

module.exports = router;
