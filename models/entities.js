const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const User = sequelize.define(
    'User',
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        surname: {
            type: DataTypes.STRING,
            allowNull: false
        },
        date_of_birth: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        country: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    {
        tableName: 'User',
        timestamps: false
    }
);

const Crypto = sequelize.define(
    'Crypto',
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        cryptoName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        creator: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        isApproved: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    },
    {
        tableName: 'Crypto',
        timestamps: false
    }
);

module.exports = { User, Crypto };
