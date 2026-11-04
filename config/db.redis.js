const { createClient } = require('redis');
require('dotenv').config();

// Creación del cliente oficial de Redis usando variables de entorno
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
});

redisClient.on('error', (err) => {
  console.error('[Redis] Error en el cliente de Redis:', err.message);
});

redisClient.on('connect', () => {
  console.log('[Redis] Conectando al servidor Redis...');
});

redisClient.on('ready', () => {
  console.log('[Redis] Conexión establecida y lista para recibir comandos.');
});

/**
 * Inicializa la conexión asíncrona a Redis al arrancar el servidor Express.
 */
const initRedisDB = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error) {
    console.error('[Redis] No se pudo conectar a Redis:', error.message);
  }
};

module.exports = {
  redisClient,
  initRedisDB,
};
