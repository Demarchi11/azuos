(function () {
    async function request(url, options) {
        const response = await fetch(url, options || {});
        const contentType = response.headers.get("content-type") || "";
        let data = null;

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
            const error = new Error(
                (data && data.message) || "Não foi possível concluir a solicitação."
            );

            error.response = response;
            error.data = data;
            throw error;
        }

        return data;
    }

    function login(payload) {
        return request("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
    }

    window.AzuosApi = {
        login: login,
        request: request,
    };
})();
