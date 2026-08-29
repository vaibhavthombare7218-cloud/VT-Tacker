/* =========================================================
   login.js
   रोजचा जमा खर्च अहवाल
   LOGIN SYSTEM
========================================================= */

const LOGIN_KEY = "rdkh_logged_in";
const USER_KEY = "rdkh_logged_user";


/* =========================================================
   PAGE LOAD
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    // आधीच login असेल तर dashboard
    if (localStorage.getItem(LOGIN_KEY) === "true") {

        window.location.replace("index.html");
        return;

    }

    setupLogin();

});


/* =========================================================
   LOGIN SETUP
========================================================= */

function setupLogin() {

    const userInput =
        document.getElementById("loginUserId");

    const passwordInput =
        document.getElementById("loginPassword");


    if (userInput) {

        userInput.addEventListener(
            "keydown",
            function (event) {

                if (event.key === "Enter") {

                    loginUser();

                }

            }
        );

    }


    if (passwordInput) {

        passwordInput.addEventListener(
            "keydown",
            function (event) {

                if (event.key === "Enter") {

                    loginUser();

                }

            }
        );

    }

}


/* =========================================================
   LOGIN
========================================================= */

function loginUser() {

    const userInput =
        document.getElementById("loginUserId");

    const passwordInput =
        document.getElementById("loginPassword");


    const userId =
        userInput
            ? userInput.value.trim()
            : "";


    const password =
        passwordInput
            ? passwordInput.value
            : "";


    /* Clear previous error */

    hideLoginError();


    /* Validate */

    if (!userId) {

        showLoginError(
            "कृपया User ID भरा."
        );

        userInput?.focus();

        return;

    }


    if (!password) {

        showLoginError(
            "कृपया Password भरा."
        );

        passwordInput?.focus();

        return;

    }


    /* =====================================================
       LOGIN CREDENTIALS
    ===================================================== */

    const correctUserId =
        "vaibhav";

    const correctPassword =
        "1234";


    /* =====================================================
       CHECK
    ===================================================== */

    if (
        userId.toLowerCase() !==
        correctUserId.toLowerCase()
    ) {

        showLoginError(
            "User ID चुकीचा आहे."
        );

        return;

    }


    if (
        password !==
        correctPassword
    ) {

        showLoginError(
            "Password चुकीचा आहे."
        );

        return;

    }


    /* =====================================================
       LOGIN SUCCESS
    ===================================================== */

    localStorage.setItem(
        LOGIN_KEY,
        "true"
    );


    localStorage.setItem(
        USER_KEY,
        userId
    );


    /* =====================================================
       GO TO DASHBOARD
    ===================================================== */

    window.location.replace(
        "index.html"
    );

}


/* =========================================================
   SHOW ERROR
========================================================= */

function showLoginError(message) {

    const error =
        document.getElementById(
            "loginError"
        );


    if (!error) {

        alert(message);

        return;

    }


    error.innerHTML =

        '<i class="fa-solid fa-circle-exclamation"></i> ' +
        escapeLoginHTML(message);


    error.style.display =
        "block";

}


/* =========================================================
   HIDE ERROR
========================================================= */

function hideLoginError() {

    const error =
        document.getElementById(
            "loginError"
        );


    if (error) {

        error.innerHTML = "";

        error.style.display =
            "none";

    }

}


/* =========================================================
   SHOW / HIDE PASSWORD
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
   LOGOUT
========================================================= */

function logoutUser() {

    localStorage.removeItem(
        LOGIN_KEY
    );

    localStorage.removeItem(
        USER_KEY
    );


    window.location.replace(
        "login.html"
    );

}


/* =========================================================
   CHECK LOGIN
========================================================= */

function isUserLoggedIn() {

    return (
        localStorage.getItem(
            LOGIN_KEY
        ) === "true"
    );

}


/* =========================================================
   HTML SECURITY
========================================================= */

function escapeLoginHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}
