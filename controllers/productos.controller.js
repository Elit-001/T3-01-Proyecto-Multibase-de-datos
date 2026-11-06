const mongoose = require('mongoose');
const Producto = require('../models/producto.model');

// GET /api/productos - Listar todos los productos activos (is_deleted: false)
const getProductos = async (req, res) => {
  try {
    const productos = await Producto.find({ is_deleted: false }).sort({ createdAt: -1 });
    return res.status(200).json(productos);
  } catch (error) {
    return res.status(500).json({
      error: 'Error al obtener los productos',
      details: error.message,
    });
  }
};

// GET /api/productos/:id - Obtener un producto activo por ID
const getProductoById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'El ID proporcionado no es válido' });
    }

    const producto = await Producto.findOne({ _id: id, is_deleted: false });

    if (!producto) {
      return res.status(404).json({
        error: 'Producto no encontrado o eliminado lógicamente',
      });
    }

    return res.status(200).json(producto);
  } catch (error) {
    return res.status(500).json({
      error: 'Error al obtener el producto',
      details: error.message,
    });
  }
};

// POST /api/productos - Crear un nuevo producto
const createProducto = async (req, res) => {
  try {
    const { nombre, precio, especificaciones, especificaciones_tecnicas } = req.body;

    if (!nombre || precio === undefined) {
      return res.status(400).json({
        error: 'Los campos nombre y precio son obligatorios',
      });
    }

    const nuevoProducto = new Producto({
      nombre,
      precio: Number(precio),
      especificaciones: especificaciones || especificaciones_tecnicas || '',
      especificaciones_tecnicas: especificaciones_tecnicas || especificaciones || '',
      is_deleted: false,
    });

    const guardado = await nuevoProducto.save();

    return res.status(201).json({
      message: 'Producto creado exitosamente',
      data: guardado,
    });
  } catch (error) {
    return res.status(400).json({
      error: 'Error al crear el producto',
      details: error.message,
    });
  }
};

// PATCH /api/productos/:id - Actualización parcial de un producto activo
const updateProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, precio, especificaciones, especificaciones_tecnicas } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'El ID proporcionado no es válido' });
    }

    const updateData = {};
    if (nombre !== undefined) updateData.nombre = nombre;
    if (precio !== undefined) updateData.precio = Number(precio);
    if (especificaciones !== undefined) {
      updateData.especificaciones = especificaciones;
      if (especificaciones_tecnicas === undefined) {
        updateData.especificaciones_tecnicas = especificaciones;
      }
    }
    if (especificaciones_tecnicas !== undefined) {
      updateData.especificaciones_tecnicas = especificaciones_tecnicas;
      if (especificaciones === undefined) {
        updateData.especificaciones = especificaciones_tecnicas;
      }
    }

    const productoActualizado = await Producto.findOneAndUpdate(
      { _id: id, is_deleted: false },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!productoActualizado) {
      return res.status(404).json({
        error: 'Producto no encontrado o eliminado lógicamente',
      });
    }

    return res.status(200).json({
      message: 'Producto actualizado exitosamente',
      data: productoActualizado,
    });
  } catch (error) {
    return res.status(400).json({
      error: 'Error al actualizar el producto',
      details: error.message,
    });
  }
};

// DELETE /api/productos/:id - Borrado lógico (is_deleted: true)
const deleteProducto = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'El ID proporcionado no es válido' });
    }

    const productoEliminado = await Producto.findOneAndUpdate(
      { _id: id, is_deleted: false },
      { is_deleted: true },
      { new: true }
    );

    if (!productoEliminado) {
      return res.status(404).json({
        error: 'Producto no encontrado o ya fue eliminado lógicamente',
      });
    }

    return res.status(200).json({
      message: 'Producto eliminado lógicamente con éxito',
      data: productoEliminado,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Error al eliminar lógicamente el producto',
      details: error.message,
    });
  }
};

module.exports = {
  getProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto,
};

