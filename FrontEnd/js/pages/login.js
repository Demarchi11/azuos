(function () {
    function setLoading(isLoading) {
        const button = document.getElementById("loginButton");
        const spinner = document.getElementById("loginSpinner");
        const text = document.getElementById("loginButtonText");
        const arrow = document.getElementById("loginArrow");

        if (!button || !spinner || !text || !arrow) {
            return;
        }

        button.disabled = isLoading;
        spinner.classList.toggle("is-visible", isLoading);
        text.textContent = isLoading ? "Entrando..." : "ENTRAR";
        arrow.classList.toggle("hidden", isLoading);
    }

    function showError(message) {
        const banner = document.getElementById("loginError");
        const text = document.getElementById("loginErrorText");

        if (!banner || !text) {
            return;
        }

        text.textContent = message;
        banner.classList.add("is-visible");
    }

    function clearError() {
        const banner = document.getElementById("loginError");
        const wrappers = window.AzuosUtils.qsa(".input-shell");

        if (banner) {
            banner.classList.remove("is-visible");
        }

        wrappers.forEach(function (wrapper) {
            wrapper.classList.remove("is-error");
        });
    }

    function markError(id) {
        const input = document.getElementById(id);

        if (!input || !input.parentElement) {
            return;
        }

        input.parentElement.classList.add("is-error");
    }

    function bindPasswordToggle() {
        const button = document.getElementById("togglePassword");
        const input = document.getElementById("password");
        const icon = document.getElementById("passwordToggleIcon");

        if (!button || !input || !icon) {
            return;
        }

        button.addEventListener("click", function () {
            const show = input.type === "password";

            input.type = show ? "text" : "password";
            icon.className = "fa-solid " + (show ? "fa-eye-slash" : "fa-eye");
        });
    }

    function bindForm() {
        const form = document.getElementById("loginForm");

        if (!form) {
            return;
        }

        form.addEventListener("submit", async function (event) {
            event.preventDefault();
            clearError();

            const username = document.getElementById("username").value.trim();
            const password = document.getElementById("password").value;
            const remember = document.getElementById("remember").checked;

            if (!username || !password) {
                showError("Preencha todos os campos antes de continuar.");

                if (!username) {
                    markError("username");
                }

                if (!password) {
                    markError("password");
                }

                return;
            }

            setLoading(true);

            try {
                const data = await window.AzuosApi.login({
                    username: username,
                    password: password,
                    remember: remember,
                });

                window.AzuosAuth.saveSession({
                    token: data.token,
                    role: data.role,
                    name: data.name || username,
                });

                window.location.href = "dashboard.html";
            } catch (error) {
                showError(
                    error.message ||
                        "Não foi possível conectar à API no momento."
                );
            } finally {
                setLoading(false);
            }
        });
    }

    function init() {
        bindPasswordToggle();
        bindForm();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
