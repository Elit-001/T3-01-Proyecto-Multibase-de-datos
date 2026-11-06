const express = require('express');
const router = express.Router();
const {
  getProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto,
} = require('../controllers/productos.controller');

// Endpoints CRUD para Productos (MongoDB)
router.get('/', getProductos);
router.get('/:id', getProductoById);
router.post('/', createProducto);
router.patch('/:id', updateProducto);
router.delete('/:id', deleteProducto);

module.exports = router;

