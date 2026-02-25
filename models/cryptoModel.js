const { Crypto } = require('./entities');

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

module.exports = {cryptoExist, create, findAllNewest};
