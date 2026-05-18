(function () {
    var TEAM_ROTATION_MS = 3200;
    var TEAM_HINT_IDLE =
        "Passe o mouse para iniciar. No celular, toque em qualquer nome para ver o carrossel.";
    var TEAM_HINT_RUNNING =
        "Carrossel em andamento. Passe a seta sobre o cartao para pausar.";
    var TEAM_HINT_PAUSED =
        "Carrossel pausado. Tire a seta do cartao para continuar.";
    var TEAM_HINT_TAP =
        "Carrossel em andamento. Toque no cartao para pausar ou continuar.";
    var TEAM_MEMBERS = [
        {
            name: "Gabriel Toledo",
            formation:
                "Estudante do Ensino Médio Técnico em Desenvolvimento de Sistemas",
            photo: null,
            email: null,
            github: null,
            lattes: null,
            linkedin: null,
            accent: "var(--avatar-1)",
        },
        {
            name: "João V. Demarchi",
            formation:
                "Estudante do Ensino Médio Técnico em Desenvolvimento de Sistemas",
            photo: null,
            email: null,
            github: null,
            lattes: null,
            linkedin: null,
            accent: "var(--avatar-2)",
        },
        {
            name: "Mathias Basílio",
            formation:
                "Estudante do Ensino Médio Técnico em Desenvolvimento de Sistemas",
            photo: null,
            email: null,
            github: null,
            lattes: null,
            linkedin: null,
            accent: "var(--avatar-3)",
        },
        {
            name: "Nicolas Esteves",
            formation:
                "Estudante do Ensino Médio Técnico em Desenvolvimento de Sistemas",
            photo: null,
            email: null,
            github: null,
            lattes: null,
            linkedin: null,
            accent: "var(--avatar-4)",
        },
        {
            name: "Thiago Tesch",
            formation:
                "Estudante do Ensino Médio Técnico em Desenvolvimento de Sistemas",
            photo: null,
            email: null,
            github: null,
            lattes: null,
            linkedin: null,
            accent: "var(--avatar-5)",
        },
    ];

    function initHeaderState() {
        var header = document.getElementById("siteHeader");

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
        var stats = window.AzuosUtils.qsa(".stat-number[data-count]");

        if (!stats.length) {
            return;
        }

        var observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    var node;
                    var count;
                    var suffix;

                    if (!entry.isIntersecting) {
                        return;
                    }

                    node = entry.target;
                    count = Number(node.getAttribute("data-count"));
                    suffix = node.getAttribute("data-suffix") || "";

                    window.AzuosUtils.animateValue(node, count, {
                        suffix: suffix,
                    });
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
        var form = document.getElementById("contactLeadForm");

        if (!form) {
            return;
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            window.AzuosUtils.showToast(
                "Cadastro rapido em breve. Enquanto isso, voce ja pode entrar na plataforma.",
                "info",
                "Contato"
            );
        });
    }

    function initTeamShowcase() {
        var showcase = document.getElementById("teamShowcase");
        var nameList = document.getElementById("teamNameList");
        var carousel = document.getElementById("teamCarousel");
        var avatar = document.getElementById("teamMemberAvatar");
        var counter = document.getElementById("teamMemberCounter");
        var nameNode = document.getElementById("teamMemberName");
        var formationNode = document.getElementById("teamMemberFormation");
        var detailsNode = document.getElementById("teamMemberDetails");
        var hintNode = document.getElementById("teamShowcaseHint");
        var buttons;
        var currentIndex = 0;
        var intervalId = null;
        var isActive = false;
        var isPaused = false;

        if (
            !showcase ||
            !nameList ||
            !carousel ||
            !avatar ||
            !counter ||
            !nameNode ||
            !formationNode ||
            !detailsNode
        ) {
            return;
        }

        buttons = window.AzuosUtils.qsa("[data-team-index]", showcase);

        function supportsHover() {
            return window.matchMedia("(hover: hover) and (pointer: fine)")
                .matches;
        }

        function stopRotation() {
            if (!intervalId) {
                return;
            }

            window.clearInterval(intervalId);
            intervalId = null;
        }

        function startRotation() {
            stopRotation();
            intervalId = window.setInterval(function () {
                renderMember((currentIndex + 1) % TEAM_MEMBERS.length);
            }, TEAM_ROTATION_MS);
        }

        function setHint(text) {
            if (hintNode) {
                hintNode.textContent = text;
            }
        }

        function getInitials(name) {
            return name
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map(function (part) {
                    return part.charAt(0).toUpperCase();
                })
                .join("");
        }

        function isExternalValue(value) {
            return /^https?:\/\//.test(String(value || ""));
        }

        function getEmailHref(value) {
            if (!value || value.indexOf("@") === -1) {
                return "";
            }

            return "mailto:" + value;
        }

        function renderDetail(icon, label, value, href, fallback) {
            var safeValue = window.AzuosUtils.escapeHtml(
                value || fallback || "Em atualizacao"
            );

            if (href) {
                return (
                    '<div class="team-detail">' +
                    '<i class="' +
                    icon +
                    '" aria-hidden="true"></i>' +
                    '<span class="team-detail__label">' +
                    label +
                    "</span>" +
                    '<span class="team-detail__value"><a href="' +
                    window.AzuosUtils.escapeHtml(href) +
                    '" target="_blank" rel="noreferrer">' +
                    safeValue +
                    "</a></span>" +
                    "</div>"
                );
            }

            return (
                '<div class="team-detail">' +
                '<i class="' +
                icon +
                '" aria-hidden="true"></i>' +
                '<span class="team-detail__label">' +
                label +
                "</span>" +
                '<span class="team-detail__value team-detail__value--muted">' +
                safeValue +
                "</span>" +
                "</div>"
            );
        }

        function renderMember(index) {
            var member = TEAM_MEMBERS[index];

            currentIndex = index;
            avatar.style.setProperty("--member-accent", member.accent);
            avatar.innerHTML = member.photo
                ? '<img class="team-avatar__image" src="' +
                  window.AzuosUtils.escapeHtml(member.photo) +
                  '" alt="' +
                  window.AzuosUtils.escapeHtml(member.name) +
                  '">'
                : '<span class="team-avatar__initials">' +
                  window.AzuosUtils.escapeHtml(getInitials(member.name)) +
                  "</span>";
            counter.textContent =
                String(index + 1).padStart(2, "0") +
                " / " +
                String(TEAM_MEMBERS.length).padStart(2, "0");
            nameNode.textContent = member.name;
            formationNode.innerHTML =
                '<i class="fa-solid fa-user-graduate" aria-hidden="true"></i>' +
                "<span>" +
                window.AzuosUtils.escapeHtml(member.formation) +
                "</span>";
            detailsNode.innerHTML = [
                renderDetail(
                    "fa-regular fa-envelope",
                    "Gmail",
                    member.email,
                    getEmailHref(member.email),
                    "Em atualizacao"
                ),
                renderDetail(
                    "fa-brands fa-github",
                    "GitHub",
                    member.github,
                    isExternalValue(member.github) ? member.github : "",
                    "Perfil em atualizacao"
                ),
                renderDetail(
                    "fa-regular fa-file-lines",
                    "Lattes",
                    member.lattes,
                    isExternalValue(member.lattes) ? member.lattes : "",
                    "Curriculo em atualizacao"
                ),
                renderDetail(
                    "fa-brands fa-linkedin",
                    "LinkedIn",
                    member.linkedin,
                    isExternalValue(member.linkedin) ? member.linkedin : "",
                    "Perfil em atualizacao"
                ),
            ].join("");
        }

        function activateShowcase() {
            if (!isActive) {
                showcase.classList.add("is-active");
                carousel.setAttribute("aria-hidden", "false");
                nameList.setAttribute("aria-hidden", "true");
            }

            isActive = true;
            isPaused = false;
            showcase.classList.remove("is-paused");
            setHint(supportsHover() ? TEAM_HINT_RUNNING : TEAM_HINT_TAP);
            startRotation();
        }

        function pauseRotation() {
            if (!isActive) {
                return;
            }

            isPaused = true;
            showcase.classList.add("is-paused");
            stopRotation();
            setHint(supportsHover() ? TEAM_HINT_PAUSED : TEAM_HINT_TAP);
        }

        function resumeRotation() {
            if (!isActive) {
                return;
            }

            isPaused = false;
            showcase.classList.remove("is-paused");
            setHint(supportsHover() ? TEAM_HINT_RUNNING : TEAM_HINT_TAP);
            startRotation();
        }

        function deactivateShowcase() {
            isActive = false;
            isPaused = false;
            stopRotation();
            showcase.classList.remove("is-active", "is-paused");
            carousel.setAttribute("aria-hidden", "true");
            nameList.setAttribute("aria-hidden", "false");
            setHint(TEAM_HINT_IDLE);
        }

        renderMember(currentIndex);

        showcase.addEventListener("mouseenter", function () {
            if (!supportsHover()) {
                return;
            }

            activateShowcase();
        });

        showcase.addEventListener("mouseleave", function () {
            if (!supportsHover()) {
                return;
            }

            deactivateShowcase();
        });

        carousel.addEventListener("mouseenter", function () {
            if (!supportsHover()) {
                return;
            }

            pauseRotation();
        });

        carousel.addEventListener("mouseleave", function () {
            if (!supportsHover() || !showcase.matches(":hover")) {
                return;
            }

            resumeRotation();
        });

        carousel.addEventListener("click", function () {
            if (supportsHover() || !isActive) {
                return;
            }

            if (isPaused) {
                resumeRotation();
                return;
            }

            pauseRotation();
        });

        buttons.forEach(function (button) {
            var index = Number(button.getAttribute("data-team-index"));

            button.addEventListener("mouseenter", function () {
                if (!supportsHover()) {
                    return;
                }

                renderMember(index);
            });

            button.addEventListener("focus", function () {
                renderMember(index);
                activateShowcase();
                pauseRotation();
            });

            button.addEventListener("click", function (event) {
                event.preventDefault();
                renderMember(index);
                activateShowcase();

                if (supportsHover()) {
                    pauseRotation();
                }
            });
        });

        document.addEventListener("click", function (event) {
            if (supportsHover() || !isActive || showcase.contains(event.target)) {
                return;
            }

            deactivateShowcase();
        });
    }

    function init() {
        window.AzuosUI.initReveal();
        initHeaderState();
        initCounters();
        initLeadForm();
        initTeamShowcase();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
