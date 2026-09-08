/* =========================================================
   monthly-budget.js

   रोजचा जमा खर्च अहवाल
   MONTHLY BUDGET MANAGEMENT

   CONNECTED WITH:
   - transactions.js
   - expense.js
   - accounts.js
   - reports.js

   FEATURES:
   ---------------------------------------------------------
   ✅ Monthly Planned Money
   ✅ Category-wise Budget
   ✅ Actual Expense automatic
   ✅ Remaining Budget
   ✅ Budget Used %
   ✅ Category-wise progress
   ✅ Budget alert %
   ✅ Central transaction integration
   ✅ Budget does NOT affect account balance
   ========================================================= */


/* =========================================================
   STORAGE
========================================================= */

const MONTHLY_BUDGET_STORAGE_KEY =
    "monthly_budgets";


/* =========================================================
   DEFAULT ALERT
========================================================= */

const DEFAULT_BUDGET_ALERT_PERCENT =
    80;


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
   MAKE AVAILABLE GLOBALLY
========================================================= */

window.EXPENSE_CATEGORIES =
    window.EXPENSE_CATEGORIES ||
    BUDGET_EXPENSE_CATEGORIES;


/* =========================================================
   GET BUDGET DATA
========================================================= */

function getMonthlyBudgets() {

    try {

        const raw =
            localStorage.getItem(
                MONTHLY_BUDGET_STORAGE_KEY
            );

        if (!raw) {
            return {};
        }

        const data =
            JSON.parse(raw);

        if (
            data &&
            typeof data === "object" &&
            !Array.isArray(data)
        ) {

            return data;

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
   SAVE BUDGET DATA
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
     * Budget event
     *
     * Important:
     * Budget transaction नाही.
     * त्यामुळे account balance बदलत नाही.
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
   CURRENT MONTH
========================================================= */

function getBudgetCurrentMonth() {

    return new Date()
        .toISOString()
        .slice(0, 7);

}


/* =========================================================
   GET MONTH
========================================================= */

function getBudgetMonth() {

    const input =
        document.getElementById(
            "budgetMonth"
        ) ||
        document.getElementById(
            "budgetMonthInput"
        ) ||
        document.getElementById(
            "month"
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
   GET SINGLE MONTH BUDGET
========================================================= */

function getBudgetForMonth(
    month
) {

    const budgets =
        getMonthlyBudgets();


    const data =
        budgets[month];


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
                typeof data.categories ===
                    "object"
                    ? data.categories
                    : {},

            alertPercent:
                Number(
                    data.alertPercent ??
                    DEFAULT_BUDGET_ALERT_PERCENT
                ) || DEFAULT_BUDGET_ALERT_PERCENT,

            updatedAt:
                data.updatedAt ||
                ""

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
   ACTUAL EXPENSE
========================================================= */

function getActualExpense(
    categoryId,
    month
) {

    /*
     * Central transaction system
     */

    if (
        typeof window.getCategoryExpenseTotal ===
        "function"
    ) {

        return Number(
            window.getCategoryExpenseTotal(
                categoryId,
                month
            )
        ) || 0;

    }


    /*
     * Fallback
     */

    if (
        typeof window.getTransactions !==
        "function"
    ) {

        return 0;

    }


    const transactions =
        window.getTransactions();


    return transactions
        .filter(
            transaction => {

                if (
                    transaction.type !==
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
                    month &&
                    !String(
                        transaction.date
                    )
                        .startsWith(
                            month
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

    if (
        typeof window.getTransactions !==
        "function"
    ) {

        return 0;

    }


    const transactions =
        window.getTransactions();


    return transactions
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
                );


            const actual =
                getActualExpense(
                    category.id,
                    selectedMonth
                );


            const remaining =
                planned -
                actual;


            let usedPercent = 0;


            if (planned > 0) {

                usedPercent =
                    (
                        actual /
                        planned
                    ) *
                    100;

            }


            /*
             * If no budget:
             * actual expense exists but
             * used percentage remains 0
             */

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

        renderMonthlyBudget();

        setupBudgetEvents();

    }
);


/* =========================================================
   INITIALIZE BUDGET FORM
========================================================= */

function initializeBudgetForm() {

    const monthInput =
        document.getElementById(
            "budgetMonth"
        ) ||
        document.getElementById(
            "budgetMonthInput"
        ) ||
        document.getElementById(
            "month"
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
            "budgetCategories"
        ) ||
        document.getElementById(
            "categoryBudgetList"
        ) ||
        document.getElementById(
            "budgetCategoryList"
        );


    if (!container) {

        return;

    }


    /*
     * Don't duplicate
     */

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
                        ${category.icon}
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

    switch (frequency) {

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
   LOAD SAVED BUDGET
========================================================= */

function loadSavedBudgetIntoForm() {

    const month =
        getBudgetMonth();


    const budget =
        getBudgetForMonth(
            month
        );


    const totalInput =
        document.getElementById(
            "budgetTotal"
        ) ||
        document.getElementById(
            "plannedMoney"
        ) ||
        document.getElementById(
            "monthlyBudget"
        );


    if (totalInput) {

        totalInput.value =
            budget.total ||
            "";

    }


    const alertInput =
        document.getElementById(
            "budgetAlertPercent"
        ) ||
        document.getElementById(
            "alertPercent"
        );


    if (alertInput) {

        alertInput.value =
            budget.alertPercent ||
            DEFAULT_BUDGET_ALERT_PERCENT;

    }


    const inputs =
        document.querySelectorAll(
            ".budget-category-amount"
        );


    inputs.forEach(
        input => {

            const id =
                input.dataset.categoryId;


            input.value =
                budget.categories[
                    id
                ] || "";

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
        ) ||
        document.getElementById(
            "budgetForm"
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
   SAVE BUDGET
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


    const totalInput =
        document.getElementById(
            "budgetTotal"
        ) ||
        document.getElementById(
            "plannedMoney"
        ) ||
        document.getElementById(
            "monthlyBudget"
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


            const value =
                Number(
                    input.value
                ) || 0;


            categories[id] =
                value;

        }
    );


    /*
     * If total is empty/zero,
     * calculate from category budgets.
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
                    ) =>
                        sum +
                        (
                            Number(
                                value
                            ) || 0
                        ),
                    0
                );

    }


    const alertInput =
        document.getElementById(
            "budgetAlertPercent"
        ) ||
        document.getElementById(
            "alertPercent"
        );


    const alertPercent =
        alertInput
            ? Number(
                alertInput.value
            ) ||
            DEFAULT_BUDGET_ALERT_PERCENT
            : DEFAULT_BUDGET_ALERT_PERCENT;


    const budgets =
        getMonthlyBudgets();


    budgets[month] = {

        total:
            total,

        plannedMoney:
            total,

        categories:
            categories,

        alertPercent:
            alertPercent,

        updatedAt:
            new Date().toISOString()

    };


    /*
     * IMPORTANT
     *
     * येथे फक्त budget storage update होत आहे.
     *
     * कोणताही income/expense transaction
     * तयार केला जात नाही.
     *
     * त्यामुळे account balance बदलत नाही.
     */

    saveMonthlyBudgets(
        budgets
    );


    renderMonthlyBudget();


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
     * Total actual
     */

    const actualTotal =
        tracking.reduce(
            (
                total,
                item
            ) =>
                total +
                item.actual,
            0
        );


    const plannedTotal =
        Number(
            budget.total
        ) || 0;


    const remaining =
        plannedTotal -
        actualTotal;


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
     * Summary IDs
     */

    setBudgetText(
        [
            "plannedBudget",
            "totalPlannedBudget",
            "budgetPlanned"
        ],
        formatBudgetMoney(
            plannedTotal
        )
    );


    setBudgetText(
        [
            "actualBudget",
            "totalActualBudget",
            "budgetActual"
        ],
        formatBudgetMoney(
            actualTotal
        )
    );


    setBudgetText(
        [
            "remainingBudget",
            "totalRemainingBudget",
            "budgetRemaining"
        ],
        formatBudgetMoney(
            remaining
        )
    );


    setBudgetText(
        [
            "budgetUsedPercent",
            "totalBudgetUsedPercent",
            "budgetPercentage"
        ],
        Math.round(
            usedPercent
        ) + "%"
    );


    /*
     * Category list
     */

    renderBudgetTracking(
        tracking,
        budget.alertPercent
    );


    /*
     * Update form if same page
     */

    loadSavedBudgetIntoForm();

}


/* =========================================================
   RENDER TRACKING
========================================================= */

function renderBudgetTracking(
    tracking,
    alertPercent
) {

    const container =
        document.getElementById(
            "budgetTracking"
        ) ||
        document.getElementById(
            "categoryBudgetTracking"
        ) ||
        document.getElementById(
            "budgetProgressList"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    tracking.forEach(
        item => {

            const percentage =
                Math.min(
                    Math.max(
                        item.usedPercent,
                        0
                    ),
                    100
                );


            const exceeded =
                item.actual >
                item.planned &&
                item.planned > 0;


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
                            ${item.icon}
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
                        class="budget-progress-bar
                        ${statusClass}"
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
                        )}')">

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


    const list =
        document.getElementById(
            "categoryTransactionList"
        );


    if (
        !modal ||
        !list
    ) {

        /*
         * Fallback:
         * transactions page
         */

        window.location.href =
            "transactions.html";

        return;

    }


    const month =
        getBudgetMonth();


    const transactions =
        typeof window.getTransactions ===
        "function"
            ? window.getTransactions()
            : [];


    const filtered =
        transactions
            .filter(
                transaction => {

                    const category =
                        transaction.categoryId ||
                        transaction.category ||
                        "";


                    return (
                        transaction.type ===
                        "expense" &&

                        String(
                            category
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
            .sort(
                (a, b) =>
                    String(
                        b.date
                    )
                        .localeCompare(
                            String(
                                a.date
                            )
                        )
            );


    list.innerHTML = "";


    if (!filtered.length) {

        list.innerHTML = `

            <div class="empty-category-transactions">

                <i class="fa-solid fa-receipt"></i>

                <p>
                    या महिन्यात या category चा
                    कोणताही खर्च नाही.
                </p>

            </div>

        `;

    } else {

        filtered.forEach(
            transaction => {

                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "category-transaction-row";


                row.innerHTML = `

                    <div>

                        <strong>
                            ${escapeBudgetHTML(
                                transaction.description ||
                                transaction.note ||
                                "खर्च"
                            )}
                        </strong>

                        <small>
                            ${formatBudgetDate(
                                transaction.date
                            )}

                            ${
                                transaction.paymentMode
                                    ? " • " +
                                      escapeBudgetHTML(
                                          transaction.paymentMode
                                      )
                                    : ""
                            }
                        </small>

                    </div>


                    <strong class="expense-amount">
                        -${formatBudgetMoney(
                            transaction.amount
                        )}
                    </strong>

                `;


                list.appendChild(
                    row
                );

            }
        );

    }


    /*
     * Modal title
     */

    const title =
        document.getElementById(
            "categoryTransactionTitle"
        );


    if (title) {

        const category =
            (
                window.EXPENSE_CATEGORIES ||
                BUDGET_EXPENSE_CATEGORIES
            )
                .find(
                    item =>
                        String(item.id) ===
                        String(categoryId)
                );


        title.textContent =
            category
                ? category.name
                : "खर्च व्यवहार";

    }


    modal.style.display =
        "flex";

}


/* =========================================================
   CLOSE CATEGORY MODAL
========================================================= */

function closeCategoryTransactionModal() {

    const modal =
        document.getElementById(
            "categoryTransactionModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }

}


window.closeCategoryTransactionModal =
    closeCategoryTransactionModal;


/* =========================================================
   REFRESH
========================================================= */

function refreshMonthlyBudget() {

    renderMonthlyBudget();

}


window.refreshMonthlyBudget =
    refreshMonthlyBudget;


/* =========================================================
   BUDGET EVENTS
========================================================= */

function setupBudgetEvents() {

    const monthInputs =
        document.querySelectorAll(
            "#budgetMonth, #budgetMonthInput, #month"
        );


    monthInputs.forEach(
        input => {

            input.addEventListener(
                "change",
                function () {

                    renderBudgetCategoryInputs();

                    loadSavedBudgetIntoForm();

                    renderMonthlyBudget(
                        input.value
                    );

                }
            );

        }
    );


    /*
     * Central transaction changes
     */

    window.addEventListener(
        "rdkhTransactionsUpdated",
        function () {

            renderMonthlyBudget();

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
     * Storage
     */

    window.addEventListener(
        "storage",
        function (event) {

            if (
                event.key ===
                MONTHLY_BUDGET_STORAGE_KEY ||

                event.key ===
                "rdkh_transactions_v2"
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
    ids,
    value
) {

    ids.forEach(
        id => {

            const element =
                document.getElementById(
                    id
                );


            if (element) {

                element.textContent =
                    value;

            }

        }
    );

}


/* =========================================================
   DATE FORMAT
========================================================= */

function formatBudgetDate(
    date
) {

    if (!date) {
        return "--";
    }


    const parts =
        String(date).split("-");


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


    return date;

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

    /*
     * Existing toast
     */

    if (
        typeof window.showToast ===
        "function"
    ) {

        window.showToast(
            message
        );

        return;

    }


    /*
     * Existing alert
     */

    alert(message);

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

window.getBudgetTracking =
    getBudgetTracking;

window.renderMonthlyBudget =
    renderMonthlyBudget;

window.saveBudgetData =
    saveBudgetData;

window.formatBudgetMoney =
    formatBudgetMoney;

window.openCategoryTransactions =
    openCategoryTransactions;
