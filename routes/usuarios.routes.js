const express = require('express');
const router = express.Router();
const {
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
} = require('../controllers/usuarios.controller');

// Endpoints CRUD para Usuarios (PostgreSQL)
router.get('/', getUsuarios);
router.get('/:id', getUsuarioById);
router.post('/', createUsuario);
router.patch('/:id', updateUsuario);
router.delete('/:id', deleteUsuario);

module.exports = router;
