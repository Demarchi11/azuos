(function () {
    var employees = [];

    function getTheme() {
        return {
            avatarColors: [
                window.AzuosUtils.getCssVar("--avatar-1"),
                window.AzuosUtils.getCssVar("--avatar-2"),
                window.AzuosUtils.getCssVar("--avatar-3"),
                window.AzuosUtils.getCssVar("--avatar-4"),
                window.AzuosUtils.getCssVar("--avatar-5"),
            ],
            statusData: {
                acima: {
                    label: "Acima da expectativa",
                    color: window.AzuosUtils.getCssVar("--color-level-acima"),
                    badgeClass: "badge--info",
                },
                dentro: {
                    label: "Dentro da expectativa",
                    color: window.AzuosUtils.getCssVar("--color-level-dentro"),
                    badgeClass: "badge--success",
                },
                abaixo: {
                    label: "Abaixo da expectativa",
                    color: window.AzuosUtils.getCssVar("--color-level-abaixo"),
                    badgeClass: "badge--warning",
                },
                critico: {
                    label: "Critico",
                    color: window.AzuosUtils.getCssVar("--color-level-critico"),
                    badgeClass: "badge--danger",
                },
            },
        };
    }

    function initFilters() {
        var select = document.getElementById("filterDept");
        var departments = Array.from(
            new Set(
                employees
                    .map(function (item) {
                        return item.dept;
                    })
                    .filter(Boolean)
            )
        ).sort();

        select.innerHTML = '<option value="">Todos os departamentos</option>';
        departments.forEach(function (dept) {
            var option = document.createElement("option");
            option.value = dept;
            option.textContent = dept;
            select.appendChild(option);
        });
    }

    function renderPodium(list, theme) {
        var podium = document.getElementById("podium");
        var top3 = list.slice(0, 3);
        var visualOrder = [];

        if (!podium) {
            return;
        }

        if (!top3.length) {
            podium.innerHTML =
                '<p class="ranking-empty">Nenhum score analisado foi recebido ainda.</p>';
            return;
        }

        if (top3[1]) {
            visualOrder.push(top3[1]);
        }

        if (top3[0]) {
            visualOrder.push(top3[0]);
        }

        if (top3[2]) {
            visualOrder.push(top3[2]);
        }

        podium.innerHTML = visualOrder
            .map(function (employee) {
                var position = list.indexOf(employee) + 1;
                var classes =
                    position === 1
                        ? "podium-item podium-item--first"
                        : position === 2
                        ? "podium-item podium-item--second"
                        : "podium-item podium-item--third";

                return (
                    '<div class="' +
                    classes +
                    '">' +
                    '<div class="podium-avatar" style="background:' +
                    theme.avatarColors[(position - 1) % theme.avatarColors.length] +
                    '">' +
                    employee.initials +
                    '<span class="podium-medal podium-medal--' +
                    position +
                    '">' +
                    position +
                    "</span>" +
                    "</div>" +
                    '<p class="podium-name">' +
                    window.AzuosUtils.escapeHtml(employee.name.split(" ")[0]) +
                    "</p>" +
                    '<div class="podium-score">' +
                    employee.score +
                    "</div>" +
                    '<div class="podium-base">' +
                    position +
                    "o</div>" +
                    "</div>"
                );
            })
            .join("");
    }

    function renderTable(list, theme) {
        var tbody = document.getElementById("tbody");

        if (!tbody) {
            return;
        }

        if (!list.length) {
            tbody.innerHTML =
                '<tr><td colspan="6" class="ranking-empty">O ranking sera preenchido quando houver analises concluidas com score.</td></tr>';
            return;
        }

        tbody.innerHTML = list
            .map(function (employee, index) {
                var status = theme.statusData[employee.status] || theme.statusData.dentro;
                var avatarColor =
                    theme.avatarColors[index % theme.avatarColors.length];

                return (
                    "<tr>" +
                    '<td class="rank-number' +
                    (index < 3 ? " rank-number--top" : "") +
                    '">' +
                    (index + 1) +
                    "o</td>" +
                    "<td>" +
                    '<div class="employee-info">' +
                    '<div class="avatar-small" style="background:' +
                    avatarColor +
                    '">' +
                    employee.initials +
                    "</div>" +
                    "<div>" +
                    '<div class="employee-name">' +
                    window.AzuosUtils.escapeHtml(employee.name) +
                    "</div>" +
                    '<div class="employee-dept-mobile show-mobile">' +
                    window.AzuosUtils.escapeHtml(employee.dept || "Sem area") +
                    "</div>" +
                    "</div>" +
                    "</div>" +
                    "</td>" +
                    '<td class="hide-mobile"><span class="employee-dept">' +
                    window.AzuosUtils.escapeHtml(employee.dept || "Sem area") +
                    "</span></td>" +
                    '<td><span class="badge ' +
                    status.badgeClass +
                    '">' +
                    status.label +
                    "</span></td>" +
                    '<td class="score-value" style="text-align:right;">' +
                    employee.score +
                    " pts</td>" +
                    '<td class="hide-mobile">' +
                    '<div class="progress-mini">' +
                    '<div class="progress-mini__bar" style="width:' +
                    employee.score +
                    "%; background:" +
                    status.color +
                    ';"></div>' +
                    "</div>" +
                    "</td>" +
                    "</tr>"
                );
            })
            .join("");
    }

    function render() {
        var department = document.getElementById("filterDept").value;
        var status = document.getElementById("filterStatus").value;
        var order = document.getElementById("filterOrder").value;
        var theme = getTheme();
        var list = employees
            .filter(function (employee) {
                return !department || employee.dept === department;
            })
            .filter(function (employee) {
                return !status || employee.status === status;
            })
            .sort(function (left, right) {
                return order === "asc"
                    ? left.score - right.score
                    : right.score - left.score;
            });

        document.getElementById("tableCount").textContent =
            list.length + " pessoa(s) com analise pronta";

        renderPodium(list, theme);
        renderTable(list, theme);
    }

    async function init() {
        ["filterDept", "filterStatus", "filterOrder"].forEach(function (id) {
            var node = document.getElementById(id);

            if (node) {
                node.addEventListener("change", render);
            }
        });

        try {
            var data = await window.AzuosApi.getRanking();
            employees = data.items || [];
            initFilters();
            render();
        } catch (error) {
            employees = [];
            initFilters();
            render();
            window.AzuosUtils.showToast(
                error.message || "Nao foi possivel carregar o ranking.",
                "danger",
                "Ranking"
            );
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
