const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res, db) => {
    const { firstname,lastname, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.query('INSERT INTO users (firstname,lastname, email, password) VALUES (?, ?, ?)', [firstname,lastname, email, hashedPassword], (error, results) => {
            if (error) {
                console.error('Erreur lors de la création de l’utilisateur:', error);
                return res.status(500).send('Erreur lors de la création de l’utilisateur.');
            }
            res.status(201).send('Utilisateur inscrit avec succès.');
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur serveur.');
    }
};

exports.login = async (req, res, db) => {
    const { email, password } = req.body;
    db.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
        if (error) {
            console.error('Erreur lors de la connexion:', error);
            return res.status(500).send('Erreur lors de la connexion.');
        }
        if (results.length === 0 || !(await bcrypt.compare(password, results[0].password))) {
            return res.status(401).send("Email ou mot de passe incorrect.");
        }
        const token = jwt.sign({ id: results[0].id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.status(200).json({ message: "Connexion réussie.", token });
    });
};
