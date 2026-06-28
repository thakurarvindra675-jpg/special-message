const { body, validationResult } = require('express-validator');

// Middleware to catch validation errors and respond cleanly
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};

const loginValidation = [
  body('email')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate,
];

const personValidation = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .trim()
    .escape()
    .isLength({ max: 100 }).withMessage('Name must be under 100 characters'),
  body('relationship')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Relationship must be under 100 characters'),
  body('status')
    .optional()
    .isIn(['draft', 'published']).withMessage('Status must be draft or published'),
  body('theme')
    .optional()
    .isLength({ max: 100 }).withMessage('Theme name too long'),
  body('songStartTime')
    .optional()
    .isNumeric().withMessage('Song Start Time must be a number'),
  body('songEndTime')
    .optional()
    .isNumeric().withMessage('Song End Time must be a number'),
  validate,
];

module.exports = { loginValidation, personValidation, validate };
