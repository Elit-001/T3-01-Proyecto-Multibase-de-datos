const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    producto_id: {
      type: String,
      required: [true, 'El producto_id es obligatorio'],
      trim: true,
    },
    usuario_id: {
      type: String,
      required: [true, 'El usuario_id es obligatorio'],
      trim: true,
    },
    calificacion: {
      type: Number,
      required: [true, 'La calificación es obligatoria'],
      min: 1,
      max: 5,
    },
    comentario: {
      type: String,
      default: '',
      trim: true,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model('Review', reviewSchema);

