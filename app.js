/* =========================================================
   app.js
   रोजचा जमा खर्च अहवाल

   CENTRAL DATA + CALCULATION SYSTEM

   IMPORTANT:
   सर्व modules याच central transaction structure वर
   काम करतील.
========================================================= */


/* =========================================================
   STORAGE KEYS
========================================================= */

const STORAGE_KEYS = {

    transactions:
        "rdkh_transactions",

    accounts:
        "rdkh_accounts",

    budgets:
        "rdkh_monthly_budgets",

    settings:
        "rdkh_settings"

};



/* =========================================================
   DEFAULT DATA
========================================================= */

const DEFAULT_ACCOUNTS = [

    {
        id: "cash",
        name: "Cash",
        type: "cash",
        openingBalance: 0
    },

    {
        id: "bank",
        name: "Bank",
        type: "bank",
        openingBalance: 0
    },

    {
        id: "upi",
        name: "UPI",
        type: "upi",
        openingBalance: 0
    }

];



/* =========================================================
   BASIC STORAGE FUNCTIONS
========================================================= */

function getData(key, defaultValue = []) {

    try {

        const data =
            localStorage.getItem(key);

        if (!data) {

            return defaultValue;

        }

        const parsed =
            JSON.parse(data);

        return parsed;

    }

    catch (error) {

        console.error(
            "Storage Read Error:",
            error
        );

        return defaultValue;

    }

}



function saveData(key, data) {

    try {

        localStorage.setItem(
            key,
            JSON.stringify(data)
        );

        return true;

    }

    catch (error) {

        console.error(
            "Storage Save Error:",
            error
        );

        return false;

    }

}



/* =========================================================
   TRANSACTIONS
========================================================= */

function getTransactions() {

    return getData(
        STORAGE_KEYS.transactions,
        []
    );

}



function saveTransactions(transactions) {

    return saveData(
        STORAGE_KEYS.transactions,
        transactions
    );

}



/* =========================================================
   ACCOUNTS
========================================================= */

function getAccounts() {

    let accounts =
        getData(
            STORAGE_KEYS.accounts,
            []
        );


    if (!Array.isArray(accounts)) {

        accounts = [];

    }


    return accounts;

}



function saveAccounts(accounts) {

    return saveData(
        STORAGE_KEYS.accounts,
        accounts
    );

}



/* =========================================================
   INITIALIZE DEFAULT ACCOUNTS
========================================================= */

function initializeAccounts() {

    const accounts =
        getAccounts();


    if (accounts.length === 0) {

        saveAccounts(
            DEFAULT_ACCOUNTS
        );

    }

}



/* =========================================================
   BUDGET
========================================================= */

function getBudgets() {

    return getData(
        STORAGE_KEYS.budgets,
        []
    );

}



function saveBudgets(budgets) {

    return saveData(
        STORAGE_KEYS.budgets,
        budgets
    );

}



/* =========================================================
   DATE HELPERS
========================================================= */

function getTodayString() {

    const today =
        new Date();

    const year =
        today.getFullYear();

    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            today.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;

}



function getCurrentMonth() {

    const today =
        new Date();

    const year =
        today.getFullYear();

    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");


    return `${year}-${month}`;

}



/* =========================================================
   CURRENCY FORMAT
========================================================= */

function formatMoney(amount) {

    const value =
        Number(amount) || 0;


    return "₹" +
        value.toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

}



/* =========================================================
   TOTAL INCOME
========================================================= */

function getTotalIncome() {

    const transactions =
        getTransactions();


    return transactions
        .filter(
            transaction =>
                transaction.type === "income"
        )
        .reduce(
            (total, transaction) =>
                total +
                Number(transaction.amount || 0),
            0
        );

}



/* =========================================================
   TOTAL EXPENSE
========================================================= */

function getTotalExpense() {

    const transactions =
        getTransactions();


    return transactions
        .filter(
            transaction =>
                transaction.type === "expense"
        )
        .reduce(
            (total, transaction) =>
                total +
                Number(transaction.amount || 0),
            0
        );

}



/* =========================================================
   TOTAL BALANCE
========================================================= */

function getTotalBalance() {

    const accounts =
        getAccounts();


    let openingBalance = 0;


    accounts.forEach(
        account => {

            openingBalance +=
                Number(
                    account.openingBalance || 0
                );

        }
    );


    return (
        openingBalance +
        getTotalIncome() -
        getTotalExpense()
    );

}



/* =========================================================
   TODAY INCOME
========================================================= */

function getTodayIncome() {

    const today =
        getTodayString();


    return getTransactions()

        .filter(
            transaction =>
                transaction.type === "income" &&
                transaction.date === today
        )

        .reduce(
            (total, transaction) =>
                total +
                Number(transaction.amount || 0),
            0
        );

}



/* =========================================================
   TODAY EXPENSE
========================================================= */

function getTodayExpense() {

    const today =
        getTodayString();


    return getTransactions()

        .filter(
            transaction =>
                transaction.type === "expense" &&
                transaction.date === today
        )

        .reduce(
            (total, transaction) =>
                total +
                Number(transaction.amount || 0),
            0
        );

}



/* =========================================================
   TODAY SAVING
========================================================= */

function getTodaySaving() {

    return (
        getTodayIncome() -
        getTodayExpense()
    );

}



/* =========================================================
   MONTH EXPENSE
========================================================= */

function getMonthExpense(
    month = getCurrentMonth()
) {

    return getTransactions()

        .filter(
            transaction =>
                transaction.type === "expense" &&
                transaction.date &&
                transaction.date.startsWith(month)
        )

        .reduce(
            (total, transaction) =>
                total +
                Number(transaction.amount || 0),
            0
        );

}



/* =========================================================
   MONTH INCOME
========================================================= */

function getMonthIncome(
    month = getCurrentMonth()
) {

    return getTransactions()

        .filter(
            transaction =>
                transaction.type === "income" &&
                transaction.date &&
                transaction.date.startsWith(month)
        )

        .reduce(
            (total, transaction) =>
                total +
                Number(transaction.amount || 0),
            0
        );

}



/* =========================================================
   MONTHLY BUDGET
========================================================= */

function getCurrentMonthBudget() {

    const month =
        getCurrentMonth();


    const budgets =
        getBudgets();


    const budget =
        budgets.find(
            item =>
                item.month === month
        );


    return budget || {

        month: month,

        incomePlan: 0,

        expenseBudget: 0,

        savingTarget: 0,

        categories: []

    };

}



/* =========================================================
   BUDGET REMAINING
========================================================= */

function getBudgetRemaining() {

    const budget =
        getCurrentMonthBudget();


    const spent =
        getMonthExpense();


    return (
        Number(
            budget.expenseBudget || 0
        ) - spent
    );

}



/* =========================================================
   BUDGET PERCENTAGE
========================================================= */

function getBudgetPercentage() {

    const budget =
        getCurrentMonthBudget();


    const planned =
        Number(
            budget.expenseBudget || 0
        );


    if (planned <= 0) {

        return 0;

    }


    const spent =
        getMonthExpense();


    return Math.min(
        100,
        (spent / planned) * 100
    );

}



/* =========================================================
   DASHBOARD UPDATE
========================================================= */

function updateDashboard() {


    /* TOTAL */

    const totalBalance =
        document.getElementById(
            "totalBalance"
        );

    const totalIncome =
        document.getElementById(
            "totalIncome"
        );

    const totalExpense =
        document.getElementById(
            "totalExpense"
        );


    if (totalBalance) {

        totalBalance.textContent =
            formatMoney(
                getTotalBalance()
            );

    }


    if (totalIncome) {

        totalIncome.textContent =
            formatMoney(
                getTotalIncome()
            );

    }


    if (totalExpense) {

        totalExpense.textContent =
            formatMoney(
                getTotalExpense()
            );

    }



    /* TODAY */

    const todayIncome =
        document.getElementById(
            "todayIncome"
        );

    const todayExpense =
        document.getElementById(
            "todayExpense"
        );

    const todaySaving =
        document.getElementById(
            "todaySaving"
        );


    if (todayIncome) {

        todayIncome.textContent =
            formatMoney(
                getTodayIncome()
            );

    }


    if (todayExpense) {

        todayExpense.textContent =
            formatMoney(
                getTodayExpense()
            );

    }


    if (todaySaving) {

        todaySaving.textContent =
            formatMoney(
                getTodaySaving()
            );

    }



    /* BUDGET */

    updateBudgetDashboard();


    /* ACCOUNTS */

    updateAccountDashboard();


    /* RECENT TRANSACTIONS */

    updateRecentTransactions();


    /* REMINDER */

    updateReminder();

}



/* =========================================================
   BUDGET DASHBOARD
========================================================= */

function updateBudgetDashboard() {

    const budget =
        getCurrentMonthBudget();


    const spent =
        getMonthExpense();


    const remaining =
        getBudgetRemaining();


    const percentage =
        getBudgetPercentage();


    const monthBudget =
        document.getElementById(
            "monthBudget"
        );

    const budgetAmount =
        document.getElementById(
            "budgetAmount"
        );

    const budgetSpent =
        document.getElementById(
            "budgetSpent"
        );

    const budgetRemaining =
        document.getElementById(
            "budgetRemaining"
        );

    const budgetProgress =
        document.getElementById(
            "budgetProgress"
        );

    const budgetPercentage =
        document.getElementById(
            "budgetPercentage"
        );


    if (monthBudget) {

        monthBudget.textContent =
            formatMoney(
                budget.expenseBudget
            );

    }


    if (budgetAmount) {

        budgetAmount.textContent =
            formatMoney(
                budget.expenseBudget
            );

    }


    if (budgetSpent) {

        budgetSpent.textContent =
            formatMoney(
                spent
            );

    }


    if (budgetRemaining) {

        budgetRemaining.textContent =
            formatMoney(
                Math.max(
                    0,
                    remaining
                )
            );

    }


    if (budgetProgress) {

        budgetProgress.style.width =
            percentage + "%";

    }


    if (budgetPercentage) {

        budgetPercentage.textContent =
            Math.round(percentage) +
            "% वापरले";

    }

}



/* =========================================================
   ACCOUNT BALANCES
========================================================= */

function getAccountBalance(
    accountId
) {

    const accounts =
        getAccounts();


    const account =
        accounts.find(
            item =>
                item.id === accountId
        );


    if (!account) {

        return 0;

    }


    const transactions =
        getTransactions();


    let balance =
        Number(
            account.openingBalance || 0
        );


    transactions.forEach(
        transaction => {

            if (
                transaction.accountId !==
                accountId
            ) {

                return;

            }


            const amount =
                Number(
                    transaction.amount || 0
                );


            if (
                transaction.type ===
                "income"
            ) {

                balance += amount;

            }


            if (
                transaction.type ===
                "expense"
            ) {

                balance -= amount;

            }

        }
    );


    return balance;

}



/* =========================================================
   ACCOUNT DASHBOARD
========================================================= */

function updateAccountDashboard() {

    const container =
        document.getElementById(
            "accountSummary"
        );


    if (!container) {

        return;

    }


    const accounts =
        getAccounts();


    if (accounts.length === 0) {

        return;

    }


    container.innerHTML = "";


    accounts
        .slice(0, 4)
        .forEach(
            account => {

                const balance =
                    getAccountBalance(
                        account.id
                    );


                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "account-card";


                card.innerHTML = `

                    <div class="account-name">

                        ${escapeHTML(account.name)}

                    </div>

                    <div class="account-balance">

                        ${formatMoney(balance)}

                    </div>

                `;


                container.appendChild(
                    card
                );

            }
        );

}



/* =========================================================
   RECENT TRANSACTIONS
========================================================= */

function updateRecentTransactions() {

    const container =
        document.getElementById(
            "recentTransactions"
        );


    if (!container) {

        return;

    }


    const transactions =
        getTransactions();


    if (transactions.length === 0) {

        return;

    }


    const recent =
        [...transactions]
            .sort(
                (a, b) =>
                    new Date(
                        b.date
                    ) -
                    new Date(
                        a.date
                    )
            )
            .slice(0, 5);


    container.innerHTML = "";


    recent.forEach(
        transaction => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "transaction-item";


            const isIncome =
                transaction.type ===
                "income";


            item.innerHTML = `

                <div class="transaction-icon"
                     style="
                        background:
                        ${isIncome
                            ? "#e8f5ed"
                            : "#fdeaea"};

                        color:
                        ${isIncome
                            ? "#16803c"
                            : "#c62828"};
                     ">

                    <i class="fa-solid
                        ${isIncome
                            ? "fa-arrow-down"
                            : "fa-arrow-up"}">
                    </i>

                </div>


                <div class="transaction-details">

                    <strong>

                        ${escapeHTML(
                            transaction.category ||
                            (
                                isIncome
                                    ? "जमा"
                                    : "खर्च"
                            )
                        )}

                    </strong>


                    <span>

                        ${formatDisplayDate(
                            transaction.date
                        )}

                        ${
                            transaction.note
                                ? " • " +
                                  escapeHTML(
                                      transaction.note
                                  )
                                : ""
                        }

                    </span>

                </div>


                <div class="transaction-amount"
                     style="
                        color:
                        ${isIncome
                            ? "#16803c"
                            : "#c62828"};
                     ">

                    ${
                        isIncome
                            ? "+"
                            : "-"
                    }

                    ${formatMoney(
                        transaction.amount
                    )}

                </div>

            `;


            container.appendChild(
                item
            );

        }
    );

}



/* =========================================================
   DATE DISPLAY
========================================================= */

function formatDisplayDate(
    dateString
) {

    if (!dateString) {

        return "";

    }


    const parts =
        dateString.split("-");


    if (parts.length !== 3) {

        return dateString;

    }


    return (
        parts[2] +
        "-" +
        parts[1] +
        "-" +
        parts[0]
    );

}



/* =========================================================
   HTML SAFETY
========================================================= */

function escapeHTML(value) {

    return String(
        value ?? ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}



/* =========================================================
   BALANCE VISIBILITY
========================================================= */

let balanceHidden =
    false;


function toggleBalance() {

    balanceHidden =
        !balanceHidden;


    const ids = [

        "totalBalance",
        "totalIncome",
        "totalExpense",
        "todayIncome",
        "todayExpense",
        "todaySaving"

    ];


    ids.forEach(
        id => {

            const element =
                document.getElementById(
                    id
                );


            if (!element) {

                return;

            }


            if (balanceHidden) {

                element.dataset.original =
                    element.textContent;

                element.textContent =
                    "₹••••";


            } else {

                element.textContent =
                    element.dataset.original ||
                    "₹0.00";

            }

        }
    );


    const eye =
        document.getElementById(
            "balanceEye"
        );


    if (eye) {

        eye.className =
            balanceHidden
                ? "fa-solid fa-eye-slash"
                : "fa-solid fa-eye";

    }

}



/* =========================================================
   REMINDER
========================================================= */

function updateReminder() {

    const dot =
        document.getElementById(
            "notificationDot"
        );


    if (!dot) {

        return;

    }


    const todayExpense =
        getTodayExpense();


    if (todayExpense <= 0) {

        dot.style.display =
            "block";

    } else {

        dot.style.display =
            "none";

    }

}


function openReminder() {

    goToExpense();

}



/* =========================================================
   NAVIGATION
========================================================= */

function goHome() {

    window.location.href =
        "index.html";

}


function goToIncome() {

    window.location.href =
        "income.html";

}


function goToExpense() {

    window.location.href =
        "expense.html";

}


function goToAccounts() {

    window.location.href =
        "accounts.html";

}


function goToTransactions() {

    window.location.href =
        "transactions.html";

}


function goToBudget() {

    window.location.href =
        "monthly-budget.html";

}


function goToReports() {

    window.location.href =
        "reports.html";

}


function goToSettings() {

    window.location.href =
        "settings.html";

}



/* =========================================================
   ADD MENU
========================================================= */

function showAddMenu() {

    const menu =
        document.getElementById(
            "addMenu"
        );


    if (menu) {

        menu.classList.add(
            "show"
        );

    }

}


function closeAddMenu(event) {

    if (
        !event ||
        event.target.id ===
        "addMenu"
    ) {

        const menu =
            document.getElementById(
                "addMenu"
            );


        if (menu) {

            menu.classList.remove(
                "show"
            );

        }

    }

}



/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {


        initializeAccounts();


        const todayDate =
            document.getElementById(
                "todayDate"
            );


        if (todayDate) {

            const today =
                new Date();


            todayDate.textContent =
                today.toLocaleDateString(
                    "mr-IN",
                    {
                        weekday: "long",
                        day: "2-digit",
                        month: "long",
                        year: "numeric"
                    }
                );

        }


        updateDashboard();


    }
);



/* =========================================================
   AUTO REFRESH
========================================================= */

window.addEventListener(
    "storage",
    function () {

        updateDashboard();

    }
);
