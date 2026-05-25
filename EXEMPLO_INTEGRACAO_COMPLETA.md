# 📋 Exemplo de Integração Completa

Este arquivo mostra um exemplo real de como uma página HTML fica após integrar todos os scripts.

## Dashboard Completo com Scripts

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard | Plataforma Azuos</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
    <link rel="stylesheet" href="../css/variables.css">
    <link rel="stylesheet" href="../css/global.css">
    <link rel="stylesheet" href="../css/components.css">
    <link rel="stylesheet" href="../css/utilities.css">
    <link rel="stylesheet" href="../css/pages/dashboard.css">

    <!-- ========== SCRIPTS OBRIGATÓRIOS ========== -->
    <!-- 1. Configuração (DEVE ser primeiro) -->
    <script src="../js/config.js" defer></script>
    
    <!-- 2. Cliente HTTP base (DEVE ser segundo) -->
    <script src="../js/api.js" defer></script>
    
    <!-- 3. Utilitários de UI -->
    <script src="../js/utils-api.js" defer></script>

    <!-- ========== SERVIÇOS DE NEGÓCIO ========== -->
    <!-- Autenticação -->
    <script src="../js/services/authService.js" defer></script>
    
    <!-- Usuários -->
    <script src="../js/services/userService.js" defer></script>
    
    <!-- Formulários e Submissões -->
    <script src="../js/services/formService.js" defer></script>
    
    <!-- Dashboard (agregações de dados) -->
    <script src="../js/services/dashboardService.js" defer></script>

    <!-- ========== SCRIPTS DE PÁGINA ========== -->
    <!-- Inicialização genérica (carrega sidebar, navbar, etc) -->
    <script src="../js/pages/app.js" defer></script>
    
    <!-- Lógica específica do dashboard -->
    <script src="../js/pages/dashboard.js" defer></script>
</head>

<!-- 
  IMPORTANTE: data-page-file é usado pelo app.js para marcar o link ativo na sidebar
  IMPORTANTE: data-page-type="app" marca como página protegida (requere autenticação)
-->
<body class="app-body" data-page-type="app" data-page-file="dashboard.html">
    <!-- Toggle mobile para sidebar -->
    <button class="mobile-toggle" type="button" data-sidebar-toggle aria-label="Abrir menu lateral">
        <i class="fa-solid fa-bars"></i>
    </button>

    <!-- Overlay que aparece em mobile quando sidebar está aberta -->
    <div class="overlay" id="overlay" data-sidebar-close></div>

    <!-- ========== SIDEBAR ========== -->
    <!-- Este elemento será preenchido dinamicamente pelo app.js -->
    <!-- Ele carrega:
         - Navegação principal
         - Nome do usuário
         - Foto do usuário
         - Botão de logout
         - Menu específico para líderes
    -->
    <aside class="sidebar" id="sidebar"></aside>

    <div class="main-shell">
        <!-- ========== HEADER/TOPBAR ========== -->
        <header class="topbar">
            <div class="topbar__left">
                <p class="topbar__eyebrow">Painel operacional</p>
                <h1>Visão geral</h1>
                <!-- Este parágrafo será atualizado com saudação personalizada -->
                <p id="greetMsg">Carregando sessão...</p>
            </div>
            <div class="topbar__right">
                <a class="btn btn-primary btn--sm" href="formulario.html">
                    <i class="fa-solid fa-plus"></i>
                    Novo formulário
                </a>
            </div>
        </header>

        <!-- ========== CONTEÚDO PRINCIPAL ========== -->
        <main class="app-content">
            <!-- SEÇÃO HERÓI COM SCORE -->
            <section class="panel panel--gradient dashboard-hero fade-in">
                <!-- SVG para visualizar score como anel de progresso -->
                <div class="score-ring">
                    <svg viewBox="0 0 120 120">
                        <!-- Círculo de fundo (cinza) -->
                        <circle class="score-ring__bg" cx="60" cy="60" r="55"></circle>
                        <!-- Círculo preenchido (progresso) - muda cor baseado em getScoreClass() -->
                        <circle class="score-ring__fill" cx="60" cy="60" r="55" id="ringFill"></circle>
                    </svg>
                    <div class="score-ring__center">
                        <!-- Score numérico (0-100) -->
                        <div class="score-ring__value" id="scoreNum">--</div>
                        <div class="score-ring__label">última análise</div>
                    </div>
                </div>

                <div>
                    <!-- Título que muda baseado no score -->
                    <h2 class="dashboard-hero__title" id="dashboardHeroTitle">
                        Aguardando retorno do backend
                    </h2>
                    <!-- Descrição que muda baseado no score -->
                    <p class="dashboard-hero__desc" id="dashboardHeroDesc">
                        Este painel só passa a mostrar indicadores quando houver cadastros, envios de formulário e análises devolvidas pelo servidor.
                    </p>
                    <!-- Tags de feedback (ética, inclusão, etc) -->
                    <div class="dashboard-tags" id="dashboardTags"></div>
                </div>
            </section>

            <!-- GRID DE ESTATÍSTICAS -->
            <section class="stats-grid">
                <!-- Card 1: Formulários Enviados -->
                <article class="panel stat-card fade-in">
                    <div class="stat-card__icon stat-card__icon--accent">
                        <i class="fa-solid fa-clipboard-list"></i>
                    </div>
                    <div>
                        <!-- Total de submissões do usuário -->
                        <div class="stat-card__value" id="metricSubmissions">0</div>
                        <div class="stat-card__label">Formulários enviados</div>
                        <!-- Informação adicional (por ex: "3 formulários") -->
                        <div class="stat-card__delta" id="metricSubmissionsMeta">Sem dados ainda</div>
                    </div>
                </article>

                <!-- Card 2: Análises Pendentes -->
                <article class="panel stat-card fade-in">
                    <div class="stat-card__icon stat-card__icon--primary">
                        <i class="fa-solid fa-hourglass-half"></i>
                    </div>
                    <div>
                        <!-- Submissões que ainda não têm relatório -->
                        <div class="stat-card__value" id="metricPending">0</div>
                        <div class="stat-card__label">Análises pendentes</div>
                        <div class="stat-card__delta" id="metricPendingMeta">Aguardando processamento</div>
                    </div>
                </article>

                <!-- Card 3: Análises Prontas -->
                <article class="panel stat-card fade-in">
                    <div class="stat-card__icon stat-card__icon--success">
                        <i class="fa-solid fa-file-circle-check"></i>
                    </div>
                    <div>
                        <!-- Submissões com relatório pronto -->
                        <div class="stat-card__value" id="metricCompleted">0</div>
                        <div class="stat-card__label">Análises prontas</div>
                        <div class="stat-card__delta" id="metricCompletedMeta">Sem relatórios liberados</div>
                    </div>
                </article>

                <!-- Card 4: Equipe (apenas para líderes) -->
                <article class="panel stat-card fade-in">
                    <div class="stat-card__icon stat-card__icon--purple">
                        <i class="fa-solid fa-users"></i>
                    </div>
                    <div>
                        <!-- Total de membros da equipe do líder -->
                        <div class="stat-card__value" id="metricTeam">0</div>
                        <!-- Label que muda dinamicamente (singular/plural) -->
                        <div class="stat-card__label" id="metricTeamLabel">Equipe cadastrada</div>
                        <div class="stat-card__delta" id="metricTeamMeta">Membros ativos</div>
                    </div>
                </article>
            </section>
        </main>
    </div>

    <!-- ========== FOOTER ========== -->
    <footer class="site-footer">
        <span class="site-footer__copy">
            © <span data-year></span> Plataforma Azuos. Todos os direitos reservados.
        </span>
    </footer>
</body>
</html>
```

## O que Cada Script Faz

### config.js
```javascript
// Define URL base e todos os endpoints
const APP_CONFIG = {
  API_BASE_URL: 'https://flask-api-production-b69d.up.railway.app/api',
  ENDPOINTS: { /* ... */ }
}
```

### api.js
```javascript
// Cliente HTTP genérico
APIService.get(endpoint)
APIService.post(endpoint, data)
APIService.put(endpoint, data)
APIService.delete(endpoint)
```

### authService.js
```javascript
// Autenticação
AuthService.login(email, senha)
AuthService.logout()
AuthService.isLoggedIn()
```

### dashboardService.js
```javascript
// Carrega todos os dados necessários
const data = await DashboardService.loadDashboardData()
// Retorna: {
//   user, submissions, totalSubmissions,
//   pendingAnalysis, completedAnalysis,
//   latestScore, teamCount
// }
```

### dashboard.js
```javascript
// Renderiza na tela com base nos dados
class DashboardPage {
  // - Verifica autenticação
  // - Carrega dados com DashboardService
  // - Renderiza componentes
  // - Configura listeners
}
```

## Fluxo de Execução

1. **DOMContentLoaded dispara**
2. **app.js inicializa**
   - Verifica se tem token
   - Se não, redireciona para login
   - Se tem, carrega sidebar
3. **dashboard.js inicializa**
   - Chama DashboardService.loadDashboardData()
   - API retorna todos os dados
   - Renderiza cada componente
   - Configura listeners
4. **Usuário interage**
   - Clica em botões, links, etc
   - Listeners disparam ações
   - Podem chamar serviços novamente

## Exemplo: O que Acontece ao Carregar

```
1. HTML carrega com scripts defer
   ↓
2. DOMContentLoaded dispara
   ↓
3. new DashboardPage() é criado
   ↓
4. checkAuth() verifica token
   ├─ Se vazio: redireciona para login.html
   └─ Se válido: continua
   ↓
5. init() começa
   ↓
6. await DashboardService.loadDashboardData()
   ├─ Chama UserService.getAll() → recebe lista de usuários
   ├─ Chama FormService.getUserSubmissions() → recebe submissões
   ├─ Para cada submissão, chama getReport() → recebe relatório
   └─ Retorna objeto aggregado
   ↓
7. renderGreeting() - mostra "Bom dia, João!"
   renderMetrics() - atualiza números
   renderHeroSection() - atualiza score ring
   ↓
8. setupEventListeners() - configura logout, etc
   ↓
9. Página está pronta! ✅
```

## IDs Importantes

| ID | Função | Atualizado por |
|----|--------|----------------|
| `#greetMsg` | Saudação personalizada | renderGreeting() |
| `#scoreNum` | Número do score | renderHeroSection() |
| `#ringFill` | Círculo de progresso | renderHeroSection() |
| `#dashboardHeroTitle` | Título dinâmico | renderHeroSection() |
| `#dashboardTags` | Tags de feedback | renderHeroSection() |
| `#metricSubmissions` | Total de submissões | renderMetrics() |
| `#metricPending` | Pendentes | renderMetrics() |
| `#metricCompleted` | Completas | renderMetrics() |
| `#metricTeam` | Membros da equipe | renderMetrics() |
| `#sidebar` | Navegação lateral | app.js |

## Dados que Vêm da API

Quando DashboardService.loadDashboardData() é executado:

```javascript
{
  user: {
    id: 1,
    nome: "João Silva",
    email: "joao@empresa.com",
    role_id: 1,
    departamento_id: 1,
    lider: true
  },
  submissions: [
    {
      id: 1,
      usuario_id: 1,
      formulario_id: 1,
      pontuacao: 78,
      data_submissao: "2024-05-20T14:30:00"
    }
  ],
  totalSubmissions: 1,
  pendingAnalysis: 0,
  completedAnalysis: 1,
  latestScore: 78,
  teamCount: 5,
  allReports: [
    {
      id: 1,
      submissao_id: 1,
      resumo: "Liderança ética com pontos de melhoria",
      recomendacoes: "..."
    }
  ]
}
```

## Renderização Detalhada

### renderGreeting(user)
```javascript
// Verifica hora do dia
const hour = new Date().getHours()
if (hour < 12) greeting = 'Bom dia'    // 00:00 - 11:59
else if (hour < 18) greeting = 'Boa tarde'  // 12:00 - 17:59
else greeting = 'Boa noite'             // 18:00 - 23:59

// Atualiza elemento
greetMsg.textContent = `${greeting}, ${user.nome}!`
```

### renderMetrics(data)
```javascript
// Atualiza cada métrica
metricSubmissions.textContent = data.totalSubmissions
metricPending.textContent = data.pendingAnalysis
metricCompleted.textContent = data.completedAnalysis
metricTeam.textContent = data.teamCount

// Atualiza descrições
metricSubmissionsMeta.textContent = 
  data.totalSubmissions === 0 
    ? 'Nenhuma submissão ainda' 
    : `${data.totalSubmissions} formulários`
```

### renderHeroSection(data)
```javascript
if (data.latestScore !== null) {
  // Calcula anel de progresso
  const circumference = 2 * Math.PI * 55
  const strokeDashoffset = circumference - (data.latestScore / 100) * circumference
  
  scoreNum.textContent = data.latestScore
  ringFill.style.strokeDashoffset = strokeDashoffset
  
  // Feedback baseado no score
  heroTitle.textContent = getScoreFeedback(data.latestScore)
  dashboardTags.innerHTML = getScoreTags(data.latestScore)
}
```

---

Este exemplo mostra a integração completa. Use-o como referência para integrar outras páginas!
