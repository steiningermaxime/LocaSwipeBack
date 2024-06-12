const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res, db) => {
    const { firstname, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [results] = await db.execute('INSERT INTO users (firstname, email, password) VALUES (?, ?, ?)', [firstname, email, hashedPassword]);
        res.status(201).send('Utilisateur créé avec succès.');
    } catch (error) {
        console.error('Erreur lors de la création de l’utilisateur:', error);
        res.status(500).send('Erreur serveur.');
    }
};

exports.login = async (req, res, db) => {
    const { email, password } = req.body;
    try {
        const [results] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (results.length === 0 || !(await bcrypt.compare(password, results[0].password))) {
            return res.status(401).send("Email ou mot de passe incorrect.");
        }
        const token = jwt.sign({ id: results[0].id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.status(200).json({ message: "Connexion réussie.", token });
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        res.status(500).send('Erreur lors de la connexion.');
    }
};

exports.getAllUsers = async (req, res, db) => {
    const query = `
        SELECT u.id, u.firstname, u.lastname, u.email, u.birthdate, u.avatar, r.type AS role
        FROM users u
        LEFT JOIN attribute a ON u.id = a.id_user
        LEFT JOIN role r ON a.id_role = r.id
    `;
    try {
        const [results] = await db.execute(query);
        res.json(results);
    } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs et de leurs rôles:', error);
        res.status(500).send('Erreur lors de la récupération des utilisateurs.');
    }
};

exports.getUserById = async (req, res, db) => {
    const { id } = req.params;
    const userQuery = `
        SELECT u.id, u.firstname, u.lastname, u.email, u.birthdate, u.avatar, r.type AS role
        FROM users u
        LEFT JOIN attribute a ON u.id = a.id_user
        LEFT JOIN role r ON a.id_role = r.id
        WHERE u.id = ?
    `;

    try {
        const [userResults] = await db.execute(userQuery, [id]);
        if (userResults.length === 0) {
            return res.status(404).send("Utilisateur non trouvé.");
        }

        const user = userResults[0];
        if (user.role === 'owner') {
            const accommodationsQuery = `
                SELECT 
                    a.id, 
                    a.address, 
                    a.city, 
                    a.rent, 
                    a.disponibility, 
                    a.image, 
                    a.surface_area, 
                    a.description, 
                    a.property_type,
                    (SELECT COUNT(*) FROM likes l WHERE l.id_accommodation = a.id) AS likes_count
                FROM accommodations a
                WHERE a.id_user = ?
            `;
            const [accommodationsResults] = await db.execute(accommodationsQuery, [id]);
            user.accommodations = accommodationsResults;
        }

        res.json(user);
    } catch (error) {
        console.error('Erreur lors de la récupération de l’utilisateur et de ses propriétés:', error);
        res.status(500).send('Erreur lors de la récupération de l’utilisateur.');
    }
};

exports.updateUser = async (req, res, db) => {
    const { id } = req.params;
    const { firstname, email } = req.body; // Suppose que l'on peut mettre à jour le prénom et l'email
    try {
        const [results] = await db.execute('UPDATE users SET firstname = ?, email = ? WHERE id = ?', [firstname, email, id]);
        if (results.affectedRows === 0) {
            return res.status(404).send("Utilisateur non trouvé.");
        }
        res.send("Utilisateur mis à jour avec succès.");
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l’utilisateur:', error);
        res.status(500).send('Erreur lors de la mise à jour de l’utilisateur.');
    }
};

exports.deleteUser = async (req, res, db) => {
    const { id } = req.params;
    try {
        const [results] = await db.execute('DELETE FROM users WHERE id = ?', [id]);
        if (results.affectedRows === 0) {
            return res.status(404).send("Utilisateur non trouvé.");
        }
        res.send("Utilisateur supprimé avec succès.");
    } catch (error) {
        console.error('Erreur lors de la suppression de l’utilisateur:', error);
        res.status(500).send('Erreur lors de la suppression de l’utilisateur.');
    }
};
