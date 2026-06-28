const cloudinary = require('cloudinary').v2;

// Cloudinary configuration will be initialized here once env vars are loaded
// It is usually safe to just call config() without arguments if process.env.CLOUDINARY_URL is set, 
// or manually with keys. We will do it manually.

const connectCloudinary = () => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
};

module.exports = { cloudinary, connectCloudinary };
