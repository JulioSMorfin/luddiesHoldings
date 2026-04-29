/**
 * Infinite horizontal marquee for the team carousel (#track inside #carrusel).
 * Runs on DOMContentLoaded after about-team.js fills #track (defer order: about-team, then this file).
 */
(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {
        var track = document.getElementById("track");
        var carrusel = document.getElementById("carrusel");
        if (!track || !carrusel) return;

        var base = track.innerHTML.trim();
        if (!base) return;

        /* Una vuelta completa del equipo, duplicada para el loop infinito */
        track.innerHTML = base + base;

        /* Con pocos miembros la franja puede ser más corta que la pantalla: duplicar hasta cubrir ~2.2× el viewport */
        var guard = 0;
        while (track.scrollWidth < window.innerWidth * 2.2 && guard++ < 8) {
            track.innerHTML = track.innerHTML + track.innerHTML;
        }

        if (window.LuddiesI18n && typeof window.LuddiesI18n.applyTranslations === "function") {
            window.LuddiesI18n.applyTranslations(window.LuddiesI18n.getLang());
        }

        var baseSpeed = 0.4;
        var boostSpeed = 4.0;
        var speed = baseSpeed;
        var position = 0;

        function tick() {
            position -= speed;
            var half = track.scrollWidth / 2;

            if (position <= -half) {
                position = 0;
            } else if (position > 0) {
                position = -half;
            }
            track.style.transform = "translateX(" + position + "px)";
            requestAnimationFrame(tick);
        }

        tick();
        var btnNext = document.getElementById("btn-next");
        var btnPrev = document.getElementById("btn-prev");

        if (btnNext) {
            btnNext.addEventListener("pointerenter", function() { speed = boostSpeed; });
            btnNext.addEventListener("pointerleave", function() { speed = 0; });
        }

        if (btnPrev) {
            btnPrev.addEventListener("pointerenter", function() { speed = -boostSpeed; });
            btnPrev.addEventListener("pointerleave", function() { speed = 0; });
        }
        carrusel.addEventListener("pointerenter", function (e) {

            if (e.target.tagName !== "BUTTON") {
                speed = 0;
            }
        });

        carrusel.addEventListener("pointerleave", function () {
            speed = baseSpeed;
        });

    });
})();
