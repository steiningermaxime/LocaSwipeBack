const express = require('express');
const router = express.Router();
const accommodationController = require('../../controllers/accommodations/accommodationController');

module.exports = (db) => {
  router.get('/accommodations', (req, res) => accommodationController.getAllAccommodations(req, res, db));

  return router;
};
