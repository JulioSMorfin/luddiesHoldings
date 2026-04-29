/**
 * Simulación de Pago - Luddies
 */
(function () {
    "use strict";

    var STUB_KEY = "luddies.payment_stub";
    var CART_KEY = "luddies.catalog_cart";

    function t(key) {
        return window.LuddiesI18n && window.LuddiesI18n.t ? window.LuddiesI18n.t(key) : key;
    }

    function getCartTotal() {
        try {
            var raw = sessionStorage.getItem(CART_KEY);
            var items = raw ? JSON.parse(raw) : [];
            var total = 0;

            items.forEach(function (item) {
                var priceStr = t(item.priceKey);
                // Extrae los números del string del precio (ej: "Desde $249 MXN" -> 249)
                var match = priceStr.match(/\d+/);
                if (match) {
                    total += parseInt(match[0], 10);
                }
            });
            return total;
        } catch (e) {
            return 0;
        }
    }

    // Validador de Algoritmo de Luhn
    function isValidLuhn(val) {
        var sum = 0;
        var shouldDouble = false;
        for (var i = val.length - 1; i >= 0; i--) {
            var digit = parseInt(val.charAt(i), 10);
            if (shouldDouble) {
                if ((digit *= 2) > 9) digit -= 9;
            }
            sum += digit;
            shouldDouble = !shouldDouble;
        }
        return (sum % 10) === 0;
    }

    // Validador de Fecha de Vencimiento (MM/YY)
    function isValidExpiry(val) {
        var parts = val.split("/");
        if (parts.length !== 2) return false;
        var month = parseInt(parts[0], 10);
        var year = parseInt(parts[1], 10);
        if (month < 1 || month > 12) return false;
        var now = new Date();
        var currentYear = parseInt(now.getFullYear().toString().substring(2, 4), 10);
        var currentMonth = now.getMonth() + 1;
        if (year < currentYear) return false;
        if (year === currentYear && month < currentMonth) return false;
        return true;
    }

    document.addEventListener("DOMContentLoaded", function () {
        var elEmail = document.getElementById("payment-stub-email");
        var elTotal = document.getElementById("payment-total");
        var form = document.getElementById("payment-simulation-form");
        var viewCheckout = document.getElementById("payment-checkout-view");
        var viewSuccess = document.getElementById("payment-success-view");
        var btnPay = document.getElementById("btn-simulate-pay");

        var ccInput = document.getElementById("cc-number");
        var expInput = document.getElementById("cc-exp");
        var cvcInput = document.getElementById("cc-cvc");

        // 1. Mostrar email guardado desde checkout
        try {
            var rawStub = sessionStorage.getItem(STUB_KEY);
            if (rawStub) {
                var d = JSON.parse(rawStub);
                if (d && d.email && elEmail) {
                    elEmail.textContent = d.email;
                }
            }
        } catch (e) {
            /* ignorar */
        }

        // 2. Mostrar total calculado del carrito
        function renderTotal() {
            var total = getCartTotal();
            if (elTotal) {
                elTotal.textContent = "$" + total + ".00 MXN";
            }
        }
        renderTotal();

        // 3. Formateo dinámico de campos
        if (ccInput && expInput && cvcInput) {
            ccInput.addEventListener("input", function (e) {
                var value = e.target.value.replace(/\D/g, "");
                var formattedValue = "";
                for (var i = 0; i < value.length; i++) {
                    if (i > 0 && i % 4 === 0) formattedValue += " ";
                    formattedValue += value[i];
                }
                e.target.value = formattedValue;
                ccInput.setCustomValidity(""); // Limpiar mensaje de error al escribir
            });

            expInput.addEventListener("input", function (e) {
                var value = e.target.value.replace(/\D/g, "");
                if (value.length > 2) {
                    e.target.value = value.substring(0, 2) + "/" + value.substring(2, 4);
                } else {
                    e.target.value = value;
                }
                expInput.setCustomValidity("");
            });

            cvcInput.addEventListener("input", function (e) {
                e.target.value = e.target.value.replace(/\D/g, "").substring(0, 4);
                cvcInput.setCustomValidity("");
            });
        }

        // 4. Validar y simular el proceso de pago
        if (form) {
            form.addEventListener("submit", function (e) {
                e.preventDefault();

                // Comprobaciones antes de procesar pago
                if (ccInput && expInput && cvcInput) {
                    var ccVal = ccInput.value.replace(/\s/g, "");
                    if (ccVal.length < 13 || !isValidLuhn(ccVal)) {
                        ccInput.setCustomValidity("Número de tarjeta inválido. Comprueba los dígitos.");
                        ccInput.reportValidity();
                        return;
                    }
                    if (!isValidExpiry(expInput.value)) {
                        expInput.setCustomValidity("Fecha de vencimiento inválida o expirada.");
                        expInput.reportValidity();
                        return;
                    }
                    if (cvcInput.value.length < 3) {
                        cvcInput.setCustomValidity("CVC debe tener al menos 3 dígitos.");
                        cvcInput.reportValidity();
                        return;
                    }
                }

                btnPay.classList.add("loading"); // Activar spinner

                setTimeout(function () {
                    btnPay.classList.remove("loading");
                    if (viewCheckout) viewCheckout.hidden = true;
                    if (viewSuccess) viewSuccess.hidden = false;
                    sessionStorage.removeItem(CART_KEY); // Limpiar carrito
                }, 2000); // 2 segundos de simulación
            });
        }
    });
})();