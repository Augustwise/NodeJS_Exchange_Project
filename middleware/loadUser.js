// middleware/loadUser.js — attaches the logged-in user to every request.

const dbPool = require('../db');

async function loadUser(req, res, next) {
    res.locals.currentUser = null;
    req.currentUser = null;

    // If there's no user ID in the session, skip the DB query and just call next()
    if (!req.session.userId) {
        return next();
    }

    try {
        const [users] = await dbPool.query(
            `SELECT id, name, surname,
                    DATE_FORMAT(date_of_birth, '%Y-%m-%d') AS date_of_birth,
                    country, email
             FROM User
             WHERE id = ? LIMIT 1`,
            [req.session.userId]
        );

        if (users.length === 0) {
            // User was deleted from DB — clear the stale session
            req.session.destroy();
            return next();
        }

        req.currentUser        = users[0];
        res.locals.currentUser = users[0];
    } catch (error) {
        console.error('Failed to load current user:', error);
    }

    return next();
}

module.exports = loadUser;
