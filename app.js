/* =========================================================
   app.js
   रोजचा जमा खर्च अहवाल
   CENTRAL APPLICATION CONTROLLER

   VERSION:
   Central Transaction System + Account System

   FEATURES
   ---------------------------------------------------------
   ✅ Login Session Check
   ✅ Central Transactions
   ✅ Old Transaction Data Migration
   ✅ Income / Expense Totals
   ✅ Today / Monthly Totals
   ✅ Account Balance
   ✅ Monthly Budget Compatibility
   ✅ Dashboard Updates
   ✅ Balance Visibility
   ✅ Navigation
   ✅ Add Menu
   ✅ HTML Safety
   ✅ Storage Events
   ========================================================= */


/* =========================================================
   1. LOGIN / PAGE ACCESS
========================================================= */

(function checkLoginAccess() {

    const currentPage =
        window.location.pathname.split("/").pop().toLowerCase();

    const publicPages = [
        "",
        "login.html"
    ];

    if (publicPages.includes(currentPage)) {
        return;
    }

    let session = null;

    try {
        session = JSON.parse(
            localStorage.getItem("rdkh_login_session")
        );
    } catch (error) {
        session = null;
    }

    const isLoggedIn =
        session &&
        (
            session.loggedIn === true ||
            session.isLoggedIn === true
        );

    if (!isLoggedIn) {
        window.location.href = "login.html";
    }

})();


/* =========================================================
   2. STORAGE KEYS
========================================================= */

const STORAGE_KEYS = {

    // New central transaction storage
    transactions: "rdkh_transactions_v2",

    // Old transaction storage - compatibility
    oldTransactions: "rdkh_transactions",

    accounts: "rdkh_accounts",

    budgets: "monthly_budgets",

    oldBudgets: "rdkh_monthly_budgets",

    budgetCategories: "rdkh_budget_categories",

    settings: "rdkh_settings",

    loginSession: "rdkh_login_session"
};


/* =========================================================
   3. OLD TRANSACTION STORAGE KEYS
========================================================= */

const LEGACY_TRANSACTION_KEYS = [

    "rdkh_transactions",
    "rdkh_transaction",
    "transactions",
    "income_expense_transactions",
    "expense_transactions",
    "income_transactions",
    "expenses"
];


/* =========================================================
   4. DEFAULT ACCOUNTS
========================================================= */

const DEFAULT_ACCOUNTS = [

    {
        id: "ACC-CASH",
        name: "Cash",
        type: "cash",
        openingBalance: 0,
        createdAt: new Date().toISOString()
    },

    {
        id: "ACC-BANK",
        name: "Bank",
        type: "bank",
        openingBalance: 0,
        createdAt: new Date().toISOString()
    },

    {
        id: "ACC-UPI",
        name: "UPI",
        type: "upi",
        openingBalance: 0,
        createdAt: new Date().toISOString()
    }

];


/* =========================================================
   5. BASIC STORAGE FUNCTIONS
========================================================= */

function getData(key, defaultValue = null) {

    try {

        const data = localStorage.getItem(key);

        if (data === null) {
            return defaultValue;
        }

        return JSON.parse(data);

    } catch (error) {

        console.error(
            "Storage read error:",
            key,
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

    } catch (error) {

        console.error(
            "Storage save error:",
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

    } catch (error) {

        console.error(
            "Storage remove error:",
            key,
            error
        );

        return false;
    }
}


/* =========================================================
   6. DATE FUNCTIONS
========================================================= */

function getTodayString() {

    const date = new Date();

    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function getCurrentMonth() {

    const date = new Date();

    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    return `${year}-${month}`;
}


function normalizeDate(dateValue) {

    if (!dateValue) {
        return "";
    }

    if (dateValue instanceof Date) {

        const year = dateValue.getFullYear();

        const month = String(
            dateValue.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            dateValue.getDate()
        ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    const value = String(dateValue).trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value;
    }

    const parsed = new Date(value);

    if (isNaN(parsed.getTime())) {
        return "";
    }

    const year = parsed.getFullYear();

    const month = String(
        parsed.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        parsed.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function formatDisplayDate(dateValue) {

    const date = normalizeDate(dateValue);

    if (!date) {
        return "-";
    }

    const parts = date.split("-");

    if (parts.length !== 3) {
        return date;
    }

    return `${parts[2]}-${parts[1]}-${parts[0]}`;
}


/* =========================================================
   7. MONEY FUNCTIONS
========================================================= */

function formatMoney(amount) {

    const value = Number(amount) || 0;

    return "₹" + value.toLocaleString(
        "en-IN",
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }
    );
}


/* =========================================================
   8. NORMALIZE TRANSACTION TYPE
========================================================= */

function normalizeTransactionType(type) {

    const value = String(
        type || ""
    )
    .trim()
    .toLowerCase();

    if (
        value === "income" ||
        value === "credit" ||
        value === "jamaa" ||
        value === "जमा" ||
        value === "उत्पन्न"
    ) {
        return "income";
    }

    if (
        value === "expense" ||
        value === "debit" ||
        value === "kharch" ||
        value === "खर्च"
    ) {
        return "expense";
    }

    return value;
}


/* =========================================================
   9. NORMALIZE TRANSACTION
========================================================= */

function normalizeTransaction(transaction, forcedType = "") {

    if (!transaction || typeof transaction !== "object") {
        return null;
    }

    let type = normalizeTransactionType(
        forcedType ||
        transaction.type ||
        transaction.transactionType
    );


    /* -----------------------------------------
       Determine type from old structures
    ----------------------------------------- */

    if (!type) {

        if (
            transaction.incomeAmount !== undefined ||
            transaction.income !== undefined
        ) {
            type = "income";
        }

        else if (
            transaction.expenseAmount !== undefined ||
            transaction.expense !== undefined
        ) {
            type = "expense";
        }
    }


    if (
        type !== "income" &&
        type !== "expense"
    ) {
        return null;
    }


    /* -----------------------------------------
       Amount
    ----------------------------------------- */

    let amount = 0;

    if (
        transaction.amount !== undefined &&
        transaction.amount !== null &&
        transaction.amount !== ""
    ) {
        amount = Number(
            String(transaction.amount)
                .replace(/,/g, "")
                .replace(/[₹\s]/g, "")
        );
    }

    else if (
        type === "income" &&
        transaction.incomeAmount !== undefined
    ) {
        amount = Number(
            String(transaction.incomeAmount)
                .replace(/,/g, "")
                .replace(/[₹\s]/g, "")
        );
    }

    else if (
        type === "expense" &&
        transaction.expenseAmount !== undefined
    ) {
        amount = Number(
            String(transaction.expenseAmount)
                .replace(/,/g, "")
                .replace(/[₹\s]/g, "")
        );
    }

    if (!Number.isFinite(amount)) {
        amount = 0;
    }


    /* -----------------------------------------
       Date
    ----------------------------------------- */

    const date = normalizeDate(
        transaction.date ||
        transaction.transactionDate ||
        transaction.expenseDate ||
        transaction.incomeDate ||
        transaction.paymentDate ||
        transaction.createdDate ||
        getTodayString()
    );


    /* -----------------------------------------
       Category
    ----------------------------------------- */

    const categoryId =
        transaction.categoryId ||
        transaction.category ||
        transaction.expenseCategory ||
        transaction.incomeCategory ||
        "other";


    const categoryName =
        transaction.categoryName ||
        transaction.categoryLabel ||
        transaction.categoryText ||
        transaction.expenseCategoryName ||
        transaction.incomeCategoryName ||
        categoryId;


    /* -----------------------------------------
       Account
    ----------------------------------------- */

    const accountId =
        transaction.accountId ||
        transaction.accountID ||
        transaction.account ||
        transaction.accountName ||
        "";


    /* -----------------------------------------
       Payment Mode
    ----------------------------------------- */

    const paymentMode =
        transaction.paymentMode ||
        transaction.payment_type ||
        transaction.mode ||
        "";


    /* -----------------------------------------
       Description
    ----------------------------------------- */

    const description =
        transaction.description ||
        transaction.title ||
        transaction.name ||
        "";


    /* -----------------------------------------
       Note
    ----------------------------------------- */

    const note =
        transaction.note ||
        transaction.notes ||
        "";


    /* -----------------------------------------
       ID
    ----------------------------------------- */

    const id =
        transaction.id ||
        transaction.transactionId ||
        transaction.txnId ||
        (
            "TXN-" +
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .substring(2, 8)
        );


    return {

        id: String(id),

        type: type,

        date: date,

        category: String(categoryId),

        categoryId: String(categoryId),

        categoryName: String(categoryName),

        description: String(description),

        amount: amount,

        accountId: String(accountId),

        paymentMode: String(paymentMode),

        note: String(note),

        createdAt:
            transaction.createdAt ||
            transaction.createdDate ||
            new Date().toISOString()

    };
}


/* =========================================================
   10. READ LEGACY TRANSACTIONS
========================================================= */

function readLegacyTransactions() {

    const result = [];

    LEGACY_TRANSACTION_KEYS.forEach(key => {

        const data = getData(key, null);

        if (!data) {
            return;
        }


        /* -----------------------------------------
           Array format
        ----------------------------------------- */

        if (Array.isArray(data)) {

            data.forEach(item => {

                const normalized =
                    normalizeTransaction(item);

                if (normalized) {
                    result.push(normalized);
                }

            });

            return;
        }


        /* -----------------------------------------
           Object format
        ----------------------------------------- */

        if (
            typeof data === "object" &&
            !Array.isArray(data)
        ) {

            Object.keys(data).forEach(keyName => {

                const item = data[keyName];

                if (Array.isArray(item)) {

                    item.forEach(row => {

                        const normalized =
                            normalizeTransaction(
                                row,
                                keyName
                            );

                        if (normalized) {
                            result.push(normalized);
                        }

                    });

                }

                else if (
                    item &&
                    typeof item === "object"
                ) {

                    const normalized =
                        normalizeTransaction(
                            item,
                            keyName
                        );

                    if (normalized) {
                        result.push(normalized);
                    }
                }

            });
        }

    });

    return result;
}


/* =========================================================
   11. REMOVE DUPLICATE TRANSACTIONS
========================================================= */

function removeDuplicateTransactions(transactions) {

    const map = new Map();

    transactions.forEach(transaction => {

        if (!transaction) {
            return;
        }

        const key =
            transaction.id ||
            [
                transaction.type,
                transaction.date,
                transaction.amount,
                transaction.description,
                transaction.accountId
            ].join("|");


        if (!map.has(key)) {
            map.set(key, transaction);
        }

    });

    return Array.from(map.values());
}


/* =========================================================
   12. CENTRAL GET TRANSACTIONS
========================================================= */

function getTransactions() {

    let central =
        getData(
            STORAGE_KEYS.transactions,
            null
        );


    /* -----------------------------------------
       New v2 storage exists
    ----------------------------------------- */

    if (Array.isArray(central)) {

        const normalized =
            central
                .map(item =>
                    normalizeTransaction(item)
                )
                .filter(Boolean);

        return removeDuplicateTransactions(
            normalized
        );
    }


    /* -----------------------------------------
       v2 not found
       Read old data and migrate
    ----------------------------------------- */

    const legacy =
        readLegacyTransactions();

    const cleaned =
        removeDuplicateTransactions(
            legacy
        );


    if (cleaned.length > 0) {

        saveData(
            STORAGE_KEYS.transactions,
            cleaned
        );

        console.log(
            "Old transaction data migrated:",
            cleaned.length
        );
    }


    return cleaned;
}


/* =========================================================
   13. CENTRAL SAVE TRANSACTIONS
========================================================= */

function saveTransactions(transactions) {

    if (!Array.isArray(transactions)) {
        transactions = [];
    }

    const normalized =
        transactions
            .map(item =>
                normalizeTransaction(item)
            )
            .filter(Boolean);


    const cleaned =
        removeDuplicateTransactions(
            normalized
        );


    const saved =
        saveData(
            STORAGE_KEYS.transactions,
            cleaned
        );


    if (saved) {

        window.dispatchEvent(
            new CustomEvent(
                "rdkhTransactionsUpdated"
            )
        );

        window.dispatchEvent(
            new Event(
                "storage"
            )
        );
    }


    return saved;
}


/* =========================================================
   14. ADD TRANSACTION
========================================================= */

function addTransaction(transaction) {

    const normalized =
        normalizeTransaction(transaction);

    if (!normalized) {
        return false;
    }


    const transactions =
        getTransactions();


    transactions.push(
        normalized
    );


    return saveTransactions(
        transactions
    );
}


/* =========================================================
   15. UPDATE TRANSACTION
========================================================= */

function updateTransaction(id, updatedData) {

    const transactions =
        getTransactions();


    const index =
        transactions.findIndex(
            transaction =>
                String(transaction.id) ===
                String(id)
        );


    if (index === -1) {
        return false;
    }


    const merged = {

        ...transactions[index],

        ...updatedData,

        id: transactions[index].id

    };


    const normalized =
        normalizeTransaction(
            merged
        );


    if (!normalized) {
        return false;
    }


    transactions[index] =
        normalized;


    return saveTransactions(
        transactions
    );
}


/* =========================================================
   16. DELETE TRANSACTION
========================================================= */

function deleteTransaction(id) {

    const transactions =
        getTransactions();


    const filtered =
        transactions.filter(
            transaction =>
                String(transaction.id) !==
                String(id)
        );


    if (
        filtered.length ===
        transactions.length
    ) {
        return false;
    }


    return saveTransactions(
        filtered
    );
}


/* =========================================================
   17. INCOME TOTALS
========================================================= */

function getTotalIncome() {

    return getTransactions()
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


function getMonthIncome(month = getCurrentMonth()) {

    return getTransactions()
        .filter(
            transaction =>
                transaction.type === "income" &&
                String(transaction.date || "")
                    .startsWith(month)
        )
        .reduce(
            (total, transaction) =>
                total +
                Number(transaction.amount || 0),
            0
        );
}


/* =========================================================
   18. EXPENSE TOTALS
========================================================= */

function getTotalExpense() {

    return getTransactions()
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


function getMonthExpense(month = getCurrentMonth()) {

    return getTransactions()
        .filter(
            transaction =>
                transaction.type === "expense" &&
                String(transaction.date || "")
                    .startsWith(month)
        )
        .reduce(
            (total, transaction) =>
                total +
                Number(transaction.amount || 0),
            0
        );
}


/* =========================================================
   19. BALANCE
========================================================= */

function getTotalBalance() {

    return (
        getTotalIncome() -
        getTotalExpense()
    );
}


function getTodaySaving() {

    return (
        getTodayIncome() -
        getTodayExpense()
    );
}


/* =========================================================
   20. CATEGORY EXPENSE TOTAL
========================================================= */

function getCategoryExpenseTotal(
    categoryId,
    month = ""
) {

    return getTransactions()

        .filter(transaction => {

            if (
                transaction.type !==
                "expense"
            ) {
                return false;
            }


            const transactionCategory =
                transaction.categoryId ||
                transaction.category;


            if (
                String(transactionCategory) !==
                String(categoryId)
            ) {
                return false;
            }


            if (month) {

                return String(
                    transaction.date || ""
                ).startsWith(month);
            }


            return true;

        })

        .reduce(
            (total, transaction) =>
                total +
                Number(transaction.amount || 0),
            0
        );
}


/* =========================================================
   21. ACCOUNTS
========================================================= */

function getAccounts() {

    let accounts =
        getData(
            STORAGE_KEYS.accounts,
            null
        );


    if (!Array.isArray(accounts)) {

        accounts =
            DEFAULT_ACCOUNTS.map(account => ({
                ...account
            }));


        saveData(
            STORAGE_KEYS.accounts,
            accounts
        );
    }


    return accounts;
}


function saveAccounts(accounts) {

    if (!Array.isArray(accounts)) {
        return false;
    }


    const saved =
        saveData(
            STORAGE_KEYS.accounts,
            accounts
        );


    if (saved) {

        window.dispatchEvent(
            new CustomEvent(
                "rdkhAccountsUpdated"
            )
        );
    }


    return saved;
}


function initializeAccounts() {

    const existing =
        getData(
            STORAGE_KEYS.accounts,
            null
        );


    if (
        !Array.isArray(existing) ||
        existing.length === 0
    ) {

        saveAccounts(
            DEFAULT_ACCOUNTS.map(
                account => ({
                    ...account
                })
            )
        );
    }
}


/* =========================================================
   22. ACCOUNT BALANCE
========================================================= */

function getAccountBalance(accountId) {

    const accounts =
        getAccounts();


    const account =
        accounts.find(
            item =>
                String(item.id) ===
                String(accountId)
        );


    if (!account) {
        return 0;
    }


    const openingBalance =
        Number(
            account.openingBalance
        ) || 0;


    const transactions =
        getTransactions();


    let balance =
        openingBalance;


    transactions.forEach(
        transaction => {

            if (
                String(transaction.accountId) !==
                String(accountId)
            ) {
                return;
            }


            const amount =
                Number(
                    transaction.amount
                ) || 0;


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


function getAllAccountBalances() {

    return getAccounts().map(
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
   23. RECENT TRANSACTIONS
========================================================= */

function getRecentTransactions(
    limit = 5
) {

    return getTransactions()

        .sort(
            (a, b) => {

                const dateA =
                    new Date(
                        a.createdAt ||
                        a.date
                    ).getTime();

                const dateB =
                    new Date(
                        b.createdAt ||
                        b.date
                    ).getTime();

                return dateB - dateA;
            }
        )

        .slice(
            0,
            limit
        );
}


/* =========================================================
   24. BUDGET FUNCTIONS
========================================================= */

function getBudgets() {

    let data =
        getData(
            STORAGE_KEYS.budgets,
            null
        );


    if (!data) {

        data =
            getData(
                STORAGE_KEYS.oldBudgets,
                null
            );
    }


    if (!data) {
        return [];
    }


    /* -----------------------------------------
       Array format
    ----------------------------------------- */

    if (Array.isArray(data)) {

        return data;
    }


    /* -----------------------------------------
       Object format
       { "2026-09": {...} }
    ----------------------------------------- */

    if (
        typeof data === "object"
    ) {

        return Object.keys(data)
            .map(month => {

                const budget =
                    data[month];


                if (
                    typeof budget ===
                    "object"
                ) {

                    return {

                        ...budget,

                        month:
                            budget.month ||
                            month

                    };
                }


                return {

                    month: month,

                    plannedMoney:
                        Number(budget) || 0

                };

            });
    }


    return [];
}


function getCurrentMonthBudget() {

    const currentMonth =
        getCurrentMonth();


    const budgets =
        getBudgets();


    return (
        budgets.find(
            budget =>
                String(
                    budget.month
                ) ===
                currentMonth
        ) ||
        null
    );
}


function normalizeBudget(
    budget,
    month = getCurrentMonth()
) {

    budget =
        budget || {};


    return {

        month:
            budget.month ||
            month,

        plannedMoney:
            Number(
                budget.plannedMoney ||
                budget.incomePlan ||
                0
            ),

        incomePlan:
            Number(
                budget.incomePlan ||
                budget.plannedMoney ||
                0
            ),

        expenseBudget:
            Number(
                budget.expenseBudget ||
                0
            ),

        savingTarget:
            Number(
                budget.savingTarget ||
                0
            ),

        alertPercent:
            Number(
                budget.alertPercent ||
                80
            ),

        categories:
            budget.categories &&
            typeof budget.categories === "object"
                ? budget.categories
                : {},

        createdAt:
            budget.createdAt ||
            new Date().toISOString(),

        updatedAt:
            budget.updatedAt ||
            new Date().toISOString()

    };
}


function getBudgetRemaining(
    month = getCurrentMonth()
) {

    const budget =
        getCurrentMonthBudget();


    if (!budget) {
        return 0;
    }


    const expenseBudget =
        Number(
            budget.expenseBudget
        ) || 0;


    const actualExpense =
        getMonthExpense(
            month
        );


    return (
        expenseBudget -
        actualExpense
    );
}


function getBudgetPercentage(
    month = getCurrentMonth()
) {

    const budget =
        getCurrentMonthBudget();


    if (!budget) {
        return 0;
    }


    const expenseBudget =
        Number(
            budget.expenseBudget
        ) || 0;


    if (expenseBudget <= 0) {
        return 0;
    }


    const actualExpense =
        getMonthExpense(
            month
        );


    return Math.min(
        100,
        Math.round(
            (
                actualExpense /
                expenseBudget
            ) * 100
        )
    );
}


/* =========================================================
   25. HTML SAFETY
========================================================= */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }


    return String(value)
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


function setElementText(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {
        element.textContent =
            value;
    }
}


/* =========================================================
   26. DASHBOARD UPDATE
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
   27. MAIN BALANCE
========================================================= */

function updateMainBalance() {

    const balance =
        getTotalBalance();


    const elements = [

        document.getElementById(
            "mainBalance"
        ),

        document.getElementById(
            "totalBalance"
        ),

        document.getElementById(
            "dashboardBalance"
        )

    ];


    elements.forEach(
        element => {

            if (element) {

                element.textContent =
                    formatMoney(
                        balance
                    );
            }

        }
    );
}


/* =========================================================
   28. TODAY SUMMARY
========================================================= */

function updateTodaySummary() {

    const income =
        getTodayIncome();

    const expense =
        getTodayExpense();

    const saving =
        income - expense;


    setElementText(
        "todayIncome",
        formatMoney(income)
    );


    setElementText(
        "todayExpense",
        formatMoney(expense)
    );


    setElementText(
        "todaySaving",
        formatMoney(saving)
    );


    setElementText(
        "dashboardTodayIncome",
        formatMoney(income)
    );


    setElementText(
        "dashboardTodayExpense",
        formatMoney(expense)
    );


    setElementText(
        "dashboardTodaySaving",
        formatMoney(saving)
    );
}


/* =========================================================
   29. BUDGET DASHBOARD
========================================================= */

function updateBudgetDashboard() {

    const budget =
        getCurrentMonthBudget();


    if (!budget) {

        setElementText(
            "budgetAmount",
            formatMoney(0)
        );

        setElementText(
            "budgetUsed",
            formatMoney(0)
        );

        setElementText(
            "budgetRemaining",
            formatMoney(0)
        );

        return;
    }


    const expenseBudget =
        Number(
            budget.expenseBudget
        ) || 0;


    const actualExpense =
        getMonthExpense();


    const remaining =
        expenseBudget -
        actualExpense;


    const percentage =
        expenseBudget > 0
            ? Math.round(
                (
                    actualExpense /
                    expenseBudget
                ) * 100
            )
            : 0;


    setElementText(
        "budgetAmount",
        formatMoney(
            expenseBudget
        )
    );


    setElementText(
        "budgetUsed",
        formatMoney(
            actualExpense
        )
    );


    setElementText(
        "budgetRemaining",
        formatMoney(
            remaining
        )
    );


    setElementText(
        "budgetUsedPercent",
        percentage + "%"
    );


    const progress =
        document.getElementById(
            "budgetProgress"
        );


    if (progress) {

        progress.style.width =
            Math.min(
                100,
                percentage
            ) + "%";
    }
}


/* =========================================================
   30. ACCOUNT DASHBOARD
========================================================= */

function updateAccountDashboard() {

    const accounts =
        getAllAccountBalances();


    const container =
        document.getElementById(
            "accountDashboard"
        );


    if (
        !container ||
        !accounts.length
    ) {
        return;
    }


    container.innerHTML =
        accounts.map(
            account => `

                <div class="account-dashboard-item">

                    <div>
                        <strong>
                            ${escapeHTML(
                                account.name
                            )}
                        </strong>
                    </div>

                    <div>
                        ${formatMoney(
                            account.balance
                        )}
                    </div>

                </div>

            `
        ).join("");
}


/* =========================================================
   31. RECENT TRANSACTIONS
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
        getRecentTransactions(5);


    if (!transactions.length) {

        container.innerHTML =
            `
                <div class="empty-state">
                    अजून कोणतेही व्यवहार नाहीत.
                </div>
            `;

        return;
    }


    container.innerHTML =
        transactions.map(
            transaction => {

                const isIncome =
                    transaction.type ===
                    "income";


                const sign =
                    isIncome
                        ? "+"
                        : "-";


                return `

                    <div class="recent-transaction-item">

                        <div>

                            <strong>
                                ${escapeHTML(
                                    transaction.categoryName ||
                                    transaction.category ||
                                    "व्यवहार"
                                )}
                            </strong>

                            <small>
                                ${formatDisplayDate(
                                    transaction.date
                                )}
                            </small>

                        </div>

                        <div class="${
                            isIncome
                                ? "income"
                                : "expense"
                        }">

                            ${sign}
                            ${formatMoney(
                                transaction.amount
                            )}

                        </div>

                    </div>

                `;

            }
        ).join("");
}


/* =========================================================
   32. REMINDER
========================================================= */

function updateReminder() {

    const element =
        document.getElementById(
            "dashboardReminder"
        );


    if (!element) {
        return;
    }


    const budget =
        getCurrentMonthBudget();


    if (!budget) {

        element.textContent =
            "या महिन्यासाठी budget सेट केलेले नाही.";

        return;
    }


    const remaining =
        getBudgetRemaining();


    const percentage =
        getBudgetPercentage();


    if (remaining < 0) {

        element.textContent =
            "⚠️ या महिन्याचा budget limit पार झाला आहे.";

    }

    else if (
        percentage >=
        Number(
            budget.alertPercent ||
            80
        )
    ) {

        element.textContent =
            "⚠️ Budget चा मोठा भाग वापरला आहे.";

    }

    else {

        element.textContent =
            "✅ Budget नियंत्रणात आहे.";
    }
}


/* =========================================================
   33. BALANCE VISIBILITY
========================================================= */

function initializeBalanceVisibility() {

    const toggle =
        document.getElementById(
            "toggleBalance"
        );


    if (!toggle) {
        return;
    }


    const hidden =
        localStorage.getItem(
            "rdkh_balance_hidden"
        ) === "true";


    applyBalanceVisibility(
        hidden
    );


    toggle.addEventListener(
        "click",
        function () {

            const current =
                localStorage.getItem(
                    "rdkh_balance_hidden"
                ) === "true";


            const next =
                !current;


            localStorage.setItem(
                "rdkh_balance_hidden",
                String(next)
            );


            applyBalanceVisibility(
                next
            );

        }
    );
}


function applyBalanceVisibility(
    hidden
) {

    const balanceElements =
        document.querySelectorAll(
            "[data-balance]"
        );


    balanceElements.forEach(
        element => {

            if (hidden) {

                element.dataset.originalValue =
                    element.textContent;

                element.textContent =
                    "••••••";

            }

            else {

                if (
                    element.dataset.originalValue
                ) {

                    element.textContent =
                        element.dataset.originalValue;
                }
            }

        }
    );


    const toggle =
        document.getElementById(
            "toggleBalance"
        );


    if (toggle) {

        toggle.innerHTML =
            hidden
                ? '<i class="fa-solid fa-eye"></i>'
                : '<i class="fa-solid fa-eye-slash"></i>';
    }
}


/* =========================================================
   34. NAVIGATION
========================================================= */

function goHome() {

    window.location.href =
        "index.html";
}


function goToTransactions() {

    window.location.href =
        "transactions.html";
}


function goToIncome() {

    window.location.href =
        "income.html";
}


function goToExpense() {

    window.location.href =
        "expense.html";
}


function goToReports() {

    window.location.href =
        "reports.html";
}


function goToBudget() {

    window.location.href =
        "monthly-budget.html";
}


function goToAccounts() {

    window.location.href =
        "accounts.html";
}


function goToSettings() {

    window.location.href =
        "settings.html";
}


/* =========================================================
   35. ADD MENU
========================================================= */

function toggleAddMenu() {

    const menu =
        document.getElementById(
            "addMenu"
        );


    if (!menu) {
        return;
    }


    menu.classList.toggle(
        "show"
    );
}


function closeAddMenu() {

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


document.addEventListener(
    "click",
    function(event) {

        const menu =
            document.getElementById(
                "addMenu"
            );


        const button =
            document.getElementById(
                "addMenuButton"
            );


        if (
            menu &&
            !menu.contains(event.target) &&
            (!button ||
                !button.contains(event.target))
        ) {

            menu.classList.remove(
                "show"
            );
        }

    }
);


/* =========================================================
   36. LOGIN FUNCTIONS
========================================================= */

function getLoginSession() {

    return getData(
        STORAGE_KEYS.loginSession,
        null
    );
}


function isUserLoggedIn() {

    const session =
        getLoginSession();


    return !!(
        session &&
        (
            session.loggedIn === true ||
            session.isLoggedIn === true
        )
    );
}


function logout() {

    removeData(
        STORAGE_KEYS.loginSession
    );


    window.location.href =
        "login.html";
}


/* =========================================================
   37. INITIALIZE ACCOUNTS
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        initializeAccounts();

        initializeBalanceVisibility();


        /* -----------------------------------------
           Set date fields to today
        ----------------------------------------- */

        const today =
            getTodayString();


        const dateFields =
            document.querySelectorAll(
                'input[type="date"]'
            );


        dateFields.forEach(
            field => {

                if (!field.value) {

                    field.value =
                        today;
                }

            }
        );


        /* -----------------------------------------
           Dashboard
        ----------------------------------------- */

        updateDashboard();

    }
);


/* =========================================================
   38. STORAGE EVENT
========================================================= */

window.addEventListener(
    "storage",
    function(event) {

        if (
            !event.key ||
            event.key ===
                STORAGE_KEYS.transactions ||
            event.key ===
                STORAGE_KEYS.oldTransactions ||
            event.key ===
                STORAGE_KEYS.accounts ||
            event.key ===
                STORAGE_KEYS.budgets ||
            event.key ===
                STORAGE_KEYS.oldBudgets
        ) {

            updateDashboard();

        }

    }
);


/* =========================================================
   39. CUSTOM TRANSACTION EVENT
========================================================= */

window.addEventListener(
    "rdkhTransactionsUpdated",
    function() {

        updateDashboard();

    }
);


/* =========================================================
   40. CUSTOM ACCOUNT EVENT
========================================================= */

window.addEventListener(
    "rdkhAccountsUpdated",
    function() {

        updateDashboard();

    }
);


/* =========================================================
   41. CUSTOM BUDGET EVENT
========================================================= */

window.addEventListener(
    "rdkhBudgetUpdated",
    function() {

        updateDashboard();

    }
);


/* =========================================================
   42. SERVICE WORKER
========================================================= */

if (
    "serviceWorker" in navigator
) {

    window.addEventListener(
        "load",
        function() {

            navigator.serviceWorker
                .register(
                    "service-worker.js"
                )
                .then(
                    registration => {

                        console.log(
                            "Service Worker registered:",
                            registration.scope
                        );

                    }
                )
                .catch(
                    error => {

                        console.error(
                            "Service Worker registration failed:",
                            error
                        );

                    }
                );

        }
    );
}


/* =========================================================
   43. GLOBAL API
   Other JS files can use these functions
========================================================= */

window.STORAGE_KEYS =
    STORAGE_KEYS;

window.getData =
    getData;

window.saveData =
    saveData;

window.removeData =
    removeData;

window.getTransactions =
    getTransactions;

window.saveTransactions =
    saveTransactions;

window.addTransaction =
    addTransaction;

window.updateTransaction =
    updateTransaction;

window.deleteTransaction =
    deleteTransaction;

window.getTotalIncome =
    getTotalIncome;

window.getTodayIncome =
    getTodayIncome;

window.getMonthIncome =
    getMonthIncome;

window.getTotalExpense =
    getTotalExpense;

window.getTodayExpense =
    getTodayExpense;

window.getMonthExpense =
    getMonthExpense;

window.getTotalBalance =
    getTotalBalance;

window.getTodaySaving =
    getTodaySaving;

window.getCategoryExpenseTotal =
    getCategoryExpenseTotal;

window.getAccounts =
    getAccounts;

window.saveAccounts =
    saveAccounts;

window.initializeAccounts =
    initializeAccounts;

window.getAccountBalance =
    getAccountBalance;

window.getAllAccountBalances =
    getAllAccountBalances;

window.getRecentTransactions =
    getRecentTransactions;

window.getBudgets =
    getBudgets;

window.getCurrentMonthBudget =
    getCurrentMonthBudget;

window.normalizeBudget =
    normalizeBudget;

window.getBudgetRemaining =
    getBudgetRemaining;

window.getBudgetPercentage =
    getBudgetPercentage;

window.getTodayString =
    getTodayString;

window.getCurrentMonth =
    getCurrentMonth;

window.normalizeDate =
    normalizeDate;

window.formatDisplayDate =
    formatDisplayDate;

window.formatMoney =
    formatMoney;

window.escapeHTML =
    escapeHTML;

window.setElementText =
    setElementText;

window.goHome =
    goHome;

window.goToTransactions =
    goToTransactions;

window.goToIncome =
    goToIncome;

window.goToExpense =
    goToExpense;

window.goToReports =
    goToReports;

window.goToBudget =
    goToBudget;

window.goToAccounts =
    goToAccounts;

window.goToSettings =
    goToSettings;

window.toggleAddMenu =
    toggleAddMenu;

window.closeAddMenu =
    closeAddMenu;

window.getLoginSession =
    getLoginSession;

window.isUserLoggedIn =
    isUserLoggedIn;

window.logout =
    logout;

window.updateDashboard =
    updateDashboard;


/* =========================================================
   END OF app.js
========================================================= */
