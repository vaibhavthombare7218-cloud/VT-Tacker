/* =========================================================
   income.js
   रोजचा जमा खर्च अहवाल
   INCOME MANAGEMENT

   VERSION:
   Central Transaction System

   CONNECTED WITH:
   - transactions.js
   - accounts.js
   - reports.js
   - monthly-budget.js

   FEATURES:
   ---------------------------------------------------------
   ✅ New Income
   ✅ Edit Income
   ✅ Delete/Edit compatible
   ✅ Account-wise Income
   ✅ Payment Mode
   ✅ Daily / Monthly / Total Summary
   ✅ Central Transaction Storage
   ✅ LocalStorage
   ========================================================= */


/* =========================================================
   VARIABLES
========================================================= */

let incomeEditMode = false;
let incomeEditId = null;


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeIncomePage();

    }
);


/* =========================================================
   INITIALIZE PAGE
========================================================= */

function initializeIncomePage() {

    /*
     * Accounts
     */
    if (
        typeof window.initializeAccounts ===
        "function"
    ) {
        window.initializeAccounts();
    }


    /*
     * Default date
     */
    setDefaultIncomeDate();


    /*
     * Load accounts
     */
    loadIncomeAccounts();


    /*
     * Note counter
     */
    setupIncomeNoteCounter();


    /*
     * Form
     */
    setupIncomeForm();


    /*
     * Check edit mode
     */
    checkIncomeEditMode();


    /*
     * Summary
     */
    updateIncomeSummary();


    /*
     * Listen for transaction changes
     */
    window.addEventListener(
        "rdkhTransactionsUpdated",
        function () {

            updateIncomeSummary();

            loadIncomeAccounts();

        }
    );


    /*
     * Storage change
     */
    window.addEventListener(
        "storage",
        function (event) {

            if (
                event.key ===
                "rdkh_transactions_v2" ||

                event.key ===
                "rdkh_accounts"
            ) {

                updateIncomeSummary();

                loadIncomeAccounts();

            }

        }
    );

}


/* =========================================================
   DEFAULT DATE
========================================================= */

function setDefaultIncomeDate() {

    const dateInput =
        document.getElementById(
            "incomeDate"
        );

    if (!dateInput) {
        return;
    }


    if (!dateInput.value) {

        dateInput.value =
            getTodayDate();

    }

}


/* =========================================================
   TODAY DATE
========================================================= */

function getTodayDate() {

    return new Date()
        .toISOString()
        .slice(0, 10);

}


/* =========================================================
   LOAD ACCOUNTS
========================================================= */

function loadIncomeAccounts() {

    const select =
        document.getElementById(
            "incomeAccount"
        );

    if (!select) {
        return;
    }


    const currentValue =
        select.value;


    select.innerHTML =
        '<option value="">खाते निवडा</option>';


    if (
        typeof window.getAccounts !==
        "function"
    ) {

        return;

    }


    const accounts =
        window.getAccounts();


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


    /*
     * Restore previous selection
     */
    if (currentValue) {

        const exists =
            accounts.some(
                account =>
                    String(account.id) ===
                    String(currentValue)
            );


        if (exists) {

            select.value =
                currentValue;

        }

    }

}


/* =========================================================
   NOTE COUNTER
========================================================= */

function setupIncomeNoteCounter() {

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
     * Prevent duplicate listener
     */
    if (
        form.dataset.incomeReady ===
        "true"
    ) {

        return;

    }


    form.dataset.incomeReady =
        "true";


    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            saveIncome();

        }
    );

}


/* =========================================================
   CHECK EDIT MODE
========================================================= */

function checkIncomeEditMode() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const editId =
        params.get("edit");


    if (!editId) {

        /*
         * Check sessionStorage
         */
        try {

            const stored =
                sessionStorage.getItem(
                    "rdkh_edit_transaction"
                );


            if (stored) {

                const transaction =
                    JSON.parse(stored);


                if (
                    transaction &&
                    transaction.type ===
                    "income"
                ) {

                    enterIncomeEditMode(
                        transaction
                    );

                    return;

                }

            }

        } catch (error) {

            console.warn(
                "Could not read edit transaction:",
                error
            );

        }


        return;

    }


    /*
     * Get transaction from central storage
     */

    if (
        typeof window.getTransactionById !==
        "function"
    ) {

        return;

    }


    const transaction =
        window.getTransactionById(
            editId
        );


    if (
        !transaction ||
        transaction.type !==
        "income"
    ) {

        return;

    }


    enterIncomeEditMode(
        transaction
    );

}


/* =========================================================
   ENTER EDIT MODE
========================================================= */

function enterIncomeEditMode(
    transaction
) {

    incomeEditMode =
        true;

    incomeEditId =
        transaction.id;


    const date =
        document.getElementById(
            "incomeDate"
        );

    const amount =
        document.getElementById(
            "incomeAmount"
        );

    const category =
        document.getElementById(
            "incomeCategory"
        );

    const account =
        document.getElementById(
            "incomeAccount"
        );

    const paymentMode =
        document.getElementById(
            "incomePaymentMode"
        );

    const note =
        document.getElementById(
            "incomeNote"
        );


    if (date) {

        date.value =
            transaction.date || "";

    }


    if (amount) {

        amount.value =
            transaction.amount || "";

    }


    if (category) {

        category.value =
            transaction.categoryId ||
            transaction.category ||
            "";

    }


    if (account) {

        account.value =
            transaction.accountId ||
            "";

    }


    if (paymentMode) {

        paymentMode.value =
            transaction.paymentMode ||
            "Cash";

    }


    if (note) {

        note.value =
            transaction.note ||
            transaction.description ||
            "";

        note.dispatchEvent(
            new Event("input")
        );

    }


    /*
     * Change button text
     */

    const submitButton =
        document.querySelector(
            "#incomeForm button[type='submit']"
        );


    if (submitButton) {

        submitButton.innerHTML =
            '<i class="fa-solid fa-pen"></i> जमा नोंद अपडेट करा';

    }


    /*
     * Change heading if available
     */

    const heading =
        document.querySelector(
            ".page-intro h2"
        );


    if (heading) {

        heading.textContent =
            "जमा नोंद संपादित करा";

    }


    /*
     * Last saved message
     */

    const lastSaved =
        document.getElementById(
            "lastSaved"
        );


    if (lastSaved) {

        lastSaved.style.display =
            "none";

    }

}


/* =========================================================
   SAVE / UPDATE INCOME
========================================================= */

function saveIncome() {

    /*
     * Central transaction system required
     */

    if (
        typeof window.getTransactions !==
        "function" ||

        typeof window.saveTransactions !==
        "function"
    ) {

        alert(
            "Transaction system उपलब्ध नाही. कृपया transactions.js योग्य प्रकारे load आहे का तपासा."
        );

        return;

    }


    const date =
        getElementValue(
            "incomeDate"
        );


    const amount =
        Number(
            getElementValue(
                "incomeAmount"
            )
        );


    const category =
        getElementValue(
            "incomeCategory"
        );


    const accountId =
        getElementValue(
            "incomeAccount"
        );


    const paymentMode =
        getElementValue(
            "incomePaymentMode"
        );


    const note =
        getElementValue(
            "incomeNote"
        );


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
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        alert(
            "कृपया योग्य जमा रक्कम भरा."
        );

        return;

    }


    if (!category) {

        alert(
            "कृपया जमा प्रकार निवडा."
        );

        return;

    }


    if (!accountId) {

        alert(
            "कृपया कोणत्या खात्यात जमा झाली ते निवडा."
        );

        return;

    }


    /*
     * Find category name
     */

    const categoryName =
        getIncomeCategoryName(
            category
        );


    /* =====================================================
       EDIT
    ===================================================== */

    if (
        incomeEditMode &&
        incomeEditId
    ) {

        const transactions =
            window.getTransactions();


        const index =
            transactions.findIndex(
                transaction =>
                    String(
                        transaction.id
                    ) ===
                    String(
                        incomeEditId
                    )
            );


        if (index === -1) {

            alert(
                "जमा व्यवहार सापडला नाही."
            );

            incomeEditMode =
                false;

            incomeEditId =
                null;

            return;

        }


        const oldTransaction =
            transactions[index];


        transactions[index] = {

            ...oldTransaction,

            type: "income",

            date: date,

            category: category,

            categoryId: category,

            categoryName:
                categoryName,

            description: note,

            amount: amount,

            accountId: accountId,

            paymentMode:
                paymentMode,

            note: note,

            updatedAt:
                new Date().toISOString()

        };


        window.saveTransactions(
            transactions
        );


        /*
         * Clear edit mode
         */

        incomeEditMode =
            false;

        incomeEditId =
            null;


        try {

            sessionStorage.removeItem(
                "rdkh_edit_transaction"
            );

        } catch (error) {

            console.warn(error);

        }


        /*
         * Success
         */

        showIncomeSavedMessage(
            "जमा व्यवहार यशस्वीरित्या अपडेट केला आहे.",
            transactions[index]
        );


        updateIncomeSummary();


        return;

    }


    /* =====================================================
       NEW INCOME
    ===================================================== */

    const transaction = {

        id:
            generateIncomeTransactionId(),

        type:
            "income",

        date:
            date,

        category:
            category,

        categoryId:
            category,

        categoryName:
            categoryName,

        description:
            note,

        amount:
            amount,

        accountId:
            accountId,

        paymentMode:
            paymentMode,

        note:
            note,

        createdAt:
            new Date().toISOString()

    };


    const transactions =
        window.getTransactions();


    transactions.push(
        transaction
    );


    window.saveTransactions(
        transactions
    );


    /*
     * Show success
     */

    showIncomeSavedMessage(
        "जमा नोंदवली आहे.",
        transaction
    );


    /*
     * Update summary
     */

    updateIncomeSummary();


    /*
     * Reset form
     */

    resetIncomeForm();

}


/* =========================================================
   CATEGORY NAME
========================================================= */

function getIncomeCategoryName(
    category
) {

    const names = {

        Salary:
            "पगार",

        Business:
            "व्यवसाय",

        Freelance:
            "Freelance",

        Interest:
            "व्याज",

        Gift:
            "भेट / मिळालेली रक्कम",

        Refund:
            "Refund",

        Other:
            "इतर"

    };


    return (
        names[category] ||
        category
    );

}


/* =========================================================
   GENERATE INCOME ID
========================================================= */

function generateIncomeTransactionId() {

    return (
        "INC-" +
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase()
    );

}


/* =========================================================
   UPDATE SUMMARY
========================================================= */

function updateIncomeSummary() {

    let today = 0;

    let month = 0;

    let total = 0;


    /*
     * Use central helper if available
     */

    if (
        typeof window.getTodayIncome ===
        "function"
    ) {

        today =
            Number(
                window.getTodayIncome()
            ) || 0;

    }


    if (
        typeof window.getMonthIncome ===
        "function"
    ) {

        month =
            Number(
                window.getMonthIncome()
            ) || 0;

    }


    if (
        typeof window.getTotalIncome ===
        "function"
    ) {

        total =
            Number(
                window.getTotalIncome()
            ) || 0;

    }


    /*
     * Fallback calculation
     */

    if (
        typeof window.getTotalIncome !==
        "function"
    ) {

        const transactions =
            typeof window.getTransactions ===
            "function"
                ? window.getTransactions()
                : [];


        const todayDate =
            getTodayDate();


        const currentMonth =
            todayDate.slice(
                0,
                7
            );


        transactions.forEach(
            transaction => {

                if (
                    transaction.type !==
                    "income"
                ) {

                    return;

                }


                const value =
                    Number(
                        transaction.amount
                    ) || 0;


                total += value;


                if (
                    transaction.date ===
                    todayDate
                ) {

                    today += value;

                }


                if (
                    String(
                        transaction.date
                    ).startsWith(
                        currentMonth
                    )
                ) {

                    month += value;

                }

            }
        );

    }


    setText(
        "todayIncome",
        formatIncomeMoney(today)
    );


    setText(
        "monthIncome",
        formatIncomeMoney(month)
    );


    setText(
        "totalIncome",
        formatIncomeMoney(total)
    );

}


/* =========================================================
   RESET FORM
========================================================= */

function resetIncomeForm() {

    const form =
        document.getElementById(
            "incomeForm"
        );


    if (!form) {
        return;
    }


    form.reset();


    /*
     * Default payment mode
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
     * Today's date
     */

    setDefaultIncomeDate();


    /*
     * Account placeholder
     */

    const account =
        document.getElementById(
            "incomeAccount"
        );


    if (account) {

        account.value =
            "";

    }


    /*
     * Note counter
     */

    const note =
        document.getElementById(
            "incomeNote"
        );

    const counter =
        document.getElementById(
            "noteCounter"
        );


    if (note) {

        note.value = "";

    }


    if (counter) {

        counter.textContent =
            "0 / 300";

    }


    /*
     * Exit edit mode
     */

    incomeEditMode =
        false;

    incomeEditId =
        null;


    try {

        sessionStorage.removeItem(
            "rdkh_edit_transaction"
        );

    } catch (error) {

        console.warn(error);

    }


    /*
     * Restore button
     */

    const submitButton =
        document.querySelector(
            "#incomeForm button[type='submit']"
        );


    if (submitButton) {

        submitButton.innerHTML =
            '<i class="fa-solid fa-check"></i> जमा नोंदवा';

    }


    /*
     * Restore heading
     */

    const heading =
        document.querySelector(
            ".page-intro h2"
        );


    if (heading) {

        heading.textContent =
            "नवीन जमा नोंद";

    }

}


/* =========================================================
   SUCCESS MESSAGE
========================================================= */

function showIncomeSavedMessage(
    message,
    transaction
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

        alert(message);

        return;

    }


    section.style.display =
        "flex";


    if (text) {

        const category =
            transaction.categoryName ||
            transaction.category ||
            "जमा";


        text.textContent =
            `${category} • ${formatIncomeMoney(
                transaction.amount
            )} • ${formatIncomeDate(
                transaction.date
            )}`;

    }


    /*
     * Scroll to success message
     */

    try {

        section.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    } catch (error) {

        console.warn(error);

    }

}


/* =========================================================
   ELEMENT VALUE
========================================================= */

function getElementValue(
    id
) {

    const element =
        document.getElementById(
            id
        );


    if (!element) {
        return "";
    }


    return String(
        element.value || ""
    ).trim();

}


/* =========================================================
   SET TEXT
========================================================= */

function setText(
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
   FORMAT MONEY
========================================================= */

function formatIncomeMoney(
    amount
) {

    const number =
        Number(amount) || 0;


    return (
        "₹" +
        number.toLocaleString(
            "en-IN",
            {
                minimumFractionDigits:
                    2,

                maximumFractionDigits:
                    2
            }
        )
    );

}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatIncomeDate(
    date
) {

    if (!date) {
        return "--";
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
   NAVIGATION
========================================================= */

function goHome() {

    window.location.href =
        "index.html";

}


function goToTransactions() {

    window.location.href =
        "transactions.html";

}


function goToExpense() {

    window.location.href =
        "expense.html";

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
   GLOBAL EXPORTS
========================================================= */

window.saveIncome =
    saveIncome;

window.resetIncomeForm =
    resetIncomeForm;

window.updateIncomeSummary =
    updateIncomeSummary;

window.loadIncomeAccounts =
    loadIncomeAccounts;

window.checkIncomeEditMode =
    checkIncomeEditMode;
