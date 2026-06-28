const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getSettings,
  updateSettings
} = require('../controllers/settingsController');

router.get('/', getSettings); // Public, needed for landing page
router.put('/', protect, updateSettings); // Protected, admin only

module.exports = router;
