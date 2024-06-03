const express = require('express');
const messagingController = require('../../controllers/messaging/messagingController');
const router = express.Router();

module.exports = (db) => {
    router.post('/conversations', (req, res) => messagingController.createConversation(req, res, db));
    router.get('/conversations/:userId', (req, res) => messagingController.getConversations(req, res, db));
    router.post('/messages', (req, res) => messagingController.sendMessage(req, res, db));
    router.get('/messages/:conversationId', (req, res) => messagingController.getMessages(req, res, db));

    // Ajout de la route pour récupérer une conversation spécifique entre deux utilisateurs
    router.get('/conversation/:user1_id/:user2_id', (req, res) => messagingController.getConversationBetweenUsers(req, res, db));

    return router;
};
