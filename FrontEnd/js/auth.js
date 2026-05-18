(function () {
    const STORAGE_KEYS = {
        token: "azuos_token",
        role: "azuos_role",
        user: "azuos_user",
    };

    const ROLE_LABELS = {
        admin: "Administrador",
        gerente: "Gerente",
        funcionario: "Funcionário",
    };

    function getRoleLabel(role) {
        return ROLE_LABELS[role] || "Usuário";
    }

    function getInitials(name) {
        return (name || "Usuário")
            .split(" ")
            .filter(function (part) {
                return part.length > 0;
            })
            .slice(0, 2)
            .map(function (part) {
                return part.charAt(0);
            })
            .join("")
            .toUpperCase();
    }

    function getSession() {
        const user = localStorage.getItem(STORAGE_KEYS.user) || "Usuário";
        const role = localStorage.getItem(STORAGE_KEYS.role) || "funcionario";
        const token = localStorage.getItem(STORAGE_KEYS.token) || "";

        return {
            user: user,
            role: role,
            token: token,
            roleLabel: getRoleLabel(role),
            initials: getInitials(user),
        };
    }

    function saveSession(data) {
        const userName = data.name || data.user || data.username || "Usuário";
        const roleName = data.role || "funcionario";

        localStorage.setItem(STORAGE_KEYS.token, data.token || "");
        localStorage.setItem(STORAGE_KEYS.role, roleName);
        localStorage.setItem(STORAGE_KEYS.user, userName);
    }

    function clearSession() {
        Object.keys(STORAGE_KEYS).forEach(function (key) {
            localStorage.removeItem(STORAGE_KEYS[key]);
        });
    }

    function getGreeting() {
        const hour = new Date().getHours();

        if (hour < 12) {
            return "Bom dia";
        }

        if (hour < 18) {
            return "Boa tarde";
        }

        return "Boa noite";
    }

    function logout(target) {
        clearSession();
        window.location.href = target || "login.html";
    }

    window.AzuosAuth = {
        clearSession: clearSession,
        getGreeting: getGreeting,
        getInitials: getInitials,
        getRoleLabel: getRoleLabel,
        getSession: getSession,
        logout: logout,
        saveSession: saveSession,
        STORAGE_KEYS: STORAGE_KEYS,
    };
})();
