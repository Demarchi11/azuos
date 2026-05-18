(function () {
    function getToken() {
        if (!window.AzuosAuth) {
            return "";
        }

        return window.AzuosAuth.getSession().token || "";
    }

    async function request(url, options) {
        var settings = Object.assign(
            {
                method: "GET",
                headers: {},
            },
            options || {}
        );
        var headers = Object.assign({}, settings.headers || {});
        var hasJsonBody =
            settings.body &&
            typeof settings.body === "object" &&
            !(settings.body instanceof FormData);

        if (hasJsonBody) {
            headers["Content-Type"] = "application/json";
            settings.body = JSON.stringify(settings.body);
        }

        if (!settings.skipAuth) {
            var token = getToken();

            if (token) {
                headers.Authorization = "Bearer " + token;
            }
        }

        settings.headers = headers;
        delete settings.skipAuth;

        var response = await fetch(url, settings);
        var contentType = response.headers.get("content-type") || "";
        var data = null;

        if (contentType.includes("application/json")) {
            data = await response.json().catch(function () {
                return null;
            });
        } else {
            data = await response.text().catch(function () {
                return null;
            });
        }

        if (!response.ok) {
            var error = new Error(
                (data && data.message) || "Nao foi possivel concluir a solicitacao."
            );

            error.response = response;
            error.data = data;
            throw error;
        }

        return data;
    }

    function getBootstrapStatus() {
        return request("/api/auth/bootstrap-status", { skipAuth: true });
    }

    function bootstrapLeader(payload) {
        return request("/api/auth/bootstrap", {
            method: "POST",
            skipAuth: true,
            body: payload,
        });
    }

    function login(payload) {
        return request("/api/auth/login", {
            method: "POST",
            skipAuth: true,
            body: payload,
        });
    }

    function getDashboard() {
        return request("/api/dashboard/me");
    }

    function getTeamMembers() {
        return request("/api/team/members");
    }

    function createTeamMember(payload) {
        return request("/api/team/members", {
            method: "POST",
            body: payload,
        });
    }

    function createSubmission(payload) {
        return request("/api/forms/submissions", {
            method: "POST",
            body: payload,
        });
    }

    function listMySubmissions() {
        return request("/api/forms/submissions/me");
    }

    function getRanking() {
        return request("/api/ranking");
    }

    window.AzuosApi = {
        bootstrapLeader: bootstrapLeader,
        createSubmission: createSubmission,
        createTeamMember: createTeamMember,
        getBootstrapStatus: getBootstrapStatus,
        getDashboard: getDashboard,
        getRanking: getRanking,
        getTeamMembers: getTeamMembers,
        listMySubmissions: listMySubmissions,
        login: login,
        request: request,
    };
})();
