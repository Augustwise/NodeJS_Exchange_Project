// controllers/authController.js — handles user registration, login, and logout.

import bcrypt    from 'bcryptjs';
import * as UserModel from '../models/userModel.js';
import loginRateLimit from '../middleware/loginRateLimit.js';
import { parseDate } from '../utils/dateUtils.js';

// POST /api/auth/register
async function register(req, res) {
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

    // --- Business logic ---
    try {
        const exists = await UserModel.emailExists(email);
        if (exists) {
            return res.status(409).json({ ok: false, message: 'A user with this email already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        await UserModel.create({
            name:           name.trim(),
            surname:        surname.trim(),
            dateOfBirth:    parseDate(dateOfBirth),
            country:        country.trim(),
            email,
            hashedPassword
        });

        return res.status(201).json({ ok: true, message: 'Registration completed successfully.' });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ ok: false, message: 'A user with this email already exists.' });
        }
        console.error('Registration error:', error);
        return res.status(500).json({ ok: false, message: 'Failed to register user.' });
    }
}

// POST /api/auth/login
async function login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ ok: false, message: 'Email and password are required.' });
    }

    try {
        const user = await UserModel.findByEmail(email);

        if (!user) {
            return res.status(401).json({ ok: false, message: 'Invalid email or password.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ ok: false, message: 'Invalid email or password.' });
        }

        loginRateLimit.reset(req.ip);

        req.session.regenerate((error) => {
            if (error) {
                console.error('Login error:', error);
                return res.status(500).json({ ok: false, message: 'Failed to log in.' });
            }

            req.session.userId = user.id;

            return res.status(200).json({
                ok: true,
                message: `Welcome back, ${user.name}!`,
                user: { id: user.id, name: user.name, surname: user.surname, email: user.email }
            });
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ ok: false, message: 'Failed to log in.' });
    }
}

function logout(req, res) {
    req.session.destroy();
    return res.status(200).json({ ok: true, message: 'Logged out successfully.' });
}

function logoutRedirect(req, res) {
    req.session.destroy();
    res.redirect('/login');
}

export { register, login, logout, logoutRedirect };
