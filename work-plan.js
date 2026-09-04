/* =========================================================
   work-plan.js

   DAILY WORK PLAN
   रोजची कामाची योजना

   Features:
   ---------------------------------------------------------
   ✅ Date-wise Work
   ✅ Add Work
   ✅ Edit Work
   ✅ Delete Work
   ✅ Start / End Time
   ✅ Priority
   ✅ Status
   ✅ Completion
   ✅ Search
   ✅ Filters
   ✅ Remarks
   ✅ LocalStorage
   ========================================================= */


/* =========================================================
   STORAGE
========================================================= */

const WORK_PLAN_STORAGE_KEY = "daily_work_plan_v1";


/* =========================================================
   GLOBAL VARIABLES
========================================================= */

let allWorks = [];

let selectedDate = "";

let currentFilter = "all";

let deleteWorkId = null;


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    initializeWorkPlan();

});


/* =========================================================
   INITIALIZE
========================================================= */

function initializeWorkPlan() {

    loadWorks();

    selectedDate = getTodayDate();

    const dateInput =
        document.getElementById("workDate");

    if (dateInput) {

        dateInput.value = selectedDate;

    }

    const modalDate =
        document.getElementById("modalWorkDate");

    if (modalDate) {

        modalDate.value = selectedDate;

    }

    renderWorkList();

    updateSummary();

    setupKeyboardEvents();

}


/* =========================================================
   GET TODAY DATE
   Local timezone safe
========================================================= */

function getTodayDate() {

    const now = new Date();

    const year =
        now.getFullYear();

    const month =
        String(now.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(now.getDate())
            .padStart(2, "0");

    return `${year}-${month}-${day}`;

}


/* =========================================================
   LOAD
========================================================= */

function loadWorks() {

    try {

        const saved =
            localStorage.getItem(
                WORK_PLAN_STORAGE_KEY
            );

        if (!saved) {

            allWorks = [];

            return;

        }

        const parsed =
            JSON.parse(saved);

        allWorks =
            Array.isArray(parsed)
                ? parsed
                : [];

    }

    catch (error) {

        console.error(
            "Work Plan Load Error:",
            error
        );

        allWorks = [];

    }

}


/* =========================================================
   SAVE
========================================================= */

function saveWorks() {

    try {

        localStorage.setItem(
            WORK_PLAN_STORAGE_KEY,
            JSON.stringify(allWorks)
        );

        return true;

    }

    catch (error) {

        console.error(
            "Work Plan Save Error:",
            error
        );

        showToast(
            "Data save झाले नाही",
            "error"
        );

        return false;

    }

}


/* =========================================================
   CHANGE DATE
========================================================= */

function changeWorkDate(date) {

    if (!date) {

        return;

    }

    selectedDate = date;

    const modalDate =
        document.getElementById(
            "modalWorkDate"
        );

    if (modalDate) {

        modalDate.value = date;

    }

    renderWorkList();

    updateSummary();

}


/* =========================================================
   TODAY
========================================================= */

function goToToday() {

    const today =
        getTodayDate();

    selectedDate = today;

    const dateInput =
        document.getElementById(
            "workDate"
        );

    if (dateInput) {

        dateInput.value = today;

    }

    const modalDate =
        document.getElementById(
            "modalWorkDate"
        );

    if (modalDate) {

        modalDate.value = today;

    }

    renderWorkList();

    updateSummary();

}


/* =========================================================
   GET DATE WORKS
========================================================= */

function getWorksForSelectedDate() {

    return allWorks.filter(function (work) {

        return work.date === selectedDate;

    });

}


/* =========================================================
   SORT
========================================================= */

function sortWorks(works) {

    return [...works].sort(function (a, b) {

        const timeA =
            a.startTime || "99:99";

        const timeB =
            b.startTime || "99:99";

        if (timeA !== timeB) {

            return timeA.localeCompare(timeB);

        }

        return (
            Number(a.createdAt || 0) -
            Number(b.createdAt || 0)
        );

    });

}


/* =========================================================
   RENDER LIST
========================================================= */

function renderWorkList() {

    const list =
        document.getElementById(
            "workList"
        );

    const empty =
        document.getElementById(
            "emptyState"
        );

    if (!list || !empty) {

        return;

    }


    let works =
        getWorksForSelectedDate();


    /* ---------------------------------------------
       FILTER
    --------------------------------------------- */

    if (currentFilter === "pending") {

        works =
            works.filter(function (work) {

                return work.status === "pending";

            });

    }


    else if (
        currentFilter === "in-progress"
    ) {

        works =
            works.filter(function (work) {

                return work.status === "in-progress";

            });

    }


    else if (
        currentFilter === "completed"
    ) {

        works =
            works.filter(function (work) {

                return work.status === "completed";

            });

    }


    else if (currentFilter === "high") {

        works =
            works.filter(function (work) {

                return work.priority === "high";

            });

    }


    /* ---------------------------------------------
       SEARCH
    --------------------------------------------- */

    const searchInput =
        document.getElementById(
            "workSearch"
        );

    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    if (search) {

        works =
            works.filter(function (work) {

                const title =
                    String(
                        work.title || ""
                    ).toLowerCase();

                const remarks =
                    String(
                        work.remarks || ""
                    ).toLowerCase();

                return (
                    title.includes(search) ||
                    remarks.includes(search)
                );

            });

    }


    works =
        sortWorks(works);


    /* ---------------------------------------------
       COUNT
    --------------------------------------------- */

    const countText =
        document.getElementById(
            "workCountText"
        );

    if (countText) {

        countText.textContent =
            `${works.length} कामे`;

    }


    /* ---------------------------------------------
       EMPTY
    --------------------------------------------- */

    if (works.length === 0) {

        list.innerHTML = "";

        empty.style.display =
            "block";

        return;

    }


    empty.style.display =
        "none";


    /* ---------------------------------------------
       CREATE HTML
    --------------------------------------------- */

    list.innerHTML =
        works.map(
            createWorkHTML
        ).join("");

}


/* =========================================================
   CREATE WORK HTML
========================================================= */

function createWorkHTML(work) {

    const completed =
        work.status === "completed";


    const time =
        formatTimeRange(
            work.startTime,
            work.endTime
        );


    const priority =
        getPriorityData(
            work.priority
        );


    const status =
        getStatusData(
            work.status
        );


    const remarks =
        escapeHTML(
            work.remarks || ""
        );


    const title =
        escapeHTML(
            work.title || ""
        );


    return `

        <article
            class="wp-work-item
            ${completed ? "completed-item" : ""}"
            style="position:relative;"
        >

            <!-- CHECK -->

            <button
                class="wp-check
                ${completed ? "completed" : ""}"
                onclick="toggleWorkComplete('${work.id}')"
                aria-label="Complete work"
            >

                ${
                    completed
                        ? '<i class="fa-solid fa-check"></i>'
                        : ''
                }

            </button>


            <!-- TIME -->

            <div class="wp-work-time">

                <i class="fa-regular fa-clock"></i>

                ${time}

            </div>


            <!-- INFO -->

            <div class="wp-work-info">

                <h4>
                    ${title}
                </h4>

                ${
                    remarks
                        ? `<p>
                            <i class="fa-regular fa-comment-dots"></i>
                            ${remarks}
                           </p>`
                        : ""
                }

            </div>


            <!-- PRIORITY -->

            <span
                class="wp-priority ${priority.className}"
            >

                ${priority.icon}

                ${priority.label}

            </span>


            <!-- STATUS -->

            <span
                class="wp-status ${status.className}"
            >

                ${status.icon}

                ${status.label}

            </span>


            <!-- ACTIONS -->

            <div class="wp-work-actions">

                <button
                    class="wp-action-btn edit"
                    onclick="editWork('${work.id}')"
                    title="Edit"
                >

                    <i class="fa-solid fa-pen"></i>

                </button>


                <button
                    class="wp-action-btn delete"
                    onclick="openDeleteModal('${work.id}')"
                    title="Delete"
                >

                    <i class="fa-solid fa-trash"></i>

                </button>

            </div>

        </article>

    `;

}


/* =========================================================
   TIME FORMAT
========================================================= */

function formatTimeRange(
    startTime,
    endTime
) {

    if (!startTime && !endTime) {

        return "No time";

    }


    const start =
        formatTime(startTime);


    const end =
        formatTime(endTime);


    if (startTime && endTime) {

        return `${start} - ${end}`;

    }


    return startTime
        ? start
        : end;

}


function formatTime(time) {

    if (!time) {

        return "";

    }

    const parts =
        time.split(":");

    let hour =
        parseInt(parts[0], 10);

    const minute =
        parts[1] || "00";

    const suffix =
        hour >= 12
            ? "PM"
            : "AM";

    hour =
        hour % 12 || 12;

    return `${String(hour).padStart(2, "0")}:${minute} ${suffix}`;

}


/* =========================================================
   PRIORITY
========================================================= */

function getPriorityData(priority) {

    switch (priority) {

        case "high":

            return {

                label: "High",

                className: "high",

                icon:
                    '<i class="fa-solid fa-circle"></i>'

            };


        case "low":

            return {

                label: "Low",

                className: "low",

                icon:
                    '<i class="fa-solid fa-circle"></i>'

            };


        default:

            return {

                label: "Medium",

                className: "medium",

                icon:
                    '<i class="fa-solid fa-circle"></i>'

            };

    }

}


/* =========================================================
   STATUS
========================================================= */

function getStatusData(status) {

    switch (status) {

        case "completed":

            return {

                label: "Done",

                className: "completed",

                icon:
                    '<i class="fa-solid fa-check"></i>'

            };


        case "in-progress":

            return {

                label: "In Progress",

                className: "in-progress",

                icon:
                    '<i class="fa-solid fa-spinner"></i>'

            };


        default:

            return {

                label: "Pending",

                className: "pending",

                icon:
                    '<i class="fa-regular fa-clock"></i>'

            };

    }

}


/* =========================================================
   SUMMARY
========================================================= */

function updateSummary() {

    const works =
        getWorksForSelectedDate();


    const total =
        works.length;


    const completed =
        works.filter(function (work) {

            return work.status === "completed";

        }).length;


    const pending =
        works.filter(function (work) {

            return work.status !== "completed";

        }).length;


    const high =
        works.filter(function (work) {

            return (
                work.priority === "high" &&
                work.status !== "completed"
            );

        }).length;


    const percentage =
        total === 0
            ? 0
            : Math.round(
                (completed / total) * 100
            );


    setText(
        "totalWork",
        total
    );

    setText(
        "completedWork",
        completed
    );

    setText(
        "pendingWork",
        pending
    );

    setText(
        "highPriorityWork",
        high
    );


    setText(
        "completionPercentage",
        `${percentage}%`
    );


    setText(
        "completionText",
        `${percentage}% completed`
    );


    const progress =
        document.getElementById(
            "completionProgress"
        );

    if (progress) {

        progress.style.width =
            `${percentage}%`;

    }

}


/* =========================================================
   SET TEXT
========================================================= */

function setText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {

        element.textContent =
            value;

    }

}


/* =========================================================
   ADD MODAL
========================================================= */

function openAddWorkModal() {

    const modal =
        document.getElementById(
            "workModal"
        );


    const form =
        document.getElementById(
            "workForm"
        );


    if (!modal || !form) {

        return;

    }


    form.reset();


    document.getElementById(
        "editWorkId"
    ).value = "";


    document.getElementById(
        "modalTitle"
    ).textContent =
        "Add New Work";


    document.getElementById(
        "saveButtonText"
    ).textContent =
        "Save Work";


    document.getElementById(
        "modalWorkDate"
    ).value =
        selectedDate;


    document.getElementById(
        "priority"
    ).value =
        "medium";


    document.getElementById(
        "status"
    ).value =
        "pending";


    modal.classList.add("show");


    setTimeout(function () {

        document.getElementById(
            "workTitle"
        ).focus();

    }, 100);

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeWorkModal() {

    const modal =
        document.getElementById(
            "workModal"
        );

    if (modal) {

        modal.classList.remove("show");

    }

}


/* =========================================================
   SAVE WORK
========================================================= */

function saveWork(event) {

    event.preventDefault();


    const id =
        document.getElementById(
            "editWorkId"
        ).value;


    const title =
        document.getElementById(
            "workTitle"
        ).value.trim();


    const date =
        document.getElementById(
            "modalWorkDate"
        ).value;


    const startTime =
        document.getElementById(
            "startTime"
        ).value;


    const endTime =
        document.getElementById(
            "endTime"
        ).value;


    const priority =
        document.getElementById(
            "priority"
        ).value;


    const status =
        document.getElementById(
            "status"
        ).value;


    const remarks =
        document.getElementById(
            "remarks"
        ).value.trim();


    /* ---------------------------------------------
       VALIDATION
    --------------------------------------------- */

    if (!title) {

        showToast(
            "Work / Task name enter करा",
            "error"
        );

        return;

    }


    if (!date) {

        showToast(
            "Date select करा",
            "error"
        );

        return;

    }


    if (
        startTime &&
        endTime &&
        endTime < startTime
    ) {

        showToast(
            "End Time, Start Time पेक्षा आधी असू शकत नाही",
            "error"
        );

        return;

    }


    const now =
        Date.now();


    /* ---------------------------------------------
       EDIT
    --------------------------------------------- */

    if (id) {

        const index =
            allWorks.findIndex(
                function (work) {

                    return work.id === id;

                }
            );


        if (index !== -1) {

            allWorks[index] = {

                ...allWorks[index],

                title,

                date,

                startTime,

                endTime,

                priority,

                status,

                remarks,

                updatedAt: now

            };

        }

        else {

            showToast(
                "Work सापडले नाही",
                "error"
            );

            return;

        }


        if (!saveWorks()) {

            return;

        }


        selectedDate =
            date;


        updateDateInput();

        closeWorkModal();

        renderWorkList();

        updateSummary();


        showToast(
            "Work updated successfully",
            "success"
        );


        return;

    }


    /* ---------------------------------------------
       NEW WORK
    --------------------------------------------- */

    const newWork = {

        id:
            generateId(),

        title,

        date,

        startTime,

        endTime,

        priority,

        status,

        remarks,

        createdAt:
            now,

        updatedAt:
            now

    };


    allWorks.push(
        newWork
    );


    if (!saveWorks()) {

        return;

    }


    selectedDate =
        date;


    updateDateInput();

    closeWorkModal();

    renderWorkList();

    updateSummary();


    showToast(
        "Work saved successfully",
        "success"
    );

}


/* =========================================================
   UPDATE DATE INPUT
========================================================= */

function updateDateInput() {

    const dateInput =
        document.getElementById(
            "workDate"
        );

    if (dateInput) {

        dateInput.value =
            selectedDate;

    }

}


/* =========================================================
   EDIT WORK
========================================================= */

function editWork(id) {

    const work =
        allWorks.find(
            function (item) {

                return item.id === id;

            }
        );


    if (!work) {

        showToast(
            "Work सापडले नाही",
            "error"
        );

        return;

    }


    document.getElementById(
        "editWorkId"
    ).value =
        work.id;


    document.getElementById(
        "workTitle"
    ).value =
        work.title || "";


    document.getElementById(
        "modalWorkDate"
    ).value =
        work.date || selectedDate;


    document.getElementById(
        "startTime"
    ).value =
        work.startTime || "";


    document.getElementById(
        "endTime"
    ).value =
        work.endTime || "";


    document.getElementById(
        "priority"
    ).value =
        work.priority || "medium";


    document.getElementById(
        "status"
    ).value =
        work.status || "pending";


    document.getElementById(
        "remarks"
    ).value =
        work.remarks || "";


    document.getElementById(
        "modalTitle"
    ).textContent =
        "Edit Work";


    document.getElementById(
        "saveButtonText"
    ).textContent =
        "Update Work";


    document.getElementById(
        "workModal"
    ).classList.add("show");

}


/* =========================================================
   TOGGLE COMPLETE
========================================================= */

function toggleWorkComplete(id) {

    const index =
        allWorks.findIndex(
            function (work) {

                return work.id === id;

            }
        );


    if (index === -1) {

        return;

    }


    const work =
        allWorks[index];


    if (
        work.status === "completed"
    ) {

        work.status =
            "pending";

    }

    else {

        work.status =
            "completed";

    }


    work.updatedAt =
        Date.now();


    saveWorks();

    renderWorkList();

    updateSummary();


    showToast(
        work.status === "completed"
            ? "Work completed ✅"
            : "Work pending मध्ये ठेवले",
        "success"
    );

}


/* =========================================================
   DELETE MODAL
========================================================= */

function openDeleteModal(id) {

    deleteWorkId =
        id;


    const modal =
        document.getElementById(
            "deleteModal"
        );


    if (modal) {

        modal.classList.add("show");

    }

}


/* =========================================================
   CLOSE DELETE MODAL
========================================================= */

function closeDeleteModal() {

    const modal =
        document.getElementById(
            "deleteModal"
        );


    if (modal) {

        modal.classList.remove("show");

    }


    deleteWorkId =
        null;

}


/* =========================================================
   CONFIRM DELETE
========================================================= */

function confirmDelete() {

    if (!deleteWorkId) {

        return;

    }


    const before =
        allWorks.length;


    allWorks =
        allWorks.filter(
            function (work) {

                return work.id !== deleteWorkId;

            }
        );


    if (allWorks.length === before) {

        closeDeleteModal();

        return;

    }


    saveWorks();

    closeDeleteModal();

    renderWorkList();

    updateSummary();


    showToast(
        "Work deleted",
        "success"
    );

}


/* =========================================================
   FILTER
========================================================= */

function setFilter(
    filter,
    button
) {

    currentFilter =
        filter;


    document
        .querySelectorAll(
            ".wp-filter"
        )
        .forEach(
            function (item) {

                item.classList.remove(
                    "active"
                );

            }
        );


    if (button) {

        button.classList.add(
            "active"
        );

    }


    renderWorkList();

}


/* =========================================================
   SCROLL
========================================================= */

function scrollToWorkList() {

    const element =
        document.getElementById(
            "workList"
        );


    if (element) {

        element.scrollIntoView({

            behavior: "smooth",

            block: "start"

        });

    }

}


/* =========================================================
   NAVIGATION
========================================================= */

function goHome() {

    window.location.href =
        "index.html";

}


function goToBudget() {

    window.location.href =
        "monthly-budget.html";

}


function goToSettings() {

    window.location.href =
        "settings.html";

}


function goBack() {

    if (
        window.history.length > 1
    ) {

        window.history.back();

    }

    else {

        goHome();

    }

}


/* =========================================================
   NOTIFICATION
========================================================= */

function showNotificationMessage() {

    const todayWorks =
        allWorks.filter(
            function (work) {

                return (
                    work.date ===
                    getTodayDate()
                );

            }
        );


    const pending =
        todayWorks.filter(
            function (work) {

                return (
                    work.status !==
                    "completed"
                );

            }
        ).length;


    if (pending > 0) {

        showToast(
            `${pending} work pending आहेत`,
            "success"
        );

    }

    else {

        showToast(
            "आजची सर्व कामे complete आहेत 🎉",
            "success"
        );

    }

}


/* =========================================================
   TOAST
========================================================= */

let toastTimer = null;


function showToast(
    message,
    type = "success"
) {

    const toast =
        document.getElementById(
            "wpToast"
        );


    const text =
        document.getElementById(
            "toastMessage"
        );


    const icon =
        document.getElementById(
            "toastIcon"
        );


    if (!toast || !text) {

        return;

    }


    text.textContent =
        message;


    toast.classList.remove(
        "success",
        "error",
        "show"
    );


    toast.classList.add(
        type
    );


    if (icon) {

        icon.className =
            type === "error"
                ? "fa-solid fa-circle-exclamation"
                : "fa-solid fa-circle-check";

    }


    void toast.offsetWidth;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            function () {

                toast.classList.remove(
                    "show"
                );

            },
            2800
        );

}


/* =========================================================
   GENERATE ID
========================================================= */

function generateId() {

    return (
        "work_" +
        Date.now() +
        "_" +
        Math.random()
            .toString(36)
            .substring(2, 9)
    );

}


/* =========================================================
   ESCAPE HTML
   Security
========================================================= */

function escapeHTML(value) {

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
   KEYBOARD
========================================================= */

function setupKeyboardEvents() {

    document.addEventListener(
        "keydown",
        function (event) {

            /* ESC */

            if (
                event.key === "Escape"
            ) {

                closeWorkModal();

                closeDeleteModal();

            }

        }
    );

}


/* =========================================================
   PREVENT BACKGROUND SCROLL
========================================================= */

const observer =
    new MutationObserver(
        function () {

            const workModal =
                document.getElementById(
                    "workModal"
                );

            const deleteModal =
                document.getElementById(
                    "deleteModal"
                );


            const open =
                (
                    workModal &&
                    workModal.classList.contains(
                        "show"
                    )
                ) ||
                (
                    deleteModal &&
                    deleteModal.classList.contains(
                        "show"
                    )
                );


            document.body.style.overflow =
                open
                    ? "hidden"
                    : "";

        }
    );


document.addEventListener(
    "DOMContentLoaded",
    function () {

        const workModal =
            document.getElementById(
                "workModal"
            );

        const deleteModal =
            document.getElementById(
                "deleteModal"
            );


        if (workModal) {

            observer.observe(
                workModal,
                {
                    attributes: true,
                    attributeFilter: [
                        "class"
                    ]
                }
            );

        }


        if (deleteModal) {

            observer.observe(
                deleteModal,
                {
                    attributes: true,
                    attributeFilter: [
                        "class"
                    ]
                }
            );

        }

    }
);
