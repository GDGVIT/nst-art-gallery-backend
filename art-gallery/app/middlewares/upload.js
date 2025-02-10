const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  // ...existing storage configuration...
});

const fileFilter = (req, file, cb) => {
  // ...existing filter configuration...
};

// Updated multer configuration with limits
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB in bytes
    files: 2 // Maximum number of files
  }
});

module.exports = upload;
