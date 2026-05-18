(function () {
    const STORAGE_KEY = "azuos_formulario_respostas";
    const sectionMeta = [
        {
            id: "dilemas",
            title: "Dilemas industriais",
            label: "Líderes",
        },
        {
            id: "liderados",
            title: "Avaliação do líder",
            label: "Liderados",
        },
    ];

    let sections = [];
    let activeSectionIndex = 0;
    let activeQuestionIndex = 0;
    let answers = loadAnswers();

    function cleanText(value) {
        return (value || "")
            .replace(/\\\./g, ".")
            .replace(/\*\*/g, "")
            .replace(/\*/g, "")
            .replace(/\s+/g, " ")
            .trim();
    }

    function getHeadingMatches(markdown) {
        const headingRegex = /^\s*\*\*Pergunta\s+(\d+)\\?\.\s+(.+?)\*\*\s*$/gm;
        const matches = [];
        let match;

        while ((match = headingRegex.exec(markdown)) !== null) {
            matches.push({
                index: match.index,
                number: Number(match[1]),
                title: cleanText(match[2]),
                raw: match[0],
            });
        }

        return matches;
    }

    function parseOptions(block) {
        const optionRegex = /^\s*([A-D])\)\s+([\s\S]*?)(?=\n\s*[A-D]\)\s+|$)/gm;
        const options = [];
        let match;

        while ((match = optionRegex.exec(block)) !== null) {
            const rawText = match[2];
            const scoreMatch = rawText.match(/\((2|4|6|8)\)\s*(?:\(\s*RESPOSTA CORRETA\s*\))?/i);
            const score = scoreMatch ? Number(scoreMatch[1]) : 0;
            const text = scoreMatch ? rawText.slice(0, scoreMatch.index) : rawText;

            options.push({
                id: match[1],
                text: cleanText(text),
                score: score,
                isCorrect: /RESPOSTA CORRETA/i.test(rawText),
            });
        }

        return options;
    }

    function parseQuestions(markdown) {
        const normalized = markdown
            .replace(/\r\n/g, "\n")
            .replace(/\n\s*\((2|4|6|8)\)\s*([B-D])\)/g, " ($1)\n\n$2)");
        const headings = getHeadingMatches(normalized);
        const grouped = [];
        let currentSection = -1;
        let previousNumber = 0;

        headings.forEach(function (heading, index) {
            if (heading.number <= previousNumber) {
                currentSection += 1;
            }

            if (currentSection < 0) {
                currentSection = 0;
            }

            previousNumber = heading.number;

            if (!grouped[currentSection]) {
                const meta = sectionMeta[currentSection] || {
                    id: "formulario-" + (currentSection + 1),
                    title: "Formulário " + (currentSection + 1),
                    label: "Bloco " + (currentSection + 1),
                };

                grouped[currentSection] = Object.assign({ questions: [] }, meta);
            }

            const blockStart = heading.index + heading.raw.length;
            const blockEnd = headings[index + 1]
                ? headings[index + 1].index
                : normalized.length;
            const block = normalized.slice(blockStart, blockEnd);
            const firstOption = block.search(/^\s*A\)\s+/m);
            const contextChunk = firstOption >= 0 ? block.slice(0, firstOption) : block;
            const optionsChunk = firstOption >= 0 ? block.slice(firstOption) : "";
            const context = cleanText(
                contextChunk.replace(/^\s*\*\*?Contexto:\s*/i, "").replace(/^Contexto:\s*/i, "")
            );
            const options = parseOptions(optionsChunk);

            if (options.length >= 2) {
                grouped[currentSection].questions.push({
                    id: grouped[currentSection].id + "-" + heading.number,
                    number: heading.number,
                    title: heading.title,
                    context: context,
                    options: options,
                });
            }
        });

        return grouped.filter(function (section) {
            return section.questions.length > 0;
        });
    }

    function loadAnswers() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        } catch (_) {
            return {};
        }
    }

    function saveAnswers() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    }

    function getCurrentSection() {
        return sections[activeSectionIndex];
    }

    function getCurrentQuestion() {
        const section = getCurrentSection();
        return section.questions[activeQuestionIndex];
    }

    function getSectionAnswers(section) {
        if (!answers[section.id]) {
            answers[section.id] = {};
        }

        return answers[section.id];
    }

    function getAnsweredCount(section) {
        const sectionAnswers = getSectionAnswers(section);

        return section.questions.filter(function (question) {
            return Boolean(sectionAnswers[question.id]);
        }).length;
    }

    function renderTabs() {
        const tabs = document.getElementById("formTabs");

        tabs.innerHTML = sections
            .map(function (section, index) {
                return (
                    '<button class="form-tab' +
                    (index === activeSectionIndex ? " is-active" : "") +
                    '" type="button" data-section-index="' +
                    index +
                    '">' +
                    "<span>" +
                    '<span class="form-tab__title">' +
                    section.title +
                    "</span>" +
                    '<span class="text-soft">' +
                    section.label +
                    "</span>" +
                    "</span>" +
                    '<span class="form-tab__count">' +
                    section.questions.length +
                    "</span>" +
                    "</button>"
                );
            })
            .join("");
    }

    function renderMap() {
        const map = document.getElementById("questionMap");
        const section = getCurrentSection();
        const sectionAnswers = getSectionAnswers(section);

        map.innerHTML = section.questions
            .map(function (question, index) {
                const classes = [
                    "question-map__item",
                    index === activeQuestionIndex ? "is-current" : "",
                    sectionAnswers[question.id] ? "is-answered" : "",
                ]
                    .filter(Boolean)
                    .join(" ");

                return (
                    '<button class="' +
                    classes +
                    '" type="button" data-question-index="' +
                    index +
                    '" aria-label="Pergunta ' +
                    question.number +
                    '">' +
                    question.number +
                    "</button>"
                );
            })
            .join("");
    }

    function renderQuestion() {
        const section = getCurrentSection();
        const question = getCurrentQuestion();
        const sectionAnswers = getSectionAnswers(section);
        const selected = sectionAnswers[question.id] || "";
        const isLast = activeQuestionIndex === section.questions.length - 1;

        document.getElementById("sectionLabel").textContent = section.title;
        document.getElementById("questionTitle").textContent = question.title;
        document.getElementById("questionContext").textContent = question.context;
        document.getElementById("currentQuestion").textContent = String(activeQuestionIndex + 1);
        document.getElementById("currentTotal").textContent = String(section.questions.length);
        document.getElementById("previousQuestion").disabled = activeQuestionIndex === 0;
        document.getElementById("nextQuestion").classList.toggle("hidden", isLast);
        document.getElementById("finishForm").classList.toggle("hidden", !isLast);

        document.getElementById("answersList").innerHTML = question.options
            .map(function (option) {
                const inputId = "answer-" + question.id + "-" + option.id;

                return (
                    '<label class="answer-option' +
                    (selected === option.id ? " is-selected" : "") +
                    '" for="' +
                    inputId +
                    '">' +
                    '<input class="answer-option__radio" id="' +
                    inputId +
                    '" type="radio" name="answer" value="' +
                    option.id +
                    '"' +
                    (selected === option.id ? " checked" : "") +
                    ">" +
                    '<span class="answer-option__letter">' +
                    option.id +
                    "</span>" +
                    '<span class="answer-option__text">' +
                    option.text +
                    "</span>" +
                    "</label>"
                );
            })
            .join("");

        renderMap();
        updateSummary();
    }

    function updateSummary() {
        const section = getCurrentSection();
        const answered = getAnsweredCount(section);
        const total = section.questions.length;
        const percent = total ? Math.round((answered / total) * 100) : 0;

        document.getElementById("totalQuestions").textContent = String(total);
        document.getElementById("answeredQuestions").textContent = String(answered);
        document.getElementById("pendingQuestions").textContent = String(total - answered);
        document.getElementById("progressLabel").textContent = percent + "%";
        document.getElementById("progressBar").style.width = percent + "%";
    }

    function setAnswer(optionId) {
        const section = getCurrentSection();
        const question = getCurrentQuestion();
        const sectionAnswers = getSectionAnswers(section);

        sectionAnswers[question.id] = optionId;
        saveAnswers();
        renderQuestion();
    }

    function moveQuestion(direction) {
        const section = getCurrentSection();
        const nextIndex = activeQuestionIndex + direction;

        if (nextIndex >= 0 && nextIndex < section.questions.length) {
            activeQuestionIndex = nextIndex;
            renderQuestion();
        }
    }

    function clearCurrentAnswer() {
        const section = getCurrentSection();
        const question = getCurrentQuestion();
        const sectionAnswers = getSectionAnswers(section);

        delete sectionAnswers[question.id];
        saveAnswers();
        renderQuestion();
    }

    function calculateResult(section) {
        const sectionAnswers = getSectionAnswers(section);
        const selectedOptions = section.questions
            .map(function (question) {
                return question.options.find(function (option) {
                    return option.id === sectionAnswers[question.id];
                });
            })
            .filter(Boolean);
        const score = selectedOptions.reduce(function (total, option) {
            return total + option.score;
        }, 0);
        const maxScore = section.questions.length * 8;
        const percent = maxScore ? Math.round((score / maxScore) * 100) : 0;

        return {
            answered: selectedOptions.length,
            total: section.questions.length,
            score: score,
            maxScore: maxScore,
            percent: percent,
        };
    }

    function getResultMessage(percent) {
        if (percent >= 85) {
            return {
                title: "Maturidade ética elevada",
                text: "As respostas indicam uma postura muito consistente diante de dilemas éticos, transparência e responsabilidade nas decisões.",
            };
        }

        if (percent >= 70) {
            return {
                title: "Boa consistência ética",
                text: "O resultado mostra uma base sólida, com alguns pontos que ainda podem ser fortalecidos para sustentar decisões mais equilibradas sob pressão.",
            };
        }

        if (percent >= 50) {
            return {
                title: "Maturidade em desenvolvimento",
                text: "Há sinais importantes de atenção. Vale revisar os cenários respondidos e transformar os pontos frágeis em trilhas de capacitação.",
            };
        }

        return {
            title: "Atenção prioritária",
            text: "O diagnóstico aponta riscos relevantes em ética, confiança ou segurança psicológica. O ideal é priorizar intervenção e desenvolvimento estruturado.",
        };
    }

    function showResult() {
        const section = getCurrentSection();
        const result = calculateResult(section);

        if (result.answered < result.total) {
            window.AzuosUtils.showToast(
                "Responda todas as perguntas deste bloco antes de finalizar.",
                "warning",
                "Formulário incompleto"
            );
            return;
        }

        const message = getResultMessage(result.percent);
        const panel = document.getElementById("resultPanel");

        document.getElementById("resultPercent").textContent = result.percent + "%";
        document.getElementById("resultTitle").textContent = message.title;
        document.getElementById("resultText").textContent = message.text;
        document.getElementById("resultAnswered").textContent =
            result.answered + " de " + result.total + " respondidas";
        document.getElementById("resultScore").textContent =
            result.score + " de " + result.maxScore + " pontos";
        panel.classList.remove("hidden");
        panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    function resetCurrentSection() {
        const section = getCurrentSection();

        answers[section.id] = {};
        saveAnswers();
        activeQuestionIndex = 0;
        document.getElementById("resultPanel").classList.add("hidden");
        renderQuestion();
    }

    function bindEvents() {
        document.getElementById("formTabs").addEventListener("click", function (event) {
            const tab = event.target.closest("[data-section-index]");

            if (!tab) {
                return;
            }

            activeSectionIndex = Number(tab.getAttribute("data-section-index"));
            activeQuestionIndex = 0;
            document.getElementById("resultPanel").classList.add("hidden");
            renderTabs();
            renderQuestion();
        });

        document.getElementById("questionMap").addEventListener("click", function (event) {
            const item = event.target.closest("[data-question-index]");

            if (!item) {
                return;
            }

            activeQuestionIndex = Number(item.getAttribute("data-question-index"));
            renderQuestion();
        });

        document.getElementById("answersList").addEventListener("change", function (event) {
            if (event.target.matches('input[name="answer"]')) {
                setAnswer(event.target.value);
            }
        });

        document.getElementById("previousQuestion").addEventListener("click", function () {
            moveQuestion(-1);
        });

        document.getElementById("nextQuestion").addEventListener("click", function () {
            moveQuestion(1);
        });

        document.getElementById("clearCurrent").addEventListener("click", clearCurrentAnswer);

        document.getElementById("assessmentForm").addEventListener("submit", function (event) {
            event.preventDefault();
            showResult();
        });

        document.getElementById("reviewAnswers").addEventListener("click", function () {
            document.getElementById("resultPanel").classList.add("hidden");
            document.getElementById("assessmentForm").scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        });

        document.getElementById("resetAnswers").addEventListener("click", resetCurrentSection);
    }

    function showLoadError() {
        const app = document.getElementById("formularioApp");

        app.innerHTML =
            '<div class="panel form-load-error">' +
            "<h2>Não foi possível carregar as perguntas.</h2>" +
            "<p>Confira se o arquivo de dados do formulário foi gerado corretamente.</p>" +
            "</div>";
    }

    function init() {
        if (!window.AzuosFormularioMarkdown) {
            showLoadError();
            return;
        }

        sections = parseQuestions(window.AzuosFormularioMarkdown);

        if (!sections.length) {
            showLoadError();
            return;
        }

        renderTabs();
        renderQuestion();
        bindEvents();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
