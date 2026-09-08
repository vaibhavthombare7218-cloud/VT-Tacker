/* =========================================================
   transactions.js
   रोजचा जमा खर्च अहवाल

   CENTRAL TRANSACTION SYSTEM + TRANSACTIONS PAGE

   CENTRAL STORAGE:
   rdkh_transactions_v2

   CONNECTED WITH:
   ---------------------------------------------------------
   accounts.js
   income.js
   expense.js
   monthly-budget.js
   reports.js
   app.js

   FEATURES:
   ---------------------------------------------------------
   ✅ Central transaction storage
   ✅ Income + Expense
   ✅ Account ID based tracking
   ✅ Account balance support
   ✅ Transaction search
   ✅ Type filter
   ✅ Account filter
   ✅ Month filter
   ✅ Date filter
   ✅ Edit transaction
   ✅ Delete transaction
   ✅ Legacy transaction migration
   ✅ Expense legacy migration
   ✅ Income legacy migration
   ✅ Dashboard refresh
   ✅ Reports refresh
   ✅ Budget refresh
   ========================================================= */


/* =========================================================
   CENTRAL STORAGE
========================================================= */

(function () {

    const CENTRAL_STORAGE_KEY = "rdkh_transactions_v2";

    const LEGACY_TRANSACTION_KEYS = [
        "rdkh_transactions",
        "rdkh_transaction",
        "transactions",
        "income_expense_transactions"
    ];

    const LEGACY_EXPENSE_KEY = "expenses";

    const LEGACY_INCOME_KEYS = [
        "income_transactions",
        "incomes",
        "income"
    ];


    /* =====================================================
       BASIC HELPERS
    ===================================================== */

    function safeParse(value, fallback) {

        try {

            const parsed = JSON.parse(value);

            return parsed;

        } catch (error) {

            return fallback;

        }

    }


    function generateCentralTransactionId(type) {

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
                .toUpperCase()
        );

    }


    function normalizeTransactionType(type) {

        if (!type) {
            return "";
        }

        const value = String(type)
            .trim()
            .toLowerCase();

        if (
            value === "income" ||
            value === "जमा" ||
            value === "credit" ||
            value === "cr"
        ) {

            return "income";

        }

        if (
            value === "expense" ||
            value === "खर्च" ||
            value === "debit" ||
            value === "dr"
        ) {

            return "expense";

        }

        return value;

    }


    function normalizeAmount(amount) {

        const number = Number(amount);

        if (!Number.isFinite(number)) {
            return 0;
        }

        return Math.abs(number);

    }


    function normalizeDate(date) {

        if (!date) {
            return "";
        }

        const value = String(date);

        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {

            return value;

        }

        const parsed = new Date(value);

        if (Number.isNaN(parsed.getTime())) {
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


    function getTodayDate() {

        const today = new Date();

        const year = today.getFullYear();

        const month = String(
            today.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            today.getDate()
        ).padStart(2, "0");

        return `${year}-${month}-${day}`;

    }


    function getCurrentMonth() {

        return getTodayDate().substring(0, 7);

    }


    /* =====================================================
       ACCOUNT HELPERS
    ===================================================== */

    function findAccountIdByName(accountName) {

        if (!accountName) {
            return "";
        }

        if (
            typeof window.getAccounts !== "function"
        ) {

            return "";

        }

        const accounts =
            window.getAccounts() || [];

        const searchName =
            String(accountName)
                .trim()
                .toLowerCase();

        const account =
            accounts.find(function (item) {

                return String(item.name || "")
                    .trim()
                    .toLowerCase() === searchName;

            });

        return account
            ? account.id
            : "";

    }


    function getAccountNameById(accountId) {

        if (!accountId) {
            return "";
        }

        if (
            typeof window.getAccounts !== "function"
        ) {

            return "";

        }

        const accounts =
            window.getAccounts() || [];

        const account =
            accounts.find(function (item) {

                return item.id === accountId;

            });

        return account
            ? account.name
            : "";

    }


    /* =====================================================
       CATEGORY HELPERS
    ===================================================== */

    function getExpenseCategoryName(categoryId) {

        if (
            typeof window.getCategoryName === "function"
        ) {

            try {

                return window.getCategoryName(categoryId);

            } catch (error) {}

        }

        if (
            Array.isArray(window.EXPENSE_CATEGORIES)
        ) {

            const category =
                window.EXPENSE_CATEGORIES.find(
                    function (item) {

                        return (
                            item.id === categoryId
                        );

                    }
                );

            if (category) {

                return (
                    category.name ||
                    category.label ||
                    categoryId
                );

            }

        }

        return categoryId || "";

    }


    /* =====================================================
       NORMALIZE TRANSACTION
    ===================================================== */

    function normalizeTransaction(transaction) {

        if (!transaction || typeof transaction !== "object") {

            return null;

        }

        const type =
            normalizeTransactionType(
                transaction.type ||
                transaction.transactionType
            );

        if (
            type !== "income" &&
            type !== "expense"
        ) {

            return null;

        }

        const date =
            normalizeDate(
                transaction.date ||
                transaction.transactionDate
            );

        const amount =
            normalizeAmount(
                transaction.amount
            );

        let accountId =
            transaction.accountId || "";

        let accountName =
            transaction.accountName ||
            transaction.account ||
            "";

        /*
         * If accountId is missing but account
         * name exists, try to find matching account.
         */

        if (
            !accountId &&
            accountName
        ) {

            accountId =
                findAccountIdByName(
                    accountName
                );

        }

        if (
            !accountName &&
            accountId
        ) {

            accountName =
                getAccountNameById(
                    accountId
                );

        }

        let category =
            transaction.category ||
            transaction.categoryId ||
            "";

        let categoryId =
            transaction.categoryId ||
            transaction.category ||
            "";

        let categoryName =
            transaction.categoryName ||
            "";

        if (
            type === "expense" &&
            !categoryName
        ) {

            categoryName =
                getExpenseCategoryName(
                    categoryId
                );

        }

        if (!category) {

            category =
                categoryId ||
                categoryName ||
                "Other";

        }

        if (!categoryId) {

            categoryId =
                category;

        }

        return {

            id:
                transaction.id ||
                generateCentralTransactionId(type),

            type,

            date,

            category,

            categoryId,

            categoryName:
                categoryName ||
                category,

            description:
                transaction.description ||
                transaction.title ||
                "",

            amount,

            accountId,

            accountName,

            /*
             * Keep account field also for compatibility
             * with old UI/code.
             */

            account:
                transaction.account ||
                accountName ||
                "",

            paymentMode:
                transaction.paymentMode ||
                "",

            note:
                transaction.note ||
                "",

            createdAt:
                transaction.createdAt ||
                new Date().toISOString(),

            updatedAt:
                transaction.updatedAt ||
                ""

        };

    }


    /* =====================================================
       NORMALIZE TRANSACTION ARRAY
    ===================================================== */

    function normalizeTransactionArray(list) {

        if (!Array.isArray(list)) {

            return [];

        }

        const result = [];

        list.forEach(function (item) {

            const normalized =
                normalizeTransaction(item);

            if (normalized) {

                result.push(normalized);

            }

        });

        return result;

    }


    /* =====================================================
       LEGACY EXPENSE MIGRATION
    ===================================================== */

    function migrateLegacyExpenses() {

        const raw =
            localStorage.getItem(
                LEGACY_EXPENSE_KEY
            );

        if (!raw) {

            return [];

        }

        const expenses =
            safeParse(raw, []);

        if (!Array.isArray(expenses)) {

            return [];

        }

        return expenses
            .map(function (expense) {

                const category =
                    expense.categoryId ||
                    expense.category ||
                    "";

                const accountName =
                    expense.account ||
                    expense.accountName ||
                    "";

                const accountId =
                    expense.accountId ||
                    findAccountIdByName(
                        accountName
                    );

                return {

                    id:
                        expense.id ||
                        generateCentralTransactionId(
                            "expense"
                        ),

                    type: "expense",

                    date:
                        normalizeDate(
                            expense.date
                        ),

                    category,

                    categoryId: category,

                    categoryName:
                        expense.categoryName ||
                        getExpenseCategoryName(
                            category
                        ),

                    description:
                        expense.description ||
                        "",

                    amount:
                        normalizeAmount(
                            expense.amount
                        ),

                    accountId,

                    accountName,

                    account: accountName,

                    paymentMode:
                        expense.paymentMode ||
                        "",

                    note:
                        expense.note ||
                        "",

                    createdAt:
                        expense.createdAt ||
                        new Date().toISOString(),

                    updatedAt: ""

                };

            })
            .filter(function (item) {

                return (
                    item.date &&
                    item.amount > 0
                );

            });

    }


    /* =====================================================
       LEGACY INCOME MIGRATION
    ===================================================== */

    function migrateLegacyIncome() {

        const result = [];

        LEGACY_INCOME_KEYS.forEach(
            function (key) {

                const raw =
                    localStorage.getItem(key);

                if (!raw) {
                    return;
                }

                const list =
                    safeParse(raw, []);

                if (!Array.isArray(list)) {
                    return;
                }

                list.forEach(
                    function (income) {

                        const category =
                            income.category ||
                            income.categoryId ||
                            income.incomeCategory ||
                            "Other";

                        const accountName =
                            income.account ||
                            income.accountName ||
                            "";

                        const accountId =
                            income.accountId ||
                            findAccountIdByName(
                                accountName
                            );

                        result.push({

                            id:
                                income.id ||
                                generateCentralTransactionId(
                                    "income"
                                ),

                            type: "income",

                            date:
                                normalizeDate(
                                    income.date ||
                                    income.transactionDate
                                ),

                            category,

                            categoryId: category,

                            categoryName:
                                income.categoryName ||
                                category,

                            description:
                                income.description ||
                                income.title ||
                                "",

                            amount:
                                normalizeAmount(
                                    income.amount
                                ),

                            accountId,

                            accountName,

                            account:
                                accountName,

                            paymentMode:
                                income.paymentMode ||
                                "",

                            note:
                                income.note ||
                                "",

                            createdAt:
                                income.createdAt ||
                                new Date().toISOString(),

                            updatedAt: ""

                        });

                    }
                );

            }
        );

        return result.filter(
            function (item) {

                return (
                    item.date &&
                    item.amount > 0
                );

            }
        );

    }


    /* =====================================================
       LEGACY CENTRAL TRANSACTION MIGRATION
    ===================================================== */

    function migrateLegacyCentralTransactions() {

        const result = [];

        LEGACY_TRANSACTION_KEYS.forEach(
            function (key) {

                const raw =
                    localStorage.getItem(key);

                if (!raw) {
                    return;
                }

                const list =
                    safeParse(raw, []);

                if (!Array.isArray(list)) {
                    return;
                }

                result.push.apply(
                    result,
                    normalizeTransactionArray(
                        list
                    )
                );

            }
        );

        return result;

    }


    /* =====================================================
       REMOVE DUPLICATES
    ===================================================== */

    function removeDuplicateTransactions(
        transactions
    ) {

        const map = new Map();

        transactions.forEach(
            function (transaction) {

                if (!transaction) {
                    return;
                }

                /*
                 * First priority = ID.
                 */

                if (transaction.id) {

                    map.set(
                        String(transaction.id),
                        transaction
                    );

                    return;

                }

                /*
                 * Fallback duplicate key.
                 */

                const fallbackKey =
                    [
                        transaction.type,
                        transaction.date,
                        transaction.amount,
                        transaction.categoryId,
                        transaction.accountId,
                        transaction.description
                    ].join("|");

                map.set(
                    fallbackKey,
                    transaction
                );

            }
        );

        return Array.from(
            map.values()
        );

    }


    /* =====================================================
       MIGRATE ALL OLD DATA
    ===================================================== */

    function migrateAllLegacyData() {

        let all = [];

        /*
         * First old central transactions
         */

        all =
            all.concat(
                migrateLegacyCentralTransactions()
            );

        /*
         * Old expenses
         */

        all =
            all.concat(
                migrateLegacyExpenses()
            );

        /*
         * Old income
         */

        all =
            all.concat(
                migrateLegacyIncome()
            );

        all =
            removeDuplicateTransactions(
                all
            );

        if (all.length > 0) {

            localStorage.setItem(
                CENTRAL_STORAGE_KEY,
                JSON.stringify(all)
            );

        }

        return all;

    }


    /* =====================================================
       GET TRANSACTIONS
       GLOBAL FUNCTION
    ===================================================== */

    window.getTransactions =
        function () {

            const raw =
                localStorage.getItem(
                    CENTRAL_STORAGE_KEY
                );

            /*
             * If central storage exists,
             * use it as the single source.
             */

            if (raw !== null) {

                const list =
                    safeParse(raw, []);

                if (Array.isArray(list)) {

                    return normalizeTransactionArray(
                        list
                    );

                }

            }

            /*
             * First run:
             * migrate old data.
             */

            return migrateAllLegacyData();

        };


    /* =====================================================
       SAVE TRANSACTIONS
       GLOBAL FUNCTION
    ===================================================== */

    window.saveTransactions =
        function (transactions) {

            const normalized =
                normalizeTransactionArray(
                    transactions
                );

            const unique =
                removeDuplicateTransactions(
                    normalized
                );

            localStorage.setItem(
                CENTRAL_STORAGE_KEY,
                JSON.stringify(unique)
            );

            /*
             * Compatibility event
             */

            try {

                window.dispatchEvent(
                    new CustomEvent(
                        "rdkhTransactionsUpdated",
                        {
                            detail: {
                                transactions: unique
                            }
                        }
                    )
                );

            } catch (error) {

                /*
                 * Older browser fallback
                 */

                try {

                    const event =
                        document.createEvent(
                            "Event"
                        );

                    event.initEvent(
                        "rdkhTransactionsUpdated",
                        true,
                        true
                    );

                    window.dispatchEvent(
                        event
                    );

                } catch (e) {}

            }

            /*
             * Refresh connected modules
             */

            if (
                typeof window.updateDashboard ===
                "function"
            ) {

                try {
                    window.updateDashboard();
                } catch (error) {}

            }

            if (
                typeof window.refreshMonthlyBudget ===
                "function"
            ) {

                try {
                    window.refreshMonthlyBudget();
                } catch (error) {}

            }

            if (
                typeof window.refreshExpenseUI ===
                "function"
            ) {

                /*
                 * Avoid recursive problems if
                 * refreshExpenseUI calls saveTransactions.
                 */

                try {

                    if (
                        !window.__RDKH_SAVING_TRANSACTIONS
                    ) {

                        window.refreshExpenseUI();

                    }

                } catch (error) {}

            }

            return unique;

        };


    /* =====================================================
       ADD TRANSACTION
       GLOBAL FUNCTION
    ===================================================== */

    window.addTransaction =
        function (transaction) {

            const current =
                window.getTransactions();

            const normalized =
                normalizeTransaction(
                    transaction
                );

            if (!normalized) {

                return null;

            }

            current.push(normalized);

            window.saveTransactions(
                current
            );

            return normalized;

        };


    /* =====================================================
       UPDATE TRANSACTION
       GLOBAL FUNCTION
    ===================================================== */

    window.updateTransaction =
        function (
            transactionId,
            updatedData
        ) {

            const current =
                window.getTransactions();

            const index =
                current.findIndex(
                    function (item) {

                        return (
                            String(item.id) ===
                            String(transactionId)
                        );

                    }
                );

            if (index === -1) {

                return null;

            }

            const merged =
                Object.assign(
                    {},
                    current[index],
                    updatedData,
                    {
                        id:
                            current[index].id,

                        updatedAt:
                            new Date().toISOString()
                    }
                );

            const normalized =
                normalizeTransaction(
                    merged
                );

            if (!normalized) {

                return null;

            }

            current[index] =
                normalized;

            window.saveTransactions(
                current
            );

            return normalized;

        };


    /* =====================================================
       DELETE TRANSACTION
       GLOBAL FUNCTION
    ===================================================== */

    window.deleteTransaction =
        function (transactionId) {

            const current =
                window.getTransactions();

            const updated =
                current.filter(
                    function (item) {

                        return (
                            String(item.id) !==
                            String(transactionId)
                        );

                    }
                );

            if (
                updated.length ===
                current.length
            ) {

                return false;

            }

            window.saveTransactions(
                updated
            );

            return true;

        };


    /* =====================================================
       GET SINGLE TRANSACTION
       GLOBAL FUNCTION
    ===================================================== */

    window.getTransactionById =
        function (transactionId) {

            const list =
                window.getTransactions();

            return (
                list.find(
                    function (item) {

                        return (
                            String(item.id) ===
                            String(transactionId)
                        );

                    }
                ) || null
            );

        };


    /* =====================================================
       INCOME TOTAL FUNCTIONS
       Used by income.js
    ===================================================== */

    function calculateIncomeTotal(
        filterFunction
    ) {

        const transactions =
            window.getTransactions();

        return transactions.reduce(
            function (total, transaction) {

                if (
                    normalizeTransactionType(
                        transaction.type
                    ) !== "income"
                ) {

                    return total;

                }

                if (
                    filterFunction &&
                    !filterFunction(transaction)
                ) {

                    return total;

                }

                return (
                    total +
                    normalizeAmount(
                        transaction.amount
                    )
                );

            },
            0
        );

    }


    window.getTodayIncome =
        function () {

            const today =
                getTodayDate();

            return calculateIncomeTotal(
                function (transaction) {

                    return (
                        transaction.date ===
                        today
                    );

                }
            );

        };


    window.getMonthIncome =
        function () {

            const month =
                getCurrentMonth();

            return calculateIncomeTotal(
                function (transaction) {

                    return (
                        transaction.date
                            .substring(0, 7) ===
                        month
                    );

                }
            );

        };


    window.getTotalIncome =
        function () {

            return calculateIncomeTotal();

        };


    /* =====================================================
       EXPENSE TOTAL FUNCTIONS
       Safe compatibility functions
    ===================================================== */

    function calculateExpenseTotal(
        filterFunction
    ) {

        const transactions =
            window.getTransactions();

        return transactions.reduce(
            function (total, transaction) {

                if (
                    normalizeTransactionType(
                        transaction.type
                    ) !== "expense"
                ) {

                    return total;

                }

                if (
                    filterFunction &&
                    !filterFunction(transaction)
                ) {

                    return total;

                }

                return (
                    total +
                    normalizeAmount(
                        transaction.amount
                    )
                );

            },
            0
        );

    }


    if (
        typeof window.getTodayExpense !==
        "function"
    ) {

        window.getTodayExpense =
            function () {

                const today =
                    getTodayDate();

                return calculateExpenseTotal(
                    function (transaction) {

                        return (
                            transaction.date ===
                            today
                        );

                    }
                );

            };

    }


    if (
        typeof window.getMonthExpense !==
        "function"
    ) {

        window.getMonthExpense =
            function () {

                const month =
                    getCurrentMonth();

                return calculateExpenseTotal(
                    function (transaction) {

                        return (
                            transaction.date
                                .substring(0, 7) ===
                            month
                        );

                    }
                );

            };

    }


    if (
        typeof window.getTotalExpense !==
        "function"
    ) {

        window.getTotalExpense =
            function () {

                return calculateExpenseTotal();

            };

    }


    /* =====================================================
       CATEGORY EXPENSE TOTAL
       Used by monthly-budget.js
    ===================================================== */

    window.getCategoryExpenseTotal =
        function (
            categoryId,
            month
        ) {

            const transactions =
                window.getTransactions();

            const normalizedCategory =
                String(
                    categoryId || ""
                ).trim();

            return transactions.reduce(
                function (total, transaction) {

                    if (
                        normalizeTransactionType(
                            transaction.type
                        ) !== "expense"
                    ) {

                        return total;

                    }

                    const transactionCategory =
                        transaction.categoryId ||
                        transaction.category ||
                        "";

                    if (
                        String(
                            transactionCategory
                        ) !==
                        normalizedCategory
                    ) {

                        return total;

                    }

                    if (month) {

                        if (
                            !transaction.date ||
                            transaction.date.substring(
                                0,
                                7
                            ) !== month
                        ) {

                            return total;

                        }

                    }

                    return (
                        total +
                        normalizeAmount(
                            transaction.amount
                        )
                    );

                },
                0
            );

        };


    /* =====================================================
       GET MONTH TRANSACTIONS
    ===================================================== */

    window.getMonthTransactions =
        function (month) {

            const targetMonth =
                month || getCurrentMonth();

            return window.getTransactions()
                .filter(
                    function (transaction) {

                        return (
                            transaction.date &&
                            transaction.date
                                .substring(0, 7) ===
                            targetMonth
                        );

                    }
                );

        };


    /* =====================================================
       TRANSACTION PAGE VARIABLES
    ===================================================== */

    let transactionList = [];

    let transactionToDelete = null;

    let transactionToEdit = null;


    /* =====================================================
       DOM READY
    ===================================================== */

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            /*
             * Do not assume accounts.js is loaded.
             */

            if (
                typeof window.initializeAccounts ===
                "function"
            ) {

                try {

                    window.initializeAccounts();

                } catch (error) {}

            }

            loadTransactionAccounts();

            setDefaultTransactionMonth();

            setupTransactionEvents();

            loadTransactions();

        }
    );


    /* =====================================================
       LOAD ACCOUNT FILTER
    ===================================================== */

    function loadTransactionAccounts() {

        const select =
            document.getElementById(
                "transactionAccount"
            );

        if (!select) {
            return;
        }

        const previousValue =
            select.value;

        select.innerHTML = `
            <option value="">सर्व खाती</option>
        `;

        if (
            typeof window.getAccounts !==
            "function"
        ) {

            return;

        }

        const accounts =
            window.getAccounts() || [];

        accounts.forEach(
            function (account) {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    account.id;

                option.textContent =
                    account.name;

                select.appendChild(
                    option
                );

            }
        );

        if (
            previousValue &&
            accounts.some(
                function (account) {

                    return (
                        account.id ===
                        previousValue
                    );

                }
            )
        ) {

            select.value =
                previousValue;

        }

    }


    /* =====================================================
       DEFAULT MONTH
    ===================================================== */

    function setDefaultTransactionMonth() {

        const monthInput =
            document.getElementById(
                "transactionMonth"
            );

        if (
            monthInput &&
            !monthInput.value
        ) {

            monthInput.value =
                getCurrentMonth();

        }

    }


    /* =====================================================
       EVENTS
    ===================================================== */

    function setupTransactionEvents() {

        const search =
            document.getElementById(
                "transactionSearch"
            );

        const type =
            document.getElementById(
                "transactionType"
            );

        const account =
            document.getElementById(
                "transactionAccount"
            );

        const month =
            document.getElementById(
                "transactionMonth"
            );

        const date =
            document.getElementById(
                "transactionDate"
            );


        if (search) {

            search.addEventListener(
                "input",
                function () {

                    applyTransactionFilters();

                }
            );

        }


        if (type) {

            type.addEventListener(
                "change",
                function () {

                    applyTransactionFilters();

                }
            );

        }


        if (account) {

            account.addEventListener(
                "change",
                function () {

                    applyTransactionFilters();

                }
            );

        }


        if (month) {

            month.addEventListener(
                "change",
                function () {

                    applyTransactionFilters();

                }
            );

        }


        if (date) {

            date.addEventListener(
                "change",
                function () {

                    applyTransactionFilters();

                }
            );

        }

    }


    /* =====================================================
       LOAD TRANSACTIONS
    ===================================================== */

    window.loadTransactions =
        function () {

            transactionList =
                window.getTransactions();

            applyTransactionFilters();

        };


    /* =====================================================
       APPLY FILTERS
    ===================================================== */

    window.applyTransactionFilters =
        function () {

            const search =
                document.getElementById(
                    "transactionSearch"
                );

            const type =
                document.getElementById(
                    "transactionType"
                );

            const account =
                document.getElementById(
                    "transactionAccount"
                );

            const month =
                document.getElementById(
                    "transactionMonth"
                );

            const date =
                document.getElementById(
                    "transactionDate"
                );


            const searchValue =
                search
                    ? search.value
                        .trim()
                        .toLowerCase()
                    : "";

            const typeValue =
                type
                    ? type.value
                    : "";

            const accountValue =
                account
                    ? account.value
                    : "";

            const monthValue =
                month
                    ? month.value
                    : "";

            const dateValue =
                date
                    ? date.value
                    : "";


            const filtered =
                transactionList.filter(
                    function (transaction) {

                        const transactionType =
                            normalizeTransactionType(
                                transaction.type
                            );


                        /*
                         * TYPE
                         */

                        if (
                            typeValue &&
                            typeValue !== "all" &&
                            transactionType !==
                            typeValue
                        ) {

                            return false;

                        }


                        /*
                         * ACCOUNT
                         */

                        if (
                            accountValue &&
                            transaction.accountId !==
                            accountValue
                        ) {

                            return false;

                        }


                        /*
                         * MONTH
                         */

                        if (
                            monthValue &&
                            (
                                !transaction.date ||
                                transaction.date
                                    .substring(0, 7) !==
                                monthValue
                            )
                        ) {

                            return false;

                        }


                        /*
                         * DATE
                         */

                        if (
                            dateValue &&
                            transaction.date !==
                            dateValue
                        ) {

                            return false;

                        }


                        /*
                         * SEARCH
                         */

                        if (searchValue) {

                            const accountName =
                                getAccountName(
                                    transaction.accountId
                                ) ||
                                transaction.accountName ||
                                transaction.account ||
                                "";

                            const searchableText =
                                [
                                    transaction.categoryName,
                                    transaction.category,
                                    transaction.categoryId,
                                    transaction.description,
                                    transaction.note,
                                    transaction.paymentMode,
                                    accountName,
                                    transactionType,
                                    transaction.date,
                                    transaction.amount
                                ]
                                    .join(" ")
                                    .toLowerCase();

                            if (
                                !searchableText.includes(
                                    searchValue
                                )
                            ) {

                                return false;

                            }

                        }


                        return true;

                    }
                );


            renderTransactions(
                filtered
            );

        };


    /* =====================================================
       CLEAR FILTERS
    ===================================================== */

    window.clearTransactionFilters =
        function () {

            const search =
                document.getElementById(
                    "transactionSearch"
                );

            const type =
                document.getElementById(
                    "transactionType"
                );

            const account =
                document.getElementById(
                    "transactionAccount"
                );

            const month =
                document.getElementById(
                    "transactionMonth"
                );

            const date =
                document.getElementById(
                    "transactionDate"
                );


            if (search) {
                search.value = "";
            }

            if (type) {
                type.value = "all";
            }

            if (account) {
                account.value = "";
            }

            if (month) {
                month.value = "";
            }

            if (date) {
                date.value = "";
            }


            transactionList =
                window.getTransactions();

            applyTransactionFilters();

        };


    /* =====================================================
       RENDER TRANSACTIONS
    ===================================================== */

    function renderTransactions(
        transactions
    ) {

        const list =
            document.getElementById(
                "transactionsList"
            );

        const empty =
            document.getElementById(
                "emptyTransactionState"
            );


        if (!list) {
            return;
        }


        /*
         * Remove previously generated cards.
         */

        list
            .querySelectorAll(
                ".transaction-record"
            )
            .forEach(
                function (element) {

                    element.remove();

                }
            );


        const sorted =
            [...transactions]
                .sort(
                    function (a, b) {

                        const dateA =
                            new Date(
                                a.date ||
                                a.createdAt ||
                                0
                            ).getTime();

                        const dateB =
                            new Date(
                                b.date ||
                                b.createdAt ||
                                0
                            ).getTime();

                        return (
                            dateB -
                            dateA
                        );

                    }
                );


        updateTransactionSummary(
            sorted
        );


        if (
            sorted.length === 0
        ) {

            if (empty) {

                empty.style.display =
                    "block";

            }

            return;

        }


        if (empty) {

            empty.style.display =
                "none";

        }


        sorted.forEach(
            function (transaction) {

                const card =
                    createTransactionCard(
                        transaction
                    );

                list.appendChild(
                    card
                );

            }
        );

    }


    /* =====================================================
       CREATE TRANSACTION CARD
    ===================================================== */

    function createTransactionCard(
        transaction
    ) {

        const card =
            document.createElement(
                "div"
            );

        card.className =
            "transaction-record";


        const type =
            normalizeTransactionType(
                transaction.type
            );

        const isIncome =
            type === "income";


        const amount =
            normalizeAmount(
                transaction.amount
            );


        const categoryName =
            transaction.categoryName ||
            transaction.category ||
            transaction.categoryId ||
            "इतर";


        const description =
            transaction.description ||
            "—";


        const note =
            transaction.note ||
            "";


        const accountName =
            getAccountName(
                transaction.accountId
            ) ||
            transaction.accountName ||
            transaction.account ||
            "खाते उपलब्ध नाही";


        const paymentMode =
            transaction.paymentMode ||
            "—";


        card.innerHTML = `

            <div class="transaction-record-left">

                <div class="transaction-icon
                    ${isIncome ? "income-icon" : "expense-icon"}">

                    <i class="fa-solid
                        ${isIncome
                            ? "fa-arrow-down"
                            : "fa-arrow-up"}">
                    </i>

                </div>

                <div class="transaction-details">

                    <strong>
                        ${escapeTransactionHTML(
                            categoryName
                        )}
                    </strong>

                    <span>
                        ${escapeTransactionHTML(
                            description
                        )}
                    </span>

                    <small>
                        ${formatTransactionDate(
                            transaction.date
                        )}
                        •
                        ${escapeTransactionHTML(
                            accountName
                        )}
                    </small>

                    <small>
                        ${escapeTransactionHTML(
                            paymentMode
                        )}
                        ${
                            note
                                ? " • " +
                                  escapeTransactionHTML(
                                      note
                                  )
                                : ""
                        }
                    </small>

                </div>

            </div>


            <div class="transaction-record-right">

                <strong class="${
                    isIncome
                        ? "income-amount"
                        : "expense-amount"
                }">

                    ${isIncome ? "+" : "-"}
                    ${formatTransactionMoney(
                        amount
                    )}

                </strong>


                <div class="transaction-actions">

                    <button
                        type="button"
                        class="transaction-edit-btn"
                        title="Edit"
                        onclick="editTransaction('${escapeAttribute(
                            transaction.id
                        )}')">

                        <i class="fa-solid fa-pen"></i>

                    </button>


                    <button
                        type="button"
                        class="transaction-delete-btn"
                        title="Delete"
                        onclick="openDeleteTransactionModal('${escapeAttribute(
                            transaction.id
                        )}')">

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </div>

            </div>

        `;

        return card;

    }


    /* =====================================================
       SUMMARY
    ===================================================== */

    function updateTransactionSummary(
        transactions
    ) {

        const incomeElement =
            document.getElementById(
                "transactionTotalIncome"
            );

        const expenseElement =
            document.getElementById(
                "transactionTotalExpense"
            );

        const balanceElement =
            document.getElementById(
                "transactionNetBalance"
            );


        let income = 0;

        let expense = 0;


        transactions.forEach(
            function (transaction) {

                const type =
                    normalizeTransactionType(
                        transaction.type
                    );

                const amount =
                    normalizeAmount(
                        transaction.amount
                    );

                if (
                    type === "income"
                ) {

                    income += amount;

                } else if (
                    type === "expense"
                ) {

                    expense += amount;

                }

            }
        );


        const balance =
            income - expense;


        if (incomeElement) {

            incomeElement.textContent =
                formatTransactionMoney(
                    income
                );

        }


        if (expenseElement) {

            expenseElement.textContent =
                formatTransactionMoney(
                    expense
                );

        }


        if (balanceElement) {

            balanceElement.textContent =
                formatTransactionMoney(
                    balance
                );

            balanceElement.classList.toggle(
                "negative",
                balance < 0
            );

        }

    }


    /* =====================================================
       EDIT TRANSACTION
    ===================================================== */

    window.editTransaction =
        function (transactionId) {

            const transaction =
                window.getTransactionById(
                    transactionId
                );

            if (!transaction) {

                alert(
                    "व्यवहार सापडला नाही."
                );

                return;

            }


            transactionToEdit =
                transaction;


            try {

                sessionStorage.setItem(
                    "rdkh_edit_transaction",
                    JSON.stringify(
                        transaction
                    )
                );

            } catch (error) {}


            if (
                normalizeTransactionType(
                    transaction.type
                ) === "income"
            ) {

                window.location.href =
                    "income.html?edit=" +
                    encodeURIComponent(
                        transaction.id
                    );

            } else {

                window.location.href =
                    "expense.html?edit=" +
                    encodeURIComponent(
                        transaction.id
                    );

            }

        };


    /* =====================================================
       DELETE MODAL
    ===================================================== */

    window.openDeleteTransactionModal =
        function (transactionId) {

            transactionToDelete =
                transactionId;


            const transaction =
                window.getTransactionById(
                    transactionId
                );


            if (!transaction) {

                return;

            }


            const modal =
                document.getElementById(
                    "deleteTransactionModal"
                );

            const message =
                document.getElementById(
                    "deleteTransactionMessage"
                );


            if (message) {

                const category =
                    transaction.categoryName ||
                    transaction.category ||
                    "व्यवहार";

                const amount =
                    formatTransactionMoney(
                        transaction.amount
                    );

                message.textContent =
                    `${category} - ${amount} हा व्यवहार delete करायचा आहे का?`;

            }


            if (modal) {

                modal.style.display =
                    "flex";

            }

        };


    /* =====================================================
       CLOSE DELETE MODAL
    ===================================================== */

    window.closeDeleteModal =
        function () {

            transactionToDelete =
                null;


            const modal =
                document.getElementById(
                    "deleteTransactionModal"
                );


            if (modal) {

                modal.style.display =
                    "none";

            }

        };


    /* =====================================================
       CONFIRM DELETE
    ===================================================== */

    window.confirmDeleteTransaction =
        function () {

            if (!transactionToDelete) {

                return;

            }


            const id =
                transactionToDelete;


            const success =
                window.deleteTransaction(
                    id
                );


            transactionToDelete =
                null;


            const modal =
                document.getElementById(
                    "deleteTransactionModal"
                );


            if (modal) {

                modal.style.display =
                    "none";

            }


            if (success) {

                transactionList =
                    window.getTransactions();

                applyTransactionFilters();


                if (
                    typeof window.updateDashboard ===
                    "function"
                ) {

                    try {
                        window.updateDashboard();
                    } catch (error) {}

                }


                alert(
                    "व्यवहार यशस्वीपणे delete केला."
                );

            }

        };


    /* =====================================================
       ACCOUNT NAME
    ===================================================== */

    function getAccountName(
        accountId
    ) {

        if (!accountId) {

            return "";

        }


        if (
            typeof window.getAccounts !==
            "function"
        ) {

            return "";

        }


        const accounts =
            window.getAccounts() || [];


        const account =
            accounts.find(
                function (account) {

                    return (
                        account.id ===
                        accountId
                    );

                }
            );


        return account
            ? account.name
            : "";

    }


    /* =====================================================
       MONEY FORMAT
    ===================================================== */

    function formatTransactionMoney(
        amount
    ) {

        const value =
            Number(amount) || 0;


        if (
            typeof window.formatMoney ===
            "function"
        ) {

            try {

                return window.formatMoney(
                    value
                );

            } catch (error) {}

        }


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


    /* =====================================================
       DATE FORMAT
    ===================================================== */

    function formatTransactionDate(
        date
    ) {

        if (!date) {

            return "तारीख उपलब्ध नाही";

        }


        const parts =
            String(date).split("-");


        if (
            parts.length === 3
        ) {

            return (
                parts[2] +
                "/" +
                parts[1] +
                "/" +
                parts[0]
            );

        }


        return date;

    }


    /* =====================================================
       HTML ESCAPE
    ===================================================== */

    function escapeTransactionHTML(
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


    function escapeAttribute(
        value
    ) {

        return String(
            value ?? ""
        )
            .replace(
                /\\/g,
                "\\\\"
            )
            .replace(
                /'/g,
                "\\'"
            )
            .replace(
                /"/g,
                "&quot;"
            );

    }


    /* =====================================================
       STORAGE EVENT
    ===================================================== */

    window.addEventListener(
        "storage",
        function (event) {

            if (
                event.key ===
                CENTRAL_STORAGE_KEY ||
                event.key ===
                "rdkh_transactions" ||
                event.key ===
                "rdkh_accounts"
            ) {

                loadTransactionAccounts();

                transactionList =
                    window.getTransactions();

                applyTransactionFilters();

            }

        }
    );


    /* =====================================================
       CUSTOM TRANSACTION EVENT
    ===================================================== */

    window.addEventListener(
        "rdkhTransactionsUpdated",
        function () {

            /*
             * Prevent unnecessary execution
             * if transaction page is not open.
             */

            const list =
                document.getElementById(
                    "transactionsList"
                );

            if (!list) {
                return;
            }


            loadTransactionAccounts();

            transactionList =
                window.getTransactions();

            applyTransactionFilters();

        }
    );


    /* =====================================================
       WINDOW FOCUS REFRESH
    ===================================================== */

    window.addEventListener(
        "focus",
        function () {

            const list =
                document.getElementById(
                    "transactionsList"
                );

            if (!list) {
                return;
            }


            loadTransactionAccounts();

            transactionList =
                window.getTransactions();

            applyTransactionFilters();

        }
    );


    /* =====================================================
       ESCAPE MODAL WITH ESC KEY
    ===================================================== */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape"
            ) {

                closeDeleteModal();

            }

        }
    );


    /* =====================================================
       CLOSE DELETE MODAL ON OUTSIDE CLICK
    ===================================================== */

    document.addEventListener(
        "click",
        function (event) {

            const modal =
                document.getElementById(
                    "deleteTransactionModal"
                );

            if (
                modal &&
                event.target === modal
            ) {

                closeDeleteModal();

            }

        }
    );


    /* =====================================================
       NAVIGATION
    ===================================================== */

    window.goHome =
        window.goHome ||
        function () {

            window.location.href =
                "index.html";

        };


    window.goToTransactions =
        window.goToTransactions ||
        function () {

            window.location.href =
                "transactions.html";

        };


    window.goToIncome =
        window.goToIncome ||
        function () {

            window.location.href =
                "income.html";

        };


    window.goToExpense =
        window.goToExpense ||
        function () {

            window.location.href =
                "expense.html";

        };


    window.goToBudget =
        window.goToBudget ||
        function () {

            window.location.href =
                "monthly-budget.html";

        };


    window.goToReports =
        window.goToReports ||
        function () {

            window.location.href =
                "reports.html";

        };


    window.goToSettings =
        window.goToSettings ||
        function () {

            window.location.href =
                "settings.html";

        };


    /* =====================================================
       PUBLIC HELPERS
    ===================================================== */

    window.RDKH_TRANSACTION_STORAGE_KEY =
        CENTRAL_STORAGE_KEY;


    window.RDKHNormalizeTransaction =
        normalizeTransaction;


    window.RDKHNormalizeTransactionType =
        normalizeTransactionType;


    window.RDKHGetTodayDate =
        getTodayDate;


    window.RDKHGetCurrentMonth =
        getCurrentMonth;


})();
