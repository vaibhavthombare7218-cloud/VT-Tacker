/* =========================================================
   transactions.js

   रोजचा जमा खर्च अहवाल
   TRANSACTIONS MANAGEMENT

   Connected with:
   - app.js
   - income.js
   - expense.js
   - accounts.js

   Features:
   - All transactions
   - Search
   - Income / Expense filter
   - Month filter
   - Date filter
   - Account filter
   - Category filter
   - Total Income
   - Total Expense
   - Net Balance
   - Edit
   - Delete
========================================================= */


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeTransactionsPage();

    }
);



/* =========================================================
   INITIALIZE
========================================================= */

function initializeTransactionsPage() {

    loadTransactionAccounts();

    loadTransactionCategories();

    setupTransactionFilters();

    renderTransactions();

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
        select.value || "all";


    const accounts =
        typeof getAccounts === "function"
            ? getAccounts()
            : [];


    select.innerHTML = `

        <option value="all">
            सर्व Accounts
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


    if (
        Array.from(
            select.options
        ).some(
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
   LOAD CATEGORIES
========================================================= */

function loadTransactionCategories() {

    const select =
        document.getElementById(
            "transactionCategory"
        );


    if (!select) {

        return;

    }


    const currentValue =
        select.value || "all";


    const transactions =
        getTransactions();


    const categories =
        new Set();


    transactions.forEach(
        transaction => {

            if (
                transaction.category
            ) {

                categories.add(
                    transaction.category
                );

            }

        }
    );


    select.innerHTML = `

        <option value="all">
            सर्व Categories
        </option>

    `;


    Array.from(categories)
        .sort()
        .forEach(
            category => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    category;


                option.textContent =
                    category;


                select.appendChild(
                    option
                );

            }
        );


    if (
        Array.from(
            select.options
        ).some(
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
   SETUP FILTERS
========================================================= */

function setupTransactionFilters() {

    const search =
        document.getElementById(
            "transactionSearch"
        );


    const type =
        document.getElementById(
            "transactionType"
        );


    const month =
        document.getElementById(
            "transactionMonth"
        );


    const date =
        document.getElementById(
            "transactionDate"
        );


    const account =
        document.getElementById(
            "transactionAccount"
        );


    const category =
        document.getElementById(
            "transactionCategory"
        );


    /*
       Search instantly updates results.
    */

    if (search) {

        search.addEventListener(
            "input",
            function () {

                renderTransactions();

            }
        );

    }


    /*
       Dropdown/date filters
    */

    [
        type,
        month,
        date,
        account,
        category

    ].forEach(
        element => {

            if (!element) {

                return;

            }


            element.addEventListener(
                "change",
                function () {

                    renderTransactions();

                }
            );

        }
    );

}



/* =========================================================
   APPLY FILTERS
========================================================= */

function applyTransactionFilters() {

    renderTransactions();

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


    const month =
        document.getElementById(
            "transactionMonth"
        );


    const date =
        document.getElementById(
            "transactionDate"
        );


    const account =
        document.getElementById(
            "transactionAccount"
        );


    const category =
        document.getElementById(
            "transactionCategory"
        );


    if (search) {

        search.value =
            "";

    }


    if (type) {

        type.value =
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


    if (account) {

        account.value =
            "all";

    }


    if (category) {

        category.value =
            "all";

    }


    renderTransactions();

}



/* =========================================================
   GET FILTERED TRANSACTIONS
========================================================= */

function getFilteredTransactions() {

    const transactions =
        getTransactions();


    const search =
        (
            document.getElementById(
                "transactionSearch"
            )?.value || ""
        )
            .trim()
            .toLowerCase();


    const type =
        document.getElementById(
            "transactionType"
        )?.value || "all";


    const month =
        document.getElementById(
            "transactionMonth"
        )?.value || "";


    const date =
        document.getElementById(
            "transactionDate"
        )?.value || "";


    const account =
        document.getElementById(
            "transactionAccount"
        )?.value || "all";


    const category =
        document.getElementById(
            "transactionCategory"
        )?.value || "all";


    return transactions
        .filter(
            transaction => {


                /* =========================================
                   TYPE
                ========================================= */

                if (
                    type !== "all" &&
                    transaction.type !== type
                ) {

                    return false;

                }



                /* =========================================
                   MONTH
                ========================================= */

                if (month) {

                    if (
                        !transaction.date ||
                        !transaction.date.startsWith(
                            month
                        )
                    ) {

                        return false;

                    }

                }



                /* =========================================
                   SPECIFIC DATE
                ========================================= */

                if (date) {

                    if (
                        transaction.date !==
                        date
                    ) {

                        return false;

                    }

                }



                /* =========================================
                   ACCOUNT
                ========================================= */

                if (
                    account !== "all" &&
                    transaction.accountId !==
                    account
                ) {

                    return false;

                }



                /* =========================================
                   CATEGORY
                ========================================= */

                if (
                    category !== "all" &&
                    transaction.category !==
                    category
                ) {

                    return false;

                }



                /* =========================================
                   SEARCH
                ========================================= */

                if (search) {

                    const searchableText = [

                        transaction.category,

                        transaction.note,

                        transaction.paymentMode,

                        transaction.type,

                        getAccountName(
                            transaction.accountId
                        )

                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();


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
        )

        /*
           Newest transaction first
        */

        .sort(
            function (a, b) {

                const dateA =
                    new Date(
                        a.date +
                        "T" +
                        (
                            a.createdAt
                                ? new Date(
                                    a.createdAt
                                ).toTimeString()
                                    .slice(0, 8)
                                : "00:00:00"
                        )
                    );


                const dateB =
                    new Date(
                        b.date +
                        "T" +
                        (
                            b.createdAt
                                ? new Date(
                                    b.createdAt
                                ).toTimeString()
                                    .slice(0, 8)
                                : "00:00:00"
                        )
                    );


                return dateB - dateA;

            }
        );

}



/* =========================================================
   RENDER TRANSACTIONS
========================================================= */

function renderTransactions() {

    const list =
        document.getElementById(
            "transactionsList"
        );


    const empty =
        document.getElementById(
            "emptyTransactions"
        );


    const count =
        document.getElementById(
            "transactionCount"
        );


    if (!list) {

        return;

    }


    const transactions =
        getFilteredTransactions();


    list.innerHTML =
        "";



    /* =====================================================
       UPDATE SUMMARY
    ===================================================== */

    updateTransactionSummary(
        transactions
    );



    /* =====================================================
       COUNT
    ===================================================== */

    if (count) {

        count.textContent =

            transactions.length +

            (
                transactions.length === 1
                    ? " व्यवहार"
                    : " व्यवहार"
            );

    }



    /* =====================================================
       EMPTY
    ===================================================== */

    if (
        transactions.length === 0
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



    /* =====================================================
       CREATE CARDS
    ===================================================== */

    transactions.forEach(
        transaction => {

            list.appendChild(
                createTransactionCard(
                    transaction
                )
            );

        }
    );

}



/* =========================================================
   SUMMARY
========================================================= */

function updateTransactionSummary(
    transactions
) {

    let income =
        0;


    let expense =
        0;


    transactions.forEach(
        transaction => {

            const amount =
                Number(
                    transaction.amount
                ) || 0;


            if (
                transaction.type ===
                "income"
            ) {

                income += amount;

            }


            else if (
                transaction.type ===
                "expense"
            ) {

                expense += amount;

            }

        }
    );


    const balance =
        income - expense;



    const incomeElement =
        document.getElementById(
            "filteredIncome"
        );


    const expenseElement =
        document.getElementById(
            "filteredExpense"
        );


    const balanceElement =
        document.getElementById(
            "filteredBalance"
        );


    if (incomeElement) {

        incomeElement.textContent =
            formatMoney(
                income
            );

    }


    if (expenseElement) {

        expenseElement.textContent =
            formatMoney(
                expense
            );

    }


    if (balanceElement) {

        balanceElement.textContent =
            formatMoney(
                balance
            );

    }

}



/* =========================================================
   CREATE TRANSACTION CARD
========================================================= */

function createTransactionCard(
    transaction
) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "transaction-card";


    const isIncome =
        transaction.type ===
        "income";


    const typeClass =
        isIncome
            ? "income"
            : "expense";


    const typeText =
        isIncome
            ? "जमा"
            : "खर्च";


    const typeIcon =
        isIncome
            ? "fa-solid fa-arrow-down"
            : "fa-solid fa-arrow-up";


    const sign =
        isIncome
            ? "+"
            : "-";


    const accountName =
        getAccountName(
            transaction.accountId
        );


    const category =
        transaction.category ||
        (
            isIncome
                ? "जमा"
                : "खर्च"
        );


    const dateText =
        formatTransactionDate(
            transaction.date
        );


    card.innerHTML = `

        <div class="transaction-card-top">


            <div
                class="transaction-type-icon ${typeClass}"
            >

                <i class="${typeIcon}"></i>

            </div>


            <div class="transaction-info">

                <h4>
                    ${escapeTransactionHTML(
                        category
                    )}
                </h4>


                <p>

                    <i class="fa-solid fa-wallet"></i>

                    ${escapeTransactionHTML(
                        accountName
                    )}

                </p>


                ${
                    transaction.note
                        ? `
                            <p>

                                <i class="fa-solid fa-note-sticky"></i>

                                ${escapeTransactionHTML(
                                    transaction.note
                                )}

                            </p>
                          `
                        : ""
                }

            </div>


            <div class="transaction-amount">

                <strong class="${typeClass}">

                    ${sign}
                    ${formatMoney(
                        transaction.amount
                    )}

                </strong>


                <div class="transaction-date">

                    ${dateText}

                </div>

            </div>

        </div>



        <div class="transaction-card-bottom">


            <span>

                ${typeText}

                ${
                    transaction.paymentMode
                        ? " • " +
                          escapeTransactionHTML(
                              transaction.paymentMode
                          )
                        : ""
                }

            </span>



            <div class="transaction-actions">


                <button
                    type="button"
                    title="Edit"
                    onclick="editTransaction('${transaction.id}')"
                >

                    <i class="fa-solid fa-pen"></i>

                </button>



                <button
                    type="button"
                    class="delete-btn"
                    title="Delete"
                    onclick="deleteTransaction('${transaction.id}')"
                >

                    <i class="fa-solid fa-trash"></i>

                </button>


            </div>


        </div>

    `;


    return card;

}



/* =========================================================
   GET ACCOUNT NAME
========================================================= */

function getAccountName(
    accountId
) {

    if (!accountId) {

        return "Account नाही";

    }


    const accounts =
        typeof getAccounts === "function"
            ? getAccounts()
            : [];


    const account =
        accounts.find(
            item =>
                item.id ===
                accountId
        );


    return account
        ? account.name
        : "Account नाही";

}



/* =========================================================
   FORMAT DATE
========================================================= */

function formatTransactionDate(
    date
) {

    if (!date) {

        return "--";

    }


    const parts =
        date.split("-");


    if (
        parts.length !== 3
    ) {

        return date;

    }


    return (
        parts[2] +
        "/" +
        parts[1] +
        "/" +
        parts[0]
    );

}



/* =========================================================
   EDIT TRANSACTION
========================================================= */

function editTransaction(
    transactionId
) {

    const transactions =
        getTransactions();


    const transaction =
        transactions.find(
            item =>
                item.id ===
                transactionId
        );


    if (!transaction) {

        alert(
            "व्यवहार सापडला नाही."
        );

        return;

    }


    /*
       Income आणि Expense साठी
       respective page वर पाठवतो.
    */

    if (
        transaction.type ===
        "income"
    ) {

        localStorage.setItem(
            "rdkh_edit_transaction",
            JSON.stringify(
                transaction
            )
        );


        window.location.href =
            "income.html";

        return;

    }


    if (
        transaction.type ===
        "expense"
    ) {

        localStorage.setItem(
            "rdkh_edit_transaction",
            JSON.stringify(
                transaction
            )
        );


        window.location.href =
            "expense.html";

        return;

    }

}



/* =========================================================
   DELETE TRANSACTION
========================================================= */

function deleteTransaction(
    transactionId
) {

    const transactions =
        getTransactions();


    const transaction =
        transactions.find(
            item =>
                item.id ===
                transactionId
        );


    if (!transaction) {

        alert(
            "व्यवहार सापडला नाही."
        );

        return;

    }


    const typeText =
        transaction.type ===
        "income"
            ? "जमा"
            : "खर्च";


    const confirmDelete =
        confirm(

            typeText +
            " " +
            formatMoney(
                transaction.amount
            ) +
            " चा व्यवहार delete करायचा आहे का?\n\n" +

            "हा व्यवहार delete केल्यास Account Balance सुद्धा update होईल."

        );


    if (!confirmDelete) {

        return;

    }


    const updatedTransactions =
        transactions.filter(
            item =>
                item.id !==
                transactionId
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


    renderTransactions();


    /*
       Account page open असेल तर
       storage event द्वारे update होईल.
    */


    alert(
        "व्यवहार delete केला आहे."
    );

}



/* =========================================================
   ESCAPE HTML
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
   QUICK ADD MENU
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

        loadTransactionAccounts();

        loadTransactionCategories();

        renderTransactions();

    }
);
