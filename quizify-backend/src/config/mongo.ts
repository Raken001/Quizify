import mongoose from 'mongoose';


/**
 * Connect to MongoDB
 * @returns {Promise<mongoose.Connection>} Mongoose connection instance
 */
export async function connectMongo(): Promise<mongoose.Connection> {
  // Support both MONGO_URI and MONGODB_URI for flexibility
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || "" 

  if (mongoose.connection.readyState === 1) {
    // already connected
    return mongoose.connection;
  }

  try {
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected:', uri);
    return mongoose.connection;
  } catch (err) {
    const error = err as Error;
    console.error('❌ MongoDB connection error:', error.message);
    throw err;
  }
}

/**
 * Disconnect from MongoDB
 */
export async function disconnectMongo(): Promise<void> {
  try {
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected');
  } catch (err) {
    const error = err as Error;
    console.error('❌ MongoDB disconnect error:', error.message);
    throw err;
  }
}
