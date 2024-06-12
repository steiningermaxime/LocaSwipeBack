const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const registerService = async (db, firstname, lastname, email, password, roleType) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  // Vérifie d'abord l'existence du rôle
  const [roleResults] = await db.execute('SELECT id FROM role WHERE type = ?', [roleType]);
  if (roleResults.length === 0) {
    throw new Error('Rôle non trouvé.');
  }
  const roleId = roleResults[0].id;

  // Insère ensuite l'utilisateur
  const [userResults] = await db.execute(
    'INSERT INTO users (firstname, lastname, email, password) VALUES (?, ?, ?, ?)', 
    [firstname, lastname, email, hashedPassword]
  );
  const userId = userResults.insertId;

  // Lie l'utilisateur au rôle dans la table attribute
  await db.execute('INSERT INTO attribute (id_user, id_role) VALUES (?, ?)', [userId, roleId]);

  return 'Utilisateur inscrit avec succès et rôle attribué.';
};

const loginService = async (db, email, password) => {
  const [results] = await db.execute(
    'SELECT users.id, users.email, users.password, role.type AS role FROM users INNER JOIN attribute ON users.id = attribute.id_user INNER JOIN role ON attribute.id_role = role.id WHERE users.email = ?', 
    [email]
  );
  if (results.length === 0 || !(await bcrypt.compare(password, results[0].password))) {
    throw new Error('Email ou mot de passe incorrect.');
  }
  
  const { id, role } = results[0];
  const token = jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '24h' });

  return { message: 'Connexion réussie.', token, role, id };
};

module.exports = {
  registerService,
  loginService
};
