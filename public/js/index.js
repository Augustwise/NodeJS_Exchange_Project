const ctx = document.getElementById('currencyChart').getContext('2d');

const gradient = ctx.createLinearGradient(0, 0, 0, 300);
gradient.addColorStop(0, 'rgba(0, 227, 150, 0.5)');
gradient.addColorStop(1, 'rgba(0, 227, 150, 0.0)');

const currencyData = {
    USD: {
        current: '41.50',
        change: '+0.45%',
        isPositive: true,
        labels: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00'],
        data: [41.20, 41.35, 41.25, 41.40, 41.45, 41.50]
    },
    EUR: {
        current: '45.20',
        change: '-0.12%',
        isPositive: false,
        labels: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00'],
        data: [45.50, 45.40, 45.35, 45.30, 45.25, 45.20]
    },
    GBP: {
        current: '53.80',
        change: '+1.10%',
        isPositive: true,
        labels: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00'],
        data: [52.90, 53.10, 53.40, 53.50, 53.60, 53.80]
    },
    BTC: {
        current: '96,500',
        change: '+5.4%',
        isPositive: true,
        labels: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00'],
        data: [92000, 93500, 94000, 95500, 96000, 96500]
    }
};

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

const myChart = new Chart(ctx, chartConfig);

function changeCurrency(currencyKey) {
    const data = currencyData[currencyKey];

    document.getElementById('currentRate').innerText = data.current;

    const changeElem = document.getElementById('rateChange');
    changeElem.innerHTML = `${data.change} <span class="time-label">(сьогодні)</span>`;

    if (data.isPositive) {
        changeElem.className = 'rate-change positive';
        myChart.data.datasets[0].borderColor = '#00E396';
    } else {
        changeElem.className = 'rate-change negative';
        myChart.data.datasets[0].borderColor = '#FF4560';
    }

    myChart.data.labels = data.labels;
    myChart.data.datasets[0].data = data.data;
    myChart.update();
}

function updateTimePeriod(period) {
    document.querySelectorAll('.time-btn').forEach((btn) => btn.classList.remove('active'));
    event.target.classList.add('active');
}

window.changeCurrency = changeCurrency;
window.updateTimePeriod = updateTimePeriod;
