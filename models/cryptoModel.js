const dbPool = require('../db');

async function cryptoExist(cryptoName) {
    const [rows] = await dbPool.query(
        'SELECT id FROM Crypto WHERE cryptoName = ? LIMIT 1',
        [cryptoName.toLowerCase()]
    );
    return rows.length > 0;
}

async function create({cryptoName, creator, isApproved}) {
    await dbPool.query(
        'INSERT INTO Crypto (cryptoName, creator, isApproved) VALUES (?, ?, ?)',
        [cryptoName, creator, isApproved]
    );
}

module.exports = {cryptoExist, create};
