const multer = require('multer');

// Configure multer for memory storage, so we can upload the buffer to Cloudinary
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Cloudinary can handle various formats, we just allow anything that comes from the file picker
    cb(null, true);
  },
});

module.exports = upload;
