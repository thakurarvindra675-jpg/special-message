const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  recordOpen,
  recordClose,
  getDashboardStats
} = require('../controllers/analyticsController');

router.post('/open', recordOpen);
router.post('/close', recordClose);
router.get('/dashboard', protect, getDashboardStats);

module.exports = router;
