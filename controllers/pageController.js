// controllers/pageController.js — renders every HTML page of the site.
//
// Each function here corresponds to one URL.

const { currencyData, getHistoricalRates } = require('../utils/currencyService');
const { formatDate }   = require('../utils/dateUtils');

async function home(req, res) {
    // Fetch 30-day historical rates for every available currency (except UAH)
    const history = {};
    const rates = currencyData.rates || {};
    
    // Make sure we have rates before trying to fetch history
    const rateKeys = Object.keys(rates);
    if (rateKeys.length < 2) {
        console.warn('⚠ No currency rates available yet, only returning empty rates');
        return res.render('index', {
            activePage:  'home',
            rates:       rates,
            lastUpdated: currencyData.lastUpdated,
            history:     history
        });
    }

    try {
        const keys = rateKeys.filter(k => k && k !== 'UAH');
        console.log(`✓ Fetching history for ${keys.length} currencies`);
        
        if (keys.length > 0) {
            const settled = await Promise.allSettled(keys.map(k => getHistoricalRates(k, 30)));
            let historyCount = 0;
            keys.forEach((k, i) => {
                if (settled[i] && settled[i].status === 'fulfilled') {
                    history[k] = settled[i].value || [];
                    if (history[k].length > 0) historyCount++;
                } else {
                    history[k] = [];
                }
            });
            console.log(`✓ Got history for ${historyCount}/${keys.length} currencies`);
        }
    } catch (err) {
        console.warn('✗ Failed to fetch historical rates:', err.message);
    }

    console.log(`✓ Rendering index with ${rateKeys.length} rates and ${Object.keys(history).length} histories`);
    res.render('index', {
        activePage:  'home',
        rates:       rates,
        lastUpdated: currencyData.lastUpdated,
        history:     history
    });
}

function loginPage(req, res) {
    if (req.currentUser) return res.redirect('/account');
    res.render('login', { activePage: '' });
}

function registerPage(req, res) {
    if (req.currentUser) return res.redirect('/account');
    res.render('register', { activePage: '' });
}

function accountPage(req, res) {
    if (!req.currentUser) return res.redirect('/login');

    res.render('account', {
        activePage: 'account',
        account: {
            id:          req.currentUser.id,
            name:        req.currentUser.name,
            surname:     req.currentUser.surname,
            dateOfBirth: formatDate(req.currentUser.date_of_birth),
            country:     req.currentUser.country,
            email:       req.currentUser.email
        }
    });
}

function cryptPage(_req, res) {
    res.render('crypt', { 
        activePage: 'crypt',
        cryptos: cryptos 
    });
}

function addCrypto(_req, res){
    res.render('create', {activePage: 'create'})
}

function aboutPage(_req, res) {
    res.render('about', { activePage: 'about' });
}

function contactPage(_req, res) {
    res.render('contact', { activePage: 'contact' });
}

module.exports = { home, loginPage, registerPage, accountPage, cryptPage, addCrypto, aboutPage, contactPage };
