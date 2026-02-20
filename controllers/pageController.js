// controllers/pageController.js — renders every HTML page of the site.
//
// Each function here corresponds to one URL.

const { currencyData } = require('../utils/currencyService');
const { formatDate }   = require('../utils/dateUtils');

function home(req, res) {
    res.render('index', {
        activePage:  'home',
        rates:       currencyData.rates,
        lastUpdated: currencyData.lastUpdated
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
    res.render('crypt', { activePage: 'crypt' });
}

function aboutPage(_req, res) {
    res.render('about', { activePage: 'about' });
}

function contactPage(_req, res) {
    res.render('contact', { activePage: 'contact' });
}

module.exports = { home, loginPage, registerPage, accountPage, cryptPage, aboutPage, contactPage };
