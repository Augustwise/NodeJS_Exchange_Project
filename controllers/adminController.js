const UserModel = require('../models/userModel');

function adminHome(_req, res) {
    return res.render('admin', { activePage: 'admin' });
}

async function usersPage(req, res) {
    try {
        const users = await UserModel.findAllForAdminPanel();

        return res.render('admin-users', {
            activePage: 'admin-users',
            users,
            currentAdminId: req.currentUser.id,
            feedback: req.query.feedback || '',
            error: req.query.error || ''
        });
    } catch (error) {
        console.error('Failed to load admin users page:', error);
        return res.status(500).send('Internal Server Error');
    }
}

async function grantAdmin(req, res) {
    const targetUserId = Number.parseInt(req.params.userId, 10);

    if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
        return res.redirect('/admin/users?error=Invalid+user+id');
    }

    try {
        const targetUser = await UserModel.findById(targetUserId);

        if (!targetUser) {
            return res.redirect('/admin/users?error=User+not+found');
        }

        await UserModel.grantRole(targetUserId, 'Admin');
        return res.redirect('/admin/users?feedback=Admin+role+granted');
    } catch (error) {
        console.error('Failed to grant admin role:', error);
        return res.redirect('/admin/users?error=Failed+to+grant+admin+role');
    }
}

async function revokeAdmin(req, res) {
    const targetUserId = Number.parseInt(req.params.userId, 10);

    if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
        return res.redirect('/admin/users?error=Invalid+user+id');
    }

    if (targetUserId === req.currentUser.id) {
        return res.redirect('/admin/users?error=You+cannot+remove+your+own+admin+role');
    }

    try {
        const targetUser = await UserModel.findById(targetUserId);

        if (!targetUser) {
            return res.redirect('/admin/users?error=User+not+found');
        }

        await UserModel.revokeRole(targetUserId, 'Admin');
        return res.redirect('/admin/users?feedback=Admin+role+removed');
    } catch (error) {
        console.error('Failed to revoke admin role:', error);
        return res.redirect('/admin/users?error=Failed+to+remove+admin+role');
    }
}

module.exports = { adminHome, usersPage, grantAdmin, revokeAdmin };

