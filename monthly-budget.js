/* =========================================================
   monthly-budget.js
   रोजचा जमा खर्च अहवाल 

   MONTHLY BUDGET MANAGEMENT

   CONNECTED WITH:
   ---------------------------------------------------------
   - app.js
   - expense.js
   - index.html
   - monthly-budget.html

   FEATURES:
   ---------------------------------------------------------
   ✅ Monthly Planned Money
   ✅ Category-wise Budget
   ✅ Actual Expense Automatic
   ✅ Remaining Budget
   ✅ Budget Used %
   ✅ Category-wise Progress
   ✅ Current Month Transactions
   ✅ Category Click -> Transactions
   ✅ Expense + Budget Same Categories
   ========================================================= */


/* =========================================================
   STORAGE KEY
   ========================================================= */

const MONTHLY_BUDGET_STORAGE_KEY =
    "monthly_budgets";


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


        return (
            data &&
            typeof data === "object"
        )
            ? data
            : {};

    } catch (error) {

        console.error(
            "Monthly budget read error:",
            error
        );

        return {};
    }
}


/* =========================================================
   SAVE BUDGET DATA
   ========================================================= */

function saveMonthlyBudgets(
    budgets
) {

    localStorage.setItem(
        MONTHLY_BUDGET_STORAGE_KEY,
        JSON.stringify(
            budgets
        )
    );
}


/* =========================================================
   CURRENT MONTH
   ========================================================= */

function getBudgetCurrentMonth() {

    const today =
        new Date();


    return (
        `${today.getFullYear()}-${String(
            today.getMonth() + 1
        ).padStart(
            2,
            "0"
        )}`
    );
}


/* =========================================================
   GET SELECTED MONTH
   ========================================================= */

function getBudgetMonth() {

    const element =
        document.getElementById(
            "budgetMonth"
        );


    if (
        element &&
        element.value
    ) {

        return element.value;
    }


    return getBudgetCurrentMonth();
}


/* =========================================================
   GET BUDGET FOR MONTH
   ========================================================= */

function getBudgetForMonth(
    month
) {

    const targetMonth =
        month ||
        getBudgetCurrentMonth();


    const budgets =
        getMonthlyBudgets();


    return (
        budgets[targetMonth] || {
            total: 0,
            categories: {}
        }
    );
}


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

    loadBudgetInputs();


    const form =
        document.getElementById(
            "monthlyBudgetForm"
        );


    if (!form) {

        return;
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


    /*
       EXPENSE_CATEGORIES comes from expense.js
    */

    if (
        !Array.isArray(
            window.EXPENSE_CATEGORIES
        )
    ) {

        console.warn(
            "EXPENSE_CATEGORIES not found."
        );

        return;
    }


    container.innerHTML =
        "";


    window.EXPENSE_CATEGORIES.forEach(
        category => {

            const wrapper =
                document.createElement(
                    "div"
                );


            wrapper.className =
                "budget-category-input-card";


            wrapper.innerHTML = `

                <div
                    class="budget-category-input-info"
                >

                    <div
                        class="budget-category-input-icon"
                    >

                        ${category.icon}

                    </div>


                    <div>

                        <div
                            class="budget-category-input-name"
                        >

                            ${escapeBudgetHTML(
                                category.name
                            )}

                        </div>


                        <div
                            class="budget-category-frequency"
                        >

                            ${getFrequencyText(
                                category.frequency
                            )}

                        </div>

                    </div>

                </div>


                <div
                    class="budget-category-input-box"
                >

                    <span>
                        ₹
                    </span>


                    <input
                        type="number"
                        min="0"
                        step="1"
                        id="budget_${category.id}"
                        data-category-id="${category.id}"
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
            budget.total || "";
    }


    if (
        !Array.isArray(
            window.EXPENSE_CATEGORIES
        )
    ) {

        return;
    }


    window.EXPENSE_CATEGORIES.forEach(
        category => {

            const input =
                document.getElementById(
                    `budget_${category.id}`
                );


            if (!input) {

                return;
            }


            input.value =
                (
                    budget.categories &&
                    budget.categories[
                        category.id
                    ]
                )
                    ? budget.categories[
                        category.id
                    ]
                    : "";

        }
    );


    renderMonthlyBudget();
}


/* =========================================================
   SAVE BUDGET
   ========================================================= */

function saveBudgetData() {

    const month =
        getBudgetMonth();


    const totalInput =
        document.getElementById(
            "plannedTotalBudget"
        );


    const total =
        Number(
            totalInput
                ? totalInput.value
                : 0
        );


    const categories =
        {};


    if (
        Array.isArray(
            window.EXPENSE_CATEGORIES
        )
    ) {

        window.EXPENSE_CATEGORIES.forEach(
            category => {

                const input =
                    document.getElementById(
                        `budget_${category.id}`
                    );


                const amount =
                    Number(
                        input
                            ? input.value
                            : 0
                    );


                categories[
                    category.id
                ] =
                    amount > 0
                        ? amount
                        : 0;

            }
        );
    }


    const budgets =
        getMonthlyBudgets();


    budgets[month] = {

        total:
            total > 0
                ? total
                : 0,

        categories:
            categories,

        updatedAt:
            new Date().toISOString()

    };


    saveMonthlyBudgets(
        budgets
    );


    renderMonthlyBudget();


    alert(
        "Monthly Budget यशस्वीपणे सेव्ह झाला."
    );
}


/* =========================================================
   FREQUENCY TEXT
   ========================================================= */

function getFrequencyText(
    frequency
) {

    switch (
        frequency
    ) {

        case "daily":

            return "दररोज";


        case "monthly":

            return "दर महिन्याला";


        case "yearly":

            return "वार्षिक";


        default:

            return "";

    }
}


/* =========================================================
   GET ACTUAL EXPENSE
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
   BUDGET TRACKING
   ========================================================= */

function getBudgetTracking(
    month
) {

    const targetMonth =
        month ||
        getBudgetCurrentMonth();


    const budget =
        getBudgetForMonth(
            targetMonth
        );


    if (
        !Array.isArray(
            window.EXPENSE_CATEGORIES
        )
    ) {

        return [];
    }


    return window.EXPENSE_CATEGORIES.map(
        category => {

            const planned =
                Number(
                    budget.categories &&
                    budget.categories[
                        category.id
                    ] || 0
                );


            const actual =
                Number(
                    getActualExpense(
                        category.id,
                        targetMonth
                    ) || 0
                );


            const remaining =
                planned -
                actual;


            let usedPercent =
                0;


            if (planned > 0) {

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
                    usedPercent

            };

        }
    );
}


/* =========================================================
   RENDER MONTHLY BUDGET
   ========================================================= */

function renderMonthlyBudget() {

    const month =
        getBudgetMonth();


    const budget =
        getBudgetForMonth(
            month
        );


    const tracking =
        getBudgetTracking(
            month
        );


    const container =
        document.getElementById(
            "budgetTracking"
        );


    /*
       TOTAL PLANNED
    */

    const plannedTotal =
        Number(
            budget.total || 0
        );


    /*
       CATEGORY ACTUAL TOTAL
    */

    const actualTotal =
        tracking.reduce(
            (
                sum,
                item
            ) => {

                return (
                    sum +
                    Number(
                        item.actual || 0
                    )
                );

            },
            0
        );


    /*
       Remaining based on total planned budget
    */

    const remainingTotal =
        plannedTotal -
        actualTotal;


    updateBudgetTotals(
        plannedTotal,
        actualTotal,
        remainingTotal
    );


    if (!container) {

        return;
    }


    container.innerHTML =
        "";


    tracking.forEach(
        item => {

            const safePercent =
                Math.min(
                    Math.max(
                        item.usedPercent,
                        0
                    ),
                    100
                );


            let statusClass =
                "budget-normal";


            if (
                item.planned > 0 &&
                item.actual >
                item.planned
            ) {

                statusClass =
                    "budget-over";

            } else if (
                item.planned > 0 &&
                item.usedPercent >= 80
            ) {

                statusClass =
                    "budget-warning";

            }


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
                        class="budget-tracking-header"
                    >


                        <div
                            class="budget-tracking-title"
                        >

                            <span
                                class="budget-tracking-icon"
                            >

                                ${item.icon}

                            </span>


                            <div>

                                <strong>

                                    ${escapeBudgetHTML(
                                        item.name
                                    )}

                                </strong>


                                <small>

                                    ${getFrequencyText(
                                        item.frequency
                                    )}

                                </small>

                            </div>

                        </div>


                        <div
                            class="budget-tracking-percent"
                        >

                            ${
                                item.planned > 0
                                    ? Math.round(
                                        item.usedPercent
                                    ) + "%"
                                    : "No Budget"
                            }

                        </div>


                    </div>



                    <div
                        class="budget-values"
                    >


                        <div>

                            <span>
                                Budget
                            </span>

                            <strong>
                                ${formatBudgetMoney(
                                    item.planned
                                )}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Actual
                            </span>

                            <strong>
                                ${formatBudgetMoney(
                                    item.actual
                                )}
                            </strong>

                        </div>


                        <div>

                            <span>
                                ${
                                    item.remaining >= 0
                                        ? "Remaining"
                                        : "Over Budget"
                                }
                            </span>

                            <strong>

                                ${formatBudgetMoney(
                                    Math.abs(
                                        item.remaining
                                    )
                                )}

                            </strong>

                        </div>


                    </div>



                    <div
                        class="budget-progress-wrapper"
                    >

                        <div
                            class="budget-progress-bar"
                        >

                            <div
                                class="
                                    budget-progress-fill
                                    ${statusClass}
                                "
                                style="
                                    width:${safePercent}%;
                                "
                            ></div>

                        </div>

                    </div>


                    <div
                        class="budget-click-hint"
                    >

                        <i
                            class="fa-solid fa-hand-pointer"
                        ></i>

                        Category वर click करून
                        current month transactions पहा

                    </div>


                </div>

            `;

        }
    );


    /*
       No categories fallback
    */

    if (
        tracking.length === 0
    ) {

        container.innerHTML = `

            <div class="no-budget-data">

                <i class="fa-solid fa-wallet"></i>

                <p>
                    Budget categories उपलब्ध नाहीत.
                </p>

            </div>

        `;

    }

}


/* =========================================================
   UPDATE TOTALS
   ========================================================= */

function updateBudgetTotals(
    planned,
    actual,
    remaining
) {

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


        if (
            remaining < 0
        ) {

            remainingElement.classList.add(
                "budget-negative"
            );

        } else {

            remainingElement.classList.remove(
                "budget-negative"
            );

        }

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
        monthInput.dataset.budgetMonthInitialized ===
        "true"
    ) {

        return;
    }


    monthInput.dataset.budgetMonthInitialized =
        "true";


    monthInput.addEventListener(
        "change",
        function() {

            loadBudgetInputs();

        }
    );
}


/* =========================================================
   REFRESH MONTHLY BUDGET
   ========================================================= */

function refreshMonthlyBudget() {

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


    renderMonthlyBudget();
}


/* =========================================================
   MONEY FORMAT
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
   INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        initializeBudgetForm();

        initializeBudgetMonthChange();

        refreshMonthlyBudget();

    }
);


/* =========================================================
   GLOBAL EXPORTS
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


window.refreshMonthlyBudget =
    refreshMonthlyBudget;


window.saveBudgetData =
    saveBudgetData;


window.formatBudgetMoney =
    formatBudgetMoney;
