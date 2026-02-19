const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('index', { activePage: 'home' });
});

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

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
