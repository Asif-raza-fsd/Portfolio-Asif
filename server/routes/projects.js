const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const dataStore = require('../dataStore');

// GET /api/projects - Public
router.get('/', async (req, res) => {
  try {
    const { category, featured } = req.query;
    const projects = await dataStore.getProjects({ category, featured });
    res.json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve projects' });
  }
});

// GET /api/projects/:id - Public
router.get('/:id', async (req, res) => {
  try {
    const project = await dataStore.getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving project' });
  }
});

function getAutoThumbnail(videoUrl, category = 'reels') {
  if (!videoUrl) return 'assets/images/thumb-1.jpg';
  const ytMatch = String(videoUrl).match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return `https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg`;
  }
  const vimeoMatch = String(videoUrl).match(/vimeo\.com\/(?:video\/)?([0-9]+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://vumbnail.com/${vimeoMatch[1]}.jpg`;
  }
  const cat = String(category || '').toLowerCase();
  if (cat.includes('reel') || cat.includes('short')) return 'assets/images/thumb-1.jpg';
  if (cat.includes('color')) return 'assets/images/thumb-2.jpg';
  if (cat.includes('commercial') || cat.includes('youtube')) return 'assets/images/thumb-3.jpg';
  return 'assets/images/thumb-4.jpg';
}

// POST /api/projects - Protected
router.post('/', authMiddleware, async (req, res) => {
  try {
    let { title, category, description, videoUrl, thumbnailUrl, clientMetric, featured, tags, order } = req.body;
    if (!title || !videoUrl) {
      return res.status(400).json({
        success: false,
        message: 'Title and Video URL are required fields.',
      });
    }

    if (!thumbnailUrl || !thumbnailUrl.trim()) {
      thumbnailUrl = getAutoThumbnail(videoUrl, category);
    }

    const newProject = await dataStore.createProject({
      title,
      category: category || 'reels',
      description: description || '',
      videoUrl,
      thumbnailUrl,
      clientMetric: clientMetric || 'Featured Edit',
      featured: featured === true || featured === 'true',
      tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : [],
      order: Number(order) || 0,
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: newProject,
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create project' });
  }
});

// PUT /api/projects/:id - Protected
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.body.videoUrl && (!req.body.thumbnailUrl || !req.body.thumbnailUrl.trim())) {
      req.body.thumbnailUrl = getAutoThumbnail(req.body.videoUrl, req.body.category);
    }
    const updated = await dataStore.updateProject(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    res.json({
      success: true,
      message: 'Project updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ success: false, message: 'Failed to update project' });
  }
});

// DELETE /api/projects/:id - Protected
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await dataStore.deleteProject(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    res.json({
      success: true,
      message: 'Project deleted successfully',
      data: deleted,
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ success: false, message: 'Failed to delete project' });
  }
});

module.exports = router;
