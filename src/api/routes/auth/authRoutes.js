const express = require('express');
const authController = require('../../controllers/auth/authController');
const router = express.Router();

module.exports = (db) => {
    router.post('/register', (req, res) => authController.register(req, res, db));
    router.post('/login', (req, res) => authController.login(req, res, db));

    return router;
};
