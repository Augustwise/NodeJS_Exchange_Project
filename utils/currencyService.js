const currencyData = {
    rates: {},
    lastUpdated: null
};

async function updateCurrencyRates() {
    try {
        const response = await fetch('https://api.frankfurter.app/latest?from=USD');
        const data = await response.json();

        currencyData.rates = data.rates || {};
        currencyData.rates.UAH = 43.46; // Frankfurter does not provide UAH
        currencyData.rates.USD = 1;     // Frankfurter omits the base currency itself
        currencyData.lastUpdated = new Date();
    } catch (error) {
        console.error('Error fetching currency rates:', error);
    }
}

module.exports = { currencyData, updateCurrencyRates };
