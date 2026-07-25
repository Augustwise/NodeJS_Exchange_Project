const currencyData = {
    rates: {},
    lastUpdated: null
};

async function updateCurrencyRates() {
    const url = 'https://bank.gov.ua/NBU_Exchange/exchange_site?json';
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Server error. Status: ${response.status} ${response.statusText}`);
        }  

        const data = await response.json();

        currencyData.rates.UAH = 1;

        data.forEach(item => {
            if (item.cc && item.rate) {
                currencyData.rates[item.cc] = item.rate;
            }
        });
        currencyData.lastUpdated = new Date();
        console.log(`[${currencyData.lastUpdated.toLocaleTimeString()}] SUCCESS:`, Object.keys(currencyData.rates).length, 'currencies loaded');
    } catch (error) {
        console.error('Error fetching currency rates:', error.message);
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

        if (!response.ok) {
             throw new Error(`Error fetching historical data for ${currencyCode}. Status: ${response.status}`);
        }

        const data = await response.json();

        return data.map(item => ({
            date: item.exchangedate,
            rate: item.rate 
        }));
        
    } catch (error) {
        console.error(`Error fetching historical rates for ${currencyCode}:`, error.message);
        return [];
    }
}

export { currencyData, updateCurrencyRates, getHistoricalRates };