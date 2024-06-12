const {
  createConversationService,
  getConversationsService,
  sendMessageService,
  getMessagesService,
  getConversationBetweenUsersService
} = require('../../services/messaging');

exports.createConversation = async (req, res, db) => {
  const { user1_id, user2_id } = req.body;

  try {
    const result = await createConversationService(db, user1_id, user2_id);
    res.status(201).json(result);
  } catch (error) {
    console.error('Erreur lors de la création de la conversation:', error);
    res.status(500).send('Erreur lors de la création de la conversation.');
  }
};

exports.getConversations = async (req, res, db) => {
  const { userId } = req.params;

  try {
    const results = await getConversationsService(db, userId);
    res.json(results);
  } catch (error) {
    console.error('Erreur lors de la récupération des conversations:', error);
    res.status(500).send('Erreur lors de la récupération des conversations.');
  }
};

exports.sendMessage = async (req, res, db) => {
  const { conversation_id, sender_id, content } = req.body;

  try {
    const result = await sendMessageService(db, conversation_id, sender_id, content);
    res.status(201).json(result);
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);
    res.status(500).send('Erreur lors de l\'envoi du message.');
  }
};

exports.getMessages = async (req, res, db) => {
  const { conversationId } = req.params;

  try {
    const results = await getMessagesService(db, conversationId);
    res.json(results);
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    res.status(500).send('Erreur lors de la récupération des messages.');
  }
};

exports.getConversationBetweenUsers = async (req, res, db) => {
  const { user1_id, user2_id } = req.params;

  try {
    const conversation = await getConversationBetweenUsersService(db, user1_id, user2_id);
    res.json(conversation);
  } catch (error) {
    if (error.message === 'Conversation non trouvée.') {
      return res.status(404).send(error.message);
    }
    console.error('Erreur lors de la récupération de la conversation:', error);
    res.status(500).send('Erreur lors de la récupération de la conversation.');
  }
};
