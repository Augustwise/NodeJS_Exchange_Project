import * as cryptoModel from '../models/cryptoModel.js';

async function showCryptPage(req, res){
    try {
        const cryptos = await cryptoModel.findAllNewest();
        res.render('crypt', { 
            activePage: 'crypt',
            cryptos: cryptos 
        });
    } catch (error) {
        console.error("Error loading page:", error);
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
        console.error("Error saving cryptocurrency:", error);
        res.status(500).send("Internal Server Error");
    }
}

async function showEditPage(req, res) {
    try {
        if (!req.currentUser) return res.status(401).redirect('/login');

        const coinId = req.params.id;
        const coin = await cryptoModel.findById(coinId); 

        if (!coin) {
            return res.status(404).send("Cryptocurrency not found");
        }

        if (coin.creator !== req.currentUser.id) {
            return res.status(403).send("You don't have permission to edit this coin.");
        }

        res.render('editCrypto', { 
            activePage: 'crypt',
            crypto: coin 
        });
    } catch (error) {
        console.error("Error loading edit page:", error);
        res.status(500).send("Internal Server Error");
    }
}

async function updateCrypto(req, res) {
    try {
        if (!req.currentUser) return res.status(401).redirect('/login');

        const coinId = req.params.id;
        const { cryptoName } = req.body;
        
        const coin = await cryptoModel.findById(coinId);

        if (!coin || coin.creator !== req.currentUser.id) {
            return res.status(403).send("Permission denied or coin not found.");
        }

        await cryptoModel.updateById(coinId, { cryptoName: cryptoName, isApproved: false });

        res.redirect('/crypt');
    } catch (error) {
        console.error("Error updating cryptocurrency:", error);
        res.status(500).send("Internal Server Error");
    }
}

async function deleteCrypto(req, res) {
    try {
        if (!req.currentUser) return res.status(401).redirect('/login');

        const coinId = req.params.id;
        const coin = await cryptoModel.findById(coinId);

        if (!coin || coin.creator !== req.currentUser.id) {
            return res.status(403).send("Permission denied or coin not found.");
        }

        await cryptoModel.deleteById(coinId);

        res.redirect('/crypt');
    } catch (error) {
        console.error("Error deleting cryptocurrency:", error);
        res.status(500).send("Internal Server Error");
    }
}

export {
    showCryptPage,
    createCrypto,
    showEditPage,
    updateCrypto,
    deleteCrypto
};
