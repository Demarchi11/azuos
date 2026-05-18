(function () {
    function updateVisibleCards(activeFilter, searchValue) {
        const cards = window.AzuosUtils.qsa(".history-card");
        const emptyState = document.getElementById("emptyState");
        let visibleCount = 0;

        cards.forEach(function (card) {
            const level = card.getAttribute("data-level");
            const title = (card.getAttribute("data-title") || "").toLowerCase();
            const matchesFilter =
                activeFilter === "todos" || level === activeFilter;
            const matchesSearch =
                !searchValue || title.includes(searchValue.toLowerCase());
            const shouldShow = matchesFilter && matchesSearch;

            card.classList.toggle("hidden", !shouldShow);
            if (shouldShow) {
                visibleCount += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle("is-visible", visibleCount === 0);
        }
    }

    function bindFilters() {
        const buttons = window.AzuosUtils.qsa(".filter-button");
        const search = document.getElementById("searchInput");
        let activeFilter = "todos";

        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                activeFilter = button.getAttribute("data-filter") || "todos";
                buttons.forEach(function (node) {
                    node.classList.remove("is-active");
                });
                button.classList.add("is-active");
                updateVisibleCards(activeFilter, search ? search.value : "");
            });
        });

        if (search) {
            search.addEventListener("input", function () {
                updateVisibleCards(activeFilter, search.value);
            });
        }

        updateVisibleCards(activeFilter, search ? search.value : "");
    }

    function bindActions() {
        window.AzuosUtils.qsa("[data-history-action]").forEach(function (button) {
            button.addEventListener("click", function () {
                const action = button.getAttribute("data-history-action");
                const label = button.getAttribute("data-report-label") || "relatório";

                if (action === "download") {
                    window.AzuosUtils.showToast(
                        'O PDF de "' + label + '" será conectado ao backend em seguida.',
                        "info",
                        "Download"
                    );
                }

                if (action === "share") {
                    window.AzuosUtils.showToast(
                        'O compartilhamento de "' + label + '" ainda está em preparação.',
                        "warning",
                        "Compartilhar"
                    );
                }
            });
        });
    }

    function init() {
        bindFilters();
        bindActions();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
