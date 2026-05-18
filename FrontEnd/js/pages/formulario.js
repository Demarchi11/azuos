(function () {
    var sectionMeta = [
        {
            id: "dilemas",
            title: "Dilemas industriais",
            label: "Lideres",
            roles: ["lider"],
        },
        {
            id: "liderados",
            title: "Avaliacao do lider",
            label: "Funcionarios",
            roles: ["funcionario"],
        },
    ];

    var sections = [];
    var activeSectionIndex = 0;
    var activeQuestionIndex = 0;
    var answers = loadAnswers();

    function getStorageKey() {
        var session = window.AzuosAuth.getSession();
        return "azuos_formulario_respostas::" + (session.user || "usuario");
    }

    function cleanText(value) {
        return (value || "")
            .replace(/\\\./g, ".")
            .replace(/\*\*/g, "")
            .replace(/\*/g, "")
            .replace(/\s+/g, " ")
            .trim();
    }

    function getHeadingMatches(markdown) {
        var headingRegex = /^\s*\*\*Pergunta\s+(\d+)\\?\.\s+(.+?)\*\*\s*$/gm;
        var matches = [];
        var match;

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
        var optionRegex = /^\s*([A-D])\)\s+([\s\S]*?)(?=\n\s*[A-D]\)\s+|$)/gm;
        var options = [];
        var match;

        while ((match = optionRegex.exec(block)) !== null) {
            options.push({
                id: match[1],
                text: cleanText(match[2].replace(/\((2|4|6|8)\).*/i, "")),
            });
        }

        return options;
    }

    function parseQuestions(markdown) {
        var normalized = markdown
            .replace(/\r\n/g, "\n")
            .replace(/\n\s*\((2|4|6|8)\)\s*([B-D])\)/g, " ($1)\n\n$2)");
        var headings = getHeadingMatches(normalized);
        var grouped = [];
        var currentSection = -1;
        var previousNumber = 0;

        headings.forEach(function (heading, index) {
            var blockStart;
            var blockEnd;
            var block;
            var firstOption;
            var contextChunk;
            var optionsChunk;
            var context;
            var options;
            var meta;

            if (heading.number <= previousNumber) {
                currentSection += 1;
            }

            if (currentSection < 0) {
                currentSection = 0;
            }

            previousNumber = heading.number;

            if (!grouped[currentSection]) {
                meta = sectionMeta[currentSection] || {
                    id: "formulario-" + (currentSection + 1),
                    title: "Formulario " + (currentSection + 1),
                    label: "Bloco " + (currentSection + 1),
                    roles: ["lider", "funcionario"],
                };
                grouped[currentSection] = Object.assign({ questions: [] }, meta);
            }

            blockStart = heading.index + heading.raw.length;
            blockEnd = headings[index + 1]
                ? headings[index + 1].index
                : normalized.length;
            block = normalized.slice(blockStart, blockEnd);
            firstOption = block.search(/^\s*A\)\s+/m);
            contextChunk = firstOption >= 0 ? block.slice(0, firstOption) : block;
            optionsChunk = firstOption >= 0 ? block.slice(firstOption) : "";
            context = cleanText(
                contextChunk.replace(/^\s*\*\*?Contexto:\s*/i, "").replace(/^Contexto:\s*/i, "")
            );
            options = parseOptions(optionsChunk);

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
            return JSON.parse(localStorage.getItem(getStorageKey())) || {};
        } catch (_error) {
            return {};
        }
    }

    function saveAnswers() {
        localStorage.setItem(getStorageKey(), JSON.stringify(answers));
    }

    function getCurrentSection() {
        return sections[activeSectionIndex];
    }

    function getCurrentQuestion() {
        return getCurrentSection().questions[activeQuestionIndex];
    }

    function getSectionAnswers(section) {
        if (!answers[section.id]) {
            answers[section.id] = {};
        }

        return answers[section.id];
    }

    function getAnsweredCount(section) {
        var sectionAnswers = getSectionAnswers(section);
        return section.questions.filter(function (question) {
            return Boolean(sectionAnswers[question.id]);
        }).length;
    }

    function renderTabs() {
        var tabs = document.getElementById("formTabs");

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
        var map = document.getElementById("questionMap");
        var section = getCurrentSection();
        var sectionAnswers = getSectionAnswers(section);

        map.innerHTML = section.questions
            .map(function (question, index) {
                var classes = [
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
        var section = getCurrentSection();
        var question = getCurrentQuestion();
        var sectionAnswers = getSectionAnswers(section);
        var selected = sectionAnswers[question.id] || "";
        var isLast = activeQuestionIndex === section.questions.length - 1;

        document.getElementById("sectionLabel").textContent = section.title;
        document.getElementById("questionTitle").textContent = question.title;
        document.getElementById("questionContext").textContent = question.context;
        document.getElementById("currentQuestion").textContent = String(
            activeQuestionIndex + 1
        );
        document.getElementById("currentTotal").textContent = String(
            section.questions.length
        );
        document.getElementById("previousQuestion").disabled =
            activeQuestionIndex === 0;
        document
            .getElementById("nextQuestion")
            .classList.toggle("hidden", isLast);
        document
            .getElementById("finishForm")
            .classList.toggle("hidden", !isLast);

        document.getElementById("answersList").innerHTML = question.options
            .map(function (option) {
                var inputId = "answer-" + question.id + "-" + option.id;

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
        var section = getCurrentSection();
        var answered = getAnsweredCount(section);
        var total = section.questions.length;
        var percent = total ? Math.round((answered / total) * 100) : 0;

        document.getElementById("totalQuestions").textContent = String(total);
        document.getElementById("answeredQuestions").textContent = String(answered);
        document.getElementById("pendingQuestions").textContent = String(
            total - answered
        );
        document.getElementById("progressLabel").textContent = percent + "%";
        document.getElementById("progressBar").style.width = percent + "%";
    }

    function setAnswer(optionId) {
        var section = getCurrentSection();
        var question = getCurrentQuestion();
        var sectionAnswers = getSectionAnswers(section);

        sectionAnswers[question.id] = optionId;
        saveAnswers();
        renderQuestion();
    }

    function moveQuestion(direction) {
        var section = getCurrentSection();
        var nextIndex = activeQuestionIndex + direction;

        if (nextIndex >= 0 && nextIndex < section.questions.length) {
            activeQuestionIndex = nextIndex;
            renderQuestion();
        }
    }

    function clearCurrentAnswer() {
        var section = getCurrentSection();
        var question = getCurrentQuestion();
        var sectionAnswers = getSectionAnswers(section);

        delete sectionAnswers[question.id];
        saveAnswers();
        renderQuestion();
    }

    function collectResponses(section) {
        var sectionAnswers = getSectionAnswers(section);

        return section.questions
            .map(function (question) {
                var selectedId = sectionAnswers[question.id];
                var selectedOption = question.options.find(function (option) {
                    return option.id === selectedId;
                });

                if (!selectedOption) {
                    return null;
                }

                return {
                    question_id: question.id,
                    question_number: question.number,
                    answer_id: selectedOption.id,
                    answer_text: selectedOption.text,
                };
            })
            .filter(Boolean);
    }

    function showSubmissionPanel(submission) {
        var panel = document.getElementById("resultPanel");

        document.getElementById("resultPercent").textContent = "OK";
        document.getElementById("resultTitle").textContent = "Respostas enviadas";
        document.getElementById("resultText").textContent =
            "Seu envio foi salvo no servidor. O score e o texto de devolutiva ficarao disponiveis somente quando o backend concluir a analise.";
        document.getElementById("resultAnswered").textContent =
            submission.answered_count +
            " de " +
            submission.total_questions +
            " respostas";
        document.getElementById("resultStatus").textContent =
            submission.analysis_status_label;
        panel.classList.remove("hidden");
        panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    function setSubmitLoading(isLoading) {
        var button = document.getElementById("finishForm");
        var text = document.getElementById("finishFormText");

        button.disabled = isLoading;
        text.textContent = isLoading ? "Enviando..." : "Enviar respostas";
    }

    async function submitCurrentSection() {
        var section = getCurrentSection();
        var responses = collectResponses(section);
        var payload;
        var result;

        if (responses.length < section.questions.length) {
            window.AzuosUtils.showToast(
                "Responda todas as perguntas deste bloco antes de enviar.",
                "warning",
                "Formulario incompleto"
            );
            return;
        }

        payload = {
            section_id: section.id,
            section_title: section.title,
            total_questions: section.questions.length,
            responses: responses,
        };

        setSubmitLoading(true);

        try {
            result = await window.AzuosApi.createSubmission(payload);
            showSubmissionPanel(result.submission);
            window.AzuosUtils.showToast(
                "Respostas enviadas para o backend.",
                "success",
                "Formulario"
            );
        } catch (error) {
            window.AzuosUtils.showToast(
                error.message || "Nao foi possivel enviar suas respostas.",
                "danger",
                "Formulario"
            );
        } finally {
            setSubmitLoading(false);
        }
    }

    function bindEvents() {
        document.getElementById("formTabs").addEventListener("click", function (event) {
            var tab = event.target.closest("[data-section-index]");

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
            var item = event.target.closest("[data-question-index]");

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
            submitCurrentSection();
        });

        document.getElementById("reviewAnswers").addEventListener("click", function () {
            document.getElementById("resultPanel").classList.add("hidden");
            document.getElementById("assessmentForm").scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        });

        document.getElementById("goToHistory").addEventListener("click", function () {
            window.location.href = "historico.html";
        });
    }

    function showLoadError(message) {
        var app = document.getElementById("formularioApp");

        app.innerHTML =
            '<div class="panel form-load-error">' +
            "<h2>Nao foi possivel carregar este formulario.</h2>" +
            "<p>" +
            message +
            "</p>" +
            "</div>";
    }

    function init() {
        var session = window.AzuosAuth.getSession();

        if (!window.AzuosFormularioMarkdown) {
            showLoadError("Confira se o arquivo de perguntas foi carregado corretamente.");
            return;
        }

        sections = parseQuestions(window.AzuosFormularioMarkdown).filter(function (section) {
            return (section.roles || []).indexOf(session.role) >= 0;
        });

        if (!sections.length) {
            showLoadError(
                "Nao existe um bloco de formulario disponivel para o perfil atual."
            );
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
