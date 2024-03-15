const express = require('express');

module.exports = function(db) {
  const router = express.Router();

  // Récupérer tous les utilisateurs
  router.get('/', (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Erreur lors de la récupération des utilisateurs');
      }
      res.json(results);
    });
  });


 // Créer un nouvel utilisateur
router.post('/', (req, res, next) => {
  const { firstname, email } = req.body;
  db.query('INSERT INTO users (firstname, email) VALUES (?, ?)', [firstname, email], (err, results) => {
    if (err) {
      return next(err); 
    }
    res.status(201).send('Utilisateur créé');
  });
});

  // Mettre à jour un utilisateur
  router.put('/:id', (req, res) => {
    const { firstname, email } = req.body;
    const { id } = req.params;
    db.query('UPDATE users SET firstname = ?, email = ? WHERE id = ?', [firstname, email, id], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Erreur lors de la mise à jour de l’utilisateur');
      }
      if (results.affectedRows === 0) {
        return res.status(404).send('Utilisateur non trouvé');
      }
      res.send('Utilisateur mis à jour');
    });
  });

  // Supprimer un utilisateur
  router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM users WHERE id = ?', [id], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Erreur lors de la suppression de l’utilisateur');
      }
      if (results.affectedRows === 0) {
        return res.status(404).send('Utilisateur non trouvé');
      }
      res.send('Utilisateur supprimé');
    });
  });

  return router;
};
