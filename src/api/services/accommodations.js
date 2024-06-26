const getAllAccommodationsService = async (db) => {
    const query = `
      SELECT id, address, city, rent, disponibility, id_user, image, surface_area, description, property_type
      FROM accommodations
    `;
    const [results] = await db.execute(query);
    return results;
  };
  
  const likeAccommodationService = async (db, accommodationId, userId) => {
    const checkQuery = `
      SELECT * FROM likes
      WHERE id_accommodation = ? AND id_user = ?
    `;
    const [checkResults] = await db.execute(checkQuery, [accommodationId, userId]);
    if (checkResults.length > 0) {
      throw new Error('User has already liked this accommodation.');
    }
  
    const query = `
      INSERT INTO likes (id_accommodation, id_user)
      VALUES (?, ?)
    `;
    await db.execute(query, [accommodationId, userId]);
  };
  
  const getLikesForAccommodationService = async (db, accommodationId) => {
    const query = `
      SELECT u.id, u.firstname, u.lastname, u.email, u.avatar
      FROM likes l
      JOIN users u ON l.id_user = u.id
      WHERE l.id_accommodation = ?
    `;
    const [results] = await db.execute(query, [accommodationId]);
    return results;
  };
  
  const acceptTenantService = async (db, ownerId, tenantId, accommodationId) => {
    // Vérifier si le propriétaire possède la propriété
    const checkQuery = `
      SELECT * FROM accommodations
      WHERE id = ? AND id_user = ?
    `;
    const [checkResults] = await db.execute(checkQuery, [accommodationId, ownerId]);
    if (checkResults.length === 0) {
      throw new Error('Vous ne possédez pas cette propriété.');
    }

    // Vérifier si le locataire a aimé la propriété
    const likeCheckQuery = `
      SELECT * FROM likes
      WHERE id_accommodation = ? AND id_user = ?
    `;
    const [likeCheckResults] = await db.execute(likeCheckQuery, [accommodationId, tenantId]);
    if (likeCheckResults.length === 0) {
      throw new Error('Le locataire n\'a pas aimé cette propriété.');
    }

    // Vérifier si une conversation existe déjà
    const conversationCheckQuery = `
      SELECT * FROM conversations
      WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
    `;
    const [conversationCheckResults] = await db.execute(conversationCheckQuery, [ownerId, tenantId, tenantId, ownerId]);
    if (conversationCheckResults.length > 0) {
      return { message: 'Le locataire a déjà été accepté.' }; // Renvoie une réponse indiquant que le locataire a déjà été accepté
    }

    // Créer une nouvelle conversation
    const conversationQuery = `
      INSERT INTO conversations (user1_id, user2_id)
      VALUES (?, ?)
    `;
    const [conversationResults] = await db.execute(conversationQuery, [ownerId, tenantId]);

    // Supprimer le like après avoir accepté le locataire
    const deleteLikeQuery = `
      DELETE FROM likes
      WHERE id_accommodation = ? AND id_user = ?
    `;
    await db.execute(deleteLikeQuery, [accommodationId, tenantId]);

    return { id: conversationResults.insertId };
};

  
  module.exports = {
    getAllAccommodationsService,
    likeAccommodationService,
    getLikesForAccommodationService,
    acceptTenantService
  };
  