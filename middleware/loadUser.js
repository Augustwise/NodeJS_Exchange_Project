// middleware/loadUser.js — attaches the logged-in user to every request.

const UserModel = require('../models/userModel');

async function loadUser(req, res, next) {
    res.locals.currentUser = null;
    req.currentUser = null;

    // If there's no user ID in the session, skip the DB query and just call next()
    if (!req.session.userId) {
        return next();
    }

    try {
        const user = await UserModel.findByIdForSession(req.session.userId);

        if (!user) {
            // User was deleted from DB — clear the stale session
            req.session.destroy();
            return next();
        }
        let isAdmin = false;
        try {
            isAdmin = await UserModel.hasRole(user.id, 'Admin');
        } catch (error) {
            console.error('Failed to load user role:', error);
        }

        user.isAdmin = isAdmin;

        req.currentUser        = user;
        res.locals.currentUser = user;
    } catch (error) {
        console.error('Failed to load current user:', error);
    }

    return next();
}

module.exports = loadUser;
