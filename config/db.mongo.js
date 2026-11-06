const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommerce_db';

const initMongoDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('[MongoDB] Conexión establecida con éxito.');
  } catch (error) {
    console.error('[MongoDB] Error al conectar a la base de datos:', error.message);
  }
};

module.exports = {
  mongoose,
  initMongoDB,
};

