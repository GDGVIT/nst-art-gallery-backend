const multer = require("multer");
const fs = require("fs");

const myStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let path = req.dir;
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }
    cb(null, path);
  },
  filename: (req, file, cb) => {
    file.originalname = file.originalname.split(" ").join("-");
    let filename =
      file.originalname.split(".")[0] +
      "-" +
      Date.now() +
      "." +
      file.originalname.split(".")[1];
    cb(null, filename);
  },
});

const imageFilter = (req, file, cb) => {
  let ext = file.originalname.split(".").pop();
  let allowed_extension = ["jpg", "jpeg", "png", "webp", "bmp", "svg", "avif"];
  if (allowed_extension.includes(ext.toLowerCase())) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const uploader = multer({
  storage: myStorage,
  fileFilter: imageFilter,
});

module.exports = uploader;
