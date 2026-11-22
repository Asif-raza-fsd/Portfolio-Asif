const mongoose = require('mongoose');

let isMemoryMode = false;

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri || mongoUri.trim() === '' || mongoUri.includes('demo:demo123')) {
    console.log('\x1b[33m%s\x1b[0m', '⚠️  No valid MONGO_URI provided in .env.');
    console.log('\x1b[36m%s\x1b[0m', '💡 Running with local persistent file/memory database for instant offline testing.');
    console.log('\x1b[32m%s\x1b[0m', '✅ For production (e.g. Render/Atlas), provide MONGO_URI in .env to connect to MongoDB Atlas.');
    isMemoryMode = true;
    return false;
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`\x1b[32m%s\x1b[0m`, `🚀 Connected to MongoDB: ${conn.connection.host}`);
    isMemoryMode = false;
    return true;
  } catch (err) {
    console.warn(`\x1b[31m%s\x1b[0m`, `⚠️  MongoDB connection failed: ${err.message}`);
    console.log(`\x1b[36m%s\x1b[0m`, `💡 Falling back to local data store so server remains fully operational.`);
    isMemoryMode = true;
    return false;
  }
};

const getIsMemoryMode = () => isMemoryMode;

module.exports = { connectDB, getIsMemoryMode };
