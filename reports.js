/* =========================================================
   reports.js
   रोजचा जमा खर्च अहवाल
   REPORT MANAGEMENT

   CENTRAL SYSTEM VERSION
   FIXED STORAGE COMPATIBILITY

   CONNECTED WITH:
   - app.js
   - transactions.js
   - income.js
   - expense.js
   - monthly-budget.js
   - accounts.js

   FEATURES:
   ---------------------------------------------------------
   ✅ Daily Report
   ✅ Monthly Report
   ✅ Yearly Report
   ✅ All Transactions
   ✅ Income Report
   ✅ Expense Report
   ✅ Category-wise Expense
   ✅ Budget Report
   ✅ Search
   ✅ CSV Export
   ✅ Print Report
   ✅ Central Transaction Storage
   ✅ Old + V2 Storage Compatibility
   ========================================================= */


/* =========================================================
   STORAGE KEYS
========================================================= */

const REPORT_TRANSACTIONS_V2_KEY =
    "rdkh_transactions_v2";

const REPORT_TRANSACTIONS_KEY =
    "rdkh_transactions";

const REPORT_LEGACY_TRANSACTIONS_KEY =
    "transactions";

const REPORT_INCOME_KEY =
    "income_transactions";

const REPORT_EXPENSE_KEY =
    "expense_transactions";

const REPORT_OLD_EXPENSE_KEY =
    "expenses";

const REPORT_BUDGET_KEY =
    "monthly_budgets";

const REPORT_OLD_BUDGET_KEY =
    "rdkh_monthly_budgets";


/* =========================================================
   VARIABLES
========================================================= */

let reportTransactions = [];

let filteredReportTransactions = [];


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeReports();

    }
);


/* =========================================================
   INITIALIZE
========================================================= */

function initializeReports() {

    loadReportTransactions();

    setupReportEvents();

    setDefaultReportDate();

    renderReport();

}


/* =========================================================
   GET CENTRAL TRANSACTIONS
========================================================= */

function getReportTransactions() {

    /*
     * 1. First priority:
     * app.js central function
     */

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

                const normalized =
                    data
                        .map(
                            normalizeReportTransaction
                        )
                        .filter(Boolean);


                if (
                    normalized.length ||
                    data.length === 0
                ) {

                    return normalized;

                }

            }

        } catch (error) {

            console.warn(
                "Central transaction read error:",
                error
            );

        }

    }


    /*
     * 2. V2 storage
     */

    const v2 =
        readTransactionStorage(
            REPORT_TRANSACTIONS_V2_KEY
        );


    if (
        v2.length
    ) {

        return v2;

    }


    /*
     * 3. Old rdkh storage
     */

    const old =
        readTransactionStorage(
            REPORT_TRANSACTIONS_KEY
        );


    if (
        old.length
    ) {

        return old;

    }


    /*
     * 4. Generic transactions
     */

    const generic =
        readTransactionStorage(
            REPORT_LEGACY_TRANSACTIONS_KEY
        );


    if (
        generic.length
    ) {

        return generic;

    }


    /*
     * 5. Separate income/expense
     */

    const income =
        readTransactionStorage(
            REPORT_INCOME_KEY
        )
            .map(
                transaction => {

                    return {
                        ...transaction,
                        type:
                            "income"
                    };

                }
            );


    const expense =
        readTransactionStorage(
            REPORT_EXPENSE_KEY
        )
            .map(
                transaction => {

                    return {
                        ...transaction,
                        type:
                            "expense"
                    };

                }
            );


    const oldExpense =
        readTransactionStorage(
            REPORT_OLD_EXPENSE_KEY
        )
            .map(
                transaction => {

                    return {
                        ...transaction,
                        type:
                            "expense"
                    };

                }
            );


    return [

        ...income,

        ...expense,

        ...oldExpense

    ]
        .map(
            normalizeReportTransaction
        )
        .filter(Boolean);

}


/* =========================================================
   READ TRANSACTION STORAGE
========================================================= */

function readTransactionStorage(
    key
) {

    try {

        const raw =
            localStorage.getItem(
                key
            );


        if (!raw) {

            return [];

        }


        const data =
            JSON.parse(raw);


        if (
            !Array.isArray(data)
        ) {

            return [];

        }


        return data
            .map(
                normalizeReportTransaction
            )
            .filter(Boolean);

    } catch (error) {

        console.warn(
            "Transaction storage read error:",
            key,
            error
        );

        return [];

    }

}


/* =========================================================
   NORMALIZE TRANSACTION
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


    /* -----------------------------------------------------
       TYPE
    ----------------------------------------------------- */

    let type =
        String(
            transaction.type ||
            transaction.transactionType ||
            transaction.entryType ||
            ""
        )
            .toLowerCase()
            .trim();


    if (

        type === "income" ||

        type === "credit" ||

        type === "jma" ||

        type === "जमा"

    ) {

        type =
            "income";

    }

    else if (

        type === "expense" ||

        type === "debit" ||

        type === "kharch" ||

        type === "खर्च"

    ) {

        type =
            "expense";

    }

    else {

        /*
         * Legacy detection
         */

        if (

            transaction.expenseAmount !==
            undefined ||

            transaction.expenseCategory !==
            undefined

        ) {

            type =
                "expense";

        }

        else if (

            transaction.incomeAmount !==
            undefined ||

            transaction.incomeCategory !==
            undefined

        ) {

            type =
                "income";

        }

    }


    if (

        type !== "income" &&

        type !== "expense"

    ) {

        return null;

    }


    /* -----------------------------------------------------
       AMOUNT
    ----------------------------------------------------- */

    let rawAmount =
        transaction.amount;


    if (
        rawAmount ===
        undefined ||
        rawAmount ===
        null ||
        rawAmount === ""
    ) {

        rawAmount =
            type === "income"
                ? transaction.incomeAmount
                : transaction.expenseAmount;

    }


    /*
     * Some old data may contain
     * amount as formatted string.
     */

    if (
        typeof rawAmount ===
        "string"
    ) {

        rawAmount =
            rawAmount
                .replace(
                    /₹/g,
                    ""
                )
                .replace(
                    /,/g,
                    ""
                )
                .trim();

    }


    const amount =
        Number(
            rawAmount
        );


    if (
        !Number.isFinite(
            amount
        ) ||
        amount <= 0
    ) {

        return null;

    }


    /* -----------------------------------------------------
       DATE
    ----------------------------------------------------- */

    const date =
        normalizeReportDate(
            transaction.date ||
            transaction.transactionDate ||
            transaction.incomeDate ||
            transaction.expenseDate ||
            transaction.createdAt
        );


    if (!date) {

        return null;

    }


    /* -----------------------------------------------------
       CATEGORY
    ----------------------------------------------------- */

    const categoryId =
        transaction.categoryId ||
        transaction.category ||
        transaction.incomeCategory ||
        transaction.expenseCategory ||
        "";


    const categoryName =
        transaction.categoryName ||
        transaction.categoryLabel ||
        getReportCategoryName(
            categoryId,
            type
        );


    /* -----------------------------------------------------
       DESCRIPTION
    ----------------------------------------------------- */

    const description =
        transaction.description ||
        transaction.details ||
        transaction.title ||
        transaction.note ||
        "";


    /* -----------------------------------------------------
       ACCOUNT
    ----------------------------------------------------- */

    const accountId =
        transaction.accountId ||
        transaction.account ||
        transaction.accountID ||
        "";


    /* -----------------------------------------------------
       PAYMENT MODE
    ----------------------------------------------------- */

    const paymentMode =
        transaction.paymentMode ||
        transaction.mode ||
        "";


    return {

        id:
            transaction.id ||
            transaction.transactionId ||
            (
                "TXN-" +
                date +
                "-" +
                Math.random()
                    .toString(36)
                    .slice(2, 8)
            ),

        type:
            type,

        date:
            date,

        amount:
            amount,

        category:
            categoryId,

        categoryId:
            categoryId,

        categoryName:
            categoryName,

        description:
            description,

        accountId:
            accountId,

        paymentMode:
            paymentMode,

        note:
            transaction.note ||
            "",

        createdAt:
            transaction.createdAt ||
            ""

    };

}


/* =========================================================
   NORMALIZE DATE
========================================================= */

function normalizeReportDate(
    value
) {

    if (!value) {

        return "";

    }


    const text =
        String(
            value
        )
            .trim();


    /*
     * YYYY-MM-DD
     */

    if (
        /^\d{4}-\d{2}-\d{2}$/
            .test(text)
    ) {

        return text;

    }


    /*
     * DD-MM-YYYY
     */

    let match =
        text.match(
            /^(\d{2})-(\d{2})-(\d{4})$/
        );


    if (match) {

        return (
            match[3] +
            "-" +
            match[2] +
            "-" +
            match[1]
        );

    }


    /*
     * DD/MM/YYYY
     */

    match =
        text.match(
            /^(\d{2})\/(\d{2})\/(\d{4})$/
        );


    if (match) {

        return (
            match[3] +
            "-" +
            match[2] +
            "-" +
            match[1]
        );

    }


    /*
     * ISO / Date
     */

    const date =
        new Date(
            text
        );


    if (
        !isNaN(
            date.getTime()
        )
    ) {

        return (
            date.getFullYear() +
            "-" +
            String(
                date.getMonth() + 1
            )
                .padStart(
                    2,
                    "0"
                ) +
            "-" +
            String(
                date.getDate()
            )
                .padStart(
                    2,
                    "0"
                )
        );

    }


    return "";

}


/* =========================================================
   LOAD
========================================================= */

function loadReportTransactions() {

    reportTransactions =
        getReportTransactions();

}


/* =========================================================
   DEFAULT DATE
========================================================= */

function setDefaultReportDate() {

    const dateInput =
        document.getElementById(
            "reportDate"
        );


    if (
        dateInput &&
        !dateInput.value
    ) {

        dateInput.value =
            getTodayReportDate();

    }

}


/* =========================================================
   TODAY
========================================================= */

function getTodayReportDate() {

    const now =
        new Date();


    return (
        now.getFullYear() +
        "-" +
        String(
            now.getMonth() + 1
        )
            .padStart(
                2,
                "0"
            ) +
        "-" +
        String(
            now.getDate()
        )
            .padStart(
                2,
                "0"
            )
    );

}


/* =========================================================
   EVENTS
========================================================= */

function setupReportEvents() {

    const elements =
        document.querySelectorAll(
            "#reportType, " +
            "#reportPeriod, " +
            "#reportDate, " +
            "#reportMonth, " +
            "#reportYear, " +
            "#reportSearch, " +
            "#reportCategory, " +
            "#reportAccount"
        );


    elements.forEach(
        element => {

            element.addEventListener(
                "change",
                function () {

                    renderReport();

                }
            );


            element.addEventListener(
                "input",
                function () {

                    renderReport();

                }
            );

        }
    );


    /*
     * Central transaction update
     */

    window.addEventListener(
        "rdkhTransactionsUpdated",
        function () {

            loadReportTransactions();

            renderReport();

        }
    );


    /*
     * Account update
     */

    window.addEventListener(
        "rdkhAccountsUpdated",
        function () {

            populateReportAccountFilter();

            renderReport();

        }
    );


    /*
     * Budget update
     */

    window.addEventListener(
        "rdkhBudgetUpdated",
        function () {

            renderBudgetReport(
                getCurrentReportMonth()
            );

        }
    );


    /*
     * Storage update
     */

    window.addEventListener(
        "storage",
        function (event) {

            const keys = [

                REPORT_TRANSACTIONS_V2_KEY,

                REPORT_TRANSACTIONS_KEY,

                REPORT_LEGACY_TRANSACTIONS_KEY,

                REPORT_INCOME_KEY,

                REPORT_EXPENSE_KEY,

                REPORT_OLD_EXPENSE_KEY,

                REPORT_BUDGET_KEY,

                REPORT_OLD_BUDGET_KEY

            ];


            if (
                keys.includes(
                    event.key
                )
            ) {

                loadReportTransactions();

                renderReport();

            }

        }
    );

}


/* =========================================================
   GET REPORT FILTER
========================================================= */

function getReportFilter() {

    const typeElement =
        document.getElementById(
            "reportType"
        );


    const periodElement =
        document.getElementById(
            "reportPeriod"
        );


    const dateElement =
        document.getElementById(
            "reportDate"
        );


    const monthElement =
        document.getElementById(
            "reportMonth"
        );


    const yearElement =
        document.getElementById(
            "reportYear"
        );


    const searchElement =
        document.getElementById(
            "reportSearch"
        );


    const categoryElement =
        document.getElementById(
            "reportCategory"
        );


    const accountElement =
        document.getElementById(
            "reportAccount"
        );


    return {

        type:
            typeElement
                ? typeElement.value
                : "",

        period:
            periodElement
                ? periodElement.value
                : "monthly",

        date:
            dateElement
                ? dateElement.value
                : "",

        month:
            monthElement
                ? monthElement.value
                : getCurrentReportMonth(),

        year:
            yearElement
                ? yearElement.value
                : String(
                    new Date()
                        .getFullYear()
                ),

        search:
            searchElement
                ? String(
                    searchElement.value ||
                    ""
                )
                    .trim()
                    .toLowerCase()
                : "",

        category:
            categoryElement
                ? categoryElement.value
                : "",

        account:
            accountElement
                ? accountElement.value
                : ""

    };

}


/* =========================================================
   FILTER TRANSACTIONS
========================================================= */

function filterReportTransactions(
    transactions,
    filter
) {

    return transactions.filter(
        transaction => {

            /*
             * TYPE
             */

            if (

                filter.type &&

                filter.type !== "all" &&

                transaction.type !==
                filter.type

            ) {

                return false;

            }


            /*
             * CATEGORY
             */

            if (

                filter.category &&

                String(
                    transaction.categoryId
                ) !==
                String(
                    filter.category
                )

            ) {

                return false;

            }


            /*
             * ACCOUNT
             */

            if (

                filter.account &&

                String(
                    transaction.accountId
                ) !==
                String(
                    filter.account
                )

            ) {

                return false;

            }


            /*
             * DAILY
             */

            if (
                filter.period ===
                "daily"
            ) {

                const targetDate =
                    filter.date ||
                    getTodayReportDate();


                if (
                    transaction.date !==
                    targetDate
                ) {

                    return false;

                }

            }


            /*
             * MONTHLY
             */

            else if (
                filter.period ===
                "monthly"
            ) {

                const targetMonth =
                    filter.month ||
                    getCurrentReportMonth();


                if (
                    !String(
                        transaction.date
                    )
                        .startsWith(
                            targetMonth
                        )
                ) {

                    return false;

                }

            }


            /*
             * YEARLY
             */

            else if (
                filter.period ===
                "yearly"
            ) {

                const targetYear =
                    String(
                        filter.year ||
                        new Date()
                            .getFullYear()
                    );


                if (
                    !String(
                        transaction.date
                    )
                        .startsWith(
                            targetYear
                        )
                ) {

                    return false;

                }

            }


            /*
             * SEARCH
             */

            if (
                filter.search
            ) {

                const searchableText = [

                    transaction.id,

                    transaction.type,

                    transaction.categoryName,

                    transaction.categoryId,

                    transaction.description,

                    transaction.note,

                    transaction.paymentMode,

                    transaction.accountId

                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();


                if (
                    !searchableText
                        .includes(
                            filter.search
                        )
                ) {

                    return false;

                }

            }


            return true;

        }
    );

}


/* =========================================================
   RENDER REPORT
========================================================= */

function renderReport() {

    loadReportTransactions();


    const filter =
        getReportFilter();


    filteredReportTransactions =
        filterReportTransactions(
            reportTransactions,
            filter
        );


    renderSummary(
        filteredReportTransactions
    );


    renderTransactionReport(
        filteredReportTransactions
    );


    renderCategoryReport(
        filteredReportTransactions
    );


    renderBudgetReport(
        filter.month
    );


    populateReportCategoryFilter();

    populateReportAccountFilter();

}


/* =========================================================
   SUMMARY
========================================================= */

function renderSummary(
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
        income -
        expense;


    setReportText(
        [
            "reportTotalIncome",
            "totalReportIncome",
            "summaryIncome"
        ],
        formatReportMoney(
            income
        )
    );


    setReportText(
        [
            "reportTotalExpense",
            "totalReportExpense",
            "summaryExpense"
        ],
        formatReportMoney(
            expense
        )
    );


    setReportText(
        [
            "reportNetBalance",
            "netReportBalance",
            "summaryBalance"
        ],
        formatReportMoney(
            balance
        )
    );


    setReportText(
        [
            "reportTransactionCount",
            "transactionCount",
            "summaryCount"
        ],
        String(
            transactions.length
        )
    );

}


/* =========================================================
   TRANSACTION REPORT
========================================================= */

function renderTransactionReport(
    transactions
) {

    const container =
        document.getElementById(
            "reportTransactionsList"
        ) ||
        document.getElementById(
            "reportsTransactionList"
        ) ||
        document.getElementById(
            "reportList"
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        "";


    if (
        !transactions.length
    ) {

        container.innerHTML = `

            <div class="empty-report-state">

                <i class="fa-solid fa-file-circle-xmark"></i>

                <p>
                    या filter साठी कोणतेही
                    व्यवहार उपलब्ध नाहीत.
                </p>

            </div>

        `;

        return;

    }


    const sorted =
        [...transactions]
            .sort(
                (a, b) => {

                    const dateCompare =
                        String(
                            b.date
                        )
                            .localeCompare(
                                String(
                                    a.date
                                )
                            );


                    if (
                        dateCompare !==
                        0
                    ) {

                        return dateCompare;

                    }


                    return String(
                        b.createdAt ||
                        ""
                    )
                        .localeCompare(
                            String(
                                a.createdAt ||
                                ""
                            )
                        );

                }
            );


    sorted.forEach(
        transaction => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "report-transaction-row";


            const isIncome =
                transaction.type ===
                "income";


            const label =
                isIncome
                    ? "जमा"
                    : "खर्च";


            const amountClass =
                isIncome
                    ? "income"
                    : "expense";


            const sign =
                isIncome
                    ? "+"
                    : "-";


            row.innerHTML = `

                <div class="report-row-date">

                    ${formatReportDate(
                        transaction.date
                    )}

                </div>


                <div class="report-row-info">

                    <strong>
                        ${escapeReportHTML(
                            transaction.categoryName ||
                            transaction.categoryId ||
                            label
                        )}
                    </strong>

                    ${
                        transaction.description
                            ? `
                                <small>
                                    ${escapeReportHTML(
                                        transaction.description
                                    )}
                                </small>
                            `
                            : ""
                    }

                    <small>

                        ${label}

                        ${
                            transaction.paymentMode
                                ? " • " +
                                  escapeReportHTML(
                                      transaction.paymentMode
                                  )
                                : ""
                        }

                    </small>

                </div>


                <div class="
                    report-row-amount
                    ${amountClass}">

                    ${sign}
                    ${formatReportMoney(
                        transaction.amount
                    )}

                </div>

            `;


            container.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   CATEGORY REPORT
========================================================= */

function renderCategoryReport(
    transactions
) {

    const container =
        document.getElementById(
            "categoryReportList"
        ) ||
        document.getElementById(
            "reportCategoryList"
        ) ||
        document.getElementById(
            "categoryReport"
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        "";


    const expenses =
        transactions.filter(
            transaction =>
                transaction.type ===
                "expense"
        );


    if (
        !expenses.length
    ) {

        container.innerHTML = `

            <div class="empty-report-state">

                <i class="fa-solid fa-chart-pie"></i>

                <p>
                    या कालावधीत खर्च उपलब्ध नाही.
                </p>

            </div>

        `;

        return;

    }


    const categoryTotals =
        {};


    expenses.forEach(
        transaction => {

            const id =
                transaction.categoryId ||
                transaction.category ||
                "other_expense";


            const name =
                transaction.categoryName ||
                getReportCategoryName(
                    id,
                    "expense"
                );


            if (
                !categoryTotals[id]
            ) {

                categoryTotals[id] = {

                    id:
                        id,

                    name:
                        name,

                    amount:
                        0,

                    count:
                        0

                };

            }


            categoryTotals[id].amount +=
                Number(
                    transaction.amount
                ) || 0;


            categoryTotals[id].count +=
                1;

        }
    );


    const list =
        Object.values(
            categoryTotals
        )
            .sort(
                (a, b) =>
                    b.amount -
                    a.amount
            );


    const totalExpense =
        list.reduce(
            (
                total,
                item
            ) =>
                total +
                item.amount,
            0
        );


    list.forEach(
        item => {

            const percentage =
                totalExpense > 0
                    ? (
                        item.amount /
                        totalExpense
                    ) *
                    100
                    : 0;


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "category-report-row";


            row.innerHTML = `

                <div class="
                    category-report-header">

                    <strong>
                        ${escapeReportHTML(
                            item.name
                        )}
                    </strong>

                    <span>
                        ${formatReportMoney(
                            item.amount
                        )}
                    </span>

                </div>


                <div class="
                    category-report-progress">

                    <div
                        class="
                            category-report-progress-bar
                        "
                        style="
                            width:${Math.min(
                                percentage,
                                100
                            )}%;
                        ">
                    </div>

                </div>


                <div class="
                    category-report-footer">

                    <span>
                        ${percentage.toFixed(
                            1
                        )}%
                    </span>

                    <span>
                        ${item.count}
                        व्यवहार
                    </span>

                </div>

            `;


            container.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   BUDGET REPORT
========================================================= */

function renderBudgetReport(
    month
) {

    const container =
        document.getElementById(
            "budgetReportList"
        ) ||
        document.getElementById(
            "reportBudgetList"
        ) ||
        document.getElementById(
            "budgetReport"
        );


    if (!container) {

        return;

    }


    const selectedMonth =
        month ||
        getCurrentReportMonth();


    let budget =
        null;


    /*
     * Preferred central budget function
     */

    if (
        typeof window.getBudgetForMonth ===
        "function"
    ) {

        try {

            budget =
                window.getBudgetForMonth(
                    selectedMonth
                );

        } catch (error) {

            console.warn(
                "Central budget read error:",
                error
            );

        }

    }


    /*
     * Fallback
     */

    if (
        !budget
    ) {

        budget =
            getBudgetFromStorage(
                selectedMonth
            );

    }


    if (
        !budget
    ) {

        container.innerHTML = `

            <div class="empty-report-state">

                <i class="fa-solid fa-wallet"></i>

                <p>
                    या महिन्यासाठी बजेट उपलब्ध नाही.
                </p>

            </div>

        `;

        return;

    }


    const planned =
        Number(
            budget.total ??
            budget.plannedMoney ??
            0
        ) || 0;


    const categories =
        budget.categories || {};


    const tracking =
        [];


    Object.keys(
        categories
    )
        .forEach(
            categoryId => {

                const plannedAmount =
                    Number(
                        categories[
                            categoryId
                        ]
                    ) || 0;


                const actual =
                    getReportCategoryActual(
                        categoryId,
                        selectedMonth
                    );


                tracking.push({

                    id:
                        categoryId,

                    name:
                        getReportCategoryName(
                            categoryId,
                            "expense"
                        ),

                    planned:
                        plannedAmount,

                    actual:
                        actual,

                    remaining:
                        plannedAmount -
                        actual,

                    usedPercent:
                        plannedAmount > 0
                            ? (
                                actual /
                                plannedAmount
                            ) *
                            100
                            : 0

                });

            }
        );


    /*
     * Actual categories without budget
     */

    getActualCategoryIds(
        selectedMonth
    )
        .forEach(
            categoryId => {

                const exists =
                    tracking.some(
                        item =>
                            String(
                                item.id
                            ) ===
                            String(
                                categoryId
                            )
                    );


                if (
                    exists
                ) {

                    return;

                }


                const actual =
                    getReportCategoryActual(
                        categoryId,
                        selectedMonth
                    );


                tracking.push({

                    id:
                        categoryId,

                    name:
                        getReportCategoryName(
                            categoryId,
                            "expense"
                        ),

                    planned:
                        0,

                    actual:
                        actual,

                    remaining:
                        -actual,

                    usedPercent:
                        0

                });

            }
        );


    container.innerHTML =
        "";


    if (
        !tracking.length
    ) {

        container.innerHTML = `

            <div class="empty-report-state">

                <i class="fa-solid fa-wallet"></i>

                <p>
                    बजेट category उपलब्ध नाहीत.
                </p>

            </div>

        `;

        return;

    }


    tracking
        .sort(
            (a, b) =>
                b.actual -
                a.actual
        )
        .forEach(
            item => {

                const percentage =
                    item.planned > 0
                        ? Math.min(
                            Math.max(
                                item.usedPercent,
                                0
                            ),
                            100
                        )
                        : 0;


                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "budget-report-row";


                row.innerHTML = `

                    <div class="
                        budget-report-header">

                        <strong>
                            ${escapeReportHTML(
                                item.name
                            )}
                        </strong>

                        <span>
                            ${formatReportMoney(
                                item.actual
                            )}
                        </span>

                    </div>


                    <div class="
                        budget-report-values">

                        <span>
                            Budget:
                            ${formatReportMoney(
                                item.planned
                            )}
                        </span>

                        <span>

                            ${
                                item.remaining >= 0
                                    ? "बाकी"
                                    : "ओव्हर"
                            }:

                            ${formatReportMoney(
                                Math.abs(
                                    item.remaining
                                )
                            )}

                        </span>

                    </div>


                    <div class="
                        budget-report-progress">

                        <div
                            class="
                                budget-report-progress-bar
                            "
                            style="
                                width:${percentage}%;
                            ">
                        </div>

                    </div>


                    <small>

                        ${
                            item.planned > 0
                                ? Math.round(
                                    item.usedPercent
                                ) +
                                  "% वापरले"
                                : "Budget set केलेले नाही"
                        }

                    </small>

                `;


                container.appendChild(
                    row
                );

            }
        );


    /*
     * Overall summary
     */

    const actualTotal =
        getReportMonthExpenseTotal(
            selectedMonth
        );


    const remaining =
        planned -
        actualTotal;


    setReportText(
        [
            "reportBudgetPlanned",
            "budgetReportPlanned"
        ],
        formatReportMoney(
            planned
        )
    );


    setReportText(
        [
            "reportBudgetActual",
            "budgetReportActual"
        ],
        formatReportMoney(
            actualTotal
        )
    );


    setReportText(
        [
            "reportBudgetRemaining",
            "budgetReportRemaining"
        ],
        formatReportMoney(
            remaining
        )
    );

}


/* =========================================================
   GET BUDGET FROM STORAGE
========================================================= */

function getBudgetFromStorage(
    month
) {

    const keys = [

        REPORT_BUDGET_KEY,

        REPORT_OLD_BUDGET_KEY

    ];


    for (
        const key of keys
    ) {

        try {

            const raw =
                localStorage.getItem(
                    key
                );


            if (!raw) {

                continue;

            }


            const budgets =
                JSON.parse(
                    raw
                );


            if (
                !budgets ||
                typeof budgets !==
                "object"
            ) {

                continue;

            }


            const data =
                budgets[
                    month
                ];


            if (
                !data
            ) {

                continue;

            }


            return {

                total:
                    Number(
                        data.total ??
                        data.plannedMoney ??
                        0
                    ) || 0,

                plannedMoney:
                    Number(
                        data.plannedMoney ??
                        data.total ??
                        0
                    ) || 0,

                categories:
                    data.categories ||
                    {},

                alertPercent:
                    Number(
                        data.alertPercent ??
                        80
                    ) || 80

            };

        } catch (error) {

            console.warn(
                "Budget read error:",
                key,
                error
            );

        }

    }


    return null;

}


/* =========================================================
   CATEGORY ACTUAL
========================================================= */

function getReportCategoryActual(
    categoryId,
    month
) {

    /*
     * Central helper
     */

    if (
        typeof window.getCategoryExpenseTotal ===
        "function"
    ) {

        try {

            return Number(
                window.getCategoryExpenseTotal(
                    categoryId,
                    month
                )
            ) || 0;

        } catch (error) {

            console.warn(
                "Category actual error:",
                error
            );

        }

    }


    /*
     * Local fallback
     */

    return reportTransactions
        .filter(
            transaction => {

                const transactionCategory =
                    transaction.categoryId ||
                    transaction.category ||
                    "";


                return (

                    transaction.type ===
                    "expense" &&

                    String(
                        transactionCategory
                    ) ===
                    String(
                        categoryId
                    ) &&

                    String(
                        transaction.date
                    )
                        .startsWith(
                            month
                        )

                );

            }
        )
        .reduce(
            (
                total,
                transaction
            ) =>
                total +
                (
                    Number(
                        transaction.amount
                    ) || 0
                ),
            0
        );

}


/* =========================================================
   MONTH EXPENSE TOTAL
========================================================= */

function getReportMonthExpenseTotal(
    month
) {

    return reportTransactions
        .filter(
            transaction => {

                return (

                    transaction.type ===
                    "expense" &&

                    String(
                        transaction.date
                    )
                        .startsWith(
                            month
                        )

                );

            }
        )
        .reduce(
            (
                total,
                transaction
            ) =>
                total +
                (
                    Number(
                        transaction.amount
                    ) || 0
                ),
            0
        );

}


/* =========================================================
   ACTUAL CATEGORY IDS
========================================================= */

function getActualCategoryIds(
    month
) {

    const ids =
        new Set();


    reportTransactions
        .filter(
            transaction => {

                return (

                    transaction.type ===
                    "expense" &&

                    String(
                        transaction.date
                    )
                        .startsWith(
                            month
                        )

                );

            }
        )
        .forEach(
            transaction => {

                const id =
                    transaction.categoryId ||
                    transaction.category;


                if (
                    id
                ) {

                    ids.add(
                        id
                    );

                }

            }
        );


    return Array.from(
        ids
    );

}


/* =========================================================
   CATEGORY NAME
========================================================= */

function getReportCategoryName(
    categoryId,
    type
) {

    /*
     * Expense categories
     */

    if (
        type === "expense"
    ) {

        const categories =
            window.EXPENSE_CATEGORIES ||
            [];


        const category =
            categories.find(
                item =>
                    String(
                        item.id
                    ) ===
                    String(
                        categoryId
                    )
            );


        if (
            category
        ) {

            return category.name;

        }

    }


    /*
     * Income categories
     */

    const incomeCategories = {

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


    if (
        incomeCategories[
            categoryId
        ]
    ) {

        return incomeCategories[
            categoryId
        ];

    }


    return (
        categoryId ||
        (
            type === "income"
                ? "जमा"
                : "इतर खर्च"
        )
    );

}


/* =========================================================
   CATEGORY FILTER
========================================================= */

function populateReportCategoryFilter() {

    const select =
        document.getElementById(
            "reportCategory"
        );


    if (!select) {

        return;

    }


    const current =
        select.value;


    select.innerHTML =
        '<option value="">सर्व Categories</option>';


    const categoryMap =
        new Map();


    /*
     * Known expense categories
     */

    const categories =
        window.EXPENSE_CATEGORIES ||
        [];


    categories.forEach(
        category => {

            categoryMap.set(
                category.id,
                category.name
            );

        }
    );


    /*
     * Categories from transactions
     */

    reportTransactions
        .filter(
            transaction =>
                transaction.type ===
                "expense"
        )
        .forEach(
            transaction => {

                const id =
                    transaction.categoryId ||
                    transaction.category;


                if (!id) {

                    return;

                }


                if (
                    !categoryMap.has(
                        id
                    )
                ) {

                    categoryMap.set(
                        id,
                        transaction.categoryName ||
                        getReportCategoryName(
                            id,
                            "expense"
                        )
                    );

                }

            }
        );


    Array.from(
        categoryMap.entries()
    )
        .sort(
            (a, b) =>
                String(
                    a[1]
                )
                    .localeCompare(
                        String(
                            b[1]
                        ),
                        "mr"
                    )
        )
        .forEach(
            ([id, name]) => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    id;


                option.textContent =
                    name;


                select.appendChild(
                    option
                );

            }
        );


    if (
        current
    ) {

        select.value =
            current;

    }

}


/* =========================================================
   ACCOUNT FILTER
========================================================= */

function populateReportAccountFilter() {

    const select =
        document.getElementById(
            "reportAccount"
        );


    if (!select) {

        return;

    }


    const current =
        select.value;


    select.innerHTML =
        '<option value="">सर्व खाती</option>';


    if (
        typeof window.getAccounts !==
        "function"
    ) {

        return;

    }


    try {

        const accounts =
            window.getAccounts();


        if (
            !Array.isArray(
                accounts
            )
        ) {

            return;

        }


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
            current
        ) {

            select.value =
                current;

        }

    } catch (error) {

        console.warn(
            "Account filter error:",
            error
        );

    }

}


/* =========================================================
   CLEAR FILTERS
========================================================= */

function clearReportFilters() {

    const elements = [

        "reportType",

        "reportSearch",

        "reportCategory",

        "reportAccount",

        "reportDate"

    ];


    elements.forEach(
        id => {

            const element =
                document.getElementById(
                    id
                );


            if (
                element
            ) {

                element.value =
                    "";

            }

        }
    );


    const period =
        document.getElementById(
            "reportPeriod"
        );


    if (
        period
    ) {

        period.value =
            "monthly";

    }


    const month =
        document.getElementById(
            "reportMonth"
        );


    if (
        month
    ) {

        month.value =
            getCurrentReportMonth();

    }


    const year =
        document.getElementById(
            "reportYear"
        );


    if (
        year
    ) {

        year.value =
            String(
                new Date()
                    .getFullYear()
            );

    }


    renderReport();

}


window.clearReportFilters =
    clearReportFilters;


/* =========================================================
   APPLY FILTERS
========================================================= */

function applyReportFilters() {

    renderReport();

}


window.applyReportFilters =
    applyReportFilters;


/* =========================================================
   CSV EXPORT
========================================================= */

function exportReportCSV() {

    const transactions =
        filteredReportTransactions;


    if (
        !transactions.length
    ) {

        alert(
            "Export करण्यासाठी कोणतेही व्यवहार उपलब्ध नाहीत."
        );

        return;

    }


    const rows = [];


    rows.push([

        "तारीख",

        "प्रकार",

        "Category",

        "Description",

        "Account",

        "Payment Mode",

        "रक्कम"

    ]);


    transactions.forEach(
        transaction => {

            rows.push([

                transaction.date,

                transaction.type ===
                "income"
                    ? "जमा"
                    : "खर्च",

                transaction.categoryName ||
                transaction.categoryId ||
                "",

                transaction.description ||
                "",

                getReportAccountName(
                    transaction.accountId
                ),

                transaction.paymentMode ||
                "",

                Number(
                    transaction.amount
                )
                    .toFixed(
                        2
                    )

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
                "\uFEFF" +
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
        "rdkh-report-" +
        getTodayReportDate() +
        ".csv";


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
        url
    );

}


window.exportReportCSV =
    exportReportCSV;


/* =========================================================
   PRINT
========================================================= */

function printReport() {

    window.print();

}


window.printReport =
    printReport;


/* =========================================================
   ACCOUNT NAME
========================================================= */

function getReportAccountName(
    accountId
) {

    if (
        !accountId
    ) {

        return "";

    }


    if (
        typeof window.getAccounts !==
        "function"
    ) {

        return accountId;

    }


    try {

        const accounts =
            window.getAccounts();


        if (
            !Array.isArray(
                accounts
            )
        ) {

            return accountId;

        }


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


        if (
            account
        ) {

            return account.name;

        }

    } catch (error) {

        console.warn(
            "Account name error:",
            error
        );

    }


    return accountId;

}


/* =========================================================
   CURRENT MONTH
========================================================= */

function getCurrentReportMonth() {

    const now =
        new Date();


    return (
        now.getFullYear() +
        "-" +
        String(
            now.getMonth() + 1
        )
            .padStart(
                2,
                "0"
            )
    );

}


/* =========================================================
   FORMAT MONEY
========================================================= */

function formatReportMoney(
    amount
) {

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
   FORMAT DATE
========================================================= */

function formatReportDate(
    date
) {

    if (
        !date
    ) {

        return "--";

    }


    const parts =
        String(
            date
        )
            .split("-");


    if (
        parts.length ===
        3
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
   SET TEXT
========================================================= */

function setReportText(
    ids,
    value
) {

    ids.forEach(
        id => {

            const element =
                document.getElementById(
                    id
                );


            if (
                element
            ) {

                element.textContent =
                    value;

            }

        }
    );

}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeReportHTML(
    value
) {

    return String(
        value ??
        ""
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
   GLOBAL EXPORTS
========================================================= */

window.getReportTransactions =
    getReportTransactions;

window.renderReport =
    renderReport;

window.filterReportTransactions =
    filterReportTransactions;

window.exportReportCSV =
    exportReportCSV;

window.printReport =
    printReport;

window.getReportCategoryActual =
    getReportCategoryActual;

window.getReportMonthExpenseTotal =
    getReportMonthExpenseTotal;
