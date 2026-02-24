const canvas = document.getElementById('currencyChart');
if (!canvas) {
    console.warn('currencyChart canvas not found — chart initialization skipped');
}
const ctx = canvas && canvas.getContext('2d');

const gradient = ctx.createLinearGradient(0, 0, 0, 300);
gradient.addColorStop(0, 'rgba(0, 227, 150, 0.5)');
gradient.addColorStop(1, 'rgba(0, 227, 150, 0.0)');

// Build simple chart datasets from SERVER_RATES passed from the server.
function pairRate(base, quote) {
    if (!window.SERVER_RATES) return null;
    const rBase = window.SERVER_RATES[base];
    const rQuote = window.SERVER_RATES[quote];
    if (rBase == null || rQuote == null) return null;
    return rQuote / rBase;
}

function makeSeries(centerValue, points = 6) {
    const out = [];
    let v = centerValue;
    for (let i = 0; i < points; i++) {
        // small random walk around centerValue
        const noise = (Math.random() - 0.5) * (centerValue * 0.005);
        v = parseFloat((centerValue + noise).toFixed(4));
        out.push(v);
    }
    return out;
}

const currencyData = {};

['USD','EUR','GBP','BTC'].forEach((key) => {
    // default quote currencies used on the page: USD/EUR/GBP -> UAH, BTC -> USD
    const pair = key === 'BTC' ? { base: 'BTC', quote: 'USD' } : { base: key, quote: 'UAH' };
    const rate = pairRate(pair.base, pair.quote);
    const current = rate != null ? rate.toFixed(4) : '—';
    const series = rate != null ? makeSeries(rate) : [];
    currencyData[key] = {
        current,
        change: rate != null ? '+0.00%' : '—',
        isPositive: true,
        labels: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00'],
        data: series
    };
});

const chartConfig = {
    type: 'line',
    data: {
        labels: currencyData.USD.labels,
        datasets: [{
            label: 'Price',
            data: currencyData.USD.data,
            borderColor: '#00E396',
            backgroundColor: gradient,
            borderWidth: 3,
            pointRadius: 0,
            pointHoverRadius: 6,
            fill: true,
            tension: 0.4
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { display: false }, ticks: { color: '#8B9BB4' } },
            y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#8B9BB4' } }
        },
        interaction: { mode: 'index', intersect: false }
    }
};

if (!ctx) {
    // Stop further chart logic if canvas/context is missing
    console.warn('Chart context not available, aborting chart setup');
} else {
    const myChart = new Chart(ctx, chartConfig);

    function changeCurrency(currencyKey) {
        // Deprecated: chart is now pair-driven. Keep function to avoid errors from inline handlers.
        console.warn('changeCurrency(key) is deprecated; use converter selects to change the chart.');
    }

    function updateTimePeriod(period) {
        document.querySelectorAll('.time-btn').forEach((btn) => btn.classList.remove('active'));
        const btn = Array.from(document.querySelectorAll('.time-btn')).find(b => b.textContent.trim() === period);
        if (btn) btn.classList.add('active');
    }

    window.changeCurrency = changeCurrency;
    window.updateTimePeriod = updateTimePeriod;

    // Bind converter selects so chart follows the chosen currency (no separate chart select).
    try {
        const convCurrencyOne = document.getElementById('currency-one');
        const convCurrencyTwo = document.getElementById('currency-two');
        const chartLabel = document.getElementById('chartCurrencyLabel');

        function updateChartForPair(base, quote) {
            // Display: 1 BASE = X QUOTE, header shows "BASE / QUOTE"
            if (!base || !quote) return;
            if (chartLabel) chartLabel.innerText = base + ' / ' + quote;

            let rate = pairRate(base, quote); // returns quote per base
            // fallback: try inverse if direct pair missing
            if ((rate == null || !isFinite(rate)) && base && quote) {
                const inv = pairRate(quote, base);
                if (inv != null && isFinite(inv) && inv !== 0) {
                    rate = 1 / inv;
                }
            }
            const currentElem = document.getElementById('currentRate');
            const changeElem = document.getElementById('rateChange');

            if (rate == null || !isFinite(rate)) {
                if (currentElem) currentElem.innerText = '—';
                if (changeElem) changeElem.innerHTML = '— <span class="time-label">(today)</span>';
                myChart.data.labels = [];
                myChart.data.datasets[0].data = [];
                myChart.update();
                return;
            }

            if (currentElem) currentElem.innerText = rate.toFixed(4);
            if (changeElem) changeElem.innerHTML = `+0.00% <span class="time-label">(today)</span>`;
            changeElem.className = 'rate-change positive';

            const series = makeSeries(rate);
            myChart.data.labels = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];
            myChart.data.datasets[0].data = series;
            myChart.update();
        }

        function syncChartToConverter() {
            const c1 = convCurrencyOne && convCurrencyOne.value; // left input
            const c2 = convCurrencyTwo && convCurrencyTwo.value; // right input
            // Show pair as: base = c1, quote = c2 (header: "C1 / C2", value = 1 C1 = X C2)
            const base = c1;
            const quote = c2;
            updateChartForPair(base, quote);
        }

        if (convCurrencyOne) convCurrencyOne.addEventListener('change', syncChartToConverter);
        if (convCurrencyTwo) convCurrencyTwo.addEventListener('change', syncChartToConverter);

        // initialize from current selects
        syncChartToConverter();
    } catch (err) {
        console.warn('Chart binding to converter failed', err);
    }
}

