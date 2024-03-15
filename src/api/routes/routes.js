const express = require('express');
const router = express.Router();

module.exports = (db) => {
    const userRoutes = require('./users/userRoutes')(db);
    const authRoutes = require('./auth/authRoutes')(db);

    router.use('/users', userRoutes);
    router.use('/auth', authRoutes);

    return router;
};
