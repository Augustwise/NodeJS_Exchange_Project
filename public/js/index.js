(function initCurrencyChart() {
    console.log('CHART: SERVER_HISTORY available:', !!window.SERVER_HISTORY, 'currencies:', Object.keys(window.SERVER_HISTORY || {}).length);
    console.log('CHART: SERVER_RATES available:', !!window.SERVER_RATES, 'currencies:', Object.keys(window.SERVER_RATES || {}).length);

    function pairRate(base, quote) {
        if (!window.SERVER_RATES) return null;
        const rBase = window.SERVER_RATES[base];
        const rQuote = window.SERVER_RATES[quote];
        if (rBase == null || rQuote == null) return null;
        // SERVER_RATES values are in UAH per 1 unit of currency (UAH per USD, etc.).
        // To compute how many QUOTE units equal 1 BASE unit: (UAH per BASE) / (UAH per QUOTE).
        return rBase / rQuote;
    }

    function parseHistoryDate(dateStr) {
        if (!dateStr || typeof dateStr !== 'string') return NaN;
        const parts = dateStr.split('.');
        if (parts.length === 3) {
            const [day, month, year] = parts;
            return new Date(`${year}-${month}-${day}`);
        }
        return new Date(dateStr);
    }

    function dedupeByDate(records) {
        const unique = new Map();
        (records || []).forEach((row) => {
            if (!row || !row.date) return;
            // Keep the last occurrence per date so "today" uses the latest available value.
            unique.set(row.date, row);
        });
        return Array.from(unique.values())
            .sort((a, b) => parseHistoryDate(a.date) - parseHistoryDate(b.date));
    }

    function sliceLast(items, n) {
        if (!Array.isArray(items)) return [];
        return items.slice(Math.max(0, items.length - n));
    }

    function makeSeries(centerValue, points = 6) {
        const out = [];
        let v = centerValue;
        for (let i = 0; i < points; i++) {
            const noise = (Math.random() - 0.5) * (centerValue * 0.005);
            v = parseFloat((centerValue + noise).toFixed(2));
            out.push(v);
        }
        return out;
    }

    function init() {
        const canvas = document.getElementById('currencyChart');
        if (!canvas) {
            console.warn('currencyChart canvas not found — chart initialization skipped');
            return;
        }

        const ctx = canvas.getContext && canvas.getContext('2d');
        if (!ctx) {
            console.warn('Chart context not available, aborting chart setup');
            return;
        }

        let gradient = null;
        try {
            gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, 'rgba(0, 227, 150, 0.5)');
            gradient.addColorStop(1, 'rgba(0, 227, 150, 0.0)');
        } catch (e) {
            console.warn('Unable to create canvas gradient, using transparent fallback', e);
            gradient = 'transparent';
        }

        // build some simple datasets
        const currencyData = {};
        ['USD', 'EUR', 'GBP', 'BTC'].forEach((key) => {
            const pair = key === 'BTC' ? { base: 'BTC', quote: 'USD' } : { base: key, quote: 'UAH' };
            const rate = pairRate(pair.base, pair.quote);
            const current = rate != null ? rate.toFixed(2) : '—';
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
                    backgroundColor: gradient || 'transparent',
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

        if (typeof Chart === 'undefined') {
            console.warn('Chart.js not found on page — ensure CDN is loaded');
            return;
        }

        // Chart can accept canvas or context
        const myChart = new Chart(canvas, chartConfig);
        console.log('Chart initialized. SERVER_HISTORY keys:', Object.keys(window.SERVER_HISTORY || {}));
        if (window.SERVER_HISTORY && window.SERVER_HISTORY.USD) {
            console.log('Sample USD history records:', (window.SERVER_HISTORY.USD || []).slice(0, 3));
        }


        // function changeCurrency(currencyKey) {
        //     console.warn('changeCurrency(key) is deprecated; use converter selects to change the chart.');
        // }

        // current displayed time period (1D, 1W, 1M)
        let currentPeriod = '1D';
        function updateTimePeriod(period) {
            document.querySelectorAll('.time-btn').forEach((btn) => btn.classList.remove('active'));
            const btn = Array.from(document.querySelectorAll('.time-btn')).find(b => b.textContent.trim() === period);
            if (btn) btn.classList.add('active');
            currentPeriod = period;
            // refresh chart to reflect the new period
            try { if (typeof syncChartToConverter === 'function') syncChartToConverter(); } catch (e) { console.warn('Failed to refresh chart after period change', e); }
        }

        //window.changeCurrency = changeCurrency;
        window.updateTimePeriod = updateTimePeriod;

        try {
            const convCurrencyOne = document.getElementById('currency-one');
            const convCurrencyTwo = document.getElementById('currency-two');
            const chartLabel = document.getElementById('chartCurrencyLabel');

            function updateChartForPair(base, quote) {
                if (!base || !quote) return;
                console.log(`updateChartForPair: ${base} / ${quote}`);
                if (chartLabel) chartLabel.innerText = base + ' / ' + quote;

                let rate = pairRate(base, quote);
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

                let series = [];
                let labels = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];

                try {
                    const hist = window.SERVER_HISTORY || {};
                    const rawBaseHist = hist[base] || [];
                    const rawQuoteHist = hist[quote] || [];

                    const baseHist = dedupeByDate(rawBaseHist);
                    const quoteHist = dedupeByDate(rawQuoteHist);

                    if (quote === 'UAH' && baseHist.length > 0) {
                        labels = baseHist.map(d => d.date);
                        series = baseHist.map(d => parseFloat(Number(d.rate).toFixed(2)));
                    } else if (baseHist.length > 0 && quoteHist.length > 0) {
                        const qByDate = new Map(quoteHist.map(d => [d.date, d.rate]));
                        const aligned = baseHist.filter(d => qByDate.has(d.date));
                        labels = aligned.map(d => d.date);
                        series = aligned.map(d => {
                            const qb = qByDate.get(d.date);
                            const val = (d.rate != null && qb != null) ? (d.rate / qb) : null;
                            return val != null && isFinite(val) ? parseFloat(Number(val).toFixed(2)) : null;
                        }).filter(v => v != null);
                    } else {
                        series = makeSeries(rate);
                    }
                } catch (e) {
                    series = makeSeries(rate);
                }

                // Respect selected time period (1D, 1W, 1M)
                try {
                    const periodMap = { '1D': 2, '1W': 7, '1M': 30 };
                    const desired = periodMap[currentPeriod] || series.length;

                    if (series.length > desired) {
                        series = sliceLast(series, desired);
                        labels = sliceLast(labels, desired);
                    }

                    if (currentPeriod === '1D' && series.length >= 2) {
                        // Ensure we have exactly yesterday+today (last two unique dates)
                        series = sliceLast(series, 2);
                        labels = sliceLast(labels, 2);
                    }
                } catch (e) {
                    // ignore and show full series
                }

                let changePercent = 0;
                if (series.length >= 2) {
                    const prev = series[series.length - 2];
                    const last = series[series.length - 1];
                    if (prev != null && prev !== 0 && isFinite(prev) && isFinite(last)) {
                        changePercent = ((last - prev) / prev) * 100;
                    }
                }

                const sign = changePercent >= 0 ? '+' : '';

                if (currentElem) currentElem.innerText = rate.toFixed(2);

                if (changeElem) {
                    changeElem.innerHTML = `${sign}${changePercent.toFixed(2)}% <span class="time-label">(today)</span>`;
                    changeElem.className = changePercent >= 0 ? 'rate-change positive' : 'rate-change negative';
                }

                myChart.data.labels = labels;
                myChart.data.datasets[0].data = series;
                myChart.update();
            }

            function syncChartToConverter() {
                const c1 = convCurrencyOne && convCurrencyOne.value;
                const c2 = convCurrencyTwo && convCurrencyTwo.value;
                updateChartForPair(c1, c2);
            }

            if (convCurrencyOne) convCurrencyOne.addEventListener('change', syncChartToConverter);
            if (convCurrencyTwo) convCurrencyTwo.addEventListener('change', syncChartToConverter);

            // initialize from current selects
            syncChartToConverter();
        } catch (err) {
            console.warn('Chart binding to converter failed', err);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

