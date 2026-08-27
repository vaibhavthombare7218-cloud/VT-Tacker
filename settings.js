/* =========================================================
   settings.js

   रोजचा जमा खर्च अहवाल
   SETTINGS MANAGEMENT

   CONNECTED WITH:
   - app.js
   - income.js
   - expense.js
   - accounts.js
   - monthly-budget.js
   - transactions.js

   STORAGE:
   - rdkh_transactions
   - rdkh_accounts
   - rdkh_monthly_budgets
   - rdkh_settings
========================================================= */



/* =========================================================
   STORAGE KEYS
========================================================= */

const SETTINGS_STORAGE_KEY =
    "rdkh_settings";

const TRANSACTIONS_KEY =
    "rdkh_transactions";

const ACCOUNTS_KEY =
    "rdkh_accounts";

const BUDGETS_KEY =
    "rdkh_monthly_budgets";

const CATEGORIES_KEY =
    "rdkh_budget_categories";



/* =========================================================
   DEFAULT SETTINGS
========================================================= */

const DEFAULT_SETTINGS = {

    expenseReminder: false,

    reminderTime: "21:00"

};



/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeSettings();

        loadSettings();

        updateDataSummary();

    }
);



/* =========================================================
   INITIALIZE SETTINGS
========================================================= */

function initializeSettings() {

    const existing =
        localStorage.getItem(
            SETTINGS_STORAGE_KEY
        );


    if (!existing) {

        localStorage.setItem(

            SETTINGS_STORAGE_KEY,

            JSON.stringify(
                DEFAULT_SETTINGS
            )

        );

    }

}



/* =========================================================
   GET SETTINGS
========================================================= */

function getSettings() {

    try {

        const stored =
            localStorage.getItem(
                SETTINGS_STORAGE_KEY
            );


        if (!stored) {

            return {
                ...DEFAULT_SETTINGS
            };

        }


        const parsed =
            JSON.parse(
                stored
            );


        return {

            ...DEFAULT_SETTINGS,

            ...parsed

        };

    }

    catch (error) {

        console.error(
            "Settings Read Error:",
            error
        );


        return {
            ...DEFAULT_SETTINGS
        };

    }

}



/* =========================================================
   SAVE SETTINGS
========================================================= */

function saveSettings(
    settings
) {

    try {

        localStorage.setItem(

            SETTINGS_STORAGE_KEY,

            JSON.stringify(
                settings
            )

        );


        return true;

    }

    catch (error) {

        console.error(
            "Settings Save Error:",
            error
        );


        return false;

    }

}



/* =========================================================
   LOAD SETTINGS
========================================================= */

function loadSettings() {

    const settings =
        getSettings();


    const reminder =
        document.getElementById(
            "expenseReminder"
        );


    if (reminder) {

        reminder.checked =
            Boolean(
                settings.expenseReminder
            );

    }


    updateReminderStatus();

}



/* =========================================================
   TOGGLE REMINDER
========================================================= */

function toggleExpenseReminder() {

    const checkbox =
        document.getElementById(
            "expenseReminder"
        );


    if (!checkbox) {

        return;

    }


    const settings =
        getSettings();


    settings.expenseReminder =
        checkbox.checked;


    saveSettings(
        settings
    );


    updateReminderStatus();


    if (
        checkbox.checked
    ) {

        requestNotificationPermission();

    }

}



/* =========================================================
   REMINDER STATUS
========================================================= */

function updateReminderStatus() {

    const settings =
        getSettings();


    const status =
        document.getElementById(
            "reminderStatus"
        );


    if (!status) {

        return;

    }


    if (
        settings.expenseReminder
    ) {

        status.textContent =
            "🔔 Daily Expense Reminder सुरू आहे.";

        status.classList.add(
            "active"
        );

    }

    else {

        status.textContent =
            "Reminder बंद आहे.";

        status.classList.remove(
            "active"
        );

    }

}



/* =========================================================
   NOTIFICATION PERMISSION
========================================================= */

function requestNotificationPermission() {

    if (
        typeof Notification ===
        "undefined"
    ) {

        alert(
            "या Browser मध्ये Notification सुविधा उपलब्ध नाही."
        );

        return;

    }


    if (
        Notification.permission ===
        "granted"
    ) {

        return;

    }


    if (
        Notification.permission ===
        "denied"
    ) {

        alert(
            "Notification permission बंद आहे. Browser/App Settings मधून ते ON करा."
        );

        return;

    }


    Notification.requestPermission()
        .then(
            permission => {

                if (
                    permission !==
                    "granted"
                ) {

                    const settings =
                        getSettings();


                    settings.expenseReminder =
                        false;


                    saveSettings(
                        settings
                    );


                    const checkbox =
                        document.getElementById(
                            "expenseReminder"
                        );


                    if (checkbox) {

                        checkbox.checked =
                            false;

                    }


                    updateReminderStatus();

                }

            }
        )

        .catch(
            error => {

                console.error(
                    "Notification Permission Error:",
                    error
                );

            }
        );

}



/* =========================================================
   DATA SUMMARY
========================================================= */

function updateDataSummary() {

    const transactions =
        getStorageArray(
            TRANSACTIONS_KEY
        );


    const accounts =
        getStorageArray(
            ACCOUNTS_KEY
        );


    const budgets =
        getStorageObject(
            BUDGETS_KEY
        );


    setElementText(

        "transactionCount",

        transactions.length

    );


    setElementText(

        "accountCount",

        accounts.length

    );


    setElementText(

        "budgetCount",

        Object.keys(
            budgets
        ).length

    );

}



/* =========================================================
   STORAGE ARRAY
========================================================= */

function getStorageArray(
    key
) {

    try {

        const stored =
            localStorage.getItem(
                key
            );


        if (!stored) {

            return [];

        }


        const parsed =
            JSON.parse(
                stored
            );


        return Array.isArray(
            parsed
        )
            ? parsed
            : [];

    }

    catch {

        return [];

    }

}



/* =========================================================
   STORAGE OBJECT
========================================================= */

function getStorageObject(
    key
) {

    try {

        const stored =
            localStorage.getItem(
                key
            );


        if (!stored) {

            return {};

        }


        const parsed =
            JSON.parse(
                stored
            );


        if (
            parsed &&
            typeof parsed ===
            "object" &&
            !Array.isArray(parsed)
        ) {

            return parsed;

        }


        return {};

    }

    catch {

        return {};

    }

}



/* =========================================================
   SET ELEMENT TEXT
========================================================= */

function setElementText(
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
   BACKUP
========================================================= */

function downloadBackup() {

    const backup = {

        appName:
            "रोजचा जमा खर्च अहवाल",

        version:
            "1.0",

        exportedAt:
            new Date().toISOString(),

        data: {

            transactions:
                getStorageArray(
                    TRANSACTIONS_KEY
                ),

            accounts:
                getStorageArray(
                    ACCOUNTS_KEY
                ),

            monthlyBudgets:
                getStorageObject(
                    BUDGETS_KEY
                ),

            budgetCategories:
                getStorageArray(
                    CATEGORIES_KEY
                ),

            settings:
                getSettings()

        }

    };



    const json =
        JSON.stringify(
            backup,
            null,
            2
        );


    const blob =
        new Blob(
            [
                json
            ],
            {
                type:
                    "application/json"
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


    const date =
        new Date();


    const fileDate =
        date
            .toISOString()
            .slice(
                0,
                10
            );


    link.href =
        url;


    link.download =
        `rdkh-backup-${fileDate}.json`;


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


    alert(
        "Backup successfully download झाला."
    );

}



/* =========================================================
   RESTORE BACKUP
========================================================= */

function restoreBackup(
    event
) {

    const file =
        event.target.files?.[0];


    if (!file) {

        return;

    }


    if (
        !file.name
            .toLowerCase()
            .endsWith(".json")
    ) {

        alert(
            "कृपया योग्य JSON Backup file निवडा."
        );

        return;

    }


    const reader =
        new FileReader();


    reader.onload =
        function () {

            try {

                const backup =
                    JSON.parse(
                        reader.result
                    );


                if (
                    !backup ||
                    !backup.data
                ) {

                    throw new Error(
                        "Invalid backup"
                    );

                }


                const confirmed =
                    confirm(

                        "Backup मधील Data restore करायचा आहे का?\n\n" +

                        "सध्याचा Data replace होईल."

                    );


                if (!confirmed) {

                    resetRestoreInput();

                    return;

                }



                /* -----------------------------------------
                   TRANSACTIONS
                ------------------------------------------ */

                if (
                    Array.isArray(
                        backup.data.transactions
                    )
                ) {

                    localStorage.setItem(

                        TRANSACTIONS_KEY,

                        JSON.stringify(
                            backup.data.transactions
                        )

                    );

                }



                /* -----------------------------------------
                   ACCOUNTS
                ------------------------------------------ */

                if (
                    Array.isArray(
                        backup.data.accounts
                    )
                ) {

                    localStorage.setItem(

                        ACCOUNTS_KEY,

                        JSON.stringify(
                            backup.data.accounts
                        )

                    );

                }



                /* -----------------------------------------
                   MONTHLY BUDGETS
                ------------------------------------------ */

                if (
                    backup.data.monthlyBudgets &&
                    typeof backup.data.monthlyBudgets ===
                    "object"
                ) {

                    localStorage.setItem(

                        BUDGETS_KEY,

                        JSON.stringify(
                            backup.data.monthlyBudgets
                        )

                    );

                }



                /* -----------------------------------------
                   BUDGET CATEGORIES
                ------------------------------------------ */

                if (
                    Array.isArray(
                        backup.data.budgetCategories
                    )
                ) {

                    localStorage.setItem(

                        CATEGORIES_KEY,

                        JSON.stringify(
                            backup.data.budgetCategories
                        )

                    );

                }



                /* -----------------------------------------
                   SETTINGS
                ------------------------------------------ */

                if (
                    backup.data.settings &&
                    typeof backup.data.settings ===
                    "object"
                ) {

                    localStorage.setItem(

                        SETTINGS_STORAGE_KEY,

                        JSON.stringify(
                            backup.data.settings
                        )

                    );

                }


                alert(
                    "Backup successfully restore झाला.\n\nPage reload होत आहे."
                );


                location.reload();

            }

            catch (error) {

                console.error(
                    "Restore Error:",
                    error
                );


                alert(
                    "Backup file चुकीची किंवा corrupted आहे."
                );


                resetRestoreInput();

            }

        };


    reader.readAsText(
        file
    );

}



/* =========================================================
   RESET RESTORE INPUT
========================================================= */

function resetRestoreInput() {

    const input =
        document.getElementById(
            "restoreFile"
        );


    if (input) {

        input.value =
            "";

    }

}



/* =========================================================
   CLEAR ALL DATA
========================================================= */

function clearAllData() {

    const firstConfirm =
        confirm(

            "⚠️ तुम्हाला सर्व जमा, खर्च, Accounts आणि Budget Data delete करायचा आहे का?"

        );


    if (!firstConfirm) {

        return;

    }


    const secondConfirm =
        confirm(

            "ही कृती Undo करता येणार नाही.\n\n" +
            "तुमच्याकडे Backup आहे का?"

        );


    if (!secondConfirm) {

        return;

    }



    /* -----------------------------------------------
       DELETE DATA
    ------------------------------------------------ */

    localStorage.removeItem(
        TRANSACTIONS_KEY
    );


    localStorage.removeItem(
        ACCOUNTS_KEY
    );


    localStorage.removeItem(
        BUDGETS_KEY
    );


    localStorage.removeItem(
        CATEGORIES_KEY
    );



    /*
       Settings पूर्णपणे delete न करता
       default ठेवू.
    */

    localStorage.setItem(

        SETTINGS_STORAGE_KEY,

        JSON.stringify(
            DEFAULT_SETTINGS
        )

    );



    /*
       Default accounts पुन्हा तयार करा
       जर app.js उपलब्ध असेल.
    */

    if (
        typeof initializeAccounts ===
        "function"
    ) {

        initializeAccounts();

    }


    alert(
        "सर्व Data delete झाला आहे."
    );


    location.reload();

}



/* =========================================================
   NAVIGATION
========================================================= */

function goHome() {

    window.location.href =
        "index.html";

}


function goToIncome() {

    window.location.href =
        "income.html";

}


function goToExpense() {

    window.location.href =
        "expense.html";

}


function goToAccounts() {

    window.location.href =
        "accounts.html";

}


function goToBudget() {

    window.location.href =
        "monthly-budget.html";

}


function goToTransactions() {

    window.location.href =
        "transactions.html";

}


function goToReports() {

    window.location.href =
        "reports.html";

}



/* =========================================================
   STORAGE SYNC
========================================================= */

window.addEventListener(
    "storage",
    function () {

        updateDataSummary();

        loadSettings();

    }
);
