const express = require('express');
const router = express.Router();
const multer = require('multer');
const accommodationController = require('../../controllers/accommodations/accommodationController');

const upload = multer({ dest: 'uploads/' });

module.exports = (db) => {
  router.get('/accommodations', (req, res) => accommodationController.getAllAccommodations(req, res, db));
  router.post('/accommodations/:id/image', upload.single('image'), (req, res) => accommodationController.uploadAccommodationImage(req, res, db));

  return router;
};
