const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res, db) => {
  const { firstname, lastname, email, password, roleType } = req.body; // Assurez-vous que roleType est bien envoyé
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Vérifie d'abord l'existence du rôle
    const [roleResults] = await db.execute('SELECT id FROM role WHERE type = ?', [roleType]);
    if (roleResults.length === 0) {
      return res.status(400).send('Rôle non trouvé.'); // Si aucun rôle correspondant n'est trouvé
    }
    const roleId = roleResults[0].id;

    // Insère ensuite l'utilisateur
    const [userResults] = await db.execute('INSERT INTO users (firstname, lastname, email, password) VALUES (?, ?, ?, ?)', [firstname, lastname, email, hashedPassword]);
    const userId = userResults.insertId;

    // Lie l'utilisateur au rôle dans la table attribute
    await db.execute('INSERT INTO attribute (id_user, id_role) VALUES (?, ?)', [userId, roleId]);
    
    res.status(201).send('Utilisateur inscrit avec succès et rôle attribué.');
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).send('Erreur serveur.');
  }
};

exports.login = async (req, res, db) => {
  const { email, password } = req.body;

  // Log de la requête entrante
  console.log('Login request received:', { email, password });

  try {
    // Log avant l'exécution de la requête SQL
    console.log('Executing SQL query to find user by email:', email);
    
    const [results] = await db.execute(
      'SELECT users.id, users.email, users.password, role.type AS role FROM users INNER JOIN attribute ON users.id = attribute.id_user INNER JOIN role ON attribute.id_role = role.id WHERE users.email = ?', 
      [email]
    );
    
    // Log des résultats de la requête SQL
    console.log('SQL query results:', results);

    if (results.length === 0) {
      console.log('No user found with this email:', email);
      return res.status(401).send("Email ou mot de passe incorrect.");
    }

    const user = results[0];
    
    // Log avant la comparaison des mots de passe
    console.log('Comparing passwords for user:', user);

    const passwordMatch = await bcrypt.compare(password, user.password);
    
    // Log du résultat de la comparaison des mots de passe
    console.log('Password match:', passwordMatch);

    if (!passwordMatch) {
      console.log('Incorrect password for user:', email);
      return res.status(401).send("Email ou mot de passe incorrect.");
    }

    const { id, email: userEmail, role } = user;
    
    // Log avant la génération du token JWT
    console.log('Generating JWT for user:', { id, role });

    const token = jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    
    // Log du token généré
    console.log('JWT generated:', token);

    // Log avant l'envoi de la réponse réussie
    console.log('Login successful for user:', { id, email: userEmail, role });

    res.status(200).json({ message: "Connexion réussie.", token, role, id });
  } catch (error) {
    // Log de l'erreur attrapée
    console.error('Erreur lors de la connexion:', error);
    res.status(500).send('Erreur lors de la connexion.');
  }
};