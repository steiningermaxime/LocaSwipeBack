// accomodationController.js
exports.getAllAccommodations = async (req, res, db) => {
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

exports.likeAccommodation = async (req, res, db) => {
  const accommodationId = req.params.id;
  const userId = req.body.id_user;

  if (!userId) {
    return res.status(400).send('User ID is required');
  }

  const query = `
    INSERT INTO likes (id_accommodation, id_user)
    VALUES (?, ?)
  `;

  try {
    await db.execute(query, [accommodationId, userId]);
    res.status(201).send('Like ajouté avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'ajout du like:', error);
    res.status(500).send('Erreur lors de l\'ajout du like.');
  }
};
