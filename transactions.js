/* =========================================================
   transactions.js

   रोजचा जमा खर्च अहवाल
   TRANSACTION MANAGEMENT

   CONNECTED WITH:
   - app.js
   - income.js
   - expense.js
   - accounts.js
   - monthly-budget.js

   STORAGE:
   - rdkh_transactions
   - rdkh_accounts
========================================================= */


/* =========================================================
   GLOBAL VARIABLES
========================================================= */

let transactionList = [];

let transactionToDelete = null;

let transactionToEdit = null;



/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeAccounts();

        loadTransactionAccounts();

        setDefaultTransactionMonth();

        setupTransactionEvents();

        loadTransactions();

    }
);



/* =========================================================
   LOAD TRANSACTIONS
========================================================= */

function loadTransactions() {

    const transactions =
        getTransactions();


    transactionList =
        Array.isArray(transactions)
            ? [...transactions]
            : [];


    applyTransactionFilters();

}



/* =========================================================
   LOAD ACCOUNTS
========================================================= */

function loadTransactionAccounts() {

    const select =
        document.getElementById(
            "transactionAccount"
        );


    if (!select) {

        return;

    }


    const currentValue =
        select.value;


    select.innerHTML = `

        <option value="all">
            सर्व खाती
        </option>

    `;


    const accounts =
        getAccounts();


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


    if (
        currentValue &&
        [...select.options].some(
            option =>
                option.value ===
                currentValue
        )
    ) {

        select.value =
            currentValue;

    }

}



/* =========================================================
   DEFAULT MONTH
========================================================= */

function setDefaultTransactionMonth() {

    const month =
        document.getElementById(
            "transactionMonth"
        );


    if (!month) {

        return;

    }


    /*
       सुरुवातीला current month दाखवू.
    */

    month.value =
        getCurrentMonth();

}



/* =========================================================
   EVENT SETUP
========================================================= */

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

                /*
                   Month निवडल्यास
                   specific date clear करा.
                */

                if (date) {

                    date.value =
                        "";

                }


                applyTransactionFilters();

            }
        );

    }


    if (date) {

        date.addEventListener(
            "change",
            function () {

                /*
                   Specific date निवडल्यास
                   month filter clear करा.
                */

                if (month) {

                    month.value =
                        "";

                }


                applyTransactionFilters();

            }
        );

    }

}



/* =========================================================
   APPLY FILTERS
========================================================= */

function applyTransactionFilters() {

    const searchInput =
        document.getElementById(
            "transactionSearch"
        );


    const typeInput =
        document.getElementById(
            "transactionType"
        );


    const accountInput =
        document.getElementById(
            "transactionAccount"
        );


    const monthInput =
        document.getElementById(
            "transactionMonth"
        );


    const dateInput =
        document.getElementById(
            "transactionDate"
        );


    const search =
        (
            searchInput?.value ||
            ""
        )
            .trim()
            .toLowerCase();


    const selectedType =
        typeInput?.value ||
        "all";


    const selectedAccount =
        accountInput?.value ||
        "all";


    const selectedMonth =
        monthInput?.value ||
        "";


    const selectedDate =
        dateInput?.value ||
        "";



    const filtered =
        transactionList.filter(
            transaction => {


                /* --------------------------------
                   TYPE
                -------------------------------- */

                if (
                    selectedType !==
                    "all"
                ) {

                    if (
                        transaction.type !==
                        selectedType
                    ) {

                        return false;

                    }

                }



                /* --------------------------------
                   ACCOUNT
                -------------------------------- */

                if (
                    selectedAccount !==
                    "all"
                ) {

                    if (
                        transaction.accountId !==
                        selectedAccount
                    ) {

                        return false;

                    }

                }



                /* --------------------------------
                   MONTH
                -------------------------------- */

                if (
                    selectedMonth
                ) {

                    const date =
                        normalizeTransactionDate(
                            transaction.date
                        );


                    if (
                        !date.startsWith(
                            selectedMonth
                        )
                    ) {

                        return false;

                    }

                }



                /* --------------------------------
                   DATE
                -------------------------------- */

                if (
                    selectedDate
                ) {

                    const date =
                        normalizeTransactionDate(
                            transaction.date
                        );


                    if (
                        date !==
                        selectedDate
                    ) {

                        return false;

                    }

                }



                /* --------------------------------
                   SEARCH
                -------------------------------- */

                if (
                    search
                ) {

                    const accountName =
                        getAccountName(
                            transaction.accountId
                        );


                    const searchableText = [

                        transaction.category,

                        transaction.note,

                        transaction.paymentMode,

                        accountName,

                        transaction.type,

                        transaction.date,

                        transaction.amount

                    ]
                        .map(
                            value =>
                                String(
                                    value ?? ""
                                )
                                    .toLowerCase()
                        )
                        .join(" ");


                    if (
                        !searchableText.includes(
                            search
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


    updateTransactionSummary(
        filtered
    );

}



/* =========================================================
   RENDER TRANSACTIONS
========================================================= */

function renderTransactions(
    transactions
) {

    const container =
        document.getElementById(
            "transactionsList"
        );


    const emptyState =
        document.getElementById(
            "emptyTransactionState"
        );


    if (!container) {

        return;

    }



    /*
       Remove old transaction items
       पण empty state ठेवायची.
    */

    const oldItems =
        container.querySelectorAll(
            ".transaction-record"
        );


    oldItems.forEach(
        item => {

            item.remove();

        }
    );



    /*
       No transactions
    */

    if (
        !transactions ||
        transactions.length === 0
    ) {

        if (emptyState) {

            emptyState.style.display =
                "block";

        }


        updateTransactionCount(
            0
        );


        return;

    }


    if (emptyState) {

        emptyState.style.display =
            "none";

    }



    /*
       Sort:
       नवीन व्यवहार प्रथम
    */

    const sorted =
        [...transactions]
            .sort(
                sortTransactions
            );



    sorted.forEach(
        transaction => {

            const element =
                createTransactionElement(
                    transaction
                );


            container.appendChild(
                element
            );

        }
    );


    updateTransactionCount(
        sorted.length
    );

}



/* =========================================================
   SORT TRANSACTIONS
========================================================= */

function sortTransactions(
    a,
    b
) {

    const dateA =
        normalizeTransactionDate(
            a.date
        );


    const dateB =
        normalizeTransactionDate(
            b.date
        );


    if (
        dateA !==
        dateB
    ) {

        return dateB.localeCompare(
            dateA
        );

    }


    const createdA =
        new Date(
            a.createdAt || 0
        ).getTime();


    const createdB =
        new Date(
            b.createdAt || 0
        ).getTime();


    return createdB -
        createdA;

}



/* =========================================================
   CREATE TRANSACTION CARD
========================================================= */

function createTransactionElement(
    transaction
) {

    const item =
        document.createElement(
            "div"
        );


    item.className =
        "transaction-record";


    item.dataset.id =
        transaction.id;



    const isIncome =
        transaction.type ===
        "income";


    const typeText =
        isIncome
            ? "जमा"
            : "खर्च";


    const accountName =
        getAccountName(
            transaction.accountId
        );


    const amount =
        Number(
            transaction.amount
        ) || 0;



    item.innerHTML = `

        <div class="transaction-record-icon
                    ${isIncome
                        ? "income"
                        : "expense"}">

            <i class="fa-solid
                ${isIncome
                    ? "fa-arrow-down"
                    : "fa-arrow-up"}">
            </i>

        </div>


        <div class="transaction-record-main">

            <div class="transaction-record-title">

                <strong>

                    ${escapeTransactionHTML(
                        transaction.category ||
                        typeText
                    )}

                </strong>

                <span class="
                    transaction-type-badge
                    ${isIncome
                        ? "income-badge"
                        : "expense-badge"}
                ">

                    ${typeText}

                </span>

            </div>


            <div class="transaction-record-info">

                <span>

                    <i class="fa-regular fa-calendar"></i>

                    ${formatTransactionDate(
                        transaction.date
                    )}

                </span>


                <span>

                    <i class="fa-solid fa-wallet"></i>

                    ${escapeTransactionHTML(
                        accountName
                    )}

                </span>


                ${
                    transaction.paymentMode
                        ? `
                            <span>

                                <i class="fa-solid fa-credit-card"></i>

                                ${escapeTransactionHTML(
                                    transaction.paymentMode
                                )}

                            </span>
                          `
                        : ""
                }

            </div>


            ${
                transaction.note
                    ? `
                        <div class="transaction-record-note">

                            <i class="fa-regular fa-note-sticky"></i>

                            ${escapeTransactionHTML(
                                transaction.note
                            )}

                        </div>
                      `
                    : ""
            }

        </div>


        <div class="transaction-record-right">

            <strong class="
                transaction-record-amount
                ${isIncome
                    ? "income-amount"
                    : "expense-amount"}
            ">

                ${isIncome ? "+" : "-"}

                ${formatMoney(
                    amount
                )}

            </strong>


            <div class="transaction-record-actions">

                <button
                    type="button"
                    class="transaction-edit-btn"
                    onclick="editTransaction(
                        '${escapeAttribute(
                            transaction.id
                        )}'
                    )"
                    title="Edit">

                    <i class="fa-solid fa-pen"></i>

                </button>


                <button
                    type="button"
                    class="transaction-delete-btn"
                    onclick="deleteTransaction(
                        '${escapeAttribute(
                            transaction.id
                        )}'
                    )"
                    title="Delete">

                    <i class="fa-solid fa-trash"></i>

                </button>

            </div>

        </div>

    `;


    return item;

}



/* =========================================================
   TRANSACTION SUMMARY
========================================================= */

function updateTransactionSummary(
    transactions
) {

    let totalIncome =
        0;


    let totalExpense =
        0;


    (transactions || []).forEach(
        transaction => {

            const amount =
                Number(
                    transaction.amount
                ) || 0;


            if (
                transaction.type ===
                "income"
            ) {

                totalIncome +=
                    amount;

            }


            else if (
                transaction.type ===
                "expense"
            ) {

                totalExpense +=
                    amount;

            }

        }
    );


    const netBalance =
        totalIncome -
        totalExpense;



    setTransactionText(
        "transactionTotalIncome",
        formatMoney(
            totalIncome
        )
    );


    setTransactionText(
        "transactionTotalExpense",
        formatMoney(
            totalExpense
        )
    );


    setTransactionText(
        "transactionNetBalance",
        formatMoney(
            netBalance
        )
    );


    const balanceElement =
        document.getElementById(
            "transactionNetBalance"
        );


    if (balanceElement) {

        balanceElement.style.color =
            netBalance >= 0
                ? "var(--income)"
                : "var(--expense)";

    }

}



/* =========================================================
   TRANSACTION COUNT
========================================================= */

function updateTransactionCount(
    count
) {

    const element =
        document.getElementById(
            "transactionCount"
        );


    if (!element) {

        return;

    }


    element.textContent =
        count +
        (
            count === 1
                ? " व्यवहार"
                : " व्यवहार"
        );

}



/* =========================================================
   EDIT TRANSACTION
========================================================= */

function editTransaction(
    transactionId
) {

    const transaction =
        transactionList.find(
            item =>
                String(item.id) ===
                String(transactionId)
        );


    if (!transaction) {

        alert(
            "व्यवहार सापडला नाही."
        );

        return;

    }


    /*
       Existing income/expense pages मध्ये
       edit करण्यासाठी त्या page वर घेऊन जाऊ.
    */

    transactionToEdit =
        transaction;



    /*
       Data sessionStorage मध्ये ठेवतो.
       Income/Expense page पुढे edit mode मध्ये
       वापरू शकते.
    */

    try {

        sessionStorage.setItem(
            "rdkh_edit_transaction",
            JSON.stringify(
                transaction
            )
        );

    }

    catch (error) {

        console.error(
            "Edit storage error:",
            error
        );

    }



    if (
        transaction.type ===
        "income"
    ) {

        window.location.href =
            "income.html?edit=" +
            encodeURIComponent(
                transaction.id
            );

    }

    else {

        window.location.href =
            "expense.html?edit=" +
            encodeURIComponent(
                transaction.id
            );

    }

}



/* =========================================================
   DELETE TRANSACTION
========================================================= */

function deleteTransaction(
    transactionId
) {

    const transaction =
        transactionList.find(
            item =>
                String(item.id) ===
                String(transactionId)
        );


    if (!transaction) {

        alert(
            "व्यवहार सापडला नाही."
        );

        return;

    }


    transactionToDelete =
        transaction;



    const message =
        document.getElementById(
            "deleteTransactionMessage"
        );


    if (message) {

        const type =
            transaction.type ===
            "income"
                ? "जमा"
                : "खर्च";


        message.textContent =
            `${type} ${formatMoney(
                transaction.amount
            )} चा व्यवहार delete करायचा आहे का?`;

    }



    const modal =
        document.getElementById(
            "deleteTransactionModal"
        );


    if (modal) {

        modal.style.display =
            "flex";

    }

}



/* =========================================================
   CLOSE DELETE MODAL
========================================================= */

function closeDeleteModal() {

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

}



/* =========================================================
   CONFIRM DELETE
========================================================= */

function confirmDeleteTransaction() {

    if (
        !transactionToDelete
    ) {

        closeDeleteModal();

        return;

    }


    const deleteId =
        transactionToDelete.id;


    const transactions =
        getTransactions();


    const updatedTransactions =
        transactions.filter(
            transaction =>
                String(
                    transaction.id
                ) !==
                String(
                    deleteId
                )
        );


    const saved =
        saveTransactions(
            updatedTransactions
        );


    if (!saved) {

        alert(
            "व्यवहार delete करताना समस्या आली."
        );

        return;

    }



    /*
       Local list update
    */

    transactionList =
        [...updatedTransactions];


    closeDeleteModal();


    /*
       Refresh screen
    */

    applyTransactionFilters();



    /*
       Dashboard refresh
    */

    if (
        typeof updateDashboard ===
        "function"
    ) {

        updateDashboard();

    }



    /*
       Custom event
       Budget page / other modules
       refresh करू शकतात.
    */

    dispatchTransactionsUpdated();



    alert(
        "व्यवहार यशस्वीपणे delete केला आहे."
    );

}



/* =========================================================
   CLEAR FILTERS
========================================================= */

function clearTransactionFilters() {

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

        search.value =
            "";

    }


    if (type) {

        type.value =
            "all";

    }


    if (account) {

        account.value =
            "all";

    }


    if (month) {

        month.value =
            "";

    }


    if (date) {

        date.value =
            "";

    }


    applyTransactionFilters();

}



/* =========================================================
   GET ACCOUNT NAME
========================================================= */

function getAccountName(
    accountId
) {

    if (!accountId) {

        return "खाते उपलब्ध नाही";

    }


    const accounts =
        getAccounts();


    const account =
        accounts.find(
            item =>
                String(item.id) ===
                String(accountId)
        );


    return account
        ? account.name
        : "खाते उपलब्ध नाही";

}



/* =========================================================
   NORMALIZE DATE
========================================================= */

function normalizeTransactionDate(
    date
) {

    if (!date) {

        return "";

    }


    const stringDate =
        String(
            date
        );


    /*
       Already YYYY-MM-DD
    */

    if (
        /^\d{4}-\d{2}-\d{2}$/
            .test(
                stringDate
            )
    ) {

        return stringDate;

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
   FORMAT DATE
========================================================= */

function formatTransactionDate(
    date
) {

    const normalized =
        normalizeTransactionDate(
            date
        );


    if (!normalized) {

        return "तारीख उपलब्ध नाही";

    }


    const parts =
        normalized.split("-");


    if (
        parts.length !== 3
    ) {

        return normalized;

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
   SET TEXT
========================================================= */

function setTransactionText(
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
   HTML ESCAPE
========================================================= */

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



/* =========================================================
   ATTRIBUTE ESCAPE
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
   TRANSACTION UPDATE EVENT
========================================================= */

function dispatchTransactionsUpdated() {

    try {

        window.dispatchEvent(
            new Event(
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
   STORAGE SYNC
========================================================= */

window.addEventListener(
    "storage",
    function (event) {

        if (
            event.key ===
                "rdkh_transactions" ||
            event.key ===
                "rdkh_accounts"
        ) {

            loadTransactionAccounts();

            loadTransactions();

        }

    }
);



/* =========================================================
   CUSTOM TRANSACTION EVENT
========================================================= */

window.addEventListener(
    "rdkhTransactionsUpdated",
    function () {

        loadTransactionAccounts();

        loadTransactions();

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


function goToAccounts() {

    window.location.href =
        "accounts.html";

}


function goToBudget() {

    window.location.href =
        "monthly-budget.html";

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
