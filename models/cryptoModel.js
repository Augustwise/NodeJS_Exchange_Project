const { Crypto, User } = require('./entities');

/**
 * Checks whether a cryptocurrency with the given name already exists.
 * Returns true / false.
 */
async function cryptoExist(cryptoName) {
    const crypto = await Crypto.findOne({
        where: { cryptoName: cryptoName.toLowerCase() },
        attributes: ['id'],
        raw: true
    });
    return Boolean(crypto);
}

/**
 * Creates a new cryptocurrency record in the database.
 */
async function create({cryptoName, creator, isApproved}) {
    await Crypto.create({ cryptoName, creator, isApproved });
}

/**
 * Updates cryptocurrency fields by its ID.
 * Returns the number of updated rows.
 */
async function updateById(cryptoId, updateData) {
    const [updatedRows] = await Crypto.update(
        updateData,
        { where: { id: cryptoId } }
    );
    return updatedRows;
}

/**
 * Deletes a cryptocurrency by its ID.
 * Returns the number of deleted rows.
 */
async function deleteById(cryptoId) {
    return Crypto.destroy({
        where: { id: cryptoId }
    });
}

/**
 * Loads all cryptocurrencies sorted from newest to oldest.
 */
async function findAllNewest() {
    return Crypto.findAll({
        order: [['id', 'DESC']],
        raw: true
    });
}

/**
 * Loads all unapproved cryptocurrencies for the admin panel.
 * Includes basic information about the author.
 */
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

/**
 * Finds a cryptocurrency by ID and returns its basic fields.
 * Returns null if the record does not exist.
 */
async function findById(cryptoId) {
    const crypto = await Crypto.findByPk(cryptoId, {
        attributes: ['id', 'cryptoName', 'creator', 'isApproved'],
        raw: true
    });
    return crypto || null;
}

/**
 * Approves a pending cryptocurrency by its ID.
 * Returns the number of updated rows.
 */
async function approveById(cryptoId) {
    const [updatedRows] = await Crypto.update(
        { isApproved: true },
        { where: { id: cryptoId, isApproved: false } }
    );

    return updatedRows;
}

/**
 * Rejects a pending cryptocurrency by removing it from the database.
 * Returns the number of deleted rows.
 */
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
    rejectById,
    updateById,
    deleteById
};
