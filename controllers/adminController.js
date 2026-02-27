const UserModel = require('../models/userModel');
const cryptoModel = require('../models/cryptoModel');

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

async function cryptosPage(req, res) {
    try {
        const cryptos = await cryptoModel.findPendingForAdminPanel();

        return res.render('admin-cryptos', {
            activePage: 'admin-cryptos',
            cryptos,
            feedback: req.query.feedback || '',
            error: req.query.error || ''
        });
    } catch (error) {
        console.error('Failed to load admin crypto moderation page:', error);
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

async function approveCrypto(req, res) {
    const targetCryptoId = Number.parseInt(req.params.cryptoId, 10);

    if (!Number.isInteger(targetCryptoId) || targetCryptoId <= 0) {
        return res.redirect('/admin/cryptos?error=Invalid+crypto+id');
    }

    try {
        const targetCrypto = await cryptoModel.findById(targetCryptoId);

        if (!targetCrypto) {
            return res.redirect('/admin/cryptos?error=Crypto+not+found');
        }

        if (targetCrypto.isApproved) {
            return res.redirect('/admin/cryptos?error=Crypto+is+already+approved');
        }

        const updatedRows = await cryptoModel.approveById(targetCryptoId);
        if (updatedRows === 0) {
            return res.redirect('/admin/cryptos?error=Failed+to+approve+crypto');
        }

        return res.redirect('/admin/cryptos?feedback=Crypto+approved');
    } catch (error) {
        console.error('Failed to approve crypto:', error);
        return res.redirect('/admin/cryptos?error=Failed+to+approve+crypto');
    }
}

async function rejectCrypto(req, res) {
    const targetCryptoId = Number.parseInt(req.params.cryptoId, 10);

    if (!Number.isInteger(targetCryptoId) || targetCryptoId <= 0) {
        return res.redirect('/admin/cryptos?error=Invalid+crypto+id');
    }

    try {
        const targetCrypto = await cryptoModel.findById(targetCryptoId);

        if (!targetCrypto) {
            return res.redirect('/admin/cryptos?error=Crypto+not+found');
        }

        if (targetCrypto.isApproved) {
            return res.redirect('/admin/cryptos?error=Approved+crypto+cannot+be+rejected+here');
        }

        const deletedRows = await cryptoModel.rejectById(targetCryptoId);
        if (deletedRows === 0) {
            return res.redirect('/admin/cryptos?error=Failed+to+reject+crypto');
        }

        return res.redirect('/admin/cryptos?feedback=Crypto+rejected');
    } catch (error) {
        console.error('Failed to reject crypto:', error);
        return res.redirect('/admin/cryptos?error=Failed+to+reject+crypto');
    }
}

module.exports = {
    adminHome,
    usersPage,
    cryptosPage,
    grantAdmin,
    revokeAdmin,
    approveCrypto,
    rejectCrypto
};

