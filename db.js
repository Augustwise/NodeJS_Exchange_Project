// db.js — creates and exports a MySQL connection pool.
//
// A "pool" keeps multiple database connections open so the app doesn't
// have to open a new connection on every request (which is slow).
// Other files import `dbPool` and call dbPool.query(...) to run SQL.

const mysql = require('mysql2/promise');

const dbPool = mysql.createPool({
    host:     process.env.DB_HOST,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port:     process.env.DB_PORT || 3306,
    database: process.env.DB_NAME,
    waitForConnections: true,  // queue requests when all connections are busy
    connectionLimit: 10,       // keep at most 10 open connections
    ssl: { rejectUnauthorized: false }
});

module.exports = dbPool;
