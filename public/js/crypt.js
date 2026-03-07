const CHART_HEIGHT = 560;
const renderTokens = new Map();

let tradingViewReadyPromise;

function switchMainTab(event, tabId) {
    document.querySelectorAll('.tab-content').forEach((tab) => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach((btn) => btn.classList.remove('active'));
    document.querySelectorAll('.tab-btn-right').forEach((btn) => btn.classList.remove('active'));

    const nextTab = document.getElementById(tabId);
    if (!nextTab) {
        return;
    }

    nextTab.classList.add('active');
    event.currentTarget.classList.add('active');

    const activeButton = nextTab.querySelector('.coin-btn.active[data-symbol]')
        || nextTab.querySelector('.coin-btn[data-symbol]');

    if (activeButton) {
        renderChartFromButton(activeButton);
    }
}

function switchChart(event) {
    const button = event.currentTarget;
    const tab = button.closest('.tab-content');
    if (!tab) {
        return;
    }

    tab.querySelectorAll('.coin-btn').forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');

    renderChartFromButton(button);
}

function renderChartFromButton(button) {
    const { chartContainer, symbol } = button.dataset;
    if (!chartContainer || !symbol) {
        return;
    }

    renderChart(chartContainer, symbol);
}

function ensureTradingViewLoaded(timeoutMs = 10000) {
    if (window.TradingView && typeof window.TradingView.widget === 'function') {
        return Promise.resolve(window.TradingView);
    }

    if (tradingViewReadyPromise) {
        return tradingViewReadyPromise;
    }

    tradingViewReadyPromise = new Promise((resolve, reject) => {
        const startedAt = Date.now();

        const check = () => {
            if (window.TradingView && typeof window.TradingView.widget === 'function') {
                resolve(window.TradingView);
                return;
            }

            if (Date.now() - startedAt >= timeoutMs) {
                reject(new Error('TradingView script did not load in time.'));
                return;
            }

            window.setTimeout(check, 150);
        };

        check();
    });

    return tradingViewReadyPromise;
}

function showChartStatus(container, message) {
    container.innerHTML = `<div class="chart-status">${message}</div>`;
}

function renderChart(containerId, symbol) {
    const container = document.getElementById(containerId);
    if (!container) {
        return;
    }

    if (container.dataset.symbol === symbol && container.dataset.ready === 'true') {
        return;
    }

    const token = `${containerId}:${symbol}:${Date.now()}`;
    renderTokens.set(containerId, token);

    container.dataset.ready = 'false';
    showChartStatus(container, 'Loading chart...');

    ensureTradingViewLoaded()
        .then(() => {
            if (renderTokens.get(containerId) !== token) {
                return;
            }

            container.innerHTML = '';
            container.dataset.symbol = symbol;
            container.dataset.ready = 'true';

            new TradingView.widget({
                width: '100%',
                height: CHART_HEIGHT,
                symbol,
                interval: '60',
                timezone: 'Europe/Kiev',
                theme: 'dark',
                style: '1',
                locale: 'uk',
                allow_symbol_change: false,
                container_id: containerId,
                backgroundColor: 'rgba(22, 27, 34, 0)',
                gridColor: 'rgba(255, 255, 255, 0.05)'
            });
        })
        .catch(() => {
            if (renderTokens.get(containerId) !== token) {
                return;
            }

            container.dataset.ready = 'false';
            showChartStatus(container, 'TradingView is temporarily unavailable.');
        });
}

document.addEventListener('DOMContentLoaded', () => {
    const activeTab = document.querySelector('.tab-content.active');
    const activeButton = activeTab?.querySelector('.coin-btn.active[data-symbol]')
        || activeTab?.querySelector('.coin-btn[data-symbol]');

    if (activeButton) {
        renderChartFromButton(activeButton);
    }
});
