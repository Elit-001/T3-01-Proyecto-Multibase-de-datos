const { pool } = require('../config/db.postgres');

// GET /api/roles - Obtener todos los roles activos (is_deleted = false)
const getRoles = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM roles WHERE is_deleted = FALSE ORDER BY id ASC'
    );
    return res.status(200).json(result.rows);
  } catch (error) {
    return res.status(500).json({
      error: 'Error al obtener los roles',
      details: error.message,
    });
  }
};

// GET /api/roles/:id - Obtener un rol activo por ID (is_deleted = false)
const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM roles WHERE id = $1 AND is_deleted = FALSE',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Rol no encontrado o eliminado lógicamente',
      });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({
      error: 'Error al obtener el rol',
      details: error.message,
    });
  }
};

// POST /api/roles - Crear un nuevo rol
const createRole = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    if (!nombre) {
      return res.status(400).json({
        error: 'El campo nombre es obligatorio',
      });
    }

    const result = await pool.query(
      'INSERT INTO roles (nombre, descripcion, is_deleted) VALUES ($1, $2, FALSE) RETURNING *',
      [nombre, descripcion || null]
    );

    return res.status(201).json({
      message: 'Rol creado exitosamente',
      data: result.rows[0],
    });
  } catch (error) {
    return res.status(400).json({
      error: 'Error al crear el rol',
      details: error.message,
    });
  }
};

// PATCH /api/roles/:id - Actualizar parcialmente un rol activo
const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    // Verificar que el rol exista y no esté borrado lógicamente
    const existing = await pool.query(
      'SELECT * FROM roles WHERE id = $1 AND is_deleted = FALSE',
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        error: 'Rol no encontrado o eliminado lógicamente',
      });
    }

    const result = await pool.query(
      `UPDATE roles
       SET nombre = COALESCE($1, nombre),
           descripcion = COALESCE($2, descripcion)
       WHERE id = $3 AND is_deleted = FALSE
       RETURNING *`,
      [
        nombre !== undefined ? nombre : null,
        descripcion !== undefined ? descripcion : null,
        id,
      ]
    );

    return res.status(200).json({
      message: 'Rol actualizado exitosamente',
      data: result.rows[0],
    });
  } catch (error) {
    return res.status(400).json({
      error: 'Error al actualizar el rol',
      details: error.message,
    });
  }
};

// DELETE /api/roles/:id - BORRADO LÓGICO (is_deleted = true)
const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE roles SET is_deleted = TRUE WHERE id = $1 AND is_deleted = FALSE RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Rol no encontrado o ya fue eliminado lógicamente',
      });
    }

    return res.status(200).json({
      message: 'Rol eliminado lógicamente con éxito',
      data: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Error al eliminar lógicamente el rol',
      details: error.message,
    });
  }
};

module.exports = {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
};
