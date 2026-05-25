# 🚀 Setup Rápido - JavaScript API

Guia rápido para integrar os scripts JavaScript com a API Flask.

## 📋 Resumo do que foi criado

```
js/
├── config.js                    # URL da API e endpoints
├── api.js                       # Cliente HTTP genérico
├── utils-api.js                 # Funções utilitárias de UI
├── services/
│   ├── authService.js           # Login/Logout
│   ├── userService.js           # Gerenciamento de usuários
│   ├── formService.js           # Formulários e submissões
│   └── dashboardService.js      # Dados agregados
└── pages/
    ├── app.js                   # Inicialização genérica
    ├── login.js                 # Página de login
    ├── dashboard.js             # Dashboard
    ├── formulario.js            # Formulário de avaliação
    ├── historico.js             # Histórico
    ├── ranking.js               # Ranking
    ├── equipe.js                # Gerenciamento de equipe
    └── relatorios.js            # Relatórios
```

## 🔗 Integração em 3 Passos

### Passo 1: Copie os arquivos
Os arquivos JavaScript já foram criados em `FrontEnd/js/`. Nenhuma ação necessária.

### Passo 2: Adicione os scripts aos HTMLs

**Template básico para páginas protegidas:**

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <!-- ... seus meta tags e CSS ... -->
    
    <!-- Scripts obrigatórios (na ordem) -->
    <script src="../js/config.js" defer></script>
    <script src="../js/api.js" defer></script>
    <script src="../js/utils-api.js" defer></script>
    
    <!-- Serviços necessários para esta página -->
    <script src="../js/services/authService.js" defer></script>
    <script src="../js/services/userService.js" defer></script>
    <script src="../js/services/formService.js" defer></script>
    <script src="../js/services/dashboardService.js" defer></script>
    
    <!-- Script de página -->
    <script src="../js/pages/app.js" defer></script>
    <script src="../js/pages/dashboard.js" defer></script>
</head>
<body class="app-body" data-page-type="app" data-page-file="dashboard.html">
    <!-- Seu HTML -->
</body>
</html>
```

### Passo 3: Certifique-se que os IDs existem

Cada página precisa de certos IDs. Veja em `INTEGRACAO_SCRIPTS.md`.

## 🎯 Fluxo Principal

```
Login → Dashboard → Formulário → Submit → Histórico
         ↓
      Equipe (apenas líder)
      Relatórios
      Ranking
```

## 🔐 Autenticação

A autenticação é **automática**:

1. Login bem-sucedido → Token armazenado em `localStorage`
2. Páginas protegidas verificam token automaticamente
3. Logout → Token removido e redireciona para login

## 📝 Arquivo de Configuração (config.js)

Se precisar alterar a URL da API:

```javascript
const APP_CONFIG = {
  API_BASE_URL: 'https://flask-api-production-b69d.up.railway.app/api'
  // ... resto da configuração
};
```

## 📞 Endpoints Principais

Todos definidos em `config.js`:

```javascript
ENDPOINTS: {
  LOGIN: '/auth/login',
  REGISTER: '/usuarios',
  FORMS: '/formularios',
  SUBMISSIONS: '/submissoes',
  REPORTS: '/relatorios'
}
```

## 🧪 Testando

### 1. Abra a página de login
```
file:///caminho/para/FrontEnd/pages/login.html
```

### 2. Verifique o console (F12)
Procure por erros de rede ou JavaScript

### 3. Teste cada fluxo
- ✅ Criar primeira liderança (bootstrap)
- ✅ Fazer login
- ✅ Responder formulário
- ✅ Ver histórico
- ✅ Ver ranking

## ⚡ Funções Mais Usadas

### Autenticação
```javascript
AuthService.login(email, senha)
AuthService.logout()
AuthService.isLoggedIn()
```

### Formulários
```javascript
FormService.getByRole(roleId)           // Carrega formulário
FormService.submitForm(userId, formId, respostas)  // Envia
FormService.getUserSubmissions(userId)  // Histórico
```

### Dashboard
```javascript
DashboardService.loadDashboardData()    // Todos os dados
DashboardService.getRankingData()       // Ranking
DashboardService.getDetailedHistory()   // Histórico com relatórios
```

### UI
```javascript
UIUtils.showError(mensagem)    // Mostra erro
UIUtils.showSuccess(mensagem)  // Mostra sucesso
UIUtils.setButtonLoading(id, true/false)  // Spinner
```

## 📚 Documentações Completas

- **Integração HTML**: `INTEGRACAO_SCRIPTS.md`
- **API da Plataforma**: `API_DOCS.md`
- **Exemplos de Código**: `js/README.md`

## 🐛 Se algo não funciona

1. Abra o console (F12 → Console)
2. Veja se há erros vermelhos
3. Verifique:
   - ✅ Scripts estão sendo carregados?
   - ✅ URL da API está correta?
   - ✅ IDs do HTML existem?
   - ✅ Você está em `localhost` ou HTTPS? (segurança)

## 📦 Estrutura de Resposta da API

A API retorna JSON padronizado:

```json
{
  "id": 1,
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "nome": "João",
    "email": "joao@email.com",
    "role_id": 1,
    "lider": false
  }
}
```

Erros retornam:

```json
{
  "error": "Mensagem de erro",
  "message": "Mensagem de erro"
}
```

## 🎓 Exemplo Prático Completo

**Fazer login e ver dashboard:**

```javascript
// 1. User preenche login.html
// 2. Form submit chama:
const result = await AuthService.login(email, senha);

// 3. Token é armazenado automaticamente
// 4. Redireciona para dashboard.html

// 5. No dashboard.html, DashboardPage faz:
const data = await DashboardService.loadDashboardData();

// 6. Renderiza dados na tela
console.log(data.latestScore);  // Último score
console.log(data.totalSubmissions);  // Total de submissões
```

## ✨ Recursos Automáticos

O código já trata automaticamente:

- ✅ Armazenamento de token em localStorage
- ✅ Verificação de autenticação em cada requisição
- ✅ Redirecionamento para login se token expirou
- ✅ Salvamento de rascunho do formulário localmente
- ✅ Formatação de datas e scores
- ✅ Erros HTTP com feedback visual
- ✅ Sidebar dinâmica baseada em perfil
- ✅ Spinner de loading automático

## 🔄 Próximas Melhorias Recomendadas

1. Adicionar refresh automático de token
2. Implementar cache de dados
3. Adicionar paginação em listas
4. Notificações push
5. Modo offline com sincronização

## 📞 Suporte

Arquivos para consultar:
- `js/README.md` - Documentação técnica
- `INTEGRACAO_SCRIPTS.md` - HTML necessário
- `API_DOCS.md` - API endpoints
- `js/services/*.js` - Código fonte comentado

---

**Você está pronto!** 🎉  
Adicione os scripts às suas páginas e comece a usar.
