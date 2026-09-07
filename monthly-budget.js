/* =========================================================
   monthly-budget.js
   रोजचा जमा खर्च अहवाल

   MONTHLY BUDGET MANAGEMENT

   FEATURES:
   ---------------------------------------------------------
   ✅ Same 15 Categories As Expense
   ✅ Monthly Budget
   ✅ Category Budget
   ✅ Actual Expense Automatic
   ✅ Remaining Budget
   ✅ Used %
   ✅ Progress
   ✅ Over Budget
   ✅ Category Click
   ✅ Current Month Transactions
   ========================================================= */


const MONTHLY_BUDGET_KEY =
    "monthly_budgets";


/* =========================================================
   STORAGE
   ========================================================= */

function getMonthlyBudgets() {

    try {

        const raw =
            localStorage.getItem(
                MONTHLY_BUDGET_KEY
            );


        if (!raw) {
            return {};
        }


        const data =
            JSON.parse(raw);


        return (
            data &&
            typeof data === "object"
        )
            ? data
            : {};

    } catch (error) {

        console.error(
            "Budget storage read error:",
            error
        );

        return {};
    }
}


function saveMonthlyBudgets(
    data
) {

    localStorage.setItem(
        MONTHLY_BUDGET_KEY,
        JSON.stringify(data)
    );
}


/* =========================================================
   MONTH
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


    return getCurrentMonth();
}


/* =========================================================
   CURRENT MONTH
   ========================================================= */

function getCurrentMonth() {

    const today =
        new Date();


    return (
        `${today.getFullYear()}-${String(
            today.getMonth() + 1
        ).padStart(2, "0")}`
    );
}


/* =========================================================
   GET MONTH BUDGET
   ========================================================= */

function getBudgetForMonth(
    month
) {

    const allBudgets =
        getMonthlyBudgets();


    if (
        !allBudgets[month]
    ) {

        allBudgets[month] = {

            plannedTotal: 0,

            categories: {}

        };
    }


    if (
        !allBudgets[month].categories
    ) {

        allBudgets[month].categories =
            {};
    }


    return allBudgets[month];
}


/* =========================================================
   FORM INITIALIZATION
   ========================================================= */

function initializeBudgetForm() {

    const form =
        document.getElementById(
            "monthlyBudgetForm"
        );


    if (!form) {
        return;
    }


    const monthInput =
        document.getElementById(
            "budgetMonth"
        );


    if (
        monthInput &&
        !monthInput.value
    ) {

        monthInput.value =
            getCurrentMonth();
    }


    if (
        form.dataset.budgetInitialized ===
        "true"
    ) {

        return;
    }


    form.dataset.budgetInitialized =
        "true";


    form.addEventListener(
        "submit",
        function(event) {

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


    const plannedInput =
        document.getElementById(
            "plannedTotalBudget"
        );


    const plannedTotal =
        Number(
            plannedInput
                ? plannedInput.value
                : 0
        );


    const allBudgets =
        getMonthlyBudgets();


    const current =
        allBudgets[month] || {

            plannedTotal: 0,

            categories: {}

        };


    current.plannedTotal =
        plannedTotal;


    if (
        !current.categories
    ) {

        current.categories =
            {};
    }


    /*
       Save all 15 categories
    */

    EXPENSE_CATEGORIES.forEach(
        category => {

            const input =
                document.getElementById(
                    `budget_${category.id}`
                );


            if (!input) {
                return;
            }


            current.categories[
                category.id
            ] =
                Number(
                    input.value || 0
                );
        }
    );


    allBudgets[month] =
        current;


    saveMonthlyBudgets(
        allBudgets
    );


    alert(
        "Monthly Budget successfully saved."
    );


    renderMonthlyBudget();


    if (
        typeof window.updateDashboard ===
        "function"
    ) {

        window.updateDashboard();
    }
}


/* =========================================================
   CREATE CATEGORY BUDGET INPUTS
   ========================================================= */

function renderBudgetCategoryInputs() {

    const container =
        document.getElementById(
            "budgetCategoryInputs"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        "";


    EXPENSE_CATEGORIES.forEach(
        category => {

            container.innerHTML += `

                <div
                    class="budget-category-input"
                    onclick="
                        openCategoryTransactions(
                            '${category.id}'
                        )
                    "
                    role="button"
                    tabindex="0"
                >

                    <div
                        class="budget-category-label">

                        <span>

                            ${category.icon}

                            ${escapeBudgetHTML(
                                category.name
                            )}

                        </span>


                        <small>

                            ${getFrequencyText(
                                category.frequency
                            )}

                        </small>

                    </div>


                    <div
                        class="budget-input-wrapper"
                        onclick="
                            event.stopPropagation()
                        "
                    >

                        <span>
                            ₹
                        </span>

                        <input
                            type="number"
                            min="0"
                            step="1"
                            id="budget_${category.id}"
                            placeholder="0"
                        >

                    </div>

                </div>

            `;
        }
    );


    loadBudgetInputs();
}


/* =========================================================
   LOAD BUDGET INPUTS
   ========================================================= */

function loadBudgetInputs() {

    const month =
        getBudgetMonth();


    const budget =
        getBudgetForMonth(
            month
        );


    const totalInput =
        document.getElementById(
            "plannedTotalBudget"
        );


    if (totalInput) {

        totalInput.value =
            budget.plannedTotal ||
            "";
    }


    EXPENSE_CATEGORIES.forEach(
        category => {

            const input =
                document.getElementById(
                    `budget_${category.id}`
                );


            if (!input) {
                return;
            }


            input.value =
                budget.categories[
                    category.id
                ] || "";
        }
    );
}


/* =========================================================
   FREQUENCY
   ========================================================= */

function getFrequencyText(
    frequency
) {

    switch (
        frequency
    ) {

        case "daily":
            return "Daily";

        case "monthly":
            return "Monthly";

        case "yearly":
            return "Yearly";

        default:
            return "";
    }
}


/* =========================================================
   ACTUAL EXPENSE
   ========================================================= */

function getActualExpense(
    categoryId,
    month
) {

    if (
        typeof window.getCategoryExpenseTotal ===
        "function"
    ) {

        return window.getCategoryExpenseTotal(
            categoryId,
            month
        );
    }


    return 0;
}


/* =========================================================
   CATEGORY BUDGET TRACKING
   ========================================================= */

function getBudgetTracking(
    month
) {

    const budget =
        getBudgetForMonth(
            month
        );


    return EXPENSE_CATEGORIES.map(
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
                    month
                );


            const remaining =
                planned -
                actual;


            let usedPercent =
                0;


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
                    Math.round(
                        usedPercent *
                        100
                    ) / 100,

                overBudget:
                    (
                        planned > 0 &&
                        actual > planned
                    )

            };
        }
    );
}


/* =========================================================
   RENDER BUDGET TRACKING
   ========================================================= */

function renderMonthlyBudget() {

    const container =
        document.getElementById(
            "budgetTracking"
        );


    if (!container) {
        return;
    }


    const month =
        getBudgetMonth();


    const tracking =
        getBudgetTracking(
            month
        );


    container.innerHTML =
        "";


    tracking.forEach(
        item => {

            const progress =
                item.planned > 0
                    ? Math.min(
                        item.usedPercent,
                        100
                    )
                    : 0;


            let statusClass =
                "budget-normal";


            if (
                item.overBudget
            ) {

                statusClass =
                    "budget-over";

            } else if (
                item.usedPercent >= 80
            ) {

                statusClass =
                    "budget-warning";
            }


            const remainingText =
                item.planned === 0

                    ? "Budget set केलेले नाही"

                    : item.remaining >= 0

                        ? `${formatBudgetMoney(
                            item.remaining
                        )} बाकी`

                        : `${formatBudgetMoney(
                            Math.abs(
                                item.remaining
                            )
                        )} जास्त`;


            container.innerHTML += `

                <div
                    class="
                        budget-tracking-card
                        ${statusClass}
                    "
                    onclick="
                        openCategoryTransactions(
                            '${item.id}'
                        )
                    "
                    role="button"
                    tabindex="0"
                >

                    <div
                        class="budget-card-header">

                        <div
                            class="budget-title">

                            <span
                                class="budget-icon">

                                ${item.icon}

                            </span>


                            <span>

                                ${escapeBudgetHTML(
                                    item.name
                                )}

                            </span>

                        </div>


                        <div
                            class="budget-percent">

                            ${Math.round(
                                item.usedPercent
                            )}%

                        </div>

                    </div>


                    <div
                        class="budget-values">

                        <div>

                            <small>
                                Budget
                            </small>

                            <strong>

                                ${formatBudgetMoney(
                                    item.planned
                                )}

                            </strong>

                        </div>


                        <div>

                            <small>
                                Actual
                            </small>

                            <strong>

                                ${formatBudgetMoney(
                                    item.actual
                                )}

                            </strong>

                        </div>


                        <div>

                            <small>
                                Status
                            </small>

                            <strong>

                                ${remainingText}

                            </strong>

                        </div>

                    </div>


                    <div
                        class="budget-progress">

                        <div
                            class="budget-progress-bar"
                            style="
                                width:${progress}%;
                            "
                        ></div>

                    </div>


                    <div
                        class="budget-click-hint">

                        👆 Category वर click करून
                        transactions पहा

                    </div>

                </div>

            `;
        }
    );


    updateBudgetTotals(
        month,
        tracking
    );
}


/* =========================================================
   TOTALS
   ========================================================= */

function updateBudgetTotals(
    month,
    tracking
) {

    const budget =
        getBudgetForMonth(
            month
        );


    const planned =
        Number(
            budget.plannedTotal ||
            0
        );


    const actual =
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


    const remaining =
        planned -
        actual;


    const plannedElement =
        document.getElementById(
            "budgetPlannedTotal"
        );


    const actualElement =
        document.getElementById(
            "budgetActualTotal"
        );


    const remainingElement =
        document.getElementById(
            "budgetRemainingTotal"
        );


    if (plannedElement) {

        plannedElement.textContent =
            formatBudgetMoney(
                planned
            );
    }


    if (actualElement) {

        actualElement.textContent =
            formatBudgetMoney(
                actual
            );
    }


    if (remainingElement) {

        remainingElement.textContent =
            formatBudgetMoney(
                remaining
            );


        remainingElement.classList.toggle(
            "negative-budget",
            remaining < 0
        );
    }
}


/* =========================================================
   MONTH CHANGE
   ========================================================= */

function initializeBudgetMonthChange() {

    const monthInput =
        document.getElementById(
            "budgetMonth"
        );


    if (!monthInput) {
        return;
    }


    if (
        monthInput.dataset
            .budgetChangeInitialized ===
        "true"
    ) {

        return;
    }


    monthInput.dataset
        .budgetChangeInitialized =
        "true";


    monthInput.addEventListener(
        "change",
        function() {

            renderBudgetCategoryInputs();

            renderMonthlyBudget();

        }
    );
}


/* =========================================================
   REFRESH
   ========================================================= */

function refreshMonthlyBudget() {

    renderBudgetCategoryInputs();

    renderMonthlyBudget();
}


/* =========================================================
   MONEY
   ========================================================= */

function formatBudgetMoney(
    amount
) {

    return (
        "₹" +
        Number(
            amount || 0
        ).toLocaleString(
            "en-IN"
        )
    );
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
   INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        initializeBudgetForm();

        initializeBudgetMonthChange();

        renderBudgetCategoryInputs();

        renderMonthlyBudget();

    }
);


/* =========================================================
   GLOBAL
   ========================================================= */

window.getMonthlyBudgets =
    getMonthlyBudgets;

window.getBudgetForMonth =
    getBudgetForMonth;

window.getBudgetTracking =
    getBudgetTracking;

window.refreshMonthlyBudget =
    refreshMonthlyBudget;

window.renderMonthlyBudget =
    renderMonthlyBudget;

window.saveBudgetData =
    saveBudgetData;
