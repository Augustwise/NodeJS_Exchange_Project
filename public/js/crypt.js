const CHART_HEIGHT = 560;
const renderTokens = new Map();

let tradingViewReadyPromise;

/* =========================================
   РОЗУМНЕ ПЕРЕМИКАННЯ ВКЛАДОК ЗІ СВАЙПОМ
========================================= */
function switchMainTab(event, tabId) {
    if (event) event.preventDefault();

    const currentActive = document.querySelector('.tab-content.active');
    const targetTab = document.getElementById(tabId);

    // Якщо клікнули на ту ж саму вкладку або вкладка не знайдена - нічого не робимо
    if (!targetTab || (currentActive && currentActive === targetTab)) {
        return;
    }

    // 1. Оновлюємо дизайн кнопок у шапці (підсвічуємо активну)
    document.querySelectorAll('.tab-btn, .tab-btn-right').forEach(btn => btn.classList.remove('active'));
    if (event) event.currentTarget.classList.add('active');

    // Якщо це перше завантаження (немає активної вкладки), просто показуємо і вантажимо графік
    if (!currentActive) {
        targetTab.classList.add('active');
        loadTabChart(targetTab);
        return;
    }

    // Порядок вкладок для визначення напрямку анімації
    const tabsOrder = ['public-crypto', 'users-crypto', 'my-crypto'];
    const currentIndex = tabsOrder.indexOf(currentActive.id);
    const targetIndex = tabsOrder.indexOf(tabId);
    
    // Визначаємо, куди рухаємось (вправо чи вліво)
    const isMovingRight = targetIndex > currentIndex;

    // 2. Анімація ВІД'ЇЗДУ старої вкладки
    currentActive.style.animation = isMovingRight 
        ? 'slideOutLeft 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards' 
        : 'slideOutRight 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards';

    // 3. Чекаємо поки від'їде стара вкладка (300мс), ховаємо її і показуємо нову
    setTimeout(() => {
        currentActive.classList.remove('active');
        currentActive.style.animation = ''; // очищаємо стилі після анімації

        targetTab.classList.add('active');
        
        // 4. Анімація ВИЇЗДУ нової вкладки
        targetTab.style.animation = isMovingRight 
            ? 'slideInRight 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' 
            : 'slideInLeft 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';

        // 5. Завантажуємо графік для нової вкладки (Ваша оригінальна логіка)
        loadTabChart(targetTab);
            
    }, 300); // 300мс = час анімації slideOut
}

// Виніс логіку завантаження графіка в окрему функцію для зручності
function loadTabChart(tabElement) {
    const activeButton = tabElement.querySelector('.coin-btn.active[data-symbol]')
        || tabElement.querySelector('.coin-btn[data-symbol]');

    if (activeButton) {
        renderChartFromButton(activeButton);
    }
}

/* =========================================
   СТАНДАРТНА ЛОГІКА TRADING VIEW
========================================= */
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
    if (activeTab) {
        loadTabChart(activeTab);
    }
});