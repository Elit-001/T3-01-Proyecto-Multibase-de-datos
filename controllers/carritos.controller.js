const { redisClient } = require('../config/db.redis');

// Helper para construir la clave en Redis: cart:{usuario_id}
const getCartKey = (usuarioId) => `cart:${String(usuarioId).trim()}`;

// GET /api/carritos - Obtener todos los carritos activos (is_deleted === false)
const getCarritos = async (req, res) => {
  try {
    const keys = await redisClient.keys('cart:*');
    const carritosActivos = [];

    for (const key of keys) {
      const rawValue = await redisClient.get(key);
      if (rawValue) {
        const parsed = JSON.parse(rawValue);
        if (parsed.is_deleted === false) {
          const usuario_id = key.replace('cart:', '');
          carritosActivos.push({
            usuario_id,
            ...parsed,
          });
        }
      }
    }

    return res.status(200).json(carritosActivos);
  } catch (error) {
    return res.status(500).json({
      error: 'Error al obtener los carritos desde Redis',
      details: error.message,
    });
  }
};

// GET /api/carritos/:usuario_id - Obtener el carrito de un usuario (solo si is_deleted === false)
const getCarritoByUsuarioId = async (req, res) => {
  try {
    const { usuario_id } = req.params;
    const key = getCartKey(usuario_id);

    const rawValue = await redisClient.get(key);

    if (!rawValue) {
      return res.status(404).json({
        error: 'Carrito no encontrado',
      });
    }

    const cartData = JSON.parse(rawValue);

    if (cartData.is_deleted === true) {
      return res.status(404).json({
        error: 'El carrito no existe o fue eliminado lógicamente',
      });
    }

    return res.status(200).json({
      usuario_id: String(usuario_id).trim(),
      ...cartData,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Error al obtener el carrito desde Redis',
      details: error.message,
    });
  }
};

// POST /api/carritos - Crear o inicializar un carrito con is_deleted: false
const createCarrito = async (req, res) => {
  try {
    const { usuario_id, items, total } = req.body;

    if (!usuario_id) {
      return res.status(400).json({
        error: 'El campo usuario_id es obligatorio',
      });
    }

    const key = getCartKey(usuario_id);

    const newCart = {
      items: Array.isArray(items) ? items : [],
      total: total !== undefined ? Number(total) : 0,
      is_deleted: false,
    };

    await redisClient.set(key, JSON.stringify(newCart));

    return res.status(201).json({
      message: 'Carrito guardado exitosamente en Redis',
      key,
      data: {
        usuario_id: String(usuario_id).trim(),
        ...newCart,
      },
    });
  } catch (error) {
    return res.status(400).json({
      error: 'Error al guardar el carrito en Redis',
      details: error.message,
    });
  }
};

// PATCH /api/carritos/:usuario_id - Actualizar items o total de un carrito activo
const updateCarrito = async (req, res) => {
  try {
    const { usuario_id } = req.params;
    const { items, total } = req.body;
    const key = getCartKey(usuario_id);

    const rawValue = await redisClient.get(key);

    if (!rawValue) {
      return res.status(404).json({
        error: 'Carrito no encontrado',
      });
    }

    const currentCart = JSON.parse(rawValue);

    if (currentCart.is_deleted === true) {
      return res.status(404).json({
        error: 'No se puede actualizar un carrito eliminado lógicamente',
      });
    }

    const updatedCart = {
      ...currentCart,
      ...(items !== undefined && { items: Array.isArray(items) ? items : [] }),
      ...(total !== undefined && { total: Number(total) }),
      is_deleted: false,
    };

    await redisClient.set(key, JSON.stringify(updatedCart));

    return res.status(200).json({
      message: 'Carrito actualizado exitosamente',
      key,
      data: {
        usuario_id: String(usuario_id).trim(),
        ...updatedCart,
      },
    });
  } catch (error) {
    return res.status(400).json({
      error: 'Error al actualizar el carrito en Redis',
      details: error.message,
    });
  }
};

// DELETE /api/carritos/:usuario_id - Borrado lógico (is_deleted: true sin usar DEL)
const deleteCarrito = async (req, res) => {
  try {
    const { usuario_id } = req.params;
    const key = getCartKey(usuario_id);

    const rawValue = await redisClient.get(key);

    if (!rawValue) {
      return res.status(404).json({
        error: 'Carrito no encontrado',
      });
    }

    const currentCart = JSON.parse(rawValue);

    if (currentCart.is_deleted === true) {
      return res.status(404).json({
        error: 'El carrito ya fue eliminado lógicamente',
      });
    }

    currentCart.is_deleted = true;
    await redisClient.set(key, JSON.stringify(currentCart));

    return res.status(200).json({
      message: 'Carrito eliminado lógicamente con éxito en Redis',
      key,
      data: {
        usuario_id: String(usuario_id).trim(),
        ...currentCart,
      },
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Error al eliminar lógicamente el carrito en Redis',
      details: error.message,
    });
  }
};

module.exports = {
  getCarritos,
  getCarritoByUsuarioId,
  createCarrito,
  updateCarrito,
  deleteCarrito,
};

