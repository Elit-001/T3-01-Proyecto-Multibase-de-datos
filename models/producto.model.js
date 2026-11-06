const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del producto es obligatorio'],
      trim: true,
    },
    precio: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
      min: 0,
    },
    especificaciones: {
      type: String,
      default: '',
      trim: true,
    },
    especificaciones_tecnicas: {
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

productoSchema.pre('save', function (next) {
  if (this.especificaciones && !this.especificaciones_tecnicas) {
    this.especificaciones_tecnicas = this.especificaciones;
  } else if (this.especificaciones_tecnicas && !this.especificaciones) {
    this.especificaciones = this.especificaciones_tecnicas;
  }
  next();
});

module.exports = mongoose.model('Producto', productoSchema);

