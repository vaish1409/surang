const dns = require('dns');
const mongoose = require('mongoose');

dns.setServers(['1.1.1.1', '8.8.8.8']);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB connected: ${conn.connection.host} ✓`);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    console.error('The API is still running, but database-backed routes need a reachable MONGO_URI.');
  }
};

module.exports = connectDB;
