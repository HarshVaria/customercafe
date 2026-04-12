const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  unit: {
    type: String, // e.g., 'g', 'ml', 'pcs'
    required: true,
    enum: ['g', 'kg', 'ml', 'l', 'pcs']
  },
  currentStock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  lowStockThreshold: {
    type: Number,
    required: true,
    default: 100 // default warning threshold
  }
}, { timestamps: true });

module.exports = mongoose.model('Ingredient', ingredientSchema);
