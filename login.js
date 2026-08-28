/* =========================================================
   login.js

   रोजचा जमा खर्च अहवाल
   LOGIN / AUTHENTICATION SYSTEM
========================================================= */


/* =========================================================
   LOGIN STORAGE KEYS
========================================================= */

const LOGIN_KEYS = {

    loggedIn:
        "rdkh_logged_in",

    userId:
        "rdkh_logged_user",

    remember:
        "rdkh_remember_login"

};



/* =========================================================
   DEFAULT LOGIN

   User ID:
   vaibhav

   Password:
   1234

   हे तुम्ही नंतर बदलू शकता.
========================================================= */

const LOGIN_USER_ID =
    "vaibhav";

const LOGIN_PASSWORD =
    "1234";



/* =========================================================
   PAGE LOAD
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        checkExistingLogin();

        setupEnterKey();

    }
);



/* =========================================================
   CHECK EXISTING LOGIN
========================================================= */

function checkExistingLogin() {

    const loggedIn =
        localStorage.getItem(
            LOGIN_KEYS.loggedIn
        );


    if (
        loggedIn === "true"
    ) {

        /*
           User आधी Login असेल तर
           थेट Dashboard वर जा.
        */

        window.location.replace(
            "index.html"
        );

    }

}



/* =========================================================
   LOGIN
========================================================= */

function loginUser() {

    const userId =
        document.getElementById(
            "loginUserId"
        )?.value.trim();


    const password =
        document.getElementById(
            "loginPassword"
        )?.value;


    const remember =
        document.getElementById(
            "rememberLogin"
        )?.checked;


    const error =
        document.getElementById(
            "loginError"
        );


    if (error) {

        error.textContent = "";

    }


    /* USER ID EMPTY */

    if (!userId) {

        showLoginError(
            "कृपया User ID भरा."
        );

        return;

    }


    /* PASSWORD EMPTY */

    if (!password) {

        showLoginError(
            "कृपया Password भरा."
        );

        return;

    }


    /* CHECK LOGIN */

    if (
        userId.toLowerCase() !==
        LOGIN_USER_ID.toLowerCase() ||
        password !==
        LOGIN_PASSWORD
    ) {

        showLoginError(
            "User ID किंवा Password चुकीचा आहे."
        );

        return;

    }


    /* LOGIN SUCCESS */

    localStorage.setItem(
        LOGIN_KEYS.loggedIn,
        "true"
    );


    localStorage.setItem(
        LOGIN_KEYS.userId,
        userId
    );


    localStorage.setItem(
        LOGIN_KEYS.remember,
        remember
            ? "true"
            : "false"
    );


    /*
       Dashboard
    */

    window.location.replace(
        "index.html"
    );

}



/* =========================================================
   ERROR MESSAGE
========================================================= */

function showLoginError(
    message
) {

    const error =
        document.getElementById(
            "loginError"
        );


    if (!error) {

        return;

    }


    error.innerHTML = `

        <i class="fa-solid fa-circle-exclamation"></i>

        ${escapeLoginHTML(message)}

    `;


    error.classList.add(
        "show"
    );

}



/* =========================================================
   PASSWORD SHOW / HIDE
========================================================= */

function togglePassword() {

    const password =
        document.getElementById(
            "loginPassword"
        );


    const eye =
        document.getElementById(
            "passwordEye"
        );


    if (!password) {

        return;

    }


    if (
        password.type ===
        "password"
    ) {

        password.type =
            "text";


        if (eye) {

            eye.className =
                "fa-solid fa-eye-slash";

        }

    }

    else {

        password.type =
            "password";


        if (eye) {

            eye.className =
                "fa-solid fa-eye";

        }

    }

}



/* =========================================================
   ENTER KEY LOGIN
========================================================= */

function setupEnterKey() {

    const password =
        document.getElementById(
            "loginPassword"
        );


    const userId =
        document.getElementById(
            "loginUserId"
        );


    [userId, password]
        .forEach(
            input => {

                if (!input) {

                    return;

                }


                input.addEventListener(
                    "keydown",
                    function (event) {

                        if (
                            event.key ===
                            "Enter"
                        ) {

                            loginUser();

                        }

                    }
                );

            }
        );

}



/* =========================================================
   LOGOUT
========================================================= */

function logoutUser() {

    localStorage.removeItem(
        LOGIN_KEYS.loggedIn
    );

    localStorage.removeItem(
        LOGIN_KEYS.userId
    );

    localStorage.removeItem(
        LOGIN_KEYS.remember
    );


    window.location.replace(
        "login.html"
    );

}



/* =========================================================
   AUTH CHECK

   प्रत्येक protected page वर
   app.js मधून वापरता येईल.
========================================================= */

function isUserLoggedIn() {

    return (
        localStorage.getItem(
            LOGIN_KEYS.loggedIn
        ) === "true"
    );

}



/* =========================================================
   HTML SECURITY
========================================================= */

function escapeLoginHTML(
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
