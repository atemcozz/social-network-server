const multer = require("multer");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, path.resolve("public", "uploads"));
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + path.extname(file.originalname));
//   },
// });
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "social-network",
    resource_type: "auto",
    public_id: (req, file) =>
      Date.now() + "-" + Math.round(Math.random() * 1e9),
  },
});
const upload = multer({ storage: storage });
module.exports = { upload, storage };
