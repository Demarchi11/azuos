(function () {
    const employees = [
        { name: "Ana Costa", initials: "AC", dept: "Vendas", score: 94 },
        { name: "Bruno Martins", initials: "BM", dept: "TI", score: 87 },
        { name: "Carla Souza", initials: "CS", dept: "RH", score: 82 },
        { name: "Diego Lima", initials: "DL", dept: "Vendas", score: 76 },
        { name: "Eduarda Pereira", initials: "EP", dept: "Marketing", score: 71 },
        { name: "Felipe Rocha", initials: "FR", dept: "TI", score: 65 },
        { name: "Gabriela Nunes", initials: "GN", dept: "RH", score: 60 },
        { name: "Henrique Dias", initials: "HD", dept: "Marketing", score: 54 },
        { name: "Isabela Ferreira", initials: "IF", dept: "Financeiro", score: 49 },
        { name: "João Almeida", initials: "JA", dept: "Financeiro", score: 42 },
    ];

    function getStatus(score) {
        if (score >= 85) {
            return "acima";
        }

        if (score >= 65) {
            return "dentro";
        }

        if (score >= 50) {
            return "abaixo";
        }

        return "critico";
    }

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
                    label: "Crítico",
                    color: window.AzuosUtils.getCssVar("--color-level-critico"),
                    badgeClass: "badge--danger",
                },
            },
        };
    }

    function initFilters() {
        const select = document.getElementById("filterDept");
        const departments = Array.from(
            new Set(
                employees.map(function (item) {
                    return item.dept;
                })
            )
        ).sort();

        departments.forEach(function (dept) {
            const option = document.createElement("option");
            option.value = dept;
            option.textContent = dept;
            select.appendChild(option);
        });
    }

    function renderPodium(list, theme) {
        const podium = document.getElementById("podium");
        const top3 = list.slice(0, 3);

        if (!podium) {
            return;
        }

        if (!top3.length) {
            podium.innerHTML = '<p class="ranking-empty">Nenhum colaborador encontrado.</p>';
            return;
        }

        const visualOrder = [];

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
                const position = list.indexOf(employee) + 1;
                const classes =
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
                    employee.name.split(" ")[0] +
                    "</p>" +
                    '<div class="podium-score">' +
                    employee.score +
                    "</div>" +
                    '<div class="podium-base">' +
                    position +
                    "º</div>" +
                    "</div>"
                );
            })
            .join("");
    }

    function renderTable(list, theme) {
        const tbody = document.getElementById("tbody");

        if (!tbody) {
            return;
        }

        if (!list.length) {
            tbody.innerHTML =
                '<tr><td colspan="6" class="ranking-empty">Nenhum colaborador corresponde aos filtros selecionados.</td></tr>';
            return;
        }

        tbody.innerHTML = list
            .map(function (employee, index) {
                const statusKey = employee.statusKey;
                const status = theme.statusData[statusKey];
                const avatarColor =
                    theme.avatarColors[index % theme.avatarColors.length];

                return (
                    "<tr>" +
                    '<td class="rank-number' +
                    (index < 3 ? " rank-number--top" : "") +
                    '">' +
                    (index + 1) +
                    "º</td>" +
                    "<td>" +
                    '<div class="employee-info">' +
                    '<div class="avatar-small" style="background:' +
                    avatarColor +
                    '">' +
                    employee.initials +
                    "</div>" +
                    "<div>" +
                    '<div class="employee-name">' +
                    employee.name +
                    "</div>" +
                    '<div class="employee-dept-mobile show-mobile">' +
                    employee.dept +
                    "</div>" +
                    "</div>" +
                    "</div>" +
                    "</td>" +
                    '<td class="hide-mobile"><span class="employee-dept">' +
                    employee.dept +
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
        const department = document.getElementById("filterDept").value;
        const status = document.getElementById("filterStatus").value;
        const order = document.getElementById("filterOrder").value;
        const theme = getTheme();

        const list = employees
            .map(function (employee) {
                return Object.assign({}, employee, {
                    statusKey: getStatus(employee.score),
                });
            })
            .filter(function (employee) {
                return !department || employee.dept === department;
            })
            .filter(function (employee) {
                return !status || employee.statusKey === status;
            })
            .sort(function (left, right) {
                return order === "asc"
                    ? left.score - right.score
                    : right.score - left.score;
            });

        document.getElementById("tableCount").textContent =
            list.length + " funcionários encontrados";

        renderPodium(list, theme);
        renderTable(list, theme);
    }

    function init() {
        initFilters();

        ["filterDept", "filterStatus", "filterOrder"].forEach(function (id) {
            const node = document.getElementById(id);

            if (node) {
                node.addEventListener("change", render);
            }
        });

        render();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
