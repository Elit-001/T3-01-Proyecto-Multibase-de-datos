const { pool } = require('../config/db.postgres');

// GET /api/usuarios - Obtener todos los usuarios activos (is_deleted = false)
const getUsuarios = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.nombre, u.email, u.rol_id, r.nombre AS rol_nombre, u.is_deleted
       FROM usuarios u
       LEFT JOIN roles r ON u.rol_id = r.id AND r.is_deleted = FALSE
       WHERE u.is_deleted = FALSE
       ORDER BY u.id ASC`
    );
    return res.status(200).json(result.rows);
  } catch (error) {
    return res.status(500).json({
      error: 'Error al obtener los usuarios',
      details: error.message,
    });
  }
};

// GET /api/usuarios/:id - Obtener un usuario activo por ID (is_deleted = false)
const getUsuarioById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT u.id, u.nombre, u.email, u.rol_id, r.nombre AS rol_nombre, u.is_deleted
       FROM usuarios u
       LEFT JOIN roles r ON u.rol_id = r.id AND r.is_deleted = FALSE
       WHERE u.id = $1 AND u.is_deleted = FALSE`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Usuario no encontrado o eliminado lógicamente',
      });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({
      error: 'Error al obtener el usuario',
      details: error.message,
    });
  }
};

// POST /api/usuarios - Crear un nuevo usuario
const createUsuario = async (req, res) => {
  try {
    const { nombre, email, password, rol_id } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({
        error: 'Los campos nombre, email y password son obligatorios',
      });
    }

    // Si se proporciona rol_id, verificar que el rol exista y esté activo
    if (rol_id !== undefined && rol_id !== null) {
      const roleCheck = await pool.query(
        'SELECT id FROM roles WHERE id = $1 AND is_deleted = FALSE',
        [rol_id]
      );
      if (roleCheck.rows.length === 0) {
        return res.status(404).json({
          error: 'El rol especificado no existe o está eliminado lógicamente',
        });
      }
    }

    const result = await pool.query(
      `INSERT INTO usuarios (nombre, email, password, rol_id, is_deleted)
       VALUES ($1, $2, $3, $4, FALSE)
       RETURNING id, nombre, email, rol_id, is_deleted`,
      [nombre, email, password, rol_id || null]
    );

    return res.status(201).json({
      message: 'Usuario creado exitosamente',
      data: result.rows[0],
    });
  } catch (error) {
    return res.status(400).json({
      error: 'Error al crear el usuario',
      details: error.message,
    });
  }
};

// PATCH /api/usuarios/:id - Actualizar parcialmente un usuario activo
const updateUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, password, rol_id } = req.body;

    const existing = await pool.query(
      'SELECT * FROM usuarios WHERE id = $1 AND is_deleted = FALSE',
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        error: 'Usuario no encontrado o eliminado lógicamente',
      });
    }

    if (rol_id !== undefined && rol_id !== null) {
      const roleCheck = await pool.query(
        'SELECT id FROM roles WHERE id = $1 AND is_deleted = FALSE',
        [rol_id]
      );
      if (roleCheck.rows.length === 0) {
        return res.status(404).json({
          error: 'El rol especificado no existe o está eliminado lógicamente',
        });
      }
    }

    const result = await pool.query(
      `UPDATE usuarios
       SET nombre = COALESCE($1, nombre),
           email = COALESCE($2, email),
           password = COALESCE($3, password),
           rol_id = COALESCE($4, rol_id)
       WHERE id = $5 AND is_deleted = FALSE
       RETURNING id, nombre, email, rol_id, is_deleted`,
      [
        nombre !== undefined ? nombre : null,
        email !== undefined ? email : null,
        password !== undefined ? password : null,
        rol_id !== undefined ? rol_id : null,
        id,
      ]
    );

    return res.status(200).json({
      message: 'Usuario actualizado exitosamente',
      data: result.rows[0],
    });
  } catch (error) {
    return res.status(400).json({
      error: 'Error al actualizar el usuario',
      details: error.message,
    });
  }
};

// DELETE /api/usuarios/:id - BORRADO LÓGICO (is_deleted = true)
const deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE usuarios
       SET is_deleted = TRUE
       WHERE id = $1 AND is_deleted = FALSE
       RETURNING id, nombre, email, rol_id, is_deleted`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Usuario no encontrado o ya fue eliminado lógicamente',
      });
    }

    return res.status(200).json({
      message: 'Usuario eliminado lógicamente con éxito',
      data: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Error al eliminar lógicamente el usuario',
      details: error.message,
    });
  }
};

module.exports = {
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
};
