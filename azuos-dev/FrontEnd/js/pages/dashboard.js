(function () {
    function setRing(score) {
        var ring = document.getElementById("ringFill");
        var scoreNode = document.getElementById("scoreNum");
        var circumference = 2 * Math.PI * 55;
        var progress = typeof score === "number" ? Math.max(0, Math.min(score, 100)) : 0;

        if (!ring || !scoreNode) {
            return;
        }

        scoreNode.textContent = typeof score === "number" ? String(score) : "--";
        ring.style.strokeDasharray = String(circumference);
        ring.style.strokeDashoffset = String(circumference);

        window.requestAnimationFrame(function () {
            ring.style.strokeDashoffset = String(
                circumference * (1 - progress / 100)
            );
        });
    }

    function renderTags(tags) {
        var container = document.getElementById("dashboardTags");

        container.innerHTML = (tags || [])
            .map(function (tag) {
                return (
                    '<span class="chip chip--primary">' +
                    window.AzuosUtils.escapeHtml(tag) +
                    "</span>"
                );
            })
            .join("");
    }

    function getSubmissionBadge(submission) {
        if (!submission || submission.analysis_status !== "completed") {
            return '<span class="badge badge--accent">Pendente</span>';
        }

        return '<span class="badge badge--success">Pronta</span>';
    }

    function renderRecentSubmissions(items) {
        var container = document.getElementById("recentSubmissionsList");

        if (!items.length) {
            container.innerHTML =
                '<div class="list-row">' +
                '<div class="list-row__index">-</div>' +
                '<div class="list-row__body">' +
                '<div class="list-row__title">Nenhum formulario foi enviado ainda.</div>' +
                '<div class="list-row__meta">Quando houver envios, eles aparecerao aqui.</div>' +
                "</div>" +
                "</div>";
            return;
        }

        container.innerHTML = items
            .map(function (submission, index) {
                return (
                    '<div class="list-row">' +
                    '<div class="list-row__index">' +
                    (index + 1) +
                    "</div>" +
                    '<div class="list-row__body">' +
                    '<div class="list-row__title">' +
                    window.AzuosUtils.escapeHtml(submission.section_title) +
                    "</div>" +
                    '<div class="list-row__meta">' +
                    window.AzuosUtils.formatDateTime(submission.submitted_at) +
                    " · " +
                    submission.answered_count +
                    "/" +
                    submission.total_questions +
                    " respostas" +
                    "</div>" +
                    "</div>" +
                    '<div class="list-row__score">' +
                    (typeof submission.score === "number"
                        ? submission.score + " pts"
                        : "--") +
                    "</div>" +
                    getSubmissionBadge(submission) +
                    "</div>"
                );
            })
            .join("");
    }

    function renderAnalysisStatus(data) {
        var container = document.getElementById("analysisStatusList");
        var latest = data.latest_analysis;
        var items = [];

        if (latest) {
            items.push(
                '<div class="insight-box">' +
                    '<div class="insight-box__top">' +
                        '<div class="insight-box__icon"><i class="fa-solid fa-chart-simple"></i></div>' +
                        '<span class="insight-box__label">Ultima analise</span>' +
                    "</div>" +
                    '<p class="insight-box__text">' +
                        "A ultima devolutiva pronta pertence ao bloco " +
                        "<strong>" +
                        window.AzuosUtils.escapeHtml(latest.section_title) +
                        "</strong>" +
                        " e voltou com score " +
                        latest.score +
                        "." +
                    "</p>" +
                "</div>"
            );
        } else {
            items.push(
                '<div class="insight-box">' +
                    '<div class="insight-box__top">' +
                        '<div class="insight-box__icon"><i class="fa-solid fa-hourglass-half"></i></div>' +
                        '<span class="insight-box__label">Sem analise pronta</span>' +
                    "</div>" +
                    '<p class="insight-box__text">' +
                        "As respostas enviadas ficam armazenadas e aguardam o processamento do backend antes de liberar score ou texto de devolutiva." +
                    "</p>" +
                "</div>"
            );
        }

        items.push(
            '<div class="insight-box insight-box--accent">' +
                '<div class="insight-box__top">' +
                    '<div class="insight-box__icon"><i class="fa-solid fa-server"></i></div>' +
                    '<span class="insight-box__label">Fila atual</span>' +
                "</div>" +
                '<p class="insight-box__text">' +
                    data.metrics.pending_analyses +
                    " envio(s) aguardando retorno do back e " +
                    data.metrics.completed_analyses +
                    " analise(s) prontas." +
                "</p>" +
            "</div>"
        );

        container.innerHTML = items.join("");
    }

    function renderTeamSnapshot(data) {
        var container = document.getElementById("teamSnapshotList");
        var title = document.getElementById("teamPanelTitle");
        var session = window.AzuosAuth.getSession();
        var teamMembers = data.team_members || [];

        if (session.role === "lider") {
            title.textContent = "Equipe cadastrada";

            if (!teamMembers.length) {
                container.innerHTML =
                    '<div class="list-row">' +
                    '<div class="list-row__index">-</div>' +
                    '<div class="list-row__body">' +
                    '<div class="list-row__title">Nenhum funcionario cadastrado ainda.</div>' +
                    '<div class="list-row__meta">Use a pagina Equipe para criar os acessos da sua base.</div>' +
                    "</div>" +
                    "</div>";
                return;
            }

            container.innerHTML = teamMembers
                .map(function (member, index) {
                    return (
                        '<div class="list-row">' +
                        '<div class="list-row__index">' +
                        (index + 1) +
                        "</div>" +
                        '<div class="list-row__body">' +
                        '<div class="list-row__title">' +
                        window.AzuosUtils.escapeHtml(member.name) +
                        "</div>" +
                        '<div class="list-row__meta">' +
                        window.AzuosUtils.escapeHtml(
                            [member.department, member.position]
                                .filter(Boolean)
                                .join(" · ")
                        ) +
                        "</div>" +
                        "</div>" +
                        '<div class="list-row__score">' +
                        member.submission_count +
                        " envios" +
                        "</div>" +
                        getSubmissionBadge(member.latest_submission) +
                        "</div>"
                    );
                })
                .join("");
            return;
        }

        title.textContent = "Seu acesso";
        container.innerHTML =
            '<div class="list-row">' +
            '<div class="list-row__index">1</div>' +
            '<div class="list-row__body">' +
            '<div class="list-row__title">' +
            window.AzuosUtils.escapeHtml(session.user) +
            "</div>" +
            '<div class="list-row__meta">' +
            window.AzuosUtils.escapeHtml(session.roleLabel) +
            "</div>" +
            "</div>" +
            '<span class="badge badge--primary">Uso de formularios liberado</span>' +
            "</div>";
    }

    function renderNextSteps(data) {
        var container = document.getElementById("nextStepsList");
        var session = window.AzuosAuth.getSession();
        var steps = [];

        if (!data.metrics.total_submissions) {
            steps.push({
                day: "1",
                month: "Agora",
                title: "Responder o primeiro formulario",
                desc: "Inicie o fluxo principal da plataforma a partir da pagina de formularios.",
                modifier: "",
            });
        }

        if (session.role === "lider" && !data.metrics.team_members_count) {
            steps.push({
                day: "2",
                month: "Equipe",
                title: "Cadastrar funcionarios",
                desc: "Crie os acessos da sua equipe para liberar o uso dos formularios.",
                modifier: "next-item__date--primary",
            });
        }

        if (data.metrics.pending_analyses) {
            steps.push({
                day: String(data.metrics.pending_analyses),
                month: "Fila",
                title: "Aguardar retorno do backend",
                desc: "Os resultados so aparecem quando a analise for concluida no servidor.",
                modifier: "next-item__date--purple",
            });
        }

        if (!steps.length) {
            steps.push({
                day: "OK",
                month: "Fluxo",
                title: "Continuar acompanhando o historico",
                desc: "O painel ja possui atividade. Use o historico para acompanhar as proximas devolutivas.",
                modifier: "next-item__date--success",
            });
        }

        container.innerHTML = steps
            .map(function (step) {
                return (
                    '<div class="next-item">' +
                    '<div class="next-item__date ' +
                    (step.modifier || "") +
                    '">' +
                    '<span class="next-item__day">' +
                    step.day +
                    "</span>" +
                    '<span class="next-item__month">' +
                    step.month +
                    "</span>" +
                    "</div>" +
                    "<div>" +
                    '<p class="next-item__title">' +
                    step.title +
                    "</p>" +
                    '<p class="next-item__desc">' +
                    step.desc +
                    "</p>" +
                    "</div>" +
                    "</div>"
                );
            })
            .join("");
    }

    function renderMetrics(data) {
        var session = window.AzuosAuth.getSession();
        var latest = data.latest_analysis;

        document.getElementById("metricSubmissions").textContent =
            String(data.metrics.total_submissions);
        document.getElementById("metricSubmissionsMeta").textContent =
            data.metrics.total_submissions
                ? "Envios recebidos pelo servidor"
                : "Sem respostas salvas";

        document.getElementById("metricPending").textContent = String(
            data.metrics.pending_analyses
        );
        document.getElementById("metricPendingMeta").textContent =
            data.metrics.pending_analyses
                ? "Aguardando analise do backend"
                : "Nenhuma fila aberta";

        document.getElementById("metricCompleted").textContent = String(
            data.metrics.completed_analyses
        );
        document.getElementById("metricCompletedMeta").textContent =
            data.metrics.completed_analyses
                ? "Relatorios devolvidos ao front"
                : "Sem devolutiva pronta";

        document.getElementById("metricTeam").textContent =
            session.role === "lider"
                ? String(data.metrics.team_members_count)
                : session.roleLabel;
        document.getElementById("metricTeamLabel").textContent =
            session.role === "lider" ? "Equipe cadastrada" : "Seu perfil";
        document.getElementById("metricTeamMeta").textContent =
            session.role === "lider"
                ? data.metrics.team_members_count
                    ? "Funcionarios prontos para acessar"
                    : "Cadastre pessoas para iniciar"
                : "Acesso ativo na plataforma";

        if (latest && typeof latest.score === "number") {
            document.getElementById("dashboardHeroTitle").textContent =
                "Ultima analise recebida";
            document.getElementById("dashboardHeroDesc").textContent =
                "O backend ja devolveu pelo menos um resultado para sua conta. Os proximos envios continuam aguardando fila ate a analise terminar.";
            setRing(latest.score);
            renderTags([
                latest.section_title,
                latest.analysis_status_label,
                "Score " + latest.score,
            ]);
        } else {
            document.getElementById("dashboardHeroTitle").textContent =
                "Aguardando retorno do backend";
            document.getElementById("dashboardHeroDesc").textContent =
                "As respostas sao armazenadas normalmente, mas score e texto de analise so aparecem quando o servidor concluir o processamento.";
            setRing(null);
            renderTags([
                session.roleLabel,
                data.metrics.pending_analyses
                    ? "Analise pendente"
                    : "Sem analise pronta",
            ]);
        }
    }

    function showLoadError(message) {
        document.getElementById("dashboardHeroTitle").textContent =
            "Nao foi possivel carregar o painel";
        document.getElementById("dashboardHeroDesc").textContent = message;
        renderRecentSubmissions([]);
        renderAnalysisStatus({
            latest_analysis: null,
            metrics: {
                pending_analyses: 0,
                completed_analyses: 0,
            },
        });
        renderTeamSnapshot({
            team_members: [],
        });
        renderNextSteps({
            metrics: {
                total_submissions: 0,
                pending_analyses: 0,
                team_members_count: 0,
            },
        });
    }

    async function init() {
        window.AzuosUI.updateGreeting("#greetMsg");

        try {
            var data = await window.AzuosApi.getDashboard();
            renderMetrics(data);
            renderRecentSubmissions(data.recent_submissions || []);
            renderAnalysisStatus(data);
            renderTeamSnapshot(data);
            renderNextSteps(data);
        } catch (error) {
            showLoadError(
                error.message || "Confira se o backend esta respondendo."
            );
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
