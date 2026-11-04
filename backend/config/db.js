const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jk_motel';

  try {
    const conn = await mongoose.connect(uri, {
      dbName: process.env.DB_NAME || 'jk_motel',
      serverSelectionTimeoutMS: 5000
    });
    console.log(`[MongoDB Atlas] Successfully connected to database "${conn.connection.name}" at ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Connection Error] ${error.message}`);
    console.error(`  -> Please check MONGODB_URI in backend/.env`);
    console.error(`  -> If using MongoDB Atlas, ensure your IP address is whitelisted in Network Access.`);
    return null;
  }
};

module.exports = {
  connectDB
};
