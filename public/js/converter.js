const amountOne = document.getElementById('amount-one');
const amountTwo = document.getElementById('amount-two');
const currencyOne = document.getElementById('currency-one');
const currencyTwo = document.getElementById('currency-two');
const rate = document.getElementById('rate');

function calculate(e) {
    const currency1 = currencyOne.value;
    const currency2 = currencyTwo.value;

    if (!SERVER_RATES[currency1] || !SERVER_RATES[currency2]){
        console.warn(`Missing rate for ${currency1} or ${currency2}`);
        return;
    }

    const rate1 = SERVER_RATES[currency1];
    const rate2 = SERVER_RATES[currency2];

    let sourceInput = amountOne;
    let targetInput = amountTwo;
    let sourceRate = rate1;
    let targetRate = rate2;

    if (e && e.target === amountTwo) {
        sourceInput = amountTwo;
        targetInput = amountOne;
        sourceRate = rate2;
        targetRate = rate1;
    }

    const amountInUAH = sourceInput.value * sourceRate; 

    const resultValue = (amountInUAH / targetRate).toFixed(2);

    updateConverterDial(targetInput, resultValue);

    updateRateText(currency1, currency2, rate1, rate2);
}

function updateRateText(curr1, curr2, r1, r2) {
    const singleRate = r1 / r2;
    rate.innerText = `1 ${curr1} = ${singleRate.toFixed(4)} ${curr2}`;
}

/* =========================================
   CYBER ANIMATION OF SCROLLING DIAL
========================================= */
function updateConverterDial(el, newValue) {
    if (!el) return;

    if (el.value !== String(newValue)) {
        el.classList.remove('roll-update');
        void el.offsetWidth; 
        
        el.classList.add('roll-update');

        setTimeout(() => {
            el.value = newValue;
        }, 150); 
    }
}

amountOne.addEventListener('input', calculate);
amountTwo.addEventListener('input', calculate);
currencyOne.addEventListener('change', calculate);
currencyTwo.addEventListener('change', calculate);

calculate();