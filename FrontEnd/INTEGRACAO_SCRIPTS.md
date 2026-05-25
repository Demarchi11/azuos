# Guia de Integração - Scripts de API

Este documento mostra exatamente o que adicionar a cada página HTML para fazer funcionar com os scripts JavaScript.

## 📝 Login Page (pages/login.html)

### Scripts a Adicionar

Adicione antes do fechamento da tag `</head>`:

```html
<!-- Configuração -->
<script src="../js/config.js" defer></script>
<!-- Serviço de API -->
<script src="../js/api.js" defer></script>
<!-- Utilitários -->
<script src="../js/utils-api.js" defer></script>
<!-- Serviço de Autenticação -->
<script src="../js/services/authService.js" defer></script>
<!-- Script da página de login -->
<script src="../js/pages/login.js" defer></script>
```

### IDs Necessários no HTML

Verifique se existem (já existem na estrutura fornecida):
- `<form id="bootstrapForm">` - Formulário de bootstrap
- `<form id="loginForm">` - Formulário de login
- `<div id="bootstrapInfo">` - Info banner
- `<div id="loginError" role="alert">` - Container de erro
- `<input id="bootstrapName">` - Nome (bootstrap)
- `<input id="bootstrapUsername">` - Email (bootstrap)
- `<input id="bootstrapPassword">` - Senha (bootstrap)
- `<button id="bootstrapButton">` - Botão bootstrap
- `<input id="username">` - Email (login)
- `<input id="password">` - Senha (login)
- `<button id="loginButton">` - Botão login

---

## 📊 Dashboard Page (pages/dashboard.html)

### Scripts a Adicionar

Adicione antes do fechamento da tag `</head>`:

```html
<!-- Configuração -->
<script src="../js/config.js" defer></script>
<!-- Serviço de API -->
<script src="../js/api.js" defer></script>
<!-- Utilitários -->
<script src="../js/utils-api.js" defer></script>
<!-- Serviços -->
<script src="../js/services/authService.js" defer></script>
<script src="../js/services/userService.js" defer></script>
<script src="../js/services/formService.js" defer></script>
<script src="../js/services/dashboardService.js" defer></script>
<!-- Scripts de página -->
<script src="../js/pages/app.js" defer></script>
<script src="../js/pages/dashboard.js" defer></script>
```

### Atributos no Body

```html
<body class="app-body" data-page-type="app" data-page-file="dashboard.html">
```

### IDs e Elementos Necessários

```html
<!-- Sidebar (será preenchido dinamicamente) -->
<aside class="sidebar" id="sidebar"></aside>

<!-- Header -->
<header class="topbar">
    <div class="topbar__left">
        <p class="topbar__eyebrow">Painel operacional</p>
        <h1>Visão geral</h1>
        <p id="greetMsg">Carregando sessão...</p>
    </div>
</header>

<!-- Score Ring -->
<div class="score-ring">
    <svg viewBox="0 0 120 120">
        <circle class="score-ring__bg" cx="60" cy="60" r="55"></circle>
        <circle class="score-ring__fill" cx="60" cy="60" r="55" id="ringFill"></circle>
    </svg>
    <div class="score-ring__center">
        <div class="score-ring__value" id="scoreNum">--</div>
        <div class="score-ring__label">última análise</div>
    </div>
</div>

<!-- Títulos e tags -->
<h2 class="dashboard-hero__title" id="dashboardHeroTitle">Aguardando retorno do backend</h2>
<p class="dashboard-hero__desc" id="dashboardHeroDesc">...</p>
<div class="dashboard-tags" id="dashboardTags"></div>

<!-- Métricas -->
<div class="stat-card__value" id="metricSubmissions">0</div>
<div class="stat-card__value" id="metricPending">0</div>
<div class="stat-card__value" id="metricCompleted">0</div>
<div class="stat-card__value" id="metricTeam">0</div>

<!-- Footer com ano -->
<span data-year></span>
```

---

## 📋 Formulário Page (pages/formulario.html)

### Scripts a Adicionar

```html
<!-- Configuração -->
<script src="../js/config.js" defer></script>
<!-- Serviço de API -->
<script src="../js/api.js" defer></script>
<!-- Utilitários -->
<script src="../js/utils-api.js" defer></script>
<!-- Serviços -->
<script src="../js/services/authService.js" defer></script>
<script src="../js/services/formService.js" defer></script>
<!-- Scripts de página -->
<script src="../js/pages/app.js" defer></script>
<script src="../js/pages/formulario.js" defer></script>
```

### Atributos no Body

```html
<body class="app-body" data-page-type="app" data-page-file="formulario.html">
```

### Estrutura HTML Necessária

```html
<aside class="sidebar" id="sidebar"></aside>

<!-- Tabs de formulários -->
<div class="form-tabs" id="formTabs" aria-label="Tipo de formulário"></div>

<!-- Mapa de perguntas -->
<div class="question-map" id="questionMap" aria-label="Mapa de perguntas"></div>

<!-- Informações do formulário -->
<span class="question-panel__section" id="sectionLabel">Formulário</span>
<h2 class="question-panel__title" id="questionTitle">Carregando pergunta...</h2>
<span id="currentQuestion">0</span> / <span id="currentTotal">0</span>

<!-- Progresso -->
<strong id="progressLabel">0%</strong>
<div class="form-progress__bar" id="progressBar"></div>

<!-- Contadores -->
<span class="form-stat__value" id="totalQuestions">0</span>
<span class="form-stat__value" id="answeredQuestions">0</span>
<span class="form-stat__value" id="pendingQuestions">0</span>

<!-- Respostas -->
<fieldset class="answers-list" id="answersList">
    <legend class="sr-only">Alternativas</legend>
</fieldset>

<!-- Botões -->
<button id="previousQuestion" type="button">Anterior</button>
<button id="nextQuestion" type="button">Próximo</button>
<button id="clearCurrent" type="button">Limpar</button>
<button id="submitButton" type="button">
    <span class="spinner" id="submitSpinner"></span>
    <span>Enviar formulário</span>
</button>
```

---

## 📖 Histórico Page (pages/historico.html)

### Scripts a Adicionar

```html
<!-- Configuração -->
<script src="../js/config.js" defer></script>
<!-- Serviço de API -->
<script src="../js/api.js" defer></script>
<!-- Utilitários -->
<script src="../js/utils-api.js" defer></script>
<!-- Serviços -->
<script src="../js/services/authService.js" defer></script>
<script src="../js/services/formService.js" defer></script>
<script src="../js/services/dashboardService.js" defer></script>
<!-- Scripts de página -->
<script src="../js/pages/app.js" defer></script>
<script src="../js/pages/historico.js" defer></script>
```

### Atributos no Body

```html
<body class="app-body" data-page-type="app" data-page-file="historico.html">
```

### Elemento Necessário

```html
<aside class="sidebar" id="sidebar"></aside>

<!-- Container para histórico (será preenchido dinamicamente) -->
<div id="historyContainer" class="submissions-list"></div>
<!-- OU -->
<div data-history-list class="submissions-list"></div>
```

---

## 🏆 Ranking Page (pages/ranking.html)

### Scripts a Adicionar

```html
<!-- Configuração -->
<script src="../js/config.js" defer></script>
<!-- Serviço de API -->
<script src="../js/api.js" defer></script>
<!-- Utilitários -->
<script src="../js/utils-api.js" defer></script>
<!-- Serviços -->
<script src="../js/services/authService.js" defer></script>
<script src="../js/services/userService.js" defer></script>
<script src="../js/services/formService.js" defer></script>
<script src="../js/services/dashboardService.js" defer></script>
<!-- Scripts de página -->
<script src="../js/pages/app.js" defer></script>
<script src="../js/pages/ranking.js" defer></script>
```

### Atributos no Body

```html
<body class="app-body" data-page-type="app" data-page-file="ranking.html">
```

### Elemento Necessário

```html
<aside class="sidebar" id="sidebar"></aside>

<!-- Container para ranking (será preenchido dinamicamente) -->
<div id="rankingContainer" class="ranking-list"></div>
<!-- OU -->
<div data-ranking-list class="ranking-list"></div>
```

---

## 👥 Equipe Page (pages/equipe.html)

### Scripts a Adicionar

```html
<!-- Configuração -->
<script src="../js/config.js" defer></script>
<!-- Serviço de API -->
<script src="../js/api.js" defer></script>
<!-- Utilitários -->
<script src="../js/utils-api.js" defer></script>
<!-- Serviços -->
<script src="../js/services/authService.js" defer></script>
<script src="../js/services/userService.js" defer></script>
<script src="../js/services/formService.js" defer></script>
<!-- Scripts de página -->
<script src="../js/pages/app.js" defer></script>
<script src="../js/pages/equipe.js" defer></script>
```

### Atributos no Body

```html
<body class="app-body" data-page-type="app" data-page-file="equipe.html">
```

### Elementos Necessários

```html
<aside class="sidebar" id="sidebar"></aside>

<!-- Formulário para adicionar membro -->
<form id="addMemberForm" novalidate>
    <input type="text" id="memberName" placeholder="Nome completo" required>
    <input type="email" id="memberEmail" placeholder="E-mail" required>
    <input type="text" id="memberCPF" placeholder="CPF" required>
    <input type="number" id="memberRole" placeholder="ID do cargo">
    <input type="password" id="memberPassword" placeholder="Senha" required>
    <button type="submit" id="addMemberButton">
        <span class="spinner" id="addMemberSpinner"></span>
        Adicionar Membro
    </button>
</form>

<!-- Container para lista de membros -->
<div id="membersList" class="members-list"></div>
<!-- OU -->
<div data-members-list class="members-list"></div>
```

---

## 📄 Relatórios Page (pages/relatorios.html)

### Scripts a Adicionar

```html
<!-- Configuração -->
<script src="../js/config.js" defer></script>
<!-- Serviço de API -->
<script src="../js/api.js" defer></script>
<!-- Utilitários -->
<script src="../js/utils-api.js" defer></script>
<!-- Serviços -->
<script src="../js/services/authService.js" defer></script>
<script src="../js/services/userService.js" defer></script>
<script src="../js/services/formService.js" defer></script>
<script src="../js/services/dashboardService.js" defer></script>
<!-- Scripts de página -->
<script src="../js/pages/app.js" defer></script>
<script src="../js/pages/relatorios.js" defer></script>
```

### Atributos no Body

```html
<body class="app-body" data-page-type="app" data-page-file="relatorios.html">
```

### Elemento Necessário

```html
<aside class="sidebar" id="sidebar"></aside>

<!-- Container para relatórios -->
<div id="reportsContainer" class="reports-list"></div>
<!-- OU -->
<div data-reports-list class="reports-list"></div>
```

---

## 🔧 Páginas Genéricas (Configurações, Notificações, etc)

### Scripts Mínimos

```html
<!-- Configuração -->
<script src="../js/config.js" defer></script>
<!-- Serviço de API -->
<script src="../js/api.js" defer></script>
<!-- Utilitários -->
<script src="../js/utils-api.js" defer></script>
<!-- Serviço de Autenticação -->
<script src="../js/services/authService.js" defer></script>
<!-- Script genérico de página -->
<script src="../js/pages/app.js" defer></script>
```

### Atributos no Body

```html
<body class="app-body" data-page-type="app" data-page-file="configuracoes.html">
```

### Elemento Necessário

```html
<aside class="sidebar" id="sidebar"></aside>
```

---

## ✅ Checklist de Integração

Para cada página, verifique:

- [ ] Scripts carregados na ordem correta
- [ ] Atributo `data-page-file` no body
- [ ] Elemento `<aside id="sidebar"></aside>` presente
- [ ] Todos os IDs necessários estão no HTML
- [ ] Classes CSS existem (ou serão criadas)
- [ ] Não há conflitos de IDs duplicados
- [ ] Overlay para mobile: `<div id="overlay" data-sidebar-close></div>`
- [ ] Mobile toggle: `<button data-sidebar-toggle>...</button>`

---

## 🎨 Estilos CSS Necessários

Os scripts esperam que existam certas classes CSS. Se não existirem, adicione ao arquivo CSS apropriado:

```css
/* Spinner de loading */
.spinner {
    display: none;
    width: 16px;
    height: 16px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Classes de score */
.score-excellent { color: #27ae60; }
.score-good { color: #3498db; }
.score-fair { color: #f39c12; }
.score-poor { color: #e74c3c; }

/* Modal básico */
.modal {
    display: flex;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal__content {
    background: white;
    border-radius: 8px;
    padding: 2rem;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
}

.modal__close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
}

/* Empty state */
.empty-state {
    text-align: center;
    padding: 3rem;
}

.empty-state i {
    font-size: 3rem;
    opacity: 0.3;
    margin-bottom: 1rem;
}
```

---

## 🚨 Erros Comuns

### "APIService is not defined"
**Problema**: Scripts não estão sendo carregados.  
**Solução**: Verifique se `config.js` e `api.js` estão no `<head>` com `defer`.

### "Formulário não aparece"
**Problema**: IDs esperados não existem no HTML.  
**Solução**: Adicione todos os IDs listados na seção "Estrutura HTML Necessária".

### "Login funciona mas dashboard não carrega"
**Problema**: `app.js` pode não estar carregando a sidebar.  
**Solução**: Verifique se `<aside id="sidebar"></aside>` existe e está vazio (será preenchido dinamicamente).

### "Datepicker mostra data estranha"
**Problema**: Formato de data diferente.  
**Solução**: A função `UIUtils.formatDate()` já trata isso. Não é necessário fazer nada.

---

## 📞 Próximos Passos

1. Adicione os scripts a todas as páginas conforme descrito acima
2. Verifique os elementos HTML necessários em cada página
3. Adicione classes CSS conforme necessário
4. Teste cada página após as adições
5. Verifique o console do navegador para erros
6. Confirme que a API está acessível na URL configurada
