const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { apiLimiter } = require('../middleware/rateLimiter');
const { personValidation } = require('../middleware/validateMiddleware');
const {
  getPeople,
  searchPeople,
  getPersonBySlug,
  createPerson,
  updatePerson,
  deletePerson,
  bulkDeletePeople
} = require('../controllers/peopleController');

// Public routes (rate limited)
router.get('/search', apiLimiter, searchPeople);
router.get('/slug/:slug', apiLimiter, getPersonBySlug);

// Protected admin routes
router.get('/', protect, getPeople);
router.post('/', protect, upload.single('songFile'), personValidation, createPerson);
router.put('/:id', protect, upload.single('songFile'), updatePerson);
router.delete('/:id', protect, deletePerson);
router.post('/bulk-delete', protect, bulkDeletePeople);

module.exports = router;
