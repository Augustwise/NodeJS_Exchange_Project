const cryptoModel = require('../models/cryptoModel'); 

async function showCryptPage(req, res){
    try {
        const cryptos = await cryptoModel.findAllNewest();

        res.render('crypt', { 
            activePage: 'crypt',
            cryptos: cryptos 
        });
    } catch (error) {
        console.error("Помилка завантаження сторінки:", error);
        res.status(500).send("Internal Server Error");
    }
}

async function createCrypto(req, res){
    try {
        const { cryptoName } = req.body;
        
        if (!req.currentUser) {
            return res.status(401).send("You must be logged in to add a crypto. <a href='/login'>Login</a>");
        }

        const creator = req.currentUser.id;

        const exists = await cryptoModel.cryptoExist(cryptoName);
        if (exists) {
            return res.status(400).send("This cryptocurrency already exists! <a href='/create'>Go back</a>");
        }

        await cryptoModel.create({
            cryptoName: cryptoName,
            creator: creator,
            isApproved: false 
        });

        res.redirect('/crypt'); 

    } catch (error) {
        console.error("Помилка збереження крипти:", error);
        res.status(500).send("Internal Server Error");
    }
}

module.exports = {showCryptPage, createCrypto};
