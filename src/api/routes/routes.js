const express = require('express');
const router = express.Router();

module.exports = (db) => {
  const userRoutes = require('./users/userRoutes')(db);
  const authRoutes = require('./auth/authRoutes')(db);
  const accommodationController = require('../controllers/accomodation/accomodationController');
  const messagingRoutes = require('./messaging/messagingRoutes')(db);

  router.use('/users', userRoutes);
  router.use('/auth', authRoutes);
  router.use('/messaging', messagingRoutes);

  router.get('/accommodations', (req, res) => accommodationController.getAllAccommodations(req, res, db));

  return router;
};
