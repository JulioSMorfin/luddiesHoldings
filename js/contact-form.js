/**
 * Contact form validation and success state (runs only when #contactUsForm exists).
 */
(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {
        var form = document.getElementById("contactUsForm");
        if (!form) return;

        (function consumeCheckoutPrefill() {
            try {
                var raw = sessionStorage.getItem("luddies.contact_prefill");
                if (!raw) return;
                var d = JSON.parse(raw);
                sessionStorage.removeItem("luddies.contact_prefill");
                var n = document.getElementById("inputNombre");
                var c = document.getElementById("inputCorreo");
                var a = document.getElementById("inputAsunto");
                var m = document.getElementById("inputMensaje");
                if (d.nombre && n) n.value = d.nombre;
                if (d.correo && c) c.value = d.correo;
                if (d.asunto && a) a.value = d.asunto;
                if (d.mensaje && m) {
                    m.value = d.mensaje;
                    m.dispatchEvent(new Event("input", { bubbles: true }));
                }
            } catch (e) {
                /* ignore */
            }
        })();

        var btnSubmit = document.getElementById("btnSubmit");
        var successBanner = document.getElementById("successBanner");
        var btnNew = document.getElementById("btnNewMessage");
        var inputMensaje = document.getElementById("inputMensaje");
        var charCounter = document.getElementById("charCounterMensaje");
        var fields = Array.from(form.querySelectorAll("input, select, textarea"));

        if (!btnSubmit || !successBanner || !btnNew || !inputMensaje || !charCounter) return;

        function messagesForField(fieldId) {
            var validation = window.LuddiesI18n
                ? window.LuddiesI18n.getContactValidation()
                : {};
            return validation[fieldId] || {};
        }

        function getErrorNodes(field) {
            var container = document.getElementById(
                "error" + field.id.replace("input", "")
            );
            var text = container
                ? document.getElementById(container.id + "Text")
                : null;
            return { container: container, text: text };
        }

        function getMessage(field) {
            var cfg = messagesForField(field.id);
            if (field.validity.valueMissing) {
                return cfg.valueMissing || "This field is required.";
            }
            if (field.validity.typeMismatch) {
                return cfg.typeMismatch || "Invalid format.";
            }
            if (field.validity.tooShort) {
                return cfg.tooShort || "Value is too short.";
            }
            if (field.validity.patternMismatch) {
                return cfg.patternMismatch || "Invalid format.";
            }
            return "";
        }

        function updateField(field) {
            var valid = field.checkValidity();
            var nodes = getErrorNodes(field);
            field.classList.toggle("is-invalid", !valid);
            field.classList.toggle("is-valid", valid);
            if (nodes.container) {
                nodes.container.classList.toggle("visible", !valid);
            }
            if (nodes.text) {
                nodes.text.textContent = valid ? "" : getMessage(field);
            }
            return valid;
        }

        function resetUI() {
            fields.forEach(function (field) {
                field.classList.remove("is-valid", "is-invalid");
                var nodes = getErrorNodes(field);
                if (nodes.container) {
                    nodes.container.classList.remove("visible");
                }
                if (nodes.text) {
                    nodes.text.textContent = "";
                }
            });
            charCounter.textContent = "0 / 500";
            charCounter.classList.remove("near-limit");
        }

        inputMensaje.addEventListener("input", function () {
            var len = inputMensaje.value.length;
            charCounter.textContent = len + " / 500";
            charCounter.classList.toggle("near-limit", len >= 450);
            if (inputMensaje.classList.contains("is-invalid")) {
                updateField(inputMensaje);
            }
        });

        fields.forEach(function (field) {
            field.addEventListener("blur", function () {
                updateField(field);
            });
            field.addEventListener("input", function () {
                if (field.classList.contains("is-invalid")) {
                    updateField(field);
                }
            });
        });

        form.addEventListener("submit", function (e) {
            e.preventDefault();
            var allValid = fields.every(updateField);
            if (!allValid) {
                var firstInvalid = form.querySelector(".is-invalid");
                if (firstInvalid) {
                    firstInvalid.focus();
                }
                return;
            }

            btnSubmit.disabled = true;
            btnSubmit.classList.add("loading");

            setTimeout(function () {
                btnSubmit.disabled = false;
                btnSubmit.classList.remove("loading");
                form.style.display = "none";
                successBanner.classList.add("visible");
            }, 1400);
        });

        btnNew.addEventListener("click", function () {
            form.reset();
            resetUI();
            successBanner.classList.remove("visible");
            form.style.display = "block";
            var first = document.getElementById("inputNombre");
            if (first) {
                first.focus();
            }
        });

        document.addEventListener("luddies:lang-changed", function () {
            fields.forEach(function (field) {
                if (field.classList.contains("is-invalid")) {
                    updateField(field);
                }
            });
        });
    });
})();
