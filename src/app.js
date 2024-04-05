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

// Importation et utilisation des routes
const indexRoutes = require('./api/routes/routes')(db); 
app.use('/api', indexRoutes);


// Route de base pour tester que l'API fonctionne
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Middleware d'erreur global ajouté à la fin
app.use((err, req, res, next) => {
  console.error('Erreur globale:', err);

  // Gestion de l'erreur de doublon pour la clé 'email_unique'
  if (err.code === 'ER_DUP_ENTRY' || err.errno === 1062) {
    return res.status(409).json({
      status: 'error',
      message: 'Cette adresse email est déjà utilisée.',
    });
  }

  // Pour toutes les autres erreurs non gérées
  res.status(500).json({
    status: 'error',
    message: 'Une erreur serveur est survenue.',
  });
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
