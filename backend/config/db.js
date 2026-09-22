const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/simple_task_tracker';

  try {
    // Attempt standard connection with 2.5s timeout
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
  } catch (error) {
    console.log(`Local MongoDB connection failed (${error.message}). Starting Mongo Memory Server fallback...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const memoryUri = mongoServer.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`InMemory MongoDB Connected: ${conn.connection.host}:${conn.connection.port}`);
    } catch (memError) {
      console.error(`Failed to start Mongo Memory Server: ${memError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
