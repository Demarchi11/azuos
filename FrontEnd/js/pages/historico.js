(function () {
    var submissions = [];
    var activeFilter = "todos";
    var searchValue = "";

    function getVisualState(submission) {
        if (submission.analysis_status === "completed" && typeof submission.score === "number") {
            if (submission.score >= 85) {
                return {
                    card: "history-card--blue",
                    score: "score-circle--blue",
                    badge: "badge badge--info",
                    label: "Acima",
                };
            }

            if (submission.score >= 65) {
                return {
                    card: "history-card--green",
                    score: "score-circle--green",
                    badge: "badge badge--success",
                    label: "Dentro",
                };
            }

            if (submission.score >= 50) {
                return {
                    card: "history-card--yellow",
                    score: "score-circle--yellow",
                    badge: "badge badge--warning",
                    label: "Abaixo",
                };
            }

            return {
                card: "history-card--red",
                score: "score-circle--red",
                badge: "badge badge--danger",
                label: "Critico",
            };
        }

        return {
            card: "history-card--pending",
            score: "score-circle--pending",
            badge: "badge badge--accent",
            label: "Pendente",
        };
    }

    function updateStats(items) {
        var pendingCount = items.filter(function (submission) {
            return submission.analysis_status === "pending";
        }).length;
        var readyCount = items.filter(function (submission) {
            return submission.analysis_status === "completed";
        }).length;

        document.getElementById("historyTotalCount").textContent = String(
            items.length
        );
        document.getElementById("historyPendingCount").textContent = String(
            pendingCount
        );
        document.getElementById("historyReadyCount").textContent = String(
            readyCount
        );
    }

    function getFilteredItems() {
        return submissions.filter(function (submission) {
            var matchesFilter =
                activeFilter === "todos" ||
                submission.analysis_status === activeFilter;
            var matchesSearch =
                !searchValue ||
                submission.section_title
                    .toLowerCase()
                    .includes(searchValue.toLowerCase());

            return matchesFilter && matchesSearch;
        });
    }

    function renderList() {
        var container = document.getElementById("historicoList");
        var emptyState = document.getElementById("emptyState");
        var items = getFilteredItems();

        if (!items.length) {
            container.innerHTML = "";
            emptyState.classList.add("is-visible");
            return;
        }

        emptyState.classList.remove("is-visible");
        container.innerHTML = items
            .map(function (submission) {
                var visual = getVisualState(submission);
                var scoreText =
                    typeof submission.score === "number"
                        ? String(submission.score)
                        : "--";

                return (
                    '<article class="panel history-card ' +
                    visual.card +
                    '">' +
                    '<div class="pdf-icon">' +
                    '<i class="fa-solid fa-server"></i>' +
                    "<span>API</span>" +
                    "</div>" +
                    '<div class="history-card__body">' +
                    '<div class="history-card__header">' +
                    "<div>" +
                    '<h2 class="history-card__title">' +
                    window.AzuosUtils.escapeHtml(submission.section_title) +
                    "</h2>" +
                    '<div class="history-meta">' +
                    "<span><i class=\"fa-regular fa-calendar\"></i>" +
                    window.AzuosUtils.formatDateTime(submission.submitted_at) +
                    "</span>" +
                    "<span><i class=\"fa-regular fa-circle-question\"></i>" +
                    submission.answered_count +
                    "/" +
                    submission.total_questions +
                    " respostas</span>" +
                    "<span><i class=\"fa-solid fa-arrows-rotate\"></i>" +
                    submission.analysis_status_label +
                    "</span>" +
                    "</div>" +
                    "</div>" +
                    '<div class="history-score">' +
                    '<div class="score-circle ' +
                    visual.score +
                    '">' +
                    scoreText +
                    "</div>" +
                    '<span class="' +
                    visual.badge +
                    '">' +
                    visual.label +
                    "</span>" +
                    "</div>" +
                    "</div>" +
                    '<div class="skill-tags">' +
                    '<span class="skill-tag skill-tag--lideranca">' +
                    window.AzuosUtils.escapeHtml(submission.section_title) +
                    "</span>" +
                    '<span class="skill-tag skill-tag--comunicacao">' +
                    submission.analysis_status_label +
                    "</span>" +
                    "</div>" +
                    '<div class="history-footer">' +
                    '<button class="action-button action-button--primary" type="button" data-history-action="details" data-report-label="' +
                    window.AzuosUtils.escapeHtml(submission.section_title) +
                    '">' +
                    '<i class="fa-solid fa-eye"></i>Ver status' +
                    "</button>" +
                    '<button class="action-button" type="button" data-history-action="download" data-report-label="' +
                    window.AzuosUtils.escapeHtml(submission.section_title) +
                    '">' +
                    '<i class="fa-solid fa-download"></i>Baixar relatorio' +
                    "</button>" +
                    '<span class="history-ai-badge"><i class="fa-solid fa-robot"></i>' +
                    submission.analysis_status_label +
                    "</span>" +
                    "</div>" +
                    "</div>" +
                    "</article>"
                );
            })
            .join("");
    }

    function bindFilters() {
        var buttons = window.AzuosUtils.qsa(".filter-button");
        var search = document.getElementById("searchInput");

        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                activeFilter = button.getAttribute("data-filter") || "todos";
                buttons.forEach(function (node) {
                    node.classList.remove("is-active");
                });
                button.classList.add("is-active");
                renderList();
            });
        });

        if (search) {
            search.addEventListener("input", function () {
                searchValue = search.value.trim();
                renderList();
            });
        }
    }

    function bindActions() {
        document.addEventListener("click", function (event) {
            var button = event.target.closest("[data-history-action]");
            var action;
            var label;

            if (!button) {
                return;
            }

            action = button.getAttribute("data-history-action");
            label = button.getAttribute("data-report-label") || "envio";

            if (action === "details") {
                window.AzuosUtils.showToast(
                    'O status de "' +
                        label +
                        '" depende do processamento da API e da camada de analise.',
                    "info",
                    "Historico"
                );
            }

            if (action === "download") {
                window.AzuosUtils.showToast(
                    'O download de "' +
                        label +
                        '" sera liberado quando o backend entregar o relatorio final.',
                    "warning",
                    "Relatorio"
                );
            }
        });
    }

    async function init() {
        bindFilters();
        bindActions();

        try {
            var data = await window.AzuosApi.listMySubmissions();
            submissions = data.items || [];
            updateStats(submissions);
            renderList();
        } catch (error) {
            window.AzuosUtils.showToast(
                error.message || "Nao foi possivel carregar o historico.",
                "danger",
                "Historico"
            );
            submissions = [];
            updateStats(submissions);
            renderList();
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
