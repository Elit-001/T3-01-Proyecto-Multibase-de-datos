require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initPostgresDB } = require('./config/db.postgres');
const { initRedisDB } = require('./config/db.redis');
const { initMongoDB } = require('./config/db.mongo');

// Importación de rutas
const rolesRoutes = require('./routes/roles.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const cuponesRoutes = require('./routes/cupones.routes');
const productosRoutes = require('./routes/productos.routes');
const reviewsRoutes = require('./routes/reviews.routes');
const carritosRoutes = require('./routes/carritos.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// 1. Middlewares Globales
// ==========================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// 2. Ruta de Estado / Healthcheck
// ==========================================
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Web Service Multibase de Datos activo',
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// 3. Montaje de Rutas de Recursos
// ==========================================
// Motor 1: PostgreSQL (Relacional)
app.use('/api/roles', rolesRoutes);
app.use('/api/usuarios', usuariosRoutes);

// Motor 2: MongoDB (Documental)
app.use('/api/productos', productosRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/resenas', reviewsRoutes); // Alias en español

// Motor 3: Redis (Clave-Valor)
app.use('/api/cupones', cuponesRoutes);
app.use('/api/coupons', cuponesRoutes); // Alias en inglés
app.use('/api/carritos', carritosRoutes);
app.use('/api/carts', carritosRoutes); // Alias en inglés

// Manejo de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    path: req.originalUrl,
  });
});

// ==========================================
// 4. Inicio del Servidor y Conexiones a BD
// ==========================================
const startServer = async () => {
  await initPostgresDB();
  await initRedisDB();
  await initMongoDB();

  app.listen(PORT, () => {
    console.log(`[Server] Servidor escuchando en http://localhost:${PORT}`);
  });
};

if (require.main === module) {
  startServer();
}

module.exports = app;
