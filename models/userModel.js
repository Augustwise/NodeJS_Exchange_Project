// models/userModel.js — all database queries related to the User table.

const sequelize = require('../db');
const { User, Role, UserRole } = require('./entities');

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
    await sequelize.transaction(async (transaction) => {
        const user = await User.create({
            name,
            surname,
            date_of_birth: dateOfBirth,
            country,
            email: email.toLowerCase(),
            password: hashedPassword
        }, { transaction });

        const defaultRole = await Role.findOne({
            where: { name: 'User' },
            attributes: ['id'],
            raw: true,
            transaction
        });

        if (!defaultRole) {
            throw new Error('Default role "User" not found. Please ensure it exists in the database.');
        }

        // Link the new user to the default "User" role
        await UserRole.findOrCreate({
            where: { user_id: user.id, role_id: defaultRole.id },
            defaults: { user_id: user.id, role_id: defaultRole.id },
            transaction
        });
    });
}

async function findById(userId) {
    const user = await User.findByPk(userId, {
        attributes: ['id', 'name', 'surname', 'email'],
        raw: true
    });
    return user || null;
}

async function hasRole(userId, roleName) {
    const role = await Role.findOne({
        where: { name: roleName },
        attributes: ['id'],
        raw: true
    });

    if (!role) {
        return false;
    }

    const roleLink = await UserRole.findOne({
        where: { user_id: userId, role_id: role.id },
        attributes: ['user_id'],
        raw: true
    });

    return Boolean(roleLink);
}

async function grantRole(userId, roleName) {
    const role = await Role.findOne({
        where: { name: roleName },
        attributes: ['id'],
        raw: true
    });

    if (!role) {
        throw new Error(`Role "${roleName}" not found.`);
    }

    await UserRole.findOrCreate({
        where: { user_id: userId, role_id: role.id },
        defaults: { user_id: userId, role_id: role.id }
    });
}

async function revokeRole(userId, roleName) {
    const role = await Role.findOne({
        where: { name: roleName },
        attributes: ['id'],
        raw: true
    });

    if (!role) {
        return 0;
    }

    return UserRole.destroy({
        where: { user_id: userId, role_id: role.id }
    });
}

async function findAllForAdminPanel() {
    const users = await User.findAll({
        attributes: ['id', 'name', 'surname', 'email', 'country', 'date_of_birth', 'create_time'],
        include: [
            {
                model: Role,
                as: 'roles',
                attributes: ['name'],
                through: { attributes: [] }
            }
        ],
        order: [['id', 'ASC']]
    });

    return users.map((user) => {
        const plainUser = user.get({ plain: true });
        const roleNames = (plainUser.roles || []).map((role) => role.name);

        return {
            ...plainUser,
            roleNames,
            isAdmin: roleNames.includes('Admin')
        };
    });
}

module.exports = {
    findByEmail,
    emailExists,
    findByIdForSession,
    create,
    findById,
    hasRole,
    grantRole,
    revokeRole,
    findAllForAdminPanel
};
