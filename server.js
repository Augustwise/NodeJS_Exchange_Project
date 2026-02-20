const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

dotenv.config({ quiet: true });

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const PASSWORD_MIN_LENGTH = 12;
const NAME_PATTERN = /^[\p{L}][\p{L}\s'-]{1,99}$/u;
const COUNTRY_PATTERN = /^[\p{L}][\p{L}\s'.()-]{1,99}$/u;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const currencyChange = {
    rates: {},
    lastUpdated: null
};

function getEnv(...keys) {
    for (const key of keys) {
        const value = process.env[key];
        if (typeof value === 'string' && value.trim() !== '') {
            return value.trim();
        }
    }
    return '';
}

function cleanText(value) {
    if (typeof value !== 'string') {
        return '';
    }
    return value.trim().replace(/\s+/g, ' ');
}

function validateEmail(email) {
    return EMAIL_PATTERN.test(email) && email.length <= 255;
}

function convertToIsoDate(dateInput) {
    if (typeof dateInput !== 'string') {
        return null;
    }

    const value = dateInput.trim();
    let day = '';
    let month = '';
    let year = '';

    if (/^\d{2}\.\d{2}\.\d{4}$/.test(value)) {
        [day, month, year] = value.split('.');
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        [year, month, day] = value.split('-');
    } else {
        return null;
    }

    const isoDate = `${year}-${month}-${day}`;
    const parsedDate = new Date(`${isoDate}T00:00:00Z`);

    if (Number.isNaN(parsedDate.getTime())) {
        return null;
    }

    const isSameDate =
        parsedDate.getUTCFullYear() === Number(year) &&
        parsedDate.getUTCMonth() + 1 === Number(month) &&
        parsedDate.getUTCDate() === Number(day);

    if (!isSameDate) {
        return null;
    }

    const now = new Date();
    const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const oldestAllowedDate = new Date(
        Date.UTC(now.getUTCFullYear() - 120, now.getUTCMonth(), now.getUTCDate())
    );

    if (parsedDate > todayUtc || parsedDate < oldestAllowedDate) {
        return null;
    }

    return isoDate;
}

function validateRegistrationPayload(payload) {
    const errors = [];

    const name = cleanText(payload.name);
    const surname = cleanText(payload.surname);
    const country = cleanText(payload.country);
    const email = cleanText(payload.email).toLowerCase();
    const password = typeof payload.password === 'string' ? payload.password : '';
    const confirmPassword = typeof payload.confirmPassword === 'string' ? payload.confirmPassword : '';
    const dateOfBirth = convertToIsoDate(payload.dateOfBirth);

    if (!NAME_PATTERN.test(name)) {
        errors.push('First name must be 2-100 characters and contain only letters.');
    }

    if (!NAME_PATTERN.test(surname)) {
        errors.push('Last name must be 2-100 characters and contain only letters.');
    }

    if (!dateOfBirth) {
        errors.push('Date of birth must be a valid date in DD.MM.YYYY format.');
    }

    if (!COUNTRY_PATTERN.test(country)) {
        errors.push('Country must be 2-100 characters and contain only letters.');
    }

    if (!validateEmail(email)) {
        errors.push('Please enter a valid email address.');
    }

    if (password.length < PASSWORD_MIN_LENGTH || !/\d/.test(password)) {
        errors.push('Password must be at least 12 characters and contain at least one digit.');
    }

    if (password !== confirmPassword) {
        errors.push('Password confirmation does not match.');
    }

    return {
        errors,
        data: {
            name,
            surname,
            dateOfBirth,
            country,
            email,
            password
        }
    };
}

function validateLoginPayload(payload) {
    const errors = [];
    const email = cleanText(payload.email).toLowerCase();
    const password = typeof payload.password === 'string' ? payload.password : '';

    if (!validateEmail(email)) {
        errors.push('Please enter a valid email address.');
    }

    if (password.length === 0) {
        errors.push('Please enter your password.');
    }

    return {
        errors,
        data: { email, password }
    };
}

const useSsl = (() => {
    const rawValue = getEnv('DB_SSL', 'db_ssl', 'ssl');
    if (!rawValue) {
        return true;
    }
    return !['0', 'false', 'no', 'off'].includes(rawValue.toLowerCase());
})();

const dbPool = mysql.createPool({
    host: getEnv('DB_HOST', 'host'),
    user: getEnv('DB_USER', 'username', 'user'),
    password: getEnv('DB_PASSWORD', 'password'),
    port: Number(getEnv('DB_PORT', 'port') || 3306),
    database: getEnv('DB_NAME', 'database'),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: useSsl ? { rejectUnauthorized: false } : undefined
});

async function checkDatabaseConnection() {
    try {
        const connection = await dbPool.getConnection();
        await connection.ping();
        connection.release();
        console.log('Database connection established.');
    } catch (error) {
        console.error('Database connection failed:', error.message);
    }
}

async function updateCurrencyRates() {
    try {
        const response = await fetch('https://api.frankfurter.app/latest?from=USD');

        if (!response.ok) {
            throw new Error(`Currency API returned status ${response.status}`);
        }

        const data = await response.json();
        currencyChange.rates = data.rates || {};
        currencyChange.rates.UAH = 43.46; // API does not provide UAH.
        currencyChange.rates.USD = 1; // API does not include the base currency.
        currencyChange.lastUpdated = new Date();
    } catch (error) {
        console.error('Error fetching currency rates:', error);
    }
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('index', {
        activePage: 'home',
        rates: currencyChange.rates,
        lastUpdated: currencyChange.lastUpdated
    });
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

app.post('/api/auth/register', async (req, res) => {
    const { errors, data } = validateRegistrationPayload(req.body || {});

    if (errors.length > 0) {
        return res.status(400).json({ ok: false, message: errors[0], errors });
    }

    try {
        const [existingUsers] = await dbPool.query(
            'SELECT `id` FROM `User` WHERE `email` = ? LIMIT 1',
            [data.email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({ ok: false, message: 'A user with this email already exists.' });
        }

        const hashedPassword = await bcrypt.hash(data.password, 12);

        await dbPool.query(
            'INSERT INTO `User` (`name`, `surname`, `date_of_birth`, `country`, `email`, `password`) VALUES (?, ?, ?, ?, ?, ?)',
            [data.name, data.surname, data.dateOfBirth, data.country, data.email, hashedPassword]
        );

        return res.status(201).json({
            ok: true,
            message: 'Registration completed successfully.'
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ ok: false, message: 'A user with this email already exists.' });
        }

        console.error('Registration error:', error);
        return res.status(500).json({ ok: false, message: 'Failed to register user.' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { errors, data } = validateLoginPayload(req.body || {});

    if (errors.length > 0) {
        return res.status(400).json({ ok: false, message: errors[0], errors });
    }

    try {
        const [users] = await dbPool.query(
            'SELECT `id`, `name`, `surname`, `email`, `password` FROM `User` WHERE `email` = ? LIMIT 1',
            [data.email]
        );

        if (users.length === 0) {
            return res.status(401).json({ ok: false, message: 'Invalid email or password.' });
        }

        const user = users[0];
        const isPasswordValid = await bcrypt.compare(data.password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ ok: false, message: 'Invalid email or password.' });
        }

        return res.status(200).json({
            ok: true,
            message: `Welcome back, ${user.name}!`,
            user: {
                id: user.id,
                name: user.name,
                surname: user.surname,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ ok: false, message: 'Failed to log in.' });
    }
});

async function startServer() {
    await updateCurrencyRates();
    setInterval(updateCurrencyRates, 60 * 60 * 1000);

    await checkDatabaseConnection();

    app.listen(PORT, () => {
        console.log(`Server is running at http://localhost:${PORT}`);
    });
}

startServer().catch((error) => {
    console.error('Server startup failed:', error);
    process.exit(1);
});
