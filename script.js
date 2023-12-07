let app = {
  form: document.getElementById("form"),
  amountInput: document.getElementById("amount"),
  fromSelect: document.getElementById("from"),
  toSelect: document.getElementById("to"),
  resultDiv: document.getElementById("result"),
  errorDiv: document.getElementById("error"),
  apiURL: "https://v6.exchangerate-api.com/v6/b7ce959c6a2fee836009ded6/latest/",
  currencies: [],

  getRates: async function(from, callback) {
    try {
      let response = await fetch(this.apiURL + from);
      if (!response.ok) throw new Error(response.statusText);
      let data = await response.json();
      callback(data.conversion_rates);
    } catch (error) {
      this.showError("Error: " + error.message);
    }
  },

  formatNumber: num => Number(num).toLocaleString(),

  showResult: function(amount, from, to, rate) {
    let converted = amount * rate[to];
    this.resultDiv.textContent = `${this.formatNumber(amount)} ${from} = ${this.formatNumber(converted)} ${to}`;
    this.resultDiv.style.display = "block";
    this.errorDiv.style.display = "none";
  },

  showError: function(message) {
    this.errorDiv.textContent = message;
    this.errorDiv.style.display = "block";
    this.resultDiv.style.display = "none";
  },

  handleSubmit: async function(event) {
    event.preventDefault();
    let amount = Number(this.amountInput.value);
    let from = this.fromSelect.value;
    let to = this.toSelect.value;
    if (amount > 0) {
      await this.getRates(from, rates => {
        this.showResult(amount, from, to, rates);
        localStorage.setItem('lastConversion', JSON.stringify({ amount, from, to, result: rates[to] }));
      });
    } else {
      this.showError("Por favor, introduce una cantidad válida");
    }
  },

  init: async function() {
    this.form.addEventListener("submit", this.handleSubmit.bind(this));
    await this.getRates("USD", rates => {
      this.currencies = Object.keys(rates);
      let options = this.currencies.map(currency => {
        let option = document.createElement('option');
        option.value = currency;
        option.textContent = currency;
        return option;
      });
      options.forEach(option => {
        this.fromSelect.appendChild(option.cloneNode(true));
        this.toSelect.appendChild(option.cloneNode(true));
      });
      this.fromSelect.value = "USD";
      this.toSelect.value = "CLP";
      this.fromSelect.addEventListener("change", this.checkCurrencies.bind(this));
      this.toSelect.addEventListener("change", this.checkCurrencies.bind(this));
      let lastConversion = JSON.parse(localStorage.getItem('lastConversion'));
      if (lastConversion) {
        this.amountInput.value = lastConversion.amount;
        this.fromSelect.value = lastConversion.from;
        this.toSelect.value = lastConversion.to;
        this.showResult(lastConversion.amount, lastConversion.from, lastConversion.to, { [lastConversion.to]: lastConversion.result });
      }
    });
  
    let invertButton = document.getElementById("invert");
    invertButton.addEventListener("click", this.invertCurrencies.bind(this));
  },

  checkCurrencies: function() {
    if (this.fromSelect.value === this.toSelect.value) {
      this.showError("Las dos monedas no pueden ser iguales");
      this.toSelect.value = this.currencies.find(currency => currency !== this.fromSelect.value);
    } else {
      this.errorDiv.style.display = "none";
    }
  },

  invertCurrencies: function() {
    [this.fromSelect.value, this.toSelect.value] = [this.toSelect.value, this.fromSelect.value];
    this.checkCurrencies();
    this.handleSubmit(new Event('submit'));
  },
};

app.init();