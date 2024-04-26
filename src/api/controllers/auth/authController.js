const bcrypt = require('bcrypt');
const { json } = require('body-parser');
const jwt = require('jsonwebtoken');

exports.register = async (req, res, db) => {
    const { firstname, lastname, email, password, roleType } = req.body; // Assurez-vous que roleType est bien envoyé
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        return res.json({message: req.body});
        
        // Vérifie d'abord l'existence du rôle
        db.query('SELECT id FROM role WHERE type = ?', [roleType], async (error, roleResults) => {
            if (error) {
                console.error('Erreur lors de la recherche du rôle:', error);
                return res.status(500).send('Erreur lors de la recherche du rôle.');
            }
            if (roleResults.length === 0) {
                return res.status(400).send('Rôle non trouvé.'); // Si aucun rôle correspondant n'est trouvé
            }
            const roleId = roleResults[0].id;

            // Insère ensuite l'utilisateur
            db.query('INSERT INTO users (firstname, lastname, email, password) VALUES (?, ?, ?, ?)', [firstname, lastname, email, hashedPassword], (error, userResults) => {
                if (error) {
                    console.error('Erreur lors de la création de l’utilisateur:', error);
                    return res.status(500).send('Erreur lors de la création de l’utilisateur.');
                }
                const userId = userResults.insertId;

                // Lie l'utilisateur au rôle dans la table attribute
                db.query('INSERT INTO attribute (id_user, id_role) VALUES (?, ?)', [userId, roleId], (error, attributeResults) => {
                    if (error) {
                        console.error('Erreur lors de la liaison utilisateur-rôle:', error);
                        return res.status(500).send('Erreur lors de l’attribution du rôle à l’utilisateur.');
                    }
                    res.status(201).send('Utilisateur inscrit avec succès et rôle attribué.');
                });
            });
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
