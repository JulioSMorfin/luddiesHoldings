(function () {
    "use strict";

    function getReturnUrl() {
        var params = new URLSearchParams(window.location.search);
        var r = params.get("return");
        if (r) {
            try {
                return decodeURIComponent(r);
            } catch (e) {
                return "index.html";
            }
        }
        return "index.html";
    }

    function showAlert(id, key) {
        var el = document.getElementById(id);
        if (!el) return;
        if (key && window.LuddiesI18n && window.LuddiesI18n.t) {
            el.textContent = window.LuddiesI18n.t(key);
        }
        el.classList.remove("d-none");
    }

    function hideAlert(id) {
        var el = document.getElementById(id);
        if (el) {
            el.classList.add("d-none");
        }
    }

    document.addEventListener("DOMContentLoaded", function () {
        var reg = new URLSearchParams(window.location.search).get("registered");
        if (reg === "1") {
            var ok = document.getElementById("login-success-alert");
            if (ok) {
                if (window.LuddiesI18n && window.LuddiesI18n.t) {
                    ok.textContent = window.LuddiesI18n.t("auth_register_success");
                }
                ok.classList.remove("d-none");
            }
        }

        var form = document.getElementById("login-form");
        if (!form) return;

        form.addEventListener("submit", function (e) {
            e.preventDefault();
            hideAlert("login-error-alert");
            var email = (document.getElementById("login-email") && document.getElementById("login-email").value) || "";
            var pass = (document.getElementById("login-password") && document.getElementById("login-password").value) || "";

            if (!email.trim() || !pass) {
                showAlert("login-error-alert", "auth_error_required");
                return;
            }

            if (!window.LuddiesAuth) {
                showAlert("login-error-alert", "auth_error_generic");
                return;
            }

            var res = window.LuddiesAuth.login(email.trim(), pass);
            if (res && res.ok) {
                window.location.href = getReturnUrl();
                return;
            }
            showAlert("login-error-alert", "auth_error_invalid");
        });
    });
})();
