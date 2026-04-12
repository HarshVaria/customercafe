const express = require('express');
const router = express.Router();
const {
  getAllOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  getOrdersByTable
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('owner', 'kitchen'), getAllOrders);
router.get('/table/:tableNumber', getOrdersByTable);
router.get('/:id', getOrder);
router.post('/', createOrder);
router.patch('/:id/status', protect, authorize('owner', 'kitchen'), updateOrderStatus);

module.exports = router;