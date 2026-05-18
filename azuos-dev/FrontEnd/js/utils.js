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
        var settings;
        var startTime;

        if (!element) {
            return;
        }

        settings = Object.assign(
            {
                duration: 1200,
                decimals: 0,
                prefix: "",
                suffix: "",
            },
            options || {}
        );
        startTime = performance.now();

        function step(now) {
            var progress = Math.min((now - startTime) / settings.duration, 1);
            var current = target * progress;

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
        var target = qs(selector);
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
        var root = ensureToastRoot();
        var toast = document.createElement("article");
        var finalTone = tone || "info";

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

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function formatDateTime(value) {
        if (!value) {
            return "--";
        }

        return new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(new Date(value));
    }

    function formatDate(value) {
        if (!value) {
            return "--";
        }

        return new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }).format(new Date(value));
    }

    function setButtonLoading(button, isLoading, text) {
        var textNode;

        if (!button) {
            return;
        }

        button.disabled = isLoading;
        textNode = button.querySelector("[data-button-text]");
        if (textNode && text) {
            textNode.textContent = isLoading ? "Salvando..." : text;
        }
    }

    window.AzuosUtils = {
        animateValue: animateValue,
        escapeHtml: escapeHtml,
        formatDate: formatDate,
        formatDateTime: formatDateTime,
        getCssVar: getCssVar,
        qsa: qsa,
        qs: qs,
        scrollToTarget: scrollToTarget,
        setButtonLoading: setButtonLoading,
        setCurrentYear: setCurrentYear,
        showToast: showToast,
    };
})();
