var app = {
  form: document.getElementById("form"),
  amountInput: document.getElementById("amount"),
  fromSelect: document.getElementById("from"),
  toSelect: document.getElementById("to"),
  resultDiv: document.getElementById("result"),
  errorDiv: document.getElementById("error"),
  apiURL: "https://v6.exchangerate-api.com/v6/b7ce959c6a2fee836009ded6/latest/",

  getRates: function(from, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", this.apiURL + from);
    xhr.send();
    xhr.onload = function () {
      if (xhr.status == 200) {
        var response = JSON.parse(xhr.responseText);
        callback(response.conversion_rates);
      } else {
        this.showError("Error: " + xhr.statusText);
      }
    }.bind(this);
  },

  formatNumber: function(num) {
    num = Number(num);
    var parts = num.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return parts.join(",");
  },

  showResult: function(amount, from, to, rate) {
    var converted = amount * rate[to];
    var formattedConverted = this.formatNumber(converted);
    var formattedAmount = this.formatNumber(amount);
    var message = `${formattedAmount} ${from} = ${formattedConverted} ${to}`;
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
    var amount = Number(this.amountInput.value);
    var from = this.fromSelect.value;
    var to = this.toSelect.value;
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
      var currencies = Object.keys(rates);
      for (var currency of currencies) {
        var option = document.createElement('option');
        option.value = currency;
        option.textContent = currency;
        this.fromSelect.appendChild(option);
        this.toSelect.appendChild(option.cloneNode(true));
      }
    }.bind(this));

    var invertButton = document.getElementById("invert");
    invertButton.addEventListener("click", this.invertCurrencies.bind(this));
  },

  invertCurrencies: function() {
    var fromCurrency = this.fromSelect.value;
    var toCurrency = this.toSelect.value;
    this.fromSelect.value = toCurrency;
    this.toSelect.value = fromCurrency;
    this.handleSubmit(new Event('submit'));
  }
};

app.init();