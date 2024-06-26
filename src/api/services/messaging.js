const createConversationService = async (db, user1_id, user2_id) => {
  const query = 'INSERT INTO conversations (user1_id, user2_id) VALUES (?, ?)';
  const [results] = await db.execute(query, [user1_id, user2_id]);
  return { id: results.insertId };
};

const getConversationsService = async (db, userId) => {
  const query = `
    SELECT c.*, 
      CONCAT(u1.firstname, ' ', u1.lastname) AS user1_name,
      u1.avatar AS user1_avatar,
      CONCAT(u2.firstname, ' ', u2.lastname) AS user2_name,
      u2.avatar AS user2_avatar,
      (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_message
    FROM conversations c
    JOIN users u1 ON c.user1_id = u1.id
    JOIN users u2 ON c.user2_id = u2.id
    WHERE c.user1_id = ? OR c.user2_id = ?
  `;
  const [results] = await db.execute(query, [userId, userId]);
  return results;
};

const sendMessageService = async (db, conversation_id, sender_id, content) => {
  const query = 'INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)';
  const [results] = await db.execute(query, [conversation_id, sender_id, content]);
  return { id: results.insertId };
};

const getMessagesService = async (db, conversationId) => {
  const query = `
    SELECT m.*, u.firstname AS sender_firstname, u.lastname AS sender_lastname, u.avatar AS sender_avatar
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.conversation_id = ?
    ORDER BY m.created_at ASC
  `;
  const [results] = await db.execute(query, [conversationId]);
  return results;
};

const getConversationBetweenUsersService = async (db, user1_id, user2_id) => {
  const query = `
    SELECT * FROM conversations 
    WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
  `;
  const [results] = await db.execute(query, [user1_id, user2_id, user2_id, user1_id]);
  if (results.length === 0) {
    throw new Error('Conversation non trouvée.');
  }

  const conversation = results[0];
  const messagesQuery = 'SELECT * FROM messages WHERE conversation_id = ?';
  const [msgResults] = await db.execute(messagesQuery, [conversation.id]);
  conversation.messages = msgResults;
  return conversation;
};

module.exports = {
  createConversationService,
  getConversationsService,
  sendMessageService,
  getMessagesService,
  getConversationBetweenUsersService
};
