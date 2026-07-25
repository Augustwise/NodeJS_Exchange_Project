// db.js — initializes and exports a Sequelize connection instance.

import fs   from 'fs';
import path from 'path';
import { Sequelize } from 'sequelize';

function buildSslOptions() {
    if (process.env.DB_SSL !== 'true') {
        return undefined;
    }

    const ssl = {
        rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
    };

    if (process.env.DB_SSL_CA) {
        ssl.ca = fs.readFileSync(path.resolve(process.env.DB_SSL_CA), 'utf8');
    }

    return ssl;
}

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 5432,
        dialect: 'postgres',
        logging: false,
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        ...(process.env.DB_SSL === 'true' && {
            dialectOptions: {
                ssl: buildSslOptions()
            }
        })
    }
);

sequelize.buildSslOptions = buildSslOptions;

export default sequelize;
