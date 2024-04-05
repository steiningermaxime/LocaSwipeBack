const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res, db) => {
    const { firstname, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.query('INSERT INTO users (firstname, email, password) VALUES (?, ?, ?)', [firstname, email, hashedPassword], (error, results) => {
            if (error) {
                console.error('Erreur lors de la création de l’utilisateur:', error);
                return res.status(500).send('Erreur lors de la création de l’utilisateur.');
            }
            res.status(201).send('Utilisateur créé avec succès.');
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

exports.getAllUsers = async (req, res, db) => {
    const query = `
        SELECT u.id, u.firstname, u.lastname, u.email, u.birthdate, u.avatar, r.type AS role
        FROM users u
        LEFT JOIN attribute a ON u.id = a.id_user
        LEFT JOIN role r ON a.id_role = r.id
    `;
    db.query(query, (error, results) => {
        if (error) {
            console.error('Erreur lors de la récupération des utilisateurs et de leurs rôles:', error);
            return res.status(500).send('Erreur lors de la récupération des utilisateurs.');
        }
        res.json(results);
    });
};


exports.getUserById = async (req, res, db) => {
    const { id } = req.params;
    const query = `
        SELECT u.id, u.firstname, u.lastname, u.email, u.birthdate, u.avatar, r.type AS role
        FROM users u
        LEFT JOIN attribute a ON u.id = a.id_user
        LEFT JOIN role r ON a.id_role = r.id
        WHERE u.id = ?
    `;
    db.query(query, [id], (error, results) => {
        if (error) {
            console.error('Erreur lors de la récupération de l’utilisateur et de son rôle:', error);
            return res.status(500).send('Erreur lors de la récupération de l’utilisateur.');
        }
        if (results.length === 0) {
            return res.status(404).send("Utilisateur non trouvé.");
        }
        res.json(results[0]);
    });
};


exports.updateUser = async (req, res, db) => {
    const { id } = req.params;
    const { firstname, email } = req.body; // Suppose que l'on peut mettre à jour le prénom et l'email
    db.query('UPDATE users SET firstname = ?, email = ? WHERE id = ?', [firstname, email, id], (error, results) => {
        if (error) {
            console.error('Erreur lors de la mise à jour de l’utilisateur:', error);
            return res.status(500).send('Erreur lors de la mise à jour de l’utilisateur.');
        }
        if (results.affectedRows === 0) {
            return res.status(404).send("Utilisateur non trouvé.");
        }
        res.send("Utilisateur mis à jour avec succès.");
    });
};

exports.deleteUser = async (req, res, db) => {
    const { id } = req.params;
    db.query('DELETE FROM users WHERE id = ?', [id], (error, results) => {
        if (error) {
            console.error('Erreur lors de la suppression de l’utilisateur:', error);
            return res.status(500).send('Erreur lors de la suppression de l’utilisateur.');
        }
        if (results.affectedRows === 0) {
            return res.status(404).send("Utilisateur non trouvé.");
        }
        res.send("Utilisateur supprimé avec succès.");
    });
};
