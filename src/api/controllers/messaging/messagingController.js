const jwt = require('jsonwebtoken');

exports.createConversation = async (req, res, db) => {
  const { user1_id, user2_id } = req.body;
  const query = 'INSERT INTO conversations (user1_id, user2_id) VALUES (?, ?)';
  
  try {
    const [results] = await db.execute(query, [user1_id, user2_id]);
    res.status(201).json({ id: results.insertId });
  } catch (error) {
    console.error('Erreur lors de la création de la conversation:', error);
    res.status(500).send('Erreur lors de la création de la conversation.');
  }
};

exports.getConversations = async (req, res, db) => {
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
  
  try {
    const [results] = await db.execute(query, [userId, userId]);
    res.json(results);
  } catch (error) {
    console.error('Erreur lors de la récupération des conversations:', error);
    res.status(500).send('Erreur lors de la récupération des conversations.');
  }
};

exports.sendMessage = async (req, res, db) => {
  const { conversation_id, sender_id, content } = req.body;
  const query = 'INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)';
  
  try {
    const [results] = await db.execute(query, [conversation_id, sender_id, content]);
    res.status(201).json({ id: results.insertId });
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);
    res.status(500).send('Erreur lors de l\'envoi du message.');
  }
};

exports.getMessages = async (req, res, db) => {
  const { conversationId } = req.params;
  const query = `
    SELECT m.*, u.firstname AS sender_firstname, u.lastname AS sender_lastname
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.conversation_id = ?
  `;
  
  try {
    const [results] = await db.execute(query, [conversationId]);
    res.json(results);
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    res.status(500).send('Erreur lors de la récupération des messages.');
  }
};

exports.getConversationBetweenUsers = async (req, res, db) => {
  const { user1_id, user2_id } = req.params;
  const query = `
    SELECT * FROM conversations 
    WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
  `;
  
  try {
    const [results] = await db.execute(query, [user1_id, user2_id, user2_id, user1_id]);
    if (results.length === 0) {
      return res.status(404).send('Conversation non trouvée.');
    }
    
    const conversation = results[0];
    const messagesQuery = 'SELECT * FROM messages WHERE conversation_id = ?';
    const [msgResults] = await db.execute(messagesQuery, [conversation.id]);
    conversation.messages = msgResults;
    res.json(conversation);
  } catch (error) {
    console.error('Erreur lors de la récupération de la conversation:', error);
    res.status(500).send('Erreur lors de la récupération de la conversation.');
  }
};
