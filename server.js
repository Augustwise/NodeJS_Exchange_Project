// server.js — entry point of the application.
//
// This file only does three things:
//   1. Loads environment variables from the .env file
//   2. Performs startup tasks (DB check, initial currency fetch)
//   3. Starts the HTTP server on the configured port
//
// All Express configuration (middleware, routes) lives in app.js.
// All database configuration lives in db.js.

require('dotenv').config();

const app    = require('./app');
const sequelize = require('./db');
const { updateCurrencyRates } = require('./utils/currencyService');


const PORT = process.env.PORT || 3000;

async function startServer() {
    // Fetch exchange rates once at startup, then refresh every hour
    await updateCurrencyRates();
    setInterval(updateCurrencyRates, 60 * 60 * 1000);

    // Verify that the database is reachable before accepting traffic
    try {
        await sequelize.authenticate();
        console.log('Database connection established.');
    } catch (error) {
        console.error('Database connection failed:', error.message);
    }

    app.listen(PORT, () => {
        console.log(`Server is running at http://localhost:${PORT}`);
    });
}

startServer().catch(console.error);
