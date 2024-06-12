const { registerService, loginService } = require('../../services/auth');

exports.register = async (req, res, db) => {
  const { firstname, lastname, email, password, roleType } = req.body;

  try {
    const message = await registerService(db, firstname, lastname, email, password, roleType);
    res.status(201).send(message);
  } catch (error) {
    if (error.message === 'Rôle non trouvé.') {
      return res.status(400).send(error.message);
    }
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).send('Erreur serveur.');
  }
};

exports.login = async (req, res, db) => {
  const { email, password } = req.body;

  try {
    const { message, token, role, id } = await loginService(db, email, password);
    res.status(200).json({ message, token, role, id });
  } catch (error) {
    if (error.message === 'Email ou mot de passe incorrect.') {
      return res.status(401).send(error.message);
    }
    console.error('Erreur lors de la connexion:', error);
    res.status(500).send('Erreur lors de la connexion.');
  }
};
