(function () {
    var DESKTOP_SIDEBAR_KEY = "azuos_sidebar_collapsed";

    function getNavigation(role) {
        var items = [
            {
                label: "Principal",
                items: [
                    {
                        href: "dashboard.html",
                        icon: "fa-gauge-high",
                        label: "Visao geral",
                    },
                    {
                        href: "formulario.html",
                        icon: "fa-clipboard-list",
                        label: "Formularios",
                    },
                    {
                        href: "historico.html",
                        icon: "fa-clock-rotate-left",
                        label: "Historico",
                    },
                ],
            },
            {
                label: "Gestao",
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
                        label: "Notificacoes",
                    },
                    {
                        href: "configuracoes.html",
                        icon: "fa-gear",
                        label: "Configuracoes",
                    },
                ],
            },
        ];

        if (role !== "lider") {
            items[1].items = items[1].items.filter(function (item) {
                return item.href === "ranking.html" || item.href === "equipe.html";
            });
        }

        return items;
    }

    function createSidebarMarkup(currentPage) {
        var session = window.AzuosAuth ? window.AzuosAuth.getSession() : null;
        var navigation = getNavigation(session ? session.role : "funcionario");
        var navMarkup = navigation
            .map(function (group) {
                var itemsMarkup = group.items
                    .map(function (item) {
                        var activeClass =
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

        var session = window.AzuosAuth.getSession();
        var nameNode = document.getElementById("userName");
        var roleNode = document.getElementById("userRole");
        var avatarNode = document.getElementById("userInitial");

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
        var body = document.body;
        var sidebar = document.getElementById("sidebar");

        if (!body || body.dataset.pageType !== "app" || !sidebar) {
            return;
        }

        sidebar.innerHTML = createSidebarMarkup(body.dataset.pageFile || "");
        syncUserCard();
    }

    function getDesktopSidebarPreference() {
        return localStorage.getItem(DESKTOP_SIDEBAR_KEY) === "true";
    }

    function setDesktopSidebarCollapsed(collapsed, persist) {
        if (!document.body || document.body.dataset.pageType !== "app") {
            return;
        }

        document.body.classList.toggle("is-sidebar-collapsed", collapsed);

        if (persist !== false) {
            localStorage.setItem(
                DESKTOP_SIDEBAR_KEY,
                collapsed ? "true" : "false"
            );
        }

        syncDesktopSidebarToggle();
    }

    function syncDesktopSidebarToggle() {
        var button = document.querySelector("[data-desktop-sidebar-toggle]");
        if (!button) {
            return;
        }

        var isCollapsed = document.body.classList.contains(
            "is-sidebar-collapsed"
        );
        var icon = button.querySelector("i");
        var text = button.querySelector("[data-toggle-label]");

        button.setAttribute("aria-pressed", isCollapsed ? "true" : "false");
        button.setAttribute(
            "aria-label",
            isCollapsed ? "Mostrar menu" : "Ocultar menu"
        );
        button.setAttribute(
            "title",
            isCollapsed ? "Mostrar menu" : "Ocultar menu"
        );

        if (icon) {
            icon.className =
                "fa-solid " + (isCollapsed ? "fa-bars" : "fa-xmark");
        }

        if (text) {
            text.textContent = isCollapsed ? "Mostrar menu" : "Ocultar menu";
        }
    }

    function mountDesktopSidebarToggle() {
        var body = document.body;
        var topbar = document.querySelector(".topbar");
        var right;
        var button;

        if (!body || body.dataset.pageType !== "app" || !topbar) {
            return;
        }

        right = topbar.querySelector(".topbar__right");
        if (!right) {
            right = document.createElement("div");
            right.className = "topbar__right";
            topbar.appendChild(right);
        }

        if (!topbar.querySelector("[data-desktop-sidebar-toggle]")) {
            button = document.createElement("button");
            button.type = "button";
            button.className =
                "btn btn-secondary btn--sm sidebar-visibility-toggle";
            button.setAttribute("data-desktop-sidebar-toggle", "");
            button.innerHTML =
                '<i class="fa-solid fa-xmark"></i>' +
                '<span data-toggle-label>Ocultar menu</span>';
            right.prepend(button);
        }

        syncDesktopSidebarToggle();
    }

    function toggleSiteNav(force) {
        var header = document.getElementById("siteHeader");
        var toggle = document.querySelector("[data-site-nav-toggle]");
        var shouldOpen;
        var icon;

        if (!header || !toggle) {
            return;
        }

        shouldOpen =
            typeof force === "boolean"
                ? force
                : !header.classList.contains("is-menu-open");
        icon = toggle.querySelector("i");

        header.classList.toggle("is-menu-open", shouldOpen);
        document.body.classList.toggle("is-site-nav-open", shouldOpen);
        toggle.setAttribute("aria-expanded", shouldOpen ? "true" : "false");

        if (icon) {
            icon.className = "fa-solid " + (shouldOpen ? "fa-xmark" : "fa-bars");
        }
    }

    function toggleSidebar(force) {
        var sidebar = document.getElementById("sidebar");
        var overlay = document.getElementById("overlay");
        var shouldOpen;

        if (!sidebar || !overlay) {
            return;
        }

        shouldOpen =
            typeof force === "boolean"
                ? force
                : !sidebar.classList.contains("is-open");

        sidebar.classList.toggle("is-open", shouldOpen);
        overlay.classList.toggle("is-visible", shouldOpen);
        document.body.classList.toggle("is-sidebar-open", shouldOpen);
    }

    function bindDelegatedActions() {
        document.addEventListener("click", function (event) {
            var routeTrigger = event.target.closest("[data-route]");
            var scrollTrigger = event.target.closest("[data-scroll-target]");
            var logoutTrigger = event.target.closest("[data-logout]");
            var toggleTrigger = event.target.closest("[data-sidebar-toggle]");
            var closeTrigger = event.target.closest("[data-sidebar-close]");
            var sidebarLink = event.target.closest(".sidebar .nav-item[href]");
            var siteNavToggle = event.target.closest("[data-site-nav-toggle]");
            var siteNavLink = event.target.closest("#siteNav a");
            var desktopSidebarToggle = event.target.closest(
                "[data-desktop-sidebar-toggle]"
            );
            var href;
            var selector;

            if (routeTrigger) {
                href = routeTrigger.getAttribute("data-route");
                if (href) {
                    window.location.href = href;
                }
            }

            if (scrollTrigger) {
                selector = scrollTrigger.getAttribute("data-scroll-target");
                if (selector && window.AzuosUtils) {
                    window.AzuosUtils.scrollToTarget(selector);
                }
            }

            if (logoutTrigger && window.AzuosAuth) {
                window.AzuosAuth.logout("login.html");
            }

            if (siteNavToggle) {
                toggleSiteNav();
            }

            if (siteNavLink) {
                toggleSiteNav(false);
            }

            if (desktopSidebarToggle && window.innerWidth > 768) {
                setDesktopSidebarCollapsed(
                    !document.body.classList.contains("is-sidebar-collapsed")
                );
            }

            if (toggleTrigger) {
                toggleSidebar();
            }

            if (closeTrigger) {
                toggleSidebar(false);
            }

            if (sidebarLink && window.innerWidth <= 768) {
                toggleSidebar(false);
            }
        });

        document.addEventListener("keydown", function (event) {
            if (event.key !== "Escape") {
                return;
            }

            toggleSidebar(false);
            toggleSiteNav(false);
        });

        window.addEventListener("resize", function () {
            if (window.innerWidth > 768) {
                toggleSidebar(false);
                toggleSiteNav(false);
                setDesktopSidebarCollapsed(getDesktopSidebarPreference(), false);
            }
        });
    }

    function initReveal(rootSelector) {
        var nodes = window.AzuosUtils.qsa(rootSelector || ".reveal");
        if (!nodes.length) {
            return;
        }

        var observer = new IntersectionObserver(
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
        var node = document.querySelector(selector || "#greetMsg");
        var session;
        var firstName;

        if (!node || !window.AzuosAuth) {
            return;
        }

        session = window.AzuosAuth.getSession();
        firstName = session.user.split(" ")[0];
        node.textContent = window.AzuosAuth.getGreeting() + ", " + firstName;
    }

    function bootstrap() {
        if (window.AzuosUtils) {
            window.AzuosUtils.setCurrentYear();
        }

        if (
            document.body &&
            document.body.dataset.pageType === "app" &&
            window.AzuosAuth &&
            !window.AzuosAuth.requireSession("login.html")
        ) {
            return;
        }

        if (
            document.body &&
            document.body.dataset.pageType === "app" &&
            window.innerWidth > 768
        ) {
            setDesktopSidebarCollapsed(getDesktopSidebarPreference(), false);
        }

        mountSidebar();
        mountDesktopSidebarToggle();
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
        setDesktopSidebarCollapsed: setDesktopSidebarCollapsed,
        syncUserCard: syncUserCard,
        toggleSidebar: toggleSidebar,
        updateGreeting: updateGreeting,
    };
})();
