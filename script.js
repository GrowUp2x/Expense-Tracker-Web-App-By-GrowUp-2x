const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
let currentYear = new Date().getFullYear();
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let categories = JSON.parse(localStorage.getItem('categories')) || ["Food", "Transport", "Entertainment"];
let budgets = JSON.parse(localStorage.getItem('budgets')) || {};

const expenseList = document.getElementById('expenseList');
const categorySelect = document.getElementById('category');
const monthlyBudgetElement = document.getElementById('monthlyBudget');
const yearlyBudgetElement = document.getElementById('yearlyBudget');
const totalExpensesElement = document.getElementById('totalExpenses');
const themeToggle = document.getElementById('themeToggle');
const resetYearlyBudget = document.getElementById('resetYearlyBudget');

function populateCalendar() {
  const monthSelect = document.getElementById('budgetMonth');
  const yearSelect = document.getElementById('budgetYear');

  monthSelect.innerHTML = months.map((m, i) => `<option value="${i}">${m}</option>`).join('');
  yearSelect.innerHTML = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)
    .map(y => `<option value="${y}">${y}</option>`).join('');
}

function updateCategoryOptions() {
  categorySelect.innerHTML = categories.map(c => `<option value="${c}">${c}</option>`).join('');
}

document.getElementById('budgetForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const selectedMonth = document.getElementById('budgetMonth').value;
  const selectedYear = document.getElementById('budgetYear').value;
  const budgetAmount = parseFloat(document.getElementById('monthlyBudgetInput').value);
  const today = new Date();
  const selectedDate = new Date(selectedYear, selectedMonth);

  if (selectedDate < today) {
    alert("You can only set budgets for the current or future months.");
    return;
  }

  const budgetKey = `${selectedYear}-${selectedMonth}`;
  budgets[budgetKey] = budgetAmount;
  localStorage.setItem('budgets', JSON.stringify(budgets));
  alert(`Budget set for ${months[selectedMonth]} ${selectedYear}: $${budgetAmount}`);
  updateBudgets();
});

document.getElementById('expenseForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const date = document.getElementById('date').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const currency = document.getElementById('currency').value;
  const category = document.getElementById('category').value;
  const description = document.getElementById('description').value;
  const expense = { date, amount, currency, category, description };
  expenses.push(expense);
  localStorage.setItem('expenses', JSON.stringify(expenses));
  updateExpenses();
  updateBudgets();
});

document.getElementById('voiceInput').addEventListener('click', () => {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.start();

  recognition.onresult = function (event) {
    const result = event.results[0][0].transcript;
    document.getElementById('description').value = result;
  };
});

document.getElementById('downloadCsv').addEventListener('click', () => {
  const csvContent = "Date,Amount,Currency,Category,Description\n" +
    expenses.map(exp => `${exp.date},${exp.amount},${exp.currency},${exp.category},${exp.description}`).join("\n");

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "expenses.csv";
  link.click();
});

resetYearlyBudget.addEventListener('click', () => {
  // Reset all budgets
  localStorage.setItem('budgets', JSON.stringify({}));
  alert("Yearly budget has been reset!");
  updateBudgets();
});

function updateExpenses() {
  expenseList.innerHTML = expenses.map((exp, index) => `
    <tr>
      <td>${exp.date}</td>
      <td>${exp.amount}</td>
      <td>${exp.currency}</td>
      <td>${exp.category}</td>
      <td>${exp.description}</td>
      <td><button class="edit" onclick="editExpense(${index})">Edit</button> 
      <button class="delete" onclick="deleteExpense(${index})">Delete</button></td>
    </tr>
  `).join('');
  totalExpensesElement.textContent = `Total Expenses: $${expenses.reduce((sum, e) => sum + e.amount, 0)}`;
}

function deleteExpense(index) {
  expenses.splice(index, 1);
  localStorage.setItem('expenses', JSON.stringify(expenses));
  updateExpenses();
}

function editExpense(index) {
  const expense = expenses[index];
  document.getElementById('date').value = expense.date;
  document.getElementById('amount').value = expense.amount;
  document.getElementById('currency').value = expense.currency;
  document.getElementById('category').value = expense.category;
  document.getElementById('description').value = expense.description;
  expenses.splice(index, 1);
}

function updateBudgets() {
  const month = new Date().getMonth();
  const year = new Date().getFullYear();
  const currentMonthBudget = budgets[`${year}-${month}`] || 0;
  const totalMonthExpenses = expenses.filter(exp => new Date(exp.date).getMonth() === month).reduce((sum, e) => sum + e.amount, 0);
  const remainingBudget = currentMonthBudget - totalMonthExpenses;

  monthlyBudgetElement.textContent = `Monthly Budget: $${currentMonthBudget} / $${totalMonthExpenses} (Remaining: $${remainingBudget})`;

  const totalYearExpenses = expenses.filter(exp => new Date(exp.date).getFullYear() === year).reduce((sum, e) => sum + e.amount, 0);
  const currentYearBudget = budgets[`${year}`] || 0;

  yearlyBudgetElement.textContent = `Yearly Budget: $${currentYearBudget} / $${totalYearExpenses}`;
}

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-theme');
});

populateCalendar();
updateCategoryOptions();
updateExpenses();
updateBudgets();
