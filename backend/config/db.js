const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState === 1) {
    return;
  }

  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/simple_task_tracker';

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2000,
    });
    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
  } catch (error) {
    console.log(`Local MongoDB connection failed (${error.message}).`);
    
    // Only attempt MongoMemoryServer if NOT running on Vercel Serverless platform
    if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongoServer = await MongoMemoryServer.create();
        const memoryUri = mongoServer.getUri();
        await mongoose.connect(memoryUri);
        isConnected = true;
        console.log(`InMemory MongoDB Connected`);
        return;
      } catch (memError) {
        console.error(`MongoMemoryServer failed: ${memError.message}`);
      }
    }
    
    console.warn(`Running in Serverless/Fallback mode without active MongoDB.`);
  }
};

module.exports = connectDB;
