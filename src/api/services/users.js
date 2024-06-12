const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const registerService = async (db, firstname, email, password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.execute('INSERT INTO users (firstname, email, password) VALUES (?, ?, ?)', [firstname, email, hashedPassword]);
    return 'Utilisateur créé avec succès.';
};

const loginService = async (db, email, password) => {
    const [results] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (results.length === 0 || !(await bcrypt.compare(password, results[0].password))) {
        throw new Error('Email ou mot de passe incorrect.');
    }
    const token = jwt.sign({ id: results[0].id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    return { message: "Connexion réussie.", token };
};

const getAllUsersService = async (db) => {
    const query = `
        SELECT u.id, u.firstname, u.lastname, u.email, u.birthdate, u.avatar, r.type AS role
        FROM users u
        LEFT JOIN attribute a ON u.id = a.id_user
        LEFT JOIN role r ON a.id_role = r.id
    `;
    const [results] = await db.execute(query);
    return results;
};

const getUserByIdService = async (db, id) => {
    const userQuery = `
        SELECT u.id, u.firstname, u.lastname, u.email, u.birthdate, u.avatar, r.type AS role
        FROM users u
        LEFT JOIN attribute a ON u.id = a.id_user
        LEFT JOIN role r ON a.id_role = r.id
        WHERE u.id = ?
    `;
    const [userResults] = await db.execute(userQuery, [id]);
    if (userResults.length === 0) {
        throw new Error("Utilisateur non trouvé.");
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

    return user;
};

const updateUserService = async (db, id, firstname, email) => {
    const [results] = await db.execute('UPDATE users SET firstname = ?, email = ? WHERE id = ?', [firstname, email, id]);
    if (results.affectedRows === 0) {
        throw new Error("Utilisateur non trouvé.");
    }
    return "Utilisateur mis à jour avec succès.";
};

const deleteUserService = async (db, id) => {
    const [results] = await db.execute('DELETE FROM users WHERE id = ?', [id]);
    if (results.affectedRows === 0) {
        throw new Error("Utilisateur non trouvé.");
    }
    return "Utilisateur supprimé avec succès.";
};

module.exports = {
    registerService,
    loginService,
    getAllUsersService,
    getUserByIdService,
    updateUserService,
    deleteUserService
};
