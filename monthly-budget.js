/* =========================================================
   monthly-budget.js

   रोजचा जमा खर्च अहवाल
   MONTHLY BUDGET MANAGEMENT

   CONNECTED WITH:
   - app.js
   - transactions.js
   - expense.js
   - accounts.js
   - reports.js

   FEATURES:
   ---------------------------------------------------------
   ✅ Monthly Planned Budget
   ✅ Category-wise Budget
   ✅ Actual Expense automatic
   ✅ Remaining Budget
   ✅ Budget Used %
   ✅ Category-wise progress
   ✅ Budget alert %
   ✅ Central transaction integration
   ✅ Category transaction modal
   ✅ Edit/Delete transaction support through transactions page
   ✅ Budget does NOT affect account balance
   ========================================================= */


/* =========================================================
   STORAGE
========================================================= */

const MONTHLY_BUDGET_STORAGE_KEY = "monthly_budgets";

const LEGACY_MONTHLY_BUDGET_STORAGE_KEY =
    "rdkh_monthly_budgets";


/* =========================================================
   DEFAULT ALERT
========================================================= */

const DEFAULT_BUDGET_ALERT_PERCENT = 80;


/* =========================================================
   EXPENSE CATEGORIES
========================================================= */

const BUDGET_EXPENSE_CATEGORIES = [

    {
        id: "daily_grocery",
        name: "दररोजचा किराणा खर्च",
        icon: "🛒",
        frequency: "daily"
    },

    {
        id: "monthly_grocery",
        name: "महिन्याचा किराणा खर्च",
        icon: "🛍️",
        frequency: "monthly"
    },

    {
        id: "travel",
        name: "प्रवास",
        icon: "🚗",
        frequency: "daily"
    },

    {
        id: "shopping",
        name: "खरेदी",
        icon: "🛍️",
        frequency: "monthly"
    },

    {
        id: "outside_food",
        name: "बाहेर जेवण",
        icon: "🍽️",
        frequency: "daily"
    },

    {
        id: "electricity",
        name: "लाईट बिल",
        icon: "💡",
        frequency: "monthly"
    },

    {
        id: "medicine",
        name: "औषधे",
        icon: "💊",
        frequency: "monthly"
    },

    {
        id: "home_emi",
        name: "घराचा EMI",
        icon: "🏠",
        frequency: "monthly"
    },

    {
        id: "home_maintenance",
        name: "घरचा मेंटेनन्स",
        icon: "🏢",
        frequency: "monthly"
    },

    {
        id: "insurance",
        name: "इन्शुरन्स पॉलिसी",
        icon: "🛡️",
        frequency: "yearly"
    },

    {
        id: "other_loan",
        name: "इतर लोन",
        icon: "💳",
        frequency: "monthly"
    },

    {
        id: "mobile_bill",
        name: "मोबाईल बिल",
        icon: "📱",
        frequency: "monthly"
    },

    {
        id: "other_expense",
        name: "इतर खर्च",
        icon: "📦",
        frequency: "daily"
    },

    {
        id: "monthly_gas",
        name: "महिन्याचा गॅस",
        icon: "🔥",
        frequency: "monthly"
    },

    {
        id: "fish",
        name: "मच्छी",
        icon: "🐟",
        frequency: "daily"
    }

];


/* =========================================================
   GLOBAL CATEGORY LIST
========================================================= */

window.EXPENSE_CATEGORIES =
    window.EXPENSE_CATEGORIES ||
    BUDGET_EXPENSE_CATEGORIES;


/* =========================================================
   CURRENT MONTH
========================================================= */

function getBudgetCurrentMonth() {

    const now = new Date();

    return (
        now.getFullYear() +
        "-" +
        String(
            now.getMonth() + 1
        ).padStart(2, "0")
    );

}


/* =========================================================
   GET BUDGET MONTH FROM HTML
========================================================= */

function getBudgetMonth() {

    const input =
        document.getElementById(
            "budgetMonth"
        );

    if (
        input &&
        input.value
    ) {

        return input.value;

    }

    return getBudgetCurrentMonth();

}


/* =========================================================
   GET MONTHLY BUDGETS
========================================================= */

function getMonthlyBudgets() {

    try {

        /*
         * New storage
         */

        const raw =
            localStorage.getItem(
                MONTHLY_BUDGET_STORAGE_KEY
            );


        if (raw) {

            const data =
                JSON.parse(raw);


            if (
                data &&
                typeof data === "object" &&
                !Array.isArray(data)
            ) {

                return data;

            }

        }


        /*
         * Legacy storage support
         */

        const legacyRaw =
            localStorage.getItem(
                LEGACY_MONTHLY_BUDGET_STORAGE_KEY
            );


        if (legacyRaw) {

            const legacyData =
                JSON.parse(
                    legacyRaw
                );


            if (
                legacyData &&
                typeof legacyData === "object" &&
                !Array.isArray(legacyData)
            ) {

                localStorage.setItem(
                    MONTHLY_BUDGET_STORAGE_KEY,
                    JSON.stringify(
                        legacyData
                    )
                );


                return legacyData;

            }

        }

    } catch (error) {

        console.error(
            "Budget data read error:",
            error
        );

    }


    return {};

}


/* =========================================================
   SAVE MONTHLY BUDGETS
========================================================= */

function saveMonthlyBudgets(
    budgets
) {

    const safeData =
        budgets &&
        typeof budgets === "object"
            ? budgets
            : {};


    localStorage.setItem(
        MONTHLY_BUDGET_STORAGE_KEY,
        JSON.stringify(
            safeData
        )
    );


    /*
     * IMPORTANT:
     * Budget is NOT a transaction.
     * Account balance will NOT change.
     */

    try {

        window.dispatchEvent(
            new CustomEvent(
                "rdkhBudgetUpdated",
                {
                    detail: safeData
                }
            )
        );

    } catch (error) {

        console.warn(
            "Budget event error:",
            error
        );

    }


    return safeData;

}


/* =========================================================
   GET SINGLE MONTH BUDGET
========================================================= */

function getBudgetForMonth(
    month
) {

    const selectedMonth =
        month ||
        getBudgetCurrentMonth();


    const budgets =
        getMonthlyBudgets();


    const data =
        budgets[selectedMonth];


    if (
        data &&
        typeof data === "object"
    ) {

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
                data.categories &&
                typeof data.categories === "object"
                    ? data.categories
                    : {},

            alertPercent:
                Number(
                    data.alertPercent ??
                    DEFAULT_BUDGET_ALERT_PERCENT
                ) || DEFAULT_BUDGET_ALERT_PERCENT,

            updatedAt:
                data.updatedAt || ""

        };

    }


    return {

        total: 0,

        plannedMoney: 0,

        categories: {},

        alertPercent:
            DEFAULT_BUDGET_ALERT_PERCENT,

        updatedAt: ""

    };

}


/* =========================================================
   FORMAT MONEY
========================================================= */

function formatBudgetMoney(
    amount
) {

    const value =
        Number(amount) || 0;


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
   GET CENTRAL TRANSACTIONS
========================================================= */

function getBudgetTransactions() {

    if (
        typeof window.getTransactions ===
        "function"
    ) {

        try {

            const transactions =
                window.getTransactions();


            return Array.isArray(
                transactions
            )
                ? transactions
                : [];

        } catch (error) {

            console.error(
                "Transaction read error:",
                error
            );

        }

    }


    /*
     * Direct fallback
     */

    const keys = [

        "rdkh_transactions_v2",

        "rdkh_transactions",

        "transactions",

        "income_expense_transactions",

        "expense_transactions"

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


            const data =
                JSON.parse(raw);


            if (
                Array.isArray(data)
            ) {

                return data;

            }

        } catch (error) {

            console.warn(
                "Transaction fallback error:",
                key,
                error
            );

        }

    }


    return [];

}


/* =========================================================
   ACTUAL EXPENSE BY CATEGORY
========================================================= */

function getActualExpense(
    categoryId,
    month
) {

    const selectedMonth =
        month ||
        getBudgetCurrentMonth();


    /*
     * Use central helper if available
     */

    if (
        typeof window.getCategoryExpenseTotal ===
        "function"
    ) {

        try {

            return Number(
                window.getCategoryExpenseTotal(
                    categoryId,
                    selectedMonth
                )
            ) || 0;

        } catch (error) {

            console.warn(
                "Central category expense helper error:",
                error
            );

        }

    }


    const transactions =
        getBudgetTransactions();


    return transactions
        .filter(
            transaction => {

                if (
                    String(
                        transaction.type
                    ).toLowerCase() !==
                    "expense"
                ) {

                    return false;

                }


                const transactionCategory =
                    transaction.categoryId ||
                    transaction.category ||
                    "";


                if (
                    String(
                        transactionCategory
                    ) !==
                    String(
                        categoryId
                    )
                ) {

                    return false;

                }


                if (
                    selectedMonth &&
                    !String(
                        transaction.date || ""
                    )
                        .startsWith(
                            selectedMonth
                        )
                ) {

                    return false;

                }


                return true;

            }
        )
        .reduce(
            (
                total,
                transaction
            ) => {

                return (
                    total +
                    (
                        Number(
                            transaction.amount
                        ) || 0
                    )
                );

            },
            0
        );

}


/* =========================================================
   TOTAL ACTUAL EXPENSE
========================================================= */

function getActualExpenseForMonth(
    month
) {

    const selectedMonth =
        month ||
        getBudgetCurrentMonth();


    const transactions =
        getBudgetTransactions();


    return transactions
        .filter(
            transaction => {

                return (

                    String(
                        transaction.type
                    ).toLowerCase() ===
                    "expense" &&

                    String(
                        transaction.date || ""
                    )
                        .startsWith(
                            selectedMonth
                        )

                );

            }
        )
        .reduce(
            (
                total,
                transaction
            ) => {

                return (
                    total +
                    (
                        Number(
                            transaction.amount
                        ) || 0
                    )
                );

            },
            0
        );

}


/* =========================================================
   BUDGET TRACKING
========================================================= */

function getBudgetTracking(
    month
) {

    const selectedMonth =
        month ||
        getBudgetCurrentMonth();


    const budget =
        getBudgetForMonth(
            selectedMonth
        );


    const categories =
        window.EXPENSE_CATEGORIES ||
        BUDGET_EXPENSE_CATEGORIES;


    return categories.map(
        category => {

            const planned =
                Number(
                    budget.categories[
                        category.id
                    ] || 0
                ) || 0;


            const actual =
                getActualExpense(
                    category.id,
                    selectedMonth
                );


            const remaining =
                planned -
                actual;


            let usedPercent = 0;


            if (
                planned > 0
            ) {

                usedPercent =
                    (
                        actual /
                        planned
                    ) *
                    100;

            }


            if (
                !Number.isFinite(
                    usedPercent
                )
            ) {

                usedPercent = 0;

            }


            return {

                id:
                    category.id,

                name:
                    category.name,

                icon:
                    category.icon,

                frequency:
                    category.frequency,

                planned:
                    planned,

                actual:
                    actual,

                remaining:
                    remaining,

                usedPercent:
                    usedPercent

            };

        }
    );

}


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeBudgetForm();

        setupBudgetEvents();

        renderMonthlyBudget();

    }
);


/* =========================================================
   INITIALIZE BUDGET FORM
========================================================= */

function initializeBudgetForm() {

    const monthInput =
        document.getElementById(
            "budgetMonth"
        );


    if (
        monthInput &&
        !monthInput.value
    ) {

        monthInput.value =
            getBudgetCurrentMonth();

    }


    renderBudgetCategoryInputs();

    loadSavedBudgetIntoForm();

    setupBudgetFormSubmit();

}


/* =========================================================
   RENDER CATEGORY INPUTS
========================================================= */

function renderBudgetCategoryInputs() {

    const container =
        document.getElementById(
            "budgetCategoryInputs"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    const categories =
        window.EXPENSE_CATEGORIES ||
        BUDGET_EXPENSE_CATEGORIES;


    categories.forEach(
        category => {

            const wrapper =
                document.createElement(
                    "div"
                );


            wrapper.className =
                "budget-category-row";


            wrapper.innerHTML = `

                <div class="budget-category-info">

                    <span class="budget-category-icon">
                        ${escapeBudgetHTML(
                            category.icon
                        )}
                    </span>

                    <div>

                        <strong>
                            ${escapeBudgetHTML(
                                category.name
                            )}
                        </strong>

                        <small>
                            ${getFrequencyLabel(
                                category.frequency
                            )}
                        </small>

                    </div>

                </div>


                <div class="budget-category-input">

                    <span>₹</span>

                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        class="budget-category-amount"
                        data-category-id="${escapeBudgetAttribute(
                            category.id
                        )}"
                        placeholder="0"
                    >

                </div>

            `;


            container.appendChild(
                wrapper
            );

        }
    );

}


/* =========================================================
   FREQUENCY LABEL
========================================================= */

function getFrequencyLabel(
    frequency
) {

    switch (
        String(
            frequency || ""
        ).toLowerCase()
    ) {

        case "daily":
            return "दररोज";

        case "monthly":
            return "मासिक";

        case "yearly":
            return "वार्षिक";

        default:
            return "";

    }

}


/* =========================================================
   LOAD SAVED BUDGET INTO FORM
========================================================= */

function loadSavedBudgetIntoForm() {

    const month =
        getBudgetMonth();


    const budget =
        getBudgetForMonth(
            month
        );


    /*
     * IMPORTANT:
     * HTML ID = plannedTotalBudget
     */

    const totalInput =
        document.getElementById(
            "plannedTotalBudget"
        );


    if (totalInput) {

        totalInput.value =
            budget.total > 0
                ? budget.total
                : "";

    }


    /*
     * Category values
     */

    const inputs =
        document.querySelectorAll(
            ".budget-category-amount"
        );


    inputs.forEach(
        input => {

            const id =
                input.dataset.categoryId;


            const value =
                budget.categories[
                    id
                ];


            input.value =
                Number(value) > 0
                    ? value
                    : "";

        }
    );

}


/* =========================================================
   SETUP FORM SUBMIT
========================================================= */

function setupBudgetFormSubmit() {

    const form =
        document.getElementById(
            "monthlyBudgetForm"
        );


    if (!form) {

        return;

    }


    if (
        form.dataset.budgetReady ===
        "true"
    ) {

        return;

    }


    form.dataset.budgetReady =
        "true";


    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            saveBudgetData();

        }
    );

}


/* =========================================================
   SAVE BUDGET DATA
========================================================= */

function saveBudgetData() {

    const month =
        getBudgetMonth();


    if (!month) {

        alert(
            "कृपया महिना निवडा."
        );

        return;

    }


    /*
     * Total budget
     *
     * HTML ID:
     * plannedTotalBudget
     */

    const totalInput =
        document.getElementById(
            "plannedTotalBudget"
        );


    let total =
        totalInput
            ? Number(
                totalInput.value
            ) || 0
            : 0;


    /*
     * Category budgets
     */

    const categories = {};


    const inputs =
        document.querySelectorAll(
            ".budget-category-amount"
        );


    inputs.forEach(
        input => {

            const id =
                input.dataset.categoryId;


            if (!id) {
                return;
            }


            const value =
                Number(
                    input.value
                ) || 0;


            categories[id] =
                value;

        }
    );


    /*
     * If total budget is empty,
     * calculate it from categories.
     */

    if (
        total <= 0
    ) {

        total =
            Object.values(
                categories
            )
                .reduce(
                    (
                        sum,
                        value
                    ) => {

                        return (
                            sum +
                            (
                                Number(
                                    value
                                ) || 0
                            )
                        );

                    },
                    0
                );

    }


    const budgets =
        getMonthlyBudgets();


    /*
     * Preserve existing alert %
     * because current HTML has no
     * alert percentage field.
     */

    const oldBudget =
        getBudgetForMonth(
            month
        );


    budgets[month] = {

        total:
            total,

        plannedMoney:
            total,

        categories:
            categories,

        alertPercent:
            oldBudget.alertPercent ||
            DEFAULT_BUDGET_ALERT_PERCENT,

        updatedAt:
            new Date().toISOString()

    };


    /*
     * IMPORTANT
     *
     * येथे transaction तयार होत नाही.
     *
     * Account balance वर कोणताही परिणाम नाही.
     */

    saveMonthlyBudgets(
        budgets
    );


    /*
     * Refresh UI
     */

    renderMonthlyBudget(
        month
    );


    showBudgetMessage(
        "मासिक बजेट यशस्वीरित्या सेव्ह केले आहे."
    );

}


/* =========================================================
   RENDER MONTHLY BUDGET
========================================================= */

function renderMonthlyBudget(
    month
) {

    const selectedMonth =
        month ||
        getBudgetMonth();


    const budget =
        getBudgetForMonth(
            selectedMonth
        );


    const tracking =
        getBudgetTracking(
            selectedMonth
        );


    /*
     * Actual total
     */

    const actualTotal =
        tracking.reduce(
            (
                total,
                item
            ) => {

                return (
                    total +
                    item.actual
                );

            },
            0
        );


    /*
     * Planned total
     */

    const plannedTotal =
        Number(
            budget.total
        ) || 0;


    /*
     * Remaining
     */

    const remaining =
        plannedTotal -
        actualTotal;


    /*
     * Used %
     */

    let usedPercent = 0;


    if (
        plannedTotal > 0
    ) {

        usedPercent =
            (
                actualTotal /
                plannedTotal
            ) *
            100;

    }


    if (
        !Number.isFinite(
            usedPercent
        )
    ) {

        usedPercent = 0;

    }


    /*
     * HTML SUMMARY IDs
     */

    setBudgetText(
        "budgetPlannedTotal",
        formatBudgetMoney(
            plannedTotal
        )
    );


    setBudgetText(
        "budgetActualTotal",
        formatBudgetMoney(
            actualTotal
        )
    );


    setBudgetText(
        "budgetRemainingTotal",
        formatBudgetMoney(
            remaining
        )
    );


    /*
     * Optional IDs
     * for compatibility with
     * older HTML versions.
     */

    setBudgetText(
        "plannedBudget",
        formatBudgetMoney(
            plannedTotal
        )
    );


    setBudgetText(
        "totalPlannedBudget",
        formatBudgetMoney(
            plannedTotal
        )
    );


    setBudgetText(
        "budgetPlanned",
        formatBudgetMoney(
            plannedTotal
        )
    );


    setBudgetText(
        "actualBudget",
        formatBudgetMoney(
            actualTotal
        )
    );


    setBudgetText(
        "totalActualBudget",
        formatBudgetMoney(
            actualTotal
        )
    );


    setBudgetText(
        "budgetActual",
        formatBudgetMoney(
            actualTotal
        )
    );


    setBudgetText(
        "remainingBudget",
        formatBudgetMoney(
            remaining
        )
    );


    setBudgetText(
        "totalRemainingBudget",
        formatBudgetMoney(
            remaining
        )
    );


    setBudgetText(
        "budgetRemaining",
        formatBudgetMoney(
            remaining
        )
    );


    setBudgetText(
        "budgetUsedPercent",
        Math.round(
            usedPercent
        ) + "%"
    );


    setBudgetText(
        "totalBudgetUsedPercent",
        Math.round(
            usedPercent
        ) + "%"
    );


    setBudgetText(
        "budgetPercentage",
        Math.round(
            usedPercent
        ) + "%"
    );


    /*
     * Category tracking
     */

    renderBudgetTracking(
        tracking,
        budget.alertPercent
    );


    /*
     * Update form
     */

    loadSavedBudgetIntoForm();

}


/* =========================================================
   RENDER CATEGORY TRACKING
========================================================= */

function renderBudgetTracking(
    tracking,
    alertPercent
) {

    const container =
        document.getElementById(
            "budgetTracking"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    if (!tracking.length) {

        container.innerHTML = `

            <div class="empty-budget-state">

                <i class="fa-solid fa-chart-column"></i>

                <p>
                    Category budget उपलब्ध नाही.
                </p>

            </div>

        `;

        return;

    }


    tracking.forEach(
        item => {

            const percentage =
                Math.min(
                    Math.max(
                        Number(
                            item.usedPercent
                        ) || 0,
                        0
                    ),
                    100
                );


            const exceeded =
                item.planned > 0 &&
                item.actual >
                item.planned;


            const alert =
                !exceeded &&
                item.planned > 0 &&
                item.usedPercent >=
                alertPercent;


            const statusClass =
                exceeded
                    ? "budget-over"
                    : alert
                        ? "budget-alert"
                        : "budget-normal";


            const statusText =
                exceeded
                    ? "बजेट ओव्हर"
                    : alert
                        ? "बजेट जवळ आले"
                        : "ठीक";


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "budget-tracking-card " +
                statusClass;


            card.innerHTML = `

                <div class="budget-track-header">

                    <div class="budget-track-title">

                        <span class="budget-track-icon">
                            ${escapeBudgetHTML(
                                item.icon
                            )}
                        </span>

                        <div>

                            <strong>
                                ${escapeBudgetHTML(
                                    item.name
                                )}
                            </strong>

                            <small>
                                ${getFrequencyLabel(
                                    item.frequency
                                )}
                            </small>

                        </div>

                    </div>


                    <span class="budget-status">
                        ${statusText}
                    </span>

                </div>


                <div class="budget-track-values">

                    <span>
                        नियोजित:
                        <strong>
                            ${formatBudgetMoney(
                                item.planned
                            )}
                        </strong>
                    </span>


                    <span>
                        खर्च:
                        <strong>
                            ${formatBudgetMoney(
                                item.actual
                            )}
                        </strong>
                    </span>


                    <span>
                        उर्वरित:
                        <strong>
                            ${formatBudgetMoney(
                                item.remaining
                            )}
                        </strong>
                    </span>

                </div>


                <div class="budget-progress">

                    <div
                        class="budget-progress-bar ${statusClass}"
                        style="width:${percentage}%">
                    </div>

                </div>


                <div class="budget-track-footer">

                    <span>
                        ${Math.round(
                            item.usedPercent
                        )}% वापरले
                    </span>


                    <button
                        type="button"
                        onclick="openCategoryTransactions('${escapeBudgetAttribute(
                            item.id
                        )}')"
                    >

                        व्यवहार पहा

                    </button>

                </div>

            `;


            container.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   OPEN CATEGORY TRANSACTIONS
========================================================= */

function openCategoryTransactions(
    categoryId
) {

    const modal =
        document.getElementById(
            "categoryTransactionModal"
        );


    const tbody =
        document.getElementById(
            "categoryTransactionBody"
        );


    if (
        !modal ||
        !tbody
    ) {

        window.location.href =
            "transactions.html";

        return;

    }


    const month =
        getBudgetMonth();


    const transactions =
        getBudgetTransactions();


    const filtered =
        transactions
            .filter(
                transaction => {

                    const category =
                        transaction.categoryId ||
                        transaction.category ||
                        "";


                    return (

                        String(
                            transaction.type
                        ).toLowerCase() ===
                        "expense" &&

                        String(
                            category
                        ) ===
                        String(
                            categoryId
                        ) &&

                        String(
                            transaction.date || ""
                        )
                            .startsWith(
                                month
                            )

                    );

                }
            )
            .sort(
                (
                    a,
                    b
                ) => {

                    const dateCompare =
                        String(
                            b.date || ""
                        )
                            .localeCompare(
                                String(
                                    a.date || ""
                                )
                            );


                    if (
                        dateCompare !== 0
                    ) {

                        return dateCompare;

                    }


                    return String(
                        b.createdAt || ""
                    )
                        .localeCompare(
                            String(
                                a.createdAt || ""
                            )
                        );

                }
            );


    /*
     * Modal category title
     */

    const title =
        document.getElementById(
            "categoryTransactionTitle"
        );


    const category =
        (
            window.EXPENSE_CATEGORIES ||
            BUDGET_EXPENSE_CATEGORIES
        )
            .find(
                item =>
                    String(
                        item.id
                    ) ===
                    String(
                        categoryId
                    )
            );


    if (title) {

        title.textContent =
            category
                ? category.name
                : "खर्च व्यवहार";

    }


    /*
     * Modal month
     */

    const monthLabel =
        document.getElementById(
            "categoryTransactionMonth"
        );


    if (monthLabel) {

        monthLabel.textContent =
            formatBudgetMonth(
                month
            );

    }


    /*
     * Total
     */

    const total =
        filtered.reduce(
            (
                sum,
                transaction
            ) => {

                return (
                    sum +
                    (
                        Number(
                            transaction.amount
                        ) || 0
                    )
                );

            },
            0
        );


    setBudgetText(
        "categoryTransactionTotal",
        formatBudgetMoney(
            total
        )
    );


    setBudgetText(
        "categoryTransactionCount",
        filtered.length +
        (
            filtered.length === 1
                ? " Transaction"
                : " Transactions"
        )
    );


    /*
     * Clear table
     */

    tbody.innerHTML = "";


    if (!filtered.length) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    style="text-align:center;"
                >

                    <i class="fa-solid fa-receipt"></i>

                    <br>

                    या महिन्यात या category चा
                    कोणताही खर्च नाही.

                </td>

            </tr>

        `;

    } else {

        filtered.forEach(
            transaction => {

                const tr =
                    document.createElement(
                        "tr"
                    );


                const description =
                    transaction.description ||
                    transaction.categoryName ||
                    "खर्च";


                const accountName =
                    getBudgetAccountName(
                        transaction.accountId
                    );


                tr.innerHTML = `

                    <td>
                        ${formatBudgetDate(
                            transaction.date
                        )}
                    </td>


                    <td>
                        ${escapeBudgetHTML(
                            description
                        )}
                    </td>


                    <td>
                        <strong class="expense-amount">
                            -${formatBudgetMoney(
                                transaction.amount
                            )}
                        </strong>
                    </td>


                    <td>
                        ${escapeBudgetHTML(
                            transaction.paymentMode ||
                            "-"
                        )}
                    </td>


                    <td>
                        ${escapeBudgetHTML(
                            accountName
                        )}
                    </td>


                    <td>
                        ${escapeBudgetHTML(
                            transaction.note ||
                            "-"
                        )}
                    </td>


                    <td>

                        <button
                            type="button"
                            class="budget-view-transaction-btn"
                            onclick="editBudgetTransaction('${escapeBudgetAttribute(
                                transaction.id
                            )}')"
                            title="Edit"
                        >

                            <i class="fa-solid fa-pen"></i>

                        </button>

                    </td>

                `;


                tbody.appendChild(
                    tr
                );

            }
        );

    }


    /*
     * Open modal
     */

    modal.style.display =
        "flex";


    /*
     * Prevent background scroll
     */

    document.body.classList.add(
        "modal-open"
    );

}


/* =========================================================
   GET ACCOUNT NAME
========================================================= */

function getBudgetAccountName(
    accountId
) {

    if (!accountId) {

        return "-";

    }


    if (
        typeof window.getAccounts ===
        "function"
    ) {

        try {

            const accounts =
                window.getAccounts();


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


            if (account) {

                return (
                    account.name ||
                    account.type ||
                    "-"
                );

            }

        } catch (error) {

            console.warn(
                "Account name error:",
                error
            );

        }

    }


    return accountId;

}


/* =========================================================
   EDIT TRANSACTION
========================================================= */

function editBudgetTransaction(
    transactionId
) {

    if (!transactionId) {
        return;
    }


    const transactions =
        getBudgetTransactions();


    const transaction =
        transactions.find(
            item =>
                String(
                    item.id
                ) ===
                String(
                    transactionId
                )
        );


    if (!transaction) {

        alert(
            "Transaction सापडला नाही."
        );

        return;

    }


    /*
     * Existing transactions.js
     * sessionStorage format
     */

    try {

        sessionStorage.setItem(
            "rdkh_edit_transaction",
            JSON.stringify(
                transaction
            )
        );

    } catch (error) {

        console.error(
            "Edit transaction session error:",
            error
        );

    }


    /*
     * Expense transaction
     */

    if (
        String(
            transaction.type
        ).toLowerCase() ===
        "expense"
    ) {

        window.location.href =
            "expense.html?edit=" +
            encodeURIComponent(
                transaction.id
            );

        return;

    }


    /*
     * Income transaction
     */

    window.location.href =
        "income.html?edit=" +
        encodeURIComponent(
            transaction.id
        );

}


/* =========================================================
   CLOSE CATEGORY TRANSACTIONS
   HTML calls:
   closeCategoryTransactions()
========================================================= */

function closeCategoryTransactions() {

    const modal =
        document.getElementById(
            "categoryTransactionModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }


    document.body.classList.remove(
        "modal-open"
    );

}


/*
 * Compatibility name
 */

function closeCategoryTransactionModal() {

    closeCategoryTransactions();

}


/* =========================================================
   MODAL BACKGROUND CLICK
========================================================= */

window.addEventListener(
    "click",
    function (event) {

        const modal =
            document.getElementById(
                "categoryTransactionModal"
            );


        if (
            modal &&
            event.target === modal
        ) {

            closeCategoryTransactions();

        }

    }
);


/* =========================================================
   REFRESH
========================================================= */

function refreshMonthlyBudget() {

    const month =
        getBudgetMonth();


    renderBudgetCategoryInputs();

    loadSavedBudgetIntoForm();

    renderMonthlyBudget(
        month
    );

}


/* =========================================================
   BUDGET EVENTS
========================================================= */

function setupBudgetEvents() {

    const monthInput =
        document.getElementById(
            "budgetMonth"
        );


    if (monthInput) {

        monthInput.addEventListener(
            "change",
            function () {

                renderBudgetCategoryInputs();

                loadSavedBudgetIntoForm();

                renderMonthlyBudget(
                    monthInput.value
                );

            }
        );

    }


    /*
     * Central transaction changes
     */

    window.addEventListener(
        "rdkhTransactionsUpdated",
        function () {

            renderMonthlyBudget();

            /*
             * If modal is open,
             * refresh its data.
             */

            const modal =
                document.getElementById(
                    "categoryTransactionModal"
                );


            if (
                modal &&
                modal.style.display ===
                "flex"
            ) {

                /*
                 * Modal category can be
                 * reopened by user.
                 */

            }

        }
    );


    /*
     * Budget changes
     */

    window.addEventListener(
        "rdkhBudgetUpdated",
        function () {

            renderMonthlyBudget();

        }
    );


    /*
     * Storage synchronization
     */

    window.addEventListener(
        "storage",
        function (event) {

            if (

                event.key ===
                MONTHLY_BUDGET_STORAGE_KEY ||

                event.key ===
                LEGACY_MONTHLY_BUDGET_STORAGE_KEY ||

                event.key ===
                "rdkh_transactions_v2" ||

                event.key ===
                "rdkh_transactions"

            ) {

                renderMonthlyBudget();

            }

        }
    );

}


/* =========================================================
   SET TEXT
========================================================= */

function setBudgetText(
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
   FORMAT DATE
========================================================= */

function formatBudgetDate(
    date
) {

    if (!date) {

        return "--";

    }


    const parts =
        String(
            date
        ).split("-");


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


    return String(
        date
    );

}


/* =========================================================
   FORMAT MONTH
========================================================= */

function formatBudgetMonth(
    month
) {

    if (!month) {

        return "चालू महिना";

    }


    const parts =
        String(
            month
        ).split("-");


    if (
        parts.length !== 2
    ) {

        return month;

    }


    const monthNames = [

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


    const monthIndex =
        Number(
            parts[1]
        ) - 1;


    return (
        monthNames[
            monthIndex
        ] ||
        parts[1]
    ) +
    " " +
    parts[0];

}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeBudgetHTML(
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

function escapeBudgetAttribute(
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
   SUCCESS MESSAGE
========================================================= */

function showBudgetMessage(
    message
) {

    if (
        typeof window.showToast ===
        "function"
    ) {

        window.showToast(
            message
        );

        return;

    }


    alert(
        message
    );

}


/* =========================================================
   GLOBAL FUNCTIONS
========================================================= */

window.getMonthlyBudgets =
    getMonthlyBudgets;

window.saveMonthlyBudgets =
    saveMonthlyBudgets;

window.getBudgetCurrentMonth =
    getBudgetCurrentMonth;

window.getBudgetMonth =
    getBudgetMonth;

window.getBudgetForMonth =
    getBudgetForMonth;

window.getActualExpense =
    getActualExpense;

window.getActualExpenseForMonth =
    getActualExpenseForMonth;

window.getBudgetTracking =
    getBudgetTracking;

window.renderMonthlyBudget =
    renderMonthlyBudget;

window.renderBudgetTracking =
    renderBudgetTracking;

window.renderBudgetCategoryInputs =
    renderBudgetCategoryInputs;

window.saveBudgetData =
    saveBudgetData;

window.formatBudgetMoney =
    formatBudgetMoney;

window.openCategoryTransactions =
    openCategoryTransactions;

window.closeCategoryTransactions =
    closeCategoryTransactions;

window.closeCategoryTransactionModal =
    closeCategoryTransactionModal;

window.editBudgetTransaction =
    editBudgetTransaction;

window.refreshMonthlyBudget =
    refreshMonthlyBudget;
