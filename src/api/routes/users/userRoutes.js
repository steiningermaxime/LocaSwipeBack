const express = require('express');

module.exports = function(db) {
  const router = express.Router();

  router.get('/', (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Erreur lors de la récupération des utilisateurs');
      }
      res.json(results);
    });
  });

  return router;
};
