// quizify-backend/mongo.js
import mongoose from 'mongoose';

const DEFAULT_URI = 'mongodb://127.0.0.1:27017/quizify';

export async function connectMongo() {
  const uri = process.env.MONGO_URI || DEFAULT_URI;

  if (mongoose.connection.readyState === 1) {
    // already connected
    return mongoose.connection;
  }

  try {
    await mongoose.connect(uri, {
      // options kept minimal; Mongoose v7+ doesn’t need much here
    });
    console.log('✅ Mongo connected:', uri);
    return mongoose.connection;
  } catch (err) {
    console.error('❌ Mongo connection error:', err.message);
    throw err;
  }
}
