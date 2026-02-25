function requireAdmin(req, res, next) {
    if (!req.currentUser) {
        return res.redirect('/login');
    }

    if (!req.currentUser.isAdmin) {
        return res.status(403).send('Access denied. Admins only.');
    }

    return next();
}

module.exports = requireAdmin;

