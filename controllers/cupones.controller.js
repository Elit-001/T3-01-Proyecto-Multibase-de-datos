const { redisClient } = require('../config/db.redis');

// Helper para construir la clave en Redis: coupon:{codigo}
const getCouponKey = (codigo) => `coupon:${String(codigo).toUpperCase().trim()}`;

// GET /api/cupones - Obtener todos los cupones activos (is_deleted === false)
const getCupones = async (req, res) => {
  try {
    const keys = await redisClient.keys('coupon:*');
    const cuponesActivos = [];

    for (const key of keys) {
      const rawValue = await redisClient.get(key);
      if (rawValue) {
        const parsed = JSON.parse(rawValue);
        if (parsed.is_deleted === false) {
          const codigo = key.replace('coupon:', '');
          cuponesActivos.push({
            codigo,
            ...parsed,
          });
        }
      }
    }

    return res.status(200).json(cuponesActivos);
  } catch (error) {
    return res.status(500).json({
      error: 'Error al obtener los cupones desde Redis',
      details: error.message,
    });
  }
};

// GET /api/cupones/:codigo - Obtener un cupón por su código (solo si is_deleted === false)
const getCuponByCodigo = async (req, res) => {
  try {
    const { codigo } = req.params;
    const key = getCouponKey(codigo);

    const rawValue = await redisClient.get(key);

    if (!rawValue) {
      return res.status(404).json({
        error: 'Cupón no encontrado',
      });
    }

    const couponData = JSON.parse(rawValue);

    // Regla crítica: ignorar si está marcado con borrado lógico
    if (couponData.is_deleted === true) {
      return res.status(404).json({
        error: 'El cupón no existe o fue eliminado lógicamente',
      });
    }

    return res.status(200).json({
      codigo: String(codigo).toUpperCase().trim(),
      ...couponData,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Error al obtener el cupón desde Redis',
      details: error.message,
    });
  }
};

// POST /api/cupones - Crear un nuevo cupón con is_deleted: false
const createCupon = async (req, res) => {
  try {
    const { codigo, descuento, fecha_expiracion } = req.body;

    if (!codigo || descuento === undefined || !fecha_expiracion) {
      return res.status(400).json({
        error: 'Los campos codigo, descuento y fecha_expiracion son obligatorios',
      });
    }

    const key = getCouponKey(codigo);

    // Estructura requerida: {"descuento": numero, "fecha_expiracion": string, "is_deleted": boolean}
    const newCoupon = {
      descuento: Number(descuento),
      fecha_expiracion: String(fecha_expiracion),
      is_deleted: false,
    };

    await redisClient.set(key, JSON.stringify(newCoupon));

    return res.status(201).json({
      message: 'Cupón guardado exitosamente en Redis',
      key,
      data: {
        codigo: String(codigo).toUpperCase().trim(),
        ...newCoupon,
      },
    });
  } catch (error) {
    return res.status(400).json({
      error: 'Error al crear el cupón en Redis',
      details: error.message,
    });
  }
};

// PATCH /api/cupones/:codigo - Actualizar propiedades de un cupón activo
const updateCupon = async (req, res) => {
  try {
    const { codigo } = req.params;
    const { descuento, fecha_expiracion } = req.body;
    const key = getCouponKey(codigo);

    const rawValue = await redisClient.get(key);

    if (!rawValue) {
      return res.status(404).json({
        error: 'Cupón no encontrado',
      });
    }

    const currentCoupon = JSON.parse(rawValue);

    if (currentCoupon.is_deleted === true) {
      return res.status(404).json({
        error: 'No se puede actualizar un cupón eliminado lógicamente',
      });
    }

    const updatedCoupon = {
      ...currentCoupon,
      ...(descuento !== undefined && { descuento: Number(descuento) }),
      ...(fecha_expiracion !== undefined && {
        fecha_expiracion: String(fecha_expiracion),
      }),
      is_deleted: false,
    };

    await redisClient.set(key, JSON.stringify(updatedCoupon));

    return res.status(200).json({
      message: 'Cupón actualizado exitosamente',
      key,
      data: {
        codigo: String(codigo).toUpperCase().trim(),
        ...updatedCoupon,
      },
    });
  } catch (error) {
    return res.status(400).json({
      error: 'Error al actualizar el cupón en Redis',
      details: error.message,
    });
  }
};

// DELETE /api/cupones/:codigo - BORRADO LÓGICO (cambia is_deleted a true sin usar DEL)
const deleteCupon = async (req, res) => {
  try {
    const { codigo } = req.params;
    const key = getCouponKey(codigo);

    const rawValue = await redisClient.get(key);

    if (!rawValue) {
      return res.status(404).json({
        error: 'Cupón no encontrado',
      });
    }

    const currentCoupon = JSON.parse(rawValue);

    if (currentCoupon.is_deleted === true) {
      return res.status(404).json({
        error: 'El cupón ya fue eliminado lógicamente',
      });
    }

    // Regla crítica: actualizar is_deleted a true y volver a guardar el JSON (NO usar DEL)
    currentCoupon.is_deleted = true;
    await redisClient.set(key, JSON.stringify(currentCoupon));

    return res.status(200).json({
      message: 'Cupón eliminado lógicamente con éxito en Redis',
      key,
      data: {
        codigo: String(codigo).toUpperCase().trim(),
        ...currentCoupon,
      },
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Error al eliminar lógicamente el cupón en Redis',
      details: error.message,
    });
  }
};

module.exports = {
  getCupones,
  getCuponByCodigo,
  createCupon,
  updateCupon,
  deleteCupon,
};
