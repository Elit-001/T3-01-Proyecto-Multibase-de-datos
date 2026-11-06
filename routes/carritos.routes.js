const express = require('express');
const router = express.Router();
const {
  getCarritos,
  getCarritoByUsuarioId,
  createCarrito,
  updateCarrito,
  deleteCarrito,
} = require('../controllers/carritos.controller');

// Endpoints CRUD para Carritos de Compra (Redis Clave-Valor)
router.get('/', getCarritos);
router.get('/:usuario_id', getCarritoByUsuarioId);
router.post('/', createCarrito);
router.patch('/:usuario_id', updateCarrito);
router.delete('/:usuario_id', deleteCarrito);

module.exports = router;

