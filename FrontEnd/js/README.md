# Documentação de JavaScript - Integração com API Flask

Este documento descreve a estrutura de JavaScript criada para comunicar com a API Flask da plataforma Azuos.

## 📁 Estrutura de Arquivos

```
js/
├── config.js                 # Configurações globais da aplicação
├── api.js                    # Serviço genérico de requisições HTTP
├── utils-api.js              # Utilitários de UI e validação
├── services/
│   ├── authService.js        # Serviço de autenticação
│   ├── userService.js        # Serviço de usuários
│   ├── formService.js        # Serviço de formulários e submissões
│   └── dashboardService.js   # Serviço de dados agregados do dashboard
└── pages/
    ├── app.js                # Script genérico de inicialização de páginas
    ├── login.js              # Script da página de login
    ├── dashboard.js          # Script da página de dashboard
    ├── formulario.js         # Script da página de formulário
    ├── historico.js          # Script da página de histórico
    ├── ranking.js            # Script da página de ranking
    ├── equipe.js             # Script da página de equipe (gerenciamento)
    ├── relatorios.js         # Script da página de relatórios
    └── [configuracoes.js]    # Scripts adicionais (em desenvolvimento)
```

## 🚀 Como Usar

### 1. Importação nos HTMLs

Cada página HTML deve importar os scripts necessários **na ordem correta**:

```html
<!-- Configuração -->
<script src="../js/config.js" defer></script>

<!-- Serviço de API (base)-->
<script src="../js/api.js" defer></script>

<!-- Utilitários -->
<script src="../js/utils-api.js" defer></script>

<!-- Serviços de negócio -->
<script src="../js/services/authService.js" defer></script>
<script src="../js/services/userService.js" defer></script>
<script src="../js/services/formService.js" defer></script>
<script src="../js/services/dashboardService.js" defer></script>

<!-- Script de inicialização (deve ser por último) -->
<script src="../js/pages/login.js" defer></script>
```

### 2. Exemplo de Uso em login.html

```html
<head>
    <!-- ... outros scripts ... -->
    <script src="../js/config.js" defer></script>
    <script src="../js/api.js" defer></script>
    <script src="../js/utils-api.js" defer></script>
    <script src="../js/services/authService.js" defer></script>
    <script src="../js/pages/login.js" defer></script>
</head>
```

### 3. Exemplo de Uso em dashboard.html

```html
<head>
    <!-- ... outros scripts ... -->
    <script src="../js/config.js" defer></script>
    <script src="../js/api.js" defer></script>
    <script src="../js/utils-api.js" defer></script>
    <script src="../js/services/userService.js" defer></script>
    <script src="../js/services/formService.js" defer></script>
    <script src="../js/services/dashboardService.js" defer></script>
    <script src="../js/services/authService.js" defer></script>
    <script src="../js/pages/app.js" defer></script>
    <script src="../js/pages/dashboard.js" defer></script>
</head>
```

### 4. Exemplo de Uso em formulario.html

```html
<head>
    <!-- ... outros scripts ... -->
    <script src="../js/config.js" defer></script>
    <script src="../js/api.js" defer></script>
    <script src="../js/utils-api.js" defer></script>
    <script src="../js/services/formService.js" defer></script>
    <script src="../js/services/authService.js" defer></script>
    <script src="../js/pages/app.js" defer></script>
    <script src="../js/pages/formulario.js" defer></script>
</head>
```

## 🔐 Fluxo de Autenticação

### Login

```javascript
// Realiza login
const result = await AuthService.login(email, senha);

// Se houver token, já está armazenado
// Se não, pode-se fazer manualmente:
APIService.setAuth(result.token, result.user);
```

### Verificar Autenticação

```javascript
// Em qualquer página protegida
if (!AuthService.isLoggedIn()) {
    window.location.href = 'login.html';
}
```

### Logout

```javascript
AuthService.logout(); // Limpa storage e redireciona
```

## 📝 Exemplos de Uso Prático

### Exemplo 1: Carregar Formulário

```javascript
// Obtém o formulário do usuário
const roleId = APIService.getRoleId();
const form = await FormService.getByRole(roleId);

// Form já vem com perguntas precarregadas
console.log(form.perguntas); // Array de perguntas
```

### Exemplo 2: Enviar Submissão

```javascript
const userId = APIService.getUserId();
const formularioId = 1;

const respostas = [
  { pergunta_id: 1, resposta: "Resposta do usuário" },
  { pergunta_id: 2, resposta: "Outra resposta" }
];

const result = await FormService.submitForm(userId, formularioId, respostas);
// Backend processa, calcula score e chama IA automaticamente
console.log(result.pontuacao); // Score calculado
```

### Exemplo 3: Carregar Dados do Dashboard

```javascript
const dashboardData = await DashboardService.loadDashboardData();

console.log(dashboardData.totalSubmissions);    // Total de submissões
console.log(dashboardData.completedAnalysis);  // Análises completas
console.log(dashboardData.latestScore);        // Última pontuação
console.log(dashboardData.teamCount);          // Membros da equipe (se líder)
```

### Exemplo 4: Criar Novo Membro da Equipe

```javascript
const newMember = {
  nome: "João Silva",
  email: "joao@empresa.com",
  cpf: "12345678900",
  senha: "senhaForte123",
  role_id: 1,
  departamento_id: 1,
  lider: false
};

const result = await UserService.create(newMember);
console.log(result.id); // ID do novo usuário
```

### Exemplo 5: Exibir Erro para Usuário

```javascript
try {
  await FormService.submitForm(userId, formId, respostas);
  UIUtils.showSuccess('Formulário enviado com sucesso!');
} catch (error) {
  UIUtils.showError(error.message, 'errorElementId');
}
```

## 🛠️ Serviços Disponíveis

### APIService
Serviço genérico de requisições. Implementa:
- `get(endpoint, requiresAuth)` - GET request
- `post(endpoint, data, requiresAuth)` - POST request
- `put(endpoint, data, requiresAuth)` - PUT request
- `delete(endpoint, requiresAuth)` - DELETE request
- `setAuth(token, user)` - Armazena autenticação
- `clearAuth()` - Limpa autenticação
- `isAuthenticated()` - Verifica se tem token
- `getStoredUser()` - Obtém usuário do storage
- `getUserId()` - Obtém ID do usuário
- `getRoleId()` - Obtém role_id do usuário

### AuthService
Gerencia autenticação:
- `login(email, senha)` - Faz login
- `register(userData)` - Registra novo usuário (bootstrap)
- `registerWithAuth(userData)` - Registra membro da equipe
- `logout()` - Faz logout
- `isLoggedIn()` - Verifica se há login ativo
- `getCurrentUser()` - Obtém usuário atual

### UserService
Gerencia usuários:
- `getAll()` - Lista todos os usuários
- `getById(userId)` - Obtém um usuário
- `create(userData)` - Cria novo usuário
- `update(userId, userData)` - Atualiza usuário
- `delete(userId)` - Deleta usuário
- `getRoles()` - Lista cargos
- `getDepartments()` - Lista departamentos
- `createRole(roleData)` - Cria novo cargo
- `createDepartment(deptData)` - Cria novo departamento

### FormService
Gerencia formulários:
- `getAll()` - Lista formulários
- `getById(formId)` - Obtém formulário com perguntas
- `getByRole(roleId)` - Obtém formulário do cargo
- `create(formData)` - Cria novo formulário
- `update(formId, formData)` - Atualiza formulário
- `delete(formId)` - Deleta formulário
- `createQuestion(questionData)` - Cria pergunta
- `submitForm(usuarioId, formularioId, respostas)` - Submete formulário
- `getUserSubmissions(usuarioId)` - Lista submissões do usuário
- `getReport(submissaoId)` - Obtém relatório de submissão
- `saveDraft(formId, answers)` - Salva rascunho local
- `loadDraft()` - Carrega rascunho local
- `clearDraft()` - Limpa rascunho

### DashboardService
Gerencia dados agregados:
- `loadDashboardData()` - Carrega dados completos do dashboard
- `getRankingData()` - Carrega dados de ranking
- `getDetailedHistory()` - Carrega histórico com relatórios

### UIUtils
Utilitários de UI:
- `showError(message, elementId)` - Exibe erro
- `showSuccess(message, elementId)` - Exibe sucesso
- `setButtonLoading(buttonId, isLoading)` - Controla spinner
- `formatDate(dateString)` - Formata data
- `isValidEmail(email)` - Valida email
- `isValidCPF(cpf)` - Valida CPF
- `isValidPassword(password)` - Valida senha
- `getScoreClass(score)` - Retorna classe CSS para score
- `calculatePercentage(value, total)` - Calcula porcentagem
- `clearForm(formId)` - Limpa formulário
- `getFormData(formId)` - Obtém dados do form
- `toggleElement(elementId, show)` - Mostra/oculta elemento
- `redirect(url, delay)` - Redireciona com delay

## 📋 IDs e Classes Esperados no HTML

Para que os scripts funcionem corretamente, o HTML deve ter certos IDs:

### Login
- `#loginCard` - Card do login
- `#bootstrapForm` - Formulário de bootstrap
- `#loginForm` - Formulário de login
- `#bootstrapInfo` - Info banner
- `#loginError` - Container de erro

### Dashboard
- `#greetMsg` - Mensagem de saudação
- `#scoreNum` - Número do score
- `#dashboardHeroTitle` - Título do hero
- `#dashboardHeroDesc` - Descrição do hero
- `#dashboardTags` - Container de tags
- `#metricSubmissions` - Métrica de submissões
- `#metricPending` - Métrica de pendentes
- `#metricCompleted` - Métrica de completas
- `#metricTeam` - Métrica de equipe

### Formulário
- `#formularioApp` - Container principal
- `#formTabs` - Abas de formulários
- `#questionMap` - Mapa de perguntas
- `#questionTitle` - Título da pergunta
- `#currentQuestion` - Pergunta atual
- `#currentTotal` - Total de perguntas
- `#answersList` - Container de respostas
- `#previousQuestion` - Botão anterior
- `#nextQuestion` - Botão próximo
- `#clearCurrent` - Botão limpar
- `#submitButton` - Botão enviar
- `#progressBar` - Barra de progresso
- `#progressLabel` - Label de progresso

### Outros
- `#sidebar` - Sidebar de navegação
- `#overlay` - Overlay para mobile
- `[data-page-file]` - No body, para indicar página atual
- `[data-logout]` - Botão de logout

## ⚠️ Notas Importantes

1. **Ordem de Scripts**: Sempre carregue `config.js` e `api.js` antes dos serviços
2. **Autenticação**: Páginas protegidas devem verificar autenticação no início
3. **Rascunhos**: Formulários salvam rascunho localmente automaticamente
4. **Erros 401**: Se receberem erro 401, o usuário é automaticamente redirecionado para login
5. **URLs**: A URL base é definida em `config.js` e pode ser alterada em um único lugar

## 🔄 Fluxo Padrão de Uma Página

```javascript
class MinhaPage {
  constructor() {
    // 1. Verifica autenticação
    this.checkAuth();
    // 2. Inicializa
    this.init();
  }

  checkAuth() {
    if (!AuthService.isLoggedIn()) {
      window.location.href = 'login.html';
      return;
    }
  }

  async init() {
    try {
      // 3. Carrega dados
      const dados = await MeuService.buscarDados();
      // 4. Renderiza
      this.render(dados);
      // 5. Setup listeners
      this.setupEventListeners();
    } catch (error) {
      console.error('Erro:', error);
      UIUtils.showError(error.message);
    }
  }

  render(dados) {
    // Renderiza na página
  }

  setupEventListeners() {
    // Configura listeners
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new MinhaPage();
});
```

## 🐛 Troubleshooting

### "Erro de autenticação"
- Verifique se o token está sendo armazenado corretamente
- Confirme se a resposta do login inclui `token`

### "Endpoints não encontrados"
- Verifique se a URL base está correta em `config.js`
- Confirme se o backend está rodando

### "Formulário não carrega"
- Verifique se o formulário existe e tem perguntas
- Confira se o `role_id` do usuário está correto

### "Sidebar não aparece"
- Confirme que `app.js` está sendo carregado
- Verifique se o HTML tem `<aside id="sidebar"></aside>`

## 📞 Suporte

Para dúvidas ou problemas, consulte:
1. A documentação da API em `API_DOCS.md`
2. Os comentários nos arquivos de serviço
3. O console do navegador para erros detalhados
