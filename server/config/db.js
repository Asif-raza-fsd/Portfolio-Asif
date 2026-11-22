const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  // If a valid MongoDB Atlas URI is provided
  if (mongoUri && mongoUri.trim() !== '' && !mongoUri.includes('demo:demo123')) {
    try {
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`\x1b[32m%s\x1b[0m`, `🚀 Connected to MongoDB Atlas: ${conn.connection.host}`);
      isConnected = true;
      return true;
    } catch (err) {
      console.warn(`\x1b[31m%s\x1b[0m`, `⚠️  MongoDB Atlas connection failed: ${err.message}`);
    }
  }

  // Local persistent development database
  console.log('\x1b[36m%s\x1b[0m', '💡 Running with local persistent database (server/data/local-db.json).');
  console.log('\x1b[32m%s\x1b[0m', '✅ All admin edits, projects, settings, and inquiries persist automatically.');
  console.log('\x1b[33m%s\x1b[0m', '📌 To connect MongoDB Atlas in production, set MONGO_URI in your .env or Render dashboard.');
  isConnected = false;
  return false;
};

const getIsConnected = () => isConnected;

module.exports = { connectDB, getIsConnected };
