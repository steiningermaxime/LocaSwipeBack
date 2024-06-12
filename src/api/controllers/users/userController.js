const {
    registerService,
    loginService,
    getAllUsersService,
    getUserByIdService,
    updateUserService,
    deleteUserService
} = require('../../services/users');

exports.register = async (req, res, db) => {
    const { firstname, email, password } = req.body;
    try {
        const message = await registerService(db, firstname, email, password);
        res.status(201).send(message);
    } catch (error) {
        console.error('Erreur lors de la création de l’utilisateur:', error);
        res.status(500).send('Erreur serveur.');
    }
};

exports.login = async (req, res, db) => {
    const { email, password } = req.body;
    try {
        const result = await loginService(db, email, password);
        res.status(200).json(result);
    } catch (error) {
        if (error.message === 'Email ou mot de passe incorrect.') {
            return res.status(401).send(error.message);
        }
        console.error('Erreur lors de la connexion:', error);
        res.status(500).send('Erreur lors de la connexion.');
    }
};

exports.getAllUsers = async (req, res, db) => {
    try {
        const results = await getAllUsersService(db);
        res.json(results);
    } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs et de leurs rôles:', error);
        res.status(500).send('Erreur lors de la récupération des utilisateurs.');
    }
};

exports.getUserById = async (req, res, db) => {
    const { id } = req.params;
    try {
        const user = await getUserByIdService(db, id);
        res.json(user);
    } catch (error) {
        if (error.message === "Utilisateur non trouvé.") {
            return res.status(404).send(error.message);
        }
        console.error('Erreur lors de la récupération de l’utilisateur et de ses propriétés:', error);
        res.status(500).send('Erreur lors de la récupération de l’utilisateur.');
    }
};

exports.updateUser = async (req, res, db) => {
    const { id } = req.params;
    const { firstname, email } = req.body; // Suppose que l'on peut mettre à jour le prénom et l'email
    try {
        const message = await updateUserService(db, id, firstname, email);
        res.send(message);
    } catch (error) {
        if (error.message === "Utilisateur non trouvé.") {
            return res.status(404).send(error.message);
        }
        console.error('Erreur lors de la mise à jour de l’utilisateur:', error);
        res.status(500).send('Erreur lors de la mise à jour de l’utilisateur.');
    }
};

exports.deleteUser = async (req, res, db) => {
    const { id } = req.params;
    try {
        const message = await deleteUserService(db, id);
        res.send(message);
    } catch (error) {
        if (error.message === "Utilisateur non trouvé.") {
            return res.status(404).send(error.message);
        }
        console.error('Erreur lors de la suppression de l’utilisateur:', error);
        res.status(500).send('Erreur lors de la suppression de l’utilisateur.');
    }
};
