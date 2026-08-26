/* =========================================================
   income.js

   रोजचा जमा खर्च अहवाल
   INCOME MANAGEMENT

   Uses central app.js transaction system.
========================================================= */


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeAccounts();

        setDefaultIncomeDate();

        loadIncomeAccounts();

        updateIncomeSummary();

        setupNoteCounter();

        setupIncomeForm();

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


    if (!dateInput) {

        return;

    }


    dateInput.value =
        getTodayString();

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
   INCOME SUMMARY
========================================================= */

function updateIncomeSummary() {


    const today =
        document.getElementById(
            "todayIncome"
        );


    const month =
        document.getElementById(
            "monthIncome"
        );


    const total =
        document.getElementById(
            "totalIncome"
        );


    if (today) {

        today.textContent =
            formatMoney(
                getTodayIncome()
            );

    }


    if (month) {

        month.textContent =
            formatMoney(
                getMonthIncome()
            );

    }


    if (total) {

        total.textContent =
            formatMoney(
                getTotalIncome()
            );

    }

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


    form.addEventListener(
        "submit",
        saveIncome
    );

}



/* =========================================================
   SAVE INCOME
========================================================= */

function saveIncome(event) {

    event.preventDefault();


    /* -----------------------------------------------
       GET VALUES
    ------------------------------------------------ */

    const date =
        document.getElementById(
            "incomeDate"
        ).value;


    const amount =
        Number(
            document.getElementById(
                "incomeAmount"
            ).value
        );


    const category =
        document.getElementById(
            "incomeCategory"
        ).value;


    const accountId =
        document.getElementById(
            "incomeAccount"
        ).value;


    const paymentMode =
        document.getElementById(
            "incomePaymentMode"
        ).value;


    const note =
        document.getElementById(
            "incomeNote"
        ).value.trim();



    /* -----------------------------------------------
       VALIDATION
    ------------------------------------------------ */

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
            "कृपया योग्य जमा रक्कम भरा."
        );

        document
            .getElementById(
                "incomeAmount"
            )
            .focus();

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
            "कृपया खाते निवडा."
        );

        return;

    }



    /* -----------------------------------------------
       CREATE TRANSACTION
    ------------------------------------------------ */

    const transaction = {

        id:
            generateTransactionId(),

        type:
            "income",

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



    /* -----------------------------------------------
       GET OLD TRANSACTIONS
    ------------------------------------------------ */

    const transactions =
        getTransactions();



    /* -----------------------------------------------
       SAVE
    ------------------------------------------------ */

    transactions.push(
        transaction
    );


    const saved =
        saveTransactions(
            transactions
        );


    if (!saved) {

        alert(
            "जमा save करताना समस्या आली."
        );

        return;

    }



    /* -----------------------------------------------
       SUCCESS
    ------------------------------------------------ */

    showLastSaved(
        transaction
    );


    alert(
        "जमा रक्कम यशस्वीपणे नोंदवली आहे."
    );


    resetIncomeForm();


    updateIncomeSummary();


    if (
        typeof updateDashboard ===
        "function"
    ) {

        updateDashboard();

    }

}



/* =========================================================
   TRANSACTION ID
========================================================= */

function generateTransactionId() {

    return (
        "INC-" +
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 8)
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


    setDefaultIncomeDate();


    const noteCounter =
        document.getElementById(
            "noteCounter"
        );


    if (noteCounter) {

        noteCounter.textContent =
            "0 / 300";

    }

}



/* =========================================================
   LAST SAVED
========================================================= */

function showLastSaved(
    transaction
) {

    const box =
        document.getElementById(
            "lastSaved"
        );


    const text =
        document.getElementById(
            "lastSavedText"
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
        formatMoney(
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

function setupNoteCounter() {

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
   NAVIGATION
========================================================= */

function goHome() {

    window.location.href =
        "index.html";

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
   STORAGE SYNC
========================================================= */

window.addEventListener(
    "storage",
    function () {

        loadIncomeAccounts();

        updateIncomeSummary();

    }
);
