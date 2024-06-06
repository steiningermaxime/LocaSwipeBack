const express = require('express');
const router = express.Router();
const accommodationController = require('../../controllers/accomodation/accomodationController');

module.exports = (db, io) => {
  router.get('/', (req, res) => accommodationController.getAllAccommodations(req, res, db));
  router.post('/:id/like', (req, res) => accommodationController.likeAccommodation(req, res, db, io));
  router.get('/:accommodationId/likes', (req, res) => accommodationController.getLikesForAccommodation(req, res, db));
  router.post('/accept-tenant', (req, res) => accommodationController.acceptTenant(req, res, db, io));

  return router;
};
