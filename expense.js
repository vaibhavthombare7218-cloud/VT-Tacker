/* =========================================================
   expense.js
   रोजचा जमा खर्च अहवाल
   EXPENSE MANAGEMENT

   VERSION:
   Category Based Expense Tracking

   FEATURES:
   ---------------------------------------------------------
   ✅ 15 Main Expense Categories
   ✅ Expense + Budget Same Categories
   ✅ Daily / Monthly / Yearly Frequency
   ✅ Description
   ✅ Amount
   ✅ Payment Mode
   ✅ Account
   ✅ Note
   ✅ Category-wise Current Month Tracking
   ✅ Category Click -> All Current Month Transactions
   ✅ Transaction Total
   ✅ Transaction Count
   ✅ Delete Transaction
   ✅ Backward Compatible With Old Expense Records
   ========================================================= */


/* =========================================================
   STORAGE KEY
   ========================================================= */

const EXPENSE_STORAGE_KEY = "expenses";


/* =========================================================
   MAIN EXPENSE CATEGORIES
   IMPORTANT:
   This is the MASTER category list.

   Expense + Budget + Reports should use this same list.
   ========================================================= */

const EXPENSE_CATEGORIES = [

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
   STORAGE HELPERS
   ========================================================= */

function getExpenses() {

    try {

        const raw =
            localStorage.getItem(
                EXPENSE_STORAGE_KEY
            );

        if (!raw) {
            return [];
        }

        const data =
            JSON.parse(raw);

        return Array.isArray(data)
            ? data
            : [];

    } catch (error) {

        console.error(
            "Expense storage read error:",
            error
        );

        return [];
    }
}


function saveExpenses(expenses) {

    localStorage.setItem(
        EXPENSE_STORAGE_KEY,
        JSON.stringify(expenses)
    );
}


/* =========================================================
   CATEGORY HELPERS
   ========================================================= */

function getCategoryById(categoryId) {

    return EXPENSE_CATEGORIES.find(
        category =>
            category.id === categoryId
    );
}


function getCategoryName(categoryId) {

    const category =
        getCategoryById(
            categoryId
        );

    return category
        ? category.name
        : "इतर खर्च";
}


function getCategoryIcon(categoryId) {

    const category =
        getCategoryById(
            categoryId
        );

    return category
        ? category.icon
        : "📦";
}


/* =========================================================
   BACKWARD COMPATIBILITY
   ---------------------------------------------------------
   Old records may contain:
   category
   categoryId
   categoryName
   type
   etc.
   ========================================================= */

function normalizeExpenseCategory(expense) {

    if (!expense) {
        return "other_expense";
    }


    /* New format */

    if (expense.category) {

        const category =
            getCategoryById(
                expense.category
            );

        if (category) {
            return category.id;
        }
    }


    /* Old categoryId */

    if (expense.categoryId) {

        const category =
            getCategoryById(
                expense.categoryId
            );

        if (category) {
            return category.id;
        }
    }


    /* Old categoryName */

    if (expense.categoryName) {

        const found =
            EXPENSE_CATEGORIES.find(
                category =>
                    category.name ===
                    expense.categoryName
            );

        if (found) {
            return found.id;
        }
    }


    /* Default */

    return "other_expense";
}


/* =========================================================
   DATE HELPERS
   ========================================================= */

function getTodayDate() {

    const today =
        new Date();

    const year =
        today.getFullYear();

    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            today.getDate()
        ).padStart(2, "0");

    return (
        `${year}-${month}-${day}`
    );
}


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
   CATEGORY SELECT
   ========================================================= */

function populateExpenseCategories(
    selectElement
) {

    if (!selectElement) {
        return;
    }

    const previousValue =
        selectElement.value;


    selectElement.innerHTML = `

        <option value="">
            -- खर्चाचा प्रकार निवडा --
        </option>

    `;


    EXPENSE_CATEGORIES.forEach(
        category => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                category.id;

            option.textContent =
                `${category.icon} ${category.name}`;

            selectElement.appendChild(
                option
            );
        }
    );


    if (previousValue) {

        selectElement.value =
            previousValue;
    }
}


/* =========================================================
   EXPENSE FORM INITIALIZATION
   ========================================================= */

function initializeExpenseForm() {

    const form =
        document.getElementById(
            "expenseForm"
        );

    if (!form) {
        return;
    }


    const categorySelect =
        document.getElementById(
            "expenseCategory"
        );

    const dateInput =
        document.getElementById(
            "expenseDate"
        );


    if (categorySelect) {

        populateExpenseCategories(
            categorySelect
        );
    }


    if (
        dateInput &&
        !dateInput.value
    ) {

        dateInput.value =
            getTodayDate();
    }


    /*
       Prevent duplicate event listener
       if page/module refresh happens.
    */

    if (
        form.dataset.expenseInitialized ===
        "true"
    ) {

        return;
    }

    form.dataset.expenseInitialized =
        "true";


    form.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();

            saveNewExpense();

        }
    );
}


/* =========================================================
   SAVE NEW EXPENSE
   ========================================================= */

function saveNewExpense() {

    const categoryElement =
        document.getElementById(
            "expenseCategory"
        );

    const dateElement =
        document.getElementById(
            "expenseDate"
        );

    const amountElement =
        document.getElementById(
            "expenseAmount"
        );

    const descriptionElement =
        document.getElementById(
            "expenseDescription"
        );

    const paymentModeElement =
        document.getElementById(
            "expensePaymentMode"
        );

    const accountElement =
        document.getElementById(
            "expenseAccount"
        );

    const noteElement =
        document.getElementById(
            "expenseNote"
        );


    const category =
        categoryElement
            ? categoryElement.value
            : "";


    const date =
        dateElement &&
        dateElement.value
            ? dateElement.value
            : getTodayDate();


    const amount =
        Number(
            amountElement
                ? amountElement.value
                : 0
        );


    const description =
        descriptionElement
            ? descriptionElement.value.trim()
            : "";


    const paymentMode =
        paymentModeElement
            ? paymentModeElement.value
            : "";


    const account =
        accountElement
            ? accountElement.value
            : "";


    const note =
        noteElement
            ? noteElement.value.trim()
            : "";


    /* Validation */

    if (!category) {

        alert(
            "कृपया खर्चाचा प्रकार निवडा."
        );

        return;
    }


    if (!date) {

        alert(
            "कृपया तारीख निवडा."
        );

        return;
    }


    if (
        !amount ||
        amount <= 0
    ) {

        alert(
            "कृपया योग्य रक्कम टाका."
        );

        return;
    }


    /*
       Description is recommended.
       Empty description is allowed
       for backward compatibility.
    */


    const expenses =
        getExpenses();


    const expense = {

        id:
            "EXP-" +
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .substring(2, 8),

        date: date,

        category: category,

        categoryId: category,

        categoryName:
            getCategoryName(
                category
            ),

        amount: amount,

        description:
            description,

        paymentMode:
            paymentMode,

        account:
            account,

        note:
            note,

        createdAt:
            new Date().toISOString()

    };


    expenses.push(
        expense
    );


    saveExpenses(
        expenses
    );


    alert(
        "खर्च यशस्वीपणे सेव्ह झाला."
    );


    const form =
        document.getElementById(
            "expenseForm"
        );

    if (form) {

        form.reset();
    }


    if (dateElement) {

        dateElement.value =
            getTodayDate();
    }


    refreshExpenseUI();
}


/* =========================================================
   MONTHLY CATEGORY EXPENSE
   ========================================================= */

function getCategoryExpenseTotal(
    categoryId,
    month
) {

    const targetMonth =
        month || getCurrentMonth();


    return getExpenses()
        .reduce(
            (
                total,
                expense
            ) => {

                const normalizedCategory =
                    normalizeExpenseCategory(
                        expense
                    );


                if (
                    normalizedCategory !==
                    categoryId
                ) {

                    return total;
                }


                const expenseDate =
                    String(
                        expense.date || ""
                    );


                if (
                    !expenseDate.startsWith(
                        targetMonth
                    )
                ) {

                    return total;
                }


                return (
                    total +
                    Number(
                        expense.amount || 0
                    )
                );

            },
            0
        );
}


/* =========================================================
   CURRENT MONTH CATEGORY TRANSACTIONS
   ========================================================= */

function getCurrentMonthCategoryTransactions(
    categoryId
) {

    const currentMonth =
        getCurrentMonth();


    return getExpenses()
        .filter(
            expense => {

                const normalizedCategory =
                    normalizeExpenseCategory(
                        expense
                    );


                const expenseDate =
                    String(
                        expense.date || ""
                    );


                return (
                    normalizedCategory ===
                    categoryId
                ) &&
                expenseDate.startsWith(
                    currentMonth
                );

            }
        )
        .sort(
            (
                a,
                b
            ) => {

                const dateCompare =
                    new Date(
                        b.date || 0
                    ) -
                    new Date(
                        a.date || 0
                    );


                if (
                    dateCompare !== 0
                ) {

                    return dateCompare;
                }


                return (
                    String(
                        b.createdAt || ""
                    ).localeCompare(
                        String(
                            a.createdAt || ""
                        )
                    )
                );
            }
        );
}


/* =========================================================
   MONTHLY TOTAL
   ========================================================= */

function getMonthlyExpenseTotal(
    month
) {

    const targetMonth =
        month || getCurrentMonth();


    return getExpenses()
        .reduce(
            (
                total,
                expense
            ) => {

                const expenseDate =
                    String(
                        expense.date || ""
                    );


                if (
                    expenseDate.startsWith(
                        targetMonth
                    )
                ) {

                    return (
                        total +
                        Number(
                            expense.amount ||
                            0
                        )
                    );
                }


                return total;

            },
            0
        );
}


/* =========================================================
   CATEGORY SUMMARY
   ========================================================= */

function getExpenseCategorySummary(
    month
) {

    const targetMonth =
        month || getCurrentMonth();


    return EXPENSE_CATEGORIES.map(
        category => {

            const transactions =
                getExpenses()
                    .filter(
                        expense => {

                            return (
                                normalizeExpenseCategory(
                                    expense
                                ) ===
                                category.id
                            ) &&
                            String(
                                expense.date || ""
                            ).startsWith(
                                targetMonth
                            );
                        }
                    );


            const total =
                transactions.reduce(
                    (
                        sum,
                        transaction
                    ) => {

                        return (
                            sum +
                            Number(
                                transaction.amount ||
                                0
                            )
                        );

                    },
                    0
                );


            return {

                id:
                    category.id,

                name:
                    category.name,

                icon:
                    category.icon,

                frequency:
                    category.frequency,

                amount:
                    total,

                transactionCount:
                    transactions.length

            };

        }
    );
}


/* =========================================================
   RENDER EXPENSE CATEGORY CARDS
   ========================================================= */

function updateExpenseDashboard() {

    const monthlyTotal =
        getMonthlyExpenseTotal();


    const totalElement =
        document.getElementById(
            "monthlyExpenseTotal"
        );


    if (totalElement) {

        totalElement.textContent =
            formatMoney(
                monthlyTotal
            );
    }


    const container =
        document.getElementById(
            "expenseCategorySummary"
        );


    if (!container) {
        return;
    }


    const summary =
        getExpenseCategorySummary();


    container.innerHTML =
        "";


    summary.forEach(
        item => {

            container.innerHTML += `

                <div
                    class="expense-category-card"
                    onclick="
                        openCategoryTransactions(
                            '${item.id}'
                        )
                    "
                    role="button"
                    tabindex="0"
                >

                    <div
                        class="expense-category-icon">

                        ${item.icon}

                    </div>


                    <div
                        class="expense-category-info">

                        <div
                            class="expense-category-name">

                            ${escapeHTML(
                                item.name
                            )}

                        </div>


                        <div
                            class="expense-category-amount">

                            ${formatMoney(
                                item.amount
                            )}

                        </div>


                        <div
                            class="expense-category-count">

                            ${item.transactionCount}
                            transaction

                        </div>

                    </div>

                </div>

            `;
        }
    );
}


/* =========================================================
   OPEN CATEGORY TRANSACTIONS
   ========================================================= */

function openCategoryTransactions(
    categoryId
) {

    const category =
        getCategoryById(
            categoryId
        );


    if (!category) {
        return;
    }


    const transactions =
        getCurrentMonthCategoryTransactions(
            categoryId
        );


    const modal =
        document.getElementById(
            "categoryTransactionModal"
        );


    if (!modal) {

        console.warn(
            "categoryTransactionModal not found."
        );

        return;
    }


    const titleElement =
        document.getElementById(
            "categoryTransactionTitle"
        );


    const monthElement =
        document.getElementById(
            "categoryTransactionMonth"
        );


    const tbody =
        document.getElementById(
            "categoryTransactionBody"
        );


    const totalElement =
        document.getElementById(
            "categoryTransactionTotal"
        );


    const countElement =
        document.getElementById(
            "categoryTransactionCount"
        );


    if (titleElement) {

        titleElement.textContent =
            `${category.icon} ${category.name}`;
    }


    if (monthElement) {

        monthElement.textContent =
            getCurrentMonthDisplayName();
    }


    let total =
        0;


    if (tbody) {

        tbody.innerHTML =
            "";
    }


    if (
        transactions.length ===
        0
    ) {

        if (tbody) {

            tbody.innerHTML = `

                <tr>

                    <td
                        colspan="7"
                        class="no-category-transactions">

                        या महिन्यात या category मध्ये
                        कोणताही खर्च झालेला नाही.

                    </td>

                </tr>

            `;
        }

    } else {

        transactions.forEach(
            transaction => {

                const amount =
                    Number(
                        transaction.amount ||
                        0
                    );


                total +=
                    amount;


                const description =
                    transaction.description ||
                    transaction.desc ||
                    transaction.details ||
                    "-";


                const note =
                    transaction.note ||
                    "-";


                const paymentMode =
                    transaction.paymentMode ||
                    "-";


                const account =
                    transaction.account ||
                    "-";


                if (tbody) {

                    tbody.innerHTML += `

                        <tr>

                            <td>
                                ${formatDate(
                                    transaction.date
                                )}
                            </td>


                            <td
                                class="transaction-description">

                                ${escapeHTML(
                                    description
                                )}

                            </td>


                            <td
                                class="transaction-amount">

                                ${formatMoney(
                                    amount
                                )}

                            </td>


                            <td>
                                ${escapeHTML(
                                    paymentMode
                                )}
                            </td>


                            <td>
                                ${escapeHTML(
                                    account
                                )}
                            </td>


                            <td>
                                ${escapeHTML(
                                    note
                                )}
                            </td>


                            <td>

                                <button
                                    type="button"
                                    class="modal-delete-btn"
                                    onclick="
                                        deleteCategoryTransaction(
                                            '${escapeHTMLAttribute(
                                                transaction.id
                                            )}',
                                            '${categoryId}'
                                        )
                                    "
                                >

                                    🗑️

                                </button>

                            </td>

                        </tr>

                    `;
                }

            }
        );
    }


    if (totalElement) {

        totalElement.textContent =
            formatMoney(
                total
            );
    }


    if (countElement) {

        countElement.textContent =
            `${transactions.length} Transactions`;
    }


    modal.classList.add(
        "show"
    );


    document.body.classList.add(
        "modal-open"
    );
}


/* =========================================================
   DELETE CATEGORY TRANSACTION
   ========================================================= */

function deleteCategoryTransaction(
    transactionId,
    categoryId
) {

    if (
        !confirm(
            "हा transaction delete करायचा आहे का?"
        )
    ) {

        return;
    }


    const expenses =
        getExpenses();


    const updated =
        expenses.filter(
            expense =>
                String(
                    expense.id
                ) !==
                String(
                    transactionId
                )
        );


    saveExpenses(
        updated
    );


    /*
       Reopen modal so totals and list
       immediately refresh.
    */

    openCategoryTransactions(
        categoryId
    );


    refreshExpenseUI();
}


/* =========================================================
   CLOSE CATEGORY MODAL
   ========================================================= */

function closeCategoryTransactions() {

    const modal =
        document.getElementById(
            "categoryTransactionModal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );
    }


    document.body.classList.remove(
        "modal-open"
    );
}


/* =========================================================
   CLICK OUTSIDE MODAL
   ========================================================= */

document.addEventListener(
    "click",
    function(event) {

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
   ESC KEY
   ========================================================= */

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key ===
            "Escape"
        ) {

            closeCategoryTransactions();
        }

    }
);


/* =========================================================
   EXPENSE LIST
   ========================================================= */

function renderExpenseList() {

    const tbody =
        document.getElementById(
            "expenseTableBody"
        );


    if (!tbody) {
        return;
    }


    const expenses =
        getExpenses();


    tbody.innerHTML =
        "";


    const sorted =
        [...expenses].sort(
            (
                a,
                b
            ) => {

                return (
                    new Date(
                        b.date || 0
                    ) -
                    new Date(
                        a.date || 0
                    )
                );
            }
        );


    if (
        sorted.length ===
        0
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="9"
                    style="
                        text-align:center;
                        padding:25px;
                    ">

                    अजून कोणताही खर्च
                    नोंदवलेला नाही.

                </td>

            </tr>

        `;

        return;
    }


    sorted.forEach(
        (
            expense,
            index
        ) => {

            const categoryId =
                normalizeExpenseCategory(
                    expense
                );


            const description =
                expense.description ||
                expense.desc ||
                expense.details ||
                "-";


            const tr =
                document.createElement(
                    "tr"
                );


            tr.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td>
                    ${formatDate(
                        expense.date
                    )}
                </td>

                <td>
                    ${getCategoryIcon(
                        categoryId
                    )}
                    ${escapeHTML(
                        getCategoryName(
                            categoryId
                        )
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        description
                    )}
                </td>

                <td>
                    ${formatMoney(
                        expense.amount
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        expense.paymentMode ||
                        "-"
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        expense.account ||
                        "-"
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        expense.note ||
                        "-"
                    )}
                </td>

                <td>

                    <button
                        type="button"
                        class="expense-delete-btn"
                        onclick="
                            deleteExpense(
                                '${escapeHTMLAttribute(
                                    expense.id
                                )}'
                            )
                        "
                    >

                        🗑️

                    </button>

                </td>

            `;


            tbody.appendChild(
                tr
            );

        }
    );
}


/* =========================================================
   DELETE EXPENSE
   ========================================================= */

function deleteExpense(
    id
) {

    if (
        !confirm(
            "हा खर्च delete करायचा आहे का?"
        )
    ) {

        return;
    }


    const expenses =
        getExpenses();


    const updated =
        expenses.filter(
            expense =>
                String(
                    expense.id
                ) !==
                String(
                    id
                )
        );


    saveExpenses(
        updated
    );


    refreshExpenseUI();
}


/* =========================================================
   REFRESH ALL EXPENSE UI
   ========================================================= */

function refreshExpenseUI() {

    renderExpenseList();

    updateExpenseDashboard();


    /*
       Automatically refresh Budget
    */

    if (
        typeof window.refreshMonthlyBudget ===
        "function"
    ) {

        window.refreshMonthlyBudget();
    }


    /*
       Automatically refresh Dashboard
    */

    if (
        typeof window.updateDashboard ===
        "function"
    ) {

        window.updateDashboard();
    }
}


/* =========================================================
   DATE FORMAT
   ========================================================= */

function formatDate(
    dateString
) {

    if (!dateString) {
        return "-";
    }


    const date =
        new Date(
            dateString +
            "T00:00:00"
        );


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return dateString;
    }


    return date.toLocaleDateString(
        "mr-IN",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );
}


/* =========================================================
   CURRENT MONTH DISPLAY
   ========================================================= */

function getCurrentMonthDisplayName() {

    return new Date()
        .toLocaleDateString(
            "mr-IN",
            {
                month: "long",
                year: "numeric"
            }
        );
}


/* =========================================================
   MONEY FORMAT
   ========================================================= */

function formatMoney(
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


function escapeHTMLAttribute(
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
        );
}


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        initializeExpenseForm();

        renderExpenseList();

        updateExpenseDashboard();

    }
);


/* =========================================================
   GLOBAL EXPORTS
   ========================================================= */

window.EXPENSE_CATEGORIES =
    EXPENSE_CATEGORIES;

window.getExpenses =
    getExpenses;

window.saveExpenses =
    saveExpenses;

window.getCategoryById =
    getCategoryById;

window.getCategoryName =
    getCategoryName;

window.getCategoryIcon =
    getCategoryIcon;

window.getCategoryExpenseTotal =
    getCategoryExpenseTotal;

window.getMonthlyExpenseTotal =
    getMonthlyExpenseTotal;

window.getExpenseCategorySummary =
    getExpenseCategorySummary;

window.getCurrentMonthCategoryTransactions =
    getCurrentMonthCategoryTransactions;

window.openCategoryTransactions =
    openCategoryTransactions;

window.closeCategoryTransactions =
    closeCategoryTransactions;

window.deleteCategoryTransaction =
    deleteCategoryTransaction;

window.deleteExpense =
    deleteExpense;

window.refreshExpenseUI =
    refreshExpenseUI;

window.formatMoney =
    formatMoney;
