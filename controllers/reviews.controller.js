const mongoose = require('mongoose');
const Review = require('../models/review.model');

// GET /api/reviews - Listar todas las reseñas activas (is_deleted: false)
// Permite filtrar por query param: ?producto_id=... o ?usuario_id=...
const getReviews = async (req, res) => {
  try {
    const filter = { is_deleted: false };

    if (req.query.producto_id) {
      filter.producto_id = String(req.query.producto_id);
    }
    if (req.query.usuario_id) {
      filter.usuario_id = String(req.query.usuario_id);
    }

    const reviews = await Review.find(filter).sort({ createdAt: -1 });
    return res.status(200).json(reviews);
  } catch (error) {
    return res.status(500).json({
      error: 'Error al obtener las reseñas',
      details: error.message,
    });
  }
};

// GET /api/reviews/:id - Obtener una reseña activa por ID
const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'El ID proporcionado no es válido' });
    }

    const review = await Review.findOne({ _id: id, is_deleted: false });

    if (!review) {
      return res.status(404).json({
        error: 'Reseña no encontrada o eliminada lógicamente',
      });
    }

    return res.status(200).json(review);
  } catch (error) {
    return res.status(500).json({
      error: 'Error al obtener la reseña',
      details: error.message,
    });
  }
};

// POST /api/reviews - Crear una nueva reseña
const createReview = async (req, res) => {
  try {
    const { producto_id, usuario_id, calificacion, comentario } = req.body;

    if (!producto_id || !usuario_id || calificacion === undefined) {
      return res.status(400).json({
        error: 'Los campos producto_id, usuario_id y calificacion son obligatorios',
      });
    }

    const califNum = Number(calificacion);
    if (isNaN(califNum) || califNum < 1 || califNum > 5) {
      return res.status(400).json({
        error: 'La calificación debe ser un número entre 1 y 5',
      });
    }

    const nuevaReview = new Review({
      producto_id: String(producto_id),
      usuario_id: String(usuario_id),
      calificacion: califNum,
      comentario: comentario || '',
      is_deleted: false,
    });

    const guardada = await nuevaReview.save();

    return res.status(201).json({
      message: 'Reseña creada exitosamente',
      data: guardada,
    });
  } catch (error) {
    return res.status(400).json({
      error: 'Error al crear la reseña',
      details: error.message,
    });
  }
};

// PATCH /api/reviews/:id - Actualización parcial de una reseña activa
const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { calificacion, comentario } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'El ID proporcionado no es válido' });
    }

    const updateData = {};
    if (calificacion !== undefined) {
      const califNum = Number(calificacion);
      if (isNaN(califNum) || califNum < 1 || califNum > 5) {
        return res.status(400).json({
          error: 'La calificación debe ser un número entre 1 y 5',
        });
      }
      updateData.calificacion = califNum;
    }
    if (comentario !== undefined) {
      updateData.comentario = comentario;
    }

    const reviewActualizada = await Review.findOneAndUpdate(
      { _id: id, is_deleted: false },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!reviewActualizada) {
      return res.status(404).json({
        error: 'Reseña no encontrada o eliminada lógicamente',
      });
    }

    return res.status(200).json({
      message: 'Reseña actualizada exitosamente',
      data: reviewActualizada,
    });
  } catch (error) {
    return res.status(400).json({
      error: 'Error al actualizar la reseña',
      details: error.message,
    });
  }
};

// DELETE /api/reviews/:id - Borrado lógico (is_deleted: true)
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'El ID proporcionado no es válido' });
    }

    const reviewEliminada = await Review.findOneAndUpdate(
      { _id: id, is_deleted: false },
      { is_deleted: true },
      { new: true }
    );

    if (!reviewEliminada) {
      return res.status(404).json({
        error: 'Reseña no encontrada o ya fue eliminada lógicamente',
      });
    }

    return res.status(200).json({
      message: 'Reseña eliminada lógicamente con éxito',
      data: reviewEliminada,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Error al eliminar lógicamente la reseña',
      details: error.message,
    });
  }
};

module.exports = {
  getReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
};

