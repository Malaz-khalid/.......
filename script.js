let currentUser = localStorage.getItem("user") || null;
let expenses = [];
let budget = localStorage.getItem("budget") || 0;

/* ================= LOGIN ================= */
function login() {
    let name = document.getElementById("username").value;

    if (!name) return;

    localStorage.setItem("user", name);
    currentUser = name;

    loadUserData();

    document.getElementById("loginBox").style.display = "none";
    document.getElementById("app").style.display = "block";
}

function loadUserData() {
    expenses = JSON.parse(localStorage.getItem("expenses_" + currentUser)) || [];
}

if (currentUser) {
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("app").style.display = "block";
    loadUserData();
}

/* ================= ADD EXPENSE ================= */
function addExpense() {
    let desc = document.getElementById("desc").value;
    let amount = document.getElementById("amount").value;
    let date = document.getElementById("date").value;
    let category = document.getElementById("category").value;

    if (!desc || !amount) return;

    expenses.push({
        desc,
        amount: parseFloat(amount),
        date,
        category
    });

    alert("تمت حفظ المصروف بنجاح ");

    save();
    render();
}

/* ================= SAVE ================= */
function save() {
    localStorage.setItem("expenses_" + currentUser, JSON.stringify(expenses));
}

/* ================= RENDER ================= */
function render() {
    let list = document.getElementById("list");
    list.innerHTML = "";

    let filterDate = document.getElementById("filterDate").value;
    let search = document.getElementById("search").value.toLowerCase();

    let filtered = expenses;

    if (filterDate) {
        filtered = filtered.filter(e => e.date === filterDate);
    }

    if (search) {
        filtered = filtered.filter(e =>
            e.desc.toLowerCase().includes(search)
        );
    }

    let total = 0;

    filtered.forEach((exp, i) => {
        total += exp.amount;

        list.innerHTML += `
            <li>
                ${exp.desc} - ${exp.category} - ${exp.amount} (${exp.date})
                <button onclick="deleteExp(${i})">❌</button>
            </li>
        `;
    });

    document.getElementById("total").innerText =
        expenses.reduce((s, e) => s + e.amount, 0);

    // budget
    if (budget && total > budget) {
        document.getElementById("warning").innerText =
            " انتبه لقد تجاوزت ميزانيتك !";
    } else {
        document.getElementById("warning").innerText = "";
    }

    save();
    drawChart();
    analyze();
}

/* ================= DELETE ================= */
function deleteExp(i) {
    expenses.splice(i, 1);
    render();
}

/* ================= CHART ================= */
function drawChart() {
    let c = document.getElementById("chart");
    let ctx = c.getContext("2d");

    ctx.clearRect(0,0,300,200);

    let t = { "الوجبات":0, "مواصلات":0, "تسوق":0, "أخرى":0 };

    expenses.forEach(e => t[e.category] += e.amount);

    let x = 10;

    for (let k in t) {
        ctx.fillStyle = "blue";
        ctx.fillRect(x, 200 - t[k], 30, t[k]);

        ctx.fillStyle = "black";
        ctx.fillText(k, x, 190);

        x += 60;
    }
}

/* ================= ANALYSIS ================= */
function analyze() {
    let total = expenses.reduce((s,e)=>s+e.amount,0);

    let food = expenses
        .filter(e => e.category === "الوجبات")
        .reduce((s,e)=>s+e.amount,0);

    if (food > total * 0.5) {
        document.getElementById("analysis").innerText =
        "تصرفك عالي في الوجبات!";
    } else {
        document.getElementById("analysis").innerText =
        "👍 مصاريفك متوازنة";
    }
}

/* ================= BUDGET ================= */
function setBudget() {
    budget = document.getElementById("budget").value;
    localStorage.setItem("budget", budget);
}

/* ================= CSV ================= */
function downloadCSV() {
    let csv = "desc,category,amount,date\n";

    expenses.forEach(e => {
        csv += `${e.desc},${e.category},${e.amount},${e.date}\n`;
    });

    let blob = new Blob([csv], {type:"text/csv"});
    let url = URL.createObjectURL(blob);

    let a = document.createElement("a");
    a.href = url;
    a.download = "expenses.csv";
    a.click();
}

/* ================= DARK ================= */
function toggleDark() {
    document.body.classList.toggle("dark");
}

/* ================= THEMES ================= */
function changeTheme() {
    document.body.classList.toggle("theme-blue");
    document.body.classList.toggle("theme-purple");
}
function changeTheme(theme) {
    document.body.className = theme;
    localStorage.setItem("theme", theme);
}

/* ================= CLEAR ALL ================= */
function clearAll() {
    if (confirm("هل تريد حذف كل البيانات؟")) {
        expenses = [];
        save();
        render();
    }
}

window.onload = function () {
    let savedTheme = localStorage.getItem("theme");

    if (savedTheme) {
        document.body.className = savedTheme;
    } else {
        document.body.className = "beige";
    }
};
/* ================= INIT ================= */
render();