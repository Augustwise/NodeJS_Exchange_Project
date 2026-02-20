// models/userModel.js — all database queries related to the User table.

const dbPool = require('../db');

/**
 * Finds a user by email address.
 * Returns the user object or null if not found.
 */
async function findByEmail(email) {
    const [rows] = await dbPool.query(
        'SELECT id, name, surname, email, password FROM User WHERE email = ? LIMIT 1',
        [email.toLowerCase()]
    );
    return rows[0] || null;
}

/**
 * Checks whether a user with the given email already exists.
 * Returns true / false.
 */
async function emailExists(email) {
    const [rows] = await dbPool.query(
        'SELECT id FROM User WHERE email = ? LIMIT 1',
        [email.toLowerCase()]
    );
    return rows.length > 0;
}

/**
 * Creates a new user record in the database.
 * `hashedPassword` must already be bcrypt-hashed before calling this.
 */
async function create({ name, surname, dateOfBirth, country, email, hashedPassword }) {
    await dbPool.query(
        'INSERT INTO User (name, surname, date_of_birth, country, email, password) VALUES (?, ?, ?, ?, ?, ?)',
        [name, surname, dateOfBirth, country, email.toLowerCase(), hashedPassword]
    );
}

module.exports = { findByEmail, emailExists, create };
