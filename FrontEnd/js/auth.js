(function () {
    var STORAGE_KEYS = {
        token: "azuos_token",
        role: "azuos_role",
        user: "azuos_user",
    };

    var ROLE_LABELS = {
        lider: "Lider",
        funcionario: "Funcionario",
        admin: "Administrador",
        gerente: "Gerente",
    };

    function getRoleLabel(role) {
        return ROLE_LABELS[role] || "Usuario";
    }

    function getInitials(name) {
        return (name || "Usuario")
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
        var user = localStorage.getItem(STORAGE_KEYS.user) || "Usuario";
        var role = localStorage.getItem(STORAGE_KEYS.role) || "funcionario";
        var token = localStorage.getItem(STORAGE_KEYS.token) || "";

        return {
            user: user,
            role: role,
            token: token,
            roleLabel: getRoleLabel(role),
            initials: getInitials(user),
        };
    }

    function isAuthenticated() {
        return Boolean(getSession().token);
    }

    function saveSession(data) {
        var userName = data.name || data.user || data.username || "Usuario";
        var roleName = data.role || "funcionario";

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
        var hour = new Date().getHours();

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

    function requireSession(target) {
        if (!isAuthenticated()) {
            window.location.href = target || "login.html";
            return false;
        }

        return true;
    }

    window.AzuosAuth = {
        clearSession: clearSession,
        getGreeting: getGreeting,
        getInitials: getInitials,
        getRoleLabel: getRoleLabel,
        getSession: getSession,
        isAuthenticated: isAuthenticated,
        logout: logout,
        requireSession: requireSession,
        saveSession: saveSession,
        STORAGE_KEYS: STORAGE_KEYS,
    };
})();
