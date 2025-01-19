const sharp = require("sharp");
const fs = require("fs").promises; // Use promise-based fs
const path = require("path");

const convertToWebP = async (req, res, next) => {
  try {
    if (req.file) {
      // Single file conversion logic remains the same
      const originalPath = req.file.path;
      const outputPath = originalPath.replace(
        path.extname(originalPath),
        ".webp"
      );
      req.file.filename = req.file.filename.replace(
        path.extname(req.file.filename),
        ".webp"
      );
      req.file.path = outputPath;
      await sharp(originalPath).webp({ quality: 90 }).toFile(outputPath);
      await fs.unlink(originalPath);
      next();
    } else if (req.files && req.files.length) {
      // Convert all files to WebP and delete originals
      const conversionPromises = req.files.map((file) => {
        const originalPath = file.path;
        const outputPath = originalPath.replace(
          path.extname(originalPath),
          ".webp"
        );
        file.filename = file.filename.replace(
          path.extname(file.filename),
          ".webp"
        );
        file.path = outputPath; // Update file path to new outputPath
        return sharp(originalPath).webp({ quality: 80 }).toFile(outputPath);
      });

      // Wait for all conversions to complete
      await Promise.all(conversionPromises);

      // Delete all original files after conversion
      const deletionPromises = req.files.map((file) => {
        const originalPath = file.path.replace(
          ".webp",
          path.extname(file.originalname)
        ); // Use originalname to get the correct extension
        return fs.unlink(originalPath);
      });
      await Promise.all(deletionPromises);

      next();
    } else {
      next();
    }
  } catch (e) {
    console.log(e);
    res.status(500).send("Error processing files");
  }
};

module.exports = convertToWebP;
