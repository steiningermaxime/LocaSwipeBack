const {
  getAllAccommodationsService,
  likeAccommodationService,
  getLikesForAccommodationService,
  acceptTenantService
} = require('../../services/accommodations');

const getAllAccommodations = async (req, res, db) => {
  try {
    const results = await getAllAccommodationsService(db);
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

  try {
    await likeAccommodationService(db, accommodationId, userId);
    io.emit('likeAdded', { accommodationId });
    res.status(201).send('Like ajouté avec succès');
  } catch (error) {
    if (error.message === 'User has already liked this accommodation.') {
      return res.status(409).send(error.message);
    }
    console.error('Erreur lors de l\'ajout du like:', error);
    res.status(500).send('Erreur lors de l\'ajout du like.');
  }
};

const getLikesForAccommodation = async (req, res, db) => {
  const accommodationId = req.params.accommodationId;

  try {
    const results = await getLikesForAccommodationService(db, accommodationId);
    res.json(results);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs ayant aimé la propriété:', error);
    res.status(500).send('Erreur lors de la récupération des utilisateurs.');
  }
};

const acceptTenant = async (req, res, db, io) => {
  const { ownerId, tenantId, accommodationId } = req.body;

  try {
    const result = await acceptTenantService(db, ownerId, tenantId, accommodationId);
    io.emit('tenantAccepted', { accommodationId, tenantId });
    res.status(201).json(result);
  } catch (error) {
    if (error.message === 'Vous ne possédez pas cette propriété.' || error.message === 'Le locataire n\'a pas aimé cette propriété.') {
      return res.status(403).send(error.message);
    }
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
