const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  let mongoUri = process.env.MONGO_URI;

  // Clean URI if user accidentally left < > brackets
  if (mongoUri) {
    mongoUri = mongoUri.replace('<', '').replace('>', '');
  }

  // If a MongoDB Atlas URI is provided
  if (mongoUri && mongoUri.trim() !== '' && !mongoUri.includes('demo:demo123')) {
    try {
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`\x1b[32m%s\x1b[0m`, `🚀 Connected to MongoDB Atlas: ${conn.connection.host}`);
      isConnected = true;

      // Check if Atlas database needs initial seed data
      try {
        const Project = require('../models/Project');
        const ColorGrade = require('../models/ColorGrade');
        const SiteSettings = require('../models/SiteSettings');
        const Inquiry = require('../models/Inquiry');
        const { defaultData } = require('../dataStore');

        const count = await Project.countDocuments();
        if (count === 0) {
          console.log('\x1b[36m%s\x1b[0m', '🌱 Initializing empty MongoDB Atlas collections with seed data...');
          await Project.insertMany(defaultData.projects.map(({ _id, ...rest }) => rest));
          await ColorGrade.insertMany(defaultData.colorGrades.map(({ _id, ...rest }) => rest));
          await SiteSettings.create(defaultData.settings);
          await Inquiry.insertMany(defaultData.inquiries.map(({ _id, ...rest }) => rest));
          console.log('\x1b[32m%s\x1b[0m', '✅ MongoDB Atlas collections seeded successfully!');
        }
      } catch (seedErr) {
        console.warn('Atlas seed check notice:', seedErr.message);
      }

      return true;
    } catch (err) {
      console.warn(`\x1b[31m%s\x1b[0m`, `⚠️  MongoDB Atlas connection failed: ${err.message}`);
      console.log('\x1b[33m%s\x1b[0m', '👉 Check your MongoDB Atlas password and ensure IP 0.0.0.0/0 is allowed in Network Access.');
    }
  }

  // Local persistent development database fallback
  console.log('\x1b[36m%s\x1b[0m', '💡 Running with local persistent database (server/data/local-db.json).');
  console.log('\x1b[32m%s\x1b[0m', '✅ All admin edits, projects, settings, and inquiries persist automatically.');
  isConnected = false;
  return false;
};

const getIsConnected = () => isConnected;

module.exports = { connectDB, getIsConnected };
