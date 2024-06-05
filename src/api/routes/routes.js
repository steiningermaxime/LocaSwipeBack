const express = require('express');
const router = express.Router();

module.exports = (db) => {
  const userRoutes = require('./users/userRoutes')(db);
  const authRoutes = require('./auth/authRoutes')(db);
  const accomodationRoutes = require('./accomodation/accomodationRoutes')(db);
  const messagingRoutes = require('./messaging/messagingRoutes')(db);

  router.use('/users', userRoutes);
  router.use('/auth', authRoutes);
  router.use('/messaging', messagingRoutes);
  router.use('/accommodations', accomodationRoutes);


  return router;
};
