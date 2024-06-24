const express = require('express');
const router = express.Router();
const authenticateJWT = require('../../middleware/authenticateJWT');

module.exports = (db, io) => {
  const userRoutes = require('./users/userRoutes')(db);
  const authRoutes = require('./auth/authRoutes')(db);
  const accomodationRoutes = require('./accomodation/accomodationRoutes')(db, io);
  const messagingRoutes = require('./messaging/messagingRoutes')(db);

  // Auth routes
  router.use('/auth', authRoutes);

  // Protected routes
  router.use('/users', authenticateJWT, userRoutes);
  router.use('/messaging', authenticateJWT, messagingRoutes);
  router.use('/accommodations', authenticateJWT, accomodationRoutes);

  return router;
};
