require('dotenv').config();
const mongoose = require('mongoose');
const Project = require('./models/Project');
const ColorGrade = require('./models/ColorGrade');
const SiteSettings = require('./models/SiteSettings');
const Inquiry = require('./models/Inquiry');
const { defaultData } = require('./dataStore');

async function seedDatabase() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri || mongoUri.trim() === '' || mongoUri.includes('demo:demo123')) {
    console.log('\x1b[33m%s\x1b[0m', 'Notice: No MONGO_URI set in .env. Seeding local-db.json instead.');
    const fs = require('fs');
    const path = require('path');
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(path.join(dataDir, 'local-db.json'), JSON.stringify(defaultData, null, 2), 'utf8');
    console.log('\x1b[32m%s\x1b[0m', '✅ Local data store seeded successfully with realistic projects & comparisons!');
    process.exit(0);
  }

  try {
    console.log('Connecting to MongoDB Atlas at:', mongoUri);
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB Atlas.');

    console.log('Clearing existing records...');
    await Project.deleteMany({});
    await ColorGrade.deleteMany({});
    await SiteSettings.deleteMany({});
    await Inquiry.deleteMany({});

    console.log('Inserting seed projects...');
    await Project.insertMany(defaultData.projects.map(({ _id, ...rest }) => rest));

    console.log('Inserting seed color grade comparisons...');
    await ColorGrade.insertMany(defaultData.colorGrades.map(({ _id, ...rest }) => rest));

    console.log('Inserting default site settings...');
    await SiteSettings.create(defaultData.settings);

    console.log('Inserting sample inquiries...');
    await Inquiry.insertMany(defaultData.inquiries.map(({ _id, ...rest }) => rest));

    console.log('\x1b[32m%s\x1b[0m', '🎉 MongoDB Atlas successfully populated with complete portfolio seed data!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during database seeding:', error);
    process.exit(1);
  }
}

seedDatabase();
