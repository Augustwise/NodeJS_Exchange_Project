const { Crypto, User } = require('./entities');

async function cryptoExist(cryptoName) {
    const crypto = await Crypto.findOne({
        where: { cryptoName: cryptoName.toLowerCase() },
        attributes: ['id'],
        raw: true
    });
    return Boolean(crypto);
}

async function create({cryptoName, creator, isApproved}) {
    await Crypto.create({ cryptoName, creator, isApproved });
}

async function findAllNewest() {
    return Crypto.findAll({
        order: [['id', 'DESC']],
        raw: true
    });
}

async function findPendingForAdminPanel() {
    const pendingCryptos = await Crypto.findAll({
        where: { isApproved: false },
        attributes: ['id', 'cryptoName', 'creator', 'isApproved'],
        include: [
            {
                model: User,
                as: 'author',
                attributes: ['id', 'name', 'surname', 'email'],
                required: false
            }
        ],
        order: [['id', 'ASC']]
    });

    return pendingCryptos.map((crypto) => crypto.get({ plain: true }));
}

async function findById(cryptoId) {
    const crypto = await Crypto.findByPk(cryptoId, {
        attributes: ['id', 'cryptoName', 'creator', 'isApproved'],
        raw: true
    });
    return crypto || null;
}

async function approveById(cryptoId) {
    const [updatedRows] = await Crypto.update(
        { isApproved: true },
        { where: { id: cryptoId, isApproved: false } }
    );

    return updatedRows;
}

async function rejectById(cryptoId) {
    return Crypto.destroy({
        where: { id: cryptoId, isApproved: false }
    });
}

module.exports = {
    cryptoExist,
    create,
    findAllNewest,
    findPendingForAdminPanel,
    findById,
    approveById,
    rejectById
};

