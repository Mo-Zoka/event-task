let customersData = [];
let transactionsData = [];
let customerTotals = {};
let currentData = [];
let myChart;
let myChart2;

getCustomers();

async function getCustomers() {
  showLoading();
  let result = await fetch(`http://localhost:3000/customers`);
  customersData = await result.json();
  // hideLoading();
  getTransactions();
}

async function getTransactions() {
  // showLoading();
  let result = await fetch(`http://localhost:3000/transactions`);
  transactionsData = await result.json();
  hideLoading();
  getTotalChart();
  currentData = transactionsData;
  displayTable(currentData);
}

function getTotalChart() {
  transactionsData.forEach((transaction) => {
    let { customer_id, amount } = transaction;
    if (customerTotals[customer_id]) {
      customerTotals[customer_id] += amount;
    } else {
      customerTotals[customer_id] = amount;
    }
  });

  let sortedCustomerTotals = Object.entries(customerTotals).sort(
    (a, b) => a[0] - b[0]
  );

  let CustomerTotalsObject = sortedCustomerTotals.map(
    ([customer_id, totalAmount]) => ({
      customer_id: parseInt(customer_id, 10),
      totalAmount,
    })
  );

  let customersNames = [];
  for (let i = 0; i < customersData.length; i++) {
    customersNames[i] = customersData[i].name;
  }

  let customerTotalsAmount = [];
  for (let i = 0; i < CustomerTotalsObject.length; i++) {
    customerTotalsAmount[i] = CustomerTotalsObject[i].totalAmount;
  }

  displayChart(customersNames, customerTotalsAmount);
}

function displayTable(data) {
  let table = document.getElementById("table-data");
  let box = "";
  for (let i = 0; i < data.length; i++) {
    let customer = customersData.find(
      (customer) => customer.id === data[i].customer_id.toString()
    );
    let customerName = customer.name;
    box += `
    <tr>
      <td>${data[i].id}</td>
      <td>${data[i].date}</td>
      <td class="customer-name" data-customer-id="${customer.id}">${customerName}</td>
      <td class="text-end"><span class="fw-bolder">${data[i].amount}$</span></td>
    </tr>
    `;
  }

  table.innerHTML = box;

  document.querySelectorAll('.customer-name').forEach(item => {
    item.addEventListener('click', function() {
      let customerId = parseInt(this.dataset.customerId, 10);
      getDailyTransactionsChart(customerId);
    });
  });
}

function getDailyTransactionsChart(customerId) {
  let customerTransactions = transactionsData.filter(transaction => transaction.customer_id === customerId);

  let dailyTotals = {};

  customerTransactions.forEach(transaction => {
    let { date, amount } = transaction;
    if (!dailyTotals[date]) {
      dailyTotals[date] = 0;
    }
    dailyTotals[date] += amount;
  });

  let sortedDailyTotals = Object.entries(dailyTotals).sort((a, b) => new Date(a[0]) - new Date(b[0]));

  let dates = sortedDailyTotals.map(([date, totalAmount]) => date);
  let totalAmounts = sortedDailyTotals.map(([date, totalAmount]) => totalAmount);

  displayChart2(dates, totalAmounts);
}

function displayChart2(labels, data) {
  const ctx = document.getElementById("myChart2");

  if (myChart2) {
    myChart2.destroy();
  }

  myChart2 = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "dollars",
          data: data,
          borderWidth: 1.5,
          borderColor: "rgb(70, 107, 199)",
          fill: true,
          backgroundColor: "rgba(119, 152, 237, 0.4)",
          tension: 0.1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Customer's Daily Transactions",
        },
      },
    },
  });
}

// --- chart start --- //
function displayChart(labels, data) {
  const ctx = document.getElementById("myChart");
  if (myChart) {
    myChart.destroy();
  }
  myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "dollars",
          data: data,
          borderWidth: 1.5,
          borderColor: "rgb(70, 107, 199)",
          fill: true,
          backgroundColor: "rgba(119, 152, 237, 0.4)",
          tension: 0.1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Total transaction amount",
        },
      },
    },
  });
}

// --- chart end --- //

// --- loading --- //
function showLoading() {
  $(".loading").css("display", "flex");
}

function hideLoading() {
  $(".loading").css("display", "none");
}
// --- loading --- //

// --- search bar --- //

$(".search-bar").on("keyup", function () {
  let value = $(this).val();
  currentData = searchTable(value, transactionsData);
  displayTable(currentData);
});

function searchTable(value, data) {
  let filteredData = [];

  if (value.trim() === "") {
    return data;
  }

  for (let i = 0; i < data.length; i++) {
    let customer = customersData.find(
      (customer) => customer.id === transactionsData[i].customer_id.toString()
    );
    let customerName = customer.name;
    value = value.toLowerCase();
    let name = customerName.toLowerCase();

    if (name.includes(value)) {
      filteredData.push(data[i]);
    }
  }

  return filteredData;
}

$(".search-bar2").on("keyup", function () {
  let value = $(this).val();
  currentData = searchTableByAmount(value, transactionsData);
  displayTable(currentData);
});

function searchTableByAmount(value, data) {
  let filteredData = [];

  if (value.trim() === "") {
    return data;
  }

  value = parseFloat(value);

  for (let i = 0; i < data.length; i++) {
    let amount = parseFloat(data[i].amount);

    if (!isNaN(value) && amount.toString().includes(value.toString())) {
      filteredData.push(data[i]);
    }
  }

  return filteredData;
}

// --- search bar --- //

// --- sort the table --- //

$(".order-data").on("click", function () {
  var column = $(this).data("column");
  var order = $(this).data("order");
  var text = $(this).html();
  text = text.substring(0, text.length - 1);

  if (order == "desc") {
    $(this).data("order", "asc");
    currentData = currentData.sort((a, b) =>
      parseFloat(a[column]) > parseFloat(b[column]) ? 1 : -1
    );
    text += "&#9660";
  } else {
    $(this).data("order", "desc");
    currentData = currentData.sort((a, b) =>
      parseFloat(a[column]) < parseFloat(b[column]) ? 1 : -1
    );
    text += "&#9650";
  }

  $(this).html(text);
  displayTable(currentData);
});

// --- sort the table --- //
