/* =========================================================
   login.js
   रोजचा जमा खर्च अहवाल

   COMPLETE LOGIN SYSTEM

   FEATURES:
   ---------------------------------------------------------
   ✅ User ID
   ✅ Password
   ✅ Show / Hide Password
   ✅ Validation
   ✅ Wrong Login Error
   ✅ No Page Reload on Wrong Password
   ✅ Shake Animation
   ✅ Login Session
   ✅ Remember Me
   ✅ Logout
   ✅ Session Protection
========================================================= */

"use strict";


/* =========================================================
   LOGIN CONFIGURATION
========================================================= */

/*
   IMPORTANT:

   Demo Login:

   User ID  : admin
   Password : 1234

   तुमच्या आवडीचा ID / Password येथे बदलू शकता.
*/

const LOGIN_CONFIG = {

    userId:
        "admin",

    password:
        "1234",

    sessionKey:
        "rdkh_login_session",

    loginFlagKey:
        "rdkh_logged_in",

    rememberKey:
        "rdkh_remember_me"

};



/* =========================================================
   PAGE NAME
========================================================= */

const currentPage =
    window.location.pathname
        .split("/")
        .pop()
        .toLowerCase();



/* =========================================================
   DOM ELEMENTS
========================================================= */

const loginForm =
    document.getElementById(
        "loginForm"
    );


const userIdInput =
    document.getElementById(
        "userId"
    );


const passwordInput =
    document.getElementById(
        "password"
    );


const passwordToggle =
    document.getElementById(
        "passwordToggle"
    );


const rememberMe =
    document.getElementById(
        "rememberMe"
    );


const loginError =
    document.getElementById(
        "loginError"
    );


const loginErrorText =
    document.getElementById(
        "loginErrorText"
    );


const userIdError =
    document.getElementById(
        "userIdError"
    );


const passwordError =
    document.getElementById(
        "passwordError"
    );


const loginButton =
    document.getElementById(
        "loginButton"
    );


const loginButtonContent =
    document.getElementById(
        "loginButtonContent"
    );


const loginCard =
    document.querySelector(
        ".login-card"
    );


/* =========================================================
   SHOW ERROR
========================================================= */

function showLoginError(
    message
) {

    if (
        !loginError ||
        !loginErrorText
    ) {

        return;

    }


    loginErrorText.textContent =
        message;


    loginError.classList.add(
        "show"
    );

}



/* =========================================================
   HIDE ERROR
========================================================= */

function hideLoginError() {

    if (!loginError) {

        return;

    }


    loginError.classList.remove(
        "show"
    );


    if (loginErrorText) {

        loginErrorText.textContent =
            "";

    }

}



/* =========================================================
   FIELD ERRORS
========================================================= */

function clearFieldErrors() {

    if (userIdError) {

        userIdError.textContent =
            "";

    }


    if (passwordError) {

        passwordError.textContent =
            "";

    }


    document
        .querySelectorAll(
            ".input-wrapper.invalid"
        )
        .forEach(
            element => {

                element.classList.remove(
                    "invalid"
                );

            }
        );

}



/* =========================================================
   USER ID ERROR
========================================================= */

function showUserIdError(
    message
) {

    if (userIdError) {

        userIdError.textContent =
            message;

    }


    if (userIdInput) {

        const wrapper =
            userIdInput.closest(
                ".input-wrapper"
            );


        if (wrapper) {

            wrapper.classList.add(
                "invalid"
            );

        }

    }

}



/* =========================================================
   PASSWORD ERROR
========================================================= */

function showPasswordError(
    message
) {

    if (passwordError) {

        passwordError.textContent =
            message;

    }


    if (passwordInput) {

        const wrapper =
            passwordInput.closest(
                ".input-wrapper"
            );


        if (wrapper) {

            wrapper.classList.add(
                "invalid"
            );

        }

    }

}



/* =========================================================
   SHAKE LOGIN CARD
========================================================= */

function shakeLoginCard() {

    if (!loginCard) {

        return;

    }


    loginCard.classList.remove(
        "shake"
    );


    /*
       Browser ला animation पुन्हा
       सुरू करण्यासाठी reflow.
    */

    void loginCard.offsetWidth;


    loginCard.classList.add(
        "shake"
    );


    setTimeout(
        function () {

            loginCard.classList.remove(
                "shake"
            );

        },
        400
    );

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
   CHECK LOGIN SESSION
========================================================= */

function getLoginSession() {

    try {

        const session =
            localStorage.getItem(
                LOGIN_CONFIG.sessionKey
            );


        if (!session) {

            return null;

        }


        const parsed =
            JSON.parse(
                session
            );


        if (
            !parsed ||
            parsed.loggedIn !== true
        ) {

            return null;

        }


        return parsed;

    }

    catch (error) {

        console.error(
            "Login Session Read Error:",
            error
        );


        return null;

    }

}



/* =========================================================
   CHECK IF LOGGED IN
========================================================= */

function isLoggedIn() {

    const session =
        getLoginSession();


    const flag =
        localStorage.getItem(
            LOGIN_CONFIG.loginFlagKey
        );


    return (

        session !== null &&

        flag === "true"

    );

}



/* =========================================================
   CREATE LOGIN SESSION
========================================================= */

function createLoginSession(
    userId
) {

    const session = {

        loggedIn:
            true,

        isLoggedIn:
            true,

        userId:
            userId,

        loginTime:
            new Date().toISOString()

    };


    try {

        localStorage.setItem(

            LOGIN_CONFIG.sessionKey,

            JSON.stringify(
                session
            )

        );


        localStorage.setItem(

            LOGIN_CONFIG.loginFlagKey,

            "true"

        );


        return true;

    }

    catch (error) {

        console.error(
            "Create Session Error:",
            error
        );


        return false;

    }

}



/* =========================================================
   DESTROY LOGIN SESSION
========================================================= */

function destroyLoginSession() {

    try {

        localStorage.removeItem(
            LOGIN_CONFIG.sessionKey
        );


        localStorage.removeItem(
            LOGIN_CONFIG.loginFlagKey
        );


        /*
           Remember Me remove करायचे असल्यास
           खालील line वापरता येईल.

           सध्या Remember Me preference
           ठेवत आहोत.
        */

    }

    catch (error) {

        console.error(
            "Logout Error:",
            error
        );

    }

}



/* =========================================================
   LOGOUT
========================================================= */

function logoutUser() {

    destroyLoginSession();


    /*
       Login page वर redirect.
       replace वापरल्यामुळे browser history
       मध्ये protected page परत येणार नाही.
    */

    window.location.replace(
        "login.html"
    );

}


/*
   HTML onclick साठी global function.
*/

window.logoutUser =
    logoutUser;



/* =========================================================
   PROTECT LOGIN PAGE
========================================================= */

function protectLoginPage() {

    /*
       आधीच login असल्यास
       login page दाखवू नका.
    */

    if (
        isLoggedIn()
    ) {

        window.location.replace(
            "index.html"
        );

        return true;

    }


    return false;

}


/*
   फक्त login page वर execute करा.
*/

if (
    currentPage ===
    "login.html"
) {

    protectLoginPage();

}



/* =========================================================
   LOAD REMEMBER ME
========================================================= */

function loadRememberMe() {

    try {

        const remembered =
            localStorage.getItem(
                LOGIN_CONFIG.rememberKey
            );


        if (
            remembered === "true"
        ) {

            if (rememberMe) {

                rememberMe.checked =
                    true;

            }

        }

    }

    catch (error) {

        console.error(
            "Remember Me Error:",
            error
        );

    }

}


loadRememberMe();



/* =========================================================
   SAVE REMEMBER ME
========================================================= */

function saveRememberPreference() {

    try {

        if (
            rememberMe &&
            rememberMe.checked
        ) {

            localStorage.setItem(

                LOGIN_CONFIG.rememberKey,

                "true"

            );

        }

        else {

            localStorage.removeItem(

                LOGIN_CONFIG.rememberKey

            );

        }

    }

    catch (error) {

        console.error(
            "Remember Preference Error:",
            error
        );

    }

}



/* =========================================================
   INPUT EVENTS
========================================================= */

if (userIdInput) {

    userIdInput.addEventListener(
        "input",
        function () {

            hideLoginError();

            if (userIdError) {

                userIdError.textContent =
                    "";

            }


            const wrapper =
                userIdInput.closest(
                    ".input-wrapper"
                );


            if (wrapper) {

                wrapper.classList.remove(
                    "invalid"
                );

            }

        }
    );

}



if (passwordInput) {

    passwordInput.addEventListener(
        "input",
        function () {

            hideLoginError();

            if (passwordError) {

                passwordError.textContent =
                    "";

            }


            const wrapper =
                passwordInput.closest(
                    ".input-wrapper"
                );


            if (wrapper) {

                wrapper.classList.remove(
                    "invalid"
                );

            }

        }
    );

}



/* =========================================================
   LOGIN FORM
========================================================= */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        function (event) {

            /*
               IMPORTANT:

               चुकीचा password दिल्यावर
               page reload होऊ नये.

               त्यामुळे preventDefault()
               अत्यावश्यक आहे.
            */

            event.preventDefault();

            event.stopPropagation();


            hideLoginError();

            clearFieldErrors();


            const enteredId =
                userIdInput
                    ? userIdInput.value.trim()
                    : "";


            const enteredPassword =
                passwordInput
                    ? passwordInput.value
                    : "";



            /* =================================================
               EMPTY USER ID
            ================================================== */

            if (!enteredId) {

                showUserIdError(
                    "User ID आवश्यक आहे."
                );


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
            ================================================== */

            if (!enteredPassword) {

                showPasswordError(
                    "Password आवश्यक आहे."
                );


                showLoginError(
                    "कृपया Password टाका."
                );


                if (passwordInput) {

                    passwordInput.focus();

                }


                return;

            }



            /* =================================================
               LOGIN VALIDATION
            ================================================== */

            const validId =
                enteredId ===
                LOGIN_CONFIG.userId;


            const validPassword =
                enteredPassword ===
                LOGIN_CONFIG.password;



            /* =================================================
               WRONG LOGIN
            ================================================== */

            if (
                !validId ||
                !validPassword
            ) {

                /*
                   Wrong password वर
                   PAGE RELOAD नाही.
                */

                showLoginError(
                    "User ID किंवा Password चुकीचा आहे."
                );


                shakeLoginCard();


                /*
                   Password field clear.
                */

                if (passwordInput) {

                    passwordInput.value =
                        "";

                    passwordInput.focus();

                }


                return;

            }



            /* =================================================
               SUCCESS
            ================================================== */

            const sessionCreated =
                createLoginSession(
                    enteredId
                );


            if (!sessionCreated) {

                showLoginError(
                    "Login session तयार करता आली नाही. पुन्हा प्रयत्न करा."
                );

                return;

            }


            saveRememberPreference();



            /* =================================================
               DISABLE LOGIN BUTTON
            ================================================== */

            if (loginButton) {

                loginButton.disabled =
                    true;

            }


            if (loginButtonContent) {

                loginButtonContent.innerHTML =

                    '<i class="fa-solid fa-spinner fa-spin"></i>' +

                    ' Login होत आहे...';

            }



            /* =================================================
               REDIRECT
            ================================================= */

            setTimeout(
                function () {

                    window.location.replace(
                        "index.html"
                    );

                },
                300
            );

        }
    );

}



/* =========================================================
   ENTER KEY
========================================================= */

if (passwordInput) {

    passwordInput.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key ===
                "Enter"
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
   BACK BUTTON PROTECTION
========================================================= */

window.addEventListener(
    "pageshow",
    function () {

        /*
           Login page वर login झालेले असल्यास
           पुन्हा login screen दाखवू नका.
        */

        if (
            currentPage ===
            "login.html" &&
            isLoggedIn()
        ) {

            window.location.replace(
                "index.html"
            );

        }

    }
);



/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /*
           Login page असल्यास focus.
        */

        if (
            currentPage ===
            "login.html"
        ) {

            if (
                userIdInput &&
                !userIdInput.value
            ) {

                userIdInput.focus();

            }

        }

    }
);



/* =========================================================
   GLOBAL
========================================================= */

window.isLoggedIn =
    isLoggedIn;


window.getLoginSession =
    getLoginSession;


window.createLoginSession =
    createLoginSession;


window.destroyLoginSession =
    destroyLoginSession;



/* =========================================================
   CONSOLE
========================================================= */

console.log(
    "रोजचा जमा खर्च अहवाल - login.js loaded successfully."
);
