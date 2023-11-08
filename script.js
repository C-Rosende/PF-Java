const form = document.getElementById("form");
const amountInput = document.getElementById("amount");
const fromSelect = document.getElementById("from");
const toSelect = document.getElementById("to");
const resultDiv = document.getElementById("result");
const errorDiv = document.getElementById("error");
const apiURL = "https://v6.exchangerate-api.com/v6/b7ce959c6a2fee836009ded6/latest/";

function getRates(from, callback) {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", apiURL + from);
  xhr.send();
  xhr.onload = function () {
    if (xhr.status == 200) {
      const response = JSON.parse(xhr.responseText);
      callback(response.conversion_rates);
    } else {
      showError("Error: " + xhr.statusText);
    }
  };
}

function formatNumber(num) {
  num = Number(num);
  const parts = num.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return parts.join(",");
}

function showResult(amount, from, to, rate) {
  const converted = amount * rate[to];
  const formattedConverted = formatNumber(converted);
  const formattedAmount = formatNumber(amount);
  const message = `${formattedAmount} ${from} = ${formattedConverted} ${to}`;
  resultDiv.textContent = message;
  resultDiv.style.display = "block";
  errorDiv.style.display = "none";
}

function showError(message) {
  errorDiv.textContent = message;
  errorDiv.style.display = "block";
  resultDiv.style.display = "none";
}

function handleSubmit(event) {
  event.preventDefault();
  const amount = Number(amountInput.value);
  const from = fromSelect.value;
  const to = toSelect.value;
  if (amount > 0) {
    getRates(from, function (rates) {
      showResult(amount, from, to, rates);
    });
  } else {
    showError("Por favor, introduce una cantidad válida");
  }
}

form.addEventListener("submit", handleSubmit);

getRates("USD", function (rates) {
  const currencies = Object.keys(rates);
  for (const currency of currencies) {
    fromSelect.innerHTML += `<option value="${currency}">${currency}</option>`;
    toSelect.innerHTML += `<option value="${currency}">${currency}</option>`;
  }
});

const invertButton = document.getElementById("invert");

function invertCurrencies() {
  const fromCurrency = fromSelect.value;
  const toCurrency = toSelect.value;
  fromSelect.value = toCurrency;
  toSelect.value = fromCurrency;
  handleSubmit(new Event('submit'));
}

invertButton.addEventListener("click", invertCurrencies);
