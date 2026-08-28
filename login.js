/* =========================================================
   login.js

   रोजचा जमा खर्च अहवाल
   LOGIN MANAGEMENT

   FEATURES
   ---------------------------------------------------------
   ✅ User ID + Password
   ✅ Remember Login
   ✅ Login Session
   ✅ Password Show / Hide
   ✅ Wrong Login Message
   ✅ Successful Login
   ✅ Auto Redirect
   ✅ Logout
   ========================================================= */


/* =========================================================
   LOGIN SETTINGS
========================================================= */

const LOGIN_CONFIG = {

    userId: "admin",

    password: "1234",

    sessionKey:
        "rdkh_login_session",

    rememberKey:
        "rdkh_remember_login"

};



/* =========================================================
   PAGE INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        checkExistingLogin();

        setupLoginForm();

        setupPasswordToggle();

    }
);



/* =========================================================
   CHECK EXISTING LOGIN
========================================================= */

function checkExistingLogin() {

    const session =
        localStorage.getItem(
            LOGIN_CONFIG.sessionKey
        );


    if (
        session === "true"
    ) {

        window.location.href =
            "index.html";

        return;

    }


    const remember =
        localStorage.getItem(
            LOGIN_CONFIG.rememberKey
        );


    if (
        remember === "true"
    ) {

        const userIdInput =
            document.getElementById(
                "userId"
            );


        const storedUserId =
            localStorage.getItem(
                "rdkh_user_id"
            );


        if (
            userIdInput &&
            storedUserId
        ) {

            userIdInput.value =
                storedUserId;

        }


        const checkbox =
            document.getElementById(
                "rememberLogin"
            );


        if (checkbox) {

            checkbox.checked =
                true;

        }

    }

}



/* =========================================================
   SETUP LOGIN FORM
========================================================= */

function setupLoginForm() {

    const form =
        document.getElementById(
            "loginForm"
        );


    if (!form) {

        return;

    }


    form.addEventListener(
        "submit",
        handleLogin
    );

}



/* =========================================================
   HANDLE LOGIN
========================================================= */

function handleLogin(event) {

    event.preventDefault();


    const userIdInput =
        document.getElementById(
            "userId"
        );


    const passwordInput =
        document.getElementById(
            "password"
        );


    const rememberCheckbox =
        document.getElementById(
            "rememberLogin"
        );


    if (
        !userIdInput ||
        !passwordInput
    ) {

        return;

    }


    const userId =
        userIdInput.value.trim();


    const password =
        passwordInput.value;


    const remember =
        rememberCheckbox
            ? rememberCheckbox.checked
            : false;



    /* =====================================================
       CLEAR OLD MESSAGE
    ===================================================== */

    hideLoginMessages();



    /* =====================================================
       VALIDATION
    ===================================================== */

    if (!userId) {

        showLoginError(
            "कृपया User ID टाका."
        );

        userIdInput.focus();

        return;

    }


    if (!password) {

        showLoginError(
            "कृपया Password टाका."
        );

        passwordInput.focus();

        return;

    }



    /* =====================================================
       CHECK USER ID + PASSWORD
    ===================================================== */

    if (
        userId !==
        LOGIN_CONFIG.userId ||
        password !==
        LOGIN_CONFIG.password
    ) {

        showLoginError(
            "User ID किंवा Password चुकीचा आहे."
        );


        passwordInput.value = "";


        passwordInput.focus();


        return;

    }



    /* =====================================================
       LOGIN SUCCESS
    ===================================================== */

    localStorage.setItem(
        LOGIN_CONFIG.sessionKey,
        "true"
    );


    localStorage.setItem(
        "rdkh_user_id",
        userId
    );



    /* =====================================================
       REMEMBER LOGIN
    ===================================================== */

    if (remember) {

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



    /* =====================================================
       SHOW SUCCESS
    ===================================================== */

    showLoginSuccess();



    /* =====================================================
       DISABLE BUTTON
    ===================================================== */

    const button =
        document.getElementById(
            "loginButton"
        );


    if (button) {

        button.disabled =
            true;


        button.innerHTML = `

            <i class="fa-solid fa-spinner fa-spin"></i>

            Login होत आहे...

        `;

    }



    /* =====================================================
       REDIRECT
    ===================================================== */

    setTimeout(
        function () {

            window.location.href =
                "index.html";

        },
        700
    );

}



/* =========================================================
   PASSWORD SHOW / HIDE
========================================================= */

function setupPasswordToggle() {

    const toggle =
        document.getElementById(
            "togglePassword"
        );


    const password =
        document.getElementById(
            "password"
        );


    if (
        !toggle ||
        !password
    ) {

        return;

    }


    toggle.addEventListener(
        "click",
        function () {

            if (
                password.type ===
                "password"
            ) {

                password.type =
                    "text";


                toggle.innerHTML = `

                    <i class="fa-solid fa-eye-slash"></i>

                `;


                toggle.setAttribute(
                    "aria-label",
                    "Password लपवा"
                );

            }

            else {

                password.type =
                    "password";


                toggle.innerHTML = `

                    <i class="fa-solid fa-eye"></i>

                `;


                toggle.setAttribute(
                    "aria-label",
                    "Password दाखवा"
                );

            }

        }
    );

}



/* =========================================================
   SHOW LOGIN ERROR
========================================================= */

function showLoginError(
    message
) {

    const errorBox =
        document.getElementById(
            "loginError"
        );


    const errorText =
        document.getElementById(
            "loginErrorText"
        );


    if (errorText) {

        errorText.textContent =
            message;

    }


    if (errorBox) {

        errorBox.style.display =
            "flex";

    }

}



/* =========================================================
   SHOW LOGIN SUCCESS
========================================================= */

function showLoginSuccess() {

    const successBox =
        document.getElementById(
            "loginSuccess"
        );


    if (successBox) {

        successBox.style.display =
            "flex";

    }

}



/* =========================================================
   HIDE LOGIN MESSAGES
========================================================= */

function hideLoginMessages() {

    const errorBox =
        document.getElementById(
            "loginError"
        );


    const successBox =
        document.getElementById(
            "loginSuccess"
        );


    if (errorBox) {

        errorBox.style.display =
            "none";

    }


    if (successBox) {

        successBox.style.display =
            "none";

    }

}



/* =========================================================
   CHECK LOGIN STATUS
========================================================= */

function isLoggedIn() {

    return (
        localStorage.getItem(
            LOGIN_CONFIG.sessionKey
        ) === "true"
    );

}



/* =========================================================
   LOGOUT
========================================================= */

function logout() {

    const confirmLogout =
        confirm(
            "तुम्हाला Logout करायचे आहे का?"
        );


    if (!confirmLogout) {

        return;

    }


    localStorage.removeItem(
        LOGIN_CONFIG.sessionKey
    );


    /*
       Remember Login ON असेल तर
       User ID ठेवली जाईल.
    */

    window.location.href =
        "login.html";

}



/* =========================================================
   PROTECT APP PAGES
========================================================= */

function requireLogin() {

    if (
        !isLoggedIn()
    ) {

        window.location.href =
            "login.html";

        return false;

    }


    return true;

}
