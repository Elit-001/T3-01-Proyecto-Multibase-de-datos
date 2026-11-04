-- ==========================================================
-- Script de Creación de Tablas para PostgreSQL (Motor 1)
-- Ejecutar en la base de datos: ecommerce_db
-- ==========================================================

-- 1. Tabla de Roles
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

-- 2. Tabla de Usuarios (con llave foránea hacia roles)
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol_id INTEGER REFERENCES roles(id),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);
