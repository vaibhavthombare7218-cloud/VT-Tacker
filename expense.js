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
   ✅ Expense Entry
   ✅ Budget Category Integration
   ✅ Default + Custom Budget Categories
   ✅ Account Selection
   ✅ Account Balance Check
   ✅ Payment Mode
   ✅ Note
   ✅ Today Expense
   ✅ Monthly Expense
   ✅ Total Expense
   ✅ Last Saved Expense
   ✅ Transaction Storage
   ✅ Budget Auto Sync
   ========================================================= */


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeExpensePage();

    }
);



/* =========================================================
   MAIN INITIALIZATION
========================================================= */

function initializeExpensePage() {

    /*
       Accounts initialize करा
    */

    if (
        typeof initializeAccounts ===
        "function"
    ) {

        initializeAccounts();

    }


    /*
       Default date
    */

    setDefaultExpenseDate();


    /*
       Budget categories load करा
    */

    loadExpenseCategories();


    /*
       Accounts load करा
    */

    loadExpenseAccounts();


    /*
       Summary
    */

    updateExpenseSummary();


    /*
       Note counter
    */

    setupExpenseNoteCounter();


    /*
       Form
    */

    setupExpenseForm();


    /*
       Payment mode
    */

    setupExpensePaymentMode();


    /*
       Last saved expense
       session मध्ये असेल तर दाखवा
    */

    loadLastExpenseSaved();

}



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


    if (!dateInput.value) {

        dateInput.value =
            getTodayString();

    }

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


    /*
       Monthly Budget page मधील
       categories वापरण्याचा प्रयत्न.
    */

    let categories = [];


    if (
        typeof getBudgetCategories ===
        "function"
    ) {

        categories =
            getBudgetCategories();

    }

    else {

        /*
           Fallback categories
           जर monthly-budget.js load नसेल.
        */

        categories = [

            {
                id: "daily-grocery",
                name: "दररोजचा किराणा खर्च",
                icon: "fa-solid fa-basket-shopping"
            },

            {
                id: "monthly-grocery",
                name: "महिन्याचा किराणा खर्च",
                icon: "fa-solid fa-cart-shopping"
            },

            {
                id: "travel",
                name: "प्रवास",
                icon: "fa-solid fa-car"
            },

            {
                id: "shopping",
                name: "खरेदी",
                icon: "fa-solid fa-bag-shopping"
            },

            {
                id: "light-bill",
                name: "लाईट बिल",
                icon: "fa-solid fa-lightbulb"
            },

            {
                id: "medicine",
                name: "औषधे",
                icon: "fa-solid fa-pills"
            },

            {
                id: "mobile",
                name: "मोबाईल",
                icon: "fa-solid fa-mobile-screen-button"
            },

            {
                id: "home-emi",
                name: "घरचा EMI",
                icon: "fa-solid fa-house"
            },

            {
                id: "home-maintenance",
                name: "घरचा मेंटेनन्स",
                icon: "fa-solid fa-screwdriver-wrench"
            },

            {
                id: "other-loan",
                name: "इतर लोन",
                icon: "fa-solid fa-money-check-dollar"
            },

            {
                id: "other",
                name: "Other",
                icon: "fa-solid fa-box"
            }

        ];

    }



    /*
       Current selected value जतन करा
    */

    const previousValue =
        select.value;


    select.innerHTML = "";


    /*
       Default option
    */

    const defaultOption =
        document.createElement(
            "option"
        );


    defaultOption.value =
        "";


    defaultOption.textContent =
        "खर्चाचा प्रकार निवडा";


    select.appendChild(
        defaultOption
    );



    /*
       Categories add करा
    */

    categories.forEach(
        category => {

            if (!category) {

                return;

            }


            const option =
                document.createElement(
                    "option"
                );


            /*
               IMPORTANT:
               Transaction मध्ये category म्हणून
               category.name save होईल.

               त्यामुळे Monthly Budget मधील
               getCategoryActualExpense()
               शी exact match होईल.
            */

            option.value =
                category.name;


            option.textContent =
                getExpenseCategoryDisplayName(
                    category
                );


            option.dataset.categoryId =
                category.id;


            select.appendChild(
                option
            );

        }
    );



    /*
       जुनी selection असल्यास restore करा
    */

    if (
        previousValue &&
        [...select.options].some(
            option =>
                option.value ===
                previousValue
        )
    ) {

        select.value =
            previousValue;

    }

}



/* =========================================================
   CATEGORY DISPLAY NAME
========================================================= */

function getExpenseCategoryDisplayName(
    category
) {

    const name =
        String(
            category?.name || ""
        );


    const icon =
        getCategoryEmoji(
            category?.id,
            category?.icon
        );


    if (icon) {

        return (
            icon +
            " " +
            name
        );

    }


    return name;

}



/* =========================================================
   CATEGORY EMOJI
========================================================= */

function getCategoryEmoji(
    categoryId,
    icon
) {

    const map = {

        "daily-grocery":
            "🧺",

        "monthly-grocery":
            "🛒",

        "travel":
            "🚗",

        "shopping":
            "🛍️",

        "light-bill":
            "💡",

        "medicine":
            "💊",

        "mobile":
            "📱",

        "home-emi":
            "🏠",

        "home-maintenance":
            "🔧",

        "other-loan":
            "💰",

        "other":
            "📦"

    };


    if (
        map[categoryId]
    ) {

        return map[categoryId];

    }


    /*
       Custom categories साठी
       generic tag icon
    */

    return "🏷️";

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


    let accounts = [];


    if (
        typeof getAccounts ===
        "function"
    ) {

        accounts =
            getAccounts();

    }


    select.innerHTML = `

        <option value="">
            खाते निवडा
        </option>

    `;


    if (
        !Array.isArray(accounts)
    ) {

        return;

    }


    accounts.forEach(
        account => {

            if (!account) {

                return;

            }


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                account.id;


            option.textContent =
                getAccountDisplayName(
                    account
                );


            select.appendChild(
                option
            );

        }
    );

}



/* =========================================================
   ACCOUNT DISPLAY NAME
========================================================= */

function getAccountDisplayName(
    account
) {

    const name =
        String(
            account.name || ""
        );


    /*
       Balance display करायचा असल्यास
       available balance दाखवा.
    */

    let balanceText = "";


    if (
        typeof getAccountBalance ===
        "function"
    ) {

        const balance =
            Number(
                getAccountBalance(
                    account.id
                )
            ) || 0;


        balanceText =
            " • " +
            formatExpenseMoney(
                balance
            );

    }


    return (
        name +
        balanceText
    );

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



    const todayAmount =
        getSafeTodayExpense();


    const monthAmount =
        getSafeMonthExpense();


    const totalAmount =
        getSafeTotalExpense();



    if (today) {

        today.textContent =
            formatExpenseMoney(
                todayAmount
            );

    }


    if (month) {

        month.textContent =
            formatExpenseMoney(
                monthAmount
            );

    }


    if (total) {

        total.textContent =
            formatExpenseMoney(
                totalAmount
            );

    }

}



/* =========================================================
   SAFE TODAY EXPENSE
========================================================= */

function getSafeTodayExpense() {

    if (
        typeof getTodayExpense ===
        "function"
    ) {

        return Number(
            getTodayExpense()
        ) || 0;

    }


    const today =
        getTodayString();


    return getExpensesByDate(
        today
    );

}



/* =========================================================
   SAFE MONTH EXPENSE
========================================================= */

function getSafeMonthExpense() {

    if (
        typeof getMonthExpense ===
        "function"
    ) {

        return Number(
            getMonthExpense()
        ) || 0;

    }


    const today =
        getTodayString();


    const month =
        today.substring(
            0,
            7
        );


    return getExpensesByMonth(
        month
    );

}



/* =========================================================
   SAFE TOTAL EXPENSE
========================================================= */

function getSafeTotalExpense() {

    if (
        typeof getTotalExpense ===
        "function"
    ) {

        return Number(
            getTotalExpense()
        ) || 0;

    }


    const transactions =
        getAllExpenseTransactions();


    return transactions.reduce(
        (
            total,
            transaction
        ) => {

            return (
                total +
                (
                    Number(
                        transaction.amount
                    ) || 0
                )
            );

        },
        0
    );

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


    /*
       Duplicate listener टाळण्यासाठी
    */

    if (
        form.dataset.expenseReady ===
        "true"
    ) {

        return;

    }


    form.dataset.expenseReady =
        "true";


    form.addEventListener(
        "submit",
        saveExpense
    );

}



/* =========================================================
   SAVE EXPENSE
========================================================= */

function saveExpense(
    event
) {

    event.preventDefault();



    /* =====================================================
       GET VALUES
    ===================================================== */

    const date =
        document.getElementById(
            "expenseDate"
        )?.value || "";


    const amount =
        Number(
            document.getElementById(
                "expenseAmount"
            )?.value
        );


    const category =
        document.getElementById(
            "expenseCategory"
        )?.value.trim() || "";


    const accountId =
        document.getElementById(
            "expenseAccount"
        )?.value || "";


    const paymentMode =
        document.getElementById(
            "expensePaymentMode"
        )?.value || "Cash";


    const note =
        document.getElementById(
            "expenseNote"
        )?.value.trim() || "";



    /* =====================================================
       VALIDATION
    ===================================================== */

    if (!date) {

        alert(
            "कृपया तारीख निवडा."
        );

        document
            .getElementById(
                "expenseDate"
            )
            ?.focus();

        return;

    }


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        alert(
            "कृपया योग्य खर्चाची रक्कम भरा."
        );

        document
            .getElementById(
                "expenseAmount"
            )
            ?.focus();

        return;

    }


    if (!category) {

        alert(
            "कृपया खर्चाचा प्रकार निवडा."
        );

        document
            .getElementById(
                "expenseCategory"
            )
            ?.focus();

        return;

    }


    if (!accountId) {

        alert(
            "कृपया कोणत्या खात्यातून खर्च झाला ते निवडा."
        );

        document
            .getElementById(
                "expenseAccount"
            )
            ?.focus();

        return;

    }



    /* =====================================================
       CHECK ACCOUNT
    ===================================================== */

    const accounts =
        typeof getAccounts ===
        "function"
            ? getAccounts()
            : [];


    const account =
        accounts.find(
            item =>
                String(
                    item.id
                ) ===
                String(
                    accountId
                )
        );


    if (!account) {

        alert(
            "निवडलेले खाते सापडले नाही."
        );

        loadExpenseAccounts();

        return;

    }



    /* =====================================================
       CHECK ACCOUNT BALANCE
    ===================================================== */

    let accountBalance =
        0;


    if (
        typeof getAccountBalance ===
        "function"
    ) {

        accountBalance =
            Number(
                getAccountBalance(
                    accountId
                )
            ) || 0;

    }


    if (
        amount >
        accountBalance
    ) {

        const confirmNegative =
            confirm(

                account.name +
                " मध्ये उपलब्ध शिल्लक " +
                formatExpenseMoney(
                    accountBalance
                ) +
                " आहे.\n\n" +

                "या खर्चानंतर खात्याची शिल्लक negative होऊ शकते.\n\n" +

                "तुम्हाला तरीही हा खर्च नोंदवायचा आहे का?"

            );


        if (!confirmNegative) {

            return;

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

        /*
           IMPORTANT:
           Category name save करतो.

           Monthly Budget मध्ये
           actual expense याच नावावर
           calculate होईल.
        */

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

    let transactions =
        [];


    if (
        typeof getTransactions ===
        "function"
    ) {

        const existing =
            getTransactions();


        transactions =
            Array.isArray(
                existing
            )
                ? existing
                : [];

    }

    else {

        transactions =
            getExpenseTransactionsFallback();

    }



    /* =====================================================
       ADD
    ===================================================== */

    transactions.push(
        transaction
    );



    /* =====================================================
       SAVE
    ===================================================== */

    let saved =
        false;


    if (
        typeof saveTransactions ===
        "function"
    ) {

        saved =
            saveTransactions(
                transactions
            );

    }

    else {

        saved =
            saveExpenseTransactionsFallback(
                transactions
            );

    }


    if (!saved) {

        alert(
            "खर्च save करताना समस्या आली."
        );

        return;

    }



    /* =====================================================
       LAST SAVED
    ===================================================== */

    saveLastExpenseSession(
        transaction
    );


    showLastExpenseSaved(
        transaction
    );



    /* =====================================================
       RESET
    ===================================================== */

    resetExpenseForm();



    /* =====================================================
       UPDATE
    ===================================================== */

    updateExpenseSummary();


    loadExpenseAccounts();


    /*
       Dashboard असल्यास update
    */

    if (
        typeof updateDashboard ===
        "function"
    ) {

        updateDashboard();

    }



    /*
       Transaction page update
    */

    dispatchTransactionsUpdated();



    /*
       Success message
    */

    showExpenseSuccess();



    /*
       Alert शेवटी
       जेणेकरून data आधी save होईल.
    */

    alert(
        "खर्च यशस्वीपणे नोंदवला आहे."
    );

}



/* =========================================================
   GENERATE EXPENSE ID
========================================================= */

function generateExpenseId() {

    return (

        "EXP-" +

        Date.now() +

        "-" +

        Math.random()
            .toString(36)
            .substring(
                2,
                8
            )

    );

}



/* =========================================================
   RESET FORM
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


    /*
       Date पुन्हा आजची
    */

    setDefaultExpenseDate();


    /*
       Note counter
    */

    const counter =
        document.getElementById(
            "expenseNoteCounter"
        );


    if (counter) {

        counter.textContent =
            "0 / 300";

    }


    /*
       Category selection reset
    */

    const category =
        document.getElementById(
            "expenseCategory"
        );


    if (category) {

        category.value =
            "";

    }


    /*
       Account reset
    */

    const account =
        document.getElementById(
            "expenseAccount"
        );


    if (account) {

        account.value =
            "";

    }


    /*
       Payment mode Cash
    */

    const paymentMode =
        document.getElementById(
            "expensePaymentMode"
        );


    if (paymentMode) {

        paymentMode.value =
            "Cash";

    }

}



/* =========================================================
   LAST SAVED EXPENSE
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


    if (
        !box ||
        !text
    ) {

        return;

    }


    const accounts =
        typeof getAccounts ===
        "function"
            ? getAccounts()
            : [];


    const account =
        accounts.find(
            item =>
                String(
                    item.id
                ) ===
                String(
                    transaction.accountId
                )
        );


    const accountName =
        account
            ? account.name
            : "";


    text.textContent =

        formatExpenseMoney(
            transaction.amount
        ) +

        " • " +

        transaction.category +

        (
            accountName
                ? " • " +
                  accountName
                : ""
        );


    box.style.display =
        "flex";

}



/* =========================================================
   SAVE LAST EXPENSE SESSION
========================================================= */

function saveLastExpenseSession(
    transaction
) {

    try {

        sessionStorage.setItem(

            "rdkh_last_expense",

            JSON.stringify(
                transaction
            )

        );

    }

    catch {

        /* Ignore */

    }

}



/* =========================================================
   LOAD LAST EXPENSE SESSION
========================================================= */

function loadLastExpenseSaved() {

    try {

        const stored =
            sessionStorage.getItem(
                "rdkh_last_expense"
            );


        if (!stored) {

            return;

        }


        const transaction =
            JSON.parse(
                stored
            );


        if (
            transaction &&
            transaction.amount
        ) {

            showLastExpenseSaved(
                transaction
            );

        }

    }

    catch {

        /* Ignore */

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


    const counter =
        document.getElementById(
            "expenseNoteCounter"
        );


    if (
        !note ||
        !counter
    ) {

        return;

    }


    function updateCounter() {

        counter.textContent =
            note.value.length +
            " / 300";

    }


    note.addEventListener(
        "input",
        updateCounter
    );


    updateCounter();

}



/* =========================================================
   PAYMENT MODE
========================================================= */

function setupExpensePaymentMode() {

    const paymentMode =
        document.getElementById(
            "expensePaymentMode"
        );


    if (!paymentMode) {

        return;

    }


    if (!paymentMode.value) {

        paymentMode.value =
            "Cash";

    }

}



/* =========================================================
   GET ALL EXPENSE TRANSACTIONS
========================================================= */

function getAllExpenseTransactions() {

    let transactions = [];


    if (
        typeof getTransactions ===
        "function"
    ) {

        const result =
            getTransactions();


        if (
            Array.isArray(result)
        ) {

            transactions =
                result;

        }

    }

    else {

        transactions =
            getExpenseTransactionsFallback();

    }


    return transactions.filter(
        transaction =>
            transaction &&
            transaction.type ===
            "expense"
    );

}



/* =========================================================
   EXPENSES BY DATE
========================================================= */

function getExpensesByDate(
    date
) {

    return getAllExpenseTransactions()
        .filter(
            transaction =>
                normalizeExpenseDate(
                    transaction.date
                ) ===
                date
        )
        .reduce(
            (
                total,
                transaction
            ) => {

                return (
                    total +
                    (
                        Number(
                            transaction.amount
                        ) || 0
                    )
                );

            },
            0
        );

}



/* =========================================================
   EXPENSES BY MONTH
========================================================= */

function getExpensesByMonth(
    month
) {

    return getAllExpenseTransactions()
        .filter(
            transaction => {

                const date =
                    normalizeExpenseDate(
                        transaction.date
                    );


                return date.startsWith(
                    month
                );

            }
        )
        .reduce(
            (
                total,
                transaction
            ) => {

                return (
                    total +
                    (
                        Number(
                            transaction.amount
                        ) || 0
                    )
                );

            },
            0
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
   GET TODAY STRING
========================================================= */

function getTodayString() {

    const now =
        new Date();


    return (

        now.getFullYear() +

        "-" +

        String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        ) +

        "-" +

        String(
            now.getDate()
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


    /*
       app.js मधील formatMoney()
       available असल्यास ते वापरा.
    */

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
   SUCCESS MESSAGE
========================================================= */

function showExpenseSuccess() {

    /*
       HTML मध्ये success element असेल तर वापरा.
    */

    const element =
        document.getElementById(
            "expenseSuccessMessage"
        );


    if (!element) {

        return;

    }


    element.style.display =
        "block";


    element.innerHTML = `

        <i class="fa-solid fa-circle-check"></i>

        खर्च यशस्वीपणे नोंदवला आहे.

    `;


    setTimeout(
        function () {

            element.style.display =
                "none";

        },
        3000
    );

}



/* =========================================================
   TRANSACTION UPDATED EVENT
========================================================= */

function dispatchTransactionsUpdated() {

    try {

        window.dispatchEvent(
            new CustomEvent(
                "rdkhTransactionsUpdated"
            )
        );

    }

    catch {

        /*
           जुन्या browser साठी fallback
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

        }

        catch {

            /* Ignore */

        }

    }

}



/* =========================================================
   FALLBACK STORAGE
========================================================= */

function getExpenseTransactionsFallback() {

    const possibleKeys = [

        "rdkh_transactions",

        "rdkh_transaction",

        "transactions",

        "income_expense_transactions"

    ];


    for (
        const key of possibleKeys
    ) {

        try {

            const stored =
                localStorage.getItem(
                    key
                );


            if (!stored) {

                continue;

            }


            const parsed =
                JSON.parse(
                    stored
                );


            if (
                Array.isArray(
                    parsed
                )
            ) {

                return parsed;

            }

        }

        catch {

            continue;

        }

    }


    return [];

}



/* =========================================================
   FALLBACK SAVE
========================================================= */

function saveExpenseTransactionsFallback(
    transactions
) {

    try {

        localStorage.setItem(

            "rdkh_transactions",

            JSON.stringify(
                transactions
            )

        );


        return true;

    }

    catch {

        return false;

    }

}



/* =========================================================
   STORAGE SYNC
========================================================= */

window.addEventListener(
    "storage",
    function (event) {

        /*
           Accounts बदलले असल्यास
        */

        if (
            !event.key ||
            event.key.includes(
                "account"
            )
        ) {

            loadExpenseAccounts();

        }


        /*
           Transactions बदलले असल्यास
        */

        updateExpenseSummary();


        /*
           Categories बदलले असल्यास
        */

        if (
            !event.key ||
            event.key ===
            "rdkh_budget_categories"
        ) {

            loadExpenseCategories();

        }

    }
);



/* =========================================================
   SAME PAGE TRANSACTION UPDATE
========================================================= */

window.addEventListener(
    "rdkhTransactionsUpdated",
    function () {

        updateExpenseSummary();

        loadExpenseAccounts();

    }
);



/* =========================================================
   BUDGET CATEGORY STORAGE UPDATE
========================================================= */

window.addEventListener(
    "storage",
    function (event) {

        if (
            event.key ===
            "rdkh_budget_categories"
        ) {

            loadExpenseCategories();

        }

    }
);



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
