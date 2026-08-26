/* =========================================================
   reports.js

   रोजचा जमा खर्च अहवाल

   REPORT SYSTEM
   ---------------------------------------------------------
   ✅ Daily Report
   ✅ Monthly Report
   ✅ Yearly Report
   ✅ All Transactions
   ✅ Income
   ✅ Expense
   ✅ Balance
   ✅ Category-wise Expense
   ✅ Budget vs Actual
   ✅ CSV Export
   ✅ Print
   ========================================================= */


/* =========================================================
   STORAGE
========================================================= */

const REPORT_TRANSACTIONS_KEY =
    "rdkh_transactions";

const REPORT_BUDGET_KEY =
    "rdkh_monthly_budgets";

const REPORT_CATEGORY_KEY =
    "rdkh_budget_categories";



/* =========================================================
   INITIALIZE
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

    setDefaultReportDate();

    populateYears();

    setupReportEvents();

    generateReport();

}



/* =========================================================
   DEFAULT DATE
========================================================= */

function setDefaultReportDate() {

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            now.getDate()
        ).padStart(
            2,
            "0"
        );


    const monthInput =
        document.getElementById(
            "reportMonth"
        );


    const dateInput =
        document.getElementById(
            "reportDate"
        );


    if (monthInput) {

        monthInput.value =
            `${year}-${month}`;

    }


    if (dateInput) {

        dateInput.value =
            `${year}-${month}-${day}`;

    }

}



/* =========================================================
   POPULATE YEARS
========================================================= */

function populateYears() {

    const select =
        document.getElementById(
            "reportYear"
        );


    if (!select) {

        return;

    }


    const currentYear =
        new Date().getFullYear();


    select.innerHTML =
        "";


    for (
        let year =
            currentYear - 5;

        year <=
            currentYear + 2;

        year++
    ) {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            year;


        option.textContent =
            year;


        if (
            year ===
            currentYear
        ) {

            option.selected =
                true;

        }


        select.appendChild(
            option
        );

    }

}



/* =========================================================
   EVENTS
========================================================= */

function setupReportEvents() {

    const type =
        document.getElementById(
            "reportType"
        );


    if (type) {

        type.addEventListener(
            "change",
            function () {

                updateReportFilterVisibility();

                generateReport();

            }
        );

    }

}



/* =========================================================
   FILTER VISIBILITY
========================================================= */

function updateReportFilterVisibility() {

    const type =
        document.getElementById(
            "reportType"
        )?.value;


    const monthGroup =
        document.getElementById(
            "reportMonthGroup"
        );


    const dateGroup =
        document.getElementById(
            "reportDateGroup"
        );


    const yearGroup =
        document.getElementById(
            "reportYearGroup"
        );


    if (monthGroup) {

        monthGroup.style.display =
            type === "monthly"
                ? "block"
                : "none";

    }


    if (dateGroup) {

        dateGroup.style.display =
            type === "daily"
                ? "block"
                : "none";

    }


    if (yearGroup) {

        yearGroup.style.display =
            type === "yearly"
                ? "block"
                : "none";

    }

}



/* =========================================================
   GENERATE REPORT
========================================================= */

function generateReport() {

    updateReportFilterVisibility();


    const transactions =
        getReportTransactions();


    const filtered =
        filterTransactions(
            transactions
        );


    renderSummary(
        filtered
    );


    renderCategoryReport(
        filtered
    );


    renderTransactions(
        filtered
    );


    renderBudgetReport(
        filtered
    );

}



/* =========================================================
   GET TRANSACTIONS
========================================================= */

function getReportTransactions() {

    /*
       First try app.js function.
    */

    if (
        typeof getTransactions ===
        "function"
    ) {

        const data =
            getTransactions();


        if (
            Array.isArray(data)
        ) {

            return data;

        }

    }


    /*
       Direct LocalStorage
    */

    const keys = [

        REPORT_TRANSACTIONS_KEY,

        "rdkh_transaction",

        "transactions",

        "income_expense_transactions",

        "expense_transactions",

        "income_transactions"

    ];


    for (
        const key of keys
    ) {

        try {

            const stored =
                localStorage.getItem(
                    key
                );


            if (!stored) {

                continue;

            }


            const data =
                JSON.parse(
                    stored
                );


            if (
                Array.isArray(data)
            ) {

                return data;

            }

        }

        catch {

            continue;

        }

    }


    return [];

}



/* =========================================================
   FILTER TRANSACTIONS
========================================================= */

function filterTransactions(
    transactions
) {

    const type =
        document.getElementById(
            "reportType"
        )?.value ||
        "monthly";


    return transactions.filter(
        transaction => {

            const date =
                normalizeReportDate(
                    transaction.date
                );


            if (!date) {

                return false;

            }


            if (
                type === "daily"
            ) {

                const selected =
                    document.getElementById(
                        "reportDate"
                    )?.value;


                return date === selected;

            }


            if (
                type === "monthly"
            ) {

                const selected =
                    document.getElementById(
                        "reportMonth"
                    )?.value;


                return date.startsWith(
                    selected
                );

            }


            if (
                type === "yearly"
            ) {

                const selected =
                    String(
                        document.getElementById(
                            "reportYear"
                        )?.value
                    );


                return date.startsWith(
                    selected
                );

            }


            /*
               all
            */

            return true;

        }
    );

}



/* =========================================================
   NORMALIZE DATE
========================================================= */

function normalizeReportDate(
    date
) {

    if (!date) {

        return "";

    }


    const value =
        String(
            date
        );


    if (
        /^\d{4}-\d{2}-\d{2}$/
            .test(value)
    ) {

        return value;

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
   GET TRANSACTION TYPE
========================================================= */

function getReportTransactionType(
    transaction
) {

    const type =
        String(
            transaction.type ||
            ""
        )
            .trim()
            .toLowerCase();


    if (
        type === "income" ||
        type === "जमा"
    ) {

        return "income";

    }


    if (
        type === "expense" ||
        type === "खर्च"
    ) {

        return "expense";

    }


    /*
       Some old data may use category/typeName
    */

    if (
        String(
            transaction.transactionType ||
            ""
        )
            .toLowerCase()
            .includes(
                "income"
            )
    ) {

        return "income";

    }


    return type === "expense"
        ? "expense"
        : type === "income"
            ? "income"
            : "";

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


            const type =
                getReportTransactionType(
                    transaction
                );


            if (
                type === "income"
            ) {

                income +=
                    amount;

            }


            else if (
                type === "expense"
            ) {

                expense +=
                    amount;

            }

        }
    );


    const balance =
        income -
        expense;


    setReportText(
        "reportTotalIncome",
        formatReportMoney(
            income
        )
    );


    setReportText(
        "reportTotalExpense",
        formatReportMoney(
            expense
        )
    );


    setReportText(
        "reportBalance",
        formatReportMoney(
            balance
        )
    );


    setReportText(
        "reportTransactionCount",
        transactions.length
    );


    const balanceElement =
        document.getElementById(
            "reportBalance"
        );


    if (balanceElement) {

        balanceElement.style.color =
            balance < 0
                ? "var(--expense)"
                : "var(--income)";

    }

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
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        "";


    const expenseTransactions =
        transactions.filter(
            transaction =>
                getReportTransactionType(
                    transaction
                ) === "expense"
        );


    if (
        expenseTransactions.length ===
        0
    ) {

        container.innerHTML = `

            <div class="empty-report">

                <i class="fa-solid fa-chart-pie"
                   style="font-size:25px;">
                </i>

                <br><br>

                या कालावधीमध्ये खर्चाची नोंद उपलब्ध नाही.

            </div>

        `;

        return;

    }


    const categoryTotals = {};


    expenseTransactions.forEach(
        transaction => {

            const category =
                String(
                    transaction.category ||
                    "Other"
                ).trim();


            const amount =
                Number(
                    transaction.amount
                ) || 0;


            if (
                !categoryTotals[
                    category
                ]
            ) {

                categoryTotals[
                    category
                ] = 0;

            }


            categoryTotals[
                category
            ] += amount;

        }
    );


    const sorted =
        Object.entries(
            categoryTotals
        )
        .sort(
            (a, b) =>
                b[1] - a[1]
        );


    const totalExpense =
        sorted.reduce(
            (
                total,
                item
            ) =>
                total +
                item[1],
            0
        );


    sorted.forEach(
        (
            [category, amount]
        ) => {

            const percentage =
                totalExpense > 0
                    ? (
                        amount /
                        totalExpense
                    ) * 100
                    : 0;


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "category-report-item";


            item.innerHTML = `

                <div class="category-report-top">

                    <div class="category-report-name">

                        <div class="category-report-icon">

                            <i class="fa-solid fa-tag"></i>

                        </div>


                        <span>

                            ${escapeReportHTML(
                                category
                            )}

                        </span>

                    </div>


                    <div class="category-report-amount">

                        ${formatReportMoney(
                            amount
                        )}

                    </div>

                </div>


                <div class="category-report-progress">

                    <div
                        class="category-report-progress-inner"
                        style="width:${Math.min(
                            percentage,
                            100
                        )}%"
                    ></div>

                </div>


                <div
                    style="
                        font-size:9px;
                        color:var(--muted);
                        margin-top:4px;
                    "
                >

                    ${percentage.toFixed(1)}%
                    of total expense

                </div>

            `;


            container.appendChild(
                item
            );

        }
    );

}



/* =========================================================
   TRANSACTION LIST
========================================================= */

function renderTransactions(
    transactions
) {

    const container =
        document.getElementById(
            "reportTransactionsList"
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        "";


    const sorted =
        [...transactions]
            .sort(
                (
                    a,
                    b
                ) => {

                    const dateA =
                        new Date(
                            a.date ||
                            0
                        );


                    const dateB =
                        new Date(
                            b.date ||
                            0
                        );


                    return (
                        dateB -
                        dateA
                    );

                }
            );


    if (
        sorted.length ===
        0
    ) {

        container.innerHTML = `

            <div class="empty-report">

                <i class="fa-solid fa-receipt"
                   style="font-size:25px;">
                </i>

                <br><br>

                कोणतेही Transactions उपलब्ध नाहीत.

            </div>

        `;

        return;

    }


    sorted.forEach(
        transaction => {

            const type =
                getReportTransactionType(
                    transaction
                );


            const amount =
                Number(
                    transaction.amount
                ) || 0;


            const category =
                transaction.category ||
                "";


            const description =
                transaction.description ||
                transaction.note ||
                transaction.title ||
                category ||
                "Transaction";


            const date =
                normalizeReportDate(
                    transaction.date
                );


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "report-transaction";


            row.innerHTML = `

                <div
                    class="
                        report-transaction-icon
                        ${type === "income"
                            ? "income"
                            : "expense"}
                    "
                >

                    <i
                        class="
                            fa-solid
                            ${
                                type === "income"
                                    ? "fa-arrow-down"
                                    : "fa-arrow-up"
                            }
                        "
                    ></i>

                </div>


                <div class="report-transaction-info">

                    <strong>

                        ${escapeReportHTML(
                            description
                        )}

                    </strong>


                    <span>

                        ${
                            category
                                ? escapeReportHTML(
                                    category
                                  ) +
                                  " • "
                                : ""
                        }

                        ${formatReportDate(
                            date
                        )}

                    </span>

                </div>


                <div
                    class="
                        report-transaction-amount
                        ${type}
                    "
                >

                    ${
                        type === "income"
                            ? "+"
                            : "-"
                    }

                    ${formatReportMoney(
                        amount
                    )}

                </div>

            `;


            container.appendChild(
                row
            );

        }
    );


    const label =
        document.getElementById(
            "transactionReportLabel"
        );


    if (label) {

        label.textContent =
            sorted.length +
            " transactions";

    }

}



/* =========================================================
   BUDGET REPORT
========================================================= */

function renderBudgetReport(
    transactions
) {

    const month =
        getReportMonthForBudget();


    if (!month) {

        clearBudgetReport();

        return;

    }


    const budgets =
        getReportBudgets();


    const budget =
        budgets[month];


    if (!budget) {

        clearBudgetReport(
            month
        );

        return;

    }


    const plannedMoney =
        Number(
            budget.plannedMoney
        ) || 0;


    const totalBudget =
        Object.values(
            budget.categories ||
            {}
        )
        .reduce(
            (
                total,
                amount
            ) =>
                total +
                (
                    Number(
                        amount
                    ) || 0
                ),
            0
        );


    const actualExpense =
        transactions
            .filter(
                transaction =>
                    getReportTransactionType(
                        transaction
                    ) === "expense"
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


    const remaining =
        totalBudget -
        actualExpense;


    const percentage =
        totalBudget > 0
            ? (
                actualExpense /
                totalBudget
            ) * 100
            : 0;


    setReportText(
        "reportPlannedMoney",
        formatReportMoney(
            plannedMoney
        )
    );


    setReportText(
        "reportTotalBudget",
        formatReportMoney(
            totalBudget
        )
    );


    setReportText(
        "reportBudgetActual",
        formatReportMoney(
            actualExpense
        )
    );


    setReportText(
        "reportBudgetRemaining",
        formatReportMoney(
            remaining
        )
    );


    setReportText(
        "budgetReportMonthText",
        formatBudgetMonthText(
            month
        )
    );


    const progress =
        document.getElementById(
            "reportBudgetProgress"
        );


    if (progress) {

        progress.style.width =
            Math.min(
                Math.max(
                    percentage,
                    0
                ),
                100
            ) + "%";

    }


    const status =
        document.getElementById(
            "reportBudgetStatus"
        );


    if (status) {

        if (
            totalBudget <= 0
        ) {

            status.textContent =
                "या महिन्यासाठी Category Budget सेट केलेले नाही.";

            status.style.color =
                "#9b6a00";

        }

        else if (
            actualExpense >
            totalBudget
        ) {

            status.textContent =
                "⚠️ Budget पेक्षा " +
                formatReportMoney(
                    actualExpense -
                    totalBudget
                ) +
                " जास्त खर्च झाला आहे.";

            status.style.color =
                "var(--expense)";

        }

        else {

            status.textContent =
                "Budget चा " +
                percentage.toFixed(
                    1
                ) +
                "% वापर झाला आहे.";

            status.style.color =
                percentage >=
                (
                    Number(
                        budget.alertPercent
                    ) || 80
                )
                    ? "#b57900"
                    : "var(--income)";

        }

    }

}



/* =========================================================
   GET BUDGET MONTH
========================================================= */

function getReportMonthForBudget() {

    const type =
        document.getElementById(
            "reportType"
        )?.value;


    if (
        type === "monthly"
    ) {

        return document.getElementById(
            "reportMonth"
        )?.value;

    }


    /*
       Daily report साठी त्याच month चे
       Budget दाखवता येईल.
    */

    if (
        type === "daily"
    ) {

        const date =
            document.getElementById(
                "reportDate"
            )?.value;


        return date
            ? date.substring(
                0,
                7
            )
            : "";

    }


    /*
       Yearly / All मध्ये Budget section
       specific month नसल्यामुळे hide/clear.
    */

    return "";

}



/* =========================================================
   GET BUDGET STORAGE
========================================================= */

function getReportBudgets() {

    try {

        const stored =
            localStorage.getItem(
                REPORT_BUDGET_KEY
            );


        if (!stored) {

            return {};

        }


        const data =
            JSON.parse(
                stored
            );


        return (
            data &&
            typeof data === "object"
        )
            ? data
            : {};

    }

    catch {

        return {};

    }

}



/* =========================================================
   CLEAR BUDGET
========================================================= */

function clearBudgetReport(
    month = ""
) {

    setReportText(
        "reportPlannedMoney",
        "₹0.00"
    );


    setReportText(
        "reportTotalBudget",
        "₹0.00"
    );


    setReportText(
        "reportBudgetActual",
        "₹0.00"
    );


    setReportText(
        "reportBudgetRemaining",
        "₹0.00"
    );


    setReportText(
        "budgetReportMonthText",
        month
            ? formatBudgetMonthText(
                month
              )
            : "-"
    );


    const progress =
        document.getElementById(
            "reportBudgetProgress"
        );


    if (progress) {

        progress.style.width =
            "0%";

    }


    const status =
        document.getElementById(
            "reportBudgetStatus"
        );


    if (status) {

        status.textContent =
            month
                ? "या महिन्यासाठी Budget उपलब्ध नाही."
                : "Budget comparison फक्त Monthly / Daily report मध्ये उपलब्ध आहे.";

    }

}



/* =========================================================
   CSV EXPORT
========================================================= */

function exportReportCSV() {

    const transactions =
        filterTransactions(
            getReportTransactions()
        );


    if (
        transactions.length ===
        0
    ) {

        alert(
            "Export करण्यासाठी कोणतेही transactions नाहीत."
        );

        return;

    }


    const rows = [

        [
            "Date",
            "Type",
            "Category",
            "Description",
            "Amount"
        ]

    ];


    transactions.forEach(
        transaction => {

            const type =
                getReportTransactionType(
                    transaction
                );


            rows.push(

                [

                    normalizeReportDate(
                        transaction.date
                    ),

                    type === "income"
                        ? "जमा"
                        : "खर्च",

                    transaction.category ||
                        "",

                    transaction.description ||
                        transaction.note ||
                        transaction.title ||
                        "",

                    Number(
                        transaction.amount
                    ) || 0

                ]

            );

        }
    );


    const csv =
        rows
            .map(
                row =>
                    row
                        .map(
                            value =>
                                csvEscape(
                                    value
                                )
                        )
                        .join(",")
            )
            .join("\n");


    /*
       UTF-8 BOM
       Marathi Excel मध्ये योग्य दिसण्यासाठी.
    */

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
        "Rojcha-Jama-Kharch-Report.csv";


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
   CSV ESCAPE
========================================================= */

function csvEscape(
    value
) {

    const text =
        String(
            value ?? ""
        );


    if (
        text.includes(",") ||
        text.includes('"') ||
        text.includes("\n")
    ) {

        return (
            '"' +
            text.replace(
                /"/g,
                '""'
            ) +
            '"'
        );

    }


    return text;

}



/* =========================================================
   PRINT
========================================================= */

function printReport() {

    window.print();

}



/* =========================================================
   MONEY FORMAT
========================================================= */

function formatReportMoney(
    amount
) {

    const value =
        Number(
            amount
        ) || 0;


    if (
        typeof formatMoney ===
        "function"
    ) {

        return formatMoney(
            value
        );

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
   DATE FORMAT
========================================================= */

function formatReportDate(
    date
) {

    if (!date) {

        return "-";

    }


    const parts =
        date.split(
            "-"
        );


    if (
        parts.length !==
        3
    ) {

        return date;

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
   MONTH FORMAT
========================================================= */

function formatBudgetMonthText(
    month
) {

    if (!month) {

        return "-";

    }


    const parts =
        month.split(
            "-"
        );


    if (
        parts.length !==
        2
    ) {

        return month;

    }


    const months = [

        "जानेवारी",
        "फेब्रुवारी",
        "मार्च",
        "एप्रिल",
        "मे",
        "जून",
        "जुलै",
        "ऑगस्ट",
        "सप्टेंबर",
        "ऑक्टोबर",
        "नोव्हेंबर",
        "डिसेंबर"

    ];


    const index =
        Number(
            parts[1]
        ) - 1;


    return (

        months[index] ||
        parts[1]

    ) +
    " " +
    parts[0];

}



/* =========================================================
   SET TEXT
========================================================= */

function setReportText(
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
   ESCAPE HTML
========================================================= */

function escapeReportHTML(
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


function goToBudget() {

    window.location.href =
        "monthly-budget.html";

}


function goToIncome() {

    window.location.href =
        "income.html";

}


function goToExpense() {

    window.location.href =
        "expense.html";

}



/* =========================================================
   QUICK ADD
========================================================= */

function openQuickAdd() {

    const menu =
        document.getElementById(
            "quickAddMenu"
        );


    if (!menu) {

        return;

    }


    menu.style.display =
        menu.style.display ===
        "block"
            ? "none"
            : "block";

}



/* =========================================================
   AUTO REFRESH
========================================================= */

window.addEventListener(
    "storage",
    function () {

        generateReport();

    }
);


window.addEventListener(
    "rdkhTransactionsUpdated",
    function () {

        generateReport();

    }
);
