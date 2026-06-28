const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getActivityFeed } = require('../controllers/activityController');

router.get('/', protect, getActivityFeed);

module.exports = router;
