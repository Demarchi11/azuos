(function () {
    function setLoading(prefix, isLoading, idleText, loadingText) {
        var button = document.getElementById(prefix + "Button");
        var spinner = document.getElementById(prefix + "Spinner");
        var text = document.getElementById(prefix + "ButtonText");
        var arrow = document.getElementById(prefix + "Arrow");

        if (!button || !spinner || !text || !arrow) {
            return;
        }

        button.disabled = isLoading;
        spinner.classList.toggle("is-visible", isLoading);
        text.textContent = isLoading ? loadingText : idleText;
        arrow.classList.toggle("hidden", isLoading);
    }

    function showError(message) {
        var banner = document.getElementById("loginError");
        var text = document.getElementById("loginErrorText");

        if (!banner || !text) {
            return;
        }

        text.textContent = message;
        banner.classList.add("is-visible");
    }

    function clearError() {
        var banner = document.getElementById("loginError");
        var wrappers = window.AzuosUtils.qsa(".input-shell");

        if (banner) {
            banner.classList.remove("is-visible");
        }

        wrappers.forEach(function (wrapper) {
            wrapper.classList.remove("is-error");
        });
    }

    function markError(id) {
        var input = document.getElementById(id);
        if (!input || !input.parentElement) {
            return;
        }

        input.parentElement.classList.add("is-error");
    }

    function toggleBootstrapMode(enabled) {
        var loginForm = document.getElementById("loginForm");
        var bootstrapForm = document.getElementById("bootstrapForm");
        var info = document.getElementById("bootstrapInfo");
        var title = document.getElementById("loginTitle");
        var description = document.getElementById("loginDescription");
        var modeLabel = document.getElementById("loginModeLabel");

        loginForm.classList.toggle("hidden", enabled);
        bootstrapForm.classList.toggle("hidden", !enabled);
        info.classList.toggle("hidden", !enabled);
        modeLabel.textContent = enabled ? "Primeiro acesso" : "Acesso";
        title.textContent = enabled
            ? "Criar lideranca inicial"
            : "Entrar na conta";
        description.textContent = enabled
            ? "Cadastre a primeira lideranca para liberar o fluxo de equipe e formularios."
            : "Informe suas credenciais para acessar a plataforma.";
    }

    function bindPasswordToggle() {
        var button = document.getElementById("togglePassword");
        var input = document.getElementById("password");
        var icon = document.getElementById("passwordToggleIcon");

        if (!button || !input || !icon) {
            return;
        }

        button.addEventListener("click", function () {
            var show = input.type === "password";
            input.type = show ? "text" : "password";
            icon.className = "fa-solid " + (show ? "fa-eye-slash" : "fa-eye");
        });
    }

    function bindLoginForm() {
        var form = document.getElementById("loginForm");

        if (!form) {
            return;
        }

        form.addEventListener("submit", async function (event) {
            var username = document.getElementById("username").value.trim();
            var password = document.getElementById("password").value;
            var data;

            event.preventDefault();
            clearError();

            if (!username || !password) {
                showError("Preencha usuario e senha para continuar.");

                if (!username) {
                    markError("username");
                }

                if (!password) {
                    markError("password");
                }

                return;
            }

            setLoading("login", true, "ENTRAR", "Entrando...");

            try {
                data = await window.AzuosApi.login({
                    username: username,
                    password: password,
                });
                window.AzuosAuth.saveSession({
                    token: data.token,
                    role: data.role,
                    name: data.name || username,
                });
                window.location.href = "dashboard.html";
            } catch (error) {
                showError(
                    error.message || "Nao foi possivel conectar a API agora."
                );
            } finally {
                setLoading("login", false, "ENTRAR", "Entrando...");
            }
        });
    }

    function bindBootstrapForm() {
        var form = document.getElementById("bootstrapForm");

        if (!form) {
            return;
        }

        form.addEventListener("submit", async function (event) {
            var payload = {
                name: document.getElementById("bootstrapName").value.trim(),
                username: document
                    .getElementById("bootstrapUsername")
                    .value.trim(),
                department: document
                    .getElementById("bootstrapDepartment")
                    .value.trim(),
                position: document
                    .getElementById("bootstrapPosition")
                    .value.trim(),
                password: document.getElementById("bootstrapPassword").value,
            };
            var data;

            event.preventDefault();
            clearError();

            if (!payload.name || !payload.username || !payload.password) {
                showError("Nome, usuario e senha sao obrigatorios.");

                if (!payload.name) {
                    markError("bootstrapName");
                }

                if (!payload.username) {
                    markError("bootstrapUsername");
                }

                if (!payload.password) {
                    markError("bootstrapPassword");
                }

                return;
            }

            setLoading(
                "bootstrap",
                true,
                "CRIAR LIDERANCA",
                "Criando..."
            );

            try {
                data = await window.AzuosApi.bootstrapLeader(payload);
                window.AzuosAuth.saveSession({
                    token: data.token,
                    role: data.role,
                    name: data.name || payload.name,
                });
                window.location.href = "dashboard.html";
            } catch (error) {
                showError(
                    error.message ||
                        "Nao foi possivel criar a lideranca inicial."
                );
            } finally {
                setLoading(
                    "bootstrap",
                    false,
                    "CRIAR LIDERANCA",
                    "Criando..."
                );
            }
        });
    }

    async function initMode() {
        try {
            var status = await window.AzuosApi.getBootstrapStatus();
            toggleBootstrapMode(Boolean(status.bootstrap_required));
        } catch (_error) {
            toggleBootstrapMode(false);
            showError("Nao foi possivel verificar o estado inicial da plataforma.");
        }
    }

    function init() {
        if (window.AzuosAuth && window.AzuosAuth.isAuthenticated()) {
            window.location.href = "dashboard.html";
            return;
        }

        bindPasswordToggle();
        bindLoginForm();
        bindBootstrapForm();
        initMode();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
