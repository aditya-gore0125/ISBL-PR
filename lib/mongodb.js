import mongoose from 'mongoose';

const { MONGODB_URI } = process.env;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const configuredDatabase = new URL(MONGODB_URI).pathname.replace(/^\/|\/$/g, '');
    cached.promise = mongoose.connect(MONGODB_URI, {
      ...(configuredDatabase ? {} : { dbName: 'jewelry-store' }),
      bufferCommands: false,
      autoIndex: process.env.NODE_ENV === 'development',
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    }).then((mongooseInstance) => mongooseInstance.connection);
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    throw error;
  }
}

export default connectToDatabase;
