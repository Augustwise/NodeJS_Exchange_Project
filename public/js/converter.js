const amountOne = document.getElementById('amount-one');
const amountTwo = document.getElementById('amount-two');
const currencyOne = document.getElementById('currency-one');
const currencyTwo = document.getElementById('currency-two');
const rate = document.getElementById('rate');

function calculateForward() {
    const currencyOneValue = currencyOne.value;
    const currencyTwoValue = currencyTwo.value;

    if (!SERVER_RATES[currencyOneValue] || !SERVER_RATES[currencyTwoValue]) {
        console.warn("No data exists");
        return;
    }

    const rateOne = SERVER_RATES[currencyOneValue];
    const rateTwo = SERVER_RATES[currencyTwoValue];

    const amountInBase = amountOne.value / rateOne;
    const finalAmount = amountInBase * rateTwo;

    amountTwo.value = finalAmount.toFixed(2);
    updateRateText(currencyOneValue, currencyTwoValue, rateOne, rateTwo);
}

function calculateBackward() {
    const currencyOneValue = currencyOne.value;
    const currencyTwoValue = currencyTwo.value;

    if (!SERVER_RATES[currencyOneValue] || !SERVER_RATES[currencyTwoValue]) return;

    const rateOne = SERVER_RATES[currencyOneValue];
    const rateTwo = SERVER_RATES[currencyTwoValue];

    const amountInBase = amountTwo.value / rateTwo;
    const finalAmount = amountInBase * rateOne;

    amountOne.value = finalAmount.toFixed(2);
    updateRateText(currencyOneValue, currencyTwoValue, rateOne, rateTwo);
}

function updateRateText(curr1, curr2, r1, r2) {
    const singleRate = (1 / r1) * r2;
    rate.innerText = `1 ${curr1} = ${singleRate.toFixed(4)} ${curr2}`;
}

amountOne.addEventListener('input', calculateForward);
amountTwo.addEventListener('input', calculateBackward);
currencyOne.addEventListener('change', calculateForward);
currencyTwo.addEventListener('change', calculateForward);

calculateForward();