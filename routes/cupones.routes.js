const express = require('express');
const router = express.Router();
const {
  getCupones,
  getCuponByCodigo,
  createCupon,
  updateCupon,
  deleteCupon,
} = require('../controllers/cupones.controller');

// Endpoints CRUD para Cupones en Redis (Clave: coupon:{codigo})
router.get('/', getCupones);
router.get('/:codigo', getCuponByCodigo);
router.post('/', createCupon);
router.patch('/:codigo', updateCupon);
router.delete('/:codigo', deleteCupon);

module.exports = router;
