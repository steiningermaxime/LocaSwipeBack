const express = require('express');
const router = express.Router();

module.exports = (db) => {
  const userRoutes = require('./users/userRoutes')(db);
  const authRoutes = require('./auth/authRoutes')(db);
  const accommodationRoutes = require('./accomodation/accomodationRoutes')(db); 

  router.use('/users', userRoutes);
  router.use('/auth', authRoutes);
  router.use('/accommodations', accommodationRoutes);

  return router;
};
