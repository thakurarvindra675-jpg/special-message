const bcrypt = require('bcrypt');
const Admin = require('../models/Admin');

/**
 * Called once at server startup.
 * Reads ADMIN_EMAIL and ADMIN_PASSWORD from .env
 * and creates the admin account if one doesn't exist yet.
 *
 * In production: set these as environment variables on Render.
 * Changing them ONLY takes effect if there is no existing admin
 * in the database yet (first deploy). To reset credentials later,
 * delete the admin document from MongoDB Atlas and redeploy.
 */
const seedAdmin = async () => {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      console.warn('⚠️  ADMIN_EMAIL or ADMIN_PASSWORD not set in .env — skipping admin seed.');
      return;
    }

    const existing = await Admin.findOne({ email });
    if (existing) {
      console.log(`✅ Admin already exists: ${email}`);
      return;
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    await Admin.create({ email, passwordHash });
    console.log(`✅ Admin account created: ${email}`);
  } catch (err) {
    console.error('❌ Failed to seed admin:', err.message);
  }
};

module.exports = seedAdmin;
