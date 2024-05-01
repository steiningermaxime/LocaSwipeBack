const cloudinary = require('cloudinary').v2;
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

exports.uploadAccommodationImage = (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ status: 'error', message: 'Aucun fichier envoyé.' });
  }
  cloudinary.uploader.upload(file.path, (result) => {
    res.status(201).json({ status: 'success', url: result.secure_url });
  });
};
