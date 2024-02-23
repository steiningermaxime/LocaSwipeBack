const mysql = require('mysql2');
const dbConfig = require('../../.env');

const connection = mysql.createConnection({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB
});

connection.connect(error => {
  if (error) {
    console.error('Erreur lors de la connexion à la base de données:', error);
    return;
  }
  console.log('Connexion réussie à la base de données MySQL.');
});

// Gérer la déconnexion
connection.on('error', function(err) {
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('La connexion à la base de données a été fermée.');
    // Vous pouvez ici recréer la connexion ou gérer l'erreur comme nécessaire
  } else {
    throw err;
  }
});

module.exports = connection;