/* =========================================================
   app.js
   रोजचा जमा खर्च अहवाल

   CENTRAL APPLICATION SYSTEM
   =========================================================

   CONNECTED MODULES:
   - index.html
   - income.html / income.js
   - expense.html / expense.js
   - accounts.html / accounts.js
   - transactions.html / transactions.js
   - monthly-budget.html / monthly-budget.js
   - reports.html / reports.js
   - settings.html / settings.js
   - login.html / login.js

   STORAGE:
   - rdkh_transactions
   - rdkh_accounts
   - rdkh_monthly_budgets
   - rdkh_budget_categories
   - rdkh_settings
   - rdkh_login_session
========================================================= */

/* =========================================================
   AUTHENTICATION CHECK
   ========================================================= */

(function checkAuthentication() {

    const currentPage =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();


    /* Login page ला protection लागू नाही */

    if (
        currentPage === "" ||
        currentPage === "login.html"
    ) {

        return;

    }


    /* Login session तपासा */

    let session = null;

    try {

        session =
            JSON.parse(
                localStorage.getItem(
                    "rdkh_login_session"
                )
            );

    } catch (error) {

        session = null;

    }


    const loggedIn =
        session &&
        (
            session.loggedIn === true ||
            session.isLoggedIn === true
        );


    /* Login नसेल तर Login page */

    if (!loggedIn) {

        window.location.replace(
            "login.html"
        );

    }

})();
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

    budgetCategories:
        "rdkh_budget_categories",

    settings:
        "rdkh_settings",

    loginSession:
        "rdkh_login_session"

};



/* =========================================================
   DEFAULT ACCOUNTS
========================================================= */

const DEFAULT_ACCOUNTS = [

    {
        id: "cash",
        name: "Cash",
        type: "cash",
        openingBalance: 0,
        createdAt: null
    },

    {
        id: "bank",
        name: "Bank",
        type: "bank",
        openingBalance: 0,
        createdAt: null
    },

    {
        id: "upi",
        name: "UPI",
        type: "upi",
        openingBalance: 0,
        createdAt: null
    }

];



/* =========================================================
   BASIC STORAGE
========================================================= */

function getData(
    key,
    defaultValue = []
) {

    try {

        const data =
            localStorage.getItem(key);


        if (
            data === null ||
            data === ""
        ) {

            return defaultValue;

        }


        return JSON.parse(data);

    }

    catch (error) {

        console.error(
            "Storage Read Error:",
            key,
            error
        );

        return defaultValue;

    }

}



function saveData(
    key,
    data
) {

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
            key,
            error
        );

        return false;

    }

}



function removeData(key) {

    try {

        localStorage.removeItem(key);

        return true;

    }

    catch (error) {

        console.error(
            "Storage Remove Error:",
            error
        );

        return false;

    }

}



/* =========================================================
   TRANSACTIONS
========================================================= */

function getTransactions() {

    const transactions =
        getData(
            STORAGE_KEYS.transactions,
            []
        );


    return Array.isArray(
        transactions
    )
        ? transactions
        : [];

}



function saveTransactions(
    transactions
) {

    if (
        !Array.isArray(
            transactions
        )
    ) {

        return false;

    }


    const saved =
        saveData(
            STORAGE_KEYS.transactions,
            transactions
        );


    if (saved) {

        dispatchTransactionsUpdated();

    }


    return saved;

}



/* =========================================================
   TRANSACTION EVENT
========================================================= */

function dispatchTransactionsUpdated() {

    try {

        window.dispatchEvent(
            new CustomEvent(
                "rdkhTransactionsUpdated"
            )
        );

    }

    catch (error) {

        console.error(
            "Transaction event error:",
            error
        );

    }

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


    if (
        !Array.isArray(accounts)
    ) {

        accounts = [];

    }


    return accounts;

}



function saveAccounts(
    accounts
) {

    if (
        !Array.isArray(
            accounts
        )
    ) {

        return false;

    }


    return saveData(
        STORAGE_KEYS.accounts,
        accounts
    );

}



/* =========================================================
   INITIALIZE DEFAULT ACCOUNTS
========================================================= */

function initializeAccounts() {

    let accounts =
        getAccounts();


    if (
        accounts.length === 0
    ) {

        accounts =
            DEFAULT_ACCOUNTS.map(
                account => ({

                    ...account,

                    createdAt:
                        new Date().toISOString()

                })
            );


        saveAccounts(
            accounts
        );

        return accounts;

    }



    /*
       जर Cash / Bank / UPI
       missing असतील तर add करा.
    */

    DEFAULT_ACCOUNTS.forEach(
        defaultAccount => {

            const exists =
                accounts.some(
                    account =>
                        account.id ===
                        defaultAccount.id
                );


            if (!exists) {

                accounts.push({

                    ...defaultAccount,

                    createdAt:
                        new Date().toISOString()

                });

            }

        }
    );


    saveAccounts(
        accounts
    );


    return accounts;

}



/* =========================================================
   BUDGET
========================================================= */

function getBudgets() {

    const data =
        getData(
            STORAGE_KEYS.budgets,
            []
        );


    /*
       monthly-budget.js मध्ये
       object structure वापरले आहे.

       त्यामुळे object असेल तर त्याला
       compatible array मध्ये convert करू.
    */

    if (
        Array.isArray(data)
    ) {

        return data;

    }


    if (
        data &&
        typeof data === "object"
    ) {

        return Object.keys(data)
            .map(
                month =>
                    data[month]
            );

    }


    return [];

}



function saveBudgets(
    budgets
) {

    return saveData(
        STORAGE_KEYS.budgets,
        budgets
    );

}



/* =========================================================
   CURRENT MONTH BUDGET
========================================================= */

function getCurrentMonthBudget() {

    const month =
        getCurrentMonth();


    const raw =
        getData(
            STORAGE_KEYS.budgets,
            {}
        );


    /*
       New monthly-budget.js structure
    */

    if (
        raw &&
        typeof raw === "object" &&
        !Array.isArray(raw)
    ) {

        if (
            raw[month]
        ) {

            const budget =
                raw[month];


            return normalizeBudget(
                budget,
                month
            );

        }

    }



    /*
       Old array structure compatibility
    */

    if (
        Array.isArray(raw)
    ) {

        const budget =
            raw.find(
                item =>
                    item &&
                    item.month === month
            );


        if (budget) {

            return normalizeBudget(
                budget,
                month
            );

        }

    }



    return {

        month: month,

        plannedMoney: 0,

        incomePlan: 0,

        expenseBudget: 0,

        savingTarget: 0,

        alertPercent: 80,

        categories: {},

        createdAt: null,

        updatedAt: null

    };

}



function normalizeBudget(
    budget,
    month
) {

    const source =
        budget || {};


    let categories =
        source.categories;


    if (
        Array.isArray(categories)
    ) {

        const converted = {};


        categories.forEach(
            item => {

                if (
                    item &&
                    item.id
                ) {

                    converted[
                        item.id
                    ] =
                        Number(
                            item.amount || 0
                        );

                }

            }
        );


        categories =
            converted;

    }


    if (
        !categories ||
        typeof categories !== "object"
    ) {

        categories = {};

    }


    return {

        month:
            source.month ||
            month,

        plannedMoney:
            Number(
                source.plannedMoney ||
                source.incomePlan ||
                0
            ),

        incomePlan:
            Number(
                source.incomePlan ||
                source.plannedMoney ||
                0
            ),

        expenseBudget:
            Number(
                source.expenseBudget ||
                0
            ),

        savingTarget:
            Number(
                source.savingTarget ||
                0
            ),

        alertPercent:
            Number(
                source.alertPercent ||
                80
            ),

        categories:
            categories,

        createdAt:
            source.createdAt ||
            null,

        updatedAt:
            source.updatedAt ||
            null

    };

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
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            today.getDate()
        ).padStart(
            2,
            "0"
        );


    return (
        year +
        "-" +
        month +
        "-" +
        day
    );

}



function getCurrentMonth() {

    const today =
        new Date();


    const year =
        today.getFullYear();


    const month =
        String(
            today.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    return (
        year +
        "-" +
        month
    );

}



function normalizeDate(
    date
) {

    if (!date) {

        return "";

    }


    const value =
        String(date);


    /*
       YYYY-MM-DD
    */

    if (
        /^\d{4}-\d{2}-\d{2}$/
            .test(value)
    ) {

        return value;

    }


    const parsed =
        new Date(date);


    if (
        isNaN(
            parsed.getTime()
        )
    ) {

        return "";

    }


    return (

        parsed.getFullYear() +
        "-" +
        String(
            parsed.getMonth() + 1
        ).padStart(
            2,
            "0"
        ) +
        "-" +
        String(
            parsed.getDate()
        ).padStart(
            2,
            "0"
        )

    );

}



function formatDisplayDate(
    dateString
) {

    const date =
        normalizeDate(
            dateString
        );


    if (!date) {

        return "";

    }


    const parts =
        date.split("-");


    if (
        parts.length !== 3
    ) {

        return date;

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
   CURRENCY
========================================================= */

function formatMoney(
    amount
) {

    const value =
        Number(amount) || 0;


    return (
        "₹" +
        value.toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )
    );

}



/* =========================================================
   TOTAL INCOME
========================================================= */

function getTotalIncome() {

    return getTransactions()

        .filter(
            transaction =>
                transaction.type ===
                "income"
        )

        .reduce(
            (
                total,
                transaction
            ) =>
                total +
                (
                    Number(
                        transaction.amount
                    ) || 0
                ),
            0
        );

}



/* =========================================================
   TOTAL EXPENSE
========================================================= */

function getTotalExpense() {

    return getTransactions()

        .filter(
            transaction =>
                transaction.type ===
                "expense"
        )

        .reduce(
            (
                total,
                transaction
            ) =>
                total +
                (
                    Number(
                        transaction.amount
                    ) || 0
                ),
            0
        );

}



/* =========================================================
   TOTAL BALANCE
========================================================= */

function getTotalBalance() {

    const accounts =
        getAccounts();


    let openingBalance =
        0;


    accounts.forEach(
        account => {

            openingBalance +=
                Number(
                    account.openingBalance ||
                    0
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
                transaction.type ===
                "income" &&
                normalizeDate(
                    transaction.date
                ) === today
        )

        .reduce(
            (
                total,
                transaction
            ) =>
                total +
                (
                    Number(
                        transaction.amount
                    ) || 0
                ),
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
                transaction.type ===
                "expense" &&
                normalizeDate(
                    transaction.date
                ) === today
        )

        .reduce(
            (
                total,
                transaction
            ) =>
                total +
                (
                    Number(
                        transaction.amount
                    ) || 0
                ),
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
   MONTH INCOME
========================================================= */

function getMonthIncome(
    month = getCurrentMonth()
) {

    return getTransactions()

        .filter(
            transaction => {

                const date =
                    normalizeDate(
                        transaction.date
                    );


                return (

                    transaction.type ===
                    "income" &&

                    date.startsWith(
                        month
                    )

                );

            }
        )

        .reduce(
            (
                total,
                transaction
            ) =>
                total +
                (
                    Number(
                        transaction.amount
                    ) || 0
                ),
            0
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
            transaction => {

                const date =
                    normalizeDate(
                        transaction.date
                    );


                return (

                    transaction.type ===
                    "expense" &&

                    date.startsWith(
                        month
                    )

                );

            }
        )

        .reduce(
            (
                total,
                transaction
            ) =>
                total +
                (
                    Number(
                        transaction.amount
                    ) || 0
                ),
            0
        );

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
            budget.expenseBudget ||
            0
        ) -
        spent

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
            budget.expenseBudget ||
            0
        );


    if (
        planned <= 0
    ) {

        return 0;

    }


    const spent =
        getMonthExpense();


    return Math.min(
        100,
        (
            spent /
            planned
        ) *
        100
    );

}



/* =========================================================
   ACCOUNT BALANCE
========================================================= */

function getAccountBalance(
    accountId
) {

    const account =
        getAccounts().find(
            item =>
                item.id ===
                accountId
        );


    if (!account) {

        return 0;

    }


    let balance =
        Number(
            account.openingBalance ||
            0
        );


    getTransactions()
        .forEach(
            transaction => {

                if (
                    transaction.accountId !==
                    accountId
                ) {

                    return;

                }


                const amount =
                    Number(
                        transaction.amount ||
                        0
                    );


                if (
                    transaction.type ===
                    "income"
                ) {

                    balance +=
                        amount;

                }

                else if (
                    transaction.type ===
                    "expense"
                ) {

                    balance -=
                        amount;

                }

            }
        );


    return balance;

}



/* =========================================================
   ALL ACCOUNT BALANCES
========================================================= */

function getAllAccountBalances() {

    return getAccounts()
        .map(
            account => ({

                ...account,

                balance:
                    getAccountBalance(
                        account.id
                    )

            })
        );

}



/* =========================================================
   RECENT TRANSACTIONS
========================================================= */

function getRecentTransactions(
    limit = 5
) {

    return [...getTransactions()]

        .sort(
            (
                a,
                b
            ) => {

                const dateA =
                    normalizeDate(
                        a.date
                    );

                const dateB =
                    normalizeDate(
                        b.date
                    );


                if (
                    dateA !==
                    dateB
                ) {

                    return dateB
                        .localeCompare(
                            dateA
                        );

                }


                return (
                    new Date(
                        b.createdAt ||
                        0
                    ) -
                    new Date(
                        a.createdAt ||
                        0
                    )
                );

            }
        )

        .slice(
            0,
            limit
        );

}



/* =========================================================
   DASHBOARD UPDATE
========================================================= */

function updateDashboard() {

    updateMainBalance();

    updateTodaySummary();

    updateBudgetDashboard();

    updateAccountDashboard();

    updateRecentTransactions();

    updateReminder();

}



/* =========================================================
   MAIN BALANCE
========================================================= */

function updateMainBalance() {

    setElementText(
        "totalBalance",
        formatMoney(
            getTotalBalance()
        )
    );


    setElementText(
        "totalIncome",
        formatMoney(
            getTotalIncome()
        )
    );


    setElementText(
        "totalExpense",
        formatMoney(
            getTotalExpense()
        )
    );

}



/* =========================================================
   TODAY SUMMARY
========================================================= */

function updateTodaySummary() {

    setElementText(
        "todayIncome",
        formatMoney(
            getTodayIncome()
        )
    );


    setElementText(
        "todayExpense",
        formatMoney(
            getTodayExpense()
        )
    );


    setElementText(
        "todaySaving",
        formatMoney(
            getTodaySaving()
        )
    );

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
        Number(
            budget.expenseBudget ||
            0
        ) -
        spent;


    let percentage =
        0;


    if (
        budget.expenseBudget > 0
    ) {

        percentage =
            (
                spent /
                budget.expenseBudget
            ) *
            100;

    }


    percentage =
        Math.min(
            100,
            Math.max(
                0,
                percentage
            )
        );


    setElementText(
        "monthBudget",
        formatMoney(
            budget.expenseBudget
        )
    );


    setElementText(
        "budgetAmount",
        formatMoney(
            budget.expenseBudget
        )
    );


    setElementText(
        "budgetSpent",
        formatMoney(
            spent
        )
    );


    setElementText(
        "budgetRemaining",
        formatMoney(
            Math.max(
                0,
                remaining
            )
        )
    );


    const progress =
        document.getElementById(
            "budgetProgress"
        );


    if (progress) {

        progress.style.width =
            percentage +
            "%";

    }


    setElementText(
        "budgetPercentage",
        Math.round(
            percentage
        ) +
        "% वापरले"
    );

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


    if (
        accounts.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-card">

                <i class="fa-solid fa-building-columns"></i>

                <p>
                    खाते जोडलेले नाही.
                </p>

                <button onclick="goToAccounts()">
                    खाते जोडा
                </button>

            </div>

        `;

        return;

    }


    container.innerHTML =
        "";


    accounts
        .slice(
            0,
            4
        )
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

                        ${escapeHTML(
                            account.name
                        )}

                    </div>

                    <div class="account-balance">

                        ${formatMoney(
                            balance
                        )}

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
        getRecentTransactions(
            5
        );


    if (
        transactions.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-card">

                <i class="fa-solid fa-receipt"></i>

                <p>
                    अजून कोणतेही व्यवहार नाहीत.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        "";


    transactions.forEach(
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


            const icon =
                isIncome
                    ? "fa-arrow-down"
                    : "fa-arrow-up";


            const defaultCategory =
                isIncome
                    ? "जमा"
                    : "खर्च";


            const category =
                transaction.category ||
                defaultCategory;


            item.innerHTML = `

                <div class="transaction-icon"
                     style="
                        background:
                        ${
                            isIncome
                                ? "#e8f5ed"
                                : "#fdeaea"
                        };

                        color:
                        ${
                            isIncome
                                ? "#16803c"
                                : "#c62828"
                        };
                     ">

                    <i class="fa-solid
                        ${icon}">
                    </i>

                </div>


                <div class="transaction-details">

                    <strong>

                        ${escapeHTML(
                            category
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
                        ${
                            isIncome
                                ? "#16803c"
                                : "#c62828"
                        };
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


    /*
       आज खर्च नोंदवला नसेल
       तर notification dot दाखवा.
    */

    if (
        todayExpense <= 0
    ) {

        dot.style.display =
            "block";

    }

    else {

        dot.style.display =
            "none";

    }

}



function openReminder() {

    goToExpense();

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


            if (
                balanceHidden
            ) {

                if (
                    !element.dataset.original
                ) {

                    element.dataset.original =
                        element.textContent;

                }


                element.textContent =
                    "₹••••";

            }

            else {

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
   HTML SAFETY
========================================================= */

function escapeHTML(
    value
) {

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
   ELEMENT TEXT HELPER
========================================================= */

function setElementText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value;

    }

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


    if (!menu) {

        return;

    }


    menu.classList.add(
        "show"
    );

}



function closeAddMenu(
    event
) {

    const menu =
        document.getElementById(
            "addMenu"
        );


    if (!menu) {

        return;

    }


    /*
       खाली click असल्यास menu close.
    */

    if (!event) {

        menu.classList.remove(
            "show"
        );

        return;

    }


    if (
        event.target.id ===
        "addMenu"
    ) {

        menu.classList.remove(
            "show"
        );

    }

}



/* =========================================================
   TODAY DATE
========================================================= */

function updateTodayDate() {

    const element =
        document.getElementById(
            "todayDate"
        );


    if (!element) {

        return;

    }


    const today =
        new Date();


    element.textContent =
        today.toLocaleDateString(
            "mr-IN",
            {
                weekday:
                    "long",

                day:
                    "2-digit",

                month:
                    "long",

                year:
                    "numeric"

            }
        );

}



/* =========================================================
   LOGIN SESSION
========================================================= */

function isLoggedIn() {

    const session =
        getData(
            STORAGE_KEYS.loginSession,
            null
        );


    if (!session) {

        return false;

    }


    /*
       login.js मध्ये
       {loggedIn:true,...}
       किंवा
       {isLoggedIn:true,...}
       दोन्ही support.
    */

    return Boolean(

        session.loggedIn === true ||

        session.isLoggedIn === true

    );

}



function getLoginSession() {

    return getData(
        STORAGE_KEYS.loginSession,
        null
    );

}



function logoutUser() {

    removeData(
        STORAGE_KEYS.loginSession
    );


    window.location.href =
        "login.html";

}



/* =========================================================
   OPTIONAL LOGIN PROTECTION
========================================================= */

function requireLogin() {

    if (
        !isLoggedIn()
    ) {

        window.location.href =
            "login.html";

        return false;

    }


    return true;

}



/* =========================================================
   APPLICATION INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeAccounts();

        updateTodayDate();

        updateDashboard();

    }
);



/* =========================================================
   STORAGE SYNC
========================================================= */

window.addEventListener(
    "storage",
    function (event) {

        /*
           दुसऱ्या tab/page मधून
           data बदलल्यास dashboard refresh.
        */

        if (
            !event.key ||
            Object.values(
                STORAGE_KEYS
            ).includes(
                event.key
            )
        ) {

            updateDashboard();

        }

    }
);



/* =========================================================
   SAME PAGE TRANSACTION UPDATE
========================================================= */

window.addEventListener(
    "rdkhTransactionsUpdated",
    function () {

        updateDashboard();

    }
);



/* =========================================================
   SAME PAGE ACCOUNT UPDATE
========================================================= */

window.addEventListener(
    "rdkhAccountsUpdated",
    function () {

        updateDashboard();

    }
);



/* =========================================================
   SAME PAGE BUDGET UPDATE
========================================================= */

window.addEventListener(
    "rdkhBudgetUpdated",
    function () {

        updateDashboard();

    }
);



/* =========================================================
   GLOBAL ERROR LOG
========================================================= */

window.addEventListener(
    "error",
    function (event) {

        console.error(
            "Application Error:",
            event.error ||
            event.message
        );

    }
);



/* =========================================================
   CONSOLE INFORMATION
========================================================= */

console.log(
    "रोजचा जमा खर्च अहवाल - app.js loaded successfully."
);
/* =========================================================
   PWA SERVICE WORKER
========================================================= */

if (
    "serviceWorker" in navigator
) {

    window.addEventListener(
        "load",
        function () {

            navigator.serviceWorker
                .register(
                    "service-worker.js"
                )
                .then(
                    registration => {

                        console.log(
                            "PWA Service Worker Registered",
                            registration
                        );

                    }
                )
                .catch(
                    error => {

                        console.error(
                            "Service Worker Error:",
                            error
                        );

                    }
                );

        }
    );

}
