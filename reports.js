/* =========================================================
   reports.js
   रोजचा जमा खर्च अहवाल
   REPORTS MANAGEMENT

   VERSION:
   Central Transaction System

   FEATURES
   ---------------------------------------------------------
   ✅ Total Income
   ✅ Total Expense
   ✅ Net Balance
   ✅ Transaction Count
   ✅ Transaction List
   ✅ Income / Expense Type
   ✅ Amount Display
   ✅ Category-wise Expense
   ✅ Account-wise Report
   ✅ Monthly Budget Report
   ✅ Date Filter
   ✅ Month Filter
   ✅ Search
   ✅ Type Filter
   ✅ Account Filter
   ✅ Export CSV
   ========================================================= */


/* =========================================================
   1. STORAGE
========================================================= */

const REPORT_TRANSACTIONS_KEY =
    "rdkh_transactions_v2";

const REPORT_OLD_TRANSACTIONS_KEY =
    "rdkh_transactions";

const REPORT_BUDGET_KEY =
    "monthly_budgets";

const REPORT_OLD_BUDGET_KEY =
    "rdkh_monthly_budgets";


/* =========================================================
   2. REPORT STATE
========================================================= */

let reportTransactions = [];

let filteredReportTransactions = [];

let currentReportMonth = "";

let currentReportDate = "";

let currentReportType = "all";

let currentReportAccount = "all";

let currentReportSearch = "";


/* =========================================================
   3. DOM HELPERS
========================================================= */

function reportGetElement(...ids) {

    for (const id of ids) {

        const element =
            document.getElementById(id);

        if (element) {
            return element;
        }
    }

    return null;
}


function reportSetText(
    value,
    ...ids
) {

    const element =
        reportGetElement(...ids);

    if (element) {

        element.textContent =
            value;
    }
}


function reportSetHTML(
    html,
    ...ids
) {

    const element =
        reportGetElement(...ids);

    if (element) {

        element.innerHTML =
            html;
    }
}


/* =========================================================
   4. MONEY FORMAT
========================================================= */

function reportFormatMoney(amount) {

    const value =
        Number(amount) || 0;

    return "₹" +
        value.toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }
        );
}


/* =========================================================
   5. DATE FORMAT
========================================================= */

function reportNormalizeDate(value) {

    if (!value) {
        return "";
    }

    if (
        typeof window.normalizeDate ===
        "function"
    ) {

        const result =
            window.normalizeDate(value);

        if (result) {
            return result;
        }
    }


    const text =
        String(value).trim();


    if (
        /^\d{4}-\d{2}-\d{2}$/.test(text)
    ) {
        return text;
    }


    const date =
        new Date(text);


    if (
        isNaN(
            date.getTime()
        )
    ) {
        return "";
    }


    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;
}


function reportFormatDate(value) {

    const date =
        reportNormalizeDate(value);


    if (!date) {
        return "-";
    }


    const parts =
        date.split("-");


    if (
        parts.length !== 3
    ) {
        return date;
    }


    return `${parts[2]}-${parts[1]}-${parts[0]}`;
}


/* =========================================================
   6. HTML ESCAPE
========================================================= */

function reportEscapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }


    return String(value)
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
   7. GET RAW TRANSACTIONS
========================================================= */

function getReportRawTransactions() {

    /* -----------------------------------------
       FIRST PRIORITY:
       Central v2 transactions
    ----------------------------------------- */

    try {

        const data =
            localStorage.getItem(
                REPORT_TRANSACTIONS_KEY
            );


        if (data) {

            const parsed =
                JSON.parse(data);


            if (
                Array.isArray(parsed)
            ) {

                return parsed;
            }
        }

    } catch (error) {

        console.error(
            "Report v2 transaction read error:",
            error
        );
    }


    /* -----------------------------------------
       SECOND PRIORITY:
       app.js central function
    ----------------------------------------- */

    if (
        typeof window.getTransactions ===
        "function"
    ) {

        try {

            const data =
                window.getTransactions();


            if (
                Array.isArray(data)
            ) {

                return data;
            }

        } catch (error) {

            console.error(
                "getTransactions error:",
                error
            );
        }
    }


    /* -----------------------------------------
       THIRD PRIORITY:
       old storage
    ----------------------------------------- */

    try {

        const oldData =
            localStorage.getItem(
                REPORT_OLD_TRANSACTIONS_KEY
            );


        if (oldData) {

            const parsed =
                JSON.parse(oldData);


            if (
                Array.isArray(parsed)
            ) {

                return parsed;
            }
        }

    } catch (error) {

        console.error(
            "Old transaction read error:",
            error
        );
    }


    return [];
}


/* =========================================================
   8. NORMALIZE REPORT TRANSACTION
========================================================= */

function normalizeReportTransaction(
    transaction
) {

    if (
        !transaction ||
        typeof transaction !==
        "object"
    ) {
        return null;
    }


    /* -----------------------------------------
       TYPE
    ----------------------------------------- */

    let type =
        transaction.type ||
        transaction.transactionType ||
        "";


    type =
        String(type)
            .trim()
            .toLowerCase();


    if (
        type === "जमा" ||
        type === "income" ||
        type === "credit" ||
        type === "jamaa"
    ) {

        type = "income";
    }

    else if (
        type === "खर्च" ||
        type === "expense" ||
        type === "debit" ||
        type === "kharch"
    ) {

        type = "expense";
    }


    /* -----------------------------------------
       OLD DATA TYPE DETECTION
    ----------------------------------------- */

    if (!type) {

        if (
            transaction.incomeAmount !==
                undefined ||
            transaction.income !==
                undefined
        ) {

            type = "income";
        }

        else if (
            transaction.expenseAmount !==
                undefined ||
            transaction.expense !==
                undefined
        ) {

            type = "expense";
        }
    }


    if (
        type !== "income" &&
        type !== "expense"
    ) {
        return null;
    }


    /* -----------------------------------------
       AMOUNT
    ----------------------------------------- */

    let amount = 0;


    if (
        transaction.amount !==
            undefined &&
        transaction.amount !==
            null &&
        transaction.amount !== ""
    ) {

        amount =
            Number(
                String(
                    transaction.amount
                )
                .replace(
                    /,/g,
                    ""
                )
                .replace(
                    /₹/g,
                    ""
                )
                .trim()
            );
    }

    else if (
        type === "income" &&
        transaction.incomeAmount !==
            undefined
    ) {

        amount =
            Number(
                String(
                    transaction.incomeAmount
                )
                .replace(
                    /,/g,
                    ""
                )
                .replace(
                    /₹/g,
                    ""
                )
                .trim()
            );
    }

    else if (
        type === "expense" &&
        transaction.expenseAmount !==
            undefined
    ) {

        amount =
            Number(
                String(
                    transaction.expenseAmount
                )
                .replace(
                    /,/g,
                    ""
                )
                .replace(
                    /₹/g,
                    ""
                )
                .trim()
            );
    }


    if (
        !Number.isFinite(amount)
    ) {

        amount = 0;
    }


    /* -----------------------------------------
       DATE
    ----------------------------------------- */

    const date =
        reportNormalizeDate(
            transaction.date ||
            transaction.transactionDate ||
            transaction.incomeDate ||
            transaction.expenseDate ||
            transaction.paymentDate ||
            transaction.createdAt
        );


    /* -----------------------------------------
       CATEGORY
    ----------------------------------------- */

    const categoryId =
        transaction.categoryId ||
        transaction.category ||
        transaction.expenseCategory ||
        transaction.incomeCategory ||
        "other";


    let categoryName =
        transaction.categoryName ||
        transaction.categoryLabel ||
        transaction.expenseCategoryName ||
        transaction.incomeCategoryName ||
        "";


    if (!categoryName) {

        categoryName =
            getReportCategoryName(
                categoryId
            );
    }


    /* -----------------------------------------
       ACCOUNT
    ----------------------------------------- */

    const accountId =
        transaction.accountId ||
        transaction.accountID ||
        "";


    const accountName =
        transaction.accountName ||
        getReportAccountName(
            accountId
        );


    /* -----------------------------------------
       DESCRIPTION
    ----------------------------------------- */

    const description =
        transaction.description ||
        transaction.title ||
        transaction.name ||
        "";


    /* -----------------------------------------
       PAYMENT MODE
    ----------------------------------------- */

    const paymentMode =
        transaction.paymentMode ||
        transaction.mode ||
        "";


    /* -----------------------------------------
       NOTE
    ----------------------------------------- */

    const note =
        transaction.note ||
        transaction.notes ||
        "";


    /* -----------------------------------------
       ID
    ----------------------------------------- */

    const id =
        transaction.id ||
        transaction.transactionId ||
        transaction.txnId ||
        (
            "REPORT-" +
            date +
            "-" +
            Math.random()
                .toString(36)
                .substring(2, 9)
        );


    return {

        id: String(id),

        type: type,

        date: date,

        categoryId:
            String(categoryId),

        category:
            String(categoryId),

        categoryName:
            String(categoryName),

        description:
            String(description),

        amount:
            amount,

        accountId:
            String(accountId),

        accountName:
            String(accountName),

        paymentMode:
            String(paymentMode),

        note:
            String(note),

        createdAt:
            transaction.createdAt ||
            ""

    };
}


/* =========================================================
   9. CATEGORY NAMES
========================================================= */

const REPORT_EXPENSE_CATEGORIES = {

    daily_grocery:
        "दररोजचा किराणा खर्च",

    monthly_grocery:
        "महिन्याचा किराणा खर्च",

    travel:
        "प्रवास",

    shopping:
        "खरेदी",

    outside_food:
        "बाहेर जेवण",

    electricity:
        "लाईट बिल",

    medicine:
        "औषधे",

    home_emi:
        "घराचा EMI",

    home_maintenance:
        "घरचा मेंटेनन्स",

    insurance:
        "इन्शुरन्स पॉलिसी",

    other_loan:
        "इतर लोन",

    mobile_bill:
        "मोबाईल बिल",

    other_expense:
        "इतर खर्च",

    monthly_gas:
        "महिन्याचा गॅस",

    fish:
        "मच्छी",

    salary:
        "Salary",

    business:
        "Business",

    freelance:
        "Freelance",

    interest:
        "Interest",

    gift:
        "Gift",

    refund:
        "Refund",

    other:
        "इतर"
};


function getReportCategoryName(
    categoryId
) {

    if (
        window.EXPENSE_CATEGORIES &&
        Array.isArray(
            window.EXPENSE_CATEGORIES
        )
    ) {

        const category =
            window.EXPENSE_CATEGORIES.find(
                item =>
                    String(
                        item.id
                    ) ===
                    String(categoryId)
            );


        if (category) {

            return (
                category.name ||
                category.label ||
                category.title ||
                categoryId
            );
        }
    }


    return (
        REPORT_EXPENSE_CATEGORIES[
            categoryId
        ] ||
        categoryId ||
        "इतर"
    );
}


/* =========================================================
   10. ACCOUNT NAME
========================================================= */

function getReportAccountName(
    accountId
) {

    if (!accountId) {
        return "";
    }


    if (
        typeof window.getAccounts ===
        "function"
    ) {

        try {

            const accounts =
                window.getAccounts();


            if (
                Array.isArray(accounts)
            ) {

                const account =
                    accounts.find(
                        item =>
                            String(
                                item.id
                            ) ===
                            String(accountId)
                    );


                if (account) {

                    return (
                        account.name ||
                        ""
                    );
                }
            }

        } catch (error) {

            console.error(
                "Account lookup error:",
                error
            );
        }
    }


    return String(
        accountId
    );
}


/* =========================================================
   11. LOAD REPORT DATA
========================================================= */

function loadReportData() {

    const raw =
        getReportRawTransactions();


    reportTransactions =
        raw
            .map(
                transaction =>
                    normalizeReportTransaction(
                        transaction
                    )
            )
            .filter(Boolean);


    /* -----------------------------------------
       Remove duplicate IDs
    ----------------------------------------- */

    const map =
        new Map();


    reportTransactions.forEach(
        transaction => {

            if (
                !map.has(
                    transaction.id
                )
            ) {

                map.set(
                    transaction.id,
                    transaction
                );
            }

        }
    );


    reportTransactions =
        Array.from(
            map.values()
        );


    applyReportFilters();
}


/* =========================================================
   12. APPLY FILTERS
========================================================= */

function applyReportFilters() {

    filteredReportTransactions =
        reportTransactions.filter(
            transaction => {

                /* -----------------------------------------
                   MONTH
                ----------------------------------------- */

                if (
                    currentReportMonth &&
                    !String(
                        transaction.date ||
                        ""
                    ).startsWith(
                        currentReportMonth
                    )
                ) {

                    return false;
                }


                /* -----------------------------------------
                   DATE
                ----------------------------------------- */

                if (
                    currentReportDate &&
                    transaction.date !==
                    currentReportDate
                ) {

                    return false;
                }


                /* -----------------------------------------
                   TYPE
                ----------------------------------------- */

                if (
                    currentReportType !==
                        "all" &&
                    transaction.type !==
                        currentReportType
                ) {

                    return false;
                }


                /* -----------------------------------------
                   ACCOUNT
                ----------------------------------------- */

                if (
                    currentReportAccount !==
                        "all"
                ) {

                    if (
                        String(
                            transaction.accountId
                        ) !==
                        String(
                            currentReportAccount
                        )
                    ) {

                        return false;
                    }
                }


                /* -----------------------------------------
                   SEARCH
                ----------------------------------------- */

                if (
                    currentReportSearch
                ) {

                    const search =
                        currentReportSearch
                            .toLowerCase();


                    const searchable = [

                        transaction.categoryName,

                        transaction.description,

                        transaction.accountName,

                        transaction.paymentMode,

                        transaction.note,

                        transaction.amount

                    ]
                        .join(" ")
                        .toLowerCase();


                    if (
                        !searchable.includes(
                            search
                        )
                    ) {

                        return false;
                    }
                }


                return true;
            }
        );


    renderReport();
}


/* =========================================================
   13. REPORT SUMMARY
========================================================= */

function renderReportSummary() {

    const income =
        filteredReportTransactions

            .filter(
                transaction =>
                    transaction.type ===
                    "income"
            )

            .reduce(
                (
                    total,
                    transaction
                ) =>
                    total +
                    Number(
                        transaction.amount
                    ),
                0
            );


    const expense =
        filteredReportTransactions

            .filter(
                transaction =>
                    transaction.type ===
                    "expense"
            )

            .reduce(
                (
                    total,
                    transaction
                ) =>
                    total +
                    Number(
                        transaction.amount
                    ),
                0
            );


    const balance =
        income - expense;


    const count =
        filteredReportTransactions.length;


    reportSetText(
        reportFormatMoney(
            income
        ),
        "reportTotalIncome",
        "totalIncome",
        "reportsTotalIncome"
    );


    reportSetText(
        reportFormatMoney(
            expense
        ),
        "reportTotalExpense",
        "totalExpense",
        "reportsTotalExpense"
    );


    reportSetText(
        reportFormatMoney(
            balance
        ),
        "reportNetBalance",
        "netBalance",
        "reportsNetBalance"
    );


    reportSetText(
        count,
        "reportTransactionCount",
        "transactionCount",
        "reportsTransactionCount"
    );
}


/* =========================================================
   14. TRANSACTION LIST
========================================================= */

function renderReportTransactions() {

    const container =
        reportGetElement(
            "reportTransactionsList",
            "reportsTransactionList",
            "reportList",
            "transactionsList"
        );


    if (!container) {
        return;
    }


    if (
        !filteredReportTransactions.length
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <i class="fa-solid fa-receipt"></i>

                <p>
                    या filter साठी कोणताही व्यवहार सापडला नाही.
                </p>

            </div>

        `;

        return;
    }


    /* -----------------------------------------
       Newest first
    ----------------------------------------- */

    const transactions =
        [...filteredReportTransactions]
            .sort(
                (a, b) => {

                    const dateA =
                        new Date(
                            a.createdAt ||
                            a.date ||
                            0
                        ).getTime();


                    const dateB =
                        new Date(
                            b.createdAt ||
                            b.date ||
                            0
                        ).getTime();


                    return dateB - dateA;
                }
            );


    container.innerHTML =
        transactions.map(
            transaction => {

                const isIncome =
                    transaction.type ===
                    "income";


                const typeText =
                    isIncome
                        ? "जमा"
                        : "खर्च";


                const sign =
                    isIncome
                        ? "+"
                        : "-";


                const typeClass =
                    isIncome
                        ? "income"
                        : "expense";


                const categoryName =
                    transaction.categoryName ||
                    getReportCategoryName(
                        transaction.categoryId
                    );


                const accountName =
                    transaction.accountName ||
                    getReportAccountName(
                        transaction.accountId
                    );


                return `

                    <div class="report-transaction-item">

                        <div class="report-transaction-main">

                            <div class="report-transaction-title">

                                <strong>
                                    ${reportEscapeHTML(
                                        categoryName
                                    )}
                                </strong>

                                <span class="${typeClass}">
                                    ${typeText}
                                </span>

                            </div>


                            <div class="report-transaction-details">

                                <span>
                                    <i class="fa-regular fa-calendar"></i>
                                    ${reportFormatDate(
                                        transaction.date
                                    )}
                                </span>

                                ${
                                    transaction.description
                                        ? `
                                            <span>
                                                <i class="fa-solid fa-align-left"></i>
                                                ${reportEscapeHTML(
                                                    transaction.description
                                                )}
                                            </span>
                                          `
                                        : ""
                                }

                                ${
                                    accountName
                                        ? `
                                            <span>
                                                <i class="fa-solid fa-wallet"></i>
                                                ${reportEscapeHTML(
                                                    accountName
                                                )}
                                            </span>
                                          `
                                        : ""
                                }

                                ${
                                    transaction.paymentMode
                                        ? `
                                            <span>
                                                <i class="fa-solid fa-credit-card"></i>
                                                ${reportEscapeHTML(
                                                    transaction.paymentMode
                                                )}
                                            </span>
                                          `
                                        : ""
                                }

                            </div>

                        </div>


                        <div class="report-transaction-amount ${typeClass}">

                            ${sign}
                            ${reportFormatMoney(
                                transaction.amount
                            )}

                        </div>

                    </div>

                `;
            }
        )
        .join("");
}


/* =========================================================
   15. CATEGORY REPORT
========================================================= */

function renderCategoryReport() {

    const container =
        reportGetElement(
            "categoryReportList",
            "reportCategoryList",
            "categoryReport"
        );


    if (!container) {
        return;
    }


    const expenseTransactions =
        filteredReportTransactions
            .filter(
                transaction =>
                    transaction.type ===
                    "expense"
            );


    if (
        !expenseTransactions.length
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <i class="fa-solid fa-chart-pie"></i>

                <p>
                    खर्चाचा category-wise data उपलब्ध नाही.
                </p>

            </div>

        `;

        return;
    }


    const categoryMap =
        {};


    expenseTransactions.forEach(
        transaction => {

            const id =
                transaction.categoryId ||
                transaction.category ||
                "other";


            const name =
                transaction.categoryName ||
                getReportCategoryName(
                    id
                );


            if (
                !categoryMap[id]
            ) {

                categoryMap[id] = {

                    id: id,

                    name: name,

                    amount: 0,

                    count: 0

                };
            }


            categoryMap[id].amount +=
                Number(
                    transaction.amount
                ) || 0;


            categoryMap[id].count++;
        }
    );


    const categories =
        Object.values(
            categoryMap
        )
        .sort(
            (a, b) =>
                b.amount - a.amount
        );


    const totalExpense =
        categories.reduce(
            (
                total,
                category
            ) =>
                total +
                category.amount,
            0
        );


    container.innerHTML =
        categories.map(
            category => {

                const percentage =
                    totalExpense > 0
                        ? Math.round(
                            (
                                category.amount /
                                totalExpense
                            ) * 100
                        )
                        : 0;


                return `

                    <div class="category-report-item">

                        <div class="category-report-header">

                            <div>

                                <strong>
                                    ${reportEscapeHTML(
                                        category.name
                                    )}
                                </strong>

                                <small>
                                    ${category.count}
                                    transaction
                                </small>

                            </div>


                            <strong>
                                ${reportFormatMoney(
                                    category.amount
                                )}
                            </strong>

                        </div>


                        <div class="category-report-progress">

                            <div
                                class="category-report-progress-bar"
                                style="width:${percentage}%"
                            ></div>

                        </div>


                        <div class="category-report-footer">

                            <span>
                                ${percentage}%
                            </span>

                        </div>

                    </div>

                `;
            }
        )
        .join("");
}


/* =========================================================
   16. ACCOUNT REPORT
========================================================= */

function renderAccountReport() {

    const container =
        reportGetElement(
            "accountReportList",
            "reportAccountList",
            "accountReport"
        );


    if (!container) {
        return;
    }


    const accountMap =
        {};


    filteredReportTransactions
        .forEach(
            transaction => {

                const id =
                    transaction.accountId ||
                    "unknown";


                const name =
                    transaction.accountName ||
                    getReportAccountName(
                        id
                    ) ||
                    "खाते निवडलेले नाही";


                if (
                    !accountMap[id]
                ) {

                    accountMap[id] = {

                        id: id,

                        name: name,

                        income: 0,

                        expense: 0

                    };
                }


                if (
                    transaction.type ===
                    "income"
                ) {

                    accountMap[id].income +=
                        Number(
                            transaction.amount
                        ) || 0;
                }


                if (
                    transaction.type ===
                    "expense"
                ) {

                    accountMap[id].expense +=
                        Number(
                            transaction.amount
                        ) || 0;
                }

            }
        );


    const accounts =
        Object.values(
            accountMap
        );


    if (!accounts.length) {

        container.innerHTML = `

            <div class="empty-state">

                <p>
                    Account-wise data उपलब्ध नाही.
                </p>

            </div>

        `;

        return;
    }


    container.innerHTML =
        accounts.map(
            account => {

                const balance =
                    account.income -
                    account.expense;


                return `

                    <div class="account-report-item">

                        <div>

                            <strong>
                                ${reportEscapeHTML(
                                    account.name
                                )}
                            </strong>

                        </div>


                        <div class="account-report-values">

                            <span class="income">
                                + ${reportFormatMoney(
                                    account.income
                                )}
                            </span>

                            <span class="expense">
                                - ${reportFormatMoney(
                                    account.expense
                                )}
                            </span>

                            <strong>
                                ${reportFormatMoney(
                                    balance
                                )}
                            </strong>

                        </div>

                    </div>

                `;
            }
        )
        .join("");
}


/* =========================================================
   17. READ BUDGET
========================================================= */

function getReportBudgets() {

    let data = null;


    try {

        const newData =
            localStorage.getItem(
                REPORT_BUDGET_KEY
            );


        if (newData) {

            data =
                JSON.parse(
                    newData
                );
            }
        }

    catch (error) {

        console.error(
            "Budget read error:",
            error
        );
    }


    if (!data) {

        try {

            const oldData =
                localStorage.getItem(
                    REPORT_OLD_BUDGET_KEY
                );


            if (oldData) {

                data =
                    JSON.parse(
                        oldData
                    );
            }

        } catch (error) {

            console.error(
                "Old budget read error:",
                error
            );
        }
    }


    if (!data) {
        return [];
    }


    if (
        Array.isArray(data)
    ) {

        return data;
    }


    if (
        typeof data === "object"
    ) {

        return Object.keys(data)
            .map(
                month => {

                    const item =
                        data[month];


                    if (
                        item &&
                        typeof item ===
                        "object"
                    ) {

                        return {

                            ...item,

                            month:
                                item.month ||
                                month

                        };
                    }


                    return {

                        month:
                            month,

                        expenseBudget:
                            Number(
                                item
                            ) || 0

                    };
                }
            );
    }


    return [];
}


/* =========================================================
   18. BUDGET REPORT
========================================================= */

function renderBudgetReport() {

    const container =
        reportGetElement(
            "budgetReportList",
            "reportBudgetList",
            "budgetReport"
        );


    if (!container) {
        return;
    }


    const budgets =
        getReportBudgets();


    if (!budgets.length) {

        container.innerHTML = `

            <div class="empty-state">

                <i class="fa-solid fa-wallet"></i>

                <p>
                    Budget data उपलब्ध नाही.
                </p>

            </div>

        `;

        return;
    }


    const selectedMonth =
        currentReportMonth ||
        (
            typeof window.getCurrentMonth ===
            "function"
                ? window.getCurrentMonth()
                : ""
        );


    let monthBudgets =
        budgets;


    if (selectedMonth) {

        const selected =
            budgets.find(
                budget =>
                    String(
                        budget.month
                    ) ===
                    String(
                        selectedMonth
                    )
            );


        if (selected) {

            monthBudgets =
                [selected];
        }
    }


    container.innerHTML =
        monthBudgets.map(
            budget => {

                const month =
                    budget.month ||
                    "-";


                const planned =
                    Number(
                        budget.expenseBudget ||
                        budget.plannedExpense ||
                        0
                    );


                const actual =
                    reportTransactions

                        .filter(
                            transaction =>

                                transaction.type ===
                                "expense" &&

                                String(
                                    transaction.date ||
                                    ""
                                )
                                .startsWith(
                                    String(month)
                                )
                        )

                        .reduce(
                            (
                                total,
                                transaction
                            ) =>
                                total +
                                Number(
                                    transaction.amount
                                ),
                            0
                        );


                const remaining =
                    planned -
                    actual;


                const percentage =
                    planned > 0
                        ? Math.round(
                            (
                                actual /
                                planned
                            ) * 100
                        )
                        : 0;


                return `

                    <div class="budget-report-item">

                        <div class="budget-report-header">

                            <strong>
                                ${reportEscapeHTML(
                                    month
                                )}
                            </strong>

                            <strong>
                                ${reportFormatMoney(
                                    actual
                                )}
                                /
                                ${reportFormatMoney(
                                    planned
                                )}
                            </strong>

                        </div>


                        <div class="budget-report-progress">

                            <div
                                class="budget-report-progress-bar"
                                style="width:${Math.min(
                                    100,
                                    percentage
                                )}%"
                            ></div>

                        </div>


                        <div class="budget-report-footer">

                            <span>
                                वापर:
                                ${percentage}%
                            </span>

                            <span class="${
                                remaining < 0
                                    ? "expense"
                                    : "income"
                            }">

                                ${
                                    remaining < 0
                                        ? "Budget पेक्षा जास्त: "
                                        : "बाकी: "
                                }

                                ${reportFormatMoney(
                                    Math.abs(
                                        remaining
                                    )
                                )}

                            </span>

                        </div>

                    </div>

                `;
            }
        )
        .join("");
}


/* =========================================================
   19. RENDER COMPLETE REPORT
========================================================= */

function renderReport() {

    renderReportSummary();

    renderReportTransactions();

    renderCategoryReport();

    renderAccountReport();

    renderBudgetReport();
}


/* =========================================================
   20. FILTER CONTROLS
========================================================= */

function initializeReportFilters() {

    /* -----------------------------------------
       Month
    ----------------------------------------- */

    const monthInput =
        reportGetElement(
            "reportMonth",
            "monthFilter",
            "transactionMonth"
        );


    if (monthInput) {

        if (
            !monthInput.value &&
            typeof window.getCurrentMonth ===
            "function"
        ) {

            monthInput.value =
                window.getCurrentMonth();
        }


        currentReportMonth =
            monthInput.value ||
            "";
    }


    /* -----------------------------------------
       Date
    ----------------------------------------- */

    const dateInput =
        reportGetElement(
            "reportDate",
            "dateFilter",
            "transactionDate"
        );


    if (dateInput) {

        currentReportDate =
            dateInput.value ||
            "";
    }


    /* -----------------------------------------
       Type
    ----------------------------------------- */

    const typeSelect =
        reportGetElement(
            "reportType",
            "typeFilter",
            "transactionType"
        );


    if (typeSelect) {

        currentReportType =
            typeSelect.value ||
            "all";
    }


    /* -----------------------------------------
       Account
    ----------------------------------------- */

    const accountSelect =
        reportGetElement(
            "reportAccount",
            "accountFilter",
            "transactionAccount"
        );


    if (accountSelect) {

        currentReportAccount =
            accountSelect.value ||
            "all";
    }


    /* -----------------------------------------
       Search
    ----------------------------------------- */

    const searchInput =
        reportGetElement(
            "reportSearch",
            "searchFilter",
            "transactionSearch"
        );


    if (searchInput) {

        currentReportSearch =
            searchInput.value.trim();
    }
}


/* =========================================================
   21. POPULATE ACCOUNT FILTER
========================================================= */

function populateReportAccountFilter() {

    const select =
        reportGetElement(
            "reportAccount",
            "accountFilter",
            "transactionAccount"
        );


    if (
        !select ||
        typeof window.getAccounts !==
        "function"
    ) {
        return;
    }


    let accounts = [];


    try {

        accounts =
            window.getAccounts();

    } catch (error) {

        accounts = [];
    }


    if (
        !Array.isArray(accounts)
    ) {
        return;
    }


    const currentValue =
        select.value ||
        "all";


    select.innerHTML = `

        <option value="all">
            सर्व खाती
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
                account.name ||
                account.id;


            select.appendChild(
                option
            );
        }
    );


    if (
        Array.from(
            select.options
        )
        .some(
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
   22. FILTER EVENT LISTENERS
========================================================= */

function setupReportFilterEvents() {

    const monthInput =
        reportGetElement(
            "reportMonth",
            "monthFilter",
            "transactionMonth"
        );


    if (monthInput) {

        monthInput.addEventListener(
            "change",
            function() {

                currentReportMonth =
                    this.value ||
                    "";

                applyReportFilters();

            }
        );
    }


    const dateInput =
        reportGetElement(
            "reportDate",
            "dateFilter",
            "transactionDate"
        );


    if (dateInput) {

        dateInput.addEventListener(
            "change",
            function() {

                currentReportDate =
                    this.value ||
                    "";

                applyReportFilters();

            }
        );
    }


    const typeSelect =
        reportGetElement(
            "reportType",
            "typeFilter",
            "transactionType"
        );


    if (typeSelect) {

        typeSelect.addEventListener(
            "change",
            function() {

                currentReportType =
                    this.value ||
                    "all";

                applyReportFilters();

            }
        );
    }


    const accountSelect =
        reportGetElement(
            "reportAccount",
            "accountFilter",
            "transactionAccount"
        );


    if (accountSelect) {

        accountSelect.addEventListener(
            "change",
            function() {

                currentReportAccount =
                    this.value ||
                    "all";

                applyReportFilters();

            }
        );
    }


    const searchInput =
        reportGetElement(
            "reportSearch",
            "searchFilter",
            "transactionSearch"
        );


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            function() {

                currentReportSearch =
                    this.value.trim();

                applyReportFilters();

            }
        );
    }
}


/* =========================================================
   23. CLEAR FILTERS
========================================================= */

function clearReportFilters() {

    currentReportMonth = "";

    currentReportDate = "";

    currentReportType =
        "all";

    currentReportAccount =
        "all";

    currentReportSearch =
        "";


    const monthInput =
        reportGetElement(
            "reportMonth",
            "monthFilter",
            "transactionMonth"
        );


    if (monthInput) {
        monthInput.value = "";
    }


    const dateInput =
        reportGetElement(
            "reportDate",
            "dateFilter",
            "transactionDate"
        );


    if (dateInput) {
        dateInput.value = "";
    }


    const typeSelect =
        reportGetElement(
            "reportType",
            "typeFilter",
            "transactionType"
        );


    if (typeSelect) {
        typeSelect.value = "all";
    }


    const accountSelect =
        reportGetElement(
            "reportAccount",
            "accountFilter",
            "transactionAccount"
        );


    if (accountSelect) {
        accountSelect.value = "all";
    }


    const searchInput =
        reportGetElement(
            "reportSearch",
            "searchFilter",
            "transactionSearch"
        );


    if (searchInput) {
        searchInput.value = "";
    }


    applyReportFilters();
}


/* =========================================================
   24. EXPORT CSV
========================================================= */

function exportReportCSV() {

    const transactions =
        filteredReportTransactions;


    if (!transactions.length) {

        alert(
            "Export करण्यासाठी data उपलब्ध नाही."
        );

        return;
    }


    const rows = [];


    rows.push([
        "Date",
        "Type",
        "Category",
        "Description",
        "Account",
        "Payment Mode",
        "Amount",
        "Note"
    ]);


    transactions.forEach(
        transaction => {

            rows.push([

                transaction.date,

                transaction.type ===
                "income"
                    ? "जमा"
                    : "खर्च",

                transaction.categoryName,

                transaction.description,

                transaction.accountName,

                transaction.paymentMode,

                transaction.amount,

                transaction.note

            ]);
        }
    );


    const csv =
        rows
            .map(
                row =>
                    row
                        .map(
                            value =>
                                `"${String(
                                    value ??
                                    ""
                                )
                                .replace(
                                    /"/g,
                                    '""'
                                )}"`
                        )
                        .join(",")
            )
            .join("\n");


    const blob =
        new Blob(
            [
                "\ufeff" +
                csv
            ],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        "Rojcha_Jama_Kharch_Report.csv";


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );


    URL.revokeObjectURL(
        url
    );
}


/* =========================================================
   25. REFRESH REPORT
========================================================= */

function refreshReport() {

    loadReportData();
}


/* =========================================================
   26. INITIALIZE
========================================================= */

function initializeReportsPage() {

    console.log(
        "Reports page initializing..."
    );


    initializeReportFilters();

    populateReportAccountFilter();

    setupReportFilterEvents();

    loadReportData();


    console.log(
        "Reports transactions:",
        reportTransactions.length
    );
}


/* =========================================================
   27. DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        initializeReportsPage();

    }
);


/* =========================================================
   28. UPDATE WHEN TRANSACTIONS CHANGE
========================================================= */

window.addEventListener(
    "rdkhTransactionsUpdated",
    function() {

        refreshReport();

    }
);


/* =========================================================
   29. UPDATE WHEN ACCOUNT CHANGES
========================================================= */

window.addEventListener(
    "rdkhAccountsUpdated",
    function() {

        populateReportAccountFilter();

        refreshReport();

    }
);


/* =========================================================
   30. STORAGE CHANGE
========================================================= */

window.addEventListener(
    "storage",
    function(event) {

        if (
            !event.key ||
            event.key ===
                REPORT_TRANSACTIONS_KEY ||
            event.key ===
                REPORT_OLD_TRANSACTIONS_KEY ||
            event.key ===
                REPORT_BUDGET_KEY ||
            event.key ===
                REPORT_OLD_BUDGET_KEY ||
            event.key ===
                "rdkh_accounts"
        ) {

            populateReportAccountFilter();

            refreshReport();

        }

    }
);


/* =========================================================
   31. GLOBAL FUNCTIONS
========================================================= */

window.loadReportData =
    loadReportData;

window.renderReport =
    renderReport;

window.applyReportFilters =
    applyReportFilters;

window.clearReportFilters =
    clearReportFilters;

window.refreshReport =
    refreshReport;

window.exportReportCSV =
    exportReportCSV;


/* =========================================================
   END OF reports.js
========================================================= */
