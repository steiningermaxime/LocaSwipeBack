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
