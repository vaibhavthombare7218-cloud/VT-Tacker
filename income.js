/* =========================================================
   income.js
   रोजचा जमा खर्च अहवाल
   INCOME MANAGEMENT

   CONNECTED WITH:
   ---------------------------------------------------------
   transactions.js
   accounts.js
   app.js
   dashboard
   reports
   monthly-budget

   STORAGE:
   ---------------------------------------------------------
   Central transaction storage:
   rdkh_transactions_v2

   FEATURES:
   ---------------------------------------------------------
   ✅ Income entry
   ✅ Central transaction storage
   ✅ Account based income
   ✅ Cash / UPI / Bank / Cheque
   ✅ Today income
   ✅ Monthly income
   ✅ Total income
   ✅ Edit existing income
   ✅ Delete/update through transaction system
   ✅ Note counter
   ✅ Last saved message
   ✅ Dashboard refresh
   ✅ Transaction refresh event
   ========================================================= */


/* =========================================================
   GLOBAL VARIABLES
========================================================= */

let incomeEditMode = false;
let incomeEditTransactionId = null;


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /*
         * Initialize accounts if accounts.js
         * is available.
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


        setDefaultIncomeDate();

        loadIncomeAccounts();

        updateIncomeSummary();

        setupNoteCounter();

        setupIncomeForm();

        checkIncomeEditMode();

    }
);


/* =========================================================
   DEFAULT DATE
========================================================= */

function setDefaultIncomeDate() {

    const dateInput =
        document.getElementById(
            "incomeDate"
        );

    if (
        dateInput &&
        !dateInput.value
    ) {

        if (
            typeof window.RDKHGetTodayDate ===
            "function"
        ) {

            dateInput.value =
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

            dateInput.value =
                `${year}-${month}-${day}`;

        }

    }

}


/* =========================================================
   LOAD ACCOUNTS
========================================================= */

function loadIncomeAccounts() {

    const accountSelect =
        document.getElementById(
            "incomeAccount"
        );

    if (!accountSelect) {
        return;
    }


    const currentValue =
        accountSelect.value;


    accountSelect.innerHTML = `
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

            accountSelect.appendChild(
                option
            );

        }
    );


    /*
     * Restore previously selected
     * account if still available.
     */

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

        accountSelect.value =
            currentValue;

    }

}


/* =========================================================
   INCOME SUMMARY
========================================================= */

function updateIncomeSummary() {

    let todayIncome = 0;
    let monthIncome = 0;
    let totalIncome = 0;


    /*
     * Prefer central transaction system.
     */

    if (
        typeof window.getTodayIncome ===
        "function"
    ) {

        todayIncome =
            Number(
                window.getTodayIncome()
            ) || 0;

    }


    if (
        typeof window.getMonthIncome ===
        "function"
    ) {

        monthIncome =
            Number(
                window.getMonthIncome()
            ) || 0;

    }


    if (
        typeof window.getTotalIncome ===
        "function"
    ) {

        totalIncome =
            Number(
                window.getTotalIncome()
            ) || 0;

    }


    const todayElement =
        document.getElementById(
            "todayIncome"
        );

    const monthElement =
        document.getElementById(
            "monthIncome"
        );

    const totalElement =
        document.getElementById(
            "totalIncome"
        );


    if (todayElement) {

        todayElement.textContent =
            formatIncomeMoney(
                todayIncome
            );

    }


    if (monthElement) {

        monthElement.textContent =
            formatIncomeMoney(
                monthIncome
            );

    }


    if (totalElement) {

        totalElement.textContent =
            formatIncomeMoney(
                totalIncome
            );

    }

}


/* =========================================================
   MONEY FORMAT
========================================================= */

function formatIncomeMoney(
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
   FORM SETUP
========================================================= */

function setupIncomeForm() {

    const form =
        document.getElementById(
            "incomeForm"
        );


    if (!form) {
        return;
    }


    /*
     * Prevent duplicate event listeners.
     */

    if (
        form.dataset.incomeInitialized ===
        "true"
    ) {

        return;

    }


    form.dataset.incomeInitialized =
        "true";


    form.addEventListener(
        "submit",
        saveIncome
    );

}


/* =========================================================
   SAVE / UPDATE INCOME
========================================================= */

function saveIncome(event) {

    event.preventDefault();


    /* -----------------------------------------------------
       CHECK CENTRAL TRANSACTION SYSTEM
    ----------------------------------------------------- */

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
            "incomeDate"
        );

    const amountInput =
        document.getElementById(
            "incomeAmount"
        );

    const categoryInput =
        document.getElementById(
            "incomeCategory"
        );

    const accountInput =
        document.getElementById(
            "incomeAccount"
        );

    const paymentModeInput =
        document.getElementById(
            "incomePaymentMode"
        );

    const noteInput =
        document.getElementById(
            "incomeNote"
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


    const category =
        categoryInput
            ? categoryInput.value
            : "";


    const accountId =
        accountInput
            ? accountInput.value
            : "";


    const paymentMode =
        paymentModeInput
            ? paymentModeInput.value
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
            "कृपया योग्य जमा रक्कम भरा."
        );

        if (amountInput) {
            amountInput.focus();
        }

        return;

    }


    if (!category) {

        alert(
            "कृपया जमा प्रकार निवडा."
        );

        if (categoryInput) {
            categoryInput.focus();
        }

        return;

    }


    if (!accountId) {

        alert(
            "कृपया कोणत्या खात्यात जमा झाली ते निवडा."
        );

        if (accountInput) {
            accountInput.focus();
        }

        return;

    }


    /* -----------------------------------------------------
       GET ACCOUNT DETAILS
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

    const categorySelect =
        categoryInput;


    let categoryName =
        category;


    if (categorySelect) {

        const selectedOption =
            categorySelect.options[
                categorySelect.selectedIndex
            ];

        if (
            selectedOption &&
            selectedOption.textContent
        ) {

            categoryName =
                selectedOption.textContent
                    .trim();

        }

    }


    /* -----------------------------------------------------
       CREATE / UPDATE TRANSACTION
    ----------------------------------------------------- */

    const transactions =
        window.getTransactions();


    if (
        incomeEditMode &&
        incomeEditTransactionId
    ) {

        /*
         * UPDATE EXISTING INCOME
         */

        const index =
            transactions.findIndex(
                function (transaction) {

                    return (
                        String(
                            transaction.id
                        ) ===
                        String(
                            incomeEditTransactionId
                        )
                    );

                }
            );


        if (index === -1) {

            alert(
                "Edit करण्यासाठी जमा व्यवहार सापडला नाही."
            );

            exitIncomeEditMode();

            return;

        }


        const oldTransaction =
            transactions[index];


        /*
         * Safety check:
         * Do not allow an expense to be
         * accidentally converted here.
         */

        if (
            typeof window.RDKHNormalizeTransactionType ===
            "function"
        ) {

            const oldType =
                window.RDKHNormalizeTransactionType(
                    oldTransaction.type
                );

            if (
                oldType !== "income"
            ) {

                alert(
                    "हा जमा व्यवहार नाही."
                );

                return;

            }

        }


        transactions[index] = {

            ...oldTransaction,

            type: "income",

            date,

            category,

            categoryId: category,

            categoryName,

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


        showLastSaved(
            transactions[index],
            true
        );


        alert(
            "जमा व्यवहार यशस्वीपणे अपडेट केला."
        );


        exitIncomeEditMode(
            false
        );


        updateIncomeSummary();


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


    /* -----------------------------------------------------
       NEW INCOME
    ----------------------------------------------------- */

    let transactionId = "";

    if (
        typeof window.generateTransactionId ===
        "function"
    ) {

        /*
         * If another existing global function
         * already provides transaction IDs,
         * use it.
         */

        try {

            transactionId =
                window.generateTransactionId();

        } catch (error) {}

    }


    /*
     * Our own fallback ID.
     */

    if (!transactionId) {

        transactionId =
            "INC-" +
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .substring(2, 8)
                .toUpperCase();

    }


    const newTransaction = {

        id:
            transactionId,

        type:
            "income",

        date,

        category,

        categoryId:
            category,

        categoryName,

        description:
            categoryName,

        amount,

        accountId,

        accountName,

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
     * Save into CENTRAL STORAGE.
     */

    window.saveTransactions(
        transactions
    );


    /* -----------------------------------------------------
       LAST SAVED
    ----------------------------------------------------- */

    showLastSaved(
        newTransaction,
        false
    );


    /* -----------------------------------------------------
       SUCCESS
    ----------------------------------------------------- */

    alert(
        "जमा यशस्वीपणे नोंदवली."
    );


    /* -----------------------------------------------------
       RESET FORM
    ----------------------------------------------------- */

    resetIncomeForm();


    /* -----------------------------------------------------
       REFRESH
    ----------------------------------------------------- */

    updateIncomeSummary();


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

function showLastSaved(
    transaction,
    isUpdate
) {

    const section =
        document.getElementById(
            "lastSaved"
        );

    const text =
        document.getElementById(
            "lastSavedText"
        );


    if (!section) {
        return;
    }


    let accountName =
        transaction.accountName ||
        transaction.account ||
        "";


    if (
        !accountName &&
        transaction.accountId &&
        typeof window.getAccounts ===
        "function"
    ) {

        const accounts =
            window.getAccounts() || [];

        const account =
            accounts.find(
                function (account) {

                    return (
                        account.id ===
                        transaction.accountId
                    );

                }
            );

        if (account) {

            accountName =
                account.name;

        }

    }


    const categoryName =
        transaction.categoryName ||
        transaction.category ||
        "";


    const amount =
        formatIncomeMoney(
            transaction.amount
        );


    if (text) {

        if (isUpdate) {

            text.textContent =
                `${categoryName} • ${amount} • ${accountName}`;

        } else {

            text.textContent =
                `${categoryName} • ${amount} • ${accountName}`;

        }

    }


    section.style.display =
        "flex";

}


/* =========================================================
   RESET FORM
========================================================= */

function resetIncomeForm() {

    const form =
        document.getElementById(
            "incomeForm"
        );


    if (form) {

        form.reset();

    }


    /*
     * Set today's date again.
     */

    setDefaultIncomeDate();


    /*
     * Reset payment mode to Cash
     */

    const paymentMode =
        document.getElementById(
            "incomePaymentMode"
        );

    if (paymentMode) {

        paymentMode.value =
            "Cash";

    }


    /*
     * Reset note counter
     */

    updateIncomeNoteCounter();


    /*
     * Hide last saved only when
     * resetting manually.
     */

    const lastSaved =
        document.getElementById(
            "lastSaved"
        );

    if (lastSaved) {

        lastSaved.style.display =
            "none";

    }


    /*
     * Do not clear edit mode here if
     * reset is being called from
     * edit initialization.
     */

}


/* =========================================================
   NOTE COUNTER
========================================================= */

function setupNoteCounter() {

    const note =
        document.getElementById(
            "incomeNote"
        );

    if (!note) {
        return;
    }


    note.addEventListener(
        "input",
        updateIncomeNoteCounter
    );


    updateIncomeNoteCounter();

}


function updateIncomeNoteCounter() {

    const note =
        document.getElementById(
            "incomeNote"
        );

    const counter =
        document.getElementById(
            "noteCounter"
        );


    if (!note || !counter) {
        return;
    }


    counter.textContent =
        `${note.value.length} / 300`;

}


/* =========================================================
   EDIT MODE CHECK
========================================================= */

function checkIncomeEditMode() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const editId =
        params.get("edit");


    /*
     * No edit parameter
     */

    if (!editId) {

        return;

    }


    let transaction = null;


    /*
     * First try central storage.
     */

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
     * If unavailable, try sessionStorage.
     */

    if (!transaction) {

        try {

            const stored =
                sessionStorage.getItem(
                    "rdkh_edit_transaction"
                );

            if (stored) {

                const parsed =
                    JSON.parse(stored);

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
            "Edit करण्यासाठी जमा व्यवहार सापडला नाही."
        );

        return;

    }


    /*
     * Safety check.
     */

    let type = "";

    if (
        typeof window.RDKHNormalizeTransactionType ===
        "function"
    ) {

        type =
            window.RDKHNormalizeTransactionType(
                transaction.type
            );

    } else {

        type =
            String(
                transaction.type || ""
            ).toLowerCase();

    }


    if (type !== "income") {

        alert(
            "हा जमा व्यवहार नाही."
        );

        return;

    }


    incomeEditMode =
        true;

    incomeEditTransactionId =
        transaction.id;


    populateIncomeEditForm(
        transaction
    );


}


/* =========================================================
   POPULATE EDIT FORM
========================================================= */

function populateIncomeEditForm(
    transaction
) {

    const dateInput =
        document.getElementById(
            "incomeDate"
        );

    const amountInput =
        document.getElementById(
            "incomeAmount"
        );

    const categoryInput =
        document.getElementById(
            "incomeCategory"
        );

    const accountInput =
        document.getElementById(
            "incomeAccount"
        );

    const paymentModeInput =
        document.getElementById(
            "incomePaymentMode"
        );

    const noteInput =
        document.getElementById(
            "incomeNote"
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
            transaction.categoryId ||
            transaction.category ||
            "";

    }


    if (accountInput) {

        /*
         * accountId is the central value.
         */

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


    updateIncomeNoteCounter();


    /*
     * Change button text to UPDATE.
     */

    const form =
        document.getElementById(
            "incomeForm"
        );


    if (form) {

        const submitButton =
            form.querySelector(
                'button[type="submit"]'
            );


        if (submitButton) {

            submitButton.innerHTML = `
                <i class="fa-solid fa-pen-to-square"></i>
                जमा अपडेट करा
            `;

        }

    }


    /*
     * Change page heading if available.
     */

    const heading =
        document.querySelector(
            ".page-intro h2"
        );


    if (heading) {

        heading.textContent =
            "जमा व्यवहार अपडेट करा";

    }


    const introText =
        document.querySelector(
            ".page-intro p"
        );


    if (introText) {

        introText.textContent =
            "जमा व्यवहारातील माहिती बदला.";

    }


}


/* =========================================================
   EXIT EDIT MODE
========================================================= */

function exitIncomeEditMode(
    clearUrl = true
) {

    incomeEditMode =
        false;

    incomeEditTransactionId =
        null;


    try {

        sessionStorage.removeItem(
            "rdkh_edit_transaction"
        );

    } catch (error) {}


    /*
     * Remove edit parameter from URL.
     */

    if (
        clearUrl &&
        window.history &&
        window.history.replaceState
    ) {

        try {

            window.history.replaceState(
                {},
                document.title,
                "income.html"
            );

        } catch (error) {}

    }


    /*
     * Restore normal heading.
     */

    const heading =
        document.querySelector(
            ".page-intro h2"
        );


    if (heading) {

        heading.textContent =
            "नवीन जमा नोंद";

    }


    const introText =
        document.querySelector(
            ".page-intro p"
        );


    if (introText) {

        introText.textContent =
            "मिळालेली रक्कम येथे नोंदवा.";

    }


    const form =
        document.getElementById(
            "incomeForm"
        );


    if (form) {

        const submitButton =
            form.querySelector(
                'button[type="submit"]'
            );


        if (submitButton) {

            submitButton.innerHTML = `
                <i class="fa-solid fa-check"></i>
                जमा नोंदवा
            `;

        }

    }

}


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

            loadIncomeAccounts();

            updateIncomeSummary();

        }

    }
);


/* =========================================================
   CENTRAL TRANSACTION EVENT
========================================================= */

window.addEventListener(
    "rdkhTransactionsUpdated",
    function () {

        loadIncomeAccounts();

        updateIncomeSummary();

    }
);


/* =========================================================
   WINDOW FOCUS
========================================================= */

window.addEventListener(
    "focus",
    function () {

        /*
         * Refresh account list and
         * summary whenever user returns
         * to income page.
         */

        loadIncomeAccounts();

        updateIncomeSummary();

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

window.saveIncome =
    saveIncome;

window.resetIncomeForm =
    resetIncomeForm;

window.loadIncomeAccounts =
    loadIncomeAccounts;

window.updateIncomeSummary =
    updateIncomeSummary;

window.checkIncomeEditMode =
    checkIncomeEditMode;
