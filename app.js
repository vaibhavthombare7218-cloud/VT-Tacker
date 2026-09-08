/* =========================================================
   app.js
   रोजचा जमा खर्च अहवाल

   CENTRAL APPLICATION SYSTEM

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

   CENTRAL STORAGE:
   - rdkh_transactions_v2
   - rdkh_accounts
   - monthly_budgets
   - rdkh_settings
   - rdkh_login_session

   IMPORTANT:
   Budget is NOT a transaction.
   Budget save does NOT change account balance.

   Account Balance:
   Opening Balance
   + Income
   - Expense
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


    /*
       Login page ला protection लागू नाही
    */

    if (
        currentPage === "" ||
        currentPage === "login.html"
    ) {

        return;

    }


    let session = null;

    try {

        session =
            JSON.parse(
                localStorage.getItem(
                    "rdkh_login_session"
                )
            );

    }

    catch (error) {

        session = null;

    }


    const loggedIn =
        session &&
        (
            session.loggedIn === true ||
            session.isLoggedIn === true
        );


    if (!loggedIn) {

        window.location.replace(
            "login.html"
        );

    }

})();



/* =========================================================
   CENTRAL STORAGE KEYS
========================================================= */

const STORAGE_KEYS = {

    /*
       NEW CENTRAL TRANSACTION STORAGE
    */
    transactions:
        "rdkh_transactions_v2",

    /*
       Accounts
    */
    accounts:
        "rdkh_accounts",

    /*
       NEW MONTHLY BUDGET STORAGE
    */
    budgets:
        "monthly_budgets",

    /*
       Legacy budget categories compatibility
    */
    budgetCategories:
        "rdkh_budget_categories",

    /*
       Settings
    */
    settings:
        "rdkh_settings",

    /*
       Login
    */
    loginSession:
        "rdkh_login_session"

};



/* =========================================================
   LEGACY STORAGE KEYS
========================================================= */

const LEGACY_STORAGE_KEYS = {

    transactions: [

        "rdkh_transactions",

        "rdkh_transaction",

        "transactions",

        "income_expense_transactions",

        "expense_transactions",

        "income_transactions"

    ],

    budgets: [

        "rdkh_monthly_budgets"

    ]

};



/* =========================================================
   DEFAULT ACCOUNTS
========================================================= */

const DEFAULT_ACCOUNTS = [

    {
        id: "ACC-CASH",
        name: "Cash",
        type: "Cash",
        openingBalance: 0,
        note: "Cash in hand",
        createdAt: null
    },

    {
        id: "ACC-BANK",
        name: "Bank Account",
        type: "Bank",
        openingBalance: 0,
        note: "Main bank account",
        createdAt: null
    },

    {
        id: "ACC-UPI",
        name: "UPI",
        type: "UPI",
        openingBalance: 0,
        note: "UPI balance",
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
            localStorage.getItem(
                key
            );


        if (
            data === null ||
            data === ""
        ) {

            return defaultValue;

        }


        return JSON.parse(
            data
        );

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



function removeData(
    key
) {

    try {

        localStorage.removeItem(
            key
        );

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
   TRANSACTION TYPE NORMALIZER
========================================================= */

function normalizeTransactionType(
    type
) {

    const value =
        String(
            type || ""
        )
        .trim()
        .toLowerCase();


    if (
        value === "income" ||
        value === "in" ||
        value === "credit" ||
        value === "जमा" ||
        value === "उत्पन्न"
    ) {

        return "income";

    }


    if (
        value === "expense" ||
        value === "out" ||
        value === "debit" ||
        value === "खर्च"
    ) {

        return "expense";

    }


    return value;

}



/* =========================================================
   CATEGORY NAME MAP
========================================================= */

const CENTRAL_EXPENSE_CATEGORIES = [

    {
        id: "daily_grocery",
        name: "दररोजचा किराणा खर्च",
        icon: "🛒",
        frequency: "daily"
    },

    {
        id: "monthly_grocery",
        name: "महिन्याचा किराणा खर्च",
        icon: "🛍️",
        frequency: "monthly"
    },

    {
        id: "travel",
        name: "प्रवास",
        icon: "🚗",
        frequency: "daily"
    },

    {
        id: "shopping",
        name: "खरेदी",
        icon: "🛍️",
        frequency: "monthly"
    },

    {
        id: "outside_food",
        name: "बाहेर जेवण",
        icon: "🍽️",
        frequency: "daily"
    },

    {
        id: "electricity",
        name: "लाईट बिल",
        icon: "💡",
        frequency: "monthly"
    },

    {
        id: "medicine",
        name: "औषधे",
        icon: "💊",
        frequency: "monthly"
    },

    {
        id: "home_emi",
        name: "घराचा EMI",
        icon: "🏠",
        frequency: "monthly"
    },

    {
        id: "home_maintenance",
        name: "घरचा मेंटेनन्स",
        icon: "🏢",
        frequency: "monthly"
    },

    {
        id: "insurance",
        name: "इन्शुरन्स पॉलिसी",
        icon: "🛡️",
        frequency: "yearly"
    },

    {
        id: "other_loan",
        name: "इतर लोन",
        icon: "💳",
        frequency: "monthly"
    },

    {
        id: "mobile_bill",
        name: "मोबाईल बिल",
        icon: "📱",
        frequency: "monthly"
    },

    {
        id: "other_expense",
        name: "इतर खर्च",
        icon: "📦",
        frequency: "daily"
    },

    {
        id: "monthly_gas",
        name: "महिन्याचा गॅस",
        icon: "🔥",
        frequency: "monthly"
    },

    {
        id: "fish",
        name: "मच्छी",
        icon: "🐟",
        frequency: "daily"
    }

];


/*
   Other modules साठी global category list
*/

if (
    !window.EXPENSE_CATEGORIES
) {

    window.EXPENSE_CATEGORIES =
        CENTRAL_EXPENSE_CATEGORIES;

}



/* =========================================================
   GET CATEGORY NAME
========================================================= */

function getExpenseCategoryName(
    categoryId
) {

    const category =
        CENTRAL_EXPENSE_CATEGORIES.find(
            item =>
                item.id ===
                categoryId
        );


    if (category) {

        return category.name;

    }


    return categoryId || "";

}



/* =========================================================
   NORMALIZE TRANSACTION
========================================================= */

function normalizeTransaction(
    transaction
) {

    if (
        !transaction ||
        typeof transaction !== "object"
    ) {

        return null;

    }


    const type =
        normalizeTransactionType(
            transaction.type
        );


    if (
        type !== "income" &&
        type !== "expense"
    ) {

        return null;

    }


    let categoryId =
        transaction.categoryId ||
        transaction.category ||
        "";


    let categoryName =
        transaction.categoryName ||
        "";


    /*
       Legacy expense category object
    */

    if (
        typeof categoryId === "object" &&
        categoryId !== null
    ) {

        categoryName =
            categoryId.name ||
            categoryId.label ||
            "";

        categoryId =
            categoryId.id ||
            "";

    }


    if (
        !categoryName &&
        type === "expense"
    ) {

        categoryName =
            getExpenseCategoryName(
                categoryId
            );

    }


    let accountId =
        transaction.accountId ||
        "";


    /*
       काही legacy records मध्ये
       account field असू शकतो.
    */

    if (
        !accountId &&
        transaction.account
    ) {

        accountId =
            findAccountIdByName(
                transaction.account
            );

    }


    const amount =
        Number(
            transaction.amount
        ) || 0;


    return {

        id:
            transaction.id ||
            generateTransactionId(
                type
            ),

        type:
            type,

        date:
            normalizeDate(
                transaction.date ||
                transaction.transactionDate ||
                transaction.createdAt
            ),

        category:
            categoryId,

        categoryId:
            categoryId,

        categoryName:
            categoryName,

        description:
            transaction.description ||
            transaction.title ||
            "",

        amount:
            amount,

        accountId:
            accountId,

        paymentMode:
            transaction.paymentMode ||
            transaction.mode ||
            "",

        note:
            transaction.note ||
            transaction.notes ||
            "",

        createdAt:
            transaction.createdAt ||
            new Date().toISOString(),

        updatedAt:
            transaction.updatedAt ||
            null

    };

}



/* =========================================================
   GENERATE TRANSACTION ID
========================================================= */

function generateTransactionId(
    type = "transaction"
) {

    const prefix =
        type === "income"
            ? "INC"
            : type === "expense"
                ? "EXP"
                : "TXN";


    return (

        prefix +
        "-" +
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 8)

    );

}



/* =========================================================
   FIND ACCOUNT ID BY NAME
========================================================= */

function findAccountIdByName(
    accountName
) {

    if (!accountName) {

        return "";

    }


    const accounts =
        getAccounts();


    const value =
        String(
            accountName
        )
        .trim()
        .toLowerCase();


    const account =
        accounts.find(
            item =>

                String(
                    item.name || ""
                )
                .trim()
                .toLowerCase() ===
                value
        );


    return account
        ? account.id
        : "";

}



/* =========================================================
   MIGRATE OLD TRANSACTIONS
========================================================= */

function migrateLegacyTransactions() {

    /*
       जर new storage मध्ये data आहे
       तर migration पुन्हा करू नका.
    */

    const current =
        getData(
            STORAGE_KEYS.transactions,
            null
        );


    if (
        Array.isArray(current) &&
        current.length > 0
    ) {

        return current;

    }


    let legacyTransactions =
        [];


    for (
        const key
        of LEGACY_STORAGE_KEYS.transactions
    ) {

        const data =
            getData(
                key,
                null
            );


        if (
            Array.isArray(data) &&
            data.length > 0
        ) {

            legacyTransactions =
                data;

            break;

        }

    }


    /*
       Legacy expenses storage
    */

    if (
        legacyTransactions.length === 0
    ) {

        const expenses =
            getData(
                "expenses",
                []
            );


        if (
            Array.isArray(expenses) &&
            expenses.length > 0
        ) {

            legacyTransactions =
                expenses.map(
                    item => ({

                        ...item,

                        type:
                            "expense"

                    })
                );

        }

    }


    if (
        legacyTransactions.length === 0
    ) {

        return [];

    }


    const normalized =
        legacyTransactions
            .map(
                normalizeTransaction
            )
            .filter(
                Boolean
            );


    if (
        normalized.length > 0
    ) {

        saveData(
            STORAGE_KEYS.transactions,
            normalized
        );

        console.log(
            "Legacy transactions migrated:",
            normalized.length
        );

    }


    return normalized;

}



/* =========================================================
   CENTRAL GET TRANSACTIONS
========================================================= */

function getTransactions() {

    let transactions =
        getData(
            STORAGE_KEYS.transactions,
            null
        );


    /*
       New storage not available
       → migrate old data
    */

    if (
        !Array.isArray(transactions)
    ) {

        transactions =
            migrateLegacyTransactions();

    }


    if (
        !Array.isArray(transactions)
    ) {

        return [];

    }


    return transactions;

}



/* =========================================================
   CENTRAL SAVE TRANSACTIONS
========================================================= */

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


    const normalized =
        transactions
            .map(
                normalizeTransaction
            )
            .filter(
                Boolean
            );


    const saved =
        saveData(
            STORAGE_KEYS.transactions,
            normalized
        );


    if (saved) {

        dispatchTransactionsUpdated();

    }


    return saved;

}



/* =========================================================
   GET TRANSACTION BY ID
========================================================= */

function getTransactionById(
    transactionId
) {

    return getTransactions()
        .find(
            transaction =>
                transaction.id ===
                transactionId
        ) || null;

}



/* =========================================================
   DELETE TRANSACTION
========================================================= */

function deleteTransaction(
    transactionId
) {

    const transactions =
        getTransactions();


    const updated =
        transactions.filter(
            transaction =>
                transaction.id !==
                transactionId
        );


    if (
        updated.length ===
        transactions.length
    ) {

        return false;

    }


    return saveTransactions(
        updated
    );

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


    /*
       Accounts नसतील तर defaults तयार करा.
    */

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


        saveData(
            STORAGE_KEYS.accounts,
            accounts
        );

    }


    return accounts;

}



/* =========================================================
   SAVE ACCOUNTS
========================================================= */

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


    const saved =
        saveData(
            STORAGE_KEYS.accounts,
            accounts
        );


    if (saved) {

        try {

            window.dispatchEvent(
                new CustomEvent(
                    "rdkhAccountsUpdated"
                )
            );

        }

        catch (error) {

            console.error(
                "Account event error:",
                error
            );

        }

    }


    return saved;

}



/* =========================================================
   INITIALIZE DEFAULT ACCOUNTS
========================================================= */

function initializeAccounts() {

    let accounts =
        getAccounts();


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


    saveData(
        STORAGE_KEYS.accounts,
        accounts
    );


    return accounts;

}



/* =========================================================
   GET ACCOUNT BALANCE
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
            account.openingBalance
        ) || 0;


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
                        transaction.amount
                    ) || 0;


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
   GET ALL ACCOUNT BALANCES
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
   TOTAL ACCOUNT BALANCE
========================================================= */

function getTotalAccountBalance() {

    return getAccounts()
        .reduce(
            (
                total,
                account
            ) =>

                total +
                getAccountBalance(
                    account.id
                ),

            0
        );

}



/* =========================================================
   BUDGET
========================================================= */

function getBudgets() {

    const data =
        getData(
            STORAGE_KEYS.budgets,
            {}
        );


    if (
        data &&
        typeof data === "object" &&
        !Array.isArray(data)
    ) {

        return data;

    }


    /*
       Legacy array compatibility
    */

    if (
        Array.isArray(data)
    ) {

        const converted = {};


        data.forEach(
            item => {

                if (
                    item &&
                    item.month
                ) {

                    converted[
                        item.month
                    ] =
                        item;

                }

            }
        );


        return converted;

    }


    return {};

}



/* =========================================================
   SAVE BUDGETS
========================================================= */

function saveBudgets(
    budgets
) {

    if (
        !budgets ||
        typeof budgets !== "object"
    ) {

        return false;

    }


    const saved =
        saveData(
            STORAGE_KEYS.budgets,
            budgets
        );


    if (saved) {

        try {

            window.dispatchEvent(
                new CustomEvent(
                    "rdkhBudgetUpdated"
                )
            );

        }

        catch (error) {

            console.error(
                "Budget event error:",
                error
            );

        }

    }


    return saved;

}



/* =========================================================
   GET CURRENT MONTH BUDGET
========================================================= */

function getCurrentMonthBudget() {

    const month =
        getCurrentMonth();


    return getBudgetForMonth(
        month
    );

}



/* =========================================================
   GET BUDGET FOR MONTH
========================================================= */

function getBudgetForMonth(
    month
) {

    const budgets =
        getBudgets();


    const source =
        budgets[month];


    if (!source) {

        return {

            month:
                month,

            plannedMoney:
                0,

            total:
                0,

            incomePlan:
                0,

            expenseBudget:
                0,

            savingTarget:
                0,

            alertPercent:
                80,

            categories:
                {},

            createdAt:
                null,

            updatedAt:
                null

        };

    }


    return normalizeBudget(
        source,
        month
    );

}



/* =========================================================
   NORMALIZE BUDGET
========================================================= */

function normalizeBudget(
    budget,
    month
) {

    const source =
        budget || {};


    let categories =
        source.categories ||
        {};


    /*
       Array format compatibility
    */

    if (
        Array.isArray(
            categories
        )
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
                            item.amount ||
                            item.planned ||
                            item.budget ||
                            0
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


    const plannedMoney =
        Number(
            source.plannedMoney ??
            source.total ??
            source.incomePlan ??
            0
        ) || 0;


    return {

        month:
            source.month ||
            month,

        plannedMoney:
            plannedMoney,

        total:
            Number(
                source.total ??
                plannedMoney
            ) || 0,

        incomePlan:
            Number(
                source.incomePlan ??
                plannedMoney
            ) || 0,

        expenseBudget:
            Number(
                source.expenseBudget ??
                plannedMoney
            ) || 0,

        savingTarget:
            Number(
                source.savingTarget ||
                0
            ) || 0,

        alertPercent:
            Number(
                source.alertPercent ??
                80
            ) || 80,

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


    return (

        today.getFullYear() +
        "-" +
        String(
            today.getMonth() + 1
        ).padStart(
            2,
            "0"
        ) +
        "-" +
        String(
            today.getDate()
        ).padStart(
            2,
            "0"
        )

    );

}



function getCurrentMonth() {

    return getTodayString()
        .substring(
            0,
            7
        );

}



/* =========================================================
   NORMALIZE DATE
========================================================= */

function normalizeDate(
    date
) {

    if (!date) {

        return "";

    }


    const value =
        String(
            date
        ).trim();


    if (
        /^\d{4}-\d{2}-\d{2}$/
            .test(value)
    ) {

        return value;

    }


    /*
       DD-MM-YYYY
    */

    let match =
        value.match(
            /^(\d{2})-(\d{2})-(\d{4})$/
        );


    if (match) {

        return (

            match[3] +
            "-" +
            match[2] +
            "-" +
            match[1]

        );

    }


    const parsed =
        new Date(
            value
        );


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



/* =========================================================
   DISPLAY DATE
========================================================= */

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
        Number(
            amount
        ) || 0;


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

    return getTotalAccountBalance();

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
                ) ===
                today
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
                ) ===
                today
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
   CATEGORY EXPENSE TOTAL
========================================================= */

function getCategoryExpenseTotal(
    categoryId,
    month = getCurrentMonth()
) {

    return getTransactions()
        .filter(
            transaction => {

                if (
                    transaction.type !==
                    "expense"
                ) {

                    return false;

                }


                const transactionCategory =
                    transaction.categoryId ||
                    transaction.category ||
                    "";


                if (
                    transactionCategory !==
                    categoryId
                ) {

                    return false;

                }


                const date =
                    normalizeDate(
                        transaction.date
                    );


                return (
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


    const planned =
        Number(
            budget.plannedMoney
        ) || 0;


    return (
        planned -
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
            budget.plannedMoney
        ) || 0;


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


    const totalBudget =
        Number(
            budget.plannedMoney
        ) || 0;


    const spent =
        getMonthExpense();


    const remaining =
        totalBudget -
        spent;


    let percentage =
        0;


    if (
        totalBudget > 0
    ) {

        percentage =
            (
                spent /
                totalBudget
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
        "budgetAmount",
        formatMoney(
            totalBudget
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
            remaining
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


    const remainingElement =
        document.getElementById(
            "budgetRemaining"
        );


    if (remainingElement) {

        remainingElement.style.color =
            remaining < 0
                ? "var(--expense)"
                : "var(--income)";

    }

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


            const category =
                transaction.categoryName ||
                transaction.category ||
                (
                    isIncome
                        ? "जमा"
                        : "खर्च"
                );


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

                    <i class="fa-solid ${icon}"></i>

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
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric"
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
   REQUIRE LOGIN
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
   GLOBAL INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeAccounts();

        /*
           Existing old transaction data
           असल्यास migration.
        */

        migrateLegacyTransactions();

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

        if (
            !event.key ||
            Object.values(
                STORAGE_KEYS
            ).includes(
                event.key
            ) ||

            LEGACY_STORAGE_KEYS
                .transactions
                .includes(
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
   GLOBAL FUNCTIONS
========================================================= */

window.getTransactions =
    getTransactions;

window.saveTransactions =
    saveTransactions;

window.getTransactionById =
    getTransactionById;

window.deleteTransaction =
    deleteTransaction;

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

window.getTotalAccountBalance =
    getTotalAccountBalance;

window.getTotalIncome =
    getTotalIncome;

window.getTotalExpense =
    getTotalExpense;

window.getTotalBalance =
    getTotalBalance;

window.getTodayIncome =
    getTodayIncome;

window.getTodayExpense =
    getTodayExpense;

window.getTodaySaving =
    getTodaySaving;

window.getMonthIncome =
    getMonthIncome;

window.getMonthExpense =
    getMonthExpense;

window.getCategoryExpenseTotal =
    getCategoryExpenseTotal;

window.getBudgets =
    getBudgets;

window.saveBudgets =
    saveBudgets;

window.getCurrentMonthBudget =
    getCurrentMonthBudget;

window.getBudgetForMonth =
    getBudgetForMonth;

window.getBudgetRemaining =
    getBudgetRemaining;

window.getBudgetPercentage =
    getBudgetPercentage;

window.getRecentTransactions =
    getRecentTransactions;

window.formatMoney =
    formatMoney;

window.normalizeDate =
    normalizeDate;

window.formatDisplayDate =
    formatDisplayDate;

window.escapeHTML =
    escapeHTML;

window.getTodayString =
    getTodayString;

window.getCurrentMonth =
    getCurrentMonth;

window.updateDashboard =
    updateDashboard;



/* =========================================================
   CONSOLE INFORMATION
========================================================= */

console.log(
    "रोजचा जमा खर्च अहवाल - Central app.js loaded successfully."
);

console.log(
    "Central Transaction Storage:",
    STORAGE_KEYS.transactions
);

console.log(
    "Central Budget Storage:",
    STORAGE_KEYS.budgets
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
