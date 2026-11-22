const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const Project = require('./models/Project');
const ColorGrade = require('./models/ColorGrade');
const SiteSettings = require('./models/SiteSettings');
const Inquiry = require('./models/Inquiry');

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'local-db.json');

// Default initial dataset for offline/memory mode
const defaultData = {
  projects: [
    {
      _id: '674001a1b2c3d4e5f6000001',
      title: 'Cinematic Fashion Reel 2026',
      category: 'reels',
      description: 'High-energy luxury brand promotional reel with dynamic sound design, speed ramping, and custom color grading.',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      thumbnailUrl: 'assets/images/thumb-1.jpg',
      clientMetric: '3.8M Views',
      featured: true,
      tags: ['Reels', 'Fashion', 'Speed Ramping'],
      order: 1,
      createdAt: new Date().toISOString(),
    },
    {
      _id: '674001a1b2c3d4e5f6000002',
      title: 'Cyberpunk Tokyo - Color Grade & Look Dev',
      category: 'color-grading',
      description: 'Custom look development and film print emulation in DaVinci Resolve Studio using ACEScc color management.',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      thumbnailUrl: 'assets/images/thumb-2.jpg',
      clientMetric: 'DaVinci Resolve ACES',
      featured: true,
      tags: ['Color Grading', 'ACES', 'DaVinci Resolve'],
      order: 2,
      createdAt: new Date().toISOString(),
    },
    {
      _id: '674001a1b2c3d4e5f6000003',
      title: 'Tech Founder Documentary / YouTube Long-Form',
      category: 'commercial',
      description: '45-minute documentary cut with multi-cam sync, A-roll pacing, narrative arc, and Foley audio sweetening.',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      thumbnailUrl: 'assets/images/thumb-3.jpg',
      clientMetric: '1.2M YouTube Views',
      featured: true,
      tags: ['YouTube', 'Storytelling', 'Documentary'],
      order: 3,
      createdAt: new Date().toISOString(),
    },
    {
      _id: '674001a1b2c3d4e5f6000004',
      title: 'Fitness Brand Commercial Campaign',
      category: 'commercial',
      description: 'High octane commercial ad cut with rhythm editing, bass drops, sound effects, and color pass in Rec.709.',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      thumbnailUrl: 'assets/images/thumb-4.jpg',
      clientMetric: 'Brand Ad Campaign',
      featured: false,
      tags: ['Commercial', 'Sound Design'],
      order: 4,
      createdAt: new Date().toISOString(),
    },
    {
      _id: '674001a1b2c3d4e5f6000005',
      title: 'Viral Creator Short Series (60s)',
      category: 'reels',
      description: 'Punchy motion graphics, animated subtitles, seamless zoom transitions, and 85% retention rate editing.',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      thumbnailUrl: 'assets/images/thumb-5.jpg',
      clientMetric: '85% Retention Rate',
      featured: false,
      tags: ['Shorts', 'Viral Editing'],
      order: 5,
      createdAt: new Date().toISOString(),
    },
    {
      _id: '674001a1b2c3d4e5f6000006',
      title: 'Moody Narrative Short Film - Shot Matching',
      category: 'color-grading',
      description: 'Full shot-to-shot balance, skin tone qualifier isolation, highlight roll-off, and Kodak 2383 emulation.',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      thumbnailUrl: 'assets/images/thumb-6.jpg',
      clientMetric: 'Film Fest Selection',
      featured: false,
      tags: ['Short Film', 'Kodak 2383'],
      order: 6,
      createdAt: new Date().toISOString(),
    },
  ],
  colorGrades: [
    {
      _id: '674002a1b2c3d4e5f6000001',
      title: 'Moody Night City - Golden Glow & Deep Teal',
      description: 'Transforms flat Sony S-Log3 footage into a high-contrast cinematic night aesthetic with balanced highlights and deep shadows.',
      beforeImageUrl: 'assets/images/before-grade-1.jpg',
      afterImageUrl: 'assets/images/after-grade-1.jpg',
      camera: 'Sony FX3 (S-Log3 / S-Gamut3.Cine)',
      colorSpace: 'DaVinci Wide Gamut Intermediate to Rec.709',
      notes: 'Custom tone curve, saturated sodium streetlamp separation, and soft skin tone highlights.',
      featured: true,
      order: 1,
      createdAt: new Date().toISOString(),
    },
    {
      _id: '674002a1b2c3d4e5f6000002',
      title: 'Desert Cinematic - Warm Sun & Film Texture',
      description: 'Graded in ACEScc from ARRI LogC3. Film grain emulation, gentle highlight halation, and rich golden hour tones.',
      beforeImageUrl: 'assets/images/before-grade-2.jpg',
      afterImageUrl: 'assets/images/after-grade-2.jpg',
      camera: 'ARRI Alexa Mini (ARRI LogC3)',
      colorSpace: 'ACEScc / Output Rec.709 2.4',
      notes: 'Kodak 5207 film emulation, rich desert warmth, split-toning in shadows.',
      featured: true,
      order: 2,
      createdAt: new Date().toISOString(),
    },
  ],
  settings: {
    heroIntro: '',
    heroName: 'Asif Raza',
    heroTitle: 'Video Editor & Colorist',
    heroPortraitUrl: 'assets/images/hero-portrait.png',
    heroBio: 'Specializing in high-retention short-form reels, documentary YouTube editing, and cinematic color grading in DaVinci Resolve Studio.',
    cvUrl: 'assets/docs/asif-raza-resume.pdf',
    experienceYears: '2+',
    projectsDone: '50+',
    happyClients: '20+',
    socialLinks: {
      instagram: 'https://instagram.com',
    },
    contactEmail: 'asif.r2108@gmail.com',
    contactPhone: '+918707312326',
    location: '',
  },
  inquiries: [
    {
      _id: '674003a1b2c3d4e5f6000001',
      name: 'Sarah Jenkins',
      email: 'sarah@creatorstudios.co',
      projectType: 'Short-form Reels / Shorts',
      budget: '$1,000 - $3,000',
      message: 'Looking for a dedicated video editor for a 30-day Instagram Reels batch campaign. Need fast turnarounds and snappy captions.',
      status: 'new',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      _id: '674003a1b2c3d4e5f6000002',
      name: 'Marcus Vance',
      email: 'marcus@vancefilms.com',
      projectType: 'Color Grading Only',
      budget: '$2,500+',
      message: 'Shot an indie commercial on RED Komodo. Need professional look dev and shot matching across 18 scenes in DaVinci Resolve.',
      status: 'replied',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
  ],
};

function ensureLocalData() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2), 'utf8');
    }
  } catch (e) {
    console.error('Error initializing local data file:', e);
  }
}

function readLocalData() {
  ensureLocalData();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return defaultData;
  }
}

function writeLocalData(data) {
  ensureLocalData();
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing local data file:', e);
  }
}

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

// ----------------- PROJECTS -----------------
async function getProjects(filter = {}) {
  if (isDbConnected()) {
    const query = {};
    if (filter.category && filter.category !== 'all') {
      query.category = filter.category;
    }
    if (filter.featured === 'true' || filter.featured === true) {
      query.featured = true;
    }
    return await Project.find(query).sort({ order: 1, createdAt: -1 });
  } else {
    let list = readLocalData().projects || [];
    if (filter.category && filter.category !== 'all') {
      list = list.filter((p) => p.category === filter.category);
    }
    if (filter.featured === 'true' || filter.featured === true) {
      list = list.filter((p) => p.featured === true);
    }
    return list.sort((a, b) => (a.order || 0) - (b.order || 0));
  }
}

async function getProjectById(id) {
  if (isDbConnected()) {
    return await Project.findById(id);
  } else {
    const list = readLocalData().projects || [];
    return list.find((p) => String(p._id) === String(id)) || null;
  }
}

async function createProject(data) {
  if (isDbConnected()) {
    return await Project.create(data);
  } else {
    const store = readLocalData();
    const newDoc = {
      _id: new mongoose.Types.ObjectId().toString(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.projects.unshift(newDoc);
    writeLocalData(store);
    return newDoc;
  }
}

async function updateProject(id, data) {
  if (isDbConnected()) {
    return await Project.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  } else {
    const store = readLocalData();
    const idx = store.projects.findIndex((p) => String(p._id) === String(id));
    if (idx === -1) return null;
    store.projects[idx] = {
      ...store.projects[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    writeLocalData(store);
    return store.projects[idx];
  }
}

async function deleteProject(id) {
  if (isDbConnected()) {
    return await Project.findByIdAndDelete(id);
  } else {
    const store = readLocalData();
    const idx = store.projects.findIndex((p) => String(p._id) === String(id));
    if (idx === -1) return null;
    const [deleted] = store.projects.splice(idx, 1);
    writeLocalData(store);
    return deleted;
  }
}

// ----------------- COLOR GRADES -----------------
async function getColorGrades() {
  if (isDbConnected()) {
    return await ColorGrade.find().sort({ order: 1, createdAt: -1 });
  } else {
    const list = readLocalData().colorGrades || [];
    return list.sort((a, b) => (a.order || 0) - (b.order || 0));
  }
}

async function getColorGradeById(id) {
  if (isDbConnected()) {
    return await ColorGrade.findById(id);
  } else {
    const list = readLocalData().colorGrades || [];
    return list.find((c) => String(c._id) === String(id)) || null;
  }
}

async function createColorGrade(data) {
  if (isDbConnected()) {
    return await ColorGrade.create(data);
  } else {
    const store = readLocalData();
    const newDoc = {
      _id: new mongoose.Types.ObjectId().toString(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.colorGrades.unshift(newDoc);
    writeLocalData(store);
    return newDoc;
  }
}

async function updateColorGrade(id, data) {
  if (isDbConnected()) {
    return await ColorGrade.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  } else {
    const store = readLocalData();
    const idx = store.colorGrades.findIndex((c) => String(c._id) === String(id));
    if (idx === -1) return null;
    store.colorGrades[idx] = {
      ...store.colorGrades[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    writeLocalData(store);
    return store.colorGrades[idx];
  }
}

async function deleteColorGrade(id) {
  if (isDbConnected()) {
    return await ColorGrade.findByIdAndDelete(id);
  } else {
    const store = readLocalData();
    const idx = store.colorGrades.findIndex((c) => String(c._id) === String(id));
    if (idx === -1) return null;
    const [deleted] = store.colorGrades.splice(idx, 1);
    writeLocalData(store);
    return deleted;
  }
}

// ----------------- SETTINGS -----------------
async function getSettings() {
  if (isDbConnected()) {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create(defaultData.settings);
    }
    return settings;
  } else {
    const store = readLocalData();
    return store.settings || defaultData.settings;
  }
}

async function updateSettings(data) {
  if (isDbConnected()) {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create(data);
    } else {
      Object.assign(settings, data);
      await settings.save();
    }
    return settings;
  } else {
    const store = readLocalData();
    store.settings = { ...store.settings, ...data, updatedAt: new Date().toISOString() };
    writeLocalData(store);
    return store.settings;
  }
}

// ----------------- INQUIRIES -----------------
async function getInquiries() {
  if (isDbConnected()) {
    return await Inquiry.find().sort({ createdAt: -1 });
  } else {
    const list = readLocalData().inquiries || [];
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}

async function createInquiry(data) {
  if (isDbConnected()) {
    return await Inquiry.create(data);
  } else {
    const store = readLocalData();
    const newDoc = {
      _id: new mongoose.Types.ObjectId().toString(),
      ...data,
      status: 'new',
      createdAt: new Date().toISOString(),
    };
    store.inquiries.unshift(newDoc);
    writeLocalData(store);
    return newDoc;
  }
}

async function updateInquiry(id, data) {
  if (isDbConnected()) {
    return await Inquiry.findByIdAndUpdate(id, data, { new: true });
  } else {
    const store = readLocalData();
    const idx = store.inquiries.findIndex((i) => String(i._id) === String(id));
    if (idx === -1) return null;
    store.inquiries[idx] = {
      ...store.inquiries[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    writeLocalData(store);
    return store.inquiries[idx];
  }
}

async function deleteInquiry(id) {
  if (isDbConnected()) {
    return await Inquiry.findByIdAndDelete(id);
  } else {
    const store = readLocalData();
    const idx = store.inquiries.findIndex((i) => String(i._id) === String(id));
    if (idx === -1) return null;
    const [deleted] = store.inquiries.splice(idx, 1);
    writeLocalData(store);
    return deleted;
  }
}

module.exports = {
  defaultData,
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getColorGrades,
  getColorGradeById,
  createColorGrade,
  updateColorGrade,
  deleteColorGrade,
  getSettings,
  updateSettings,
  getInquiries,
  createInquiry,
  updateInquiry,
  deleteInquiry,
};
