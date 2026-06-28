const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { exportBackup, importBackup } = require('../controllers/backupController');

router.get('/export', protect, exportBackup);
router.post('/import', protect, importBackup);

module.exports = router;
