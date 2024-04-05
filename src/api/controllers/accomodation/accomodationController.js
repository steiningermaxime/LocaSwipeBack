const jwt = require('jsonwebtoken');

exports.getAllAccommodations = (req, res, db) => {
  // Vérification du jeton JWT
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.sendStatus(401);
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    // Récupération de la liste des accommodations depuis la base de données
    const query = `
      SELECT * FROM accommodations
    `;
    db.query(query, (error, results) => {
      if (error) {
        console.error('Erreur lors de la récupération des accommodations:', error);
        return res.status(500).send('Erreur lors de la récupération des accommodations.');
      }
      res.json(results);
    });
  });
};
