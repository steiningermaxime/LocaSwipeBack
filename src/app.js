require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');

const app = express();
const port = process.env.PORT || 3000;

// Middleware pour parser le JSON
app.use(express.json());

// Configuration de la connexion à la base de données MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) {
    console.error('Erreur de connexion à la base de données:', err);
    return;
  }
  console.log('Connecté à la base de données MySQL');
});

// Importation des routes
const userRoutes = require('./api/routes/users/userRoutes')(db);

// Utilisation des routes
app.use('/api/users', userRoutes);

// Route de base pour tester que l'API fonctionne
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
// Après toutes les routes
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Gestion de l'erreur de doublon spécifique à MySQL
  if (err.code === 'ER_DUP_ENTRY' || err.errno === 1062) {
    res.status(409).send('Erreur : un enregistrement similaire existe déjà.');
  } else {
    // Pour toutes les autres erreurs non gérées
    res.status(500).send('Une erreur est survenue.');
  }
});
