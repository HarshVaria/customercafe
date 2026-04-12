const Ingredient = require('../models/Ingredient');

// @desc    Get all ingredients (with optional low-stock filter)
// @route   GET /api/inventory
// @access  Private (Owner/Kitchen)
exports.getAllIngredients = async (req, res) => {
  try {
    const { lowStock } = req.query;
    let query = {};

    if (lowStock === 'true') {
      // Find where currentStock is less than lowStockThreshold
      query = { $expr: { $lt: ["$currentStock", "$lowStockThreshold"] } };
    }

    const ingredients = await Ingredient.find(query).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: ingredients.length,
      data: ingredients
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new ingredient
// @route   POST /api/inventory
// @access  Private (Owner)
exports.createIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Ingredient added successfully',
      data: ingredient
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Ingredient name must be unique' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update ingredient (name, unit, threshold)
// @route   PUT /api/inventory/:id
// @access  Private (Owner)
exports.updateIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!ingredient) {
      return res.status(404).json({ success: false, message: 'Ingredient not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Ingredient updated',
      data: ingredient
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete ingredient
// @route   DELETE /api/inventory/:id
// @access  Private (Owner)
exports.deleteIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.findByIdAndDelete(req.params.id);

    if (!ingredient) {
      return res.status(404).json({ success: false, message: 'Ingredient not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Ingredient deleted'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Log physical stock overwrite (by chef or owner)
// @route   POST /api/inventory/log-usage
// @access  Private (Owner/Kitchen)
exports.logStockUsage = async (req, res) => {
  try {
    // Expected body: { updates: [{ ingredientId: "123", currentStock: 500 }] }
    const { updates } = req.body;

    if (!updates || !Array.isArray(updates)) {
      return res.status(400).json({ success: false, message: 'Invalid updates format' });
    }

    const updatedIngredients = [];
    for (const update of updates) {
      const ingredient = await Ingredient.findByIdAndUpdate(
        update.ingredientId,
        { currentStock: update.currentStock },
        { new: true }
      );
      if (ingredient) updatedIngredients.push(ingredient);
    }

    res.status(200).json({
      success: true,
      message: 'Stock levels updated to match physical inventory',
      data: updatedIngredients
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
