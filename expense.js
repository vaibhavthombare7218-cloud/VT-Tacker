/* =========================================================
   expense.js
   रोजचा जमा खर्च अहवाल

   EXPENSE MANAGEMENT

   CENTRAL TRANSACTION SYSTEM:
   ---------------------------------------------------------
   rdkh_transactions_v2

   CONNECTED WITH:
   ---------------------------------------------------------
   transactions.js
   accounts.js
   income.js
   monthly-budget.js
   reports.js
   app.js

   FEATURES:
   ---------------------------------------------------------
   ✅ 15 Main Expense Categories
   ✅ Expense + Budget Same Categories
   ✅ Daily / Monthly / Yearly Frequency
   ✅ Description
   ✅ Amount
   ✅ Payment Mode
   ✅ Account ID based tracking
   ✅ Central transaction storage
   ✅ Today / Monthly / Total Expense
   ✅ Category-wise summary
   ✅ Category transaction modal
   ✅ Edit Expense
   ✅ Delete Expense
   ✅ Note Counter
   ✅ Last Saved
   ✅ Legacy expense compatibility
   ========================================================= */


/* =========================================================
   EXPENSE CATEGORIES
========================================================= */

const EXPENSE_CATEGORIES = [

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


/* =========================================================
   LEGACY CATEGORY MAPPING
========================================================= */

const EXPENSE_CATEGORY_LEGACY_MAP = {

    "daily-grocery": "daily_grocery",

    "daily_grocery": "daily_grocery",

    "monthly-grocery": "monthly_grocery",

    "monthly_grocery": "monthly_grocery",

    "travel": "travel",

    "shopping": "shopping",

    "outside-food": "outside_food",

    "outside_food": "outside_food",

    "light-bill": "electricity",

    "electricity-bill": "electricity",

    "electricity": "electricity",

    "medicine": "medicine",

    "home-emi": "home_emi",

    "home_emi": "home_emi",

    "home-maintenance": "home_maintenance",

    "home_maintenance": "home_maintenance",

    "insurance": "insurance",

    "other-loan": "other_loan",

    "other_loan": "other_loan",

    "mobile": "mobile_bill",

    "mobile-bill": "mobile_bill",

    "mobile_bill": "mobile_bill",

    "other": "other_expense",

    "other-expense": "other_expense",

    "other_expense": "other_expense",

    "gas": "monthly_gas",

    "monthly-gas": "monthly_gas",

    "monthly_gas": "monthly_gas",

    "fish": "fish"

};


/* =========================================================
   EDIT VARIABLES
========================================================= */

let expenseEditMode = false;

let expenseEditTransactionId = null;


/* =========================================================
   EXPOSE CATEGORIES
========================================================= */

window.EXPENSE_CATEGORIES =
    EXPENSE_CATEGORIES;


/* =========================================================
   CATEGORY NORMALIZATION
========================================================= */

function normalizeExpenseCategory(
    category
) {

    if (!category) {

        return "";

    }

    const value =
        String(category)
            .trim()
            .toLowerCase();


    return (
        EXPENSE_CATEGORY_LEGACY_MAP[value] ||
        value
    );

}


/* =========================================================
   CATEGORY NAME
========================================================= */

function getCategoryName(
    categoryId
) {

    const normalized =
        normalizeExpenseCategory(
            categoryId
        );


    const category =
        EXPENSE_CATEGORIES.find(
            function (item) {

                return (
                    item.id ===
                    normalized
                );

            }
        );


    return category
        ? category.name
        : (
            categoryId ||
            "इतर खर्च"
        );

}


/* =========================================================
   CATEGORY OBJECT
========================================================= */

function getExpenseCategory(
    categoryId
) {

    const normalized =
        normalizeExpenseCategory(
            categoryId
        );


    return (
        EXPENSE_CATEGORIES.find(
            function (item) {

                return (
                    item.id ===
                    normalized
                );

            }
        ) || null
    );

}


/* =========================================================
   PUBLIC CATEGORY HELPERS
========================================================= */

window.normalizeExpenseCategory =
    normalizeExpenseCategory;

window.getCategoryName =
    getCategoryName;

window.getExpenseCategory =
    getExpenseCategory;


/* =========================================================
   LEGACY GET EXPENSES
   Compatibility only

   Central transactions are now the
   primary source.
========================================================= */

function getExpenses() {

    if (
        typeof window.getTransactions ===
        "function"
    ) {

        return window
            .getTransactions()
            .filter(
                function (transaction) {

                    return (
                        normalizeTransactionTypeForExpense(
                            transaction.type
                        ) === "expense"
                    );

                }
            )
            .map(
                function (transaction) {

                    return {

                        ...transaction,

                        category:
                            normalizeExpenseCategory(
                                transaction.categoryId ||
                                transaction.category
                            ),

                        categoryId:
                            normalizeExpenseCategory(
                                transaction.categoryId ||
                                transaction.category
                            ),

                        categoryName:
                            transaction.categoryName ||
                            getCategoryName(
                                transaction.categoryId ||
                                transaction.category
                            ),

                        account:
                            transaction.accountName ||
                            transaction.account ||
                            ""

                    };

                }
            );

    }


    /*
     * Legacy fallback if transactions.js
     * is not loaded.
     */

    const raw =
        localStorage.getItem(
            "expenses"
        );


    if (!raw) {

        return [];

    }


    try {

        const parsed =
            JSON.parse(raw);

        return Array.isArray(parsed)
            ? parsed
            : [];

    } catch (error) {

        return [];

    }

}


/* =========================================================
   LEGACY SAVE EXPENSES
   Kept for compatibility with old code.

   Central system remains primary.
========================================================= */

function saveExpenses(
    expenses
) {

    /*
     * Do NOT make old expenses storage
     * the primary source.
     *
     * Save a compatibility copy only.
     */

    try {

        localStorage.setItem(
            "expenses",
            JSON.stringify(
                expenses
            )
        );

    } catch (error) {

        console.error(
            "Legacy expense save error:",
            error
        );

    }

}


/* =========================================================
   TRANSACTION TYPE HELPER
========================================================= */

function normalizeTransactionTypeForExpense(
    type
) {

    if (
        typeof window.RDKHNormalizeTransactionType ===
        "function"
    ) {

        return window.RDKHNormalizeTransactionType(
            type
        );

    }


    const value =
        String(
            type || ""
        )
            .trim()
            .toLowerCase();


    if (
        value === "expense" ||
        value === "खर्च" ||
        value === "debit" ||
        value === "dr"
    ) {

        return "expense";

    }


    if (
        value === "income" ||
        value === "जमा" ||
        value === "credit" ||
        value === "cr"
    ) {

        return "income";

    }


    return value;

}


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeExpensePage();

    }
);


/* =========================================================
   INITIALIZE EXPENSE PAGE
========================================================= */

function initializeExpensePage() {

    /*
     * Initialize accounts if available.
     */

    if (
        typeof window.initializeAccounts ===
        "function"
    ) {

        try {

            window.initializeAccounts();

        } catch (error) {

            console.error(
                "Account initialization error:",
                error
            );

        }

    }


    setDefaultExpenseDate();

    populateExpenseAccounts();

    setupExpenseForm();

    setupExpenseNoteCounter();

    updateExpenseSummary();

    renderExpenseCategorySummary();

    renderExpenseList();

    checkExpenseEditMode();

}


/* =========================================================
   DEFAULT DATE
========================================================= */

function setDefaultExpenseDate() {

    const input =
        document.getElementById(
            "expenseDate"
        );


    if (
        input &&
        !input.value
    ) {

        if (
            typeof window.RDKHGetTodayDate ===
            "function"
        ) {

            input.value =
                window.RDKHGetTodayDate();

        } else {

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

            input.value =
                `${year}-${month}-${day}`;

        }

    }

}


/* =========================================================
   POPULATE ACCOUNTS
========================================================= */

function populateExpenseAccounts() {

    const select =
        document.getElementById(
            "expenseAccount"
        );


    if (!select) {

        return;

    }


    const currentValue =
        select.value;


    select.innerHTML = `
        <option value="">
            खाते निवडा
        </option>
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
        currentValue &&
        accounts.some(
            function (account) {

                return (
                    account.id ===
                    currentValue
                );

            }
        )
    ) {

        select.value =
            currentValue;

    }

}


/* =========================================================
   FORM SETUP
========================================================= */

function setupExpenseForm() {

    const form =
        document.getElementById(
            "expenseForm"
        );


    if (!form) {

        return;

    }


    if (
        form.dataset.expenseInitialized ===
        "true"
    ) {

        return;

    }


    form.dataset.expenseInitialized =
        "true";


    form.addEventListener(
        "submit",
        saveNewExpense
    );

}


/* =========================================================
   SAVE / UPDATE EXPENSE
========================================================= */

function saveNewExpense(
    event
) {

    event.preventDefault();


    /*
     * Check central system.
     */

    if (
        typeof window.getTransactions !==
            "function" ||
        typeof window.saveTransactions !==
            "function"
    ) {

        alert(
            "Transaction system उपलब्ध नाही. कृपया transactions.js तपासा."
        );

        return;

    }


    /* -----------------------------------------------------
       GET FORM VALUES
    ----------------------------------------------------- */

    const dateInput =
        document.getElementById(
            "expenseDate"
        );

    const amountInput =
        document.getElementById(
            "expenseAmount"
        );

    const categoryInput =
        document.getElementById(
            "expenseCategory"
        );

    const descriptionInput =
        document.getElementById(
            "expenseDescription"
        );

    const paymentModeInput =
        document.getElementById(
            "expensePaymentMode"
        );

    const accountInput =
        document.getElementById(
            "expenseAccount"
        );

    const noteInput =
        document.getElementById(
            "expenseNote"
        );


    const date =
        dateInput
            ? dateInput.value
            : "";


    const amount =
        amountInput
            ? Number(
                amountInput.value
              )
            : 0;


    const rawCategory =
        categoryInput
            ? categoryInput.value
            : "";


    const category =
        normalizeExpenseCategory(
            rawCategory
        );


    const description =
        descriptionInput
            ? descriptionInput.value.trim()
            : "";


    const paymentMode =
        paymentModeInput
            ? paymentModeInput.value
            : "";


    const accountId =
        accountInput
            ? accountInput.value
            : "";


    const note =
        noteInput
            ? noteInput.value.trim()
            : "";


    /* -----------------------------------------------------
       VALIDATION
    ----------------------------------------------------- */

    if (!date) {

        alert(
            "कृपया तारीख निवडा."
        );

        if (dateInput) {
            dateInput.focus();
        }

        return;

    }


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        alert(
            "कृपया योग्य खर्चाची रक्कम भरा."
        );

        if (amountInput) {
            amountInput.focus();
        }

        return;

    }


    if (!category) {

        alert(
            "कृपया खर्चाचा प्रकार निवडा."
        );

        if (categoryInput) {
            categoryInput.focus();
        }

        return;

    }


    if (!description) {

        alert(
            "कृपया खर्चाचे वर्णन भरा."
        );

        if (descriptionInput) {
            descriptionInput.focus();
        }

        return;

    }


    if (!accountId) {

        alert(
            "कृपया कोणत्या खात्यातून खर्च झाला ते निवडा."
        );

        if (accountInput) {
            accountInput.focus();
        }

        return;

    }


    /* -----------------------------------------------------
       ACCOUNT NAME
    ----------------------------------------------------- */

    let accountName = "";


    if (
        typeof window.getAccounts ===
        "function"
    ) {

        const accounts =
            window.getAccounts() || [];


        const account =
            accounts.find(
                function (item) {

                    return (
                        item.id ===
                        accountId
                    );

                }
            );


        if (account) {

            accountName =
                account.name;

        }

    }


    /* -----------------------------------------------------
       CATEGORY NAME
    ----------------------------------------------------- */

    const categoryName =
        getCategoryName(
            category
        );


    /* -----------------------------------------------------
       GET CENTRAL TRANSACTIONS
    ----------------------------------------------------- */

    const transactions =
        window.getTransactions();


    /* =====================================================
       EDIT EXISTING EXPENSE
    ===================================================== */

    if (
        expenseEditMode &&
        expenseEditTransactionId
    ) {

        const index =
            transactions.findIndex(
                function (transaction) {

                    return (
                        String(
                            transaction.id
                        ) ===
                        String(
                            expenseEditTransactionId
                        )
                    );

                }
            );


        if (index === -1) {

            alert(
                "Edit करण्यासाठी खर्चाचा व्यवहार सापडला नाही."
            );

            exitExpenseEditMode();

            return;

        }


        const oldTransaction =
            transactions[index];


        const oldType =
            normalizeTransactionTypeForExpense(
                oldTransaction.type
            );


        if (
            oldType !== "expense"
        ) {

            alert(
                "हा खर्चाचा व्यवहार नाही."
            );

            return;

        }


        transactions[index] = {

            ...oldTransaction,

            type:
                "expense",

            date,

            category,

            categoryId:
                category,

            categoryName,

            description,

            amount,

            accountId,

            accountName,

            account:
                accountName,

            paymentMode,

            note,

            updatedAt:
                new Date().toISOString()

        };


        window.saveTransactions(
            transactions
        );


        showLastExpenseSaved(
            transactions[index],
            true
        );


        alert(
            "खर्चाचा व्यवहार यशस्वीपणे अपडेट केला."
        );


        exitExpenseEditMode(
            false
        );


        updateExpenseSummary();

        renderExpenseCategorySummary();

        renderExpenseList();


        if (
            typeof window.updateDashboard ===
            "function"
        ) {

            try {

                window.updateDashboard();

            } catch (error) {}

        }


        return;

    }


    /* =====================================================
       NEW EXPENSE
    ===================================================== */

    const expenseId =
        "EXP-" +
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase();


    const newTransaction = {

        id:
            expenseId,

        type:
            "expense",

        date,

        category,

        categoryId:
            category,

        categoryName,

        description,

        amount,

        accountId,

        accountName,

        /*
         * Compatibility field.
         */

        account:
            accountName,

        paymentMode,

        note,

        createdAt:
            new Date().toISOString(),

        updatedAt:
            ""

    };


    transactions.push(
        newTransaction
    );


    /*
     * CENTRAL SAVE
     */

    window.saveTransactions(
        transactions
    );


    /*
     * Compatibility copy for old
     * code/data.
     *
     * Important:
     * This copy is not used for
     * calculations.
     */

    try {

        const legacyExpenses =
            transactions
                .filter(
                    function (transaction) {

                        return (
                            normalizeTransactionTypeForExpense(
                                transaction.type
                            ) === "expense"
                        );

                    }
                )
                .map(
                    function (transaction) {

                        return {

                            id:
                                transaction.id,

                            date:
                                transaction.date,

                            category:
                                transaction.categoryId,

                            categoryId:
                                transaction.categoryId,

                            categoryName:
                                transaction.categoryName,

                            amount:
                                transaction.amount,

                            description:
                                transaction.description,

                            paymentMode:
                                transaction.paymentMode,

                            accountId:
                                transaction.accountId,

                            accountName:
                                transaction.accountName,

                            account:
                                transaction.accountName,

                            note:
                                transaction.note,

                            createdAt:
                                transaction.createdAt

                        };

                    }
                );


        localStorage.setItem(
            "expenses",
            JSON.stringify(
                legacyExpenses
            )
        );

    } catch (error) {

        console.error(
            "Legacy expense compatibility save error:",
            error
        );

    }


    /* -----------------------------------------------------
       LAST SAVED
    ----------------------------------------------------- */

    showLastExpenseSaved(
        newTransaction,
        false
    );


    /* -----------------------------------------------------
       SUCCESS
    ----------------------------------------------------- */

    alert(
        "खर्च यशस्वीपणे नोंदवला."
    );


    /* -----------------------------------------------------
       RESET
    ----------------------------------------------------- */

    resetExpenseForm();


    /* -----------------------------------------------------
       REFRESH
    ----------------------------------------------------- */

    updateExpenseSummary();

    renderExpenseCategorySummary();

    renderExpenseList();


    if (
        typeof window.updateDashboard ===
        "function"
    ) {

        try {

            window.updateDashboard();

        } catch (error) {}

    }

}


/* =========================================================
   LAST SAVED
========================================================= */

function showLastExpenseSaved(
    transaction,
    isUpdate
) {

    const section =
        document.getElementById(
            "lastExpenseSaved"
        );


    const text =
        document.getElementById(
            "lastExpenseSavedText"
        );


    /*
     * Your current HTML may use
     * different ID. Try compatibility.
     */

    const finalSection =
        section ||
        document.getElementById(
            "lastSaved"
        );


    const finalText =
        text ||
        document.getElementById(
            "lastSavedText"
        );


    if (!finalSection) {

        return;

    }


    const categoryName =
        transaction.categoryName ||
        getCategoryName(
            transaction.categoryId ||
            transaction.category
        );


    const amount =
        formatExpenseMoney(
            transaction.amount
        );


    const accountName =
        transaction.accountName ||
        transaction.account ||
        "";


    if (finalText) {

        finalText.textContent =
            `${categoryName} • ${amount} • ${accountName}`;

    }


    finalSection.style.display =
        "flex";

}


/* =========================================================
   RESET FORM
========================================================= */

function resetExpenseForm() {

    const form =
        document.getElementById(
            "expenseForm"
        );


    if (form) {

        form.reset();

    }


    setDefaultExpenseDate();


    /*
     * Reset payment mode.
     */

    const paymentMode =
        document.getElementById(
            "expensePaymentMode"
        );


    if (paymentMode) {

        paymentMode.value =
            "Cash";

    }


    /*
     * Reset note counter.
     */

    updateExpenseNoteCounter();


    /*
     * Hide last saved.
     */

    const lastSaved =
        document.getElementById(
            "lastExpenseSaved"
        ) ||
        document.getElementById(
            "lastSaved"
        );


    if (lastSaved) {

        lastSaved.style.display =
            "none";

    }

}


/* =========================================================
   NOTE COUNTER
========================================================= */

function setupExpenseNoteCounter() {

    const note =
        document.getElementById(
            "expenseNote"
        );


    if (!note) {

        return;

    }


    note.addEventListener(
        "input",
        updateExpenseNoteCounter
    );


    updateExpenseNoteCounter();

}


function updateExpenseNoteCounter() {

    const note =
        document.getElementById(
            "expenseNote"
        );


    const counter =
        document.getElementById(
            "expenseNoteCounter"
        );


    if (!note || !counter) {

        return;

    }


    counter.textContent =
        `${note.value.length} / 300`;

}


/* =========================================================
   TODAY EXPENSE
========================================================= */

function getTodayExpenseFromCentral() {

    if (
        typeof window.getTodayExpense ===
        "function"
    ) {

        return Number(
            window.getTodayExpense()
        ) || 0;

    }


    const today =
        getExpenseTodayDate();


    return getExpenses()
        .filter(
            function (expense) {

                return (
                    expense.date ===
                    today
                );

            }
        )
        .reduce(
            function (sum, expense) {

                return (
                    sum +
                    (
                        Number(
                            expense.amount
                        ) || 0
                    )
                );

            },
            0
        );

}


/* =========================================================
   MONTH EXPENSE
========================================================= */

function getMonthExpenseFromCentral() {

    if (
        typeof window.getMonthExpense ===
        "function"
    ) {

        return Number(
            window.getMonthExpense()
        ) || 0;

    }


    const month =
        getExpenseCurrentMonth();


    return getExpenses()
        .filter(
            function (expense) {

                return (
                    expense.date &&
                    expense.date.substring(
                        0,
                        7
                    ) === month
                );

            }
        )
        .reduce(
            function (sum, expense) {

                return (
                    sum +
                    (
                        Number(
                            expense.amount
                        ) || 0
                    )
                );

            },
            0
        );

}


/* =========================================================
   TOTAL EXPENSE
========================================================= */

function getTotalExpenseFromCentral() {

    if (
        typeof window.getTotalExpense ===
        "function"
    ) {

        return Number(
            window.getTotalExpense()
        ) || 0;

    }


    return getExpenses()
        .reduce(
            function (sum, expense) {

                return (
                    sum +
                    (
                        Number(
                            expense.amount
                        ) || 0
                    )
                );

            },
            0
        );

}


/* =========================================================
   SUMMARY
========================================================= */

function updateExpenseSummary() {

    const today =
        getTodayExpenseFromCentral();


    const month =
        getMonthExpenseFromCentral();


    const total =
        getTotalExpenseFromCentral();


    const todayElement =
        document.getElementById(
            "todayExpense"
        );


    const monthElement =
        document.getElementById(
            "monthExpense"
        );


    const totalElement =
        document.getElementById(
            "totalExpense"
        );


    if (todayElement) {

        todayElement.textContent =
            formatExpenseMoney(
                today
            );

    }


    if (monthElement) {

        monthElement.textContent =
            formatExpenseMoney(
                month
            );

    }


    if (totalElement) {

        totalElement.textContent =
            formatExpenseMoney(
                total
            );

    }

}


/* =========================================================
   CATEGORY SUMMARY
========================================================= */

function renderExpenseCategorySummary() {

    /*
     * Try all likely containers used by
     * existing expense.html.
     */

    const container =
        document.getElementById(
            "expenseCategorySummary"
        ) ||
        document.getElementById(
            "categorySummary"
        );


    if (!container) {

        return;

    }


    const expenses =
        getExpenses();


    const currentMonth =
        getExpenseCurrentMonth();


    container.innerHTML = "";


    EXPENSE_CATEGORIES.forEach(
        function (category) {

            const total =
                expenses
                    .filter(
                        function (expense) {

                            return (
                                normalizeExpenseCategory(
                                    expense.categoryId ||
                                    expense.category
                                ) ===
                                category.id
                            );

                        }
                    )
                    .filter(
                        function (expense) {

                            return (
                                expense.date &&
                                expense.date
                                    .substring(
                                        0,
                                        7
                                    ) ===
                                currentMonth
                            );

                        }
                    )
                    .reduce(
                        function (
                            sum,
                            expense
                        ) {

                            return (
                                sum +
                                (
                                    Number(
                                        expense.amount
                                    ) || 0
                                )
                            );

                        },
                        0
                    );


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "expense-category-card";


            card.innerHTML = `

                <div class="expense-category-icon">

                    ${category.icon}

                </div>

                <div class="expense-category-info">

                    <strong>
                        ${escapeExpenseHTML(
                            category.name
                        )}
                    </strong>

                    <small>
                        ${
                            getFrequencyText(
                                category.frequency
                            )
                        }
                    </small>

                </div>

                <strong class="expense-category-total">

                    ${formatExpenseMoney(
                        total
                    )}

                </strong>

            `;


            card.addEventListener(
                "click",
                function () {

                    openCategoryTransactions(
                        category.id,
                        currentMonth
                    );

                }
            );


            container.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   FREQUENCY TEXT
========================================================= */

function getFrequencyText(
    frequency
) {

    if (
        frequency === "daily"
    ) {

        return "दररोज";

    }


    if (
        frequency === "monthly"
    ) {

        return "मासिक";

    }


    if (
        frequency === "yearly"
    ) {

        return "वार्षिक";

    }


    return "";

}


/* =========================================================
   CATEGORY TRANSACTION MODAL
========================================================= */

function openCategoryTransactions(
    categoryId,
    month
) {

    const normalizedCategory =
        normalizeExpenseCategory(
            categoryId
        );


    const targetMonth =
        month ||
        getExpenseCurrentMonth();


    const transactions =
        getExpenses()
            .filter(
                function (expense) {

                    return (
                        normalizeExpenseCategory(
                            expense.categoryId ||
                            expense.category
                        ) ===
                        normalizedCategory
                    );

                }
            )
            .filter(
                function (expense) {

                    return (
                        expense.date &&
                        expense.date.substring(
                            0,
                            7
                        ) ===
                        targetMonth
                    );

                }
            )
            .sort(
                function (a, b) {

                    return (
                        String(
                            b.date || ""
                        )
                        .localeCompare(
                            String(
                                a.date || ""
                            )
                        )
                    );

                }
            );


    const modal =
        document.getElementById(
            "categoryTransactionModal"
        );


    const title =
        document.getElementById(
            "categoryTransactionTitle"
        );


    const monthElement =
        document.getElementById(
            "categoryTransactionMonth"
        );


    const totalElement =
        document.getElementById(
            "categoryTransactionTotal"
        );


    const countElement =
        document.getElementById(
            "categoryTransactionCount"
        );


    const body =
        document.getElementById(
            "categoryTransactionBody"
        );


    if (!modal) {

        return;

    }


    const category =
        getExpenseCategory(
            normalizedCategory
        );


    if (title) {

        title.textContent =
            category
                ? category.name
                : "खर्च व्यवहार";

    }


    if (monthElement) {

        monthElement.textContent =
            formatExpenseMonth(
                targetMonth
            );

    }


    const total =
        transactions.reduce(
            function (sum, transaction) {

                return (
                    sum +
                    (
                        Number(
                            transaction.amount
                        ) || 0
                    )
                );

            },
            0
        );


    if (totalElement) {

        totalElement.textContent =
            formatExpenseMoney(
                total
            );

    }


    if (countElement) {

        countElement.textContent =
            transactions.length;

    }


    if (body) {

        body.innerHTML = "";


        if (
            transactions.length ===
            0
        ) {

            body.innerHTML = `
                <tr>
                    <td colspan="6"
                        style="text-align:center;">
                        या महिन्यात या category मध्ये
                        कोणताही खर्च नाही.
                    </td>
                </tr>
            `;

        } else {

            transactions.forEach(
                function (transaction) {

                    const row =
                        document.createElement(
                            "tr"
                        );


                    const accountName =
                        transaction.accountName ||
                        transaction.account ||
                        "";


                    row.innerHTML = `

                        <td>
                            ${formatExpenseDate(
                                transaction.date
                            )}
                        </td>

                        <td>
                            ${escapeExpenseHTML(
                                transaction.description ||
                                "-"
                            )}
                        </td>

                        <td>
                            ${escapeExpenseHTML(
                                accountName ||
                                "-"
                            )}
                        </td>

                        <td>
                            ${escapeExpenseHTML(
                                transaction.paymentMode ||
                                "-"
                            )}
                        </td>

                        <td>
                            ${formatExpenseMoney(
                                transaction.amount
                            )}
                        </td>

                        <td>

                            <button
                                type="button"
                                class="category-delete-btn"
                                onclick="deleteCategoryTransaction('${escapeExpenseAttribute(
                                    transaction.id
                                )}')">

                                <i class="fa-solid fa-trash"></i>

                            </button>

                        </td>

                    `;


                    body.appendChild(
                        row
                    );

                }
            );

        }

    }


    modal.style.display =
        "flex";

}


/* =========================================================
   CLOSE CATEGORY MODAL
========================================================= */

function closeCategoryTransactions() {

    const modal =
        document.getElementById(
            "categoryTransactionModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }

}


window.closeCategoryTransactions =
    closeCategoryTransactions;


/* =========================================================
   DELETE CATEGORY TRANSACTION
========================================================= */

function deleteCategoryTransaction(
    transactionId
) {

    if (
        !transactionId
    ) {

        return;

    }


    const transaction =
        typeof window.getTransactionById ===
        "function"
            ? window.getTransactionById(
                transactionId
            )
            : null;


    if (!transaction) {

        alert(
            "व्यवहार सापडला नाही."
        );

        return;

    }


    const confirmed =
        confirm(
            "हा खर्च व्यवहार delete करायचा आहे का?"
        );


    if (!confirmed) {

        return;

    }


    if (
        typeof window.deleteTransaction ===
        "function"
    ) {

        const success =
            window.deleteTransaction(
                transactionId
            );


        if (success) {

            alert(
                "खर्च व्यवहार delete केला."
            );


            closeCategoryTransactions();

            updateExpenseSummary();

            renderExpenseCategorySummary();

            renderExpenseList();


            if (
                typeof window.updateDashboard ===
                "function"
            ) {

                try {

                    window.updateDashboard();

                } catch (error) {}

            }

        }

        return;

    }


    /*
     * Fallback
     */

    const transactions =
        getExpenses();


    const updated =
        transactions.filter(
            function (item) {

                return (
                    String(item.id) !==
                    String(transactionId)
                );

            }
        );


    saveExpenses(
        updated
    );


    closeCategoryTransactions();

    updateExpenseSummary();

    renderExpenseCategorySummary();

    renderExpenseList();

}


window.deleteCategoryTransaction =
    deleteCategoryTransaction;


/* =========================================================
   EXPENSE LIST
========================================================= */

function renderExpenseList() {

    /*
     * Existing expense.html may or may not
     * have a transaction list.
     */

    const list =
        document.getElementById(
            "expenseList"
        ) ||
        document.getElementById(
            "expensesList"
        );


    const empty =
        document.getElementById(
            "emptyExpenseState"
        );


    if (!list) {

        return;

    }


    list
        .querySelectorAll(
            ".expense-record"
        )
        .forEach(
            function (item) {

                item.remove();

            }
        );


    const expenses =
        getExpenses()
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


    if (
        expenses.length ===
        0
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


    expenses.forEach(
        function (expense) {

            const record =
                document.createElement(
                    "div"
                );


            record.className =
                "expense-record";


            const categoryName =
                expense.categoryName ||
                getCategoryName(
                    expense.categoryId ||
                    expense.category
                );


            const accountName =
                expense.accountName ||
                expense.account ||
                "";


            record.innerHTML = `

                <div class="expense-record-left">

                    <div class="expense-record-icon">

                        ${
                            (
                                getExpenseCategory(
                                    expense.categoryId ||
                                    expense.category
                                ) || {}
                            ).icon ||
                            "💸"
                        }

                    </div>

                    <div>

                        <strong>
                            ${escapeExpenseHTML(
                                categoryName
                            )}
                        </strong>

                        <span>
                            ${escapeExpenseHTML(
                                expense.description ||
                                "-"
                            )}
                        </span>

                        <small>
                            ${formatExpenseDate(
                                expense.date
                            )}
                            •
                            ${escapeExpenseHTML(
                                accountName
                            )}
                        </small>

                    </div>

                </div>


                <div class="expense-record-right">

                    <strong>
                        -${formatExpenseMoney(
                            expense.amount
                        )}
                    </strong>


                    <div class="expense-record-actions">

                        <button
                            type="button"
                            onclick="editExpense('${escapeExpenseAttribute(
                                expense.id
                            )}')">

                            <i class="fa-solid fa-pen"></i>

                        </button>


                        <button
                            type="button"
                            onclick="deleteExpense('${escapeExpenseAttribute(
                                expense.id
                            )}')">

                            <i class="fa-solid fa-trash"></i>

                        </button>

                    </div>

                </div>

            `;


            list.appendChild(
                record
            );

        }
    );

}


/* =========================================================
   EDIT EXPENSE
========================================================= */

function editExpense(
    transactionId
) {

    if (
        typeof window.getTransactionById !==
        "function"
    ) {

        alert(
            "Transaction system उपलब्ध नाही."
        );

        return;

    }


    const transaction =
        window.getTransactionById(
            transactionId
        );


    if (!transaction) {

        alert(
            "खर्च व्यवहार सापडला नाही."
        );

        return;

    }


    if (
        normalizeTransactionTypeForExpense(
            transaction.type
        ) !== "expense"
    ) {

        alert(
            "हा खर्चाचा व्यवहार नाही."
        );

        return;

    }


    try {

        sessionStorage.setItem(
            "rdkh_edit_transaction",
            JSON.stringify(
                transaction
            )
        );

    } catch (error) {}


    window.location.href =
        "expense.html?edit=" +
        encodeURIComponent(
            transaction.id
        );

}


window.editExpense =
    editExpense;


/* =========================================================
   DELETE EXPENSE
========================================================= */

function deleteExpense(
    transactionId
) {

    const transaction =
        typeof window.getTransactionById ===
        "function"
            ? window.getTransactionById(
                transactionId
            )
            : null;


    if (!transaction) {

        alert(
            "खर्च व्यवहार सापडला नाही."
        );

        return;

    }


    const confirmed =
        confirm(
            "हा खर्च व्यवहार delete करायचा आहे का?"
        );


    if (!confirmed) {

        return;

    }


    if (
        typeof window.deleteTransaction ===
        "function"
    ) {

        const success =
            window.deleteTransaction(
                transactionId
            );


        if (success) {

            alert(
                "खर्च व्यवहार delete केला."
            );


            updateExpenseSummary();

            renderExpenseCategorySummary();

            renderExpenseList();


            if (
                typeof window.updateDashboard ===
                "function"
            ) {

                try {

                    window.updateDashboard();

                } catch (error) {}

            }

        }

        return;

    }

}


window.deleteExpense =
    deleteExpense;


/* =========================================================
   CHECK EDIT MODE
========================================================= */

function checkExpenseEditMode() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const editId =
        params.get("edit");


    if (!editId) {

        return;

    }


    let transaction = null;


    if (
        typeof window.getTransactionById ===
        "function"
    ) {

        transaction =
            window.getTransactionById(
                editId
            );

    }


    /*
     * Fallback to sessionStorage.
     */

    if (!transaction) {

        try {

            const stored =
                sessionStorage.getItem(
                    "rdkh_edit_transaction"
                );


            if (stored) {

                const parsed =
                    JSON.parse(
                        stored
                    );


                if (
                    parsed &&
                    String(
                        parsed.id
                    ) ===
                    String(editId)
                ) {

                    transaction =
                        parsed;

                }

            }

        } catch (error) {}

    }


    if (!transaction) {

        alert(
            "Edit करण्यासाठी खर्च व्यवहार सापडला नाही."
        );

        return;

    }


    if (
        normalizeTransactionTypeForExpense(
            transaction.type
        ) !== "expense"
    ) {

        alert(
            "हा खर्चाचा व्यवहार नाही."
        );

        return;

    }


    expenseEditMode =
        true;


    expenseEditTransactionId =
        transaction.id;


    populateExpenseEditForm(
        transaction
    );

}


/* =========================================================
   POPULATE EXPENSE EDIT FORM
========================================================= */

function populateExpenseEditForm(
    transaction
) {

    const dateInput =
        document.getElementById(
            "expenseDate"
        );


    const amountInput =
        document.getElementById(
            "expenseAmount"
        );


    const categoryInput =
        document.getElementById(
            "expenseCategory"
        );


    const descriptionInput =
        document.getElementById(
            "expenseDescription"
        );


    const accountInput =
        document.getElementById(
            "expenseAccount"
        );


    const paymentModeInput =
        document.getElementById(
            "expensePaymentMode"
        );


    const noteInput =
        document.getElementById(
            "expenseNote"
        );


    if (dateInput) {

        dateInput.value =
            transaction.date || "";

    }


    if (amountInput) {

        amountInput.value =
            transaction.amount || "";

    }


    if (categoryInput) {

        categoryInput.value =
            normalizeExpenseCategory(
                transaction.categoryId ||
                transaction.category
            );

    }


    if (descriptionInput) {

        descriptionInput.value =
            transaction.description ||
            "";

    }


    if (accountInput) {

        accountInput.value =
            transaction.accountId ||
            "";

    }


    if (paymentModeInput) {

        paymentModeInput.value =
            transaction.paymentMode ||
            "Cash";

    }


    if (noteInput) {

        noteInput.value =
            transaction.note ||
            "";

    }


    updateExpenseNoteCounter();


    /*
     * Change submit button.
     */

    const form =
        document.getElementById(
            "expenseForm"
        );


    if (form) {

        const button =
            form.querySelector(
                'button[type="submit"]'
            );


        if (button) {

            button.innerHTML = `
                <i class="fa-solid fa-pen-to-square"></i>
                खर्च अपडेट करा
            `;

        }

    }


    /*
     * Change heading if present.
     */

    const heading =
        document.querySelector(
            ".page-intro h2"
        );


    if (heading) {

        heading.textContent =
            "खर्च व्यवहार अपडेट करा";

    }


    const intro =
        document.querySelector(
            ".page-intro p"
        );


    if (intro) {

        intro.textContent =
            "खर्च व्यवहारातील माहिती बदला.";

    }

}


/* =========================================================
   EXIT EDIT MODE
========================================================= */

function exitExpenseEditMode(
    clearUrl = true
) {

    expenseEditMode =
        false;


    expenseEditTransactionId =
        null;


    try {

        sessionStorage.removeItem(
            "rdkh_edit_transaction"
        );

    } catch (error) {}


    if (
        clearUrl &&
        window.history &&
        window.history.replaceState
    ) {

        try {

            window.history.replaceState(
                {},
                document.title,
                "expense.html"
            );

        } catch (error) {}

    }


    const heading =
        document.querySelector(
            ".page-intro h2"
        );


    if (heading) {

        heading.textContent =
            "नवीन खर्च नोंद";

    }


    const intro =
        document.querySelector(
            ".page-intro p"
        );


    if (intro) {

        intro.textContent =
            "केलेला खर्च येथे नोंदवा.";

    }


    const form =
        document.getElementById(
            "expenseForm"
        );


    if (form) {

        const button =
            form.querySelector(
                'button[type="submit"]'
            );


        if (button) {

            button.innerHTML = `
                <i class="fa-solid fa-check"></i>
                खर्च नोंदवा
            `;

        }

    }

}


/* =========================================================
   EXPENSE DATE HELPERS
========================================================= */

function getExpenseTodayDate() {

    if (
        typeof window.RDKHGetTodayDate ===
        "function"
    ) {

        return window.RDKHGetTodayDate();

    }


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


function getExpenseCurrentMonth() {

    if (
        typeof window.RDKHGetCurrentMonth ===
        "function"
    ) {

        return window.RDKHGetCurrentMonth();

    }


    return getExpenseTodayDate()
        .substring(
            0,
            7
        );

}


/* =========================================================
   FORMAT MONEY
========================================================= */

function formatExpenseMoney(
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


/* =========================================================
   FORMAT DATE
========================================================= */

function formatExpenseDate(
    date
) {

    if (!date) {

        return "-";

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


/* =========================================================
   FORMAT MONTH
========================================================= */

function formatExpenseMonth(
    month
) {

    if (!month) {

        return "";

    }


    const parts =
        String(month).split("-");


    if (
        parts.length !== 2
    ) {

        return month;

    }


    const year =
        Number(
            parts[0]
        );


    const monthNumber =
        Number(
            parts[1]
        );


    const names = [
        "जानेवारी",
        "फेब्रुवारी",
        "मार्च",
        "एप्रिल",
        "मे",
        "जून",
        "जुलै",
        "ऑगस्ट",
        "सप्टेंबर",
        "ऑक्टोबर",
        "नोव्हेंबर",
        "डिसेंबर"
    ];


    return (
        names[monthNumber - 1] +
        " " +
        year
    );

}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeExpenseHTML(
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


function escapeExpenseAttribute(
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


/* =========================================================
   MONTHLY BUDGET COMPATIBILITY
========================================================= */

function getActualExpense(
    categoryId,
    month
) {

    if (
        typeof window.getCategoryExpenseTotal ===
        "function"
    ) {

        return window.getCategoryExpenseTotal(
            normalizeExpenseCategory(
                categoryId
            ),
            month
        );

    }


    const normalizedCategory =
        normalizeExpenseCategory(
            categoryId
        );


    return getExpenses()
        .filter(
            function (expense) {

                const expenseCategory =
                    normalizeExpenseCategory(
                        expense.categoryId ||
                        expense.category
                    );


                if (
                    expenseCategory !==
                    normalizedCategory
                ) {

                    return false;

                }


                if (
                    month &&
                    (
                        !expense.date ||
                        expense.date.substring(
                            0,
                            7
                        ) !== month
                    )
                ) {

                    return false;

                }


                return true;

            }
        )
        .reduce(
            function (sum, expense) {

                return (
                    sum +
                    (
                        Number(
                            expense.amount
                        ) || 0
                    )
                );

            },
            0
        );

}


window.getActualExpense =
    getActualExpense;


/* =========================================================
   REFRESH EXPENSE UI
========================================================= */

function refreshExpenseUI() {

    updateExpenseSummary();

    renderExpenseCategorySummary();

    renderExpenseList();


    if (
        typeof window.refreshMonthlyBudget ===
        "function"
    ) {

        try {

            window.refreshMonthlyBudget();

        } catch (error) {}

    }


    if (
        typeof window.updateDashboard ===
        "function"
    ) {

        try {

            window.updateDashboard();

        } catch (error) {}

    }

}


window.refreshExpenseUI =
    refreshExpenseUI;


/* =========================================================
   CENTRAL TRANSACTION EVENT
========================================================= */

window.addEventListener(
    "rdkhTransactionsUpdated",
    function () {

        populateExpenseAccounts();

        refreshExpenseUI();

    }
);


/* =========================================================
   STORAGE EVENT
========================================================= */

window.addEventListener(
    "storage",
    function (event) {

        if (
            event.key ===
                "rdkh_transactions_v2" ||
            event.key ===
                "rdkh_transactions" ||
            event.key ===
                "rdkh_accounts"
        ) {

            populateExpenseAccounts();

            refreshExpenseUI();

        }

    }
);


/* =========================================================
   WINDOW FOCUS
========================================================= */

window.addEventListener(
    "focus",
    function () {

        populateExpenseAccounts();

        refreshExpenseUI();

    }
);


/* =========================================================
   MODAL ESCAPE
========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key ===
            "Escape"
        ) {

            closeCategoryTransactions();

        }

    }
);


/* =========================================================
   MODAL OUTSIDE CLICK
========================================================= */

document.addEventListener(
    "click",
    function (event) {

        const modal =
            document.getElementById(
                "categoryTransactionModal"
            );


        if (
            modal &&
            event.target ===
            modal
        ) {

            closeCategoryTransactions();

        }

    }
);


/* =========================================================
   NAVIGATION
========================================================= */

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


/* =========================================================
   GLOBAL EXPORTS
========================================================= */

window.getExpenses =
    getExpenses;

window.saveExpenses =
    saveExpenses;

window.saveNewExpense =
    saveNewExpense;

window.resetExpenseForm =
    resetExpenseForm;

window.updateExpenseSummary =
    updateExpenseSummary;

window.renderExpenseCategorySummary =
    renderExpenseCategorySummary;

window.renderExpenseList =
    renderExpenseList;

window.openCategoryTransactions =
    openCategoryTransactions;

window.editExpense =
    editExpense;

window.deleteExpense =
    deleteExpense;
