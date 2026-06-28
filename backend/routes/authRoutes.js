const express = require('express');
const router = express.Router();
const { authAdmin } = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiter');
const { loginValidation } = require('../middleware/validateMiddleware');
const { protect } = require('../middleware/authMiddleware');

// Rate-limited and validated login
router.post('/login', authLimiter, loginValidation, authAdmin);

// Token verification route — frontend calls this to check if session is still valid
router.get('/verify', protect, (req, res) => {
  res.json({ valid: true, admin: { email: req.admin.email } });
});

module.exports = router;
