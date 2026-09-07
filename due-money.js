/* =========================================================
   due-money.js

   घेतलेली रक्कम / देणे बाकी
   DAILY EXPENSES TRACKER

   FEATURES
   ---------------------------------------------------------
   ✅ New Borrowed Money
   ✅ Multiple records for same person
   ✅ Date-wise Repayment
   ✅ Automatic Outstanding Balance
   ✅ Repayment History
   ✅ Edit Borrowed Money
   ✅ Delete Borrowed Money
   ✅ Delete Repayment
   ✅ Search by Person
   ✅ From / To Date Filter
   ✅ Pending / Paid Filter
   ✅ Summary Cards
   ✅ LocalStorage
   ========================================================= */


/* =========================================================
   STORAGE
========================================================= */

const DUE_MONEY_KEY = "daily_expenses_due_money";


/* =========================================================
   GLOBAL DATA
========================================================= */

let dueMoneyData = [];

let editingTransactionId = null;

let currentDetailsId = null;


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    loadDueMoneyData();

    setDefaultDates();

    initializeEvents();

    renderAll();

});


/* =========================================================
   LOAD DATA
========================================================= */

function loadDueMoneyData() {

    try {

        const savedData =
            localStorage.getItem(DUE_MONEY_KEY);

        if (savedData) {

            dueMoneyData =
                JSON.parse(savedData);

        } else {

            dueMoneyData = [];

        }

    } catch (error) {

        console.error(
            "Due Money Data Load Error:",
            error
        );

        dueMoneyData = [];

    }

}


/* =========================================================
   SAVE DATA
========================================================= */

function saveDueMoneyData() {

    localStorage.setItem(
        DUE_MONEY_KEY,
        JSON.stringify(dueMoneyData)
    );

}


/* =========================================================
   DEFAULT DATES
========================================================= */

function setDefaultDates() {

    const today =
        getLocalDateString();

    const takenDate =
        document.getElementById("takenDate");

    const repaymentDate =
        document.getElementById("repaymentDate");

    if (takenDate) {

        takenDate.value = today;

    }

    if (repaymentDate) {

        repaymentDate.value = today;

    }

}


/* =========================================================
   LOCAL DATE
========================================================= */

function getLocalDateString(date = new Date()) {

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


/* =========================================================
   UNIQUE ID
========================================================= */

function generateId() {

    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .substring(2, 8)
    );

}


/* =========================================================
   INITIALIZE EVENTS
========================================================= */

function initializeEvents() {

    /* New Money Form */

    const moneyForm =
        document.getElementById("moneyForm");

    if (moneyForm) {

        moneyForm.addEventListener(
            "submit",
            handleMoneySubmit
        );

    }


    /* Repayment Form */

    const repaymentForm =
        document.getElementById("repaymentForm");

    if (repaymentForm) {

        repaymentForm.addEventListener(
            "submit",
            handleRepaymentSubmit
        );

    }


    /* Search */

    const searchPerson =
        document.getElementById("searchPerson");

    if (searchPerson) {

        searchPerson.addEventListener(
            "input",
            renderAll
        );

    }


    /* From Date */

    const fromDate =
        document.getElementById("fromDate");

    if (fromDate) {

        fromDate.addEventListener(
            "change",
            renderAll
        );

    }


    /* To Date */

    const toDate =
        document.getElementById("toDate");

    if (toDate) {

        toDate.addEventListener(
            "change",
            renderAll
        );

    }


    /* Status */

    const statusFilter =
        document.getElementById("statusFilter");

    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            renderAll
        );

    }


    /* Clear Filters */

    const clearFilters =
        document.getElementById("clearFilters");

    if (clearFilters) {

        clearFilters.addEventListener(
            "click",
            clearFiltersHandler
        );

    }


    /* Close Repayment Modal */

    const closeRepaymentModal =
        document.getElementById(
            "closeRepaymentModal"
        );

    if (closeRepaymentModal) {

        closeRepaymentModal.addEventListener(
            "click",
            closeRepaymentModalHandler
        );

    }


    /* Cancel Repayment */

    const cancelRepayment =
        document.getElementById(
            "cancelRepayment"
        );

    if (cancelRepayment) {

        cancelRepayment.addEventListener(
            "click",
            closeRepaymentModalHandler
        );

    }


    /* Close Details */

    const closeDetailsModal =
        document.getElementById(
            "closeDetailsModal"
        );

    if (closeDetailsModal) {

        closeDetailsModal.addEventListener(
            "click",
            closeDetailsModalHandler
        );

    }


    /* Click outside modal */

    const repaymentModal =
        document.getElementById(
            "repaymentModal"
        );

    if (repaymentModal) {

        repaymentModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    repaymentModal
                ) {

                    closeRepaymentModalHandler();

                }

            }
        );

    }


    const detailsModal =
        document.getElementById(
            "detailsModal"
        );

    if (detailsModal) {

        detailsModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    detailsModal
                ) {

                    closeDetailsModalHandler();

                }

            }
        );

    }

}


/* =========================================================
   ADD / EDIT MONEY
========================================================= */

function handleMoneySubmit(event) {

    event.preventDefault();


    const date =
        document.getElementById(
            "takenDate"
        ).value;

    const person =
        document.getElementById(
            "personName"
        ).value.trim();

    const amount =
        Number(
            document.getElementById(
                "takenAmount"
            ).value
        );

    const remark =
        document.getElementById(
            "takenRemark"
        ).value.trim();


    /* Validation */

    if (!date) {

        showToast(
            "कृपया तारीख निवडा."
        );

        return;

    }


    if (!person) {

        showToast(
            "कृपया व्यक्तीचे नाव भरा."
        );

        return;

    }


    if (
        !amount ||
        amount <= 0
    ) {

        showToast(
            "कृपया योग्य रक्कम भरा."
        );

        return;

    }


    /* EDIT */

    if (editingTransactionId) {

        const index =
            dueMoneyData.findIndex(
                item =>
                    item.id ===
                    editingTransactionId
            );


        if (index !== -1) {

            dueMoneyData[index].takenDate =
                date;

            dueMoneyData[index].personName =
                person;

            dueMoneyData[index].amount =
                amount;

            dueMoneyData[index].remark =
                remark;

            saveDueMoneyData();

            showToast(
                "नोंद यशस्वीपणे अपडेट झाली."
            );

        }

        editingTransactionId = null;

    }


    /* NEW */

    else {

        const newRecord = {

            id: generateId(),

            takenDate: date,

            personName: person,

            amount: amount,

            remark: remark,

            repayments: [],

            createdAt:
                new Date().toISOString()

        };


        dueMoneyData.push(
            newRecord
        );


        saveDueMoneyData();


        showToast(
            "घेतलेली रक्कम सेव्ह झाली."
        );

    }


    /* Reset */

    document
        .getElementById("moneyForm")
        .reset();


    setDefaultDates();


    renderAll();

}


/* =========================================================
   CALCULATE TOTAL REPAYMENT
========================================================= */

function getTotalRepaid(record) {

    if (
        !record ||
        !Array.isArray(
            record.repayments
        )
    ) {

        return 0;

    }


    return record.repayments.reduce(
        function (total, repayment) {

            return (
                total +
                Number(
                    repayment.amount
                )
            );

        },
        0
    );

}


/* =========================================================
   CALCULATE BALANCE
========================================================= */

function getBalance(record) {

    const totalRepaid =
        getTotalRepaid(record);

    const balance =
        Number(record.amount) -
        totalRepaid;


    return Math.max(
        0,
        balance
    );

}


/* =========================================================
   IS PAID
========================================================= */

function isPaid(record) {

    return getBalance(record) <= 0;

}


/* =========================================================
   FORMAT MONEY
========================================================= */

function formatMoney(amount) {

    return "₹" +
        Number(amount || 0)
            .toLocaleString(
                "en-IN",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            );

}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(dateString) {

    if (!dateString) {

        return "-";

    }


    const parts =
        dateString.split("-");


    if (
        parts.length !== 3
    ) {

        return dateString;

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
   GET FILTERED DATA
========================================================= */

function getFilteredData() {

    const search =
        (
            document.getElementById(
                "searchPerson"
            )?.value || ""
        )
        .trim()
        .toLowerCase();


    const fromDate =
        document.getElementById(
            "fromDate"
        )?.value || "";


    const toDate =
        document.getElementById(
            "toDate"
        )?.value || "";


    const status =
        document.getElementById(
            "statusFilter"
        )?.value || "all";


    return dueMoneyData
        .filter(function (record) {


            /* Search */

            if (search) {

                const person =
                    String(
                        record.personName || ""
                    )
                    .toLowerCase();

                if (
                    !person.includes(search)
                ) {

                    return false;

                }

            }


            /* From Date */

            if (
                fromDate &&
                record.takenDate <
                fromDate
            ) {

                return false;

            }


            /* To Date */

            if (
                toDate &&
                record.takenDate >
                toDate
            ) {

                return false;

            }


            /* Status */

            if (
                status === "pending" &&
                isPaid(record)
            ) {

                return false;

            }


            if (
                status === "paid" &&
                !isPaid(record)
            ) {

                return false;

            }


            return true;

        })
        .sort(function (a, b) {

            return (
                b.takenDate.localeCompare(
                    a.takenDate
                )
            );

        });

}


/* =========================================================
   RENDER ALL
========================================================= */

function renderAll() {

    updateSummary();

    renderMoneyList();

}


/* =========================================================
   UPDATE SUMMARY
========================================================= */

function updateSummary() {

    let totalTaken = 0;

    let totalRepaid = 0;

    let totalDue = 0;

    let pendingCount = 0;


    dueMoneyData.forEach(
        function (record) {

            totalTaken +=
                Number(record.amount || 0);

            totalRepaid +=
                getTotalRepaid(record);

            totalDue +=
                getBalance(record);

            if (
                !isPaid(record)
            ) {

                pendingCount++;

            }

        }
    );


    setText(
        "totalTaken",
        formatMoney(totalTaken)
    );


    setText(
        "totalRepaid",
        formatMoney(totalRepaid)
    );


    setText(
        "totalDue",
        formatMoney(totalDue)
    );


    setText(
        "pendingCount",
        pendingCount
    );

}


/* =========================================================
   SET TEXT
========================================================= */

function setText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {

        element.textContent = value;

    }

}


/* =========================================================
   RENDER MONEY LIST
========================================================= */

function renderMoneyList() {

    const list =
        document.getElementById(
            "moneyList"
        );

    const emptyState =
        document.getElementById(
            "emptyState"
        );

    const recordCount =
        document.getElementById(
            "recordCount"
        );


    if (!list) {

        return;

    }


    const filteredData =
        getFilteredData();


    list.innerHTML = "";


    if (recordCount) {

        recordCount.textContent =
            `${filteredData.length} व्यवहार`;

    }


    if (
        filteredData.length === 0
    ) {

        if (emptyState) {

            emptyState.style.display =
                "block";

        }

        return;

    }


    if (emptyState) {

        emptyState.style.display =
            "none";

    }


    filteredData.forEach(
        function (record) {

            list.appendChild(
                createMoneyItem(record)
            );

        }
    );

}


/* =========================================================
   CREATE MONEY ITEM
========================================================= */

function createMoneyItem(record) {

    const totalRepaid =
        getTotalRepaid(record);

    const balance =
        getBalance(record);

    const paid =
        isPaid(record);


    const item =
        document.createElement("div");


    item.className =
        "money-item";


    const firstLetter =
        (
            record.personName || "?"
        )
        .charAt(0)
        .toUpperCase();


    item.innerHTML = `

        <div class="money-item-header">

            <div class="person-info">

                <div class="person-avatar">

                    ${escapeHTML(firstLetter)}

                </div>

                <div>

                    <h3>
                        ${escapeHTML(
                            record.personName
                        )}
                    </h3>

                    <small>
                        घेतले: ${formatDate(
                            record.takenDate
                        )}
                    </small>

                </div>

            </div>


            <span class="status-badge ${
                paid
                    ? "status-paid"
                    : "status-pending"
            }">

                <i class="fa-solid ${
                    paid
                        ? "fa-circle-check"
                        : "fa-clock"
                }"></i>

                ${
                    paid
                        ? "पूर्ण"
                        : "देणे बाकी"
                }

            </span>

        </div>


        <div class="money-details">

            <div class="amount-box">

                <span>
                    घेतलेली रक्कम
                </span>

                <strong>
                    ${formatMoney(
                        record.amount
                    )}
                </strong>

            </div>


            <div class="amount-box">

                <span>
                    परतफेड
                </span>

                <strong>
                    ${formatMoney(
                        totalRepaid
                    )}
                </strong>

            </div>


            <div class="amount-box due">

                <span>
                    देणे बाकी
                </span>

                <strong>
                    ${formatMoney(
                        balance
                    )}
                </strong>

            </div>

        </div>


        ${
            record.remark
                ? `
                    <div class="money-remark">

                        <i class="fa-solid fa-note-sticky"></i>

                        ${escapeHTML(
                            record.remark
                        )}

                    </div>
                  `
                : ""
        }


        <div class="money-actions">

            ${
                !paid
                    ? `
                        <button
                            class="action-btn action-repay"
                            onclick="openRepaymentModal('${record.id}')">

                            <i class="fa-solid fa-money-bill-wave"></i>

                            परतफेड

                        </button>
                      `
                    : ""
            }


            <button
                class="action-btn action-details"
                onclick="openDetailsModal('${record.id}')">

                <i class="fa-solid fa-clock-rotate-left"></i>

                Details

            </button>


            <button
                class="action-btn action-edit"
                onclick="editMoney('${record.id}')">

                <i class="fa-solid fa-pen"></i>

                Edit

            </button>


            <button
                class="action-btn action-delete"
                onclick="deleteMoney('${record.id}')">

                <i class="fa-solid fa-trash"></i>

                Delete

            </button>

        </div>

    `;


    return item;

}


/* =========================================================
   OPEN REPAYMENT MODAL
========================================================= */

function openRepaymentModal(id) {

    const record =
        dueMoneyData.find(
            item =>
                item.id === id
        );


    if (!record) {

        showToast(
            "व्यवहार सापडला नाही."
        );

        return;

    }


    const balance =
        getBalance(record);


    if (balance <= 0) {

        showToast(
            "या व्यवहाराची पूर्ण परतफेड झाली आहे."
        );

        return;

    }


    setText(
        "repaymentPerson",
        record.personName
    );


    setText(
        "repaymentDue",
        formatMoney(balance)
    );


    document.getElementById(
        "repaymentTransactionId"
    ).value = id;


    document.getElementById(
        "repaymentDate"
    ).value =
        getLocalDateString();


    document.getElementById(
        "repaymentAmount"
    ).value = "";


    document.getElementById(
        "repaymentRemark"
    ).value = "";


    const modal =
        document.getElementById(
            "repaymentModal"
        );


    if (modal) {

        modal.classList.add("show");

    }

}


/* =========================================================
   CLOSE REPAYMENT MODAL
========================================================= */

function closeRepaymentModalHandler() {

    const modal =
        document.getElementById(
            "repaymentModal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );

    }


    const form =
        document.getElementById(
            "repaymentForm"
        );


    if (form) {

        form.reset();

    }


    setDefaultDates();

}


/* =========================================================
   HANDLE REPAYMENT
========================================================= */

function handleRepaymentSubmit(event) {

    event.preventDefault();


    const id =
        document.getElementById(
            "repaymentTransactionId"
        ).value;


    const date =
        document.getElementById(
            "repaymentDate"
        ).value;


    const amount =
        Number(
            document.getElementById(
                "repaymentAmount"
            ).value
        );


    const remark =
        document.getElementById(
            "repaymentRemark"
        ).value.trim();


    const record =
        dueMoneyData.find(
            item =>
                item.id === id
        );


    if (!record) {

        showToast(
            "व्यवहार सापडला नाही."
        );

        return;

    }


    if (!date) {

        showToast(
            "कृपया repayment तारीख निवडा."
        );

        return;

    }


    if (
        !amount ||
        amount <= 0
    ) {

        showToast(
            "कृपया योग्य repayment रक्कम भरा."
        );

        return;

    }


    const balance =
        getBalance(record);


    /* Do not allow over payment */

    if (amount > balance) {

        showToast(
            `जास्तीत जास्त ${formatMoney(
                balance
            )} repayment करता येईल.`
        );

        return;

    }


    if (
        !Array.isArray(
            record.repayments
        )
    ) {

        record.repayments = [];

    }


    record.repayments.push({

        id: generateId(),

        date: date,

        amount: amount,

        remark: remark,

        createdAt:
            new Date().toISOString()

    });


    saveDueMoneyData();


    closeRepaymentModalHandler();


    showToast(
        "Repayment यशस्वीपणे सेव्ह झाली."
    );


    renderAll();

}


/* =========================================================
   OPEN DETAILS MODAL
========================================================= */

function openDetailsModal(id) {

    const record =
        dueMoneyData.find(
            item =>
                item.id === id
        );


    if (!record) {

        showToast(
            "व्यवहार सापडला नाही."
        );

        return;

    }


    currentDetailsId = id;


    setText(
        "detailsPerson",
        record.personName
    );


    renderDetailsSummary(record);

    renderRepaymentHistory(record);


    const modal =
        document.getElementById(
            "detailsModal"
        );


    if (modal) {

        modal.classList.add("show");

    }

}


/* =========================================================
   CLOSE DETAILS
========================================================= */

function closeDetailsModalHandler() {

    const modal =
        document.getElementById(
            "detailsModal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );

    }


    currentDetailsId = null;

}


/* =========================================================
   DETAILS SUMMARY
========================================================= */

function renderDetailsSummary(record) {

    const container =
        document.getElementById(
            "detailsSummary"
        );


    if (!container) {

        return;

    }


    const totalRepaid =
        getTotalRepaid(record);


    const balance =
        getBalance(record);


    container.innerHTML = `

        <div class="detail-summary-box">

            <span>
                घेतलेली रक्कम
            </span>

            <strong>
                ${formatMoney(
                    record.amount
                )}
            </strong>

        </div>


        <div class="detail-summary-box">

            <span>
                एकूण परतफेड
            </span>

            <strong>
                ${formatMoney(
                    totalRepaid
                )}
            </strong>

        </div>


        <div class="detail-summary-box due">

            <span>
                देणे बाकी
            </span>

            <strong>
                ${formatMoney(
                    balance
                )}
            </strong>

        </div>

    `;

}


/* =========================================================
   REPAYMENT HISTORY
========================================================= */

function renderRepaymentHistory(record) {

    const container =
        document.getElementById(
            "repaymentHistory"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    if (
        !record.repayments ||
        record.repayments.length === 0
    ) {

        container.innerHTML = `

            <div class="no-repayment">

                <i class="fa-solid fa-circle-info"></i>

                <br><br>

                अजून कोणतीही repayment नोंद नाही.

            </div>

        `;

        return;

    }


    /* Sort oldest → newest */

    const repayments =
        [...record.repayments]
            .sort(function (a, b) {

                return a.date.localeCompare(
                    b.date
                );

            });


    let runningRepaid = 0;


    repayments.forEach(
        function (repayment) {

            runningRepaid +=
                Number(
                    repayment.amount
                );


            const balance =
                Math.max(
                    0,
                    Number(record.amount) -
                    runningRepaid
                );


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "repayment-row";


            row.innerHTML = `

                <div class="repayment-date">

                    <i class="fa-regular fa-calendar"></i>

                    ${formatDate(
                        repayment.date
                    )}

                </div>


                <div class="repayment-amount">

                    ${formatMoney(
                        repayment.amount
                    )}

                </div>


                <div class="repayment-remark">

                    ${
                        repayment.remark
                            ? escapeHTML(
                                repayment.remark
                              )
                            : "-"
                    }

                </div>


                <div class="repayment-balance">

                    ${formatMoney(
                        balance
                    )}

                </div>


                <button
                    class="repayment-delete"
                    title="Delete repayment"
                    onclick="deleteRepayment(
                        '${record.id}',
                        '${repayment.id}'
                    )">

                    <i class="fa-solid fa-trash"></i>

                </button>

            `;


            container.appendChild(row);

        }
    );

}


/* =========================================================
   DELETE REPAYMENT
========================================================= */

function deleteRepayment(
    transactionId,
    repaymentId
) {

    const record =
        dueMoneyData.find(
            item =>
                item.id ===
                transactionId
        );


    if (!record) {

        return;

    }


    const repaymentIndex =
        record.repayments.findIndex(
            repayment =>
                repayment.id ===
                repaymentId
        );


    if (
        repaymentIndex === -1
    ) {

        return;

    }


    const confirmed =
        confirm(
            "ही repayment नोंद delete करायची आहे का?"
        );


    if (!confirmed) {

        return;

    }


    record.repayments.splice(
        repaymentIndex,
        1
    );


    saveDueMoneyData();


    showToast(
        "Repayment नोंद delete झाली."
    );


    renderAll();


    if (currentDetailsId) {

        const updatedRecord =
            dueMoneyData.find(
                item =>
                    item.id ===
                    currentDetailsId
            );


        if (updatedRecord) {

            renderDetailsSummary(
                updatedRecord
            );

            renderRepaymentHistory(
                updatedRecord
            );

        }

    }

}


/* =========================================================
   EDIT MONEY
========================================================= */

function editMoney(id) {

    const record =
        dueMoneyData.find(
            item =>
                item.id === id
        );


    if (!record) {

        showToast(
            "व्यवहार सापडला नाही."
        );

        return;

    }


    editingTransactionId = id;


    document.getElementById(
        "takenDate"
    ).value =
        record.takenDate;


    document.getElementById(
        "personName"
    ).value =
        record.personName;


    document.getElementById(
        "takenAmount"
    ).value =
        record.amount;


    document.getElementById(
        "takenRemark"
    ).value =
        record.remark || "";


    const submitButton =
        document.querySelector(
            "#moneyForm button[type='submit']"
        );


    if (submitButton) {

        submitButton.innerHTML = `

            <i class="fa-solid fa-pen"></i>

            नोंद अपडेट करा

        `;

    }


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });


    showToast(
        "नोंद edit mode मध्ये आहे."
    );

}


/* =========================================================
   DELETE MONEY
========================================================= */

function deleteMoney(id) {

    const record =
        dueMoneyData.find(
            item =>
                item.id === id
        );


    if (!record) {

        return;

    }


    const confirmed =
        confirm(
            `${record.personName} ची ही पूर्ण नोंद delete करायची आहे?\n\nघेतलेली रक्कम: ${formatMoney(
                record.amount
            )}\nपरतफेड: ${formatMoney(
                getTotalRepaid(record)
            )}`
        );


    if (!confirmed) {

        return;

    }


    dueMoneyData =
        dueMoneyData.filter(
            item =>
                item.id !== id
        );


    saveDueMoneyData();


    showToast(
        "नोंद delete झाली."
    );


    renderAll();

}


/* =========================================================
   CLEAR FILTERS
========================================================= */

function clearFiltersHandler() {

    const search =
        document.getElementById(
            "searchPerson"
        );

    const from =
        document.getElementById(
            "fromDate"
        );

    const to =
        document.getElementById(
            "toDate"
        );

    const status =
        document.getElementById(
            "statusFilter"
        );


    if (search) {

        search.value = "";

    }


    if (from) {

        from.value = "";

    }


    if (to) {

        to.value = "";

    }


    if (status) {

        status.value = "all";

    }


    renderAll();

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(value || "")
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
   TOAST
========================================================= */

function showToast(message) {

    let toast =
        document.getElementById(
            "dueToast"
        );


    if (!toast) {

        toast =
            document.createElement(
                "div"
            );

        toast.id =
            "dueToast";

        toast.className =
            "due-toast";

        document.body.appendChild(
            toast
        );

    }


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        window.dueToastTimer
    );


    window.dueToastTimer =
        setTimeout(
            function () {

                toast.classList.remove(
                    "show"
                );

            },
            2500
        );

}


/* =========================================================
   ESC KEY
========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key !== "Escape"
        ) {

            return;

        }


        closeRepaymentModalHandler();

        closeDetailsModalHandler();

    }
);


/* =========================================================
   PUBLIC FUNCTIONS
========================================================= */

window.openRepaymentModal =
    openRepaymentModal;

window.openDetailsModal =
    openDetailsModal;

window.deleteRepayment =
    deleteRepayment;

window.editMoney =
    editMoney;

window.deleteMoney =
    deleteMoney;
