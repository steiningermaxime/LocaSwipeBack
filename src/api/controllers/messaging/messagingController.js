const jwt = require('jsonwebtoken');

exports.createConversation = (req, res, db) => {
  const { user1_id, user2_id } = req.body;
  const query = 'INSERT INTO conversations (user1_id, user2_id) VALUES (?, ?)';
  db.query(query, [user1_id, user2_id], (error, results) => {
    if (error) {
      console.error('Erreur lors de la création de la conversation:', error);
      return res.status(500).send('Erreur lors de la création de la conversation.');
    }
    res.status(201).json({ id: results.insertId });
  });
};

exports.getConversations = (req, res, db) => {
  const { userId } = req.params;
  const query = `
    SELECT c.*, 
      CONCAT(u1.firstname, ' ', u1.lastname) AS user1_name, 
      CONCAT(u2.firstname, ' ', u2.lastname) AS user2_name,
      (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_message
    FROM conversations c
    JOIN users u1 ON c.user1_id = u1.id
    JOIN users u2 ON c.user2_id = u2.id
    WHERE c.user1_id = ? OR c.user2_id = ?
  `;
  db.query(query, [userId, userId], (error, results) => {
    if (error) {
      console.error('Erreur lors de la récupération des conversations:', error);
      return res.status(500).send('Erreur lors de la récupération des conversations.');
    }
    res.json(results);
  });
};

exports.sendMessage = (req, res, db) => {
  const { conversation_id, sender_id, content } = req.body;
  const query = 'INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)';
  db.query(query, [conversation_id, sender_id, content], (error, results) => {
    if (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      return res.status(500).send('Erreur lors de l\'envoi du message.');
    }
    res.status(201).json({ id: results.insertId });
  });
};

exports.getMessages = (req, res, db) => {
    const { conversationId } = req.params;
    const query = `
      SELECT m.*, u.firstname AS sender_firstname, u.lastname AS sender_lastname
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = ?
    `;
    db.query(query, [conversationId], (error, results) => {
      if (error) {
        console.error('Erreur lors de la récupération des messages:', error);
        return res.status(500).send('Erreur lors de la récupération des messages.');
      }
      res.json(results);
    });
  };
  

exports.getConversationBetweenUsers = (req, res, db) => {
  const { user1_id, user2_id } = req.params;
  const query = `
    SELECT * FROM conversations 
    WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
  `;
  db.query(query, [user1_id, user2_id, user2_id, user1_id], (error, results) => {
    if (error) {
      console.error('Erreur lors de la récupération de la conversation:', error);
      return res.status(500).send('Erreur lors de la récupération de la conversation.');
    }
    if (results.length === 0) {
      return res.status(404).send('Conversation non trouvée.');
    }

    const conversation = results[0];

    const messagesQuery = 'SELECT * FROM messages WHERE conversation_id = ?';
    db.query(messagesQuery, [conversation.id], (msgError, msgResults) => {
      if (msgError) {
        console.error('Erreur lors de la récupération des messages:', msgError);
        return res.status(500).send('Erreur lors de la récupération des messages.');
      }
      conversation.messages = msgResults;
      res.json(conversation);
    });
  });
};
