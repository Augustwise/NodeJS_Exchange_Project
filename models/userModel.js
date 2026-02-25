// models/userModel.js — all database queries related to the User table.

const { User } = require('./entities');

/**
 * Finds a user by email address.
 * Returns the user object or null if not found.
 */
async function findByEmail(email) {
    const user = await User.findOne({
        where: { email: email.toLowerCase() },
        attributes: ['id', 'name', 'surname', 'email', 'password'],
        raw: true
    });
    return user || null;
}

/**
 * Checks whether a user with the given email already exists.
 * Returns true / false.
 */
async function emailExists(email) {
    const user = await User.findOne({
        where: { email: email.toLowerCase() },
        attributes: ['id'],
        raw: true
    });
    return Boolean(user);
}

/**
 * Loads current user data used by session middleware.
 */
async function findByIdForSession(userId) {
    const user = await User.findByPk(userId, {
        attributes: ['id', 'name', 'surname', 'date_of_birth', 'country', 'email'],
        raw: true
    });
    return user || null;
}

/**
 * Creates a new user record in the database.
 * `hashedPassword` must already be bcrypt-hashed before calling this.
 */
async function create({ name, surname, dateOfBirth, country, email, hashedPassword }) {
    await User.create({
        name,
        surname,
        date_of_birth: dateOfBirth,
        country,
        email: email.toLowerCase(),
        password: hashedPassword
    });
}

module.exports = { findByEmail, emailExists, findByIdForSession, create };
