/* =========================================================
   monthly-budget.js

   रोजचा जमा खर्च अहवाल
   MONTHLY BUDGET MANAGEMENT

   CONNECTED WITH:
   - app.js
   - income.js
   - expense.js
   - accounts.js
   - transactions.js

   FEATURES:
   ---------------------------------------------------------
   ✅ Monthly Planned Money
   ✅ Category-wise Budget
   ✅ Actual Expense automatic
   ✅ Remaining Budget
   ✅ Budget Used %
   ✅ Category-wise progress
   ✅ Budget alert %
   ✅ Default categories
   ✅ Custom category
   ✅ Edit category budget
   ✅ Delete custom category
   ✅ Monthly data separately saved
   ✅ Previous month data preserved
   ========================================================= */


/* =========================================================
   STORAGE KEYS
========================================================= */

const MONTHLY_BUDGET_KEY =
    "rdkh_monthly_budgets";

const BUDGET_CATEGORY_KEY =
    "rdkh_budget_categories";



/* =========================================================
   DEFAULT CATEGORIES
========================================================= */

const DEFAULT_BUDGET_CATEGORIES = [

    {
        id: "daily-grocery",
        name: "दररोजचा किराणा खर्च",
        icon: "fa-solid fa-basket-shopping"
    },

    {
        id: "monthly-grocery",
        name: "महिन्याचा किराणा खर्च",
        icon: "fa-solid fa-cart-shopping"
    },

    {
        id: "travel",
        name: "प्रवास",
        icon: "fa-solid fa-car"
    },

    {
        id: "shopping",
        name: "खरेदी",
        icon: "fa-solid fa-bag-shopping"
    },

    {
        id: "light-bill",
        name: "लाईट बिल",
        icon: "fa-solid fa-lightbulb"
    },

    {
        id: "medicine",
        name: "औषधे",
        icon: "fa-solid fa-pills"
    },

    {
        id: "mobile",
        name: "मोबाईल",
        icon: "fa-solid fa-mobile-screen-button"
    },

    {
        id: "home-emi",
        name: "घरचा EMI",
        icon: "fa-solid fa-house"
    },

    {
        id: "home-maintenance",
        name: "घरचा मेंटेनन्स",
        icon: "fa-solid fa-screwdriver-wrench"
    },

    {
        id: "other-loan",
        name: "इतर लोन",
        icon: "fa-solid fa-money-check-dollar"
    },

    {
        id: "other",
        name: "Other",
        icon: "fa-solid fa-box"
    }

];



/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeMonthlyBudget();

    }
);



/* =========================================================
   MAIN INITIALIZATION
========================================================= */

function initializeMonthlyBudget() {

    initializeBudgetCategories();

    setCurrentMonth();

    setupBudgetEvents();

    loadBudgetForSelectedMonth();

}



/* =========================================================
   INITIALIZE CATEGORY STORAGE
========================================================= */

function initializeBudgetCategories() {

    const stored =
        localStorage.getItem(
            BUDGET_CATEGORY_KEY
        );


    if (!stored) {

        localStorage.setItem(

            BUDGET_CATEGORY_KEY,

            JSON.stringify(
                DEFAULT_BUDGET_CATEGORIES
            )

        );

        return;

    }


    /*
       Existing categories असल्यास
       नवीन default categories missing
       असतील तर त्या add करा.
    */

    let categories = [];


    try {

        categories =
            JSON.parse(stored);

    }

    catch {

        categories = [];

    }


    if (!Array.isArray(categories)) {

        categories = [];

    }


    DEFAULT_BUDGET_CATEGORIES.forEach(
        defaultCategory => {

            const exists =
                categories.some(
                    category =>
                        category.id ===
                        defaultCategory.id
                );


            if (!exists) {

                categories.push(
                    defaultCategory
                );

            }

        }
    );


    localStorage.setItem(

        BUDGET_CATEGORY_KEY,

        JSON.stringify(
            categories
        )

    );

}



/* =========================================================
   GET CATEGORIES
========================================================= */

function getBudgetCategories() {

    try {

        const stored =
            localStorage.getItem(
                BUDGET_CATEGORY_KEY
            );


        if (!stored) {

            return [
                ...DEFAULT_BUDGET_CATEGORIES
            ];

        }


        const categories =
            JSON.parse(
                stored
            );


        return Array.isArray(categories)
            ? categories
            : [
                ...DEFAULT_BUDGET_CATEGORIES
            ];

    }

    catch {

        return [
            ...DEFAULT_BUDGET_CATEGORIES
        ];

    }

}



/* =========================================================
   SAVE CATEGORIES
========================================================= */

function saveBudgetCategories(
    categories
) {

    localStorage.setItem(

        BUDGET_CATEGORY_KEY,

        JSON.stringify(
            categories
        )

    );

}



/* =========================================================
   SET CURRENT MONTH
========================================================= */

function setCurrentMonth() {

    const monthInput =
        document.getElementById(
            "budgetMonth"
        );


    if (!monthInput) {

        return;

    }


    /*
       जर आधी value असेल तर
       ती बदलू नका.
    */

    if (monthInput.value) {

        return;

    }


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


    monthInput.value =
        `${year}-${month}`;

}



/* =========================================================
   SETUP EVENTS
========================================================= */

function setupBudgetEvents() {

    const month =
        document.getElementById(
            "budgetMonth"
        );


    const plannedMoney =
        document.getElementById(
            "plannedMoney"
        );


    const alertPercent =
        document.getElementById(
            "budgetAlertPercent"
        );


    if (month) {

        month.addEventListener(
            "change",
            function () {

                loadBudgetForSelectedMonth();

            }
        );

    }


    if (plannedMoney) {

        plannedMoney.addEventListener(
            "input",
            function () {

                updateBudgetSummary();

            }
        );

    }


    if (alertPercent) {

        alertPercent.addEventListener(
            "change",
            function () {

                updateBudgetSummary();

            }
        );

    }

}



/* =========================================================
   GET SELECTED MONTH
========================================================= */

function getSelectedBudgetMonth() {

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


    const now =
        new Date();


    return (

        now.getFullYear() +
        "-" +
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        )

    );

}



/* =========================================================
   GET ALL MONTHLY BUDGETS
========================================================= */

function getMonthlyBudgets() {

    try {

        const stored =
            localStorage.getItem(
                MONTHLY_BUDGET_KEY
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
            typeof data === "object" &&
            !Array.isArray(data)
        )
            ? data
            : {};

    }

    catch {

        return {};

    }

}



/* =========================================================
   SAVE ALL MONTHLY BUDGETS
========================================================= */

function saveMonthlyBudgets(
    budgets
) {

    localStorage.setItem(

        MONTHLY_BUDGET_KEY,

        JSON.stringify(
            budgets
        )

    );

}



/* =========================================================
   GET MONTH BUDGET
========================================================= */

function getMonthBudget(
    month
) {

    const budgets =
        getMonthlyBudgets();


    return budgets[month] || null;

}



/* =========================================================
   CREATE NEW MONTH BUDGET
========================================================= */

function createEmptyMonthBudget(
    month
) {

    const categories =
        getBudgetCategories();


    const categoryBudgets = {};


    categories.forEach(
        category => {

            categoryBudgets[
                category.id
            ] = 0;

        }
    );


    return {

        month: month,

        plannedMoney: 0,

        alertPercent: 80,

        categories:
            categoryBudgets,

        createdAt:
            new Date().toISOString(),

        updatedAt:
            new Date().toISOString()

    };

}



/* =========================================================
   LOAD SELECTED MONTH
========================================================= */

function loadBudgetForSelectedMonth() {

    const month =
        getSelectedBudgetMonth();


    const monthBudget =
        getMonthBudget(
            month
        );


    const budget =
        monthBudget ||
        createEmptyMonthBudget(
            month
        );



    /* =====================================================
       PLANNED MONEY
    ===================================================== */

    const plannedMoney =
        document.getElementById(
            "plannedMoney"
        );


    if (plannedMoney) {

        plannedMoney.value =
            budget.plannedMoney || "";

    }



    /* =====================================================
       ALERT %
    ===================================================== */

    const alertPercent =
        document.getElementById(
            "budgetAlertPercent"
        );


    if (alertPercent) {

        alertPercent.value =
            budget.alertPercent || 80;

    }



    /* =====================================================
       RENDER CATEGORIES
    ===================================================== */

    renderBudgetCategories(
        budget
    );


    updateBudgetSummary();

}



/* =========================================================
   RENDER CATEGORY LIST
========================================================= */

function renderBudgetCategories(
    monthBudget
) {

    const container =
        document.getElementById(
            "budgetCategoriesList"
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        "";


    const categories =
        getBudgetCategories();


    categories.forEach(
        category => {

            const budgetAmount =
                Number(
                    monthBudget.categories?.[
                        category.id
                    ]
                ) || 0;


            const actualExpense =
                getCategoryActualExpense(

                    category.name,

                    getSelectedBudgetMonth()

                );


            const remaining =
                budgetAmount -
                actualExpense;


            let percentage =
                0;


            if (
                budgetAmount > 0
            ) {

                percentage =
                    (
                        actualExpense /
                        budgetAmount
                    ) * 100;

            }


            const displayPercentage =
                Math.round(
                    percentage * 100
                ) / 100;


            const progressWidth =
                Math.min(
                    Math.max(
                        percentage,
                        0
                    ),
                    100
                );


            const isOver =
                actualExpense >
                budgetAmount &&
                budgetAmount > 0;


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "budget-category-card";


            card.dataset.categoryId =
                category.id;


            card.innerHTML = `

                <div class="budget-category-top">


                    <div class="budget-category-icon">

                        <i class="${escapeBudgetHTML(
                            category.icon
                        )}"></i>

                    </div>


                    <div class="budget-category-info">

                        <h4>

                            ${escapeBudgetHTML(
                                category.name
                            )}

                        </h4>


                        <p>

                            Actual:
                            ${formatBudgetMoney(
                                actualExpense
                            )}

                        </p>

                    </div>


                    <div class="budget-category-amount">

                        <strong>

                            ${formatBudgetMoney(
                                budgetAmount
                            )}

                        </strong>


                        <span>
                            Budget
                        </span>

                    </div>

                </div>



                <div class="budget-progress">

                    <div
                        class="budget-progress-bar"
                        style="width:${progressWidth}%"
                    ></div>

                </div>



                <div class="budget-category-bottom">


                    <span
                        class="${
                            isOver
                                ? "over-budget"
                                : "safe-budget"
                        }"
                    >

                        ${
                            isOver
                                ? "Budget Over: " +
                                  formatBudgetMoney(
                                      Math.abs(
                                          remaining
                                      )
                                  )
                                : "Remaining: " +
                                  formatBudgetMoney(
                                      remaining
                                  )
                        }

                    </span>


                    <span>

                        ${displayPercentage}%

                    </span>


                    <span>

                        <button
                            type="button"
                            onclick="editCategoryBudget(
                                '${category.id}'
                            )"
                            style="
                                border:none;
                                background:none;
                                color:var(--primary);
                                cursor:pointer;
                            "
                            title="Edit Budget"
                        >

                            <i class="fa-solid fa-pen"></i>

                        </button>


                        ${
                            isCustomCategory(
                                category.id
                            )
                                ? `
                                    <button
                                        type="button"
                                        onclick="deleteBudgetCategory(
                                            '${category.id}'
                                        )"
                                        style="
                                            border:none;
                                            background:none;
                                            color:var(--expense);
                                            cursor:pointer;
                                        "
                                        title="Delete Category"
                                    >

                                        <i class="fa-solid fa-trash"></i>

                                    </button>
                                  `
                                : ""
                        }

                    </span>


                </div>

            `;


            container.appendChild(
                card
            );

        }
    );

}



/* =========================================================
   GET ACTUAL EXPENSE BY CATEGORY
========================================================= */

function getCategoryActualExpense(
    categoryName,
    month
) {

    const transactions =
        getAllTransactionsSafe();


    let total =
        0;


    transactions.forEach(
        transaction => {

            if (
                transaction.type !==
                "expense"
            ) {

                return;

            }


            const transactionDate =
                normalizeTransactionDate(
                    transaction.date
                );


            if (
                !transactionDate
                    .startsWith(
                        month
                    )
            ) {

                return;

            }


            const transactionCategory =
                String(
                    transaction.category ||
                    ""
                )
                    .trim()
                    .toLowerCase();


            const requiredCategory =
                String(
                    categoryName ||
                    ""
                )
                    .trim()
                    .toLowerCase();


            if (
                transactionCategory ===
                requiredCategory
            ) {

                total +=
                    Number(
                        transaction.amount
                    ) || 0;

            }

        }
    );


    return total;

}



/* =========================================================
   GET ALL TRANSACTIONS SAFELY
========================================================= */

function getAllTransactionsSafe() {

    /*
       प्रथम app.js मधील function वापरा.
    */

    if (
        typeof getTransactions ===
        "function"
    ) {

        const transactions =
            getTransactions();


        return Array.isArray(
            transactions
        )
            ? transactions
            : [];

    }



    /*
       Fallback storage keys.

       जर app.js मध्ये वेगळा key असेल
       तर हा fallback उपयोगी पडेल.
    */

    const possibleKeys = [

        "rdkh_transactions",

        "rdkh_transaction",

        "transactions",

        "income_expense_transactions"

    ];


    for (
        const key of possibleKeys
    ) {

        try {

            const stored =
                localStorage.getItem(
                    key
                );


            if (!stored) {

                continue;

            }


            const parsed =
                JSON.parse(
                    stored
                );


            if (
                Array.isArray(
                    parsed
                )
            ) {

                return parsed;

            }

        }

        catch {

            continue;

        }

    }


    return [];

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


    /*
       YYYY-MM-DD
    */

    if (
        /^\d{4}-\d{2}-\d{2}$/
            .test(
                String(date)
            )
    ) {

        return String(date);

    }


    /*
       Date object / ISO date
    */

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
   UPDATE OVERALL BUDGET SUMMARY
========================================================= */

function updateBudgetSummary() {

    const month =
        getSelectedBudgetMonth();


    const budgets =
        getMonthlyBudgets();


    const monthBudget =
        budgets[month] ||
        createEmptyMonthBudget(
            month
        );


    /*
       Planned Money
    */

    const plannedMoneyInput =
        document.getElementById(
            "plannedMoney"
        );


    const plannedMoney =
        Number(
            plannedMoneyInput?.value
        ) || 0;



    /*
       Total Category Budget
    */

    let totalBudget =
        0;


    const categories =
        getBudgetCategories();


    categories.forEach(
        category => {

            totalBudget +=

                Number(
                    monthBudget.categories?.[
                        category.id
                    ]
                ) || 0;

        }
    );



    /*
       Actual expense for selected month
    */

    const actualExpense =
        getMonthlyActualExpense(
            month
        );


    /*
       Remaining
    */

    const remaining =
        totalBudget -
        actualExpense;


    /*
       Used %
    */

    let usedPercent =
        0;


    if (
        totalBudget > 0
    ) {

        usedPercent =
            (
                actualExpense /
                totalBudget
            ) * 100;

    }


    usedPercent =
        Math.round(
            usedPercent * 100
        ) / 100;



    /*
       Update HTML
    */

    setText(
        "totalBudget",
        formatBudgetMoney(
            totalBudget
        )
    );


    setText(
        "totalActualExpense",
        formatBudgetMoney(
            actualExpense
        )
    );


    setText(
        "remainingBudget",
        formatBudgetMoney(
            remaining
        )
    );


    setText(
        "budgetUsedPercent",
        usedPercent + "%"
    );



    /*
       Remaining color
    */

    const remainingElement =
        document.getElementById(
            "remainingBudget"
        );


    if (remainingElement) {

        remainingElement.classList.remove(
            "remaining-text"
        );


        if (
            remaining < 0
        ) {

            remainingElement.style.color =
                "var(--expense)";

        }

        else {

            remainingElement.style.color =
                "var(--income)";

        }

    }



    /*
       Status message
    */

    updateBudgetStatus(
        totalBudget,
        actualExpense,
        usedPercent
    );



    /*
       Re-render category cards
       so actual values remain live.
    */

    const existingCategoryCards =
        document.querySelector(
            ".budget-category-card"
        );


    if (
        existingCategoryCards
    ) {

        renderBudgetCategories(
            monthBudget
        );

    }

}



/* =========================================================
   MONTHLY ACTUAL EXPENSE
========================================================= */

function getMonthlyActualExpense(
    month
) {

    const transactions =
        getAllTransactionsSafe();


    let total =
        0;


    transactions.forEach(
        transaction => {

            if (
                transaction.type !==
                "expense"
            ) {

                return;

            }


            const date =
                normalizeTransactionDate(
                    transaction.date
                );


            if (
                date.startsWith(
                    month
                )
            ) {

                total +=
                    Number(
                        transaction.amount
                    ) || 0;

            }

        }
    );


    return total;

}



/* =========================================================
   BUDGET STATUS
========================================================= */

function updateBudgetStatus(
    totalBudget,
    actualExpense,
    usedPercent
) {

    const element =
        document.getElementById(
            "budgetStatusMessage"
        );


    if (!element) {

        return;

    }


    const alertPercent =
        Number(
            document.getElementById(
                "budgetAlertPercent"
            )?.value
        ) || 80;


    element.style.display =
        "block";


    element.className =
        "budget-status-message";



    /*
       No budget
    */

    if (
        totalBudget <= 0
    ) {

        element.classList.add(
            "warning"
        );


        element.innerHTML = `

            <i class="fa-solid fa-circle-info"></i>

            या महिन्यासाठी अजून Budget सेट केलेले नाही.

        `;


        return;

    }



    /*
       Over budget
    */

    if (
        actualExpense >
        totalBudget
    ) {

        element.classList.add(
            "danger"
        );


        element.innerHTML = `

            <i class="fa-solid fa-triangle-exclamation"></i>

            Budget पेक्षा
            ${formatBudgetMoney(
                actualExpense -
                totalBudget
            )}
            जास्त खर्च झाला आहे.

        `;


        return;

    }



    /*
       Alert reached
    */

    if (
        usedPercent >=
        alertPercent
    ) {

        element.classList.add(
            "warning"
        );


        element.innerHTML = `

            <i class="fa-solid fa-bell"></i>

            Budget चा
            ${usedPercent}%
            वापर झाला आहे.

            Alert limit:
            ${alertPercent}%

        `;


        return;

    }



    /*
       Safe
    */

    element.classList.add(
        "success"
    );


    element.innerHTML = `

        <i class="fa-solid fa-circle-check"></i>

        Budget स्थिती सुरक्षित आहे.
        ${usedPercent}% वापर झाला आहे.

    `;

}



/* =========================================================
   SAVE MONTHLY BUDGET
========================================================= */

function saveMonthlyBudget() {

    const month =
        getSelectedBudgetMonth();


    const plannedMoney =
        Number(
            document.getElementById(
                "plannedMoney"
            )?.value
        ) || 0;


    const alertPercent =
        Number(
            document.getElementById(
                "budgetAlertPercent"
            )?.value
        ) || 80;



    if (
        plannedMoney < 0
    ) {

        alert(
            "Planned Money योग्य भरा."
        );

        return;

    }



    const budgets =
        getMonthlyBudgets();


    let budget =
        budgets[month];


    if (!budget) {

        budget =
            createEmptyMonthBudget(
                month
            );

    }



    budget.plannedMoney =
        plannedMoney;


    budget.alertPercent =
        alertPercent;


    /*
       Category budgets
       DOM मधून वाचणे.
    */

    const categoryCards =
        document.querySelectorAll(
            ".budget-category-card"
        );


    categoryCards.forEach(
        card => {

            const categoryId =
                card.dataset.categoryId;


            const amount =
                getCategoryBudgetInputValue(
                    categoryId
                );


            if (
                !budget.categories
            ) {

                budget.categories = {};

            }


            budget.categories[
                categoryId
            ] =
                amount;

        }
    );


    budget.updatedAt =
        new Date().toISOString();


    budgets[month] =
        budget;


    saveMonthlyBudgets(
        budgets
    );



    /*
       Update screen
    */

    loadBudgetForSelectedMonth();


    showBudgetSavedMessage();

}



/* =========================================================
   GET CATEGORY BUDGET VALUE
========================================================= */

function getCategoryBudgetInputValue(
    categoryId
) {

    /*
       जर card मध्ये input उपलब्ध असेल
       तर त्याची value घ्या.
    */

    const input =
        document.querySelector(

            `.budget-category-card[data-category-id="${cssEscape(
                categoryId
            )}"] .category-budget-input`

        );


    if (input) {

        return Number(
            input.value
        ) || 0;

    }



    /*
       Existing stored value
    */

    const month =
        getSelectedBudgetMonth();


    const budget =
        getMonthBudget(
            month
        );


    return Number(
        budget?.categories?.[
            categoryId
        ]
    ) || 0;

}



/* =========================================================
   EDIT CATEGORY BUDGET
========================================================= */

function editCategoryBudget(
    categoryId
) {

    const categories =
        getBudgetCategories();


    const category =
        categories.find(
            item =>
                item.id ===
                categoryId
        );


    if (!category) {

        return;

    }


    const month =
        getSelectedBudgetMonth();


    const budget =
        getMonthBudget(
            month
        ) ||
        createEmptyMonthBudget(
            month
        );


    const currentAmount =
        Number(
            budget.categories?.[
                categoryId
            ]
        ) || 0;


    const value =
        prompt(

            `${category.name}\n\n` +
            "या Category साठी Monthly Budget रक्कम भरा:",

            currentAmount

        );


    if (
        value === null
    ) {

        return;

    }


    const amount =
        Number(
            value
        );


    if (
        isNaN(amount) ||
        amount < 0
    ) {

        alert(
            "कृपया योग्य रक्कम भरा."
        );

        return;

    }


    const budgets =
        getMonthlyBudgets();


    if (
        !budgets[month]
    ) {

        budgets[month] =
            budget;

    }


    if (
        !budgets[month].categories
    ) {

        budgets[month].categories =
            {};

    }


    budgets[month].categories[
        categoryId
    ] =
        amount;


    budgets[month].updatedAt =
        new Date().toISOString();


    saveMonthlyBudgets(
        budgets
    );


    loadBudgetForSelectedMonth();

}



/* =========================================================
   OPEN CATEGORY FORM
========================================================= */

function openCategoryForm() {

    const card =
        document.getElementById(
            "categoryFormCard"
        );


    if (!card) {

        return;

    }


    card.style.display =
        "block";


    document.getElementById(
        "newCategoryName"
    )?.focus();

}



/* =========================================================
   CLOSE CATEGORY FORM
========================================================= */

function closeCategoryForm() {

    const card =
        document.getElementById(
            "categoryFormCard"
        );


    if (card) {

        card.style.display =
            "none";

    }


    const name =
        document.getElementById(
            "newCategoryName"
        );


    if (name) {

        name.value =
            "";

    }

}



/* =========================================================
   SAVE NEW CATEGORY
========================================================= */

function saveNewCategory() {

    const nameInput =
        document.getElementById(
            "newCategoryName"
        );


    const iconInput =
        document.getElementById(
            "newCategoryIcon"
        );


    const name =
        nameInput?.value
            .trim();


    const icon =
        iconInput?.value ||
        "fa-solid fa-tag";


    if (!name) {

        alert(
            "कृपया Category Name भरा."
        );

        return;

    }


    const categories =
        getBudgetCategories();


    const exists =
        categories.some(
            category =>
                category.name
                    .toLowerCase() ===
                name.toLowerCase()
        );


    if (exists) {

        alert(
            "ही Category आधीपासून आहे."
        );

        return;

    }


    const newCategory = {

        id:
            "custom-" +
            Date.now(),

        name:
            name,

        icon:
            icon,

        custom:
            true,

        createdAt:
            new Date().toISOString()

    };


    categories.push(
        newCategory
    );


    saveBudgetCategories(
        categories
    );



    /*
       Current month budget मध्ये
       नवीन category = 0
    */

    const month =
        getSelectedBudgetMonth();


    const budgets =
        getMonthlyBudgets();


    if (
        !budgets[month]
    ) {

        budgets[month] =
            createEmptyMonthBudget(
                month
            );

    }


    if (
        !budgets[month].categories
    ) {

        budgets[month].categories =
            {};

    }


    budgets[month].categories[
        newCategory.id
    ] =
        0;


    budgets[month].updatedAt =
        new Date().toISOString();


    saveMonthlyBudgets(
        budgets
    );


    closeCategoryForm();

    loadBudgetForSelectedMonth();


    alert(
        "नवीन Category successfully add झाली."
    );

}



/* =========================================================
   DELETE CUSTOM CATEGORY
========================================================= */

function deleteBudgetCategory(
    categoryId
) {

    if (
        !isCustomCategory(
            categoryId
        )
    ) {

        alert(
            "Default Category delete करता येणार नाही."
        );

        return;

    }


    const categories =
        getBudgetCategories();


    const category =
        categories.find(
            item =>
                item.id ===
                categoryId
        );


    if (!category) {

        return;

    }


    const confirmDelete =
        confirm(

            `"${category.name}" Category delete करायची आहे का?\n\n` +

            "टीप: आधीचे Expense transactions delete होणार नाहीत."

        );


    if (!confirmDelete) {

        return;

    }


    const updatedCategories =
        categories.filter(
            item =>
                item.id !==
                categoryId
        );


    saveBudgetCategories(
        updatedCategories
    );



    /*
       Existing monthly budgets मधून
       category remove करा.
    */

    const budgets =
        getMonthlyBudgets();


    Object.keys(
        budgets
    ).forEach(
        month => {

            if (
                budgets[month].categories
            ) {

                delete budgets[
                    month
                ].categories[
                    categoryId
                ];

            }

        }
    );


    saveMonthlyBudgets(
        budgets
    );


    loadBudgetForSelectedMonth();


    alert(
        "Category delete केली आहे."
    );

}



/* =========================================================
   IS CUSTOM CATEGORY
========================================================= */

function isCustomCategory(
    categoryId
) {

    const categories =
        getBudgetCategories();


    const category =
        categories.find(
            item =>
                item.id ===
                categoryId
        );


    return Boolean(
        category?.custom
    );

}



/* =========================================================
   SHOW SAVED MESSAGE
========================================================= */

function showBudgetSavedMessage() {

    const element =
        document.getElementById(
            "budgetStatusMessage"
        );


    if (!element) {

        return;

    }


    element.style.display =
        "block";


    element.className =
        "budget-status-message success";


    element.innerHTML = `

        <i class="fa-solid fa-circle-check"></i>

        Monthly Budget successfully save झाले.

    `;


    setTimeout(
        function () {

            updateBudgetSummary();

        },
        1800
    );

}



/* =========================================================
   FORMAT MONEY
========================================================= */

function formatBudgetMoney(
    amount
) {

    const value =
        Number(
            amount
        ) || 0;


    /*
       जर app.js मध्ये formatMoney()
       असेल तर ते वापरा.
    */

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
   SET TEXT
========================================================= */

function setText(
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
   CSS ESCAPE
========================================================= */

function cssEscape(
    value
) {

    /*
       Modern browser मध्ये CSS.escape
       available असेल तर वापरा.
    */

    if (
        typeof CSS !==
        "undefined" &&
        typeof CSS.escape ===
        "function"
    ) {

        return CSS.escape(
            value
        );

    }


    return String(
        value
    ).replace(
        /[^a-zA-Z0-9_-]/g,
        "\\$&"
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
   STORAGE CHANGE
========================================================= */

window.addEventListener(
    "storage",
    function () {

        loadBudgetForSelectedMonth();

    }
);



/* =========================================================
   CUSTOM EVENT SUPPORT

   Income / Expense save झाल्यानंतर
   same page मध्ये event dispatch केला
   तर Budget लगेच refresh होईल.
========================================================= */

window.addEventListener(
    "rdkhTransactionsUpdated",
    function () {

        loadBudgetForSelectedMonth();

    }
);
