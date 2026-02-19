const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

let curencyChange = {
    rates: {},
    lastUpdated: null
};

async function updateCurrencyRates() {
    try {
        const response = await fetch('https://api.frankfurter.app/latest?from=USD');
        const data = await response.json();
        curencyChange.rates = data.rates;
        curencyChange.rates['USD'] = 1; //this is because the API does not include the base currency in the rates
        curencyChange.lastUpdated = new Date();
    } catch (error) {
        console.error('Error fetching currency rates:', error);
    }
}


setInterval(updateCurrencyRates, 60 * 60 * 1000);

app.get('/', (req, res) => {
    res.render('index', {
        activePage: 'home',
        rates: curencyChange.rates,
        lastUpdated: curencyChange.lastUpdated,
    });
});

console.log(curencyChange.rates);

app.get('/login', (req, res) => {
    res.render('login', { activePage: '' });
});

app.get('/register', (req, res) => {
    res.render('register', { activePage: '' });
});

app.get('/crypt', (req, res) => {
    res.render('crypt', { activePage: 'crypt' });
});

app.get('/about', (req, res) => {
    res.render('about', { activePage: 'about' });
});

app.get('/contact', (req, res) => {
    res.render('contact', { activePage: 'contact' });
});

updateCurrencyRates().then(() => {
    
    setInterval(updateCurrencyRates, 60 * 60 * 1000);
    
    app.listen(PORT, () => {
        console.log(`Server is running at http://localhost:${PORT}`);
        console.log(curencyChange.rates);
    });
    
}).catch(err => {
    console.error("ERROR API doesn`t work:", err);
});
