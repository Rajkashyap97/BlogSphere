const mongoose = require('mongoose');

/**
 * Connects to MongoDB Atlas using the URI from environment variables.
 * Logs success host or exits process with failure code if connection fails.
 */
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri || mongoUri.includes('<username>') || mongoUri.includes('your_mongodb_atlas_connection_string')) {
      throw new Error('MONGO_URI in .env is missing or contains placeholder values. Please configure your actual MongoDB Atlas connection string in .env before starting the server.');
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`[BlogSphere] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[BlogSphere] Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
