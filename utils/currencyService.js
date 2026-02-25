/**
 * Currency service module for fetching and managing exchange rates from the National Bank of Ukraine.
 * @module currencyService
 */

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
    try {
        const response = await fetch(url);
        const data = await response.json();

        currencyData.rates.UAH = 1;

        data.forEach(item => {
            if (item.cc && item.rate) {
                currencyData.rates[item.cc] = 1 / item.rate;
            }
        });
        currencyData.lastUpdated = new Date();
        console.log(`[${currencyData.lastUpdated.toLocaleTimeString()}] SUCCESS:`, currencyData.rates);
    } catch (error) {
        console.error('Error fetching currency rates:', error);
    }
}

async function getHistoricalRates(currencyCode, daysCount) {
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - daysCount); 

    const formatDate = (date) => date.toISOString().slice(0, 10).replace(/-/g, '');
    const startStr = formatDate(startDate);
    const endStr = formatDate(endDate);

    const url = `https://bank.gov.ua/NBU_Exchange/exchange_site?start=${startStr}&end=${endStr}&valcode=${currencyCode.toLowerCase()}&sort=exchangedate&order=asc&json`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();

        const chartData = data.map(item => ({
            date: item.exchangedate,
            rate: 1 / item.rate 
        }));

        return chartData;
        
    } catch (error) {
        console.error(`Error fetching historical rates for ${currencyCode}:`, error);
        return [];
    }
}


getHistoricalRates('USD', 30).then(console.log);

module.exports = { currencyData, updateCurrencyRates, getHistoricalRates }; 