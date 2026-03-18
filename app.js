// app.js — creates and configures the Express application.
//
// This file is responsible for:
//   1. Setting up the view engine (EJS)
//   2. Registering middleware (body parsing, static files, session, loadUser)
//   3. Mounting route files at their URL prefixes

const express    = require('express');
const path       = require('path');
const session    = require('express-session');
const loadUser   = require('./middleware/loadUser');
const pageRoutes = require('./routes/pageRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret:            process.env.AUTH_SECRET || 'dev-only-change-me',
    resave:            false,
    saveUninitialized: false, // Only save if something is stored
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 } // 7 days
}));

// Load the logged-in user on every request (attaches req.currentUser)
app.use(loadUser);

app.use('/', pageRoutes);

app.use('/api/auth', authRoutes);

module.exports = app;
