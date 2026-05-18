(function () {
    function createSidebarMarkup(currentPage) {
        const navigation = [
            {
                label: "Principal",
                items: [
                    {
                        href: "dashboard.html",
                        icon: "fa-gauge-high",
                        label: "Visão Geral",
                    },
                    {
                        href: "formulario.html",
                        icon: "fa-clipboard-list",
                        label: "Formulário",
                    },
                    {
                        href: "historico.html",
                        icon: "fa-clock-rotate-left",
                        label: "Histórico",
                    },
                ],
            },
            {
                label: "Gestão",
                items: [
                    {
                        href: "ranking.html",
                        icon: "fa-trophy",
                        label: "Ranking",
                    },
                    {
                        href: "equipe.html",
                        icon: "fa-users",
                        label: "Equipe",
                    },
                ],
            },
            {
                label: "Sistema",
                items: [
                    {
                        href: "notificacoes.html",
                        icon: "fa-bell",
                        label: "Notificações",
                    },
                    {
                        href: "configuracoes.html",
                        icon: "fa-gear",
                        label: "Configurações",
                    },
                ],
            },
        ];

        const navMarkup = navigation
            .map(function (group) {
                const itemsMarkup = group.items
                    .map(function (item) {
                        const activeClass =
                            item.href === currentPage ? " is-active" : "";

                        return (
                            '<a class="nav-item' +
                            activeClass +
                            '" href="' +
                            item.href +
                            '">' +
                            '<i class="fa-solid ' +
                            item.icon +
                            '"></i>' +
                            item.label +
                            "</a>"
                        );
                    })
                    .join("");

                return (
                    '<div class="sidebar__label">' +
                    group.label +
                    "</div>" +
                    itemsMarkup
                );
            })
            .join("");

        return (
            '<div class="sidebar__brand">' +
            '<a class="brand brand--compact" href="../index.html">' +
            '<img src="../assets/icons/icon.png" alt="Azuos">' +
            '<span class="brand__text">Plataforma <span>Azuos</span></span>' +
            "</a>" +
            "</div>" +
            '<nav class="sidebar__nav">' +
            navMarkup +
            "</nav>" +
            '<div class="sidebar__footer">' +
            '<div class="user-card">' +
            '<div class="user-card__avatar" id="userInitial">--</div>' +
            '<div class="user-card__meta">' +
            '<div class="user-card__name" id="userName">Carregando...</div>' +
            '<div class="user-card__role" id="userRole">...</div>' +
            "</div>" +
            "</div>" +
            '<button class="nav-item nav-item--danger" type="button" data-logout>' +
            '<i class="fa-solid fa-right-from-bracket"></i>Sair' +
            "</button>" +
            "</div>"
        );
    }

    function syncUserCard() {
        if (!window.AzuosAuth) {
            return;
        }

        const session = window.AzuosAuth.getSession();
        const nameNode = document.getElementById("userName");
        const roleNode = document.getElementById("userRole");
        const avatarNode = document.getElementById("userInitial");

        if (nameNode) {
            nameNode.textContent = session.user;
        }

        if (roleNode) {
            roleNode.textContent = session.roleLabel;
        }

        if (avatarNode) {
            avatarNode.textContent = session.initials;
        }
    }

    function mountSidebar() {
        const body = document.body;
        const sidebar = document.getElementById("sidebar");

        if (!body || body.dataset.pageType !== "app" || !sidebar) {
            return;
        }

        sidebar.innerHTML = createSidebarMarkup(body.dataset.pageFile || "");
        syncUserCard();
    }

    function toggleSidebar(force) {
        const sidebar = document.getElementById("sidebar");
        const overlay = document.getElementById("overlay");

        if (!sidebar || !overlay) {
            return;
        }

        const shouldOpen =
            typeof force === "boolean"
                ? force
                : !sidebar.classList.contains("is-open");

        sidebar.classList.toggle("is-open", shouldOpen);
        overlay.classList.toggle("is-visible", shouldOpen);
    }

    function bindDelegatedActions() {
        document.addEventListener("click", function (event) {
            const routeTrigger = event.target.closest("[data-route]");
            const scrollTrigger = event.target.closest("[data-scroll-target]");
            const logoutTrigger = event.target.closest("[data-logout]");
            const toggleTrigger = event.target.closest("[data-sidebar-toggle]");
            const closeTrigger = event.target.closest("[data-sidebar-close]");

            if (routeTrigger) {
                const href = routeTrigger.getAttribute("data-route");

                if (href) {
                    window.location.href = href;
                }
            }

            if (scrollTrigger) {
                const selector = scrollTrigger.getAttribute("data-scroll-target");

                if (selector && window.AzuosUtils) {
                    window.AzuosUtils.scrollToTarget(selector);
                }
            }

            if (logoutTrigger && window.AzuosAuth) {
                window.AzuosAuth.logout("login.html");
            }

            if (toggleTrigger) {
                toggleSidebar();
            }

            if (closeTrigger) {
                toggleSidebar(false);
            }
        });
    }

    function initReveal(rootSelector) {
        const nodes = window.AzuosUtils.qsa(rootSelector || ".reveal");

        if (!nodes.length) {
            return;
        }

        const observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12 }
        );

        nodes.forEach(function (node) {
            observer.observe(node);
        });
    }

    function updateGreeting(selector) {
        const node = document.querySelector(selector || "#greetMsg");

        if (!node || !window.AzuosAuth) {
            return;
        }

        const session = window.AzuosAuth.getSession();
        const firstName = session.user.split(" ")[0];
        node.textContent = window.AzuosAuth.getGreeting() + ", " + firstName + " 👋";
    }

    function bootstrap() {
        if (window.AzuosUtils) {
            window.AzuosUtils.setCurrentYear();
        }

        mountSidebar();
        bindDelegatedActions();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", bootstrap);
    } else {
        bootstrap();
    }

    window.AzuosUI = {
        initReveal: initReveal,
        mountSidebar: mountSidebar,
        syncUserCard: syncUserCard,
        toggleSidebar: toggleSidebar,
        updateGreeting: updateGreeting,
    };
})();
