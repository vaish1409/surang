const multer = require('multer');

// Separate from config/cloudinary.js on purpose — this upload only sends a
// temporary copy of the photo to the AI for analysis. It never touches
// Cloudinary or the database. The real image upload still goes through the
// existing `upload` (Cloudinary) middleware when the artist hits Publish.
const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});

module.exports = memoryUpload;
