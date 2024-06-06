const getAllAccommodations = async (req, res, db) => {
  const query = `
    SELECT id, adress, city, rent, disponibility, id_user, image, surface_area, description, property_type
    FROM accommodations
  `;

  try {
    const [results] = await db.execute(query);
    res.json(results);
  } catch (error) {
    console.error('Erreur lors de la récupération des accommodations:', error);
    res.status(500).send('Erreur lors de la récupération des accommodations.');
  }
};

const likeAccommodation = async (req, res, db, io) => {
  const accommodationId = req.params.id;
  const userId = req.body.id_user;

  if (!userId) {
    return res.status(400).send('User ID is required');
  }

  const checkQuery = `
    SELECT * FROM likes
    WHERE id_accommodation = ? AND id_user = ?
  `;

  try {
    const [checkResults] = await db.execute(checkQuery, [accommodationId, userId]);
    if (checkResults.length > 0) {
      return res.status(409).send('User has already liked this accommodation.');
    }

    const query = `
      INSERT INTO likes (id_accommodation, id_user)
      VALUES (?, ?)
    `;

    await db.execute(query, [accommodationId, userId]);
    io.emit('likeAdded', { accommodationId });
    res.status(201).send('Like ajouté avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'ajout du like:', error);
    res.status(500).send('Erreur lors de l\'ajout du like.');
  }
};

const getLikesForAccommodation = async (req, res, db) => {
  const { accommodationId } = req.params;

  const query = `
    SELECT u.id, u.firstname, u.lastname, u.email, u.avatar
    FROM likes l
    JOIN users u ON l.id_user = u.id
    WHERE l.id_accommodation = ?
  `;

  try {
    const [results] = await db.execute(query, [accommodationId]);
    res.json(results);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs ayant aimé la propriété:', error);
    res.status(500).send('Erreur lors de la récupération des utilisateurs.');
  }
};

const acceptTenant = async (req, res, db, io) => {
  const { ownerId, tenantId, accommodationId } = req.body;

  try {
    // Vérifiez que le propriétaire possède la propriété
    const checkQuery = `
      SELECT * FROM accommodations
      WHERE id = ? AND id_user = ?
    `;
    const [checkResults] = await db.execute(checkQuery, [accommodationId, ownerId]);
    if (checkResults.length === 0) {
      return res.status(403).send('Vous ne possédez pas cette propriété.');
    }

    // Vérifiez que le tenant a bien aimé la propriété
    const likeCheckQuery = `
      SELECT * FROM likes
      WHERE id_accommodation = ? AND id_user = ?
    `;
    const [likeCheckResults] = await db.execute(likeCheckQuery, [accommodationId, tenantId]);
    if (likeCheckResults.length === 0) {
      return res.status(403).send('Le locataire n\'a pas aimé cette propriété.');
    }

    // Créez la conversation entre le propriétaire et le locataire
    const conversationQuery = `
      INSERT INTO conversations (user1_id, user2_id)
      VALUES (?, ?)
    `;
    const [conversationResults] = await db.execute(conversationQuery, [ownerId, tenantId]);

    // Supprimez l'entrée dans la table likes
    const deleteLikeQuery = `
      DELETE FROM likes
      WHERE id_accommodation = ? AND id_user = ?
    `;
    await db.execute(deleteLikeQuery, [accommodationId, tenantId]);

    io.emit('tenantAccepted', { accommodationId, tenantId });

    res.status(201).json({ id: conversationResults.insertId });
  } catch (error) {
    console.error('Erreur lors de l\'acceptation du locataire:', error);
    res.status(500).send('Erreur lors de l\'acceptation du locataire.');
  }
};

module.exports = {
  getAllAccommodations,
  likeAccommodation,
  getLikesForAccommodation,
  acceptTenant
};
