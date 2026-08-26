/* =========================================================
   accounts.js

   रोजचा जमा खर्च अहवाल
   ACCOUNT MANAGEMENT

   Formula:

   Current Balance
   =
   Opening Balance
   + Income
   - Expense

   Accounts are stored separately.
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

    initializeAccounts();

    setupAccountForm();

    renderAccounts();

    updateTotalAccountBalance();

}



/* =========================================================
   INITIALIZE DEFAULT ACCOUNTS
========================================================= */

function initializeAccounts() {

    const existing =
        localStorage.getItem(
            ACCOUNTS_STORAGE_KEY
        );


    /*
       जर Accounts आधीच आहेत
       तर काहीही करू नका.
    */

    if (existing) {

        return;

    }


    /*
       Default Accounts

       User नंतर edit/delete करू शकतो.
    */

    const defaultAccounts = [

        {
            id: "ACC-CASH",
            name: "Cash",
            type: "Cash",
            openingBalance: 0,
            note: "Cash in hand",
            createdAt:
                new Date().toISOString()
        },

        {
            id: "ACC-BANK",
            name: "Bank Account",
            type: "Bank",
            openingBalance: 0,
            note: "Main bank account",
            createdAt:
                new Date().toISOString()
        },

        {
            id: "ACC-UPI",
            name: "UPI",
            type: "UPI",
            openingBalance: 0,
            note: "UPI balance",
            createdAt:
                new Date().toISOString()
        }

    ];


    localStorage.setItem(
        ACCOUNTS_STORAGE_KEY,
        JSON.stringify(
            defaultAccounts
        )
    );

}



/* =========================================================
   GET ACCOUNTS
========================================================= */

function getAccounts() {

    try {

        const stored =
            localStorage.getItem(
                ACCOUNTS_STORAGE_KEY
            );


        if (!stored) {

            return [];

        }


        const accounts =
            JSON.parse(
                stored
            );


        return Array.isArray(accounts)
            ? accounts
            : [];

    }

    catch (error) {

        console.error(
            "Accounts loading error:",
            error
        );

        return [];

    }

}



/* =========================================================
   SAVE ACCOUNTS
========================================================= */

function saveAccounts(
    accounts
) {

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
            "Accounts save error:",
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


    form.addEventListener(
        "submit",
        saveAccount
    );

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


    document.getElementById(
        "accountFormTitle"
    ).textContent =
        "नवीन Account";


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


    const name =
        document
            .getElementById(
                "accountName"
            )
            .value
            .trim();


    const type =
        document
            .getElementById(
                "accountType"
            )
            .value;


    const openingBalance =
        Number(
            document
                .getElementById(
                    "openingBalance"
                )
                .value
        );


    const note =
        document
            .getElementById(
                "accountNote"
            )
            .value
            .trim();


    const form =
        document.getElementById(
            "accountForm"
        );


    const editId =
        form.dataset.editId || "";



    /* =====================================================
       VALIDATION
    ===================================================== */

    if (!name) {

        alert(
            "कृपया Account Name भरा."
        );

        return;

    }


    if (!type) {

        alert(
            "कृपया Account Type निवडा."
        );

        return;

    }


    if (
        isNaN(openingBalance) ||
        openingBalance < 0
    ) {

        alert(
            "कृपया योग्य Opening Balance भरा."
        );

        return;

    }



    /* =====================================================
       GET EXISTING ACCOUNTS
    ===================================================== */

    const accounts =
        getAccounts();



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
           Duplicate name check
        */

        const duplicate =
            accounts.some(
                account =>

                    account.id !== editId &&

                    account.name
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

           Opening Balance बदलण्याची
           परवानगी येथे आहे.
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


        if (
            !saveAccounts(
                accounts
            )
        ) {

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

        return;

    }



    /* =====================================================
       NEW ACCOUNT
    ===================================================== */

    const duplicate =
        accounts.some(
            account =>

                account.name
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
            new Date().toISOString()

    };



    accounts.push(
        newAccount
    );



    if (
        !saveAccounts(
            accounts
        )
    ) {

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
            .substring(2, 8)

    );

}



/* =========================================================
   GET ACCOUNT BALANCE
========================================================= */

function getAccountBalance(
    accountId
) {

    const accounts =
        getAccounts();


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


    /*
       Transactions app.js मधून येतील
    */

    const transactions =
        getTransactions();


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

                balance += amount;

            }


            else if (
                transaction.type ===
                "expense"
            ) {

                balance -= amount;

            }

        }
    );


    return balance;

}



/* =========================================================
   GET TOTAL BALANCE
========================================================= */

function getTotalAccountBalance() {

    const accounts =
        getAccounts();


    let total = 0;


    accounts.forEach(
        account => {

            total +=
                getAccountBalance(
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
        getAccounts();


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
        getAccountBalance(
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
                    onclick="editAccount('${account.id}')"
                >

                    <i class="fa-solid fa-pen"></i>

                </button>


                <button
                    type="button"
                    title="Delete"
                    onclick="deleteAccount('${account.id}')"
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

                ${formatMoney(
                    balance
                )}

            </strong>

        </div>


        <div class="account-card-bottom">

            <span>

                Opening:
                ${formatMoney(
                    account.openingBalance
                )}

            </span>

            <span>

                ${account.note
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

    switch (type) {

        case "Cash":

            return "fa-solid fa-money-bill";

        case "Bank":

            return "fa-solid fa-building-columns";

        case "UPI":

            return "fa-solid fa-mobile-screen-button";

        case "Card":

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
        getAccounts();


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


    document.getElementById(
        "accountFormTitle"
    ).textContent =
        "Account Edit करा";


    document.getElementById(
        "accountName"
    ).value =
        account.name;


    document.getElementById(
        "accountType"
    ).value =
        account.type;


    document.getElementById(
        "openingBalance"
    ).value =
        account.openingBalance;


    document.getElementById(
        "accountNote"
    ).value =
        account.note || "";


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
        getAccounts();


    const account =
        accounts.find(
            item =>
                item.id ===
                accountId
        );


    if (!account) {

        return;

    }



    /* =====================================================
       CHECK TRANSACTIONS
    ===================================================== */

    const transactions =
        getTransactions();


    const hasTransactions =
        transactions.some(
            transaction =>
                transaction.accountId ===
                accountId
        );



    if (hasTransactions) {

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


    if (!confirmDelete) {

        return;

    }


    const updatedAccounts =
        accounts.filter(
            item =>
                item.id !==
                accountId
        );


    if (
        !saveAccounts(
            updatedAccounts
        )
    ) {

        alert(
            "Account delete करताना समस्या आली."
        );

        return;

    }


    renderAccounts();

    updateTotalAccountBalance();


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
        formatMoney(
            getTotalAccountBalance()
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

        renderAccounts();

        updateTotalAccountBalance();

    }
);
