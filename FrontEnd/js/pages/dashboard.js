(function () {
    function initScoreRing() {
        const ring = document.getElementById("ringFill");
        const scoreNode = document.getElementById("scoreNum");

        if (!ring || !scoreNode) {
            return;
        }

        const score = Number(scoreNode.getAttribute("data-score") || scoreNode.textContent);
        const circumference = 2 * Math.PI * 55;
        const progress = Math.max(0, Math.min(score, 100));

        ring.style.strokeDasharray = String(circumference);
        ring.style.strokeDashoffset = String(circumference);

        window.requestAnimationFrame(function () {
            ring.style.strokeDashoffset = String(
                circumference * (1 - progress / 100)
            );
        });
    }

    function initProgressBars() {
        window.AzuosUtils.qsa(".progress-fill[data-progress]").forEach(function (bar) {
            const width = bar.getAttribute("data-progress") || "0";

            window.requestAnimationFrame(function () {
                bar.style.width = width + "%";
            });
        });
    }

    function init() {
        window.AzuosUI.updateGreeting("#greetMsg");
        initScoreRing();
        initProgressBars();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
