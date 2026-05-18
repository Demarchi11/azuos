(function () {
    function qs(selector, parent) {
        return (parent || document).querySelector(selector);
    }

    function qsa(selector, parent) {
        return Array.from((parent || document).querySelectorAll(selector));
    }

    function getCssVar(name) {
        return getComputedStyle(document.documentElement)
            .getPropertyValue(name)
            .trim();
    }

    function animateValue(element, target, options) {
        if (!element) {
            return;
        }

        const settings = Object.assign(
            {
                duration: 1200,
                decimals: 0,
                prefix: "",
                suffix: "",
            },
            options || {}
        );

        const startTime = performance.now();

        function step(now) {
            const progress = Math.min((now - startTime) / settings.duration, 1);
            const current = target * progress;
            element.textContent =
                settings.prefix +
                current.toFixed(settings.decimals).replace(/\.0+$/, "") +
                settings.suffix;

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        }

        requestAnimationFrame(step);
    }

    function scrollToTarget(selector) {
        const target = qs(selector);

        if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }

    function setCurrentYear() {
        qsa("[data-year]").forEach(function (node) {
            node.textContent = new Date().getFullYear();
        });
    }

    function ensureToastRoot() {
        var root = qs(".toast-root");

        if (!root) {
            root = document.createElement("div");
            root.className = "toast-root";
            document.body.appendChild(root);
        }

        return root;
    }

    function showToast(message, tone, title) {
        const root = ensureToastRoot();
        const toast = document.createElement("article");
        const finalTone = tone || "info";

        toast.className = "toast toast--" + finalTone;
        toast.innerHTML =
            '<p class="toast__title">' +
            (title || "Azuos") +
            "</p>" +
            '<p class="toast__text">' +
            message +
            "</p>";

        root.appendChild(toast);

        window.setTimeout(function () {
            toast.remove();
        }, 3600);
    }

    window.AzuosUtils = {
        animateValue: animateValue,
        getCssVar: getCssVar,
        qsa: qsa,
        qs: qs,
        scrollToTarget: scrollToTarget,
        setCurrentYear: setCurrentYear,
        showToast: showToast,
    };
})();
