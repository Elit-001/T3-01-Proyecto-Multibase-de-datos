const express = require('express');
const router = express.Router();
const {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
} = require('../controllers/roles.controller');

// Endpoints CRUD para Roles (PostgreSQL)
router.get('/', getRoles);
router.get('/:id', getRoleById);
router.post('/', createRole);
router.patch('/:id', updateRole);
router.delete('/:id', deleteRole);

module.exports = router;
