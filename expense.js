/* =========================================================
   expense.js

   रोजचा जमा खर्च अहवाल
   EXPENSE MANAGEMENT

   CONNECTED WITH:
   - app.js
   - accounts.js
   - transactions.js
   - monthly-budget.js

   FEATURES:
   ---------------------------------------------------------
   ✅ Expense Save
   ✅ Account Balance Check
   ✅ Monthly Budget Category Integration
   ✅ Dynamic Budget Categories
   ✅ Custom Budget Categories
   ✅ Category Budget
   ✅ Category Actual Expense
   ✅ Category Remaining Budget
   ✅ Category Used %
   ✅ Budget Alert %
   ✅ Budget Over Warning
   ✅ Existing Transaction System Preserved
========================================================= */


/* =========================================================
   STORAGE KEYS
========================================================= */

const EXPENSE_MONTHLY_BUDGET_KEY =
    "rdkh_monthly_budgets";

const EXPENSE_BUDGET_CATEGORY_KEY =
    "rdkh_budget_categories";



/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeAccounts();

        setDefaultExpenseDate();

        loadExpenseAccounts();

        loadExpenseCategories();

        updateExpenseSummary();

        setupExpenseNoteCounter();

        setupExpenseForm();

        setupExpenseBudgetEvents();

        updateSelectedCategoryBudget();

    }
);



/* =========================================================
   DEFAULT DATE
========================================================= */

function setDefaultExpenseDate() {

    const dateInput =
        document.getElementById(
            "expenseDate"
        );


    if (!dateInput) {

        return;

    }


    dateInput.value =
        getTodayString();

}



/* =========================================================
   LOAD ACCOUNTS
========================================================= */

function loadExpenseAccounts() {

    const select =
        document.getElementById(
            "expenseAccount"
        );


    if (!select) {

        return;

    }


    const accounts =
        getAccounts();


    select.innerHTML = `

        <option value="">
            खाते निवडा
        </option>

    `;


    accounts.forEach(
        account => {

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

}



/* =========================================================
   LOAD BUDGET CATEGORIES
========================================================= */

function loadExpenseCategories() {

    const select =
        document.getElementById(
            "expenseCategory"
        );


    if (!select) {

        return;

    }


    const categories =
        getExpenseBudgetCategories();


    const previousValue =
        select.value;


    select.innerHTML = `

        <option value="">
            खर्चाचा प्रकार निवडा
        </option>

    `;


    categories.forEach(
        category => {

            const option =
                document.createElement(
                    "option"
                );


            /*
               IMPORTANT:

               Value = category.name

               monthly-budget.js मधील
               getCategoryActualExpense()
               transaction.category ला
               category.name सोबत match करते.
            */

            option.value =
                category.name;


            option.textContent =
                category.name;


            /*
               Category ID store करण्यासाठी
               extra data attribute.
            */

            option.dataset.categoryId =
                category.id;


            option.dataset.icon =
                category.icon || "";


            select.appendChild(
                option
            );

        }
    );


    /*
       Previous category available असल्यास
       ती पुन्हा select करा.
    */

    if (
        previousValue &&
        Array.from(
            select.options
        ).some(
            option =>
                option.value ===
                previousValue
        )
    ) {

        select.value =
            previousValue;

    }


    updateSelectedCategoryBudget();

}



/* =========================================================
   GET BUDGET CATEGORIES
========================================================= */

function getExpenseBudgetCategories() {

    try {

        const stored =
            localStorage.getItem(
                EXPENSE_BUDGET_CATEGORY_KEY
            );


        if (!stored) {

            return [];

        }


        const categories =
            JSON.parse(
                stored
            );


        return Array.isArray(
            categories
        )
            ? categories
            : [];

    }

    catch {

        return [];

    }

}



/* =========================================================
   GET MONTHLY BUDGET DATA
========================================================= */

function getExpenseMonthlyBudgets() {

    try {

        const stored =
            localStorage.getItem(
                EXPENSE_MONTHLY_BUDGET_KEY
            );


        if (!stored) {

            return {};

        }


        const data =
            JSON.parse(
                stored
            );


        if (
            data &&
            typeof data === "object" &&
            !Array.isArray(data)
        ) {

            return data;

        }

    }

    catch {

        /* Ignore invalid storage */

    }


    return {};

}



/* =========================================================
   GET CURRENT MONTH
========================================================= */

function getExpenseCurrentMonth() {

    const dateInput =
        document.getElementById(
            "expenseDate"
        );


    let dateValue =
        dateInput?.value;


    if (!dateValue) {

        dateValue =
            getTodayString();

    }


    /*
       YYYY-MM-DD → YYYY-MM
    */

    return String(
        dateValue
    ).substring(
        0,
        7
    );

}



/* =========================================================
   GET SELECTED CATEGORY OBJECT
========================================================= */

function getSelectedExpenseCategory() {

    const select =
        document.getElementById(
            "expenseCategory"
        );


    if (!select) {

        return null;

    }


    const categoryName =
        select.value;


    if (!categoryName) {

        return null;

    }


    const categories =
        getExpenseBudgetCategories();


    return (
        categories.find(
            category =>
                String(
                    category.name
                )
                    .trim()
                    .toLowerCase() ===
                String(
                    categoryName
                )
                    .trim()
                    .toLowerCase()
        ) ||
        null
    );

}



/* =========================================================
   GET CATEGORY BUDGET
========================================================= */

function getExpenseCategoryBudget(
    categoryId,
    month
) {

    if (
        !categoryId ||
        !month
    ) {

        return 0;

    }


    const budgets =
        getExpenseMonthlyBudgets();


    const monthBudget =
        budgets[month];


    if (
        !monthBudget ||
        !monthBudget.categories
    ) {

        return 0;

    }


    return Number(
        monthBudget.categories[
            categoryId
        ]
    ) || 0;

}



/* =========================================================
   GET MONTHLY ACTUAL EXPENSE
========================================================= */

function getExpenseMonthActual(
    month
) {

    const transactions =
        getTransactions();


    if (
        !Array.isArray(
            transactions
        )
    ) {

        return 0;

    }


    let total =
        0;


    transactions.forEach(
        transaction => {

            if (
                transaction.type !==
                "expense"
            ) {

                return;

            }


            const transactionDate =
                normalizeExpenseDate(
                    transaction.date
                );


            if (
                transactionDate.startsWith(
                    month
                )
            ) {

                total +=
                    Number(
                        transaction.amount
                    ) || 0;

            }

        }
    );


    return total;

}



/* =========================================================
   GET CATEGORY ACTUAL EXPENSE
========================================================= */

function getExpenseCategoryActual(
    categoryName,
    month
) {

    if (
        !categoryName ||
        !month
    ) {

        return 0;

    }


    const transactions =
        getTransactions();


    if (
        !Array.isArray(
            transactions
        )
    ) {

        return 0;

    }


    let total =
        0;


    const requiredCategory =
        String(
            categoryName
        )
            .trim()
            .toLowerCase();


    transactions.forEach(
        transaction => {

            if (
                transaction.type !==
                "expense"
            ) {

                return;

            }


            const transactionDate =
                normalizeExpenseDate(
                    transaction.date
                );


            if (
                !transactionDate.startsWith(
                    month
                )
            ) {

                return;

            }


            const transactionCategory =
                String(
                    transaction.category ||
                    ""
                )
                    .trim()
                    .toLowerCase();


            if (
                transactionCategory ===
                requiredCategory
            ) {

                total +=
                    Number(
                        transaction.amount
                    ) || 0;

            }

        }
    );


    return total;

}



/* =========================================================
   UPDATE SELECTED CATEGORY BUDGET
========================================================= */

function updateSelectedCategoryBudget() {

    const section =
        document.getElementById(
            "selectedCategoryBudget"
        );


    const categoryBudgetAmount =
        document.getElementById(
            "categoryBudgetAmount"
        );


    const categoryActualExpense =
        document.getElementById(
            "categoryActualExpense"
        );


    const categoryRemainingBudget =
        document.getElementById(
            "categoryRemainingBudget"
        );


    const categoryBudgetUsed =
        document.getElementById(
            "categoryBudgetUsed"
        );


    const info =
        document.getElementById(
            "categoryBudgetInfo"
        );


    const category =
        getSelectedExpenseCategory();


    if (!category) {

        if (section) {

            section.style.display =
                "none";

        }


        if (info) {

            info.textContent =
                "या महिन्याच्या Budget नुसार Category निवडा.";

        }


        return;

    }


    const month =
        getExpenseCurrentMonth();


    const budget =
        getExpenseCategoryBudget(
            category.id,
            month
        );


    const actual =
        getExpenseCategoryActual(
            category.name,
            month
        );


    const remaining =
        budget -
        actual;


    let usedPercent =
        0;


    if (
        budget > 0
    ) {

        usedPercent =
            (
                actual /
                budget
            ) * 100;

    }


    usedPercent =
        Math.round(
            usedPercent * 100
        ) / 100;


    if (section) {

        section.style.display =
            "grid";

    }


    if (categoryBudgetAmount) {

        categoryBudgetAmount.textContent =
            formatExpenseMoney(
                budget
            );

    }


    if (categoryActualExpense) {

        categoryActualExpense.textContent =
            formatExpenseMoney(
                actual
            );

    }


    if (categoryRemainingBudget) {

        categoryRemainingBudget.textContent =
            formatExpenseMoney(
                remaining
            );


        categoryRemainingBudget.style.color =
            remaining < 0
                ? "var(--expense)"
                : "var(--income)";

    }


    if (categoryBudgetUsed) {

        categoryBudgetUsed.textContent =
            usedPercent + "%";

    }


    if (info) {

        if (
            budget <= 0
        ) {

            info.textContent =
                "या Category साठी या महिन्याचे Budget अजून सेट केलेले नाही.";

        }

        else if (
            remaining < 0
        ) {

            info.textContent =
                "⚠️ या Category चे Budget exceed झाले आहे.";

        }

        else {

            info.textContent =
                "या Category साठी Budget उपलब्ध आहे.";

        }

    }

}



/* =========================================================
   BUDGET EVENTS
========================================================= */

function setupExpenseBudgetEvents() {

    const category =
        document.getElementById(
            "expenseCategory"
        );


    const amount =
        document.getElementById(
            "expenseAmount"
        );


    const date =
        document.getElementById(
            "expenseDate"
        );


    if (category) {

        category.addEventListener(
            "change",
            function () {

                updateSelectedCategoryBudget();

            }
        );

    }


    if (amount) {

        amount.addEventListener(
            "input",
            function () {

                updateSelectedCategoryBudget();

            }
        );

    }


    if (date) {

        date.addEventListener(
            "change",
            function () {

                updateSelectedCategoryBudget();

            }
        );

    }

}



/* =========================================================
   EXPENSE SUMMARY
========================================================= */

function updateExpenseSummary() {

    const today =
        document.getElementById(
            "todayExpense"
        );


    const month =
        document.getElementById(
            "monthExpense"
        );


    const total =
        document.getElementById(
            "totalExpense"
        );


    if (today) {

        today.textContent =
            formatExpenseMoney(
                getTodayExpense()
            );

    }


    if (month) {

        month.textContent =
            formatExpenseMoney(
                getMonthExpense()
            );

    }


    if (total) {

        total.textContent =
            formatExpenseMoney(
                getTotalExpense()
            );

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


    form.addEventListener(
        "submit",
        saveExpense
    );

}



/* =========================================================
   SAVE EXPENSE
========================================================= */

function saveExpense(event) {

    event.preventDefault();


    /* =====================================================
       GET VALUES
    ===================================================== */

    const date =
        document.getElementById(
            "expenseDate"
        ).value;


    const amount =
        Number(
            document.getElementById(
                "expenseAmount"
            ).value
        );


    const category =
        document.getElementById(
            "expenseCategory"
        ).value;


    const accountId =
        document.getElementById(
            "expenseAccount"
        ).value;


    const paymentMode =
        document.getElementById(
            "expensePaymentMode"
        ).value;


    const note =
        document.getElementById(
            "expenseNote"
        ).value.trim();



    /* =====================================================
       VALIDATION
    ===================================================== */

    if (!date) {

        alert(
            "कृपया तारीख निवडा."
        );

        return;

    }


    if (
        !amount ||
        amount <= 0
    ) {

        alert(
            "कृपया योग्य खर्चाची रक्कम भरा."
        );


        document
            .getElementById(
                "expenseAmount"
            )
            .focus();


        return;

    }


    if (!category) {

        alert(
            "कृपया खर्चाचा प्रकार निवडा."
        );

        return;

    }


    if (!accountId) {

        alert(
            "कृपया कोणत्या खात्यातून खर्च झाला ते निवडा."
        );

        return;

    }



    /* =====================================================
       CHECK ACCOUNT BALANCE
    ===================================================== */

    const accountBalance =
        getAccountBalance(
            accountId
        );


    if (
        amount >
        accountBalance
    ) {

        const account =
            getAccounts().find(
                item =>
                    item.id ===
                    accountId
            );


        const accountName =
            account
                ? account.name
                : "निवडलेले खाते";


        const confirmNegative =
            confirm(

                accountName +
                " मध्ये उपलब्ध शिल्लक " +
                formatExpenseMoney(
                    accountBalance
                ) +
                " आहे.\n\n" +
                "तुम्हाला तरीही हा खर्च नोंदवायचा आहे का?"

            );


        if (!confirmNegative) {

            return;

        }

    }



    /* =====================================================
       BUDGET CHECK
    ===================================================== */

    const selectedCategory =
        getSelectedExpenseCategory();


    const month =
        String(
            date
        ).substring(
            0,
            7
        );


    let categoryBudget =
        0;


    let categoryActual =
        0;


    let categoryRemaining =
        0;


    let alertPercent =
        80;


    if (
        selectedCategory
    ) {

        categoryBudget =
            getExpenseCategoryBudget(
                selectedCategory.id,
                month
            );


        categoryActual =
            getExpenseCategoryActual(
                selectedCategory.name,
                month
            );


        categoryRemaining =
            categoryBudget -
            categoryActual;


        const budgets =
            getExpenseMonthlyBudgets();


        if (
            budgets[month]
        ) {

            alertPercent =
                Number(
                    budgets[month].alertPercent
                ) || 80;

        }

    }



    /* =====================================================
       CHECK CATEGORY BUDGET
    ===================================================== */

    const newCategoryActual =
        categoryActual +
        amount;


    if (
        categoryBudget > 0 &&
        newCategoryActual >
        categoryBudget
    ) {

        const overAmount =
            newCategoryActual -
            categoryBudget;


        const proceed =
            confirm(

                "⚠️ Category Budget Warning\n\n" +

                "Category: " +
                category +
                "\n\n" +

                "Budget: " +
                formatExpenseMoney(
                    categoryBudget
                ) +
                "\n" +

                "आधीचा खर्च: " +
                formatExpenseMoney(
                    categoryActual
                ) +
                "\n" +

                "नवीन खर्च: " +
                formatExpenseMoney(
                    amount
                ) +
                "\n\n" +

                "Budget पेक्षा " +
                formatExpenseMoney(
                    overAmount
                ) +
                " जास्त होईल.\n\n" +

                "तरीही खर्च नोंदवायचा आहे का?"

            );


        if (!proceed) {

            return;

        }

    }



    /* =====================================================
       ALERT PERCENT CHECK
    ===================================================== */

    if (
        categoryBudget > 0
    ) {

        const newUsedPercent =
            (
                newCategoryActual /
                categoryBudget
            ) * 100;


        /*
           Existing actual alert आधीच crossed
           असेल तर प्रत्येक save वेळी warning
           दाखवू नका.

           फक्त नवीन expense मुळे
           alert threshold cross होत असेल
           तर warning.
        */

        const oldUsedPercent =
            (
                categoryActual /
                categoryBudget
            ) * 100;


        if (
            oldUsedPercent <
                alertPercent &&
            newUsedPercent >=
                alertPercent &&
            newUsedPercent <=
                100
        ) {

            const proceed =
                confirm(

                    "🔔 Budget Alert\n\n" +

                    "Category: " +
                    category +
                    "\n\n" +

                    "Budget चा " +
                    Math.round(
                        newUsedPercent *
                        100
                    ) / 100 +
                    "% वापर होईल.\n\n" +

                    "Alert limit: " +
                    alertPercent +
                    "%\n\n" +

                    "खर्च नोंदवायचा आहे का?"

                );


            if (!proceed) {

                return;

            }

        }

    }



    /* =====================================================
       CREATE TRANSACTION
    ===================================================== */

    const transaction = {

        id:
            generateExpenseId(),

        type:
            "expense",

        date:
            date,

        amount:
            amount,

        category:
            category,

        accountId:
            accountId,

        paymentMode:
            paymentMode,

        note:
            note,

        createdAt:
            new Date().toISOString()

    };



    /* =====================================================
       GET TRANSACTIONS
    ===================================================== */

    const transactions =
        getTransactions();


    if (
        !Array.isArray(
            transactions
        )
    ) {

        alert(
            "Transactions data उपलब्ध नाही."
        );

        return;

    }



    /* =====================================================
       ADD TRANSACTION
    ===================================================== */

    transactions.push(
        transaction
    );



    /* =====================================================
       SAVE
    ===================================================== */

    const saved =
        saveTransactions(
            transactions
        );


    if (!saved) {

        alert(
            "खर्च save करताना समस्या आली."
        );

        return;

    }



    /* =====================================================
       SUCCESS
    ===================================================== */

    showLastExpenseSaved(
        transaction
    );


    alert(
        "खर्च यशस्वीपणे नोंदवला आहे."
    );


    resetExpenseForm();


    updateExpenseSummary();


    updateSelectedCategoryBudget();



    /* =====================================================
       DASHBOARD UPDATE
    ===================================================== */

    if (
        typeof updateDashboard ===
        "function"
    ) {

        updateDashboard();

    }



    /* =====================================================
       BUDGET UPDATE EVENT
    ===================================================== */

    window.dispatchEvent(
        new Event(
            "rdkhTransactionsUpdated"
        )
    );

}



/* =========================================================
   EXPENSE ID
========================================================= */

function generateExpenseId() {

    return (
        "EXP-" +
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 8)
    );

}



/* =========================================================
   RESET
========================================================= */

function resetExpenseForm() {

    const form =
        document.getElementById(
            "expenseForm"
        );


    if (!form) {

        return;

    }


    form.reset();


    setDefaultExpenseDate();


    const counter =
        document.getElementById(
            "expenseNoteCounter"
        );


    if (counter) {

        counter.textContent =
            "0 / 300";

    }


    updateSelectedCategoryBudget();

}



/* =========================================================
   LAST SAVED
========================================================= */

function showLastExpenseSaved(
    transaction
) {

    const box =
        document.getElementById(
            "lastExpenseSaved"
        );


    const text =
        document.getElementById(
            "lastExpenseSavedText"
        );


    if (!box || !text) {

        return;

    }


    const account =
        getAccounts().find(
            item =>
                item.id ===
                transaction.accountId
        );


    text.textContent =
        formatExpenseMoney(
            transaction.amount
        ) +
        " • " +
        transaction.category +
        " • " +
        (
            account
                ? account.name
                : ""
        );


    box.style.display =
        "flex";

}



/* =========================================================
   NOTE COUNTER
========================================================= */

function setupExpenseNoteCounter() {

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


    note.addEventListener(
        "input",
        function () {

            counter.textContent =
                note.value.length +
                " / 300";

        }
    );

}



/* =========================================================
   NORMALIZE DATE
========================================================= */

function normalizeExpenseDate(
    date
) {

    if (!date) {

        return "";

    }


    const value =
        String(
            date
        );


    /*
       YYYY-MM-DD
    */

    if (
        /^\d{4}-\d{2}-\d{2}$/
            .test(
                value
            )
    ) {

        return value;

    }


    const parsed =
        new Date(
            date
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
   FORMAT MONEY
========================================================= */

function formatExpenseMoney(
    amount
) {

    const value =
        Number(
            amount
        ) || 0;


    if (
        typeof formatMoney ===
        "function"
    ) {

        return formatMoney(
            value
        );

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
   QUICK ADD
========================================================= */

function openQuickAdd() {

    const menu =
        document.getElementById(
            "quickAddMenu"
        );


    if (!menu) {

        return;

    }


    if (
        menu.style.display ===
        "none" ||
        !menu.style.display
    ) {

        menu.style.display =
            "block";

    }

    else {

        menu.style.display =
            "none";

    }

}



/* =========================================================
   STORAGE SYNC
========================================================= */

window.addEventListener(
    "storage",
    function () {

        loadExpenseAccounts();

        loadExpenseCategories();

        updateExpenseSummary();

        updateSelectedCategoryBudget();

    }
);



/* =========================================================
   TRANSACTION UPDATE EVENT
========================================================= */

window.addEventListener(
    "rdkhTransactionsUpdated",
    function () {

        loadExpenseCategories();

        updateExpenseSummary();

        updateSelectedCategoryBudget();

    }
);
