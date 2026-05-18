(function () {
    function initHeaderState() {
        const header = document.getElementById("siteHeader");

        if (!header) {
            return;
        }

        function updateHeader() {
            header.classList.toggle("is-scrolled", window.scrollY > 32);
        }

        updateHeader();
        window.addEventListener("scroll", updateHeader);
    }

    function initCounters() {
        const stats = window.AzuosUtils.qsa(".stat-number[data-count]");

        if (!stats.length) {
            return;
        }

        const observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    const node = entry.target;
                    const count = Number(node.getAttribute("data-count"));
                    const suffix = node.getAttribute("data-suffix") || "";

                    window.AzuosUtils.animateValue(node, count, { suffix: suffix });
                    observer.unobserve(node);
                });
            },
            { threshold: 0.5 }
        );

        stats.forEach(function (item) {
            observer.observe(item);
        });
    }

    function initLeadForm() {
        const form = document.getElementById("contactLeadForm");

        if (!form) {
            return;
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            window.AzuosUtils.showToast(
                "Cadastro rápido em breve. Enquanto isso, você já pode entrar na plataforma.",
                "info",
                "Contato"
            );
        });
    }

    function init() {
        window.AzuosUI.initReveal();
        initHeaderState();
        initCounters();
        initLeadForm();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
