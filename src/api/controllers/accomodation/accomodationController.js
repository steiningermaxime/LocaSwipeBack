exports.getAllAccommodations = (req, res, db) => {
  const query = `
    SELECT id, adress, city, rent, disponibility, id_user, image FROM accommodations
  `;
  db.query(query, (error, results) => {
    if (error) {
      console.error('Erreur lors de la récupération des accommodations:', error);
      return res.status(500).send('Erreur lors de la récupération des accommodations.');
    }
    res.json(results);
  });
};

exports.likeAccommodation = (req, res, db) => {
  const accommodationId = req.params.id;
  const userId = req.body.id_user;

  if (!userId) {
    return res.status(400).send('User ID is required');
  }

  const query = `
    INSERT INTO likes (id_accommodation, id_user)
    VALUES (?, ?)
  `;

  db.query(query, [accommodationId, userId], (error, results) => {
    if (error) {
      console.error('Erreur lors de l\'ajout du like:', error);
      return res.status(500).send('Erreur lors de l\'ajout du like.');
    }
    res.status(201).send('Like ajouté avec succès');
  });
};
