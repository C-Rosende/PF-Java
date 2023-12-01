let app = {
  form: document.getElementById("form"),
  amountInput: document.getElementById("amount"),
  fromSelect: document.getElementById("from"),
  toSelect: document.getElementById("to"),
  resultDiv: document.getElementById("result"),
  errorDiv: document.getElementById("error"),
  apiURL: "https://v6.exchangerate-api.com/v6/b7ce959c6a2fee836009ded6/latest/",
  currencies: [],

  getRates: function(from, callback) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", this.apiURL + from);
    xhr.send();
    xhr.onload = function () {
      if (xhr.status == 200) {
        let response = JSON.parse(xhr.responseText);
        callback(response.conversion_rates);
      } else {
        this.showError("Error: " + xhr.statusText);
      }
    }.bind(this);
  },

  formatNumber: function(num) {
    num = Number(num);
    let parts = num.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return parts.join(",");
  },

  showResult: function(amount, from, to, rate) {
    let converted = amount * rate[to];
    let formattedConverted = this.formatNumber(converted);
    let formattedAmount = this.formatNumber(amount);
    let message = `${formattedAmount} ${from} = ${formattedConverted} ${to}`;
    this.resultDiv.textContent = message;
    this.resultDiv.style.display = "block";
    this.errorDiv.style.display = "none";
  },

  showError: function(message) {
    this.errorDiv.textContent = message;
    this.errorDiv.style.display = "block";
    this.resultDiv.style.display = "none";
  },

  handleSubmit: function(event) {
    event.preventDefault();
    let amount = Number(this.amountInput.value);
    let from = this.fromSelect.value;
    let to = this.toSelect.value;
    if (amount > 0) {
      this.getRates(from, function (rates) {
        this.showResult(amount, from, to, rates);
      }.bind(this));
    } else {
      this.showError("Por favor, introduce una cantidad válida");
    }
  },

  init: function() {
    this.form.addEventListener("submit", this.handleSubmit.bind(this));
    this.getRates("USD", function (rates) {
      this.currencies = Object.keys(rates);
      for (let currency of this.currencies) {
        let option = document.createElement('option');
        option.value = currency;
        option.textContent = currency;
        this.fromSelect.appendChild(option);
        this.toSelect.appendChild(option.cloneNode(true));
      }
    }.bind(this));

    let invertButton = document.getElementById("invert");
    invertButton.addEventListener("click", this.invertCurrencies.bind(this));
  },

  invertCurrencies: function() {
    let fromCurrency = this.fromSelect.value;
    let toCurrency = this.toSelect.value;
    this.fromSelect.value = toCurrency;
    this.toSelect.value = fromCurrency;
    this.handleSubmit(new Event('submit'));
  }
};

app.init();