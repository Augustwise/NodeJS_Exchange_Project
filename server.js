const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const session = require('express-session');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const currencyData = {
    rates: {},
    lastUpdated: null
};

const dbPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    ssl: { rejectUnauthorized: false }
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: process.env.AUTH_SECRET || 'dev-only-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }
}));

// Load current user on every request
app.use(async (req, res, next) => {
    res.locals.currentUser = null;
    req.currentUser = null;

    if (!req.session.userId) {
        return next();
    }

    try {
        const [users] = await dbPool.query(
            "SELECT id, name, surname, DATE_FORMAT(date_of_birth, '%Y-%m-%d') AS date_of_birth, country, email FROM User WHERE id = ? LIMIT 1",
            [req.session.userId]
        );

        if (users.length === 0) {
            req.session.destroy();
            return next();
        }

        req.currentUser = users[0];
        res.locals.currentUser = users[0];
    } catch (error) {
        console.error('Failed to load current user:', error);
    }

    return next();
});

// Convert DD.MM.YYYY or YYYY-MM-DD to YYYY-MM-DD for the database
function parseDate(dateStr) {
    if (!dateStr) return null;
    if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) {
        const [day, month, year] = dateStr.split('.');
        return `${year}-${month}-${day}`;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr;
    }
    return null;
}

// Format date from database (YYYY-MM-DD) to display format (DD.MM.YYYY)
function formatDate(dateInput) {
    if (!dateInput) return '';
    const date = new Date(dateInput);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${day}.${month}.${year}`;
}

// Fetch currency rates from external API
async function updateCurrencyRates() {
    try {
        const response = await fetch('https://api.frankfurter.app/latest?from=USD');
        const data = await response.json();
        currencyData.rates = data.rates || {};
        currencyData.rates.UAH = 43.46; // API does not provide UAH
        currencyData.rates.USD = 1;     // API does not include the base currency
        currencyData.lastUpdated = new Date();
    } catch (error) {
        console.error('Error fetching currency rates:', error);
    }
}

// --- Page routes ---

app.get('/', (req, res) => {
    res.render('index', {
        activePage: 'home',
        rates: currencyData.rates,
        lastUpdated: currencyData.lastUpdated
    });
});

app.get('/login', (req, res) => {
    if (req.currentUser) return res.redirect('/account');
    res.render('login', { activePage: '' });
});

app.get('/register', (req, res) => {
    if (req.currentUser) return res.redirect('/account');
    res.render('register', { activePage: '' });
});

app.get('/crypt',   (_req, res) => res.render('crypt',   { activePage: 'crypt' }));
app.get('/about',   (_req, res) => res.render('about',   { activePage: 'about' }));
app.get('/contact', (_req, res) => res.render('contact', { activePage: 'contact' }));

app.get('/account', (req, res) => {
    if (!req.currentUser) return res.redirect('/login');

    res.render('account', {
        activePage: 'account',
        account: {
            id: req.currentUser.id,
            name: req.currentUser.name,
            surname: req.currentUser.surname,
            dateOfBirth: formatDate(req.currentUser.date_of_birth),
            country: req.currentUser.country,
            email: req.currentUser.email
        }
    });
});

// --- Auth API routes ---

app.post('/api/auth/register', async (req, res) => {
    const { name, surname, dateOfBirth, country, email, password, confirmPassword } = req.body;

    if (!name || name.trim().length < 2) {
        return res.status(400).json({ ok: false, message: 'First name must be at least 2 characters.' });
    }
    if (!surname || surname.trim().length < 2) {
        return res.status(400).json({ ok: false, message: 'Last name must be at least 2 characters.' });
    }
    if (!parseDate(dateOfBirth)) {
        return res.status(400).json({ ok: false, message: 'Date of birth must be a valid date in DD.MM.YYYY format.' });
    }
    if (!country || country.trim().length < 2) {
        return res.status(400).json({ ok: false, message: 'Country must be at least 2 characters.' });
    }
    if (!email || !email.includes('@')) {
        return res.status(400).json({ ok: false, message: 'Please enter a valid email address.' });
    }
    if (!password || password.length < 12 || !/\d/.test(password)) {
        return res.status(400).json({ ok: false, message: 'Password must be at least 12 characters and contain at least one digit.' });
    }
    if (password !== confirmPassword) {
        return res.status(400).json({ ok: false, message: 'Passwords do not match.' });
    }

    try {
        const [existing] = await dbPool.query(
            'SELECT id FROM User WHERE email = ? LIMIT 1',
            [email.toLowerCase()]
        );

        if (existing.length > 0) {
            return res.status(409).json({ ok: false, message: 'A user with this email already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        await dbPool.query(
            'INSERT INTO User (name, surname, date_of_birth, country, email, password) VALUES (?, ?, ?, ?, ?, ?)',
            [name.trim(), surname.trim(), parseDate(dateOfBirth), country.trim(), email.toLowerCase(), hashedPassword]
        );

        return res.status(201).json({ ok: true, message: 'Registration completed successfully.' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ ok: false, message: 'A user with this email already exists.' });
        }
        console.error('Registration error:', error);
        return res.status(500).json({ ok: false, message: 'Failed to register user.' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ ok: false, message: 'Email and password are required.' });
    }

    try {
        const [users] = await dbPool.query(
            'SELECT id, name, surname, email, password FROM User WHERE email = ? LIMIT 1',
            [email.toLowerCase()]
        );

        if (users.length === 0) {
            return res.status(401).json({ ok: false, message: 'Invalid email or password.' });
        }

        const user = users[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ ok: false, message: 'Invalid email or password.' });
        }

        req.session.userId = user.id;

        return res.status(200).json({
            ok: true,
            message: `Welcome back, ${user.name}!`,
            user: { id: user.id, name: user.name, surname: user.surname, email: user.email }
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ ok: false, message: 'Failed to log in.' });
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.post('/api/auth/logout', (req, res) => {
    req.session.destroy();
    res.status(200).json({ ok: true, message: 'Logged out successfully.' });
});

// --- Start server ---

async function startServer() {
    await updateCurrencyRates();
    setInterval(updateCurrencyRates, 60 * 60 * 1000);

    try {
        const connection = await dbPool.getConnection();
        await connection.ping();
        connection.release();
        console.log('Database connection established.');
    } catch (error) {
        console.error('Database connection failed:', error.message);
    }

    app.listen(PORT, () => {
        console.log(`Server is running at http://localhost:${PORT}`);
    });
}

startServer().catch(console.error);
