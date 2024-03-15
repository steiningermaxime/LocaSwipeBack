const express = require('express');
const userController = require('../../controllers/users/userController');
const router = express.Router();

module.exports = (db) => {
    router.get('/', (req, res) => userController.getAllUsers(req, res, db));
    router.get('/:id', (req, res) => userController.getUserById(req, res, db));
    router.put('/:id', (req, res) => userController.updateUser(req, res, db));
    router.delete('/:id', (req, res) => userController.deleteUser(req, res, db));

    return router;
};
