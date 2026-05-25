/**
 * Serviço genérico de requisições HTTP para a API Flask
 * Centraliza toda a lógica de comunicação com o backend
 */

class APIService {
  /**
   * Faz uma requisição genérica para a API
   * @param {string} endpoint - O endpoint da API (ex: '/usuarios')
   * @param {string} method - Método HTTP (GET, POST, PUT, DELETE)
   * @param {object} data - Dados a serem enviados (para POST/PUT)
   * @param {boolean} requiresAuth - Se requer token de autenticação
   * @returns {Promise} Resposta da API
   */
  static async request(endpoint, method = 'GET', data = null, requiresAuth = true) {
    const url = `${APP_CONFIG.API_BASE_URL}${endpoint}`;
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    // Adiciona token de autenticação se requerido
    if (requiresAuth) {
      const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
      if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
      }
    }

    // Adiciona dados ao corpo da requisição para POST/PUT
    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      return this.handleResponse(response);
    } catch (error) {
      console.error(`Erro na requisição ${method} ${endpoint}:`, error);
      throw new Error(`Erro na comunicação com o servidor: ${error.message}`);
    }
  }

  /**
   * Processa a resposta da API
   * @param {Response} response - Resposta do fetch
   * @returns {Promise} Dados da resposta ou erro
   */
  static async handleResponse(response) {
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage = data.message || data.error || `Erro ${response.status}`;
      
      // Se for 401, limpa autenticação
      if (response.status === 401) {
        this.clearAuth();
        window.location.href = 'login.html';
      }

      throw new Error(errorMessage);
    }

    return data;
  }

  /**
   * GET - Buscar dados
   */
  static get(endpoint, requiresAuth = true) {
    return this.request(endpoint, 'GET', null, requiresAuth);
  }

  /**
   * POST - Criar dados
   */
  static post(endpoint, data, requiresAuth = true) {
    return this.request(endpoint, 'POST', data, requiresAuth);
  }

  /**
   * PUT - Atualizar dados
   */
  static put(endpoint, data, requiresAuth = true) {
    return this.request(endpoint, 'PUT', data, requiresAuth);
  }

  /**
   * DELETE - Deletar dados
   */
  static delete(endpoint, requiresAuth = true) {
    return this.request(endpoint, 'DELETE', null, requiresAuth);
  }

  /**
   * Armazena autenticação
   */
  static setAuth(token, user) {
    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.USER, JSON.stringify(user));
    if (user.id) {
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.USER_ID, user.id);
    }
    if (user.role_id) {
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.ROLE_ID, user.role_id);
    }
  }

  /**
   * Limpa autenticação
   */
  static clearAuth() {
    localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
    localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER);
    localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER_ID);
    localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.ROLE_ID);
  }

  /**
   * Verifica se há autenticação ativa
   */
  static isAuthenticated() {
    return !!localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
  }

  /**
   * Obtém dados do usuário armazenado
   */
  static getStoredUser() {
    const user = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  }

  /**
   * Obtém ID do usuário
   */
  static getUserId() {
    return localStorage.getItem(APP_CONFIG.STORAGE_KEYS.USER_ID);
  }

  /**
   * Obtém role_id do usuário
   */
  static getRoleId() {
    return localStorage.getItem(APP_CONFIG.STORAGE_KEYS.ROLE_ID);
  }
}
