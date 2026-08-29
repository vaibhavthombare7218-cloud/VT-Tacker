/* =========================================================
   login.js
   रोजचा जमा खर्च अहवाल

   LOGIN SYSTEM
   ========================================================= */

"use strict";

/* =========================================================
   LOGIN SETTINGS
========================================================= */

const LOGIN_CONFIG = {

    userId: "admin",

    password: "1234",

    sessionKey: "rdkh_login_session",

    loginFlagKey: "rdkh_logged_in"

};


/* =========================================================
   ELEMENTS
========================================================= */

const loginForm =
    document.getElementById("loginForm");

const userIdInput =
    document.getElementById("userId");

const passwordInput =
    document.getElementById("password");

const passwordToggle =
    document.getElementById("passwordToggle");

const rememberMe =
    document.getElementById("rememberMe");

const loginError =
    document.getElementById("loginError");

const loginButton =
    document.getElementById("loginButton");


/* =========================================================
   SHOW ERROR
========================================================= */

function showLoginError(message) {

    if (!loginError) {
        return;
    }

    loginError.textContent = message;

    loginError.classList.add("show");

}


/* =========================================================
   HIDE ERROR
========================================================= */

function hideLoginError() {

    if (!loginError) {
        return;
    }

    loginError.textContent = "";

    loginError.classList.remove("show");

}


/* =========================================================
   PASSWORD SHOW / HIDE
========================================================= */

if (passwordToggle) {

    passwordToggle.addEventListener(
        "click",
        function () {

            if (!passwordInput) {
                return;
            }

            if (
                passwordInput.type ===
                "password"
            ) {

                passwordInput.type =
                    "text";

                passwordToggle.innerHTML =
                    '<i class="fa-solid fa-eye-slash"></i>';

                passwordToggle.setAttribute(
                    "aria-label",
                    "Hide Password"
                );

            }

            else {

                passwordInput.type =
                    "password";

                passwordToggle.innerHTML =
                    '<i class="fa-solid fa-eye"></i>';

                passwordToggle.setAttribute(
                    "aria-label",
                    "Show Password"
                );

            }

        }
    );

}


/* =========================================================
   INPUT ERROR CLEAR
========================================================= */

if (userIdInput) {

    userIdInput.addEventListener(
        "input",
        hideLoginError
    );

}


if (passwordInput) {

    passwordInput.addEventListener(
        "input",
        hideLoginError
    );

}


/* =========================================================
   CHECK EXISTING LOGIN
========================================================= */

function alreadyLoggedIn() {

    const session =
        localStorage.getItem(
            LOGIN_CONFIG.sessionKey
        );

    const flag =
        localStorage.getItem(
            LOGIN_CONFIG.loginFlagKey
        );

    if (
        flag === "true" &&
        session
    ) {

        try {

            const data =
                JSON.parse(session);

            if (
                data &&
                data.loggedIn === true
            ) {

                return true;

            }

        }

        catch (error) {

            console.error(
                "Session Error:",
                error
            );

        }

    }

    return false;

}


/* =========================================================
   REDIRECT IF ALREADY LOGIN
========================================================= */

if (alreadyLoggedIn()) {

    window.location.replace(
        "index.html"
    );

}


/* =========================================================
   CREATE SESSION
========================================================= */

function createLoginSession(userId) {

    const session = {

        loggedIn: true,

        userId: userId,

        loginTime:
            new Date().toISOString()

    };


    localStorage.setItem(

        LOGIN_CONFIG.sessionKey,

        JSON.stringify(session)

    );


    localStorage.setItem(

        LOGIN_CONFIG.loginFlagKey,

        "true"

    );

}


/* =========================================================
   LOGIN
========================================================= */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        function (event) {

            /*
               IMPORTANT:
               Page reload होऊ देऊ नका.
            */

            event.preventDefault();

            event.stopPropagation();


            hideLoginError();


            const enteredId =
                userIdInput
                    ? userIdInput.value.trim()
                    : "";


            const enteredPassword =
                passwordInput
                    ? passwordInput.value
                    : "";


            /* =================================================
               EMPTY ID
            ================================================= */

            if (!enteredId) {

                showLoginError(
                    "कृपया User ID टाका."
                );

                if (userIdInput) {
                    userIdInput.focus();
                }

                return;

            }


            /* =================================================
               EMPTY PASSWORD
            ================================================= */

            if (!enteredPassword) {

                showLoginError(
                    "कृपया Password टाका."
                );

                if (passwordInput) {
                    passwordInput.focus();
                }

                return;

            }


            /* =================================================
               VALIDATION
            ================================================= */

            const validId =
                enteredId ===
                LOGIN_CONFIG.userId;


            const validPassword =
                enteredPassword ===
                LOGIN_CONFIG.password;


            /* =================================================
               WRONG LOGIN
            ================================================= */

            if (
                !validId ||
                !validPassword
            ) {

                showLoginError(
                    "User ID किंवा Password चुकीचा आहे."
                );


                /*
                   Password clear करा.
                   Page reload करू नका.
                */

                if (passwordInput) {

                    passwordInput.value = "";

                    passwordInput.focus();

                }


                return;

            }


            /* =================================================
               SUCCESS
            ================================================= */

            createLoginSession(
                enteredId
            );


            /*
               Remember Me नसल्यास sessionStorage
               वापरण्याची गरज नाही.
               आपल्या app साठी localStorage session
               ठेवत आहोत.
            */


            if (loginButton) {

                loginButton.disabled =
                    true;

                loginButton.innerHTML =
                    '<i class="fa-solid fa-spinner fa-spin"></i> Login होत आहे...';

            }


            /*
               थोडा delay दिल्यामुळे UI smooth दिसतो.
            */

            setTimeout(
                function () {

                    window.location.replace(
                        "index.html"
                    );

                },
                250
            );

        }
    );

}


/* =========================================================
   LOGOUT
========================================================= */

function logoutUser() {

    try {

        localStorage.removeItem(
            LOGIN_CONFIG.sessionKey
        );

        localStorage.removeItem(
            LOGIN_CONFIG.loginFlagKey
        );

        sessionStorage.removeItem(
            LOGIN_CONFIG.sessionKey
        );

    }

    catch (error) {

        console.error(
            "Logout Error:",
            error
        );

    }


    window.location.replace(
        "login.html"
    );

}


/*
   HTML मधून onclick="logoutUser()"
   वापरता यावे म्हणून.
*/

window.logoutUser =
    logoutUser;


/* =========================================================
   ENTER KEY SUPPORT
========================================================= */

if (passwordInput) {

    passwordInput.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                if (loginForm) {

                    loginForm.requestSubmit();

                }

            }

        }
    );

}


/* =========================================================
   PAGE LOAD
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (userIdInput) {

            userIdInput.focus();

        }

    }
);
