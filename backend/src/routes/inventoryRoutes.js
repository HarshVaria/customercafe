const express = require('express');
const router = express.Router();
const {
  getAllIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  logStockUsage
} = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('owner', 'kitchen'), getAllIngredients);
router.post('/', protect, authorize('owner'), createIngredient);
router.put('/:id', protect, authorize('owner'), updateIngredient);
router.delete('/:id', protect, authorize('owner'), deleteIngredient);

// Chef's Override API
router.post('/log-usage', protect, authorize('owner', 'kitchen'), logStockUsage);

module.exports = router;
