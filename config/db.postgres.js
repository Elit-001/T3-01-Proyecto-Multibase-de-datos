const { Pool } = require('pg');
require('dotenv').config();

// Configuración del Pool de conexiones a PostgreSQL usando variables de entorno
const pool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  port: process.env.PG_PORT || 5432,
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || 'postgres',
  database: process.env.PG_DATABASE || 'ecommerce_db',
});

/**
 * Script automático de inicialización de las tablas 'roles' y 'usuarios' en PostgreSQL.
 * También puedes ejecutar manualmente el archivo sql/init.sql en pgAdmin o psql:
 *
 * CREATE TABLE IF NOT EXISTS roles (
 *   id SERIAL PRIMARY KEY,
 *   nombre VARCHAR(100) NOT NULL,
 *   descripcion TEXT,
 *   is_deleted BOOLEAN NOT NULL DEFAULT FALSE
 * );
 *
 * CREATE TABLE IF NOT EXISTS usuarios (
 *   id SERIAL PRIMARY KEY,
 *   nombre VARCHAR(100) NOT NULL,
 *   email VARCHAR(150) UNIQUE NOT NULL,
 *   password VARCHAR(255) NOT NULL,
 *   rol_id INTEGER REFERENCES roles(id),
 *   is_deleted BOOLEAN NOT NULL DEFAULT FALSE
 * );
 */
const initPostgresDB = async () => {
  const createTablesQuery = `
    CREATE TABLE IF NOT EXISTS roles (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      descripcion TEXT,
      is_deleted BOOLEAN NOT NULL DEFAULT FALSE
    );

    CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      rol_id INTEGER REFERENCES roles(id),
      is_deleted BOOLEAN NOT NULL DEFAULT FALSE
    );
  `;

  try {
    await pool.query(createTablesQuery);
    console.log('[PostgreSQL] Conexión exitosa y tablas (roles, usuarios) verificadas.');
  } catch (error) {
    console.error('[PostgreSQL] Error al conectar o inicializar tablas:', error.message);
  }
};

module.exports = {
  pool,
  initPostgresDB,
};
