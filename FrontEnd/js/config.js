/**
 * Configurações globais da aplicação
 */

const APP_CONFIG = {
  // URL base da API Flask
  API_BASE_URL: 'https://flask-api-production-b69d.up.railway.app/api',
  
  // Chaves de localStorage
  STORAGE_KEYS: {
    TOKEN: 'azuos_token',
    USER: 'azuos_user',
    USER_ID: 'azuos_user_id',
    ROLE_ID: 'azuos_role_id',
    FORM_DRAFT: 'azuos_form_draft'
  },

  // Endpoints disponíveis
  ENDPOINTS: {
    // Autenticação
    LOGIN: '/auth/login',
    REGISTER: '/usuarios',
    
    // Usuários
    USERS: '/usuarios',
    USER_BY_ID: (id) => `/usuarios/${id}`,
    
    // Cargos
    ROLES: '/cargos',
    
    // Departamentos
    DEPARTMENTS: '/departamentos',
    
    // Formulários
    FORMS: '/formularios',
    FORM_BY_ID: (id) => `/formularios/${id}`,
    FORM_BY_ROLE: (roleId) => `/formularios/por-cargo/${roleId}`,
    
    // Perguntas
    QUESTIONS: '/perguntas',
    
    // Submissões
    SUBMISSIONS: '/submissoes',
    USER_SUBMISSIONS: (userId) => `/submissoes/usuario/${userId}`,
    
    // Relatórios
    REPORTS: '/relatorios',
    REPORT_BY_SUBMISSION: (submissaoId) => `/relatorios/submissao/${submissaoId}`
  }
};
