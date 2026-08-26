/* =========================================================
   expense.js

   रोजचा जमा खर्च अहवाल
   EXPENSE MANAGEMENT

   Uses central app.js transaction system.
========================================================= */


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeAccounts();

        setDefaultExpenseDate();

        loadExpenseAccounts();

        updateExpenseSummary();

        setupExpenseNoteCounter();

        setupExpenseForm();

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
            formatMoney(
                getTodayExpense()
            );

    }


    if (month) {

        month.textContent =
            formatMoney(
                getMonthExpense()
            );

    }


    if (total) {

        total.textContent =
            formatMoney(
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


    /* -----------------------------------------------
       GET VALUES
    ------------------------------------------------ */

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



    /* -----------------------------------------------
       CHECK ACCOUNT BALANCE
    ------------------------------------------------ */

    const accountBalance =
        getAccountBalance(
            accountId
        );


    if (amount > accountBalance) {

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
                formatMoney(accountBalance) +
                " आहे.\n\n" +
                "तुम्हाला तरीही हा खर्च नोंदवायचा आहे का?"

            );


        if (!confirmNegative) {

            return;

        }

    }



    /* -----------------------------------------------
       CREATE TRANSACTION
    ------------------------------------------------ */

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



    /* -----------------------------------------------
       GET TRANSACTIONS
    ------------------------------------------------ */

    const transactions =
        getTransactions();



    /* -----------------------------------------------
       ADD TRANSACTION
    ------------------------------------------------ */

    transactions.push(
        transaction
    );



    /* -----------------------------------------------
       SAVE
    ------------------------------------------------ */

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



    /* -----------------------------------------------
       SUCCESS
    ------------------------------------------------ */

    showLastExpenseSaved(
        transaction
    );


    alert(
        "खर्च यशस्वीपणे नोंदवला आहे."
    );


    resetExpenseForm();


    updateExpenseSummary();


    if (
        typeof updateDashboard ===
        "function"
    ) {

        updateDashboard();

    }

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

        loadExpenseAccounts();

        updateExpenseSummary();

    }
);
