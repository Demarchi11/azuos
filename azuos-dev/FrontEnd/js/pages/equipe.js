(function () {
    function updateOverview(data) {
        var session = window.AzuosAuth.getSession();
        var members = data.members || [];
        var leader = data.leader;

        document.getElementById("teamLeaderValue").textContent = leader
            ? leader.name
            : session.user;
        document.getElementById("teamCountValue").textContent = String(
            members.length
        );
        document.getElementById("teamCountText").textContent = members.length
            ? "Base pronta para acessar formularios e alimentar o historico."
            : "Nenhuma pessoa cadastrada ainda.";
        document.getElementById("teamAccessBadge").textContent = data.can_manage
            ? "Lider"
            : "Funcionario";
        document.getElementById("teamFormText").textContent = data.can_manage
            ? "Crie usuarios da sua base com nome, login e senha inicial."
            : "Seu acesso pode responder formularios, mas o cadastro da equipe fica com a lideranca.";
        document.getElementById("teamOverviewText").textContent = data.can_manage
            ? "Os acessos cadastrados aqui passam a usar os formularios normalmente, enquanto o restante da plataforma espera o retorno real do backend."
            : "Sua equipe ja pode usar formularios. Os indicadores so aparecem quando o servidor receber e analisar os envios.";
    }

    function renderMembers(data) {
        var container = document.getElementById("teamMembersList");
        var emptyState = document.getElementById("teamEmptyState");
        var members = data.members || [];

        if (!members.length) {
            container.innerHTML = "";
            emptyState.classList.remove("hidden");
            return;
        }

        emptyState.classList.add("hidden");
        container.innerHTML = members
            .map(function (member) {
                var latest = member.latest_submission;
                var latestBadge =
                    latest && latest.analysis_status === "completed"
                        ? '<span class="badge badge--success">Analise pronta</span>'
                        : latest
                        ? '<span class="badge badge--accent">Analise pendente</span>'
                        : '<span class="badge badge--primary">Sem envio</span>';

                return (
                    '<article class="team-member-card">' +
                    '<div class="team-member-card__top">' +
                    "<div>" +
                    '<h3 class="team-member-card__name">' +
                    window.AzuosUtils.escapeHtml(member.name) +
                    "</h3>" +
                    '<p class="team-member-card__meta">' +
                    window.AzuosUtils.escapeHtml(
                        [member.username, member.department, member.position]
                            .filter(Boolean)
                            .join(" · ")
                    ) +
                    "</p>" +
                    "</div>" +
                    latestBadge +
                    "</div>" +
                    '<div class="team-member-card__status">' +
                    '<span class="badge badge--primary">' +
                    member.submission_count +
                    " envio(s)</span>" +
                    (latest
                        ? '<span class="badge badge--accent">' +
                          latest.analysis_status_label +
                          "</span>"
                        : "") +
                    "</div>" +
                    "</article>"
                );
            })
            .join("");
    }

    function toggleFormAccess(canManage) {
        document
            .getElementById("memberForm")
            .classList.toggle("hidden", !canManage);
        document
            .getElementById("memberFormLocked")
            .classList.toggle("hidden", canManage);
    }

    function clearForm() {
        [
            "memberName",
            "memberUsername",
            "memberDepartment",
            "memberPosition",
            "memberPassword",
        ].forEach(function (id) {
            document.getElementById(id).value = "";
        });
    }

    async function loadTeam() {
        var data = await window.AzuosApi.getTeamMembers();
        updateOverview(data);
        renderMembers(data);
        toggleFormAccess(Boolean(data.can_manage));
        return data;
    }

    function bindForm() {
        var form = document.getElementById("memberForm");
        var button = document.getElementById("memberSubmit");

        form.addEventListener("submit", async function (event) {
            var payload = {
                name: document.getElementById("memberName").value.trim(),
                username: document.getElementById("memberUsername").value.trim(),
                department: document
                    .getElementById("memberDepartment")
                    .value.trim(),
                position: document.getElementById("memberPosition").value.trim(),
                password: document.getElementById("memberPassword").value,
            };

            event.preventDefault();

            if (!payload.name || !payload.username || !payload.password) {
                window.AzuosUtils.showToast(
                    "Preencha nome, usuario e senha inicial para cadastrar.",
                    "warning",
                    "Equipe"
                );
                return;
            }

            window.AzuosUtils.setButtonLoading(
                button,
                true,
                "Cadastrar funcionario"
            );

            try {
                await window.AzuosApi.createTeamMember(payload);
                clearForm();
                await loadTeam();
                window.AzuosUtils.showToast(
                    "Funcionario cadastrado com sucesso.",
                    "success",
                    "Equipe"
                );
            } catch (error) {
                window.AzuosUtils.showToast(
                    error.message || "Nao foi possivel cadastrar o funcionario.",
                    "danger",
                    "Equipe"
                );
            } finally {
                window.AzuosUtils.setButtonLoading(
                    button,
                    false,
                    "Cadastrar funcionario"
                );
            }
        });
    }

    async function init() {
        bindForm();

        try {
            await loadTeam();
        } catch (error) {
            toggleFormAccess(false);
            window.AzuosUtils.showToast(
                error.message || "Nao foi possivel carregar a equipe.",
                "danger",
                "Equipe"
            );
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
