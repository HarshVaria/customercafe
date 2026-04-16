const express = require('express');
const router = express.Router();
const { register, login, getMe, updateKitchenStatus, getKitchenStatus } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

router.put('/status', protect, updateKitchenStatus);
router.get('/kitchen-status', protect, getKitchenStatus);

module.exports = router;