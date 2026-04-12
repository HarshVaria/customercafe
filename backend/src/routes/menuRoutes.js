const express = require('express');
const router = express.Router();
const {
  getAllMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability
} = require('../controllers/menuController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getAllMenuItems);
router.get('/:id', getMenuItem);
router.post('/', protect, authorize('owner'), upload.single('image'), createMenuItem);
router.put('/:id', protect, authorize('owner'), upload.single('image'), updateMenuItem);
router.delete('/:id', protect, authorize('owner'), deleteMenuItem);
router.patch('/:id/toggle', protect, authorize('owner', 'kitchen'), toggleAvailability);

module.exports = router;