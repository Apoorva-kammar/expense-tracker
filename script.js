let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let editId = null;
let lastDeleted = null;
let chart;

// ---------- UTIL ----------
function saveAndRender(list = expenses) {
    localStorage.setItem("expenses", JSON.stringify(expenses));
    renderExpenses(list);
    renderAnalytics(list);
}

// ---------- ADD / EDIT ----------
function getFormData() {
    return {
        title: title.value,
        amount: Number(amount.value),
        category: category.value,
        date: date.value
    };
}

function saveExpense() {
    if (!title.value || !amount.value || !category.value || !date.value) {
        alert("Fill all fields");
        return;
    }

    if (editId) {
        expenses = expenses.map(e =>
            e.id === editId ? { ...e, ...getFormData() } : e
        );
        editId = null;
        saveBtn.innerText = "Add Expense";
    } else {
        expenses.push({
            id: Date.now().toString(),
            ...getFormData()
        });
    }

    title.value = amount.value = category.value = date.value = "";
    saveAndRender();
}


function startEdit(id) {
    const e = expenses.find(x => x.id === id);
    title.value = e.title;
    amount.value = e.amount;
    category.value = e.category;
    date.value = e.date;
    editId = id;
    saveBtn.innerText = "Update Expense";
}

// ---------- DELETE + UNDO ----------
function deleteExpense(id) {
    lastDeleted = expenses.find(e => e.id === id);
    expenses = expenses.filter(e => e.id !== id);
    undoBox.classList.remove("hidden");
    saveAndRender();

    setTimeout(() => {
        undoBox.classList.add("hidden");
        lastDeleted = null;
    }, 5000);
}

function undoDelete() {
    if (!lastDeleted) return;
    expenses.push(lastDeleted);
    lastDeleted = null;
    undoBox.classList.add("hidden");
    saveAndRender();
}

// ---------- RENDER LIST ----------
function renderExpenses(list) {
    expenseList.innerHTML = "";
    list.forEach(e => {
        const li = document.createElement("li");
        li.innerHTML = `
            ${e.title} - ₹${e.amount}
            <div class="actions">
                <button onclick="startEdit('${e.id}')">✏️</button>
                <button onclick="deleteExpense('${e.id}')">❌</button>
            </div>
        `;
        expenseList.appendChild(li);
    });
}

// ---------- ANALYTICS ----------
function renderAnalytics(list) {
    let totalAmount = 0;
    const categories = {};

    list.forEach(e => {
        totalAmount += e.amount;
        categories[e.category] =
            (categories[e.category] || 0) + e.amount;
    });

    // Update UI
    document.getElementById("total").innerText = totalAmount;

    document.getElementById("topCategory").innerText =
        Object.keys(categories).length
            ? Object.keys(categories).reduce((a, b) =>
                categories[a] > categories[b] ? a : b
              )
            : "-";

    renderChart(categories);
}


// ---------- CHART ----------
function renderChart(categories) {
    if (chart) chart.destroy();

    chart = new Chart(chartCanvas, {
        type: "pie",
        data: {
            labels: Object.keys(categories),
            datasets: [{
                data: Object.values(categories)
            }]
        }
    });
}

// ---------- FILTER ----------
function applyMonthFilter(month) {
    if (!month) {
        saveAndRender();
        return;
    }
    const filtered = expenses.filter(e => e.date.startsWith(month));
    saveAndRender(filtered);
}

// ---------- INIT ----------
saveAndRender();
