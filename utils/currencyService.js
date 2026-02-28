/**
 * Currency service module for fetching and managing exchange rates from the National Bank of Ukraine.
 * @module currencyService
 */

const https = require('https');

/**
 * Object containing current currency exchange rates and metadata.
 * @typedef {Object} CurrencyData
 * @property {Object.<string, number>} rates - Exchange rates with currency codes as keys
 * @property {?Date} lastUpdated - Timestamp of the last successful rate update
 */

/**
 * Fetches current currency exchange rates from the NBU API and updates the global rates object.
 * Inverts the rates to show how many units of foreign currency equal 1 UAH.
 * @async
 * @function updateCurrencyRates
 * @returns {Promise<void>}
 * @throws {Error} Logs error to console if API request fails
 */

/**
 * Retrieves historical exchange rates for a specified currency over a date range.
 * @async
 * @function getHistoricalRates
 * @param {string} currencyCode - ISO 4217 currency code (e.g., 'USD', 'EUR')
 * @param {number} daysCount - Number of days of historical data to retrieve (looking back from today)
 * @returns {Promise<Array<Object>>} Array of objects with 'date' and 'rate' properties, or empty array on error
 * @returns {string} returns[].date - Exchange date in 'DD.MM.YYYY' format
 * @returns {number} returns[].rate - Inverted exchange rate (units of foreign currency per 1 UAH)
 * @throws {Error} Logs error to console if API request fails, returns empty array
 */
const currencyData = {
    rates: {},
    lastUpdated: null
};

async function updateCurrencyRates() {
    const url = 'https://bank.gov.ua/NBU_Exchange/exchange_site?json';
    
    return new Promise((resolve) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    currencyData.rates.UAH = 1;
                    jsonData.forEach(item => {
                        if (item.cc && item.rate) {
                            currencyData.rates[item.cc] = item.rate;
                        }
                    });
                    currencyData.lastUpdated = new Date();
                    console.log(`[${currencyData.lastUpdated.toLocaleTimeString()}] SUCCESS:`, Object.keys(currencyData.rates).length, 'currencies loaded');
                    resolve();
                } catch (e) {
                    console.error('Error parsing currency rates:', e.message);
                    resolve();
                }
            });
        }).on('error', (error) => {
            console.error('Error fetching currency rates:', error.message);
            resolve();
        });
    });
}

async function getHistoricalRates(currencyCode, daysCount) {
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - daysCount);

    const formatDate = (date) => date.toISOString().slice(0, 10).replace(/-/g, '');
    const startStr = formatDate(startDate);
    const endStr = formatDate(endDate);

    const url = `https://bank.gov.ua/NBU_Exchange/exchange_site?start=${startStr}&end=${endStr}&valcode=${currencyCode.toLowerCase()}&sort=exchangedate&order=asc&json`;

    return new Promise((resolve) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    const chartData = jsonData.map(item => ({
                        date: item.exchangedate,
                        rate: item.rate
                    }));
                    console.log(`${currencyCode}: ${chartData.length} records fetched`);
                    resolve(chartData);
                } catch (e) {
                    console.error(`${currencyCode}: Parse error`, e.message);
                    resolve([]);
                }
            });
        }).on('error', (error) => {
            console.error(`${currencyCode}: Network error`, error.message);
            resolve([]);
        });
    });
}

module.exports = { currencyData, updateCurrencyRates, getHistoricalRates }; 