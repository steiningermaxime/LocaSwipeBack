const express = require('express');
const router = express.Router();
const accommodationController = require('../../controllers/accomodation/accomodationController');


module.exports = (db) => {
  router.get('/', (req, res) => accommodationController.getAllAccommodations(req, res, db));
  router.post('/:id/like', (req, res) => accommodationController.likeAccommodation(req, res, db));

  return router;
};
