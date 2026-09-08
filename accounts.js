/* =========================================================
   accounts.js

   रोजचा जमा खर्च अहवाल
   ACCOUNT MANAGEMENT

   CONNECTED WITH:
   - app.js
   - accounts.html
   - transactions
   - income
   - expense

   ACCOUNT BALANCE FORMULA:

   Current Balance
   =
   Opening Balance
   + Income
   - Expense

   IMPORTANT:
   ---------------------------------------------------------
   Central Account Storage / Calculation
   app.js मध्ये आहे.

   accounts.js फक्त Account Page UI आणि
   Add / Edit / Delete functionality हाताळतो.
========================================================= */


/* =========================================================
   STORAGE KEY
========================================================= */

const ACCOUNTS_STORAGE_KEY =
    "rdkh_accounts";


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeAccountsPage();

    }
);


/* =========================================================
   INITIALIZE ACCOUNTS PAGE
========================================================= */

function initializeAccountsPage() {

    /*
       app.js मधील central function वापरा.
    */

    if (
        typeof window.initializeAccounts ===
        "function"
    ) {

        window.initializeAccounts();

    }


    setupAccountForm();

    renderAccounts();

    updateTotalAccountBalance();

}



/* =========================================================
   GET CENTRAL ACCOUNTS
========================================================= */

function getAccountsForPage() {

    if (
        typeof window.getAccounts ===
        "function"
    ) {

        return window.getAccounts();

    }


    /*
       Emergency fallback.
       app.js उपलब्ध नसल्यासही page पूर्णपणे
       crash होऊ नये.
    */

    try {

        const data =
            localStorage.getItem(
                ACCOUNTS_STORAGE_KEY
            );


        const accounts =
            data
                ? JSON.parse(data)
                : [];


        return Array.isArray(
            accounts
        )
            ? accounts
            : [];

    }

    catch (error) {

        console.error(
            "Account loading error:",
            error
        );

        return [];

    }

}



/* =========================================================
   SAVE CENTRAL ACCOUNTS
========================================================= */

function saveAccountsForPage(
    accounts
) {

    if (
        typeof window.saveAccounts ===
        "function"
    ) {

        return window.saveAccounts(
            accounts
        );

    }


    try {

        localStorage.setItem(

            ACCOUNTS_STORAGE_KEY,

            JSON.stringify(
                accounts
            )

        );


        return true;

    }

    catch (error) {

        console.error(
            "Account save error:",
            error
        );

        return false;

    }

}



/* =========================================================
   ACCOUNT FORM
========================================================= */

function setupAccountForm() {

    const form =
        document.getElementById(
            "accountForm"
        );


    if (!form) {

        return;

    }


    /*
       Duplicate listener टाळण्यासाठी
    */

    if (
        form.dataset.listenerAttached ===
        "true"
    ) {

        return;

    }


    form.addEventListener(
        "submit",
        saveAccount
    );


    form.dataset.listenerAttached =
        "true";

}



/* =========================================================
   OPEN ACCOUNT FORM
========================================================= */

function openAccountForm() {

    const card =
        document.getElementById(
            "accountFormCard"
        );


    if (!card) {

        return;

    }


    card.style.display =
        "block";


    const title =
        document.getElementById(
            "accountFormTitle"
        );


    if (title) {

        title.textContent =
            "नवीन Account";

    }


    resetAccountForm();


    setTimeout(
        function () {

            document
                .getElementById(
                    "accountName"
                )
                ?.focus();

        },
        100
    );

}



/* =========================================================
   CLOSE ACCOUNT FORM
========================================================= */

function closeAccountForm() {

    const card =
        document.getElementById(
            "accountFormCard"
        );


    if (!card) {

        return;

    }


    card.style.display =
        "none";


    resetAccountForm();

}



/* =========================================================
   RESET ACCOUNT FORM
========================================================= */

function resetAccountForm() {

    const form =
        document.getElementById(
            "accountForm"
        );


    if (!form) {

        return;

    }


    form.reset();


    form.dataset.editId =
        "";

}



/* =========================================================
   SAVE ACCOUNT
========================================================= */

function saveAccount(
    event
) {

    event.preventDefault();


    const nameElement =
        document.getElementById(
            "accountName"
        );


    const typeElement =
        document.getElementById(
            "accountType"
        );


    const openingElement =
        document.getElementById(
            "openingBalance"
        );


    const noteElement =
        document.getElementById(
            "accountNote"
        );


    const form =
        document.getElementById(
            "accountForm"
        );


    if (
        !nameElement ||
        !typeElement ||
        !openingElement ||
        !noteElement ||
        !form
    ) {

        alert(
            "Account form मध्ये काही माहिती उपलब्ध नाही."
        );

        return;

    }


    const name =
        nameElement.value.trim();


    const type =
        typeElement.value;


    const openingBalance =
        Number(
            openingElement.value
        );


    const note =
        noteElement.value.trim();


    const editId =
        form.dataset.editId ||
        "";



    /* =====================================================
       VALIDATION
    ===================================================== */

    if (!name) {

        alert(
            "कृपया Account Name भरा."
        );

        nameElement.focus();

        return;

    }


    if (!type) {

        alert(
            "कृपया Account Type निवडा."
        );

        typeElement.focus();

        return;

    }


    if (
        !Number.isFinite(
            openingBalance
        ) ||
        openingBalance < 0
    ) {

        alert(
            "कृपया योग्य Opening Balance भरा."
        );

        openingElement.focus();

        return;

    }



    /* =====================================================
       GET EXISTING ACCOUNTS
    ===================================================== */

    const accounts =
        getAccountsForPage();



    /* =====================================================
       EDIT EXISTING ACCOUNT
    ===================================================== */

    if (editId) {

        const index =
            accounts.findIndex(
                account =>
                    account.id ===
                    editId
            );


        if (index === -1) {

            alert(
                "Account सापडले नाही."
            );

            return;

        }


        /*
           Duplicate account name check
        */

        const duplicate =
            accounts.some(
                account =>

                    account.id !==
                    editId &&

                    String(
                        account.name ||
                        ""
                    )
                    .trim()
                    .toLowerCase() ===
                    name.toLowerCase()

            );


        if (duplicate) {

            alert(
                "या नावाचे Account आधीपासून आहे."
            );

            return;

        }


        /*
           Existing account update
        */

        accounts[index].name =
            name;

        accounts[index].type =
            type;

        accounts[index].openingBalance =
            openingBalance;

        accounts[index].note =
            note;

        accounts[index].updatedAt =
            new Date().toISOString();


        const saved =
            saveAccountsForPage(
                accounts
            );


        if (!saved) {

            alert(
                "Account update करताना समस्या आली."
            );

            return;

        }


        alert(
            "Account successfully update झाले."
        );


        closeAccountForm();

        renderAccounts();

        updateTotalAccountBalance();


        /*
           Dashboard / other pages refresh
        */

        dispatchAccountUpdate();


        return;

    }



    /* =====================================================
       NEW ACCOUNT
    ===================================================== */

    const duplicate =
        accounts.some(
            account =>

                String(
                    account.name ||
                    ""
                )
                .trim()
                .toLowerCase() ===
                name.toLowerCase()

        );


    if (duplicate) {

        alert(
            "या नावाचे Account आधीपासून आहे."
        );

        return;

    }



    const newAccount = {

        id:
            generateAccountId(),

        name:
            name,

        type:
            type,

        openingBalance:
            openingBalance,

        note:
            note,

        createdAt:
            new Date().toISOString(),

        updatedAt:
            null

    };



    accounts.push(
        newAccount
    );



    const saved =
        saveAccountsForPage(
            accounts
        );


    if (!saved) {

        alert(
            "Account save करताना समस्या आली."
        );

        return;

    }


    alert(
        "नवीन Account successfully तयार झाले."
    );


    closeAccountForm();

    renderAccounts();

    updateTotalAccountBalance();


    dispatchAccountUpdate();

}



/* =========================================================
   GENERATE ACCOUNT ID
========================================================= */

function generateAccountId() {

    return (

        "ACC-" +

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
   GET ACCOUNT BALANCE
========================================================= */

function getAccountBalanceForPage(
    accountId
) {

    /*
       app.js मधील central calculation वापरा.
    */

    if (
        typeof window.getAccountBalance ===
        "function"
    ) {

        return window.getAccountBalance(
            accountId
        );

    }


    /*
       Fallback calculation
    */

    const accounts =
        getAccountsForPage();


    const account =
        accounts.find(
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


    let transactions = [];


    if (
        typeof window.getTransactions ===
        "function"
    ) {

        transactions =
            window.getTransactions();

    }


    transactions.forEach(
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
   GET TOTAL ACCOUNT BALANCE
========================================================= */

function getTotalAccountBalanceForPage() {

    const accounts =
        getAccountsForPage();


    let total =
        0;


    accounts.forEach(
        account => {

            total +=
                getAccountBalanceForPage(
                    account.id
                );

        }
    );


    return total;

}



/* =========================================================
   RENDER ACCOUNTS
========================================================= */

function renderAccounts() {

    const list =
        document.getElementById(
            "accountsList"
        );


    const empty =
        document.getElementById(
            "emptyAccounts"
        );


    const count =
        document.getElementById(
            "accountCount"
        );


    if (!list) {

        return;

    }


    const accounts =
        getAccountsForPage();


    list.innerHTML =
        "";



    if (
        accounts.length === 0
    ) {

        if (empty) {

            empty.style.display =
                "block";

        }


        if (count) {

            count.textContent =
                "0 Accounts";

        }


        return;

    }


    if (empty) {

        empty.style.display =
            "none";

    }


    if (count) {

        count.textContent =

            accounts.length +

            (
                accounts.length === 1
                    ? " Account"
                    : " Accounts"
            );

    }



    accounts.forEach(
        account => {

            list.appendChild(
                createAccountCard(
                    account
                )
            );

        }
    );

}



/* =========================================================
   CREATE ACCOUNT CARD
========================================================= */

function createAccountCard(
    account
) {

    const balance =
        getAccountBalanceForPage(
            account.id
        );


    const card =
        document.createElement(
            "div"
        );


    card.className =
        "account-card";


    const icon =
        getAccountIcon(
            account.type
        );


    const balanceClass =
        balance < 0
            ? "negative"
            : "positive";


    card.innerHTML = `

        <div class="account-card-top">

            <div class="account-icon">

                <i class="${icon}"></i>

            </div>


            <div class="account-info">

                <h3>
                    ${escapeHTML(
                        account.name
                    )}
                </h3>

                <span>
                    ${escapeHTML(
                        account.type
                    )}
                </span>

            </div>


            <div class="account-actions">

                <button
                    type="button"
                    title="Edit"
                    aria-label="Edit Account"
                    onclick="editAccount('${escapeAttribute(
                        account.id
                    )}')"
                >

                    <i class="fa-solid fa-pen"></i>

                </button>


                <button
                    type="button"
                    title="Delete"
                    aria-label="Delete Account"
                    onclick="deleteAccount('${escapeAttribute(
                        account.id
                    )}')"
                >

                    <i class="fa-solid fa-trash"></i>

                </button>

            </div>

        </div>


        <div class="account-balance">

            <span>
                Current Balance
            </span>

            <strong class="${balanceClass}">

                ${formatMoneySafe(
                    balance
                )}

            </strong>

        </div>


        <div class="account-card-bottom">

            <span>

                Opening:
                ${formatMoneySafe(
                    account.openingBalance
                )}

            </span>

            <span>

                ${
                    account.note
                        ? escapeHTML(
                            account.note
                          )
                        : ""
                }

            </span>

        </div>

    `;


    return card;

}



/* =========================================================
   ACCOUNT ICON
========================================================= */

function getAccountIcon(
    type
) {

    switch (
        String(
            type || ""
        )
        .toLowerCase()
    ) {

        case "cash":

            return "fa-solid fa-money-bill";

        case "bank":

            return "fa-solid fa-building-columns";

        case "upi":

            return "fa-solid fa-mobile-screen-button";

        case "card":

            return "fa-solid fa-credit-card";

        default:

            return "fa-solid fa-wallet";

    }

}



/* =========================================================
   EDIT ACCOUNT
========================================================= */

function editAccount(
    accountId
) {

    const accounts =
        getAccountsForPage();


    const account =
        accounts.find(
            item =>
                item.id ===
                accountId
        );


    if (!account) {

        alert(
            "Account सापडले नाही."
        );

        return;

    }


    const card =
        document.getElementById(
            "accountFormCard"
        );


    const form =
        document.getElementById(
            "accountForm"
        );


    if (!card || !form) {

        return;

    }


    card.style.display =
        "block";


    const title =
        document.getElementById(
            "accountFormTitle"
        );


    if (title) {

        title.textContent =
            "Account Edit करा";

    }


    const nameElement =
        document.getElementById(
            "accountName"
        );


    const typeElement =
        document.getElementById(
            "accountType"
        );


    const openingElement =
        document.getElementById(
            "openingBalance"
        );


    const noteElement =
        document.getElementById(
            "accountNote"
        );


    if (nameElement) {

        nameElement.value =
            account.name || "";

    }


    if (typeElement) {

        typeElement.value =
            account.type || "";

    }


    if (openingElement) {

        openingElement.value =
            account.openingBalance || 0;

    }


    if (noteElement) {

        noteElement.value =
            account.note || "";

    }


    form.dataset.editId =
        accountId;


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}



/* =========================================================
   DELETE ACCOUNT
========================================================= */

function deleteAccount(
    accountId
) {

    const accounts =
        getAccountsForPage();


    const account =
        accounts.find(
            item =>
                item.id ===
                accountId
        );


    if (!account) {

        alert(
            "Account सापडले नाही."
        );

        return;

    }



    /* =====================================================
       CHECK TRANSACTIONS
    ===================================================== */

    let transactions = [];


    if (
        typeof window.getTransactions ===
        "function"
    ) {

        transactions =
            window.getTransactions();

    }


    const hasTransactions =
        transactions.some(
            transaction =>
                transaction.accountId ===
                accountId
        );



    /*
       Transaction असल्यास Account delete करू नका.

       यामुळे जुन्या transactions ची
       calculation खराब होणार नाही.
    */

    if (
        hasTransactions
    ) {

        alert(

            "हे Account delete करता येणार नाही.\n\n" +

            "या Account शी संबंधित व्यवहार आधीपासून उपलब्ध आहेत.\n\n" +

            "Account ठेवणे आवश्यक आहे, जेणेकरून जुन्या व्यवहारांची calculation खराब होणार नाही."

        );

        return;

    }



    const confirmDelete =
        confirm(

            `"${account.name}" Account delete करायचे आहे का?`

        );


    if (
        !confirmDelete
    ) {

        return;

    }


    const updatedAccounts =
        accounts.filter(
            item =>
                item.id !==
                accountId
        );


    const saved =
        saveAccountsForPage(
            updatedAccounts
        );


    if (!saved) {

        alert(
            "Account delete करताना समस्या आली."
        );

        return;

    }


    renderAccounts();

    updateTotalAccountBalance();

    dispatchAccountUpdate();


    alert(
        "Account delete केले आहे."
    );

}



/* =========================================================
   UPDATE TOTAL BALANCE
========================================================= */

function updateTotalAccountBalance() {

    const element =
        document.getElementById(
            "totalAccountBalance"
        );


    if (!element) {

        return;

    }


    element.textContent =
        formatMoneySafe(
            getTotalAccountBalanceForPage()
        );

}



/* =========================================================
   SAFE MONEY FORMAT
========================================================= */

function formatMoneySafe(
    amount
) {

    if (
        typeof window.formatMoney ===
        "function"
    ) {

        return window.formatMoney(
            amount
        );

    }


    const value =
        Number(
            amount
        ) || 0;


    return (

        "₹" +

        value.toLocaleString(
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
   ESCAPE HTML
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
   ESCAPE ATTRIBUTE
========================================================= */

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



/* =========================================================
   ACCOUNT UPDATE EVENT
========================================================= */

function dispatchAccountUpdate() {

    try {

        window.dispatchEvent(
            new CustomEvent(
                "rdkhAccountsUpdated"
            )
        );

    }

    catch (error) {

        console.error(
            "Account update event error:",
            error
        );

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
    function (event) {

        if (
            !event.key ||
            event.key ===
                ACCOUNTS_STORAGE_KEY ||
            event.key ===
                "rdkh_transactions_v2"
        ) {

            renderAccounts();

            updateTotalAccountBalance();

        }

    }
);



/* =========================================================
   SAME PAGE TRANSACTION UPDATE
========================================================= */

window.addEventListener(
    "rdkhTransactionsUpdated",
    function () {

        renderAccounts();

        updateTotalAccountBalance();

    }
);



/* =========================================================
   SAME PAGE ACCOUNT UPDATE
========================================================= */

window.addEventListener(
    "rdkhAccountsUpdated",
    function () {

        renderAccounts();

        updateTotalAccountBalance();

    }
);



/* =========================================================
   GLOBAL PAGE FUNCTIONS
========================================================= */

window.openAccountForm =
    openAccountForm;

window.closeAccountForm =
    closeAccountForm;

window.resetAccountForm =
    resetAccountForm;

window.saveAccount =
    saveAccount;

window.editAccount =
    editAccount;

window.deleteAccount =
    deleteAccount;

window.renderAccounts =
    renderAccounts;

window.updateTotalAccountBalance =
    updateTotalAccountBalance;



/* =========================================================
   CONSOLE
========================================================= */

console.log(
    "Accounts module loaded successfully."
);
