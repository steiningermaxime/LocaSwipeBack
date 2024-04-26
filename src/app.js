require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors()); 
app.use(express.json());

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

const indexRoutes = require('./api/routes/routes')(db);
app.use('/api', indexRoutes);

app.use('/api-locaswipe', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use((err, req, res, next) => {
    console.error('Erreur globale:', err);
    if (err.code === 'ER_DUP_ENTRY' || err.errno === 1062) {
        return res.status(409).json({
            status: 'error',
            message: 'Cette adresse email est déjà utilisée.',
        });
    }
    res.status(500).json({
        status: 'error',
        message: 'Une erreur serveur est survenue.',
    });
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
